import PropTypes from "prop-types";
import { FaTimes, FaCheck, FaLock, FaLockOpen } from "react-icons/fa";
import Panel from "./Panel";
import Button from "./Button";
import { UserPrivacy, CategoryPrivacy } from "../../enums/PrivacyEnums";

const ActionPanel = ({
  onCancel,
  onConfirm,
  isConfirmDisabled,
  onTogglePrivacy,
  privacy,
}) => {
  let PrivacyIcon = null;
  if (onTogglePrivacy && typeof privacy === "string") {
    if (
      privacy === UserPrivacy.PRIVATE ||
      privacy === CategoryPrivacy.ONLY_ME
    ) {
      PrivacyIcon = FaLock;
    } else {
      PrivacyIcon = FaLockOpen;
    }
  }

  return (
    <Panel>
      <Button onClick={onCancel} title="Cancel" icon={FaTimes} />
      {onTogglePrivacy && PrivacyIcon && (
        <Button
          onClick={onTogglePrivacy}
          title="Toggle Privacy"
          icon={PrivacyIcon}
        />
      )}
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
  onTogglePrivacy: PropTypes.func,
  privacy: PropTypes.string,
};

export default ActionPanel;
