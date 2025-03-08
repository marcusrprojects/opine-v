import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTagMap } from "../context/useTagMap";
import CategoryList from "./CategoryList";
import "../styles/Profile.css";

const CategoryCollection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCategories, setMyCategories] = useState([]);
  const [likedCategories, setLikedCategories] = useState([]);
  const tagMap = useTagMap();

  // Fetch categories created by the user ("My Categories")
  useEffect(() => {
    if (!user) return;
    const fetchMyCategories = async () => {
      try {
        const q = query(
          collection(db, "categories"),
          where("createdBy", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const userCategories = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            tagNames: (data.tags || []).map(
              (tagId) => tagMap[tagId] || "Unknown"
            ),
          };
        });
        setMyCategories(userCategories);
      } catch (error) {
        console.error("Error fetching user categories:", error);
      }
    };
    fetchMyCategories();
  }, [user, tagMap]);

  // Fetch liked categories for the user
  useEffect(() => {
    if (!user) return;
    const fetchLikedCategories = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const likedIds = userSnapshot.data().likedCategories || [];
          const likedPromises = likedIds.map(async (catId) => {
            const catDoc = await getDoc(doc(db, "categories", catId));
            return catDoc.exists()
              ? {
                  id: catDoc.id,
                  ...catDoc.data(),
                  tagNames: (catDoc.data().tags || []).map(
                    (tagId) => tagMap[tagId] || "Unknown"
                  ),
                }
              : null;
          });
          const likedResults = await Promise.all(likedPromises);
          setLikedCategories(likedResults.filter((cat) => cat !== null));
        }
      } catch (error) {
        console.error("Error fetching liked categories:", error);
      }
    };
    fetchLikedCategories();
  }, [user, tagMap]);

  // Toggle like for a category and refresh liked categories
  const toggleLike = async (categoryId) => {
    if (!user) {
      alert("Log in to like categories.");
      return;
    }
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);
      let currentLikes = userSnapshot.exists()
        ? userSnapshot.data().likedCategories || []
        : [];
      const isLiked = currentLikes.includes(categoryId);
      const updatedLikes = isLiked
        ? currentLikes.filter((id) => id !== categoryId)
        : [...currentLikes, categoryId];

      await updateDoc(userDocRef, { likedCategories: updatedLikes });

      // Refresh liked categories:
      const refreshLiked = async () => {
        const updatedSnapshot = await getDoc(userDocRef);
        if (updatedSnapshot.exists()) {
          const likedIds = updatedSnapshot.data().likedCategories || [];
          const likedPromises = likedIds.map(async (catId) => {
            const catDoc = await getDoc(doc(db, "categories", catId));
            return catDoc.exists()
              ? {
                  id: catDoc.id,
                  ...catDoc.data(),
                  tagNames: (catDoc.data().tags || []).map(
                    (tagId) => tagMap[tagId] || "Unknown"
                  ), // ✅ Use tagMap
                }
              : null;
          });
          const likedResults = await Promise.all(likedPromises);
          setLikedCategories(likedResults.filter((cat) => cat !== null));
        }
      };
      refreshLiked();
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  // Navigate to category detail page when a category is clicked
  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="profile-categories-container">
      {/* <h2>Liked Categories</h2>
      <CategoryList
        categories={likedCategories.map((cat) => ({ ...cat, isLiked: true }))}
        onCategoryClick={handleCategoryClick}
        onLike={toggleLike}
        likedCategories={likedCategories}
      /> */}

      <h2>My Categories</h2>
      <CategoryList
        categories={myCategories.map((cat) => ({ ...cat, isLiked: false }))}
        onCategoryClick={handleCategoryClick}
        onLike={toggleLike}
        likedCategories={[]} // Not needed for "My Categories"
      />
    </div>
  );
};

export default CategoryCollection;
