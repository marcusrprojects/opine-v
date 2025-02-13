import PropTypes from "prop-types";
import { FaPlus } from "react-icons/fa";
import Panel from "./Panel";
import Button from "./Button";

const AddPanel = ({ onAdd, isAddDisabled }) => {
  return (
    <Panel>
      <Button
        onClick={onAdd}
        title="Add Category"
        icon={FaPlus}
        disabled={isAddDisabled}
      />
    </Panel>
  );
};

AddPanel.propTypes = {
  onAdd: PropTypes.func.isRequired,
  isAddDisabled: PropTypes.bool,
};

export default AddPanel;
