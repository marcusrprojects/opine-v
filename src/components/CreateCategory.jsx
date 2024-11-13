import { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateCategory.css';
import { FaPlus, FaMinus } from 'react-icons/fa';

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [fields, setFields] = useState([{ name: 'Name' }]); // Default initial field
  const [primaryFieldIndex, setPrimaryFieldIndex] = useState(0); // Index of the primary field
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
    if (!categoryName || fields.length === 0) {
      alert('Category name and fields are required');
      return;
    }

    try {
      await addDoc(collection(db, 'categories'), {
        name: categoryName,
        primaryField: fields[primaryFieldIndex].name,
        fields: fields.map(field => field.name),
        notes: "",
      });
      navigate('/categories'); // Redirect to categories list
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
            <FaMinus
              className={`icon delete-icon ${index === primaryFieldIndex ? 'primary-delete' : 'default-delete'}`}
              onClick={() => handleRemoveField(index)} 
              title="Remove field"
            />
          </div>
        ))}
        <button type="button" onClick={addField} className="add-field-button">
          <FaPlus size="1.5em" />
        </button>
        <br /><br />
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