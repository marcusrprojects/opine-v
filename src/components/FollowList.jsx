import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDoc,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { useEffect, useState, useContext } from "react";
import { db } from "../firebaseConfig";
import BackPanel from "./Navigation/BackPanel";
import FollowCard from "./FollowCard";
import FollowRequestCard from "./FollowRequestCard";
import { FollowListMode } from "../enums/ModeEnums";
import "../styles/FollowList.css";
import UserCacheContext from "../context/UserCacheContext";

const FollowList = ({ mode, className = "" }) => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getUserInfo } = useContext(UserCacheContext);

  const title = {
    [FollowListMode.FOLLOWERS]: "Followers",
    [FollowListMode.FOLLOWING]: "Following",
    [FollowListMode.FOLLOW_REQUESTS]: "Follow Requests",
  }[mode];

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!uid) return;
      setLoading(true);
      try {
        const userSnapshot = await getDoc(doc(db, "users", uid));
        if (!userSnapshot.exists()) return setUsers([]);

        const data = userSnapshot.data();
        const ids =
          mode === FollowListMode.FOLLOWERS
            ? data.followers
            : mode === FollowListMode.FOLLOWING
            ? data.following
            : data.followRequests;

        if (!ids || ids.length === 0) return setUsers([]);

        // For each id, use the cache to get basic info.
        const promises = ids.map(async (id) => {
          const info = getUserInfo(id);
          return {
            id,
            name: info ? info.name : "Anonymous",
            username: info ? info.username : "unknown",
          };
        });

        const results = (await Promise.all(promises)).filter(Boolean);
        setUsers(results);
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowData();
  }, [uid, mode, title, getUserInfo]);

  const handleApprove = async (requesterId) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        followRequests: arrayRemove(requesterId),
        followers: arrayUnion(requesterId),
      });
      await updateDoc(doc(db, "users", requesterId), {
        following: arrayUnion(uid),
      });
      setUsers((prev) => prev.filter((u) => u.id !== requesterId));
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleReject = async (requesterId) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        followRequests: arrayRemove(requesterId),
      });
      setUsers((prev) => prev.filter((u) => u.id !== requesterId));
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  return (
    <div className="follow-list-container">
      {mode !== FollowListMode.FOLLOW_REQUESTS && (
        <>
          <BackPanel onBack={() => navigate(`/profile/${uid}`)} />
          <h2>{title}</h2>
        </>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : users.length > 0 ? (
        <ul className="follow-list">
          {users.map((user) => (
            <li key={user.id} className="follow-item">
              {mode === FollowListMode.FOLLOW_REQUESTS ? (
                <FollowRequestCard
                  user={user}
                  onApprove={() => handleApprove(user.id)}
                  onReject={() => handleReject(user.id)}
                  className={className}
                />
              ) : (
                <FollowCard
                  user={user}
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className={className}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No {title.toLowerCase()} yet.</p>
      )}
    </div>
  );
};

FollowList.propTypes = {
  mode: PropTypes.oneOf(Object.values(FollowListMode)).isRequired,
  className: PropTypes.string,
};

export default FollowList;
