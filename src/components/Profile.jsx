import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/useAuth";
import EditLogoutPanel from "./Navigation/EditLogoutPanel";
import FollowPanel from "./Navigation/FollowPanel";
import "../styles/Profile.css";
import CategoryCollection from "./CategoryCollection";
import FollowList from "./FollowList";
import {
  CategoryCollectionMode,
  FollowStatus,
  FollowListMode,
} from "../enums/ModeEnums";
import { UserPrivacy } from "../enums/PrivacyEnums";
import { useUserData } from "../context/useUserData";
import { FaLock } from "react-icons/fa";

const Profile = () => {
  const { user } = useAuth();
  const { uid } = useParams();
  const navigate = useNavigate();
  const { toggleFollow } = useUserData();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFollowRequests, setShowFollowRequests] = useState(false);

  const isCurrentUser = user && uid === user.uid;

  // Compute followStatus using the target user's document data:
  const followStatus = useMemo(() => {
    if (!user || !uid) return FollowStatus.NONE;
    if (profileData?.followers?.includes(user.uid))
      return FollowStatus.FOLLOWING;
    if (profileData?.followRequests?.includes(user.uid))
      return FollowStatus.PENDING;
    return FollowStatus.NONE;
  }, [user, uid, profileData]);

  const hasFollowRequests = useMemo(() => {
    return (
      isCurrentUser &&
      profileData?.creatorPrivacy === UserPrivacy.PRIVATE &&
      Array.isArray(profileData.followRequests) &&
      profileData.followRequests.length > 0
    );
  }, [isCurrentUser, profileData]);

  useEffect(() => {
    if (!uid) {
      navigate(user?.uid ? `/profile/${user.uid}` : "/login");
      return;
    }

    const userDocRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfileData(snapshot.data());
        } else {
          navigate("/");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
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
          {showFollowRequests && hasFollowRequests && (
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
        <h2 className="profile-header-name">
          {profileData.name || "Anonymous"}{" "}
          <span className="profile-username">
            (@{profileData.username || "unknown"})
          </span>
          {profileData.creatorPrivacy === "private" && (
            <FaLock className="profile-lock" title="Private Profile" />
          )}
        </h2>
        {profileData.bio && <p className="profile-bio">{profileData.bio}</p>}
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
        <CategoryCollection mode={CategoryCollectionMode.USER} userId={uid} />
        <h3 className="category-section-header">Liked</h3>
        <CategoryCollection
          mode={CategoryCollectionMode.LIKED_BY_USER}
          userId={uid}
        />
      </div>
    </div>
  );
};

export default Profile;
