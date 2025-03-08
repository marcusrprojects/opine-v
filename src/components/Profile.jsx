import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import { FaEdit } from "react-icons/fa";
import CategoryCollection from "./CategoryCollection";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="login-prompt">
        <h2>Profile</h2>
        <p>
          Please log in or sign up to view your categories and liked categories.
        </p>
        <div className="auth-buttons">
          <button className="login-button" onClick={() => navigate("/login")}>
            Log In
          </button>
          <button className="signup-button" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{user.name || "Anonymous"}</h2>
        <h3>@{user.username || "unknown"}</h3>
        <button
          className="edit-profile-button"
          onClick={() => navigate("/edit-profile")}
        >
          <FaEdit />
        </button>
      </div>
      <div className="profile-categories-section">
        <CategoryCollection />
      </div>
    </div>
  );
};

export default Profile;
