import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getRankCategoryName } from '../enums/RankCategory';
import "../styles/ItemView.css";

const ItemView = () => {
  const { categoryId, itemId } = useParams();
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    // Scrolls the page to the top when the component is mounted
    window.scrollTo(0, 0);
  }, []);

  // Fetch item data and fields on load
  useEffect(() => {
    const fetchItem = async () => {
      const itemDoc = await getDoc(doc(db, `categories/${categoryId}/items`, itemId));
      const categoryDoc = await getDoc(doc(db, `categories`, categoryId));
      
      if (itemDoc.exists()) {
        setItemData(itemDoc.data());
      }
      
      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        setFields(categoryData.fields);
      }
    };
    fetchItem();
  }, [categoryId, itemId]);
  
  // Handle change for form inputs
  const handleChange = (field, value) => {
    setItemData((prev) => ({ ...prev, [field]: value }));
  };

  // Save updates to Firestore
  const handleSave = async () => {
    const itemRef = doc(db, `categories/${categoryId}/items`, itemId);
    await updateDoc(itemRef, itemData);
    setIsEditing(false);
  };

  // Delete item from Firestore
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, `categories/${categoryId}/items`, itemId));
      navigate(`/categories/${categoryId}`);
    }
  };

  // Navigate to re-ranking functionality in CategoryDetail
  const handleReRank = () => {
    // navigate(`/categories/${categoryId}/re-rank/${itemId}`);
  };

  return (
    <div className="item-view-container">
      <h2>{itemData[fields[0]] || "Unnamed Item"}</h2> {/* Use the first field value as title */}
      
      {Object.keys(itemData).map((field, index) => {
        // Hide the ID field
        if (field === 'id') return null;

        return (
          <div key={index} className="item-field">
            <label>{field}:</label>
            {field === 'rating' ? (
              <span>{parseFloat(itemData[field]).toFixed(1)}</span> // Display rounded rating
            ) : field === 'rankCategory' ? (
              <span>{getRankCategoryName(itemData[field])}</span> // Display rank category name
            ) : isEditing ? (
              <input
                type="text"
                value={itemData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                readOnly={field === 'rating' || field === 'rankCategory'} // Make rating and rankCategory non-editable
              />
            ) : (
              <span>{itemData[field]}</span>
            )}
          </div>
        );
      })}
      
      <div className="item-actions">
        {isEditing ? (
          <button onClick={handleSave}>Save</button>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit</button>
        )}
        <button onClick={handleDelete}>Delete</button>
        <button onClick={handleReRank}>Re-rank</button> {/* Re-rank button */}
        <button onClick={() => navigate(`/categories/${categoryId}`)}>Back</button>
      </div>
    </div>
  );
};

export default ItemView;