import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  doc,
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
import { FaLock } from "react-icons/fa";
import { CategoryPrivacy } from "../enums/PrivacyEnums";
import { isValidUrl } from "../utils/validationUtils";
import { useUserCache } from "../context/useUserCache";

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
  const [likeCount, setLikeCount] = useState(0);
  const [lastEdited, setLastEdited] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [filterFields, setFilterFields] = useState([]);

  const categoryUnsubscribeRef = useRef(null);
  const itemsUnsubscribeRef = useRef(null);

  // Instead of fetching creator data here, we use the user cache.
  const UNKNOWN_USER = "Unknown User";
  const { getUserInfo } = useUserCache();
  const creatorInfo = getUserInfo(creatorId);
  const creatorUsername = creatorInfo?.username || UNKNOWN_USER;

  // Subscribe to category data.
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

  // Subscribe to items.
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

  // Verify user access.
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

  const finalOrderedFields = useMemo(() => {
    if (!orderedFields.length) return [];
    if (!filterFields.length) return orderedFields;
    const primaryField = orderedFields[0];
    if (filterFields[0] === primaryField) return filterFields;
    const primaryExists = filterFields.some(
      (field) => field.name === primaryField.name
    );
    if (!primaryExists) {
      return [primaryField, ...filterFields];
    }
    return [
      primaryField,
      ...filterFields.filter((field) => field.name !== primaryField.name),
    ];
  }, [orderedFields, filterFields]);

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

  const handleRandomReference = () => {
    if (items.length === 0) {
      alert("No items available.");
      return;
    }
    const randomIndex = Math.floor(Math.random() * items.length);
    const randomItem = items[randomIndex];
    const primaryFieldName = orderedFields[0]?.name;
    let link = randomItem.link?.trim();
    if (!link || !isValidUrl(link)) {
      link = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
        randomItem[primaryFieldName] || ""
      )}`;
    }
    window.open(link, "_blank", "noopener,noreferrer");
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
          onRandomReference={handleRandomReference}
        />
      ) : (
        <CategoryViewerPanel
          onToggleFilter={toggleFilter}
          onLike={handleToggleLike}
          isLiked={likedCategories.includes(categoryId)}
          onRandomReference={handleRandomReference}
        />
      )}
      <div className="category-header">
        <h2 className="category-name">
          {category.name}
          {category.categoryPrivacy === CategoryPrivacy.ONLY_ME && (
            <FaLock title="This category is private. Only you can view it." />
          )}
        </h2>
        {category.description && (
          <p className="category-detail-info">{category.description}</p>
        )}
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
        orderedFields={finalOrderedFields}
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
