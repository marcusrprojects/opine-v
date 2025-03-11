import PropTypes from "prop-types";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import TextInput from "./TextInput";
import RadioInput from "./RadioInput";
import "../styles/FieldManager.css";

const FieldManager = ({
  fields,
  setFields,
  primaryFieldIndex,
  setPrimaryFieldIndex,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleAddField = (index) => {
    const updatedFields = [...fields];
    updatedFields.splice(index + 1, 0, { name: "" }); // Insert new field below the current one
    setFields(updatedFields);
  };

  const handleRemoveField = (index) => {
    if (index === primaryFieldIndex) return; // Prevent removal of primary field
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Needed for drop to work
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedFields = [...fields];
    const [movedField] = updatedFields.splice(draggedIndex, 1);
    updatedFields.splice(index, 0, movedField);
    setFields(updatedFields);

    // Adjust primary field index if moved
    if (primaryFieldIndex === draggedIndex) {
      setPrimaryFieldIndex(index);
    } else if (primaryFieldIndex > draggedIndex && primaryFieldIndex <= index) {
      setPrimaryFieldIndex(primaryFieldIndex - 1);
    } else if (primaryFieldIndex < draggedIndex && primaryFieldIndex >= index) {
      setPrimaryFieldIndex(primaryFieldIndex + 1);
    }

    setDraggedIndex(null); // Reset dragged item
  };

  return (
    <div className="field-section">
      <label className="edit-label">Fields</label>
      {fields.map((field, index) => (
        <div
          key={index}
          className="field-container"
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(index)}
        >
          {/* Primary Field Radio Button */}
          <label className="primary-field-radio">
            <RadioInput
              name="primaryField"
              checked={primaryFieldIndex === index}
              onChange={() => setPrimaryFieldIndex(index)}
              className="primary-field"
            />
          </label>

          {/* Text Input for Field Name */}
          <TextInput
            value={field.name}
            onChange={(e) => {
              const updatedFields = [...fields];
              updatedFields[index].name = e.target.value;
              setFields(updatedFields);
            }}
          />

          {/* Action Buttons */}
          <div className="field-actions">
            {/* Minus Button (Cannot Remove Primary Field) */}
            <FaMinus
              className={`delete-icon ${
                primaryFieldIndex === index ? "primary-delete" : ""
              }`}
              onClick={() => handleRemoveField(index)}
              title="Remove field"
            />

            {/* Plus Button (Only on Last Field) */}
            {index === fields.length - 1 && (
              <FaPlus
                className="add-field-icon"
                onClick={() => handleAddField(index)}
                title="Add field"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

FieldManager.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  setFields: PropTypes.func.isRequired,
  primaryFieldIndex: PropTypes.number.isRequired,
  setPrimaryFieldIndex: PropTypes.func.isRequired,
};

export default FieldManager;
