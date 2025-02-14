import PropTypes from "prop-types";
import "../styles/CategorySearch.css";

const CategorySearch = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search categories...",
}) => {
  return (
    <div className="search-container">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
    </div>
  );
};

CategorySearch.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default CategorySearch;
