import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/useAuth";
import EditLogoutPanel from "./Navigation/EditLogoutPanel";
import FollowPanel from "./Navigation/FollowPanel";
import "../styles/Profile.css";
import CategoryCollection from "./CategoryCollection";
import { useFollow } from "../context/useFollow";
import {
  CategoryCollectionMode,
  FollowStatus,
  FollowListMode,
} from "../enums/ModeEnums";
import FollowList from "./FollowList";
import { UserPrivacy } from "../enums/PrivacyEnums";

const Profile = () => {
  const { user } = useAuth();
  const { uid } = useParams();
  const navigate = useNavigate();
  const { following, followRequests, toggleFollow } = useFollow();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFollowRequests, setShowFollowRequests] = useState(false);

  const isCurrentUser = user && uid === user.uid;

  const followStatus = useMemo(() => {
    if (!user || !uid) return FollowStatus.NONE;
    if (following.has(uid)) return FollowStatus.FOLLOWING;
    if (followRequests.has(uid)) return FollowStatus.PENDING;
    return FollowStatus.NONE;
  }, [user, uid, following, followRequests]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!uid) {
        navigate(user?.uid ? `/profile/${user.uid}` : "/login");
        return;
      }

      try {
        const userDocRef = doc(db, "users", uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          setProfileData(userSnapshot.data());
        } else {
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

  const toggleFollowRequests = () => {
    setShowFollowRequests((prev) => !prev);
  };

  const hasFollowRequests =
    isCurrentUser &&
    profileData?.creatorPrivacy === UserPrivacy.PRIVATE &&
    Array.isArray(profileData.followRequests) &&
    profileData.followRequests.length > 0;

  return (
    <div className="profile-container">
      {isCurrentUser ? (
        <>
          <EditLogoutPanel
            onEdit={() => navigate("/profile/edit")}
            onToggleFollowRequests={toggleFollowRequests}
            showFollowRequests={showFollowRequests}
            hasFollowRequests={hasFollowRequests}
          />
          {showFollowRequests && (
            <FollowList mode={FollowListMode.FOLLOW_REQUESTS} />
          )}
        </>
      ) : (
        <FollowPanel
          followStatus={followStatus}
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
        <CategoryCollection mode={CategoryCollectionMode.USER} userId={uid} />
        <h3>Liked Categories</h3>
        <CategoryCollection
          mode={CategoryCollectionMode.LIKED_BY_USER}
          userId={uid}
        />
      </div>
    </div>
  );
};

export default Profile;
