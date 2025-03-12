import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTagMap } from "../context/useTagMap";
import { useLikedCategories } from "../context/useLikedCategories";
import { useFollow } from "../context/useFollow";
import CategoryList from "./CategoryList";
import { PRIVACY_LEVELS } from "../constants/privacy";
import PropTypes from "prop-types";

const CategoryCollection = ({ mode = "own", userId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tagMap = useTagMap();
  const { likedCategories, toggleLikeCategory } = useLikedCategories();
  const { following } = useFollow();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!user && mode !== "all") return; // Non-logged users can only see public categories

    const fetchCategories = async () => {
      try {
        let q;
        let categoryList = [];

        if (mode === "own") {
          // Fetch categories created by the logged-in user
          q = query(
            collection(db, "categories"),
            where("createdBy", "==", user.uid)
          );
        } else if (mode === "user" && userId) {
          // Fetch categories created by a specific user
          q = query(
            collection(db, "categories"),
            where("createdBy", "==", userId)
          );
        } else if (mode === "liked") {
          // Fetch only the logged-in user's liked categories
          setCategories(likedCategories);
          return;
        } else if (mode === "likedByUser" && userId) {
          // Fetch another user's liked categories
          const userDocRef = doc(db, "users", userId);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const likedCategoryIds = userSnapshot.data().likedCategories || [];
            const likedQuery = query(
              collection(db, "categories"),
              where("__name__", "in", likedCategoryIds)
            );
            const likedSnapshot = await getDocs(likedQuery);
            categoryList = likedSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              tagNames: (doc.data().tags || []).map(
                (tagId) => tagMap[tagId] || "Unknown"
              ),
            }));
          }
        } else if (mode === "recommended") {
          if (!likedCategories || likedCategories.length === 0) {
            console.warn("No liked categories available for recommendations.");
            setCategories([]);
            return;
          }

          // Step 1: Get a random subset of liked categories
          const randomLikedCategories = likedCategories
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 10); // Process only 10

          const likedQuery = query(
            collection(db, "categories"),
            where("__name__", "in", randomLikedCategories)
          );
          const likedSnapshot = await getDocs(likedQuery);

          // Step 2: Extract tags and count frequencies
          const tagFrequency = {};
          likedSnapshot.docs.forEach((doc) => {
            const categoryData = doc.data();
            if (categoryData.tags) {
              categoryData.tags.forEach((tagId) => {
                tagFrequency[tagId] = (tagFrequency[tagId] || 0) + 1;
              });
            }
          });

          // Step 3: Select tags based on frequency
          const sortedTags = Object.entries(tagFrequency)
            .sort((a, b) => b[1] - a[1]) // Sort by highest frequency
            .slice(0, 3) // Keep only top 3 tags
            .map(([tagId]) => tagId);

          if (sortedTags.length === 0) {
            console.warn("No strong tag matches for recommendations.");
            setCategories([]);
            return;
          }

          // Step 4: Query for categories matching these tags
          q = query(
            collection(db, "categories"),
            where("tags", "array-contains-any", sortedTags)
          );

          const recommendedSnapshot = await getDocs(q);
          let recommendedCategories = recommendedSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            tagNames: (doc.data().tags || []).map(
              (tagId) => tagMap[tagId] || "Unknown"
            ),
          }));

          // Step 5: Shuffle results to add diversity
          recommendedCategories = recommendedCategories
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

          // Step 6: If we have no results, fall back to recently updated boards
          if (recommendedCategories.length === 0) {
            console.warn(
              "No recommended categories found. Falling back to recently updated."
            );
            q = query(
              collection(db, "categories"),
              orderBy("updatedAt", "desc"),
              limit(5)
            );
            const recentSnapshot = await getDocs(q);
            recommendedCategories = recentSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              tagNames: (doc.data().tags || []).map(
                (tagId) => tagMap[tagId] || "Unknown"
              ),
            }));
          }

          setCategories(recommendedCategories);
        } else if (mode === "trending") {
          // Get the most liked or active categories (future improvement)
          q = query(
            collection(db, "categories"),
            orderBy("likeCount", "desc"),
            limit(5)
          );
        } else {
          // Fetch all public categories + those visible to the user
          q = collection(db, "categories");
        }

        if (q) {
          const querySnapshot = await getDocs(q);
          categoryList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            tagNames: (doc.data().tags || []).map(
              (tagId) => tagMap[tagId] || "Unknown"
            ),
          }));
        }

        // Filter by privacy
        const filteredCategories = categoryList.filter((category) => {
          if (category.privacy === PRIVACY_LEVELS.PUBLIC) return true;
          return (
            user &&
            (category.createdBy === user.uid ||
              following.has(category.createdBy))
          );
        });

        setCategories(filteredCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [user, userId, mode, tagMap, following, likedCategories]);

  const handleLike = (categoryId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleLikeCategory(categoryId);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="category-collection-container">
      <CategoryList
        categories={categories}
        onCategoryClick={handleCategoryClick}
        onLike={handleLike}
        likedCategories={likedCategories}
      />
    </div>
  );
};

CategoryCollection.propTypes = {
  mode: PropTypes.oneOf([
    "own",
    "user",
    "liked",
    "likedByUser",
    "all",
    "recommended",
    "trending",
  ]),
  userId: PropTypes.string,
};

export default CategoryCollection;
