import { createContext, useState } from "react";
import PropTypes from "prop-types";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const UserCacheContext = createContext();

export const UserCacheProvider = ({ children }) => {
  // A simple object mapping user IDs to basic user info (username and name).
  const [userCache, setUserCache] = useState({});

  // Asynchronously fetch and cache a user's basic info.
  const fetchAndCacheUser = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        const userInfo = {
          username: data.username || "unknown",
          name: data.name || "Anonymous",
        };
        setUserCache((prev) => ({ ...prev, [userId]: userInfo }));
      }
    } catch (error) {
      console.error("Error fetching user", userId, error);
    }
  };

  /**
   * getUserInfo synchronously returns a cached object with the username and name for a given userId.
   * If not yet cached, it triggers an async fetch and returns null.
   */
  const getUserInfo = (userId) => {
    if (!userId) return null;
    if (userCache[userId] && userCache[userId].username) {
      return userCache[userId];
    } else {
      // Trigger an asynchronous fetch; the state update will cause re-render.
      fetchAndCacheUser(userId);
      return null;
    }
  };

  return (
    <UserCacheContext.Provider value={{ getUserInfo, userCache }}>
      {children}
    </UserCacheContext.Provider>
  );
};

UserCacheProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserCacheContext;
