import PropTypes from "prop-types";

const Button = ({ onClick, title, icon: Icon, disabled }) => {
  return (
    <button
      className="panel-button"
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      <Icon />
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  disabled: PropTypes.bool,
};

export default Button;
