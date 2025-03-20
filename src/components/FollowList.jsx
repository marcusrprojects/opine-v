import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styles/FollowList.css";
import PropTypes from "prop-types";
import BackPanel from "./Navigation/BackPanel";
import Card from "./Card";

const FollowList = ({ mode }) => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const title = mode === "followers" ? "Followers" : "Following";

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!uid) return;
      setLoading(true);
      try {
        const userDocRef = doc(db, "users", uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const followIds =
            mode === "followers" ? userData.followers : userData.following;

          if (!followIds || followIds.length === 0) {
            setUsers([]);
            return;
          }

          // 🔹 Fetch user details for each UID
          const userDetailsPromises = followIds.map(async (followId) => {
            const followDocRef = doc(db, "users", followId);
            const followSnapshot = await getDoc(followDocRef);
            if (followSnapshot.exists()) {
              const followData = followSnapshot.data();
              return {
                id: followId,
                name: followData.name || "Anonymous",
                username: followData.username || "unknown",
              };
            }
            return null;
          });

          const resolvedUsers = (await Promise.all(userDetailsPromises)).filter(
            Boolean
          );
          setUsers(resolvedUsers);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowData();
  }, [uid, mode, title]);

  return (
    <div className="follow-list-container">
      <BackPanel onBack={() => navigate(`/profile/${uid}`)} />
      <h2>{title}</h2>

      {loading ? (
        <p>Loading...</p>
      ) : users.length > 0 ? (
        <ul className="follow-list">
          {users.map((user) => (
            <li key={user.id} className="follow-item">
              <Card onClick={() => navigate(`/profile/${user.id}`)}>
                <h4 className="card-name">{user.name}</h4>
                <p className="card-username">@{user.username}</p>
              </Card>
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
  mode: PropTypes.oneOf(["followers", "following"]).isRequired,
};

export default FollowList;
