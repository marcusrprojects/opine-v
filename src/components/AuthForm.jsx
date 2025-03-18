import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import TextInput from "./TextInput";
import "../styles/AuthForm.css";
import PropTypes from "prop-types";

const AuthForm = ({ mode }) => {
  const navigate = useNavigate();
  const isSignup = mode === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  /**
   * Clears errors when user starts typing again.
   */
  useEffect(() => {
    setError("");
  }, [email, password, displayName, username]);

  /**
   * Creates a user profile in Firestore if it doesn't exist.
   */
  const createUserProfile = async (user, newDisplayName, newUsername) => {
    const userRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: newDisplayName,
        username: newUsername,
        email: user.email,
        createdAt: new Date().toISOString(),
        followers: [],
        following: [],
      });
    }
  };

  /**
   * Handles Email Signup/Login.
   */
  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      if (isSignup) {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await createUserProfile(userCredential.user, displayName, username);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/profile");
    } catch (err) {
      console.error(`Error ${isSignup ? "signing up" : "logging in"}:`, err);
      setError(
        err.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : err.message
      );
    }
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

      if (!userSnapshot.exists() && isSignup) {
        const newDisplayName = prompt("Enter your display name:");
        const newUsername = prompt("Choose a username:");

        if (!newDisplayName || !newUsername) {
          alert("Both display name and username are required.");
          return;
        }

        await createUserProfile(user, newDisplayName, newUsername);
      }
      navigate("/profile");
    } catch (err) {
      console.error(`Error with Google ${isSignup ? "signup" : "login"}:`, err);
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
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
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
