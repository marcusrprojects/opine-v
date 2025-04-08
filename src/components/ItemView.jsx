import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "../styles/ItemView.css";
import { calculateCardColor } from "../utils/ranking";
import { useAuth } from "../context/useAuth";
import BackDeletePanel from "./Navigation/BackDeletePanel";
import { canUserViewCategory } from "../utils/privacyUtils";
import { useUserData } from "../context/useUserData";
import LinkHeader from "./LinkHeader";
import { isValidUrl } from "../utils/validationUtils";

const ItemView = () => {
  const { user } = useAuth();
  const { isFollowing } = useUserData();
  const { categoryId, itemId } = useParams();
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({});
  const [creatorId, setCreatorId] = useState("");
  const [editingField, setEditingField] = useState(null);
  // orderedFields: array of field objects { id, name, active }
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
        if (
          !canUserViewCategory(
            categoryData,
            user,
            isFollowing(categoryData.createdBy)
          )
        ) {
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
    if (!user) return;
    fetchItem();
  }, [categoryId, itemId, isFollowing, navigate, user]);

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

  // Secure save: call backend endpoint.
  const handleSaveField = async (field) => {
    await canEditAction(async () => {
      let updatedValue = itemData[field]?.trim() || "";
      if (
        field === "link" &&
        updatedValue !== "" &&
        !isValidUrl(updatedValue)
      ) {
        alert("Please enter a valid URL.");
        updatedValue = "";
        setItemData((prev) => ({ ...prev, link: updatedValue }));
      }
      // Call secure endpoint to update the field.
      const response = await fetch(`/api/updateItemField`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, itemId, field, updatedValue }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Update failed");
      // Optionally update the category's timestamp server-side.
      setEditingField(null);
    });
  };

  // Secure deletion.
  const handleDelete = async () => {
    await canEditAction(async () => {
      if (window.confirm("Are you sure you want to delete this item?")) {
        const response = await fetch(`/api/deleteItem`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId, itemId }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Deletion failed");
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

  const cardColor = useMemo(() => {
    const rating = itemData.rating || 0;
    return calculateCardColor(rating, tiers, itemData.rankCategory);
  }, [itemData.rating, tiers, itemData.rankCategory]);

  const externalLink =
    itemData.link?.trim() ||
    `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
      itemData[orderedFields[0]?.name]
    )}`;

  if (loading) return <p>Loading...</p>;

  return (
    <div className="item-view-container">
      <BackDeletePanel
        onBack={() => navigate(`/categories/${categoryId}`)}
        onDelete={handleDelete}
        canDelete={canEdit}
      />
      <LinkHeader
        title={itemData[orderedFields[0]?.name] || "Unnamed Item"}
        link={externalLink}
      />
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
      <div
        className={`item-field ${canEdit ? "editable" : "non-editable"}`}
        onClick={() => setEditingField("link")}
      >
        <div className="field-content">
          <label className="item-label">Reference Link</label>
          {editingField === "link" ? (
            <input
              type="text"
              value={itemData.link || ""}
              onChange={(e) => handleChange("link", e.target.value)}
              onBlur={() => handleSaveField("link")}
              autoFocus
              className="item-input"
            />
          ) : (
            <span className="item-value">
              {itemData.link || "Click to add custom link"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemView;
