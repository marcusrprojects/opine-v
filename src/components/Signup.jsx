import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import "../styles/Authentication.css";
import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // State for display name
  const [username, setUsername] = useState(''); // State for username
  const [error, setError] = useState(null); // State to track error messages
  const [isChecking, setIsChecking] = useState(false); // To track username validation
  const auth = getAuth();
  const navigate = useNavigate();

  const addUserToCollection = async (user, displayName, username) => {
    const userDocRef = doc(db, "users", user.uid);
    try {
      await setDoc(userDocRef, {
        uid: user.uid,
        name: displayName,
        username,
        email: user.email,
        likedCategories: [],
      });
      console.log("User successfully added to Firestore");
    } catch (error) {
      console.error("Error adding user to Firestore:", error);
    }
  };

  const isUsernameUnique = async (username) => {
    setIsChecking(true);
    const usersRef = collection(db, "users");
    const usernameQuery = query(usersRef, where("username", "==", username));
    const usernameSnapshot = await getDocs(usernameQuery);
    setIsChecking(false);
    return usernameSnapshot.empty; // Returns true if no users have this username
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors before new attempt

    if (!displayName || !username) {
      setError("Display Name and Username are required.");
      return;
    }

    try {
      const unique = await isUsernameUnique(username);
      if (!unique) {
        setError("Username is already taken. Please choose another.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile with the display name
      await updateProfile(user, { displayName });

      console.log('Signed up:', user);

      // Add the new user to Firestore
      await addUserToCollection(user, displayName, username);

      // Redirect to home or another route on successful signup
      navigate('/');
    } catch (error) {
      setError(error.message); // Set error message to display to user
      console.error('Error signing up:', error.message);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">User Account</h2>
      <div className="signup-contents">
        <form className="signup-form" onSubmit={handleSignup}>
          <input
            className="input-field"
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="submit-button"
            type="submit"
            disabled={isChecking}
          >
            {isChecking ? "Checking..." : "Sign Up"}
          </button>

          {/* Conditionally render error message */}
          {error && <p className="error-message">{error}</p>}
        </form>

        <p className="switch-link">
          Already have an account?
          <button
            className="navigate-button"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;