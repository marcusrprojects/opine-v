import { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

/**
 * CreateCategory component allows users to create a new category.
 * Users can specify the category name and define custom fields for that category.
 * Upon submission, the category is added to Firestore, and the user is redirected to the categories list.
 */
const CreateCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [fields, setFields] = useState([{ name: '' }]); // Fields array
  const navigate = useNavigate();

  /**
   * Adds a new field to the category by appending an empty field to the fields array.
   */
  const addField = () => {
    setFields([...fields, { name: '' }]);
  };

  /**
   * Handles changes in the input fields. Updates the value of a specific field in the fields array.
   * 
   * @param {number} index - The index of the field being updated
   * @param {string} value - The new value for the field
   */
  const handleFieldChange = (index, value) => {
    const updatedFields = [...fields];
    updatedFields[index].name = value;
    setFields(updatedFields);
  };

  /**
   * Handles the form submission to create a new category.
   * The category name and defined fields are submitted to Firestore.
   * If any required fields are missing, the user is alerted.
   * After a successful submission, the user is redirected to the categories list.
   * 
   * @param {object} e - The event object for form submission
   */
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
      {/* Form to input category name and define fields */}
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
        <button type="button" onClick={addField}>Add Another Field</button><br></br><br></br>
        <button type="submit">Create Category</button>
      </form>
    </div>
  );
};

export default CreateCategory;