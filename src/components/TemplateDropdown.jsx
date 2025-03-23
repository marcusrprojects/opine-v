import PropTypes from "prop-types";
import { useCallback } from "react";
// import "../styles/TemplateDropdown.css";

const TemplateDropdown = ({ templates, onSelect }) => {
  const handleChange = useCallback(
    (e) => {
      const selected = templates.find((t) => t.id === e.target.value);
      if (selected) onSelect(selected);
    },
    [templates, onSelect]
  );

  return (
    <div className="template-dropdown">
      <label htmlFor="template-select">Preset</label>
      <select id="template-select" onChange={handleChange}>
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
  onSelect: PropTypes.func.isRequired,
};

export default TemplateDropdown;
