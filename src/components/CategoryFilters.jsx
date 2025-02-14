import PropTypes from "prop-types";
import "../styles/CategorySettings.css";
import TextInput from "./TextInput";

const CategoryFilters = ({
  fields,
  filterFieldsSelected,
  filters,
  onFilterChange,
  onFilterFieldChange,
}) => {
  return (
    <div className="filter-container open">
      <div className="filter-checkboxes">
        {fields.map((field, index) => (
          <div key={index} className="filter-checkbox-container">
            <label className="filter-field">
              <input
                type="checkbox"
                checked={filterFieldsSelected.includes(field)}
                onChange={() => onFilterFieldChange(field)}
              />
              {field}
            </label>
          </div>
        ))}
      </div>
      <div className="filter-inputs">
        {filterFieldsSelected.map((field) => (
          <div key={field} className="filter-input-container">
            <TextInput
              placeholder={`Filter by ${field}`}
              value={filters[field] || ""}
              onChange={(e) => onFilterChange(field, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

CategoryFilters.propTypes = {
  fields: PropTypes.array.isRequired,
  filterFieldsSelected: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onFilterFieldChange: PropTypes.func.isRequired,
};

export default CategoryFilters;
