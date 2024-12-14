import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import "../styles/EditCategory.css";

const EditCategory = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [categoryName, setCategoryName] = useState(location.state?.categoryName || '');
  const [description, setDescription] = useState(location.state?.description || '');
  const [fields, setFields] = useState(location.state?.fields || []);
  const [primaryFieldIndex, setPrimaryFieldIndex] = useState(
    location.state?.fields?.indexOf(location.state?.primaryField) || 0
  );
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
            setPrimaryFieldIndex(data.fields.indexOf(data.primaryField));
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
          console.error('Error fetching category data:', error);
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
          console.error('Error fetching tags from Firestore:', error);
        }
      };

      fetchTags();
    }
  }, [categoryId, location.state]);

  const handleSave = async () => {
    try {
      const categoryDocRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryDocRef, {
        name: categoryName,
        description,
        fields,
        primaryField: fields[primaryFieldIndex],
        tags,
      });
      navigate(`/categories/${categoryId}`);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleAddField = () => {
    if (newField && !fields.includes(newField)) {
      setFields([...fields, newField]);
      setNewField('');
    }
  };

  const handleRemoveField = (field) => {
    if (fields[primaryFieldIndex] === field) {
      alert('Select a new primary field before removing this one.');
      return;
    }
    setFields(fields.filter((f) => f !== field));
  };

  const handlePrimaryFieldChange = (index) => {
    setPrimaryFieldIndex(index);
  };

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
    setShowDropdown(true);
  };

  const addTag = (tagId) => {
    if (!tags.includes(tagId) && tags.length < 5) {
      setTags([...tags, tagId]);
      setTagInput('');
      setShowDropdown(false);
    }
  };

  const handleRemoveTag = (tagId) => {
    setTags(tags.filter((tag) => tag !== tagId));
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

      <div className='field-section'>
        <label className="edit-label">Fields</label>
        <ul className="edit-list">
        {fields.map((field, index) => (
          <li key={field} className="edit-list-item">
            <input
              type="radio"
              name="primaryField"
              checked={primaryFieldIndex === index}
              onChange={() => handlePrimaryFieldChange(index)}
              className="field-radio"
              id={`field-radio-${index}`}
            />
            <label htmlFor={`field-radio-${index}`} className="property-pair">
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
            placeholder="Add tag"
            className="edit-input"
          />
          {showDropdown && (
            <div className="dropdown">
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
  // categoryId: PropTypes.string.isRequired,
};

export default EditCategory;