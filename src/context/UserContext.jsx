import { createContext, useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import PropTypes from "prop-types";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userCache, setUserCache] = useState(new Map()); // Stores user data
  const [subscriptions, setSubscriptions] = useState(new Map()); // Stores Firestore listeners

  /**
   * Fetches a user by username.
   * - Uses cache for efficiency.
   * - Sets up real-time Firestore listener if not already active.
   */
  const getUserByUsername = async (username) => {
    if (!username) return null;

    // ✅ Step 1: Check cache first (O(1) lookup)
    if (userCache.has(username)) {
      return userCache.get(username);
    }

    try {
      // 🔹 Step 2: Query Firestore for the user by username
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();

        const userObj = {
          id: userId,
          name: userData.name,
          username: userData.username,
        };

        // ✅ Step 3: Store in cache
        setUserCache((prevCache) => new Map(prevCache).set(userId, userObj));

        // ✅ Step 4: Prevent duplicate listeners
        if (subscriptions.has(userId)) {
          return userObj;
        }

        // 🔹 Step 5: Set up real-time listener (only once per userId)
        const unsubscribe = onSnapshot(doc(db, "users", userId), (docSnap) => {
          if (docSnap.exists()) {
            const updatedUser = { id: userId, ...docSnap.data() };

            // ✅ Update cache
            setUserCache((prevCache) => {
              const newCache = new Map(prevCache);
              newCache.set(userId, updatedUser);
              return newCache;
            });
          }
        });

        // ✅ Store the unsubscribe function (prevent memory leaks)
        setSubscriptions((prevSubs) => {
          const newSubs = new Map(prevSubs);
          newSubs.set(userId, unsubscribe);
          return newSubs;
        });

        return userObj;
      }
    } catch (error) {
      console.error("Error fetching user by username:", error);
    }

    return null;
  };

  /**
   * Cleanup all Firestore listeners on unmount.
   */
  useEffect(() => {
    return () => {
      subscriptions.forEach((unsubscribe, userId) => {
        unsubscribe();
        subscriptions.delete(userId);
      });
    };
  }, [subscriptions]);

  return (
    <UserContext.Provider value={{ getUserByUsername }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
