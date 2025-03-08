import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const useTagMap = () => {
  const [tagMap, setTagMap] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "tags"),
      (snapshot) => {
        const tags = snapshot.docs.reduce((acc, doc) => {
          // Normalize tag names for consistency.
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

  return tagMap;
};
