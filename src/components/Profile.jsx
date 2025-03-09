import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/useAuth";
import EditLogoutPanel from "./Navigation/EditLogoutPanel";
import "../styles/Profile.css";
import CategoryCollection from "./CategoryCollection";
import { useFollow } from "../context/useFollow";

const Profile = ({ userId = null }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { following, toggleFollow } = useFollow();
  const isCurrentUser = userId === null || userId === user?.uid;
  const isFollowing = user && userId && following.has(userId);

  // State for dynamically loaded display name and username
  const [displayName, setDisplayName] = useState(
    isCurrentUser ? user?.name : "Anonymous"
  );
  const [username, setUsername] = useState(
    isCurrentUser ? user?.username : "unknown"
  );

  // Redirect guests to login page
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch display name & username if viewing another user’s profile
  useEffect(() => {
    if (!isCurrentUser && userId) {
      const fetchUserProfile = async () => {
        try {
          const userDocRef = doc(db, "users", userId);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setDisplayName(userData.name || "Anonymous");
            setUsername(userData.username || "unknown");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setDisplayName("Unknown User");
          setUsername("unknown");
        }
      };

      fetchUserProfile();
    }
  }, [userId, isCurrentUser]);

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <EditLogoutPanel onEdit={handleEditProfile} onLogout={logout} />
      <div className="profile-header">
        <h2>{displayName}</h2>
        <h3>@{username}</h3>

        {/* Show Follow Button only for other users */}
        {!isCurrentUser && (
          <button
            className="follow-button"
            onClick={() => toggleFollow(userId)}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>
      <div className="profile-categories-section">
        <CategoryCollection />
      </div>
    </div>
  );
};

Profile.propTypes = {
  userId: PropTypes.string,
};

export default Profile;
