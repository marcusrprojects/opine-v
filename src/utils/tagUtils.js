import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

/**
 * Handles adding a custom tag.
 * - Normalizes input (trimming and lowercasing).
 * - Checks the local availableTags array for duplicates.
 * - If duplicate exists in availableTags or in Firestore, adds its id to selected tags.
 * - Otherwise, creates a new tag document.
 *
 * @param {Object} params - The parameters.
 * @param {string} params.tagInput - The current input value.
 * @param {Array} params.availableTags - Array of available tags (each: { id, name }).
 * @param {Array} params.tags - Current selected tag IDs.
 * @param {Function} params.setTags - Function to update selected tags.
 * @param {Function} params.setAvailableTags - Function to update available tags.
 * @param {Function} params.setTagInput - Function to clear tag input.
 * @param {object} params.db - Firestore instance.
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
    const normalizedTag = tagInput.trim().toLowerCase();

    // Check if the tag already exists in the local availableTags cache.
    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === normalizedTag
    );

    if (existingTag) {
      if (!tags.includes(existingTag.id)) {
        setTags((prev) => [...prev, existingTag.id]);
      }
    } else {
      try {
        // Check Firestore for duplicate tag.
        const tagsRef = collection(db, "tags");
        const duplicateQuery = query(
          tagsRef,
          where("name", "==", normalizedTag)
        );
        const duplicateSnapshot = await getDocs(duplicateQuery);

        if (!duplicateSnapshot.empty) {
          const tagDoc = duplicateSnapshot.docs[0];
          const tagData = { id: tagDoc.id, name: tagDoc.data().name };
          // Update local cache if necessary.
          if (!availableTags.some((tag) => tag.id === tagData.id)) {
            setAvailableTags((prev) => [...prev, tagData]);
          }
          if (!tags.includes(tagData.id)) {
            setTags((prev) => [...prev, tagData.id]);
          }
        } else {
          // Add new tag to Firestore.
          const newTagRef = await addDoc(tagsRef, { name: normalizedTag });
          const newTag = { id: newTagRef.id, name: normalizedTag };
          setAvailableTags((prev) => [...prev, newTag]);
          setTags((prev) => [...prev, newTag.id]);
        }
      } catch (error) {
        console.error("Error adding new tag:", error);
      }
    }
    setTagInput("");
  }
};

/**
 * Handles tag input changes.
 *
 * @param {string} value - The current input value.
 * @param {Function} setTagInput - Function to update input state.
 * @param {Function} setShowDropdown - Function to open the dropdown.
 */
export const handleTagInput = (value, setTagInput, setShowDropdown) => {
  setTagInput(value);
  setShowDropdown(true);
};

/**
 * Handles key presses in the tag input.
 * If the "Enter" key is pressed, prevent default and add custom tag.
 *
 * @param {Event} e - The key event.
 * @param {Function} handleCustomTag - Function to add the custom tag.
 */
export const handleKeyPress = (e, handleCustomTag) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleCustomTag();
  }
};

/**
 * Adds a tag by ID.
 *
 * @param {string} tagId - The tag ID to add.
 * @param {Array} tags - Current selected tag IDs.
 * @param {Function} setTags - Function to update selected tags.
 * @param {Function} setTagInput - Function to clear tag input.
 * @param {Function} setShowDropdown - Function to close the dropdown.
 */
export const addTag = (tagId, tags, setTags, setTagInput, setShowDropdown) => {
  if (!tags.includes(tagId) && tags.length < 5) {
    setTags((prev) => [...prev, tagId]);
    setTagInput("");
    setShowDropdown(false);
  }
};
