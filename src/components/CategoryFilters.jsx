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
        {fields.map((fieldObj) => (
          <div key={fieldObj.id} className="filter-checkbox-container">
            <label className="filter-field">
              <input
                type="checkbox"
                checked={filterFieldsSelected.some((f) => f.id === fieldObj.id)}
                onChange={() =>
                  onFilterFieldChange({ id: fieldObj.id, name: fieldObj.name })
                }
              />
              {fieldObj.name}
            </label>
          </div>
        ))}
      </div>
      <div className="filter-inputs">
        {filterFieldsSelected.map(({ id, name }) => (
          <div key={id} className="filter-input-container">
            <TextInput
              placeholder={`Filter by ${name}`}
              value={filters[id] || ""}
              onChange={(e) => onFilterChange(id, e.target.value)}
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
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      active: PropTypes.bool,
    })
  ).isRequired,
  filterFieldsSelected: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onFilterFieldChange: PropTypes.func.isRequired,
};

export default CategoryFilters;
