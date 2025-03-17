import PropTypes from "prop-types";
import Panel from "./Panel";
import Button from "./Button";
import { FaArrowLeft } from "react-icons/fa";

/**
 * A simple panel that displays:
 * - A "Go Back" button
 */
const BackPanel = ({ onBack }) => {
  return (
    <Panel>
      {/* Back Button */}
      <Button onClick={onBack} title="Go Back" icon={FaArrowLeft} />
    </Panel>
  );
};

BackPanel.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default BackPanel;
