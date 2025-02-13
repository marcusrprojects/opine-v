import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AddPanel from "../components/Navigation/AddPanel";
import { useAuth } from "../context/useAuth";
import CategoryList from "./CategoryList";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [likedCategories, setLikedCategories] = useState([]);
  const [tagMap, setTagMap] = useState({}); // Store { tagId: tagName } mapping
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
          acc[doc.id] = doc.data().name; // Store tag name by ID
          return acc;
        }, {});
        setTagMap(tags);
      } catch (error) {
        console.error("Error fetching tags: ", error);
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
      fetchLikedCategories(); // Ensure liked categories are fetched first
    }

    fetchTags().then(fetchCategories); // Load categories after tags are set
  }, [user, tagMap]); // Depend only on `user`

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
      setLikedCategories(updatedLikes); // Immediately update UI after Firestore update
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  return (
    <div className="categories-container">
      <h2>Categories</h2>
      <CategoryList
        categories={categories}
        onCategoryClick={handleCategoryClick}
        onLike={toggleLike}
        likedCategories={likedCategories}
      />
      <AddPanel onAdd={() => navigate("/create-category")} />
    </div>
  );
};

export default Categories;
