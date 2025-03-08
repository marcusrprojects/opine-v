import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { db } from "../firebaseConfig";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "./useAuth";

const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(new Set());
  const [followers, setFollowers] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setFollowing(new Set());
      setFollowers(new Set());
      return;
    }

    const followingRef = collection(db, `users/${user.uid}/following`);
    const followersRef = collection(db, `users/${user.uid}/followers`);

    const unsubscribeFollowing = onSnapshot(followingRef, (snapshot) => {
      setFollowing(new Set(snapshot.docs.map((doc) => doc.id)));
    });

    const unsubscribeFollowers = onSnapshot(followersRef, (snapshot) => {
      setFollowers(new Set(snapshot.docs.map((doc) => doc.id)));
    });

    return () => {
      unsubscribeFollowing();
      unsubscribeFollowers();
    };
  }, [user]);

  const toggleFollow = async (targetUserId) => {
    if (!user) {
      alert("You must be logged in to follow users.");
      return;
    }

    const userFollowingRef = doc(
      db,
      `users/${user.uid}/following`,
      targetUserId
    );
    const targetFollowerRef = doc(
      db,
      `users/${targetUserId}/followers`,
      user.uid
    );

    try {
      if (following.has(targetUserId)) {
        await deleteDoc(userFollowingRef);
        await deleteDoc(targetFollowerRef);
      } else {
        await setDoc(userFollowingRef, { timestamp: Date.now() });
        await setDoc(targetFollowerRef, { timestamp: Date.now() });
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  return (
    <FollowContext.Provider value={{ following, followers, toggleFollow }}>
      {children}
    </FollowContext.Provider>
  );
};

FollowProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
