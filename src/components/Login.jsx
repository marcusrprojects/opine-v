import { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/Authentication.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const { user } = useAuth();
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true });
    }
  }, [user, navigate]);

  // ✅ Function to validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setResetMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile", { replace: true });
    } catch (err) {
      setError("Invalid email or password."); // Generic error message for security
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setResetMessage("");

    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage(
        "If an account exists with this email, a reset link has been sent."
      );
    } catch (err) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">User Account</h2>
      <div className="login-contents">
        <form className="login-form" onSubmit={handleLogin}>
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
              setResetMessage("");
            }}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
              setResetMessage("");
            }}
          />
          <button className="submit-button" type="submit">
            Login
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
        {resetMessage && <p className="success-message">{resetMessage}</p>}

        <p className="switch-link">
          Don&apos;t have an account?
          <button
            className="navigate-button"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
          <button
            className="navigate-button forgot-password"
            onClick={handlePasswordReset}
          >
            Forgot Password?
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
