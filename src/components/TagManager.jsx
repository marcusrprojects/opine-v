import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaMinus } from "react-icons/fa";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { handleError } from "../utils/errorUtils";
import "../styles/TagManager.css";

const TagManager = ({ db, initialTags, onTagsChange, maxTags = 5 }) => {
  const [tags, setTags] = useState(initialTags || []);
  const [tagInput, setTagInput] = useState("");
  const [availableTags, setAvailableTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsRef = collection(db, "tags");
        const tagsSnapshot = await getDocs(tagsRef);
        const tagsList = tagsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setAvailableTags(tagsList);
      } catch (error) {
        handleError(error, "Error fetching tags:");
      }
    };

    fetchTags();
  }, [db]);

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
    setShowDropdown(true);
  };

  const handleCustomTag = async () => {
    const normalizedTagInput = tagInput.trim().toLowerCase();
    if (!tagInput.trim() || tags.length >= maxTags) {
      alert(`You can only add up to ${maxTags} tags.`);
      return;
    }

    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === normalizedTagInput
    );

    if (existingTag) {
      // Add existing tag
      if (!tags.includes(existingTag.id)) {
        const updatedTags = [...tags, existingTag.id];
        setTags(updatedTags);
        onTagsChange(updatedTags);
      }
    } else {
      try {
        const tagsRef = collection(db, "tags");
        const duplicateQuery = query(tagsRef, where("name", "==", normalizedTagInput));
        const duplicateSnapshot = await getDocs(duplicateQuery);

        if (!duplicateSnapshot.empty) {
          // Tag exists in Firestore
          const existingTagInDB = duplicateSnapshot.docs[0];
          const tagData = { id: existingTagInDB.id, name: existingTagInDB.data().name };

          setAvailableTags((prev) => [...prev, tagData]);
          const updatedTags = [...tags, tagData.id];
          setTags(updatedTags);
          onTagsChange(updatedTags);
        } else {
          // Create new tag in Firestore
          const newTagRef = await addDoc(tagsRef, { name: normalizedTagInput });
          const newTag = { id: newTagRef.id, name: normalizedTagInput };

          setAvailableTags((prev) => [...prev, newTag]);
          const updatedTags = [...tags, newTag.id];
          setTags(updatedTags);
          onTagsChange(updatedTags);
        }
      } catch (error) {
        handleError(error, "Error adding new tag:");
      }
    }

    setTagInput("");
    setShowDropdown(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomTag();
    }
  };

  const handleRemoveTag = (tagId) => {
    const updatedTags = tags.filter((tag) => tag !== tagId);
    setTags(updatedTags);
    onTagsChange(updatedTags);
  };

  const handleBlur = (e) => {
    if (!e.relatedTarget?.classList.contains("dropdown-item")) {
      setTimeout(() => setShowDropdown(false), 150);
    }
  };

  return (
    <div className="tag-manager-container">
      <input
        type="text"
        value={tagInput}
        onChange={handleTagInput}
        placeholder={`Add tag (max ${maxTags})`}
        onKeyDown={handleKeyPress}
        className="tag-input"
        onBlur={handleBlur}
        onFocus={() => setShowDropdown(true)}
      />
      <div className={`dropdown ${showDropdown ? "expanded" : ""}`}>
        {availableTags
          .filter(
            (tag) =>
              tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
              !tags.includes(tag.id)
          )
          .map((tag) => (
            <div
              key={tag.id}
              onClick={() => {
                const updatedTags = [...tags, tag.id];
                setTags(updatedTags);
                onTagsChange(updatedTags);
                setShowDropdown(false);
              }}
              className="dropdown-item"
            >
              {tag.name}
            </div>
          ))}
      </div>
      <div className="selected-tags">
        {tags.map((tagId) => {
          const tag = availableTags.find((t) => t.id === tagId);
          return (
            <span key={tagId} className="selected-tag">
              {tag?.name} <FaMinus onClick={() => handleRemoveTag(tagId)} />
            </span>
          );
        })}
      </div>
    </div>
  );
};

TagManager.propTypes = {
  db: PropTypes.object.isRequired,
  initialTags: PropTypes.arrayOf(PropTypes.string),
  onTagsChange: PropTypes.func.isRequired,
  maxTags: PropTypes.number,
};

export default TagManager;