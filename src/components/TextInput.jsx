import PropTypes from "prop-types";
import "../styles/TextInput.css";

const TextInput = ({
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  ...rest
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`text-input ${className}`}
      {...rest}
    />
  );
};

TextInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default TextInput;
