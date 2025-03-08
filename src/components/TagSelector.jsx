import PropTypes from "prop-types";
import { useState } from "react";
import { FaMinus } from "react-icons/fa";
import TextInput from "./TextInput";
import "../styles/TagSelector.css";
import { useTagMap } from "../context/useTagMap";
import {
  handleCustomTag,
  handleTagInput,
  handleKeyPress,
} from "../utils/tagUtil";

const TagSelector = ({ tags, setTags, db, maxTags = 5 }) => {
  const [tagInput, setTagInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Get global tag mapping
  const tagMap = useTagMap();
  const availableTags = Object.entries(tagMap).map(([id, name]) => ({
    id,
    name,
  }));

  const handleCustomTagWrapper = async () => {
    await handleCustomTag({
      tagInput,
      availableTags,
      tags,
      setTags,
      setAvailableTags: () => {}, // No-op since tagMap is global
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
    setTags(tags.filter((tagId) => tagId !== tagIdToRemove));
  };

  return (
    <div className="tag-selector">
      <TextInput
        value={tagInput}
        onChange={(e) => {
          setErrorMessage("");
          handleTagInput(e.target.value, setTagInput, setShowDropdown);
        }}
        placeholder={`Add a tag (up to ${maxTags})`}
        onKeyDown={(e) => handleKeyPress(e, handleCustomTagWrapper)}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />

      <div className={`dropdown ${showDropdown ? "expanded" : ""}`}>
        {availableTags
          .filter(
            ({ id, name }) =>
              name.toLowerCase().includes(tagInput.toLowerCase()) &&
              !tags.includes(id)
          )
          .slice(0, 5)
          .map(({ id, name }) => (
            <div
              key={id}
              className="dropdown-item"
              onClick={() => handleTagSuggestionClick(id)}
            >
              {name}
            </div>
          ))}
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="selected-tags">
        {tags.map((tagId) => {
          const tagName = tagMap[tagId];
          return (
            <span key={tagId} className="selected-tag">
              {tagName || "Unknown Tag"}{" "}
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
  db: PropTypes.object.isRequired,
  maxTags: PropTypes.number,
};

export default TagSelector;
