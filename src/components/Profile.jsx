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

  // State for dynamically loaded user details
  const [displayName, setDisplayName] = useState(
    isCurrentUser ? user?.name : "Anonymous"
  );
  const [username, setUsername] = useState(
    isCurrentUser ? user?.username : "unknown"
  );
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Redirect guests to login page
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (!userId && user.username) {
      navigate(`/profile/${user.username}`);
    }
  }, [user, navigate, userId]);

  // Fetch user profile details including name, username, followers, and following
  useEffect(() => {
    const fetchUserProfile = async () => {
      const targetUserId = isCurrentUser ? user?.uid : userId;
      if (!targetUserId) return;

      try {
        const userDocRef = doc(db, "users", targetUserId);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setDisplayName(userData.name || "Anonymous");
          setUsername(userData.username || "unknown");
          setFollowersCount(userData.followers?.length || 0);
          setFollowingCount(userData.following?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setDisplayName("Unknown User");
        setUsername("unknown");
        setFollowersCount(0);
        setFollowingCount(0);
      }
    };

    fetchUserProfile();
  }, [userId, isCurrentUser, user?.uid]);

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const handleViewFollowers = () => {
    navigate(`/profile/${userId || user?.uid}/followers`);
  };

  const handleViewFollowing = () => {
    navigate(`/profile/${userId || user?.uid}/following`);
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <EditLogoutPanel onEdit={handleEditProfile} onLogout={logout} />
      <div className="profile-header">
        <h2>{displayName}</h2>
        <h3>@{username}</h3>

        {/* Followers & Following Info */}
        <div className="follow-info">
          <span className="follow-link" onClick={handleViewFollowers}>
            {followersCount} Followers
          </span>
          <span className="follow-link" onClick={handleViewFollowing}>
            {followingCount} Following
          </span>
        </div>
      </div>

      {/* Follow/Unfollow Button */}
      {!isCurrentUser && (
        <button className="follow-button" onClick={() => toggleFollow(userId)}>
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}

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
