import { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import '../styles/CreateCategory.css';
import { FaPlus, FaMinus } from 'react-icons/fa';
import TagSelector from './TagSelector';

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [fields, setFields] = useState([{ name: 'Name' }]);
  const [primaryFieldIndex, setPrimaryFieldIndex] = useState(0);
  const [tags, setTags] = useState([]); // Store selected tag IDs
  const { user } = useAuth(); // Access the user state
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a category.");
      return;
    }
    if (!categoryName || fields.length === 0 || tags.length === 0) {
      alert('Category name, fields, and at least one tag are required.');
      return;
    }

    try {
      // Add the category to the "categories" collection
      const newCategory = {
        name: categoryName,
        primaryField: fields[primaryFieldIndex].name,
        fields: fields.map(field => field.name),
        tags, // Save tag IDs
        createdBy: user.uid, // Use the user UID from useAuth
        createdAt: new Date().toISOString(), // Timestamp
      };

      await addDoc(collection(db, 'categories'), newCategory);
      navigate('/categories');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <div>
      <h2 className='item-title'>Create a Category</h2>
      <form onSubmit={handleSubmit} className='category-form'>
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          className='field-input'
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
                className="primary-field"
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
              className='field-input'
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

        <h2>Tags</h2>
        <TagSelector
          tags={tags}
          setTags={setTags}
          db={db}
          maxTags={5}
        />

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