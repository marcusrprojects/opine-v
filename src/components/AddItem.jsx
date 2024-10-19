import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

const AddItem = () => {
  const { categoryId } = useParams(); // Get category from URL
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategory = async () => {
      const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
      const categoryData = categoryDoc.data();
      setFields(categoryData.fields);
    };
    fetchCategory();
  }, [categoryId]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fields.some(field => !formData[field])) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      await addDoc(collection(db, `categories/${categoryId}/items`), formData);
      navigate(`/categories/${categoryId}`);
    } catch (error) {
      console.error('Error adding item: ', error);
    }
  };

  return (
    <div>
      <h2>Add a New Item</h2>
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
    </div>
  );
};

export default AddItem;