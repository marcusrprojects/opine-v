import PropTypes from "prop-types";
import "../styles/NavPanel.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const NavPanel = ({
  onBack,
  onNext,
  isBackDisabled,
  isNextDisabled,
  currentStep,
  totalSteps,
}) => {
  const progress = (currentStep / totalSteps) * 100; // Calculate progress percentage

  return (
    <>
      {/* Full-Width Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Navigation Buttons */}
      <div className="floating-nav-panel">
        <button
          className="nav-button"
          onClick={onBack}
          title="Go Back"
          disabled={isBackDisabled}
        >
          <FaArrowLeft />
        </button>
        <button
          className="nav-button"
          onClick={onNext}
          title="Next Step"
          disabled={isNextDisabled}
        >
          <FaArrowRight />
        </button>
      </div>
    </>
  );
};

NavPanel.propTypes = {
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  isBackDisabled: PropTypes.bool.isRequired,
  isNextDisabled: PropTypes.bool.isRequired,
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
};

export default NavPanel;
