import { useEffect, useState, useMemo } from "react";
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

  useEffect(() => {
    if (!user && mode !== "all") return;

    const fetchCategories = async () => {
      try {
        let q = collection(db, "categories");

        if (mode === "own") {
          q = query(q, where("createdBy", "==", user.uid));
        } else if (mode === "user" && userId) {
          q = query(q, where("createdBy", "==", userId));
        } else if (mode === "liked") {
          setCategories(likedCategories);
          return;
        } else if (mode === "likedByUser" && userId) {
          const userDocRef = doc(db, "users", userId);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const likedCategoryIds = userSnapshot.data().likedCategories || [];
            q = query(q, where("__name__", "in", likedCategoryIds));
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

          q = query(q, where("__name__", "in", randomLikedCategories));

          const likedSnapshot = await getDocs(q);
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

          q = query(q, where("tags", "array-contains-any", sortedTags));
        } else if (mode === "trending") {
          q = query(q, orderBy("likeCount", "desc"), limit(5));
        }

        const categorySnapshot = await getDocs(q);
        let categoryList = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          tagNames: (doc.data().tags || []).filter((tag) =>
            availableTags.has(tag)
          ),
        }));

        // 🛠️ Add fallback for recommended categories
        if (mode === "recommended" && categoryList.length === 0) {
          console.warn(
            "No recommended categories found. Falling back to recently updated."
          );
          q = query(
            collection(db, "categories"),
            orderBy("updatedAt", "desc"),
            limit(5)
          );
          const recentSnapshot = await getDocs(q);
          categoryList = recentSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            tagNames: (doc.data().tags || []).filter((tag) =>
              availableTags.has(tag)
            ),
          }));
        }

        const filteredCategories = categoryList.filter((category) => {
          if (category.privacy === PRIVACY_LEVELS.PUBLIC) return true;
          return user && following.has(category.createdBy);
        });

        setCategories(filteredCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [availableTags, user, following, mode, userId, likedCategories]);

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
