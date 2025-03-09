/**
 * note that this component is intended to be used in flexible manners. therefore, it performs tasks of considering privacy
 * levels and whether a user may like a category or not. however, in its current use, the component only displays the
 * user's categories.
 */

import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTagMap } from "../context/useTagMap";
import { useLikedCategories } from "../context/useLikedCategories"; // ✅ Import like context
import CategoryList from "./CategoryList";
// import "../styles/Profile.css";
import { useFollow } from "../context/useFollow";
import { PRIVACY_LEVELS } from "../constants/privacy";

const CategoryCollection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCategories, setMyCategories] = useState([]);
  const tagMap = useTagMap();
  const { likedCategories, toggleLikeCategory } = useLikedCategories();
  const { following } = useFollow();

  useEffect(() => {
    if (!user) return;

    const fetchMyCategories = async () => {
      try {
        const q = query(
          collection(db, "categories"),
          where("createdBy", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);

        const categoryList = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              tagNames: (data.tags || []).map(
                (tagId) => tagMap[tagId] || "Unknown"
              ),
            };
          })
          .filter((category) => {
            if (category.privacy === PRIVACY_LEVELS.PUBLIC) return true;
            return (
              category.createdBy === user.uid ||
              following.has(category.createdBy)
            );
          });

        setMyCategories(categoryList);
      } catch (error) {
        console.error("Error fetching user categories:", error);
      }
    };

    fetchMyCategories();
  }, [user, tagMap, following]);

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
    <div className="profile-categories-container">
      {/* <h2>My Categories</h2> */}
      <CategoryList
        categories={myCategories}
        onCategoryClick={handleCategoryClick}
        onLike={handleLike}
        likedCategories={likedCategories}
      />
    </div>
  );
};

export default CategoryCollection;
