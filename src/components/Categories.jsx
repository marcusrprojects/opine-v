import { useEffect, useState, useMemo } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AddSearchPanel from "../components/Navigation/AddSearchPanel";
import { useAuth } from "../context/useAuth";
import CategoryList from "./CategoryList";
import CategorySearch from "../components/CategorySearch";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [likedCategories, setLikedCategories] = useState([]);
  const [tagMap, setTagMap] = useState({}); // { tagId: tagName }
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchLikedCategories = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          setLikedCategories(userDocSnapshot.data().likedCategories || []);
        }
      } catch (error) {
        console.error("Error fetching liked categories:", error);
      }
    };

    const fetchTags = async () => {
      try {
        const tagSnapshot = await getDocs(collection(db, "tags"));
        const tags = tagSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().name;
          return acc;
        }, {});
        setTagMap(tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, "categories"));
        const categoryList = categorySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Create an array of tag names for easy searching.
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

    if (user) {
      fetchLikedCategories();
    }
    // Load tags then categories (ensuring tagMap is set before mapping tagNames)
    fetchTags().then(fetchCategories);
  }, [user, tagMap]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  const toggleLike = async (categoryId) => {
    if (!user) {
      alert("Log in to like categories.");
      return;
    }
    const userDocRef = doc(db, "users", user.uid);
    const isLiked = likedCategories.includes(categoryId);
    const updatedLikes = isLiked
      ? likedCategories.filter((id) => id !== categoryId)
      : [...likedCategories, categoryId];
    try {
      await updateDoc(userDocRef, { likedCategories: updatedLikes });
      setLikedCategories(updatedLikes);
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  // Filter categories by searching in both name and tagNames.
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

  // Toggle search box visibility
  const toggleSearchBox = () => {
    setShowSearchBox((prev) => !prev);
  };

  return (
    <div className="categories-container">
      <h2>Categories</h2>

      {/* Render the action panel with Add & Search buttons */}
      <AddSearchPanel
        onAdd={() => navigate("/create-category")}
        onToggleSearch={toggleSearchBox}
        isAddDisabled={false}
      />

      {/* Render the search box above the category list if toggled open */}
      {showSearchBox && (
        <CategorySearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}

      <CategoryList
        categories={filteredCategories}
        onCategoryClick={handleCategoryClick}
        onLike={toggleLike}
        likedCategories={likedCategories}
      />
    </div>
  );
};

export default Categories;
