import PropTypes from "prop-types";
import { useState, useEffect, useRef, useCallback } from "react";
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

const SortSelector = ({ sortOption, onSortChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handles selection and propagates change
  const handleOptionSelect = useCallback(
    (value) => {
      onSortChange(value); // Update parent state
      setDropdownOpen(false); // Close dropdown
    },
    [onSortChange]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <div className="sort-selector" ref={dropdownRef}>
      {/* Sort Button */}
      <button
        className="panel-button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        title="Sort Categories"
        aria-label="Sort Categories"
      >
        <FaSort />
      </button>

      {/* Dropdown (Icons Only) */}
      {dropdownOpen && (
        <div
          className={`dropdown sort-dropdown ${dropdownOpen ? "expanded" : ""}`}
        >
          <button
            className={`dropdown-item sort-item ${
              sortOption === SortOptions.UPDATED_DESC ? "active" : ""
            }`}
            onClick={() => handleOptionSelect(SortOptions.UPDATED_DESC)}
            title="Newest First"
          >
            <FaClock />
          </button>
          <button
            className={`dropdown-item sort-item ${
              sortOption === SortOptions.UPDATED_ASC ? "active" : ""
            }`}
            onClick={() => handleOptionSelect(SortOptions.UPDATED_ASC)}
            title="Oldest First"
          >
            <FaRegClock />
          </button>
          <button
            className={`dropdown-item sort-item ${
              sortOption === SortOptions.ALPHA_ASC ? "active" : ""
            }`}
            onClick={() => handleOptionSelect(SortOptions.ALPHA_ASC)}
            title="A-Z"
          >
            <FaSortAlphaDown />
          </button>
          <button
            className={`dropdown-item sort-item ${
              sortOption === SortOptions.ALPHA_DESC ? "active" : ""
            }`}
            onClick={() => handleOptionSelect(SortOptions.ALPHA_DESC)}
            title="Z-A"
          >
            <FaSortAlphaUp />
          </button>
          <button
            className={`dropdown-item sort-item ${
              sortOption === SortOptions.MOST_LIKED ? "active" : ""
            }`}
            onClick={() => handleOptionSelect(SortOptions.MOST_LIKED)}
            title="Most Liked"
          >
            <FaHeart />
          </button>
        </div>
      )}
    </div>
  );
};

// Prop Types
SortSelector.propTypes = {
  sortOption: PropTypes.oneOf(Object.values(SortOptions)).isRequired, // Ensure valid sort option
  onSortChange: PropTypes.func.isRequired, // Ensure function is provided
};

export default SortSelector;
