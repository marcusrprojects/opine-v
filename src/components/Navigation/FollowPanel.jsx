import PropTypes from "prop-types";
// import "../styles/FollowPanel.css";

const FollowPanel = ({ isFollowing, onToggleFollow }) => {
  return (
    <div className="follow-panel">
      <button className="follow-button" onClick={onToggleFollow}>
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
};

FollowPanel.propTypes = {
  isFollowing: PropTypes.bool.isRequired,
  onToggleFollow: PropTypes.func.isRequired,
};

export default FollowPanel;
