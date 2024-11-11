import PropTypes from 'prop-types';
import { FaPlusCircle } from 'react-icons/fa';
import '../styles/AddButton.css';

const AddButton = ({ onClick, size = '3em', className = '' }) => (
  <button onClick={onClick} className={`add-button ${className}`}>
    <FaPlusCircle size={size} />
  </button>
);

AddButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
};

export default AddButton;