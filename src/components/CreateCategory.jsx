import { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateCategory.css';
import { FaPlus } from 'react-icons/fa';

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
        fields: fields.map(field => field.name), // Only custom fields
        notes: "",
      });
      navigate('/categories'); // Redirect to categories list
    } catch (error) {
      console.error('Error creating category: ', error);
    }
  };

  return (
    <div>
      <h2>Create a Category</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
        />
        <h2>Attributes</h2>
        {fields.map((field, index) => (
          <div key={index} className="field-container">
            <input
              type="text"
              placeholder={`Field #${index + 1}`}
              value={field.name}
              onChange={(e) => handleFieldChange(index, e.target.value)}
              required
            />
            <label className="primary-field-radio">
              <input
                type="radio"
                name="primaryField"
                checked={primaryFieldIndex === index}
                onChange={() => setPrimaryFieldIndex(index)}
              />
              <span className="tooltip">Primary Field</span>
            </label>
          </div>
        ))}
        <button type="button" onClick={addField} className="add-field-button">
          <FaPlus size="1.5em" />
        </button><br /><br />
        <button type="submit">Create Category</button>
      </form>
    </div>
  );
};

export default CreateCategory;