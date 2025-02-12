import PropTypes from "prop-types";
import "../styles/ActionPanel.css";
import { FaTimes, FaCheck } from "react-icons/fa"; // Icons for Cancel and OK

const ActionPanel = ({ onCancel, onConfirm, isConfirmDisabled }) => {
  return (
    <div className="floating-action-panel">
      <button
        className="action-button cancel-button"
        onClick={onCancel}
        title="Cancel"
      >
        <FaTimes />
      </button>
      <button
        className="action-button confirm-button"
        onClick={onConfirm}
        title="Confirm"
        disabled={isConfirmDisabled}
      >
        <FaCheck />
      </button>
    </div>
  );
};

ActionPanel.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isConfirmDisabled: PropTypes.bool.isRequired,
};

export default ActionPanel;
