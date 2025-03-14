import { db } from "../firebaseConfig";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Fetches all available tags from Firestore.
 * - Since tags are now stored as document IDs, no need to query a "name" field.
 * - Returns a **list of tag names** directly.
 *
 * @returns {Promise<Array<string>>} List of available tag names.
 */
export const fetchTags = async () => {
  const tagsSnapshot = await getDocs(collection(db, "tags"));
  return tagsSnapshot.docs.map((doc) => doc.id);
};

export const fetchTagsSet = async () => {
  const tagList = await fetchTags();
  return new Set(tagList);
};

/**
 * Normalizes tag input for consistency.
 * - Converts to lowercase
 * - Trims whitespace
 * - Replaces spaces with hyphens
 * - Removes unsupported characters
 *
 * @param {string} tag - The input tag name.
 * @returns {string} Normalized tag name.
 */
const normalizeTag = (tag) =>
  tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");

/**
 * Adds a new tag to Firestore.
 * - If the tag already exists, returns its existing ID.
 * - Otherwise, creates a new document with **tag name as the document ID**.
 *
 * @param {string} tagName - The tag name input from the user.
 * @returns {Promise<string>} The tag ID (which is also the tag name).
 */
export const addTag = async (tagName) => {
  const newTagId = normalizeTag(tagName);
  const tagRef = doc(db, "tags", newTagId);

  const existingTag = await getDoc(tagRef);
  if (!existingTag.exists()) {
    await setDoc(tagRef, {}); // Empty doc since the tag name is its ID.
  }

  return newTagId;
};

/**
 * Handles adding a custom tag.
 * - Ensures no duplicates exist in `availableTags`.
 * - If the tag exists, adds its ID to `selectedTags`.
 * - Otherwise, it creates a new tag in Firestore and adds it.
 *
 * @param {Object} params - Function parameters.
 * @param {string} params.tagInput - The user input.
 * @param {Array<string>} params.availableTags - List of available tag names.
 * @param {Array<string>} params.tags - Current selected tag IDs.
 * @param {Function} params.setTags - Updates selected tag state.
 * @param {Function} params.setTagInput - Clears input field.
 * @param {object} params.db - Firestore instance.
 * @returns {Promise<string|null>} The added tag name, or `null` if invalid.
 */
export const handleCustomTag = async ({
  tagInput,
  availableTags,
  tags,
  setTags,
  setTagInput,
  setErrorMessage,
  db,
}) => {
  const normalizedTag = normalizeTag(tagInput);

  // 🚨 Reject completely invalid inputs
  if (!tagInput.trim() || normalizedTag === "") {
    setErrorMessage(
      "Invalid tag. Please enter letters, numbers, hyphens, or underscores."
    );
    return null;
  }

  // 🚨 Warn users when input is auto-corrected
  if (normalizedTag !== tagInput) {
    setErrorMessage(`Tag was corrected to "${normalizedTag}".`);
  }

  // ✅ Prevent duplicate selections
  if (tags.includes(normalizedTag)) {
    setTagInput("");
    return normalizedTag;
  }

  if (availableTags.includes(normalizedTag)) {
    setTags((prev) => [...prev, normalizedTag]);
    setTagInput("");
    return normalizedTag;
  } else {
    try {
      const tagRef = doc(db, "tags", normalizedTag);
      const existingTag = await getDoc(tagRef);

      if (!existingTag.exists()) {
        await setDoc(tagRef, {}); // ✅ Store an empty doc (tag name = ID)
      }

      setTags((prev) => [...prev, normalizedTag]);
      setTagInput("");
      return normalizedTag;
    } catch (error) {
      console.error("Error adding new tag:", error);
    }
    return normalizedTag;
  }
};

/**
 * Handles input changes for the tag field.
 * - Updates state and opens the dropdown.
 *
 * @param {string} value - The input value.
 * @param {Function} setTagInput - Updates the input state.
 * @param {Function} setShowDropdown - Opens the dropdown.
 */
export const handleTagInput = (value, setTagInput, setShowDropdown) => {
  setTagInput(value);
  setShowDropdown(true);
};

/**
 * Handles Enter key press in tag input.
 * - Prevents default form submission.
 * - Calls `handleCustomTag` when Enter is pressed.
 *
 * @param {Event} e - The key press event.
 * @param {Function} handleCustomTag - Function to add a tag.
 */
export const handleKeyPress = (e, handleCustomTag) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleCustomTag();
  }
};

/**
 * Adds a tag by its ID.
 * - Ensures no duplicate selections.
 *
 * @param {string} tagId - The tag ID to add.
 * @param {Array<string>} selectedTags - Current selected tags.
 * @param {Function} setSelectedTags - Updates selected tags state.
 * @param {Function} setTagInput - Clears input.
 * @param {Function} setShowDropdown - Closes dropdown.
 */
export const addTagToSelection = (
  tagId,
  selectedTags,
  setSelectedTags,
  setTagInput,
  setShowDropdown
) => {
  if (!selectedTags.includes(tagId) && selectedTags.length < 5) {
    setSelectedTags((prev) => [...prev, tagId]);
    setTagInput("");
    setShowDropdown(false);
  }
};
