import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Authentication.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const auth = getAuth();
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Simple email validation (same as login)
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "If an account exists, a reset link has been sent to your email."
      );
      setTimeout(() => navigate("/login"), 4000); // Redirect after 4 sec
    } catch {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Reset Password</h2>
      <div className="login-contents">
        <form className="login-form" onSubmit={handlePasswordReset}>
          <input
            className="input-field"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="submit-button" type="submit">
            Send Reset Link
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <p className="switch-link">
          Remembered your password?
          <button
            className="navigate-button"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
