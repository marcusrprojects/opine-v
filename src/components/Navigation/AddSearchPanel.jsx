import PropTypes from "prop-types";
import { FaPlus, FaSearch } from "react-icons/fa";
import Panel from "./Panel";
import Button from "./Button";
import SortSelector from "../SortSelector";
import SortOptions from "../../enums/SortOptions";

const AddSearchPanel = ({
  onAdd,
  onToggleSearch,
  isAddDisabled,
  sortOption,
  setSortOption,
}) => {
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
      <SortSelector sortOption={sortOption} onSortChange={setSortOption} />
    </Panel>
  );
};

AddSearchPanel.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onToggleSearch: PropTypes.func.isRequired,
  isAddDisabled: PropTypes.bool,
  sortOption: PropTypes.oneOf(Object.values(SortOptions)).isRequired,
  setSortOption: PropTypes.func.isRequired,
};

export default AddSearchPanel;
