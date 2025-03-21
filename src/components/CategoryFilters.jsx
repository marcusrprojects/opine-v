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
        {fields.map((fieldObj, index) => (
          <div key={index} className="filter-checkbox-container">
            <label className="filter-field">
              <input
                type="checkbox"
                checked={filterFieldsSelected.some(
                  (f) => f.name === fieldObj.name
                )}
                onChange={() => onFilterFieldChange(fieldObj)}
              />
              {fieldObj.name}
            </label>
          </div>
        ))}
      </div>
      <div className="filter-inputs">
        {filterFieldsSelected.map(({ name }) => (
          <div key={name} className="filter-input-container">
            <TextInput
              placeholder={`Filter by ${name}`}
              value={filters[name] || ""}
              onChange={(e) => onFilterChange(name, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

CategoryFilters.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  filterFieldsSelected: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onFilterFieldChange: PropTypes.func.isRequired,
};

export default CategoryFilters;
