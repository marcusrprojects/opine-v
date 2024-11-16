import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaMinus } from 'react-icons/fa';
import { handleCustomTag, handleTagInput, handleKeyPress } from "../utils/tagUtils";

const TagSelector = ({ tags, setTags, availableTags, setAvailableTags, db, maxTags = 5 }) => {
  const [tagInput, setTagInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleCustomTagWrapper = async () => {
    if (!db) {
      console.error("Database instance (db) is required for adding custom tags.");
      return;
    }
    await handleCustomTag({
      tagInput,
      availableTags,
      tags,
      setTags,
      setAvailableTags,
      setTagInput,
      db,
    });
  };

  const handleTagSuggestionClick = (tagId) => {
    if (!tags.includes(tagId) && tags.length < maxTags) {
      setTags([...tags, tagId]);
      setTagInput("");
      setShowDropdown(false);
    }
  };

  const handleRemoveTag = (tagIdToRemove) => {
    setTags(tags.filter(tagId => tagId !== tagIdToRemove));
  };

  return (
    <div className="tag-selector">
      {/* Input Field */}
      <input
        type="text"
        value={tagInput}
        onChange={(e) => handleTagInput(e.target.value, setTagInput, setShowDropdown)}
        onKeyDown={(e) => handleKeyPress(e, handleCustomTagWrapper)}
        placeholder={`Add a tag (up to ${maxTags})`}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />

      {/* Dropdown */}
      {showDropdown && (
        <div className="dropdown">
          {availableTags
            .filter(tag => tag.name.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag.id))
            .slice(0, 5)
            .map(tag => (
              <div
                key={tag.id}
                onClick={() => handleTagSuggestionClick(tag.id)}
                className="dropdown-item"
              >
                {tag.name}
              </div>
            ))}
        </div>
      )}

      {/* Selected Tags */}
      <div className="selected-tags">
        {tags.map(tagId => {
          const tag = availableTags.find(t => t.id === tagId);
          return (
            <span key={tagId} className="selected-tag">
              {tag?.name || "Unknown Tag"}{" "}
              <FaMinus onClick={() => handleRemoveTag(tagId)} />
            </span>
          );
        })}
      </div>
    </div>
  );
};

TagSelector.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired, // IDs of selected tags
  setTags: PropTypes.func.isRequired, // Function to update selected tags
  availableTags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired, // Array of available tags with IDs and names
  setAvailableTags: PropTypes.func.isRequired,
  db: PropTypes.object.isRequired, // Firestore database instance
  maxTags: PropTypes.number, // Maximum number of tags allowed
};

export default TagSelector;