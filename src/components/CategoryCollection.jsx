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
import { UserPrivacy, CategoryPrivacy } from "../enums/PrivacyEnums";
import "../styles/CategoryCollection.css";
import { getVisibleCategoriesForUser } from "../utils/privacyUtils"; // our helper function
import SortOptions from "../enums/SortOptions";
import { CategoryCollectionMode } from "../enums/ModeEnums";

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
      // ✅ Handle early exits efficiently.
      if (
        ((mode === CategoryCollectionMode.LIKED ||
          mode === CategoryCollectionMode.RECOMMENDED) &&
          likedCategories.length === 0) ||
        (mode === CategoryCollectionMode.FOLLOWING && following.size === 0) ||
        (!userId &&
          (mode === CategoryCollectionMode.USER ||
            mode === CategoryCollectionMode.LIKED_BY_USER))
      ) {
        setCategories([]);
        return;
      }

      // ✅ Handle direct user-based modes
      if (mode === CategoryCollectionMode.OWN) {
        setCategories(await getVisibleCategoriesForUser(user.uid, user.uid));
        return;
      }
      if (mode === CategoryCollectionMode.USER) {
        setCategories(
          await getVisibleCategoriesForUser(userId, user?.uid ?? null)
        );
        return;
      }

      // ✅ Construct Firestore Query
      let categoryQuery = collection(db, "categories");

      if (mode === CategoryCollectionMode.LIKED) {
        categoryQuery = query(
          categoryQuery,
          where("__name__", "in", likedCategories)
        );
      } else if (mode === CategoryCollectionMode.LIKED_BY_USER) {
        const userSnapshot = await getDoc(doc(db, "users", userId));
        const likedCategoryIds = userSnapshot.exists()
          ? userSnapshot.data().likedCategories ?? []
          : [];

        if (likedCategoryIds.length === 0) {
          setCategories([]);
          return;
        }
        categoryQuery = query(
          categoryQuery,
          where("__name__", "in", likedCategoryIds)
        );
      } else if (mode === CategoryCollectionMode.FOLLOWING) {
        categoryQuery = query(
          categoryQuery,
          where("createdBy", "in", [...following])
        );
      } else if (mode === CategoryCollectionMode.RECOMMENDED) {
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

        if (sortedTags.length === 0) {
          setCategories([]);
          return;
        }

        categoryQuery = query(
          categoryQuery,
          where("tags", "array-contains-any", sortedTags),
          limit(5)
        );
      } else if (mode === CategoryCollectionMode.POPULAR) {
        categoryQuery = query(
          categoryQuery,
          orderBy("likeCount", "desc"),
          limit(5)
        );
      } else {
        // Default sorting for "all" and fallback cases
        categoryQuery = query(categoryQuery, orderBy("updatedAt", "desc"));
      }

      // ✅ Execute Firestore query
      const snapshot = await getDocs(categoryQuery);
      let categoryList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Fallback for recommended mode if no categories found
      if (
        mode === CategoryCollectionMode.RECOMMENDED &&
        categoryList.length === 0
      ) {
        console.warn(
          "No recommended categories found. Falling back to recent updates."
        );
        const fallbackSnapshot = await getDocs(
          query(
            collection(db, "categories"),
            orderBy("updatedAt", "desc"),
            limit(5)
          )
        );
        categoryList = fallbackSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
      }

      // ✅ Apply privacy filters concisely
      const filteredCategories = categoryList.filter(
        (category) =>
          user?.uid === category.createdBy ||
          ((category.creatorPrivacy === UserPrivacy.PUBLIC ||
            (category.creatorPrivacy === UserPrivacy.PRIVATE &&
              following.has(category.createdBy))) &&
            category.categoryPrivacy !== CategoryPrivacy.ONLY_ME)
      );

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
        (b.likeCount ?? 0) - (a.likeCount ?? 0),
    }[sortOption];

    return [...filteredCategories].sort(compare);
  }, [filteredCategories, sortOption]);

  return (
    <>
      {filteredCategories.length === 0 ? (
        mode === CategoryCollectionMode.RECOMMENDED ? (
          <p>
            No recommendations yet. Try liking some categories to get
            personalized suggestions!
          </p>
        ) : mode === CategoryCollectionMode.LIKED_BY_USER ||
          mode === CategoryCollectionMode.LIKED ? (
          <p>No liked categories yet.</p>
        ) : mode === CategoryCollectionMode.FOLLOWING ? (
          <p>No following content yet.</p>
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
  mode: PropTypes.oneOf(Object.values(CategoryCollectionMode)),
  userId: PropTypes.string,
  searchTerm: PropTypes.string,
  sortOption: PropTypes.oneOf(Object.values(SortOptions)),
};

export default CategoryCollection;
