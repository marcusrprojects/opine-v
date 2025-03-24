import PropTypes from "prop-types";
import { useCallback } from "react";

const TemplateDropdown = ({ templates, onSelect, selectedId }) => {
  const handleChange = useCallback(
    (e) => {
      const selected = templates.find((t) => t.id === e.target.value);
      if (selected) onSelect(selected);
    },
    [templates, onSelect]
  );

  return (
    <div className="template-dropdown">
      <select
        className="text-input"
        id="template-select"
        value={selectedId}
        onChange={handleChange}
      >
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
    </div>
  );
};

TemplateDropdown.propTypes = {
  templates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      tiers: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          color: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  selectedId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default TemplateDropdown;
