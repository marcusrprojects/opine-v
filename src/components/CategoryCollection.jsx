import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
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
        let categoryList = [];

        if (mode === "own") {
          // Fetch categories created by the logged-in user
          q = query(
            collection(db, "categories"),
            where("createdBy", "==", user.uid)
          );
        } else if (mode === "user" && userId) {
          // Fetch categories created by a specific user
          q = query(
            collection(db, "categories"),
            where("createdBy", "==", userId)
          );
        } else if (mode === "liked") {
          // Fetch only the logged-in user's liked categories
          setCategories(likedCategories);
          return;
        } else if (mode === "likedByUser" && userId) {
          // Fetch another user's liked categories
          const userDocRef = doc(db, "users", userId);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const likedCategoryIds = userSnapshot.data().likedCategories || [];
            const likedQuery = query(
              collection(db, "categories"),
              where("__name__", "in", likedCategoryIds)
            );
            const likedSnapshot = await getDocs(likedQuery);
            categoryList = likedSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              tagNames: (doc.data().tags || []).map(
                (tagId) => tagMap[tagId] || "Unknown"
              ),
            }));
          }
        } else {
          // Fetch all public categories + those visible to the user
          q = collection(db, "categories");
        }

        if (q) {
          const querySnapshot = await getDocs(q);
          categoryList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            tagNames: (doc.data().tags || []).map(
              (tagId) => tagMap[tagId] || "Unknown"
            ),
          }));
        }

        // Filter by privacy
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
  mode: PropTypes.oneOf(["own", "user", "liked", "likedByUser", "all"]),
  userId: PropTypes.string,
};

export default CategoryCollection;
