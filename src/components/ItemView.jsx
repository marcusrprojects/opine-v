import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FaTrash } from 'react-icons/fa';
import "../styles/ItemView.css";
import { refreshRankedItems } from '../utils/ranking';

const ItemView = () => {
  const { categoryId, itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cardColor = location.state?.cardColor || "#FFFFFF";
  const [itemData, setItemData] = useState({});
  const [editingField, setEditingField] = useState(null);
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
        setOrderedFields(categoryData.fields); // Exclude 'notes' from fields array
      }
    };
    fetchItem();
  }, [categoryId, itemId]);

  const handleChange = (field, value) => {
    setItemData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async (field) => {
    const itemRef = doc(db, `categories/${categoryId}/items`, itemId);
    await updateDoc(itemRef, { [field]: itemData[field] });
    setEditingField(null);
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
      <div>
      <FaTrash className="trash-icon" onClick={handleDelete} />

      <h2 className="item-title">{itemData[primaryField] || "Unnamed Item"}</h2>
      
      <div className="rating-container">
        <div id="rating-display" className="item-rating" style={{ backgroundColor: cardColor }} onClick={handleReRank}>
          {parseFloat(itemData.rating || 0).toFixed(1)}
        </div>
      </div>

      {/* Render ordered fields excluding "Notes" */}
      {orderedFields.map((field, index) => (
        <div
          key={index}
          className="item-field"
          onClick={() => setEditingField(field)}
        >
          <div className="field-content">
            <label className="item-label">{field}:</label>
            {editingField === field ? (
              <input
                type="text"
                value={itemData[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                onBlur={() => handleSaveField(field)}
                autoFocus
                className="item-input"
              />
            ) : (
              <span className="item-value">{itemData[field] || "Click to edit"}</span>
            )}
          </div>
        </div>
      ))}

      {/* Render "Notes" field separately */}
      <div
        className="item-field"
        onClick={() => setEditingField("notes")}
      >
        <div className="field-content">
          <label className="item-label">Notes:</label>
          {editingField === "notes" ? (
            <textarea
              value={itemData.notes || ''}
              onChange={(e) => handleChange("notes", e.target.value)}
              onBlur={() => handleSaveField("notes")}
              autoFocus
              className="notes-textarea"
            />
          ) : (
            <textarea
              className="notes-textarea"
              value={itemData.notes || "Click to edit"}
              readOnly
            />
          )}
        </div>
      </div>

      <button id="back-button" onClick={() => navigate(`/categories/${categoryId}`)}>Back</button>
    </div>
    </div>
  );
};

export default ItemView;