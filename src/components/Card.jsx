import PropTypes from "prop-types";
import "../styles/Card.css";

const Card = ({
  onClick,
  children,
  className = "",
  style = {},
  onMouseEnter,
  onMouseLeave,
}) => {
  const props = {
    className: `card ${className}`,
    onClick,
    style,
  };

  if (typeof onMouseEnter === "function") {
    props.onMouseEnter = onMouseEnter;
  }

  if (typeof onMouseLeave === "function") {
    props.onMouseLeave = onMouseLeave;
  }

  return <div {...props}>{children}</div>;
};

Card.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

export default Card;
