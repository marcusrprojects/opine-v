import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FaTrash } from 'react-icons/fa'; // Import trash icon
import "../styles/ItemView.css";
import { refreshRankedItems } from '../utils/ranking';

const ItemView = () => {
  const { categoryId, itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cardColor = location.state?.cardColor || "#FFFFFF";
  const [itemData, setItemData] = useState({});
  const [editingField, setEditingField] = useState(null); // Track individual field editing
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
        setOrderedFields(categoryData.fields);
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
      {/* Top right trash icon for delete */}
      <FaTrash className="trash-icon" onClick={handleDelete} />

      <h2 className="item-title">{itemData[primaryField] || "Unnamed Item"}</h2>
      
      {/* Central Rating Display */}
      <div className="rating-container">
        <div id="rating-display" className="item-rating" style={{ borderColor: cardColor }} onClick={handleReRank}>
          {parseFloat(itemData.rating || 0).toFixed(1)}
        </div>
      </div>

      {/* Editable Fields */}
      {orderedFields.map((field, index) => {
        return (
          <div
            key={index}
            className="item-field"
            onClick={() => setEditingField(field)}
          >
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
        );
      })}

      {/* Back Button */}
      <button id="back-button" onClick={() => navigate(`/categories/${categoryId}`)}>Back</button>
    </div>
    </div>
  );
};

export default ItemView;