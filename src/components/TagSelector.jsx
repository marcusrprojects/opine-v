import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { FaMinus } from "react-icons/fa";
import TextInput from "./TextInput";
import "../styles/TagSelector.css";
import {
  handleCustomTag,
  handleTagInput,
  handleKeyPress,
  fetchTags,
} from "../utils/tagUtils";

const TagSelector = ({ tags, setTags, db, maxTags = 5 }) => {
  const [tagInput, setTagInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [availableTags, setAvailableTags] = useState([]);

  // **Fetch available tags from Firestore on mount**
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagList = await fetchTags();
        setAvailableTags(tagList);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    loadTags();
  }, []);

  // **Handles adding a tag**
  const handleCustomTagWrapper = async () => {
    const result = await handleCustomTag({
      tagInput,
      availableTags,
      tags,
      setTags,
      setTagInput,
      setErrorMessage,
      db,
    });

    if (!result) {
      setErrorMessage(
        "Invalid tag. Tags can only contain letters, numbers, hyphens, and underscores."
      );
    }
  };

  // **Clear error when user starts typing again**
  const handleTagInputChange = (e) => {
    setErrorMessage("");
    handleTagInput(e.target.value, setTagInput, setShowDropdown);
  };

  // **Handles selecting a tag from the dropdown**
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

  // **Handles removing a selected tag**
  const handleRemoveTag = (tagIdToRemove) => {
    setTags(tags.filter((tagId) => tagId !== tagIdToRemove));
  };

  return (
    <div className="tag-selector">
      <TextInput
        value={tagInput}
        onChange={handleTagInputChange}
        placeholder={`Add a tag (up to ${maxTags})`}
        onKeyDown={(e) => handleKeyPress(e, handleCustomTagWrapper)}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />
      {/* 🔥 User Feedback */}
      <div className={`dropdown ${showDropdown ? "expanded" : ""}`}>
        {availableTags
          .filter(
            (tag) => tag.includes(tagInput.toLowerCase()) && !tags.includes(tag)
          )
          .slice(0, 5)
          .map((tag) => (
            <div
              key={tag}
              className="dropdown-item"
              onClick={() => handleTagSuggestionClick(tag)}
            >
              {tag}
            </div>
          ))}
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}{" "}
      <div className="selected-tags">
        {tags.map((tagId) => (
          <span key={tagId} className="selected-tag">
            {tagId} <FaMinus onClick={() => handleRemoveTag(tagId)} />
          </span>
        ))}
      </div>
    </div>
  );
};

TagSelector.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  setTags: PropTypes.func.isRequired,
  db: PropTypes.object.isRequired,
  maxTags: PropTypes.number,
};

export default TagSelector;
