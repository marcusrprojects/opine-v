import PropTypes from "prop-types";
import { useState } from "react";
import {
  FaSort,
  FaClock,
  FaRegClock,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaHeart,
} from "react-icons/fa";
import SortOptions from "../constants/SortOptions";
import "../styles/SortSelector.css";
import "../styles/TagSelector.css";

const SortSelector = ({ sortOption, onSortChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(sortOption); // Default selection

  const handleOptionSelect = (value) => {
    setSelectedOption(value); // Update local state
    onSortChange(value); // Propagate change
    setDropdownOpen(false);
  };

  return (
    <div className="sort-selector">
      {/* Sort Button */}
      <button
        className="panel-button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        title="Sort Categories"
      >
        <FaSort />
      </button>

      {/* Dropdown (Icons Only) */}
      <div
        className={`dropdown sort-dropdown ${dropdownOpen ? "expanded" : ""}`}
      >
        <div
          className={`dropdown-item sort-item ${
            selectedOption === SortOptions.UPDATED_DESC ? "active" : ""
          }`}
          onClick={() => handleOptionSelect(SortOptions.UPDATED_DESC)}
          title="Newest First"
        >
          <FaClock />
        </div>
        <div
          className={`dropdown-item sort-item ${
            selectedOption === SortOptions.UPDATED_ASC ? "active" : ""
          }`}
          onClick={() => handleOptionSelect(SortOptions.UPDATED_ASC)}
          title="Oldest First"
        >
          <FaRegClock />
        </div>
        <div
          className={`dropdown-item sort-item ${
            selectedOption === SortOptions.ALPHA_ASC ? "active" : ""
          }`}
          onClick={() => handleOptionSelect(SortOptions.ALPHA_ASC)}
          title="A-Z"
        >
          <FaSortAlphaDown />
        </div>
        <div
          className={`dropdown-item sort-item ${
            selectedOption === SortOptions.ALPHA_DESC ? "active" : ""
          }`}
          onClick={() => handleOptionSelect(SortOptions.ALPHA_DESC)}
          title="Z-A"
        >
          <FaSortAlphaUp />
        </div>
        <div
          className={`dropdown-item sort-item ${
            selectedOption === SortOptions.MOST_LIKED ? "active" : ""
          }`}
          onClick={() => handleOptionSelect(SortOptions.MOST_LIKED)}
          title="Most Liked"
        >
          <FaHeart />
        </div>
      </div>
    </div>
  );
};

SortSelector.propTypes = {
  sortOption: PropTypes.oneOf(Object.values(SortOptions)).isRequired, // Ensures initial sorting state
  onSortChange: PropTypes.func.isRequired, // Function to update sorting
};

export default SortSelector;
