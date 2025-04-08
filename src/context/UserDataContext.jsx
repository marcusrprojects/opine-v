import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { useAuth } from "./useAuth";
import { db } from "../firebaseConfig";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { UserPrivacy } from "../enums/PrivacyEnums";

const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const { user } = useAuth();

  // Default object with empty arrays for consistency with Firestore data.
  const defaultData = useMemo(
    () => ({
      following: [],
      pendingFollowing: [],
      followRequests: [],
      likedCategories: [],
    }),
    []
  );

  const [userData, setUserData] = useState(defaultData);

  useEffect(() => {
    if (!user) {
      setUserData(defaultData);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setUserData({
            ...data,
            following: data.following || [],
            pendingFollowing: data.pendingFollowing || [],
            followRequests: data.followRequests || [],
            likedCategories: data.likedCategories || [],
          });
        }
      },
      (error) => console.error("Error fetching user data:", error)
    );

    return () => unsubscribe();
  }, [user, defaultData]);

  // Helper functions using array methods.
  const isFollowing = useCallback(
    (targetUserId) => userData.following.includes(targetUserId),
    [userData.following]
  );
  const isPending = useCallback(
    (targetUserId) => userData.pendingFollowing.includes(targetUserId),
    [userData.pendingFollowing]
  );
  const hasRequestedFollow = useCallback(
    (targetUserId) => userData.followRequests.includes(targetUserId),
    [userData.followRequests]
  );
  const hasLikedCategory = useCallback(
    (categoryId) => userData.likedCategories.includes(categoryId),
    [userData.likedCategories]
  );

  // Toggle follow/unfollow functionality.
  const toggleFollow = useCallback(
    async (targetUserId) => {
      if (!user || !userData) {
        alert("Log in to follow users.");
        return;
      }
      try {
        const currentUserDocRef = doc(db, "users", user.uid);
        const targetUserDocRef = doc(db, "users", targetUserId);
        const targetSnapshot = await getDoc(targetUserDocRef);
        if (!targetSnapshot.exists()) return;
        const targetData = targetSnapshot.data();

        if (isFollowing(targetUserId)) {
          // Unfollow: remove from following and remove current user from target's followers.
          await updateDoc(currentUserDocRef, {
            following: arrayRemove(targetUserId),
          });
          await updateDoc(targetUserDocRef, {
            followers: arrayRemove(user.uid),
          });
        } else if (isPending(targetUserId)) {
          // Cancel pending follow: remove from pendingFollowing and from target's followRequests.
          await updateDoc(currentUserDocRef, {
            pendingFollowing: arrayRemove(targetUserId),
          });
          await updateDoc(targetUserDocRef, {
            followRequests: arrayRemove(user.uid),
          });
        } else {
          // Follow: for private users, add to pendingFollowing and target's followRequests.
          // For public users, add directly to following and target's followers.
          if (targetData.creatorPrivacy === UserPrivacy.PRIVATE) {
            await updateDoc(currentUserDocRef, {
              pendingFollowing: arrayUnion(targetUserId),
            });
            await updateDoc(targetUserDocRef, {
              followRequests: arrayUnion(user.uid),
            });
          } else {
            await updateDoc(currentUserDocRef, {
              following: arrayUnion(targetUserId),
            });
            await updateDoc(targetUserDocRef, {
              followers: arrayUnion(user.uid),
            });
          }
        }
      } catch (error) {
        console.error("Error toggling follow:", error);
      }
    },
    [user, userData, isFollowing, isPending]
  );

  // Toggle like/unlike for a category.
  const toggleLikeCategory = useCallback(
    async (categoryId) => {
      if (!user || !userData) {
        alert("Log in to like categories.");
        return;
      }
      try {
        const userDocRef = doc(db, "users", user.uid);
        if (hasLikedCategory(categoryId)) {
          await updateDoc(userDocRef, {
            likedCategories: arrayRemove(categoryId),
          });
        } else {
          await updateDoc(userDocRef, {
            likedCategories: arrayUnion(categoryId),
          });
        }
      } catch (error) {
        console.error("Error toggling liked category:", error);
      }
    },
    [user, userData, hasLikedCategory]
  );

  // Memoize context value to minimize unnecessary re-renders.
  const contextValue = useMemo(
    () => ({
      userData,
      isFollowing,
      isPending,
      hasRequestedFollow,
      hasLikedCategory,
      toggleFollow,
      toggleLikeCategory,
    }),
    [
      hasLikedCategory,
      hasRequestedFollow,
      isFollowing,
      isPending,
      toggleFollow,
      toggleLikeCategory,
      userData,
    ]
  );

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

UserDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserDataContext;
