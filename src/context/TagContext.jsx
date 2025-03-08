import { createContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import PropTypes from "prop-types";

export const TagContext = createContext(null);

export const TagProvider = ({ children }) => {
  const [tagMap, setTagMap] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "tags"),
      (snapshot) => {
        const tags = snapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().name.trim().toLowerCase();
          return acc;
        }, {});
        setTagMap(tags);
      },
      (error) => {
        console.error("Error fetching tags:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  return <TagContext.Provider value={tagMap}>{children}</TagContext.Provider>;
};

TagProvider.propTypes = {
  children: PropTypes.node.isRequired, // Ensures `children` is a valid React node
};
