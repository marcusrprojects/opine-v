import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Validates user input fields for both sign-up and profile editing.
 * @param {string} username
 * @param {string} displayName
 * @param {string} email
 * @returns {string|null} - Returns error message if validation fails, otherwise null.
 */
export const validateUserProfile = async (
  username,
  displayName,
  email,
  currentUsername = null
) => {
  // Username validation: Alphanumeric only, between 3-20 characters
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return "Username must be 3-20 characters long and contain only letters, numbers, or underscores.";
  }

  // Display name validation: Ensure it's at least 3 characters
  if (displayName.length < 3) {
    return "Display name must be at least 3 characters long.";
  }

  // Email validation: Must be in standard email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }

  // Check if username is already taken (only if changing username)
  if (username !== currentUsername) {
    const usernameTaken = await isUsernameTaken(username);
    if (usernameTaken) {
      return "This username is already taken. Please choose another.";
    }
  }

  return null; // No errors
};

/**
 * Checks if a given username already exists in Firestore.
 * @param {string} username
 * @returns {boolean} - Returns true if username exists, otherwise false.
 */
const isUsernameTaken = async (username) => {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(
    query(usersRef, where("username", "==", username))
  );
  return !querySnapshot.empty;
};
