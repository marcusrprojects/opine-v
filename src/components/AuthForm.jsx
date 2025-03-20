import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import TextInput from "./TextInput";
import "../styles/AuthForm.css";
import PropTypes from "prop-types";
import { validateUserProfile } from "../utils/validationUtils";
import { useAuth } from "../context/useAuth";

const AuthForm = ({ mode }) => {
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  /**
   * Clears errors when user starts typing again.
   */
  useEffect(() => {
    setError("");
  }, [email, password, name, username]);

  useEffect(() => {
    if (user) {
      navigate(`/profile/${user.uid}`);
    }
  }, [user, navigate]);

  /**
   * Creates a user profile in Firestore if it doesn't exist.
   */
  const createUserProfile = async (user, newName, newUsername, authMethod) => {
    const userRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: newName || "New User",
        username: newUsername,
        createdAt: new Date().toISOString(),
        followers: [],
        following: [],
        authMethod,
      });
    }
  };

  /**
   * Handles Email Signup/Login.
   */
  const handleAuth = async (e) => {
    e.preventDefault();

    if (isSignup) {
      const validationError = await validateUserProfile(username, name, email);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await createUserProfile(userCredential.user, name, username, "email");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(`Error ${isSignup ? "signing up" : "logging in"}:`, err);
      setError(err.message);
    }
  };

  const generateUniqueUsername = async (emailPrefix) => {
    let baseUsername = emailPrefix.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    let username = baseUsername;
    let count = 1; // Start count for duplicates
    let exists = true;

    while (exists) {
      // Check Firestore for existing username
      const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const querySnapshot = await getDocs(usernameQuery);

      if (querySnapshot.empty) {
        exists = false; // Username is unique
      } else {
        // Increment count if the username is taken
        username = `${baseUsername}${count}`;
        count++;
      }
    }

    return username;
  };

  /**
   * Handles Google Signup/Login.
   */
  const handleGoogleAuth = async () => {
    setError(""); // Reset previous errors
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        // Generate username from email (remove special characters & add random digits)
        const emailPrefix = user.email
          .split("@")[0]
          .replace(/[^a-zA-Z0-9]/g, "");
        const uniqueUsername = await generateUniqueUsername(emailPrefix);

        await createUserProfile(
          user,
          user.displayName,
          uniqueUsername,
          "google"
        );

        // Redirect to edit profile
        navigate("/profile/edit");
      }
    } catch (err) {
      console.error("Error with Google authentication:", err);
      setError("Google sign-in failed. Please try again.");
    }
  };

  /**
   * Sends password reset email.
   */
  const handleForgotPassword = async () => {
    setError(""); // Reset previous errors
    if (!email) {
      setError("Enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error("Error sending password reset email:", err);
      setError("Failed to send password reset email. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">{isSignup ? "Sign Up" : "Login"}</h2>
      <form className="auth-form" onSubmit={handleAuth}>
        {isSignup && (
          <>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display Name"
              className="input-field"
              required
            />
            <TextInput
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="input-field"
              required
            />
          </>
        )}
        <TextInput
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input-field"
          required
        />
        <TextInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="input-field"
          required
        />
        <button type="submit" className="submit-button">
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <button onClick={handleGoogleAuth} className="submit-button">
          {isSignup ? "Sign up" : "Login"} with Google
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>

      <p className="switch-link">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          className="navigate-button"
          onClick={() => navigate(isSignup ? "/login" : "/signup")}
        >
          {isSignup ? "Login here" : "Sign up here"}
        </button>
        {!isSignup && (
          <button className="navigate-button" onClick={handleForgotPassword}>
            Forgot Password?
          </button>
        )}
      </p>
    </div>
  );
};

AuthForm.propTypes = {
  mode: PropTypes.oneOf(["signup", "login"]).isRequired,
};

export default AuthForm;
