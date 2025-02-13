import PropTypes from "prop-types";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import Panel from "./Panel";
import Button from "./Button";

const CategoryPanel = ({ onBack, onAdd, isAddDisabled }) => {
  return (
    <Panel>
      <Button onClick={onBack} title="Go Back" icon={FaArrowLeft} />
      <Button
        onClick={onAdd}
        title="Add Item"
        icon={FaPlus}
        disabled={isAddDisabled}
      />
    </Panel>
  );
};

CategoryPanel.propTypes = {
  onBack: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  isAddDisabled: PropTypes.bool,
};

export default CategoryPanel;
