import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { FaMinus } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import {
  handleCustomTag,
  handleTagInput,
  handleKeyPress,
} from "../utils/tagUtils";
import TextInput from "./TextInput";
import "../styles/TagSelector.css";

const TagSelector = ({ tags, setTags, db, maxTags = 5 }) => {
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsCollectionRef = collection(db, "tags");
        const tagsSnapshot = await getDocs(tagsCollectionRef);
        const tagsList = tagsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setAvailableTags(tagsList);
      } catch (error) {
        console.error("Error fetching tags from Firestore:", error);
      }
    };
    fetchTags();
  }, [db]);

  const handleCustomTagWrapper = async () => {
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
    setTags(tags.filter((tagId) => tagId !== tagIdToRemove));
  };

  return (
    <div className="tag-selector">
      {/* Input Field using TextInput */}
      <TextInput
        value={tagInput}
        onChange={(e) => {
          setErrorMessage("");
          handleTagInput(e.target.value, setTagInput, setShowDropdown);
        }}
        placeholder={`Add a tag (up to ${maxTags})`}
        onKeyDown={(e) => handleKeyPress(e, handleCustomTagWrapper)}
        // className="field-input"
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />

      {/* Dropdown */}
      <div className={`dropdown ${showDropdown ? "expanded" : ""}`}>
        {availableTags
          .filter(
            (tag) =>
              tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
              !tags.includes(tag.id)
          )
          .slice(0, 5)
          .map((tag) => (
            <div
              key={tag.id}
              className="dropdown-item"
              onClick={() => handleTagSuggestionClick(tag.id)}
            >
              {tag.name}
            </div>
          ))}
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Selected Tags */}
      <div className="selected-tags">
        {tags.map((tagId) => {
          const tag = availableTags.find((t) => t.id === tagId);
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
  db: PropTypes.object.isRequired,
  maxTags: PropTypes.number,
};

export default TagSelector;
