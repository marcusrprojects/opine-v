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
import { useTagMap } from "../context/useTagMap"; // Efficient tag lookup
import CategoryList from "./CategoryList";
import "../styles/Profile.css";

const CategoryCollection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCategories, setMyCategories] = useState([]);
  const [likedCategories, setLikedCategories] = useState([]);
  const tagMap = useTagMap();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 🔹 Fetch My Categories in bulk
        const categoryQuery = query(
          collection(db, "categories"),
          where("createdBy", "==", user.uid)
        );
        const categorySnapshot = await getDocs(categoryQuery);
        setMyCategories(
          categorySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            tagNames: (doc.data().tags || []).map(
              (tagId) => tagMap[tagId] || "Unknown"
            ),
          }))
        );

        // Fetch Liked Categories Efficiently
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const likedIds = userSnapshot.data().likedCategories || [];
          if (likedIds.length > 0) {
            const likedQuery = query(
              collection(db, "categories"),
              where("__name__", "in", likedIds)
            );
            const likedSnapshot = await getDocs(likedQuery);
            setLikedCategories(
              likedSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                tagNames: (doc.data().tags || []).map(
                  (tagId) => tagMap[tagId] || "Unknown"
                ), // ✅ Use tag map
              }))
            );
          } else {
            setLikedCategories([]);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, [user, tagMap]);

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

      // 🔹 Update UI Instantly Instead of Waiting for Refresh
      setLikedCategories((prevLiked) =>
        isLiked
          ? prevLiked.filter((cat) => cat.id !== categoryId)
          : [...prevLiked, myCategories.find((cat) => cat.id === categoryId)]
      );
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="profile-categories-container">
      <h2>My Categories</h2>
      <CategoryList
        categories={myCategories}
        onCategoryClick={handleCategoryClick}
        onLike={toggleLike}
        likedCategories={likedCategories}
      />
    </div>
  );
};

export default CategoryCollection;
