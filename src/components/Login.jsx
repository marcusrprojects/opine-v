import { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/Authentication.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile", { replace: true });
    } catch {
      setError("Invalid email or password."); // Generic error message
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
          <button className="submit-button" type="submit">
            Login
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

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
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
