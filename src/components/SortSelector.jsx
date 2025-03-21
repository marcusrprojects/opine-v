import PropTypes from "prop-types";
import { FaSort } from "react-icons/fa";
import SortOptions from "../constants/SortOptions";
// import "../styles/SortSelector.css";

const SortSelector = ({ sortOption, onSortChange }) => {
  return (
    <div className="sort-selector">
      <label htmlFor="sort-select" className="visually-hidden">
        Sort categories
      </label>
      <div className="sort-icon-wrapper" title="Sort Categories">
        <FaSort />
      </div>
      <select
        id="sort-select"
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value={SortOptions.UPDATED_DESC}>Newest First</option>
        <option value={SortOptions.UPDATED_ASC}>Oldest First</option>
        <option value={SortOptions.ALPHA_ASC}>A-Z</option>
        <option value={SortOptions.ALPHA_DESC}>Z-A</option>
        <option value={SortOptions.MOST_LIKED}>Most Liked</option>
      </select>
    </div>
  );
};

SortSelector.propTypes = {
  sortOption: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default SortSelector;
