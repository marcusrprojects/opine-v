import { useEffect, useState, useMemo } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AddSearchPanel from "../components/Navigation/AddSearchPanel";
import { useTagMap } from "../context/useTagMap";
import { useLikedCategories } from "../context/useLikedCategories";
import { useAuth } from "../context/useAuth";
import CategoryList from "./CategoryList";
import CategorySearch from "../components/CategorySearch";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const navigate = useNavigate();
  const tagMap = useTagMap();
  const { likedCategories, toggleLikeCategory } = useLikedCategories();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, "categories"));
        const categoryList = categorySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            tagNames: (data.tags || []).map(
              (tagId) => tagMap[tagId] || "Unknown"
            ),
          };
        });
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [tagMap]);

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

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const searchLower = searchTerm.toLowerCase();
    return categories.filter((category) => {
      const nameMatches = category.name.toLowerCase().includes(searchLower);
      const tagMatches =
        category.tagNames &&
        category.tagNames.some((tagName) =>
          tagName.toLowerCase().includes(searchLower)
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
