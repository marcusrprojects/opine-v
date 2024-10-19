import { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [fields, setFields] = useState([{ name: '' }]); // Fields array
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
        fields: fields.map(field => field.name),
      });
      navigate('/categories'); // Redirect to categories list
    } catch (error) {
      console.error('Error creating category: ', error);
    }
  };

  return (
    <div>
      <h2>Create a New Category</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
        />
        <h3>Define Fields for This Category:</h3>
        {fields.map((field, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Field #${index + 1}`}
            value={field.name}
            onChange={(e) => handleFieldChange(index, e.target.value)}
            required
          />
        ))}
        <button type="button" onClick={addField}>Add Another Field</button>
        <button type="submit">Create Category</button>
      </form>
    </div>
  );
};

export default CreateCategory;