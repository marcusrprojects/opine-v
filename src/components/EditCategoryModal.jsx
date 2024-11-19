import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import "../styles/EditCategoryModal.css";

const EditCategoryModal = ({ fields, primaryField, tags: initialTags, onSave, onClose }) => {
  const [newField, setNewField] = useState("");
  const [primaryFieldIndex, setPrimaryFieldIndex] = useState(fields.indexOf(primaryField));
  const [tags, setTags] = useState(initialTags || []); // Store selected tag IDs
  const [tagInput, setTagInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState([]); // Store available tags from Firestore

  // Fetch available tags from Firestore on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsCollectionRef = collection(db, 'tags');
        const tagsSnapshot = await getDocs(tagsCollectionRef);
        const tagsList = tagsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setAvailableTags(tagsList);
      } catch (error) {
        console.error("Error fetching tags from Firestore:", error);
      }
    };

    fetchTags();
  }, []);

  const handleAddField = () => {
    if (newField && !fields.includes(newField) && newField !== "notes") {
      const updatedFields = [...fields, newField];
      onSave(updatedFields, updatedFields[primaryFieldIndex] || updatedFields[0], tags);
      setNewField("");
    }
  };

  const handleRemoveField = (field) => {
    if (field === fields[primaryFieldIndex]) {
      alert("You must select a new primary field before deleting this one.");
      return;
    }
    const updatedFields = fields.filter(f => f !== field);
    onSave(updatedFields, updatedFields[primaryFieldIndex] || updatedFields[0], tags);
  };

  const handlePrimaryFieldChange = (index) => {
    setPrimaryFieldIndex(index);
    onSave(fields, fields[index], tags);
  };

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
    setShowDropdown(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleCustomTag(); // Add tag when Enter is pressed
    }
  };

  const addTag = (tagId) => {
    if (!tags.includes(tagId) && tags.length < 5) {
      const updatedTags = [...tags, tagId];
      setTags(updatedTags);
      setTagInput('');
      setShowDropdown(false);
      onSave(fields, fields[primaryFieldIndex], updatedTags);
    }
  };

  // const handleCustomTag = async () => {
  //   if (tagInput.trim() && tags.length < 5) {
  //     const existingTag = availableTags.find(tag => tag.name.toLowerCase() === tagInput.toLowerCase());

  //     if (existingTag) {
  //       // Add the existing tag's ID
  //       addTag(existingTag.id);
  //     } else {
  //       alert('The tag does not exist. Please add it in the system first.');
  //     }
  //   }
  // };

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
          setAvailableTags([...availableTags, newTag]);
          addTag(newTag.id);
        } catch (error) {
          console.error("Error adding new tag:", error);
        }
      }
    }
  };

  const handleTagSuggestionClick = (tagId) => {
    addTag(tagId);
  };

  const handleRemoveTag = (tagIdToRemove) => {
    const updatedTags = tags.filter(tagId => tagId !== tagIdToRemove);
    setTags(updatedTags);
    onSave(fields, fields[primaryFieldIndex], updatedTags);
  };

  return (
    <div className="modal">
      <ul>
        {fields.map((field, index) => (
          <li key={field} className="field-item">
            <label className="primary-field-radio">
              <input
                type="radio"
                name="primaryField"
                checked={primaryFieldIndex === index}
                onChange={() => handlePrimaryFieldChange(index)}
              />
              {primaryFieldIndex === index && (
                <span className="tooltip">Primary Field</span>
              )}
            </label>
            {field}
            <FaTrash
              className="icon delete-icon"
              onClick={() => handleRemoveField(field)}
            />
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Add new field..."
        value={newField}
        onChange={(e) => setNewField(e.target.value)}
      />
      <button onClick={handleAddField} className='add-category'>
        <FaPlus />
      </button>

      {/* Tag Section */}
      <h2>Tags</h2>
      <div className="tag-dropdown-container">
        <input
          type="text"
          value={tagInput}
          onChange={handleTagInput}
          placeholder="Add a tag (up to 5)"
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          onKeyDown={handleKeyPress} // Add key press handling
        />

        <div className={`dropdown ${showDropdown ? 'expanded' : ''}`}>
          {availableTags
            .filter(tag => tag.name.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag.id))
            .slice(0, 5)
            .map(tag => (
              <div
                key={tag.id}
                onClick={() => handleTagSuggestionClick(tag.id)}
                className="dropdown-item"
              >
                {tag.name}
              </div>
            ))}
        </div>
      </div>

      <div className="selected-tags">
        {tags.map(tagId => {
          const tag = availableTags.find(t => t.id === tagId);
          return (
            <span key={tagId} className="selected-tag">
              {tag?.name || "Unknown Tag"} <FaMinus onClick={() => handleRemoveTag(tagId)} />
            </span>
          );
        })}
      </div>

      <button onClick={onClose}>Close</button>
    </div>
  );
};

EditCategoryModal.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  primaryField: PropTypes.string.isRequired,
  categoryName: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string), // Array of tag IDs
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditCategoryModal;