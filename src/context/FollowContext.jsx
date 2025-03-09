import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth } from "./useAuth";
import { db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(new Set());

  // Fetch following list when user changes
  useEffect(() => {
    if (!user) {
      setFollowing(new Set());
      return;
    }

    const fetchFollowing = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          setFollowing(new Set(userSnapshot.data().following || []));
        }
      } catch (error) {
        console.error("Error fetching following list:", error);
      }
    };

    fetchFollowing();
  }, [user]);

  const toggleFollow = async (targetUserId) => {
    if (!user) {
      alert("Log in to follow users.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const isFollowing = following.has(targetUserId);
      const updatedFollowing = new Set(following);

      if (isFollowing) {
        updatedFollowing.delete(targetUserId);
        await updateDoc(userDocRef, { following: arrayRemove(targetUserId) });
      } else {
        updatedFollowing.add(targetUserId);
        await updateDoc(userDocRef, { following: arrayUnion(targetUserId) });
      }

      setFollowing(updatedFollowing);
    } catch (error) {
      console.error("Error updating following list:", error);
    }
  };

  return (
    <FollowContext.Provider value={{ following, toggleFollow }}>
      {children}
    </FollowContext.Provider>
  );
};

FollowProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
