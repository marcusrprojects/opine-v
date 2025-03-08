import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTagMap } from "../context/useTagMap";
import { useLikedCategories } from "../context/useLikedCategories"; // ✅ New Like Context
import CategoryList from "./CategoryList";
import "../styles/Profile.css";
import { db } from "../firebaseConfig";

const CategoryCollection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { likedCategories, toggleLikeCategory } = useLikedCategories(); // ✅ Use Like Context
  const [myCategories, setMyCategories] = useState([]);
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
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, [user, tagMap]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="profile-categories-container">
      <h2>My Categories</h2>
      <CategoryList
        categories={myCategories}
        onCategoryClick={handleCategoryClick}
        onLike={toggleLikeCategory} // ✅ Use context toggle function
        likedCategories={likedCategories} // ✅ Use context state
      />
    </div>
  );
};

export default CategoryCollection;
