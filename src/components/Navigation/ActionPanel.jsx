import PropTypes from "prop-types";
import { FaTimes, FaCheck } from "react-icons/fa";
import Panel from "./Panel";
import Button from "./Button";

const ActionPanel = ({ onCancel, onConfirm, isConfirmDisabled }) => {
  return (
    <Panel>
      <Button onClick={onCancel} title="Cancel" icon={FaTimes} />
      <Button
        onClick={onConfirm}
        title="Confirm"
        icon={FaCheck}
        disabled={isConfirmDisabled}
      />
    </Panel>
  );
};

ActionPanel.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isConfirmDisabled: PropTypes.bool.isRequired,
};

export default ActionPanel;
