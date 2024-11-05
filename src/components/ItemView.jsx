import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getRankCategoryName } from '../enums/RankCategory';
import "../styles/ItemView.css";
import { refreshRankedItems } from '../utils/ranking';

const ItemView = () => {
  const { categoryId, itemId } = useParams();
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [primaryField, setPrimaryField] = useState(null);
  const [orderedFields, setOrderedFields] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      const itemDoc = await getDoc(doc(db, `categories/${categoryId}/items`, itemId));
      const categoryDoc = await getDoc(doc(db, `categories`, categoryId));
      
      if (itemDoc.exists()) {
        setItemData(itemDoc.data());
      }
      
      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        setPrimaryField(categoryData.primaryField);
        setOrderedFields(['rankCategory', 'rating', ...categoryData.fields]);
      }
    };
    fetchItem();
  }, [categoryId, itemId]);
  
  const handleChange = (field, value) => {
    setItemData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const itemRef = doc(db, `categories/${categoryId}/items`, itemId);
    await updateDoc(itemRef, itemData);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, `categories/${categoryId}/items`, itemId));
      await refreshRankedItems(categoryId, itemData.rankCategory);
      navigate(`/categories/${categoryId}`);
    }
  };

  const handleReRank = () => {
    navigate(`/categories/${categoryId}/items/${itemId}/rerank`, { state: { existingItem: itemData } });
  };

  return (
    <div className="item-view-container">
      <h2>{itemData[primaryField] || "Unnamed Item"}</h2>
      
      {orderedFields.map((field, index) => {
        if (field === 'id') return null;

        return (
          <div key={index} className="item-field">
            <label>{field}:</label>
            {field === 'rating' ? (
              <span>{parseFloat(itemData[field] || 0).toFixed(1)}</span>
            ) : field === 'rankCategory' ? (
              <span>{getRankCategoryName(itemData[field])}</span>
            ) : isEditing ? (
              field === 'notes' ? (
                <textarea
                  className="notes-textarea"
                  value={itemData[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  value={itemData[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  readOnly={field === 'rating' || field === 'rankCategory'}
                />
              )
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
        <button onClick={handleReRank}>Re-rank</button>
        <button onClick={() => navigate(`/categories/${categoryId}`)}>Back</button>
      </div>
    </div>
  );
};

export default ItemView;