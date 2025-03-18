import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../firebaseConfig";

import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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

  // Function to create a user profile in Firestore
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

  // Handle Email Signup/Login
  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      if (isSignup) {
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
    } catch (error) {
      console.error(`Error ${isSignup ? "signing up" : "logging in"}:`, error);
    }
  };

  // Handle Google Signup/Login
  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        if (isSignup) {
          const newDisplayName = prompt("Enter your display name:");
          const newUsername = prompt("Choose a username:");

          if (!newDisplayName || !newUsername) {
            alert("Both display name and username are required.");
            return;
          }

          await createUserProfile(user, newDisplayName, newUsername);
        }
      }
      navigate("/profile");
    } catch (error) {
      console.error(
        `Error with Google ${isSignup ? "signup" : "login"}:`,
        error
      );
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
      </form>

      <p className="switch-link">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <span
          className="navigate-button"
          onClick={() => navigate(isSignup ? "/login" : "/signup")}
        >
          {isSignup ? "Login here" : "Sign up here"}
        </span>
      </p>
    </div>
  );
};

AuthForm.propTypes = {
  mode: PropTypes.oneOf(["signup", "login"]).isRequired,
};

export default AuthForm;
