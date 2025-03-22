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
import { USER_PRIVACY, CATEGORY_PRIVACY } from "../constants/privacy";
import "../styles/CategoryCollection.css";
import { getVisibleCategoriesForUser } from "../utils/privacyUtils"; // our helper function
import SortOptions from "../enums/SortOptions";

const CategoryCollection = ({
  mode,
  userId,
  searchTerm = "",
  sortOption = SortOptions.UPDATED_DESC,
}) => {
  const { user } = useAuth();
  const { following } = useFollow();
  const { likedCategories = [], toggleLikeCategory } = useLikedCategories();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState(new Set());

  // Fetch tags once on mount
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

  // Refactored function for fetching categories based on privacy
  const fetchCategories = useCallback(async () => {
    try {
      // ✅ Handle early exits for empty `likedCategories`
      if (
        (mode === "liked" || mode === "recommended") &&
        !likedCategories.length
      ) {
        setCategories([]);
        return;
      }
      // For modes that fetch by a specific creator, use our helper
      if (mode === "own") {
        const categories = await getVisibleCategoriesForUser(
          user.uid,
          user.uid
        );
        setCategories(categories);
        return;
      } else if (mode === "user" && userId) {
        const categories = await getVisibleCategoriesForUser(
          userId,
          user ? user.uid : null
        );
        setCategories(categories);
        return;
      }

      // For other modes, we query the entire collection and filter later.
      let categoryQuery = collection(db, "categories");

      if (mode === "liked") {
        categoryQuery = query(
          categoryQuery,
          where("__name__", "in", likedCategories)
        );
      } else if (mode === "likedByUser" && userId) {
        const userDocRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDocRef);
        const likedCategoryIds = userSnapshot.exists()
          ? userSnapshot.data().likedCategories ?? []
          : [];
        if (!likedCategoryIds.length) {
          setCategories([]);
          return;
        }
        categoryQuery = query(
          categoryQuery,
          where("__name__", "in", likedCategoryIds)
        );
      } else if (mode === "recommended") {
        // Pick random liked categories
        const randomLiked = likedCategories
          .sort(() => 0.5 - Math.random())
          .slice(0, 10);
        const likedSnapshot = await getDocs(
          query(categoryQuery, where("__name__", "in", randomLiked))
        );

        const tagFrequency = {};
        likedSnapshot.docs.forEach((docSnap) => {
          (docSnap.data().tags ?? []).forEach((tag) => {
            if (availableTags.has(tag)) {
              tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            }
          });
        });
        const sortedTags = Object.entries(tagFrequency)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([tag]) => tag);
        if (!sortedTags.length) {
          setCategories([]);
          return;
        }
        categoryQuery = query(
          categoryQuery,
          where("tags", "array-contains-any", sortedTags),
          limit(5)
        );
      } else if (mode === "popular") {
        categoryQuery = query(
          categoryQuery,
          orderBy("likeCount", "desc"),
          limit(5)
        );
      } else {
        // Default sorting for "all" and fallback cases
        categoryQuery = query(categoryQuery, orderBy("updatedAt", "desc"));
      }

      const snapshot = await getDocs(categoryQuery);
      let categoryList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Fallback for recommended mode if no categories found
      if (mode === "recommended" && !categoryList.length) {
        console.warn(
          "No recommended categories found. Falling back to recent updates."
        );
        const fallbackQuery = query(
          collection(db, "categories"),
          orderBy("updatedAt", "desc"),
          limit(5)
        );
        const recentSnapshot = await getDocs(fallbackQuery);
        categoryList = recentSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
      }

      // Apply privacy filters based on our new system
      const filteredCategories = categoryList.filter((category) => {
        // Always allow if the viewer is the creator
        if (user && category.createdBy === user.uid) return true;

        // For categories created by public accounts:
        if (category.creatorPrivacy === USER_PRIVACY.PUBLIC) {
          // Show category if it is not marked "only-me"
          return category.categoryPrivacy !== CATEGORY_PRIVACY.ONLY_ME;
        }

        // For categories from private accounts:
        if (category.creatorPrivacy === USER_PRIVACY.PRIVATE) {
          // Only show if viewer is following the creator
          return user && following && following.has(category.createdBy);
        }
        return false;
      });

      setCategories(filteredCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, [availableTags, mode, likedCategories, user, userId, following]);

  // Fetch categories on dependency changes
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Search optimization using useMemo
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const searchLower = searchTerm.toLowerCase();
    return categories.filter((category) => {
      const nameMatches = category.name.toLowerCase().includes(searchLower);
      const tagMatches = (category.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(searchLower)
      );
      return nameMatches || tagMatches;
    });
  }, [searchTerm, categories]);

  const handleCategoryClick = useCallback(
    (categoryId) => navigate(`/categories/${categoryId}`),
    [navigate]
  );

  const handleLike = useCallback(
    (categoryId) => {
      if (!user) {
        navigate("/login");
        return;
      }
      toggleLikeCategory(categoryId);
    },
    [user, navigate, toggleLikeCategory]
  );

  const sortedCategories = useMemo(() => {
    const compare = {
      [SortOptions.UPDATED_DESC]: (a, b) =>
        b.updatedAt?.seconds - a.updatedAt?.seconds,
      [SortOptions.UPDATED_ASC]: (a, b) =>
        a.updatedAt?.seconds - b.updatedAt?.seconds,
      [SortOptions.ALPHA_ASC]: (a, b) => a.name.localeCompare(b.name),
      [SortOptions.ALPHA_DESC]: (a, b) => b.name.localeCompare(a.name),
      [SortOptions.MOST_LIKED]: (a, b) =>
        (b.likeCount || 0) - (a.likeCount || 0),
    }[sortOption];

    return [...filteredCategories].sort(compare);
  }, [filteredCategories, sortOption]);

  return (
    <>
      {filteredCategories.length === 0 ? (
        mode === "recommended" ? (
          <p>
            No recommendations yet. Try liking some categories to get
            personalized suggestions!
          </p>
        ) : mode === "likedByUser" || mode === "liked" ? (
          <p>No liked categories yet.</p>
        ) : (
          <p>No categories yet.</p>
        )
      ) : (
        <CategoryList
          categories={sortedCategories}
          onCategoryClick={handleCategoryClick}
          onLike={handleLike}
          likedCategories={likedCategories}
        />
      )}
    </>
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
    "popular",
  ]),
  userId: PropTypes.string,
  searchTerm: PropTypes.string,
  sortOption: PropTypes.oneOf(Object.values(SortOptions)),
};

export default CategoryCollection;
