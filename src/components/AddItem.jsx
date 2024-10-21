import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';


/**
 * AddItem component allows users to add a new item to a specific category.
 * It fetches the fields required for the item and submits the form data.
 */
const AddItem = () => {
  const { categoryId } = useParams(); // Get category from URL
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate(); // Used for redirecting back

  /**
   * useEffect hook to fetch category details (fields) when the component is mounted
   * or when the categoryId changes.
   */
  useEffect(() => {
    const fetchCategory = async () => {
      const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
      const categoryData = categoryDoc.data();
      setFields(categoryData.fields);
    };
    fetchCategory();
  }, [categoryId]);

  /**
   * Handle changes in form input fields.
   * @param {string} field - The field name
   * @param {string} value - The field value entered by the user
   */
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  /**
   * Handle form submission to add a new item to the category.
   * @param {object} e - Event object to prevent default form submission behavior
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fields.some(field => !formData[field])) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      await addDoc(collection(db, `categories/${categoryId}/items`), formData);
      navigate(`/categories/${categoryId}`); // Redirect back to the category detail page
    } catch (error) {
      console.error('Error adding item: ', error);
    }
  };

  return (
    <div>
      <h2>Add a New Item</h2>
      {/* Form to input data for the new item */}
      <form onSubmit={handleSubmit}>
        {fields.map((field, index) => (
          <input
            key={index}
            type="text"
            placeholder={field}
            value={formData[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            required
          />
        ))}
        <button type="submit">Add Item</button>
      </form>

      {/* Button to go back to the category detail page without adding an item */}
      <button onClick={() => navigate(`/categories/${categoryId}`)}>Back</button> {/* Back button */}
    </div>
  );
};

export default AddItem;