import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  updateDoc,
  arrayRemove,
  arrayUnion,
  writeBatch,
} from "firebase/firestore";
import ItemList from "./ItemList";
import CategoryPanel from "./Navigation/CategoryPanel";
import CategoryFilters from "./CategoryFilters";
import { useAuth } from "../context/useAuth";
import { handleError } from "../utils/errorUtils";
import { PRIVACY_LEVELS } from "../constants/privacy";
import { useFollow } from "../context/useFollow";

const CategoryDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { following } = useFollow();

  // Data states
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [orderedFields, setOrderedFields] = useState([]);
  const [creatorId, setCreatorId] = useState(null);
  const [creatorUsername, setCreatorUsername] = useState("");

  // UI states
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [filterFields, setFilterFields] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [lastEdited, setLastEdited] = useState(null);

  // Fetch category and items data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const categoryDocRef = doc(db, "categories", categoryId);
        const categorySnapshot = await getDoc(categoryDocRef);
        if (categorySnapshot.exists()) {
          const categoryData = categorySnapshot.data();
          setCategory(categoryData);
          setOrderedFields(categoryData.fields || []);
          setCreatorId(categoryData.createdBy || "");
          setLikeCount(categoryData.likeCount || 0);
          setLastEdited(categoryData.updatedAt?.toDate() || null);

          if (categoryData.createdBy) {
            const creatorDocRef = doc(db, "users", categoryData.createdBy);
            const creatorSnapshot = await getDoc(creatorDocRef);
            if (creatorSnapshot.exists()) {
              const creatorData = creatorSnapshot.data();
              setCreatorUsername(creatorData.username || "Unknown User");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching category details:", error);
      }
    };

    const fetchItems = async () => {
      try {
        const itemsCollectionRef = collection(
          db,
          `categories/${categoryId}/items`
        );
        const itemsSnapshot = await getDocs(itemsCollectionRef);
        const itemList = itemsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort items: highest rating first, then tie-breaker by rankCategory
        const sortedItems = [...itemList].sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return b.rankCategory - a.rankCategory;
        });
        setItems(sortedItems);
        setFilteredItems(sortedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    Promise.all([fetchCategory(), fetchItems()]).then(() => {
      setLoading(false);
    });
  }, [categoryId]);

  useEffect(() => {
    if (!category) return;

    if (category.privacy === PRIVACY_LEVELS.FRIENDS_ONLY) {
      if (
        !user ||
        (!following.has(category.createdBy) && user.uid !== category.createdBy)
      ) {
        navigate("/categories");
      }
    }
  }, [category, user, following, navigate]);

  // Fetch liked state for logged-in user
  useEffect(() => {
    const fetchLikedState = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setLiked(userData.likedCategories?.includes(categoryId));
        }
      } catch (error) {
        handleError(error, "Error fetching liked state.");
      }
    };
    fetchLikedState();
  }, [user, categoryId]);

  // Compute if user can edit the category (if user is creator)
  const canEdit = useMemo(() => {
    return !!(user && creatorId && user.uid === creatorId);
  }, [user, creatorId]);

  // Auto-hide settings after 4 seconds if filter panel is not open
  useEffect(() => {
    let timeoutId;
    if (showSettings && !filterOpen) {
      timeoutId = setTimeout(() => setShowSettings(false), 4000);
    }
    return () => clearTimeout(timeoutId);
  }, [showSettings, filterOpen]);

  // Apply filters (debounced) when filters, filterFields, or items change
  useEffect(() => {
    const debounceApplyFilters = setTimeout(() => {
      if (filterFields.length === 0) {
        setFilteredItems(items);
        return;
      }
      const filtered = items.filter((item) =>
        filterFields.every((field) =>
          (item[field] || "")
            .toString()
            .toLowerCase()
            .includes((filters[field] || "").toLowerCase())
        )
      );
      setFilteredItems(filtered);
    }, 300);
    return () => clearTimeout(debounceApplyFilters);
  }, [filters, filterFields, items]);

  if (loading) {
    return <p>Loading category details...</p>;
  }
  if (!category) {
    return <p>Category not found.</p>;
  }

  // Navigation and action handlers
  const handleItemClick = (itemId) => {
    navigate(`./item/${itemId}`);
  };
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
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        // 1) Delete all items in the subcollection
        const itemsCollectionRef = collection(
          db,
          `categories/${categoryId}/items`
        );
        const itemsSnapshot = await getDocs(itemsCollectionRef);

        // Use a batch to delete subcollection docs
        const batch = writeBatch(db);
        itemsSnapshot.forEach((itemDoc) => {
          batch.delete(itemDoc.ref);
        });
        await batch.commit();

        // 2) Delete the parent category document
        await deleteDoc(doc(db, "categories", categoryId));
        navigate("/categories");
      } catch (error) {
        handleError(error, "Error deleting category and its items.");
      }
    }
  };

  const toggleLikeCategory = async () => {
    if (!user) {
      alert("You must be logged in to like a category.");
      return;
    }
    try {
      const userDocRef = doc(db, "users", user.uid);
      if (liked) {
        await updateDoc(userDocRef, {
          likedCategories: arrayRemove(categoryId),
        });
      } else {
        await updateDoc(userDocRef, {
          likedCategories: arrayUnion(categoryId),
        });
      }
      setLiked(!liked);
    } catch (error) {
      handleError(error, "Error updating like state.");
    }
  };

  // Settings toggle: when closing settings, also close the filter panel
  const handleSettingsToggle = () => {
    setShowSettings((prev) => {
      if (prev) {
        setFilterOpen(false);
      }
      return !prev;
    });
  };

  // Toggle the filter sub-panel
  const toggleFilter = () => {
    setFilterOpen((prev) => !prev);
  };

  // Update a specific filter value
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle whether a field is active for filtering
  const handleFilterFieldChange = (field) => {
    setFilterFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  return (
    <div className="category-detail-container">
      <CategoryPanel
        onBack={handleBack}
        onAdd={handleAddItem}
        isAddDisabled={false}
        onToggleFilter={toggleFilter}
        onLike={toggleLikeCategory}
        isLiked={liked}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        showSettings={showSettings}
        onSettingsToggle={handleSettingsToggle}
        canEdit={canEdit}
      />

      <h2>{category.name}</h2>
      <p className="category-description">
        {category.description || "No description available."}
      </p>
      <p className="creator-username">@{creatorUsername}</p>

      <p className="category-likes">👍 {likeCount} Likes</p>
      <p className="category-last-edited">
        🕒 Last Edited: {lastEdited ? lastEdited.toLocaleString() : "N/A"}
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
    </div>
  );
};

export default CategoryDetail;
