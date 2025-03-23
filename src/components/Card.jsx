import PropTypes from "prop-types";
import "../styles/Card.css";

const Card = ({ onClick, children, className = "" }) => {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

Card.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
