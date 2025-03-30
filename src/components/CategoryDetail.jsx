import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import ItemList from "./ItemList";
import CategoryCreatorPanel from "./Navigation/CategoryCreatorPanel";
import CategoryFilters from "./CategoryFilters";
import { useAuth } from "../context/useAuth";
import { handleError } from "../utils/errorUtils";
import { useUserData } from "../context/useUserData";
import "../styles/CategoryDetail.css";
import CategoryViewerPanel from "./Navigation/CategoryViewerPanel";
import { canUserViewCategory } from "../utils/privacyUtils";

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFollowing, userData, toggleLikeCategory } = useUserData();
  const { likedCategories } = userData || {};

  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [orderedFields, setOrderedFields] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [creatorId, setCreatorId] = useState(null);
  const UNKNOWN_USER = "Unknown User";
  const [creatorUsername, setCreatorUsername] = useState(UNKNOWN_USER);
  const [likeCount, setLikeCount] = useState(0);
  const [lastEdited, setLastEdited] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [filterFields, setFilterFields] = useState([]);

  const categoryUnsubscribeRef = useRef(null);
  const itemsUnsubscribeRef = useRef(null);

  useEffect(() => {
    if (!creatorId) {
      setCreatorUsername(UNKNOWN_USER);
      return;
    }
    const fetchCreatorData = async () => {
      try {
        const userDocRef = doc(db, "users", creatorId);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          setCreatorUsername(data.username || UNKNOWN_USER);
        }
      } catch (error) {
        console.error("Error fetching creator info:", error);
      }
    };
    fetchCreatorData();
  }, [creatorId]);

  useEffect(() => {
    if (!categoryId) return;
    if (categoryUnsubscribeRef.current) categoryUnsubscribeRef.current();
    const categoryRef = doc(db, "categories", categoryId);
    categoryUnsubscribeRef.current = onSnapshot(categoryRef, (snapshot) => {
      if (!snapshot.exists()) return navigate("/categories");
      const data = snapshot.data();
      setCategory(data);
      setOrderedFields(Array.isArray(data.fields) ? data.fields : []);
      setTiers(data.tiers ?? []);
      setCreatorId(data.createdBy ?? "");
      setLikeCount(data.likeCount || 0);
      setLastEdited(data.updatedAt ? data.updatedAt.toDate() : null);
    });
    return () => {
      if (categoryUnsubscribeRef.current) categoryUnsubscribeRef.current();
    };
  }, [categoryId, navigate]);

  useEffect(() => {
    if (!categoryId) return;
    if (itemsUnsubscribeRef.current) itemsUnsubscribeRef.current();
    const itemsCollectionRef = collection(db, `categories/${categoryId}/items`);
    const q = query(itemsCollectionRef, orderBy("rating", "desc"));
    itemsUnsubscribeRef.current = onSnapshot(q, (snapshot) => {
      const itemList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemList);
    });
    return () => {
      if (itemsUnsubscribeRef.current) itemsUnsubscribeRef.current();
    };
  }, [categoryId]);

  useEffect(() => {
    if (!category || !user) return;
    if (!canUserViewCategory(category, user, isFollowing(category.createdBy))) {
      navigate("/categories");
    }
  }, [category, user, isFollowing, navigate]);

  useEffect(() => {
    let timeoutId;
    if (showSettings && !filterOpen) {
      timeoutId = setTimeout(() => setShowSettings(false), 4000);
    }
    return () => clearTimeout(timeoutId);
  }, [showSettings, filterOpen]);

  const filteredItems = useMemo(() => {
    if (filterFields.length === 0) return items;
    return items.filter((item) =>
      filterFields.every(({ name }) =>
        (item[name] || "")
          .toString()
          .toLowerCase()
          .includes((filters[name] || "").toLowerCase())
      )
    );
  }, [items, filters, filterFields]);

  if (!category) return <p>Category not found.</p>;

  const handleItemClick = (itemId) => navigate(`./items/${itemId}`);
  const handleAddItem = () => navigate(`/categories/${categoryId}/add-item`);
  const handleEditCategory = () =>
    navigate(`/categories/${categoryId}/edit`, { state: { category } });

  const handleDeleteCategory = async () => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      const itemsCollectionRef = collection(
        db,
        `categories/${categoryId}/items`
      );
      const itemsSnapshot = await getDocs(itemsCollectionRef);
      if (!itemsSnapshot.empty) {
        const batch = writeBatch(db);
        itemsSnapshot.forEach((itemDoc) => batch.delete(itemDoc.ref));
        await batch.commit();
      }
      await deleteDoc(doc(db, "categories", categoryId));
      navigate("/categories");
    } catch (error) {
      handleError(error, "Error deleting category and its items.");
    }
  };

  const handleSettingsToggle = () => {
    setShowSettings((prev) => !prev);
    if (showSettings) setFilterOpen(false);
  };

  const toggleFilter = () => setFilterOpen((prev) => !prev);
  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));
  const handleFilterFieldChange = ({ name }) => {
    setFilterFields((prev) =>
      prev.some((f) => f.name === name)
        ? prev.filter((f) => f.name !== name)
        : [...prev, { name }]
    );
  };

  const handleToggleLike = async () => {
    try {
      await toggleLikeCategory(categoryId);
    } catch (error) {
      console.error("Error updating like count:", error);
    }
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    if (diff === 0) return `just now`;
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
  };

  return (
    <div className="category-detail-container">
      {user && creatorId && user.uid === creatorId ? (
        <CategoryCreatorPanel
          onAdd={handleAddItem}
          isAddDisabled={false}
          onToggleFilter={toggleFilter}
          onLike={handleToggleLike}
          isLiked={likedCategories.includes(categoryId)}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          showSettings={showSettings}
          onSettingsToggle={handleSettingsToggle}
          canEdit={user && creatorId && user.uid === creatorId}
        />
      ) : (
        <CategoryViewerPanel
          onToggleFilter={toggleFilter}
          onLike={handleToggleLike}
          isLiked={likedCategories.includes(categoryId)}
        />
      )}
      <div className="category-header">
        <h2>{category.name}</h2>
        <p className="category-detail-info">
          {category.description || "No description available."}
        </p>
        <span
          className="clickable-username"
          onClick={() => navigate(`/profile/${creatorId}`)}
        >
          @{creatorUsername}
        </span>
        <p className="category-detail-info">
          {likeCount} {likeCount === 1 ? "Like" : "Likes"}
        </p>
      </div>
      {filterOpen && (
        <CategoryFilters
          fields={orderedFields}
          filterFieldsSelected={filterFields}
          filters={filters}
          onFilterChange={handleFilterChange}
          onFilterFieldChange={handleFilterFieldChange}
        />
      )}
      <ItemList
        items={filteredItems}
        orderedFields={orderedFields}
        tiers={tiers}
        onItemClick={handleItemClick}
      />
      <p className="category-detail-info">
        Last Edited: {getRelativeTime(lastEdited)}
      </p>
    </div>
  );
};

export default CategoryDetail;
