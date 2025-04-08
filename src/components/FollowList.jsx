import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackPanel from "./Navigation/BackPanel";
import FollowCard from "./FollowCard";
import FollowRequestCard from "./FollowRequestCard";
import { FollowListMode } from "../enums/ModeEnums";
import "../styles/FollowList.css";
import { useUserCache } from "../context/useUserCache";

const FollowList = ({ mode, className = "" }) => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getUserInfo } = useUserCache();

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
        const response = await fetch(`/api/getFollowData`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, mode }),
        });
        if (!response.ok) throw new Error("Failed to fetch follow data");
        const data = await response.json();
        setUsers(data.users || []);
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
      const response = await fetch(`/api/approveFollow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, requesterId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Approve failed");
      setUsers((prev) => prev.filter((u) => u.id !== requesterId));
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleReject = async (requesterId) => {
    try {
      const response = await fetch(`/api/rejectFollow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, requesterId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Reject failed");
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
