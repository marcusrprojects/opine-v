import PropTypes from "prop-types";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Panel from "./Panel";
import Button from "./Button";
import ProgressBar from "./ProgressBar";

const NavPanel = ({
  onBack,
  onNext,
  isBackDisabled,
  isNextDisabled,
  currentStep,
  totalSteps,
}) => {
  return (
    <>
      {/* Full-Width Progress Bar */}
      <div>
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Navigation Panel */}
      <Panel>
        <Button
          onClick={onBack}
          title="Go Back"
          icon={FaArrowLeft}
          disabled={isBackDisabled}
        />
        <Button
          onClick={onNext}
          title="Next Step"
          icon={FaArrowRight}
          disabled={isNextDisabled}
        />
      </Panel>
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
