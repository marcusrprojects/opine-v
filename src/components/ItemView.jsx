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
import {
  recalcRankingsForCategory,
  calculateCardColor,
} from "../utils/ranking";
import { useAuth } from "../context/useAuth";
import BackDeletePanel from "./Navigation/BackDeletePanel";
import { canUserViewCategory } from "../utils/privacyUtils";
import { useFollow } from "../context/useFollow";

const ItemView = () => {
  const { user } = useAuth();
  const { following } = useFollow();
  const { categoryId, itemId } = useParams();
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({});
  const [creatorId, setCreatorId] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [orderedFields, setOrderedFields] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const itemDoc = await getDoc(
          doc(db, `categories/${categoryId}/items`, itemId)
        );
        const categoryDoc = await getDoc(doc(db, "categories", categoryId));
        if (!categoryDoc.exists()) return navigate("/categories");
        const categoryData = categoryDoc.data();
        if (!canUserViewCategory(categoryData, user, following)) {
          navigate("/categories");
          return;
        }
        if (itemDoc.exists()) {
          setItemData(itemDoc.data());
        }
        setOrderedFields(categoryData.fields ?? []);
        setTiers(categoryData.tiers ?? []);
        setCreatorId(categoryData.createdBy);
        setLoading(false);
      } catch (error) {
        console.warn("Error fetching item or category:", error);
      }
    };
    fetchItem();
  }, [categoryId, itemId, following, navigate, user]);

  const canEdit = useMemo(
    () => user && user.uid === creatorId,
    [user, creatorId]
  );

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
      const updatedValue = itemData[field]?.trim() || "";
      await updateDoc(itemRef, { [field]: updatedValue });
      await updateDoc(categoryRef, { updatedAt: Timestamp.now() });
      setEditingField(null);
    });
  };

  const handleDelete = async () => {
    await canEditAction(async () => {
      if (window.confirm("Are you sure you want to delete this item?")) {
        await deleteDoc(doc(db, `categories/${categoryId}/items`, itemId));
        await updateDoc(doc(db, "categories", categoryId), {
          updatedAt: Timestamp.now(),
        });
        await recalcRankingsForCategory(categoryId); // Recalculate rankings after deletion.
        navigate(`/categories/${categoryId}`);
      }
    });
  };

  const handleReRank = () => {
    if (!canEdit) return;
    navigate(`/categories/${categoryId}/items/${itemId}/rerank`, {
      state: { existingItem: itemData },
    });
  };

  // Use updated calculateCardColor that accepts the stored tier id.
  const cardColor = useMemo(() => {
    const rating = itemData.rating || 0;
    return calculateCardColor(rating, tiers, itemData.rankCategory);
  }, [itemData.rating, tiers, itemData.rankCategory]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="item-view-container">
      <BackDeletePanel
        onBack={() => navigate(`/categories/${categoryId}`)}
        onDelete={handleDelete}
        canDelete={canEdit}
      />
      <h2 className="item-title">
        {itemData[orderedFields[0]?.name] || "Unnamed Item"}
      </h2>
      <div className="rating-container">
        <div
          id="rating-display"
          className={`item-rating ${canEdit ? "editable" : "disabled"}`}
          style={{ outlineColor: cardColor }}
          onClick={handleReRank}
        >
          {parseFloat(itemData.rating || 0).toFixed(1)}
        </div>
      </div>
      {orderedFields.map(({ name: field }, index) => (
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
