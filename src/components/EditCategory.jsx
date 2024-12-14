import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import "../styles/EditCategory.css";
import { handleError } from '../utils/errorUtils';

const EditCategory = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [categoryName, setCategoryName] = useState(location.state?.categoryName || '');
  const [description, setDescription] = useState(location.state?.description || '');
  const [fields, setFields] = useState(location.state?.fields || []);
  const [primaryField, setPrimaryField] = useState(location.state?.primaryField || '');
  const [tags, setTags] = useState(location.state?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [newField, setNewField] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    if (!location.state) {
      const fetchCategoryData = async () => {
        try {
          const categoryDocRef = doc(db, 'categories', categoryId);
          const categorySnapshot = await getDoc(categoryDocRef);

          if (categorySnapshot.exists()) {
            const data = categorySnapshot.data();
            setCategoryName(data.name || '');
            setDescription(data.description || '');
            setFields(data.fields || []);
            setPrimaryField(data.primaryField || '');
            setTags(data.tags || []);
          }

          const tagsCollectionRef = collection(db, 'tags');
          const tagsSnapshot = await getDocs(tagsCollectionRef);
          const tagsList = tagsSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setAvailableTags(tagsList);
        } catch (error) {
          handleError(error, 'Error fetching category data:');
        } finally {
          setLoading(false);
        }
      };

      fetchCategoryData();
    } else {
      const fetchTags = async () => {
        try {
          const tagsCollectionRef = collection(db, 'tags');
          const tagsSnapshot = await getDocs(tagsCollectionRef);
          const tagsList = tagsSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setAvailableTags(tagsList);
        } catch (error) {
          handleError(error, 'Error fetching tags from Firestore:');
        }
      };

      fetchTags();
    }
  }, [categoryId, location.state]);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      alert("Category name is required.");
      return;
    }

    if (fields.length === 0) {
      alert("At least one field is required.");
      return;
    }

    if (!primaryField || !fields.includes(primaryField)) {
      alert("A valid primary field must be selected.");
      return;
    }

    try {
      const categoryDocRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryDocRef, {
        name: categoryName,
        description,
        fields,
        primaryField,
        tags,
      });
      navigate(`/categories/${categoryId}`);
    } catch (error) {
      handleError(error, "Error saving category.");
    }
  };

  const handleAddField = () => {
    if (newField && !fields.includes(newField)) {
      setFields([...fields, newField]);
      setNewField('');
    }
  };

  const handleRemoveField = (field) => {
    if (primaryField === field) {
      alert('Select a new primary field before removing this one.');
      return;
    }
    setFields(fields.filter((f) => f !== field));
  };

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
    setShowDropdown(true);
  };

  const addTag = (tagId) => {
    if (tags.length >= 5) {
      alert("You can only add up to 5 tags.");
      return;
    }
    if (!tags.includes(tagId)) {
      setTags([...tags, tagId]);
      setTagInput('');
      setShowDropdown(false);
    }
  };

  const handleCustomTag = async () => {
    if (tagInput.trim() && tags.length < 5) {
      const existingTag = availableTags.find(tag => tag.name.toLowerCase() === tagInput.toLowerCase());
  
      if (existingTag) {
        // Add the existing tag's ID
        addTag(existingTag.id);
      } else {
        try {
          // Add new tag to Firestore and retrieve its ID
          const newTagRef = await addDoc(collection(db, 'tags'), { name: tagInput });
          const newTag = { id: newTagRef.id, name: tagInput };
          setAvailableTags([...availableTags, newTag]); // Update available tags
          addTag(newTag.id); // Add the newly created tag
        } catch (error) {
          handleError(error, "Error adding new tag.");
        }
      }
      setTagInput(''); // Clear the input field
      setShowDropdown(false); // Close the dropdown
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleCustomTag(); // Add the tag or create a new one
    }
  };

  const handleRemoveTag = (tagId) => {
    setTags(tags.filter((tag) => tag !== tagId));
  };

  // TODO: determine whether to keep this.
  const handleTagBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="edit-category-container">
      <h2 className="edit-category-title">{categoryName || "Edit Category"}</h2>

      <div className="edit-section">
        <label className="edit-label">Title</label>
        <input
          type="text"
          className="edit-title"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <label className="edit-label">Description</label>
        <textarea
          className="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="field-section">
        <label className="edit-label">Fields</label>
        <ul className="edit-list">
          {fields.map((field) => (
            <li key={field} className="edit-list-item">
              <input
                type="radio"
                name="primaryField"
                checked={primaryField === field}
                onChange={() => setPrimaryField(field)}
                className="field-radio"
                id={`field-radio-${field}`}
              />
              <label htmlFor={`field-radio-${field}`} className="property-pair">
                {field}
              </label>
              <FaTrash onClick={() => handleRemoveField(field)} className="icon delete-icon" />
            </li>
          ))}
        </ul>
        <div className="edit-add-field">
          <input
            type="text"
            placeholder="Add new field"
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            className="edit-input"
          />
          <button onClick={handleAddField} className="edit-add-button">
            <FaPlus />
          </button>
        </div>
      </div>

      <div className="edit-section">
        <label className="edit-label">Tags:</label>
        <div className="tag-dropdown-container">
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInput}
            placeholder="Add tag (1-5)"
            className="edit-input"
            onBlur={handleTagBlur}
            onKeyDown={handleKeyPress}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && (
            <div className={`dropdown ${showDropdown ? 'expanded' : ''}`}>
              {availableTags
                .filter(
                  (tag) =>
                    tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
                    !tags.includes(tag.id)
                )
                .map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => addTag(tag.id)}
                    className="dropdown-item"
                  >
                    {tag.name}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className="selected-tags">
          {tags.map((tagId) => {
            const tag = availableTags.find((t) => t.id === tagId);
            return (
              <span key={tagId} className="selected-tag">
                {tag?.name} <FaMinus onClick={() => handleRemoveTag(tagId)} />
              </span>
            );
          })}
        </div>
      </div>

      <button onClick={handleSave} className="save-button">
        Save
      </button>
      <button onClick={() => navigate(`/categories/${categoryId}`)} className="cancel-button">
        Cancel
      </button>
    </div>
  );
};

EditCategory.propTypes = {
  categoryName: PropTypes.string,
  description: PropTypes.string,
  fields: PropTypes.arrayOf(PropTypes.string),
  primaryField: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  creatorUsername: PropTypes.string,
};

export default EditCategory;