import { useEffect, useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import "../styles/Categories.css";
import AddButton from './AddButton';
import { debounce } from 'lodash';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(''); // Unified search input
  const [selectedTags, setSelectedTags] = useState([]); // Selected tags
  const [tagMap, setTagMap] = useState({}); // Store tag IDs and names
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false); // For controlling dropdown visibility
  const navigate = useNavigate();

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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories: ', error);
        setLoading(false);
      }
    };

    fetchTags();
    fetchCategories();
  }, []);

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

      {/* Unified Search Input */}
      <div className="filters tag-filter">
        <input
          type="text"
          placeholder="Filter by name or tag"
          value={searchInput}
          onChange={handleSearchChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // Delay to allow selection
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