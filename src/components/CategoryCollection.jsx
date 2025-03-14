import { useEffect, useState, useMemo, useCallback } from "react";
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
import PropTypes from "prop-types";
import { fetchTagsSet } from "../utils/tagUtils";
import CategoryList from "./CategoryList";
import { useAuth } from "../context/useAuth";
import { useFollow } from "../context/useFollow";
import { useLikedCategories } from "../context/useLikedCategories";
import { useNavigate } from "react-router-dom";
import { PRIVACY_LEVELS } from "../constants/privacy";

const CategoryCollection = ({ mode, userId, searchTerm }) => {
  const { user } = useAuth();
  const { following } = useFollow();
  const { likedCategories, toggleLikeCategory } = useLikedCategories();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState(new Set());

  // ✅ Fetch tags from Firestore once on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagSet = await fetchTagsSet();
        setAvailableTags(tagSet);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    loadTags();
  }, []);

  // ✅ Memoized function for fetching categories
  const fetchCategories = useCallback(async () => {
    if (!user && mode !== "all") return;

    try {
      let categoryQuery = collection(db, "categories");

      if (mode === "own") {
        categoryQuery = query(
          categoryQuery,
          where("createdBy", "==", user.uid)
        );
      } else if (mode === "user" && userId) {
        categoryQuery = query(categoryQuery, where("createdBy", "==", userId));
      } else if (mode === "liked") {
        setCategories(likedCategories);
        return;
      } else if (mode === "likedByUser" && userId) {
        const userDocRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const likedCategoryIds = userSnapshot.data().likedCategories || [];
          categoryQuery = query(
            categoryQuery,
            where("__name__", "in", likedCategoryIds)
          );
        }
      } else if (mode === "recommended") {
        if (!likedCategories || likedCategories.length === 0) {
          console.warn("No liked categories available for recommendations.");
          setCategories([]);
          return;
        }

        const randomLikedCategories = likedCategories
          .sort(() => 0.5 - Math.random())
          .slice(0, 10);

        categoryQuery = query(
          categoryQuery,
          where("__name__", "in", randomLikedCategories)
        );

        const likedSnapshot = await getDocs(categoryQuery);
        const tagFrequency = {};
        likedSnapshot.docs.forEach((doc) => {
          const categoryData = doc.data();
          if (categoryData.tags) {
            categoryData.tags.forEach((tag) => {
              if (availableTags.has(tag)) {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
              }
            });
          }
        });

        const sortedTags = Object.entries(tagFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([tag]) => tag);

        if (sortedTags.length === 0) {
          console.warn("No strong tag matches for recommendations.");
          setCategories([]);
          return;
        }

        categoryQuery = query(
          categoryQuery,
          where("tags", "array-contains-any", sortedTags)
        );
      } else if (mode === "trending") {
        categoryQuery = query(
          categoryQuery,
          orderBy("likeCount", "desc"),
          limit(5)
        );
      }

      const categorySnapshot = await getDocs(categoryQuery);
      let categoryList = categorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        tagNames: (doc.data().tags || []).filter((tag) =>
          availableTags.has(tag)
        ),
      }));

      // 🛠️ Fallback for recommended categories
      if (mode === "recommended" && categoryList.length === 0) {
        console.warn(
          "No recommended categories found. Falling back to recently updated."
        );
        const fallbackQuery = query(
          collection(db, "categories"),
          orderBy("updatedAt", "desc"),
          limit(5)
        );
        const recentSnapshot = await getDocs(fallbackQuery);
        categoryList = recentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          tagNames: (doc.data().tags || []).filter((tag) =>
            availableTags.has(tag)
          ),
        }));
      }

      // ✅ Apply Privacy Filters
      const filteredCategories = categoryList.filter((category) => {
        if (category.privacy === PRIVACY_LEVELS.PUBLIC) return true;
        return user && following.has(category.createdBy);
      });

      setCategories(filteredCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, [availableTags, user, following, mode, userId, likedCategories]);

  // ✅ Fetch categories on dependencies change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ Search optimization using `useMemo`
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const searchLower = searchTerm.toLowerCase();
    return categories.filter((category) => {
      const nameMatches = category.name.toLowerCase().includes(searchLower);
      const tagMatches =
        category.tagNames &&
        category.tagNames.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
      return nameMatches || tagMatches;
    });
  }, [searchTerm, categories]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  const handleLike = (categoryId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleLikeCategory(categoryId);
  };

  return (
    <CategoryList
      categories={filteredCategories}
      onCategoryClick={handleCategoryClick}
      onLike={handleLike}
      likedCategories={likedCategories}
    />
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
  searchTerm: PropTypes.string,
};

export default CategoryCollection;
