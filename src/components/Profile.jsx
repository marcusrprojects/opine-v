import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/useAuth";
import EditLogoutPanel from "./Navigation/EditLogoutPanel";
import FollowPanel from "./Navigation/FollowPanel";
import "../styles/Profile.css";
import CategoryCollection from "./CategoryCollection";
import { useFollow } from "../context/useFollow";

const Profile = () => {
  const { user, logout } = useAuth();
  const { uid } = useParams();
  const navigate = useNavigate();
  const { following, toggleFollow } = useFollow();

  // State for user profile
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isCurrentUser = user && uid === user.uid;
  const isFollowing = !!(user && uid && following?.has(uid));

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!uid) {
        if (user?.uid) {
          navigate(`/profile/${user.uid}`);
        } else {
          navigate("/login");
        }
        return;
      }

      try {
        const userDocRef = doc(db, "users", uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          setProfileData(userSnapshot.data());
        } else {
          console.warn("User not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [uid, user, navigate]);

  if (loading) return <p>Loading...</p>;
  if (!profileData) return <p>User not found.</p>;

  const handleViewFollowers = () => {
    navigate(`/profile/${uid}/followers`);
  };

  const handleViewFollowing = () => {
    navigate(`/profile/${uid}/following`);
  };

  return (
    <div className="profile-container">
      {isCurrentUser ? (
        <EditLogoutPanel
          onEdit={() => navigate("/profile/edit")}
          onLogout={logout}
        />
      ) : (
        <FollowPanel
          isFollowing={isFollowing}
          onToggleFollow={() => (user ? toggleFollow(uid) : navigate("/login"))}
        />
      )}

      <div className="profile-header">
        <h2>{profileData.name || "Anonymous"}</h2>
        <h3>@{profileData.username || "unknown"}</h3>
        <div className="follow-info">
          <span className="follow-link" onClick={handleViewFollowers}>
            {profileData.followers?.length || 0} Followers
          </span>
          <span className="follow-link" onClick={handleViewFollowing}>
            {profileData.following?.length || 0} Following
          </span>
        </div>
      </div>

      <div className="profile-categories-section">
        <h3>Categories</h3>
        <CategoryCollection mode="user" userId={uid} />
        <h3>Liked Categories</h3>
        <CategoryCollection mode="likedByUser" userId={uid} />
      </div>
    </div>
  );
};

export default Profile;
