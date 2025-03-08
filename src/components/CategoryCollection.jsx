import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTagMap } from "../context/useTagMap";
import { useLikedCategories } from "../context/useLikedCategories"; // ✅ Import like context
import CategoryList from "./CategoryList";
// import "../styles/Profile.css";

const CategoryCollection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myCategories, setMyCategories] = useState([]);
  const tagMap = useTagMap();
  const { likedCategories, toggleLikeCategory } = useLikedCategories();

  useEffect(() => {
    if (!user) return;

    const fetchMyCategories = async () => {
      try {
        const q = query(
          collection(db, "categories"),
          where("createdBy", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        setMyCategories(
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            tagNames: (doc.data().tags || []).map(
              (tagId) => tagMap[tagId] || "Unknown"
            ),
          }))
        );
      } catch (error) {
        console.error("Error fetching user categories:", error);
      }
    };
    fetchMyCategories();
  }, [user, tagMap]);

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
