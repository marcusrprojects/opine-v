import { createContext, useState } from "react";
import PropTypes from "prop-types";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const UserCacheContext = createContext();

export const UserCacheProvider = ({ children }) => {
  // A simple object mapping user IDs to user data.
  const [userCache, setUserCache] = useState({});

  // Asynchronously fetch and cache a user's data.
  const fetchAndCacheUser = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        setUserCache((prev) => ({ ...prev, [userId]: data }));
      }
    } catch (error) {
      console.error("Error fetching user", userId, error);
    }
  };

  /**
   * getUsername synchronously returns a cached username if available.
   * If not, it triggers an async fetch (whose result will update the cache)
   * and returns null.
   */
  const getUsername = (userId) => {
    if (!userId) return null;
    if (userCache[userId] && userCache[userId].username) {
      return userCache[userId].username;
    } else {
      // Trigger an asynchronous fetch; the state update will cause re-render.
      fetchAndCacheUser(userId);
      return null;
    }
  };

  return (
    <UserCacheContext.Provider value={{ getUsername, userCache }}>
      {children}
    </UserCacheContext.Provider>
  );
};

UserCacheProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserCacheContext;
