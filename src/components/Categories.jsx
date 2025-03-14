import { useEffect, useState, useMemo } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AddSearchPanel from "../components/Navigation/AddSearchPanel";
import { useLikedCategories } from "../context/useLikedCategories";
import { useAuth } from "../context/useAuth";
import { useFollow } from "../context/useFollow";
import CategoryList from "./CategoryList";
import CategorySearch from "../components/CategorySearch";
import { PRIVACY_LEVELS } from "../constants/privacy";
import { fetchTagsSet } from "../utils/tagUtils";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [availableTags, setAvailableTags] = useState(new Set());

  const navigate = useNavigate();
  const { likedCategories, toggleLikeCategory } = useLikedCategories();
  const { user } = useAuth();
  const { following } = useFollow();

  // ✅ Fetch available tags once on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagSet = await fetchTagsSet();
        setAvailableTags(tagSet);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    loadTags();
  }, []);

  // ✅ Fetch categories while considering tag lookups
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, "categories"));
        const categoryList = categorySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              tagNames: (data.tags || []).filter((tag) =>
                availableTags.has(tag)
              ),
            };
          })
          .filter((category) => {
            if (category.privacy === PRIVACY_LEVELS.PUBLIC) return true;
            return user && following.has(category.createdBy);
          });

        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [availableTags, user, following]); // ✅ Re-fetch categories when tags load

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  const handleLike = (categoryId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleLikeCategory(categoryId);
  };

  // ✅ Search optimization using `useMemo`
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const searchLower = searchTerm.toLowerCase();
    return categories.filter((category) => {
      const nameMatches = category.name.toLowerCase().includes(searchLower);
      const tagMatches =
        category.tagNames &&
        category.tagNames.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
      return nameMatches || tagMatches;
    });
  }, [searchTerm, categories]);

  return (
    <div className="categories-container">
      <h2>Categories</h2>
      <AddSearchPanel
        onAdd={() => navigate("/create-category")}
        onToggleSearch={() => setShowSearchBox(!showSearchBox)}
        isAddDisabled={false}
      />
      {showSearchBox && (
        <CategorySearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}
      <CategoryList
        categories={filteredCategories}
        onCategoryClick={handleCategoryClick}
        onLike={handleLike}
        likedCategories={likedCategories}
      />
    </div>
  );
};

export default Categories;
