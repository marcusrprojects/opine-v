import PropTypes from "prop-types";
import Card from "./Card";
// import "../styles/FollowCard.css";

const FollowCard = ({ user, onClick, className = "" }) => {
  return (
    <Card onClick={onClick} className={className}>
      <h4 className="card-name">{user.name}</h4>
      <p className="card-username">@{user.username}</p>
    </Card>
  );
};

FollowCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default FollowCard;
