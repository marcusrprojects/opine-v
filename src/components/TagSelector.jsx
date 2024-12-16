import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaMinus } from 'react-icons/fa';
import { handleCustomTag, handleTagInput, handleKeyPress } from "../utils/tagUtils";
import '../styles/TagSelector.css';

const TagSelector = ({ tags, setTags, availableTags, setAvailableTags, db, maxTags = 5 }) => {
  const [tagInput, setTagInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    if (tags.includes(tagId)) {
      setErrorMessage("This tag is already selected.");
    } else if (tags.length >= maxTags) {
      setErrorMessage(`You can only select up to ${maxTags} tags.`);
    } else {
      setTags([...tags, tagId]);
      setTagInput("");
      setShowDropdown(false);
      setErrorMessage("");
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
        onChange={(e) => {
          setErrorMessage("");
          handleTagInput(e.target.value, setTagInput, setShowDropdown);
        }}
        onKeyDown={(e) => handleKeyPress(e, handleCustomTagWrapper)}
        placeholder={`Add a tag (up to ${maxTags})`}
        onFocus={() => setShowDropdown(true)}
        className='field-input'
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />

      {/* Dropdown */}
      <div className={`dropdown ${showDropdown ? 'expanded' : ''}`}>
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

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      

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
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  setTags: PropTypes.func.isRequired,
  availableTags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  setAvailableTags: PropTypes.func.isRequired,
  db: PropTypes.object.isRequired,
  maxTags: PropTypes.number,
};

export default TagSelector;