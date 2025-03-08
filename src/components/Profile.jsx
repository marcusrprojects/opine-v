import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import EditPanel from "../components/Navigation/EditPanel"; // New panel for edit button
import "../styles/Profile.css";
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

  const handleEditProfile = () => {
    navigate("./edit");
  };

  return (
    <div className="profile-container">
      <EditPanel onEdit={handleEditProfile} />
      <div className="profile-header">
        <h2>{user.name || "Anonymous"}</h2>
        <h3>@{user.username || "unknown"}</h3>
      </div>
      <div className="profile-categories-section">
        <CategoryCollection />
      </div>
    </div>
  );
};

export default Profile;
