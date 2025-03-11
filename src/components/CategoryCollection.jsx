import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTagMap } from "../context/useTagMap";
import { useLikedCategories } from "../context/useLikedCategories";
import { useFollow } from "../context/useFollow";
import CategoryList from "./CategoryList";
import { PRIVACY_LEVELS } from "../constants/privacy";
import PropTypes from "prop-types";

const CategoryCollection = ({ mode = "own", userId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tagMap = useTagMap();
  const { likedCategories, toggleLikeCategory } = useLikedCategories();
  const { following } = useFollow();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!user && mode !== "all") return; // Non-logged users can only see public categories

    const fetchCategories = async () => {
      try {
        let q;

        // Fetch based on mode
        if (mode === "own") {
          q = query(
            collection(db, "categories"),
            where("createdBy", "==", user.uid)
          );
        } else if (mode === "user" && userId) {
          q = query(
            collection(db, "categories"),
            where("createdBy", "==", userId)
          );
        } else if (mode === "liked") {
          setCategories(likedCategories);
          return;
        } else {
          q = collection(db, "categories");
        }

        const querySnapshot = await getDocs(q);
        const categoryList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            tagNames: (data.tags || []).map(
              (tagId) => tagMap[tagId] || "Unknown"
            ),
          };
        });

        // Filter by privacy rules
        const filteredCategories = categoryList.filter((category) => {
          if (category.privacy === PRIVACY_LEVELS.PUBLIC) return true;
          return (
            user &&
            (category.createdBy === user.uid ||
              following.has(category.createdBy))
          );
        });

        setCategories(filteredCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [user, userId, mode, tagMap, following, likedCategories]);

  const handleLike = (categoryId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleLikeCategory(categoryId);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="category-collection-container">
      <CategoryList
        categories={categories}
        onCategoryClick={handleCategoryClick}
        onLike={handleLike}
        likedCategories={likedCategories}
      />
    </div>
  );
};

CategoryCollection.propTypes = {
  mode: PropTypes.oneOf(["own", "user", "liked", "all"]),
  userId: PropTypes.string,
};

export default CategoryCollection;
