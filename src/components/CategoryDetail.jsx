import { useEffect, useState, useRef, useMemo } from "react";
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
import CategoryPanel from "./Navigation/CategoryPanel";
import CategoryFilters from "./CategoryFilters";
import { useAuth } from "../context/useAuth";
import { useLikedCategories } from "../context/useLikedCategories";
import { handleError } from "../utils/errorUtils";
import { PRIVACY_LEVELS } from "../constants/privacy";
import { useFollow } from "../context/useFollow";

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { following } = useFollow();
  const { likedCategories, toggleLikeCategory } = useLikedCategories();

  // Data states
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [orderedFields, setOrderedFields] = useState([]);
  const [creatorId, setCreatorId] = useState(null);
  const UNKNOWN_USER = "Unknown User";
  const [creatorUsername, setCreatorUsername] = useState(UNKNOWN_USER);
  const [likeCount, setLikeCount] = useState(0);
  const [lastEdited, setLastEdited] = useState(null);

  // UI states
  const [showSettings, setShowSettings] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [filterFields, setFilterFields] = useState([]);

  // Firestore listener references to prevent memory leaks
  const categoryUnsubscribeRef = useRef(null);
  const itemsUnsubscribeRef = useRef(null);

  // Fetches the creator's username **only when createdBy changes**
  useEffect(() => {
    if (!creatorId) {
      setCreatorUsername(UNKNOWN_USER);
      return;
    }

    const fetchCreatorUsername = async () => {
      try {
        const userDocRef = doc(db, "users", creatorId);
        const userSnapshot = await getDoc(userDocRef);

        setCreatorUsername(
          userSnapshot.exists()
            ? userSnapshot.data()?.username ?? UNKNOWN_USER
            : UNKNOWN_USER
        );
      } catch (error) {
        console.error("Error fetching creator username:", error);
      }
    };

    fetchCreatorUsername();
  }, [creatorId]);

  useEffect(() => {
    if (!categoryId) return;

    // Cleanup previous subscription
    if (categoryUnsubscribeRef.current) categoryUnsubscribeRef.current();

    const categoryRef = doc(db, "categories", categoryId);
    categoryUnsubscribeRef.current = onSnapshot(categoryRef, (snapshot) => {
      if (!snapshot.exists()) return navigate("/categories");

      const data = snapshot.data();
      setCategory(data);
      setOrderedFields(data.fields || []);
      setCreatorId(data.createdBy || "");
      setLikeCount(data.likeCount || 0);
      setLastEdited(data.updatedAt ? data.updatedAt.toDate() : null);
    });

    return () => {
      if (categoryUnsubscribeRef.current) categoryUnsubscribeRef.current();
    };
  }, [categoryId, navigate]);

  // Subscribe to real-time item updates
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

  // Redirect users if privacy settings block access
  useEffect(() => {
    if (!category || !user) return;
    if (
      category.privacy === PRIVACY_LEVELS.FRIENDS_ONLY &&
      !following.has(category.createdBy) &&
      user.uid !== category.createdBy
    ) {
      navigate("/categories");
    }
  }, [category, user, following, navigate]);

  // Auto-hide settings after 4 seconds if filter panel is not open
  useEffect(() => {
    let timeoutId;
    if (showSettings && !filterOpen) {
      timeoutId = setTimeout(() => setShowSettings(false), 4000);
    }
    return () => clearTimeout(timeoutId);
  }, [showSettings, filterOpen]);

  // Efficient filtering with useMemo
  const filteredItems = useMemo(() => {
    if (filterFields.length === 0) return items;
    return items.filter((item) =>
      filterFields.every((field) =>
        (item[field] || "")
          .toString()
          .toLowerCase()
          .includes((filters[field] || "").toLowerCase())
      )
    );
  }, [items, filters, filterFields]);

  if (!category) {
    return <p>Category not found.</p>;
  }

  // Navigation and action handlers
  const handleItemClick = (itemId) => navigate(`./item/${itemId}`);
  const handleBack = () => navigate("/categories");
  const handleAddItem = () => navigate(`/categories/${categoryId}/add-item`);
  const handleEditCategory = () =>
    navigate(`/categories/${categoryId}/edit`, {
      state: {
        categoryName: category.name,
        description: category.description,
        fields: orderedFields,
        creatorUsername,
        tags: category.tags,
        privacy: category.privacy,
      },
    });

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

  // Settings toggle: when closing settings, also close the filter panel
  const handleSettingsToggle = () => {
    setShowSettings((prev) => !prev);
    if (showSettings) setFilterOpen(false);
  };

  // Toggle the filter sub-panel
  const toggleFilter = () => setFilterOpen((prev) => !prev);

  // Update filter state
  const handleFilterChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));
  const handleFilterFieldChange = (field) =>
    setFilterFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );

  const handleToggleLike = async () => {
    try {
      await toggleLikeCategory(categoryId);
    } catch (error) {
      console.error("Error updating like count:", error);
    }
  };

  return (
    <div className="category-detail-container">
      <CategoryPanel
        onBack={handleBack}
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

      <h2>{category.name}</h2>
      <p className="category-description">
        {category.description || "No description available."}
      </p>
      <p className="creator-username">@{creatorUsername}</p>
      <p className="category-likes">
        {likeCount} {likeCount === 1 ? "Like" : "Likes"}
      </p>

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
        onItemClick={handleItemClick}
      />

      <p className="category-last-edited">
        Last Edited: {lastEdited ? lastEdited.toLocaleString() : "N/A"}
      </p>
    </div>
  );
};

export default CategoryDetail;
