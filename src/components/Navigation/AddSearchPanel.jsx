import PropTypes from "prop-types";
import { FaPlus, FaSearch } from "react-icons/fa";
import Panel from "./Panel";
import Button from "./Button";

const AddSearchPanel = ({ onAdd, onToggleSearch, isAddDisabled }) => {
  return (
    <Panel>
      <Button
        onClick={onAdd}
        title="Add Category"
        icon={FaPlus}
        disabled={isAddDisabled}
      />
      <Button
        onClick={onToggleSearch}
        title="Search Categories"
        icon={FaSearch}
      />
    </Panel>
  );
};

AddSearchPanel.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onToggleSearch: PropTypes.func.isRequired,
  isAddDisabled: PropTypes.bool,
};

export default AddSearchPanel;
