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
  const [userCache, setUserCache] = useState(new Map());
  const [subscriptions, setSubscriptions] = useState(new Map()); // ✅ Store Firestore listeners

  const getUserByUsername = async (username) => {
    if (userCache.has(username)) {
      return userCache.get(username);
    }

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

      setUserCache((prev) => new Map(prev).set(username, userObj));

      // ✅ If already subscribed, clean up old subscription before creating a new one
      if (subscriptions.has(userId)) {
        subscriptions.get(userId)(); // Unsubscribe previous listener
      }

      // ✅ Subscribe to real-time updates
      const unsubscribe = onSnapshot(doc(db, "users", userId), (docSnap) => {
        if (docSnap.exists()) {
          const updatedUser = { id: userId, ...docSnap.data() };
          setUserCache((prev) => new Map(prev).set(username, updatedUser));
        }
      });

      setSubscriptions((prev) => new Map(prev).set(userId, unsubscribe));

      return userObj;
    }

    return null;
  };

  // ✅ Clean up all Firestore listeners when UserProvider unmounts
  useEffect(() => {
    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
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
