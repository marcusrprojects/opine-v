import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styles/FollowList.css";
import PropTypes from "prop-types";
import BackPanel from "./Navigation/BackPanel";

const FollowList = ({ mode }) => {
  const { userId } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine title based on mode
  const title = mode === "followers" ? "Followers" : "Following";

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!userId) return;
      setLoading(true);

      try {
        const userDocRef = doc(db, "users", userId);
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
  }, [userId, mode, title]);

  return (
    <div className="follow-list-container">
      <BackPanel onBack={() => navigate(`/profile/${userId}`)} />
      <h2>{title}</h2>

      {loading ? (
        <p>Loading...</p>
      ) : users.length > 0 ? (
        <ul className="follow-list">
          {users.map((user) => (
            <li key={user} className="follow-item">
              <span className="username">@{user}</span>
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
