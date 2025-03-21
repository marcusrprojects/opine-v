import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { USER_PRIVACY } from "../constants/privacy";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDocRef = doc(db, "users", authUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            name: userData.name,
            username: userData.username,
            authMethod: userData.authMethod,
            creatorPrivacy: userData.creatorPrivacy || USER_PRIVACY.PUBLIC,
            followers: userData.followers || [],
            following: userData.following || [],
            pendingFollowRequests: userData.pendingFollowRequests || [],
          });
        } else {
          setUser(authUser);
        }
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  // Logout function
  const logout = async (navigate) => {
    try {
      await signOut(auth);
      setUser(null);
      if (navigate) navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
