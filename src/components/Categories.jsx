import { useEffect, useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import "../styles/Categories.css";
import AddButton from './AddButton';
import { useAuth } from '../context/useAuth';
import { debounce } from 'lodash';
import { FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa'; // Icons for like/dislike

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(''); // Unified search input
  const [selectedTags, setSelectedTags] = useState([]); // Selected tags
  const [tagMap, setTagMap] = useState({}); // Store tag IDs and names
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false); // For controlling dropdown visibility
  const [likedCategories, setLikedCategories] = useState([]);
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false); // State for toggling the search input
  const { user } = useAuth();

  // Create a debounced function outside of React render
  const debouncedFilterRef = useRef(
    debounce((searchValue, tags, categories, tagMap, setFilteredCategories) => {
      const searchLower = searchValue.toLowerCase();
      const filtered = categories.filter((category) => {
        const matchesName = category.name.toLowerCase().includes(searchLower);

        // Check if any of the category's tags that aren't already selected match the search term
        const matchesTagSearch = category.tags?.some(
          (tagId) =>
            !tags.includes(tagId) && // Exclude already selected tags
            tagMap[tagId]?.toLowerCase().includes(searchLower)
        );

        const matchesTags = tags.every((tag) => category.tags?.includes(tag));

        // Match if either the name or any tag that isn't already selected matches the search input, along with selected tags
        return (matchesName || matchesTagSearch) && matchesTags;
      });

      setFilteredCategories(filtered);
    }, 300)
  );

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagSnapshot = await getDocs(collection(db, 'tags'));
        const tagList = tagSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().name;
          return acc;
        }, {});
        setTagMap(tagList);
      } catch (error) {
        console.error('Error fetching tags: ', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, 'categories'));
        const categoryList = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryList);
        setFilteredCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories: ', error);
      }
    };

    const fetchLikedCategories = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnapshot = await getDoc(userDocRef);
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            const likedCategoryIds = userData.likedCategories || []; // Ensure array of IDs
            setLikedCategories(likedCategoryIds); // Directly set IDs
          }
        } catch (error) {
          console.error('Error fetching liked categories:', error);
        }
      }
    };

    fetchTags();
    fetchCategories();
    fetchLikedCategories();
    setLoading(false);
  }, [user]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    // Use the debounced function
    debouncedFilterRef.current(
      value,
      selectedTags,
      categories,
      tagMap,
      setFilteredCategories
    );
  };

  const toggleTagFilter = (tagId) => {
    const updatedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId) // Remove tag if already selected
      : [...selectedTags, tagId]; // Add tag to selection

    setSelectedTags(updatedTags);

    // Apply the filter with the current tags
    debouncedFilterRef.current('', updatedTags, categories, tagMap, setFilteredCategories); // Pass an empty searchInput

    // Clear the search input after filtering is applied
    setSearchInput(''); // Reset input value
    setShowDropdown(false); // Hide the dropdown
  };

  const toggleLike = async (categoryId) => {
    if (!user) {
      alert('You need to log in to like categories.');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const updatedLikes = likedCategories.includes(categoryId)
      ? likedCategories.filter((id) => id !== categoryId) // Remove like
      : [...likedCategories, categoryId]; // Add like

    try {
      await updateDoc(userDocRef, { likedCategories: updatedLikes });
      setLikedCategories(updatedLikes);
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleRemoveTag = (tagId) => {
    toggleTagFilter(tagId);
  };

  useEffect(() => {
    // Cleanup debounced function on unmount
    const debouncedFilter = debouncedFilterRef.current;
    return () => {
      debouncedFilter.cancel(); // Use the copied variable
    };
  }, []);

  if (loading) {
    return <p>Loading categories...</p>;
  }

  return (
    <div>
      <h2>Categories</h2>

      <div className="search-container">
        <button
          className="search-icon"
          onClick={() => setShowSearch(!showSearch)}
          aria-label="Toggle search"
        >
          <FaSearch />
        </button>

        {showSearch && (
          <div className="tag-filter">
            <input
              type="text"
              placeholder="Filter by name or tag"
              value={searchInput}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // Delay to allow selection
              className="search-input"
            />
            {showDropdown && searchInput && (
              <div className="tag-dropdown">
                {Object.entries(tagMap)
                  .filter(([tagId, tagName]) =>
                    tagName.toLowerCase().includes(searchInput.toLowerCase()) &&
                    !selectedTags.includes(tagId)
                  )
                  .map(([tagId, tagName]) => (
                    <div
                      key={tagId}
                      className="dropdown-item"
                      onClick={() => toggleTagFilter(tagId)}
                    >
                      {tagName}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Tags */}
      <div className="selected-tags">
        {selectedTags.map((tagId) => (
          <span
            key={tagId}
            className="tag-chip active"
            onClick={() => handleRemoveTag(tagId)}
          >
            {tagMap[tagId]}
            <span className="remove-tag">&times;</span>
          </span>
        ))}
      </div>

      <div className="category-grid">
        {filteredCategories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => navigate(`/categories/${category.id}`)}
            >
              <div className="category-header">
                <h4 className="category-title">{category.name}</h4>
              </div>
              <div className="category-content">
                {category.fields
                  .filter((field) => field !== category.primaryField)
                  .join(', ')}
              </div>

              <div className="like-container">
                {likedCategories.includes(category.id) ? (
                  <FaHeart
                    className="like-icon liked"
                    onClick={() => toggleLike(category.id)}
                  />
                ) : (
                  <FaRegHeart
                    className="like-icon"
                    onClick={() => toggleLike(category.id)}
                  />
                )}
              </div>

              <div className="category-tags">
                {category.tags && category.tags.length > 0 ? (
                  <div className="tag-container">
                    {category.tags.map((tagId) => (
                      <span key={tagId} className="tag-chip">
                        {tagMap[tagId] || 'Unknown Tag'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>
                    <em id="tag-unknown">No tags available</em>
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <AddButton onClick={() => navigate(`/create-category`)} />
    </div>
  );
};

export default Categories;