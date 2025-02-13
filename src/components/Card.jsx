import PropTypes from "prop-types";
import "../styles/Card.css";

const Card = ({ onClick, children }) => {
  return (
    <div className="card" onClick={onClick}>
      {children}
    </div>
  );
};

Card.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default Card;
