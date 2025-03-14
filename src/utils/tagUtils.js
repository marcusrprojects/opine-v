import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";

/**
 * Fetches all available tags from Firestore.
 * - Tags are stored as document IDs, so we return them directly.
 * - Returns a **list of tag names**.
 *
 * @returns {Promise<Array<string>>} List of available tag names.
 */
export const fetchTags = async () => {
  const tagsSnapshot = await getDocs(collection(db, "tags"));
  return tagsSnapshot.docs.map((doc) => doc.id);
};

/**
 * Returns a **Set** of available tag names for fast lookup.
 *
 * @returns {Promise<Set<string>>} Set of available tag names.
 */
export const fetchTagsSet = async () => {
  const tagList = await fetchTags();
  return new Set(tagList);
};

/**
 * **Normalizes tag input** for consistency.
 * - Converts to lowercase.
 * - Trims whitespace.
 * - Replaces spaces with hyphens.
 * - Removes all unsupported characters.
 * - Prevents multiple consecutive hyphens.
 * - Limits length to **30 characters**.
 *
 * @param {string} tag - The input tag name.
 * @returns {string} Normalized tag name.
 */
const normalizeTag = (tag) =>
  tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Convert spaces to hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove all non-allowed characters
    .replace(/^-+|-+$/g, "") // Trim leading & trailing hyphens
    .replace(/--+/g, "-") // Replace multiple hyphens with a single one
    .slice(0, 30); // Limit length to 30 characters

/**
 * **Adds a new tag to Firestore.**
 * - If the tag already exists, returns its existing ID.
 * - Otherwise, creates a new document with **tag name as the document ID**.
 * - Uses **batch writes** for efficiency.
 *
 * @param {string} tagName - The tag name input from the user.
 * @returns {Promise<string>} The tag ID (which is also the tag name).
 */
export const addTag = async (tagName) => {
  const newTagId = normalizeTag(tagName);
  if (!newTagId) return null; // Prevent empty tags

  const tagRef = doc(db, "tags", newTagId);
  const existingTag = await getDoc(tagRef);

  if (!existingTag.exists()) {
    const batch = writeBatch(db);
    batch.set(tagRef, {}); // Empty doc since the tag name is its ID
    await batch.commit();
  }

  return newTagId;
};

/**
 * **Handles adding a custom tag.**
 * - Ensures no duplicates exist in `availableTags`.
 * - If the tag exists, adds its ID to `selectedTags`.
 * - Otherwise, creates a new tag in Firestore and adds it.
 *
 * @param {Object} params - Function parameters.
 * @param {string} params.tagInput - The user input.
 * @param {Array<string>} params.availableTags - List of available tag names.
 * @param {Array<string>} params.tags - Current selected tag IDs.
 * @param {Function} params.setTags - Updates selected tag state.
 * @param {Function} params.setTagInput - Clears input field.
 * @param {Function} params.setErrorMessage - Displays errors.
 * @returns {Promise<string|null>} The added tag name, or `null` if invalid.
 */
export const handleCustomTag = async ({
  tagInput,
  availableTags,
  tags,
  setTags,
  setTagInput,
  setErrorMessage,
}) => {
  const normalizedTag = normalizeTag(tagInput);

  // 🚨 Reject completely invalid inputs
  if (!normalizedTag) {
    setErrorMessage(
      "Invalid tag. Tags must contain only letters, numbers, and hyphens."
    );
    return null;
  }

  // 🚨 Warn users if input was auto-corrected
  if (normalizedTag !== tagInput.trim()) {
    setErrorMessage(`Tag was corrected to "${normalizedTag}".`);
  }

  // ✅ Prevent duplicate selections
  if (tags.includes(normalizedTag)) {
    setTagInput("");
    return normalizedTag;
  }

  // ✅ Add existing tag
  if (availableTags.includes(normalizedTag)) {
    setTags((prev) => [...prev, normalizedTag]);
    setTagInput("");
    return normalizedTag;
  }

  // ✅ Create new tag in Firestore
  try {
    const addedTag = await addTag(normalizedTag);
    if (addedTag) {
      setTags((prev) => [...prev, addedTag]);
      setTagInput("");
    }
    return addedTag;
  } catch (error) {
    console.error("Error adding new tag:", error);
    setErrorMessage("Failed to add tag. Please try again.");
    return null;
  }
};

/**
 * **Handles input changes for the tag field.**
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
 * **Handles Enter key press in tag input.**
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
 * **Adds a tag by its ID.**
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
