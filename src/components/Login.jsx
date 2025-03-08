import { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/Authentication.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth(); // ✅ Get user from AuthContext
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigate("/profile")) // ✅ Redirect after successful login
      .catch((error) => {
        setError(error.message);
        console.error("Error logging in:", error.message);
      });
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
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="submit-button" type="submit">
            Login
          </button>
        </form>

        <p className="switch-link">
          Don&apos;t have an account?
          <button
            className="navigate-button"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Login;
