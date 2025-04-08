import PropTypes from "prop-types";
import Panel from "./Panel";
import Button from "./Button";
import { FaArrowLeft, FaTrash } from "react-icons/fa";

/**
 * A simple panel that displays:
 * - A "Go Back" button
 * - A "Delete Item" button (only if canDelete is true)
 */
const BackDeletePanel = ({ onBack, onDelete, canDelete }) => {
  return (
    <Panel>
      {/* Back Button */}
      <Button onClick={onBack} title="Go Back" icon={FaArrowLeft} />

      {/* Delete Button (shown only if canDelete === true) */}
      {canDelete && (
        <Button onClick={onDelete} title="Delete Item" icon={FaTrash} />
      )}
    </Panel>
  );
};

BackDeletePanel.propTypes = {
  onBack: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  canDelete: PropTypes.bool,
};

export default BackDeletePanel;
