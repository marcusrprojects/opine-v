import PropTypes from "prop-types";
import Card from "./Card";
import { FaCheck, FaTimes } from "react-icons/fa";
import "../styles/FollowRequestCard.css";
import { useNavigate } from "react-router-dom";

const FollowRequestCard = ({ user, onApprove, onReject, className = "" }) => {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/profile/${user.id}`)}
      className={`${className} request-card`}
    >
      <h4 className="card-name">{user.name}</h4>
      <p className="card-username">@{user.username}</p>
      <div className="request-actions">
        <button
          className="approve-button"
          onClick={(e) => {
            e.stopPropagation();
            onApprove(user.id);
          }}
          title="Approve Request"
          aria-label="Approve Request"
        >
          <FaCheck />
        </button>
        <button
          className="reject-button"
          onClick={(e) => {
            e.stopPropagation();
            onReject(user.id);
          }}
          title="Reject Request"
          aria-label="Reject Request"
        >
          <FaTimes />
        </button>
      </div>
    </Card>
  );
};

FollowRequestCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default FollowRequestCard;
