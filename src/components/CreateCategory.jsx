import { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateCategory.css';
import { FaPlus, FaMinus } from 'react-icons/fa';

const predefinedTags = [
  'Technology', 'Finance', 'Health', 'Education', 'Art', 'Science', 'Business'
];

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [fields, setFields] = useState([{ name: 'Name' }]);
  const [primaryFieldIndex, setPrimaryFieldIndex] = useState(0);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const addField = () => {
    setFields([...fields, { name: '' }]);
  };

  const handleFieldChange = (index, value) => {
    const updatedFields = [...fields];
    updatedFields[index].name = value;
    setFields(updatedFields);
  };

  const handleRemoveField = (index) => {
    if (index === primaryFieldIndex) {
      alert("Please select a new primary field before deleting this one.");
      return;
    }
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    if (primaryFieldIndex > index) {
      setPrimaryFieldIndex(primaryFieldIndex - 1);
    }
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

  const addTag = (tag) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
      setShowDropdown(false);
    }
  };

  const handleCustomTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      addTag(tagInput);
    }
  };

  const handleTagSuggestionClick = (tag) => {
    addTag(tag);
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName || fields.length === 0 || tags.length === 0) {
      alert('Category name, fields, and at least one tag are required.');
      return;
    }
    try {
      await addDoc(collection(db, 'categories'), {
        name: categoryName,
        primaryField: fields[primaryFieldIndex].name,
        fields: fields.map(field => field.name),
        tags: tags,
        notes: "",
      });
      navigate('/categories');
    } catch (error) {
      console.error('Error creating category: ', error);
    }
  };

  return (
    <div>
      <h2 className='item-title'>Create a Category</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          className='category-name'
          onChange={(e) => setCategoryName(e.target.value)}
          required
        />
        <h2 id='attributes'>Attributes</h2>
        {fields.map((field, index) => (
          <div key={index} className="field-container">
            <label className="primary-field-radio">
              <input
                type="radio"
                name="primaryField"
                checked={primaryFieldIndex === index}
                onChange={() => setPrimaryFieldIndex(index)}
              />
              {primaryFieldIndex === index && (
                <span className="tooltip">Primary Field</span>
              )}
            </label>
            <input
              type="text"
              placeholder={`Field #${index + 1}`}
              value={field.name}
              onChange={(e) => handleFieldChange(index, e.target.value)}
              required
            />
            <div className="field-actions">
              <FaMinus
                className={`icon delete-icon ${index === primaryFieldIndex ? 'primary-delete' : 'default-delete'}`}
                onClick={() => handleRemoveField(index)} 
                title="Remove field"
              />
              {index === fields.length - 1 && (
                <FaPlus
                  className="icon add-field-icon"
                  onClick={addField}
                  title="Add field"
                />
              )}
            </div>
          </div>
        ))}

        {/* Tag Section */}
        <div className="tag-dropdown-container">
          <h2>Tags</h2>
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInput}
            placeholder="Add a tag (up to 5)"
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onKeyDown={handleKeyPress} // Add this line
          />

          {/* Unified Dropdown */}
          <div className={`dropdown ${showDropdown ? 'expanded' : ''}`}>
            {predefinedTags
              .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag))
              .slice(0, 5)
              .map(tag => (
                <div
                  key={tag}
                  onClick={() => handleTagSuggestionClick(tag)}
                  className="dropdown-item"
                >
                  {tag}
                </div>
              ))}
          </div>
        </div>

        <div className="selected-tags">
          {tags.map(tag => (
            <span key={tag} className="selected-tag">
              {tag} <FaMinus onClick={() => handleRemoveTag(tag)} />
            </span>
          ))}
        </div>

        <div className="button-group">
          <button type="button" onClick={() => navigate('/categories')}>
              Back
          </button>
          <button type="submit">OK</button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;