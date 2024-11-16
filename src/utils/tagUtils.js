import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

/**
 * Handles adding custom tags.
 * @param {string} tagInput - The current input value.
 * @param {Array} availableTags - List of available tags.
 * @param {Array} tags - Current selected tags (IDs).
 * @param {Function} setTags - Function to update selected tags.
 * @param {Function} setAvailableTags - Function to update available tags.
 * @param {Function} setTagInput - Function to clear tag input.
 * @param {object} db - Firestore instance.
 */
export const handleCustomTag = async ({
  tagInput,
  availableTags,
  tags,
  setTags,
  setAvailableTags,
  setTagInput,
  db,
}) => {
  if (tagInput.trim() && tags.length < 5) {
    const normalizedTagInput = tagInput.trim().toLowerCase();

    // Check if the tag exists in the available tags
    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === normalizedTagInput
    );

    if (existingTag) {
      // Prevent adding duplicate tag IDs
      if (!tags.includes(existingTag.id)) {
        setTags((prev) => [...prev, existingTag.id]);
      }
    } else {
      try {
        // Query Firestore to check for duplicates
        const tagsRef = collection(db, "tags");
        const duplicateQuery = query(
          tagsRef,
          where("name", "==", normalizedTagInput)
        );
        const duplicateSnapshot = await getDocs(duplicateQuery);

        if (!duplicateSnapshot.empty) {
          // Tag already exists in Firestore
          const existingTagInDB = duplicateSnapshot.docs[0];
          const tagData = {
            id: existingTagInDB.id,
            name: existingTagInDB.data().name,
          };

          // Add to available tags if not already present
          if (!availableTags.some((tag) => tag.id === tagData.id)) {
            setAvailableTags((prev) => [...prev, tagData]);
          }

          // Prevent duplicate tag IDs in tags
          if (!tags.includes(tagData.id)) {
            setTags((prev) => [...prev, tagData.id]);
          }
        } else {
          // Add new tag to Firestore
          const newTagRef = await addDoc(tagsRef, { name: normalizedTagInput });
          const newTag = { id: newTagRef.id, name: normalizedTagInput };

          setAvailableTags((prev) => [...prev, newTag]);
          setTags((prev) => [...prev, newTag.id]);
        }
      } catch (error) {
        console.error("Error adding new tag:", error);
      }
    }

    // Clear input field
    setTagInput("");
  }
};

/**
 * Handles tag input change.
 * @param {string} value - Current input value.
 * @param {Function} setTagInput - Function to update input state.
 * @param {Function} setShowDropdown - Function to toggle dropdown visibility.
 */
export const handleTagInput = (value, setTagInput, setShowDropdown) => {
  setTagInput(value);
  setShowDropdown(true);
};

/**
 * Handles "Enter" key press to add custom tags.
 * @param {Event} e - Key event.
 * @param {Function} handleCustomTag - Function to add custom tag.
 */
export const handleKeyPress = (e, handleCustomTag) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleCustomTag();
  }
};

/**
 * Adds a tag by ID.
 * @param {string} tagId - The tag ID to add.
 * @param {Array} tags - Current selected tags (IDs).
 * @param {Function} setTags - Function to update selected tags.
 * @param {Function} setTagInput - Function to clear input.
 * @param {Function} setShowDropdown - Function to close dropdown.
 */
export const addTag = (tagId, tags, setTags, setTagInput, setShowDropdown) => {
  if (!tags.includes(tagId) && tags.length < 5) {
    setTags((prev) => [...prev, tagId]);
    setTagInput("");
    setShowDropdown(false);
  }
};
