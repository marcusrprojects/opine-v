import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import EditLogoutPanel from "./Navigation/EditLogoutPanel";
import "../styles/Profile.css";
import CategoryCollection from "./CategoryCollection";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <EditLogoutPanel onEdit={handleEditProfile} />
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
