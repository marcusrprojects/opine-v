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
import { UserPrivacy } from "../enums/PrivacyEnums";
import { FollowStatus } from "../enums/ModeEnums";

export const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(new Set());
  const [followRequests, setFollowRequests] = useState(new Set());

  // Fetch following and followRequests when user changes
  useEffect(() => {
    if (!user) {
      setFollowing(new Set());
      setFollowRequests(new Set());
      return;
    }

    const fetchFollowData = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          setFollowing(new Set(data.following || []));
          setFollowRequests(new Set(data.followRequests || []));
        }
      } catch (error) {
        console.error("Error fetching follow data:", error);
      }
    };

    fetchFollowData();
  }, [user]);

  const getFollowStatus = (targetUserId) => {
    if (following.has(targetUserId)) return FollowStatus.FOLLOWING;
    if (followRequests.has(targetUserId)) return FollowStatus.PENDING;
    return FollowStatus.NONE;
  };

  const toggleFollow = async (targetUserId) => {
    if (!user) {
      alert("Log in to follow users.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const targetUserDocRef = doc(db, "users", targetUserId);
      const targetSnapshot = await getDoc(targetUserDocRef);
      if (!targetSnapshot.exists()) return;

      const targetData = targetSnapshot.data();
      const status = getFollowStatus(targetUserId);

      if (status === FollowStatus.FOLLOWING) {
        // Unfollow
        const updated = new Set(following);
        updated.delete(targetUserId);
        setFollowing(updated);
        await updateDoc(userDocRef, { following: arrayRemove(targetUserId) });
        await updateDoc(targetUserDocRef, { followers: arrayRemove(user.uid) });
      } else if (status === FollowStatus.PENDING) {
        // Cancel request
        const updated = new Set(followRequests);
        updated.delete(targetUserId);
        setFollowRequests(updated);
        await updateDoc(targetUserDocRef, {
          followRequests: arrayRemove(user.uid),
        });
      } else {
        // Request or follow
        if (targetData.creatorPrivacy === UserPrivacy.PRIVATE) {
          const updated = new Set(followRequests);
          updated.add(targetUserId);
          setFollowRequests(updated);
          await updateDoc(targetUserDocRef, {
            followRequests: arrayUnion(user.uid),
          });
          alert("Follow request sent.");
        } else {
          const updated = new Set(following);
          updated.add(targetUserId);
          setFollowing(updated);
          await updateDoc(userDocRef, { following: arrayUnion(targetUserId) });
          await updateDoc(targetUserDocRef, {
            followers: arrayUnion(user.uid),
          });
        }
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  return (
    <FollowContext.Provider value={{ following, followRequests, toggleFollow }}>
      {children}
    </FollowContext.Provider>
  );
};

FollowProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
