import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { useAuth } from "./useAuth";

export const LikedCategoriesContext = createContext();

export const LikedCategoriesProvider = ({ children }) => {
  const [likedCategories, setLikedCategories] = useState([]);
  const { user } = useAuth();

  // 🔹 Fetch Liked Categories on User Change
  useEffect(() => {
    const fetchLikedCategories = async () => {
      if (!user) {
        setLikedCategories([]);
        return;
      }
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          setLikedCategories(userSnapshot.data().likedCategories || []);
        }
      } catch (error) {
        console.error("Error fetching liked categories:", error);
      }
    };

    fetchLikedCategories();
  }, [user]);

  // 🔹 Toggle Like Category (Now updates Firestore `likeCount`)
  const toggleLikeCategory = async (categoryId) => {
    if (!user) {
      alert("Log in to like categories.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const categoryDocRef = doc(db, "categories", categoryId);
      const isLiked = likedCategories.includes(categoryId);

      // Update Firestore: Add/Remove like from user's liked categories
      await updateDoc(userDocRef, {
        likedCategories: isLiked
          ? arrayRemove(categoryId)
          : arrayUnion(categoryId),
      });

      // Update Firestore: Increment/Decrement `likeCount` on category
      await updateDoc(categoryDocRef, {
        likeCount: isLiked ? increment(-1) : increment(1),
      });

      // Update local state for UI
      setLikedCategories((prev) =>
        isLiked ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
      );
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
  children: PropTypes.node.isRequired,
};
