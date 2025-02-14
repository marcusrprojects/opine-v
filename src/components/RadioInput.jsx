import PropTypes from "prop-types";
import "../styles/RadioInput.css";

const RadioInput = ({ name, checked, onChange, className = "", ...rest }) => {
  return (
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      className={`radio-input ${className}`}
      {...rest}
    />
  );
};

RadioInput.propTypes = {
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default RadioInput;
