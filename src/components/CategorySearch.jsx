import PropTypes from "prop-types";
import TextInput from "./TextInput";
import "../styles/CategorySearch.css";

const CategorySearch = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search categories...",
}) => {
  return (
    <div className="search-container">
      <TextInput
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="search-input" // Optional: extra classes specific to search styling
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
