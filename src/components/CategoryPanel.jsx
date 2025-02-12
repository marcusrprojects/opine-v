import PropTypes from "prop-types";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import "../styles/CategoryPanel.css";

const BackPanel = ({ onBack, onAdd, isAddDisabled }) => {
  return (
    <div className="floating-back-panel">
      <button className="nav-back-button" onClick={onBack} title="Go Back">
        <FaArrowLeft />
      </button>
      <button
        className="add-button"
        onClick={onAdd}
        title="Add Item"
        disabled={isAddDisabled}
      >
        <FaPlus />
      </button>
    </div>
  );
};

BackPanel.propTypes = {
  onBack: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  isAddDisabled: PropTypes.bool, // Optional prop to disable the add button
};

export default BackPanel;
