import PropTypes from "prop-types";
import { useState } from "react";
import { FaMinus, FaPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import TextInput from "./TextInput";
import "../styles/FieldManager.css";
import { generateId } from "../utils/fieldsUtils";

const FieldManager = ({ fields, setFields }) => {
  // Separate active and inactive fields.
  const activeFields = fields.filter((field) => field.active);
  const inactiveFields = fields.filter((field) => !field.active);

  // Drag state for active fields.
  const [draggedIndex, setDraggedIndex] = useState(null);

  const updateFieldName = (id, newName) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, name: newName } : field
      )
    );
  };

  const toggleFieldActive = (id) => {
    const fieldToToggle = fields.find((f) => f.id === id);
    // Prevent deactivating if it's the last active field.
    if (fieldToToggle.active && activeFields.length === 1) return;
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, active: !field.active } : field
      )
    );
  };

  const handleAddField = () => {
    setFields([...fields, { id: generateId(), name: "", active: true }]);
  };

  // Only allow removal for inactive fields.
  const handleRemoveField = (id) => {
    const fieldToRemove = fields.find((f) => f.id === id);
    if (fieldToRemove.active) return; // Remove button only appears for inactive fields.
    setFields(fields.filter((field) => field.id !== id));
  };

  // Drag and drop functions for active fields.
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const active = [...activeFields];
    const [movedField] = active.splice(draggedIndex, 1);
    active.splice(index, 0, movedField);
    // Rebuild fields: active fields in new order, followed by inactive fields.
    setFields([...active, ...inactiveFields]);
    setDraggedIndex(null);
  };

  return (
    <div className="field-section">
      <label className="edit-label">Fields</label>
      <div className="fields-group">
        {/* Active Fields Section */}
        <div className="active-fields">
          <h4>Active Fields</h4>
          {activeFields.map((field, index) => (
            <div
              key={field.id}
              className="field-container"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              <TextInput
                value={field.name}
                className={index === 0 ? "primary-input" : ""}
                onChange={(e) => updateFieldName(field.id, e.target.value)}
                placeholder="Field name"
              />
              <div className="field-actions">
                {/* Toggle icon for active field:
                    Normally shows FaEye; on hover shows FaEyeSlash.
                    Also, if only one active field exists, the toggle is disabled. */}
                <div
                  className={`toggle-icon ${
                    activeFields.length === 1 ? "disabled" : ""
                  }`}
                  onClick={() => toggleFieldActive(field.id)}
                >
                  <span className="icon-normal">
                    <FaEye />
                  </span>
                  <span className="icon-hover">
                    <FaEyeSlash />
                  </span>
                </div>
                {/* Render the add button on the last active field */}
                {index === activeFields.length - 1 && (
                  <span
                    onClick={handleAddField}
                    title="Add field"
                    className="add-field-icon"
                  >
                    <FaPlus />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Inactive Fields Section */}
        {inactiveFields.length > 0 && (
          <div className="inactive-fields">
            <h4>Inactive Fields</h4>
            {inactiveFields.map((field) => (
              <div key={field.id} className="field-container inactive">
                <TextInput
                  value={field.name}
                  onChange={(e) => updateFieldName(field.id, e.target.value)}
                  placeholder="Field name"
                  className="inactive-input"
                />
                <div className="field-actions">
                  {/* Toggle icon for inactive field:
                      Normally shows FaEyeSlash; on hover shows FaEye. */}
                  <div
                    className="toggle-icon"
                    onClick={() => toggleFieldActive(field.id)}
                  >
                    <span className="icon-normal">
                      <FaEyeSlash />
                    </span>
                    <span className="icon-hover">
                      <FaEye />
                    </span>
                  </div>
                  <span
                    onClick={() => handleRemoveField(field.id)}
                    title="Remove field"
                    className="delete-icon"
                  >
                    <FaMinus />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

FieldManager.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      active: PropTypes.bool.isRequired,
    })
  ).isRequired,
  setFields: PropTypes.func.isRequired,
};

export default FieldManager;
