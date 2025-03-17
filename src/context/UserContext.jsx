import { createContext, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import PropTypes from "prop-types";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userCache, setUserCache] = useState(new Map());

  const getUserByUsername = async (username) => {
    if (userCache.has(username)) {
      return userCache.get(username);
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      const userId = querySnapshot.docs[0].id;

      const userObj = { id: userId, ...userData };
      setUserCache((prev) => new Map(prev).set(username, userObj));

      return userObj;
    }

    return null;
  };

  return (
    <UserContext.Provider value={{ getUserByUsername }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
