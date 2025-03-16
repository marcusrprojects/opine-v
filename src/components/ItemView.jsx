import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import "../styles/ItemView.css";
import { refreshRankedItems, calculateCardColor } from "../utils/ranking";
import { useAuth } from "../context/useAuth";
import BackDeletePanel from "./Navigation/BackDeletePanel";

const ItemView = () => {
  const { user } = useAuth();
  const { categoryId, itemId } = useParams();
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({});
  const [creatorId, setCreatorId] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [orderedFields, setOrderedFields] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      const itemDoc = await getDoc(
        doc(db, `categories/${categoryId}/items`, itemId)
      );
      const categoryDoc = await getDoc(doc(db, "categories", categoryId));

      if (itemDoc.exists()) {
        setItemData(itemDoc.data());
      }

      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        setOrderedFields(categoryData.fields);
        setCreatorId(categoryData.createdBy);
      }
    };
    fetchItem();
  }, [categoryId, itemId]);

  const canEdit = useMemo(() => {
    return user && user.uid === creatorId;
  }, [user, creatorId]);

  const handleChange = (field, value) => {
    setItemData((prev) => ({ ...prev, [field]: value }));
  };

  const canEditAction = async (action) => {
    if (!canEdit) {
      alert("You do not have permission to perform this action.");
      return false;
    }
    await action();
    return true;
  };

  const handleSaveField = async (field) => {
    await canEditAction(async () => {
      const itemRef = doc(db, `categories/${categoryId}/items`, itemId);
      const categoryRef = doc(db, "categories", categoryId);

      await updateDoc(itemRef, { [field]: itemData[field] });
      await updateDoc(categoryRef, {
        updatedAt: Timestamp.now(),
      });

      setEditingField(null);
    });
  };

  const handleDelete = async () => {
    await canEditAction(async () => {
      if (window.confirm("Are you sure you want to delete this item?")) {
        await deleteDoc(doc(db, `categories/${categoryId}/items`, itemId));
        await refreshRankedItems(categoryId, itemData.rankCategory);
        navigate(`/categories/${categoryId}`);
      }
    });
  };

  const handleReRank = () => {
    navigate(`/categories/${categoryId}/items/${itemId}/rerank`, {
      state: { existingItem: itemData },
    });
  };

  const cardColor = useMemo(() => {
    const rating = itemData.rating || 0;
    const rankCategory = itemData.rankCategory || 0;
    return calculateCardColor(rating, rankCategory);
  }, [itemData.rating, itemData.rankCategory]);

  return (
    <div className="item-view-container">
      {/* Use BackDeletePanel for navigation and delete actions */}
      <BackDeletePanel
        onBack={() => navigate(`/categories/${categoryId}`)}
        onDelete={handleDelete}
        canDelete={canEdit}
      />

      <h2 className="item-title">
        {itemData[orderedFields[0]] || "Unnamed Item"}
      </h2>

      <div className="rating-container">
        <div
          id="rating-display"
          className="item-rating"
          style={{ outlineColor: cardColor }}
          onClick={handleReRank}
        >
          {parseFloat(itemData.rating || 0).toFixed(1)}
        </div>
      </div>

      {/* Render ordered fields excluding "Notes" */}
      {orderedFields.map((field, index) => (
        <div
          key={index}
          className={`item-field ${canEdit ? "editable" : "non-editable"}`}
          onClick={() => setEditingField(field)}
        >
          <div className="field-content">
            <label className="item-label">{field}</label>
            {canEdit && editingField === field ? (
              <input
                type="text"
                value={itemData[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                onBlur={() => handleSaveField(field)}
                autoFocus
                className="item-input"
              />
            ) : (
              <span className="item-value">
                {itemData[field] || "Click to edit"}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Render "Notes" field separately */}
      <div
        className={`item-field ${canEdit ? "editable" : "non-editable"}`}
        onClick={() => setEditingField("notes")}
      >
        <div className="field-content">
          <label className="item-label">Notes</label>
          {editingField === "notes" ? (
            <textarea
              value={itemData.notes || ""}
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
    </div>
  );
};

export default ItemView;
