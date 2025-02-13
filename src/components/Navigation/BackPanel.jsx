import PropTypes from "prop-types";
import Panel from "./Panel";
import Button from "./Button";
import { FaArrowLeft } from "react-icons/fa";

const BackPanel = ({ onBack }) => {
  return (
    <Panel>
      <Button onClick={onBack} title="Go Back" icon={FaArrowLeft} />
    </Panel>
  );
};

BackPanel.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default BackPanel;
