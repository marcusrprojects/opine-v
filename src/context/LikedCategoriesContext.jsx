import { createContext, useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "./useAuth"; // Ensure user authentication is available
import PropTypes from "prop-types";

export const LikedCategoriesContext = createContext();

export const LikedCategoriesProvider = ({ children }) => {
  const { user } = useAuth();
  const [likedCategories, setLikedCategories] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchLikedCategories = async () => {
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

    fetchLikedCategories();
  }, [user]);

  const toggleLikeCategory = async (categoryId) => {
    if (!user) {
      alert("Log in to like categories.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const isLiked = likedCategories.includes(categoryId);
      const updatedLikes = isLiked
        ? likedCategories.filter((id) => id !== categoryId)
        : [...likedCategories, categoryId];

      await updateDoc(userDocRef, { likedCategories: updatedLikes });
      setLikedCategories(updatedLikes); // Instantly update local state
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  return (
    <LikedCategoriesContext.Provider
      value={{ likedCategories, toggleLikeCategory }}
    >
      {children}
    </LikedCategoriesContext.Provider>
  );
};

LikedCategoriesProvider.propTypes = {
  children: PropTypes.node.isRequired, // Ensures `children` is a valid React node
};
