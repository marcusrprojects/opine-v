import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styles/FollowList.css";
import PropTypes from "prop-types";
import BackPanel from "./Navigation/BackPanel";

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
          const followList =
            mode === "followers" ? userData.followers : userData.following;
          setUsers(followList || []);
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
          {users.map((followerId) => (
            <li key={followerId} className="follow-item">
              <span className="username">@{followerId}</span>{" "}
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
