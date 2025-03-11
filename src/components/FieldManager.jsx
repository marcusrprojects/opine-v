import PropTypes from "prop-types";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import TextInput from "./TextInput";
import "../styles/FieldManager.css";

const FieldManager = ({ fields, setFields }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleAddField = () => {
    setFields([...fields, { name: "" }]);
  };

  const handleRemoveField = (index) => {
    if (fields.length === 1) return;
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedFields = [...fields];
    const [movedField] = updatedFields.splice(draggedIndex, 1);
    updatedFields.splice(index, 0, movedField);
    setFields(updatedFields);

    setDraggedIndex(null);
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
          {/* Text Input */}
          <TextInput
            value={field.name}
            className={index === 0 ? "primary-input" : ""}
            onChange={(e) => {
              const updatedFields = [...fields];
              updatedFields[index].name = e.target.value;
              setFields(updatedFields);
            }}
          />

          {/* Action Buttons (Keep - on every row, + only on last row) */}
          <div className="field-actions">
            <FaMinus
              className={`delete-icon ${fields.length === 1 ? "disabled" : ""}`}
              onClick={() => handleRemoveField(index)}
              title="Remove field"
            />
            {index === fields.length - 1 && (
              <FaPlus
                className="add-field-icon"
                onClick={handleAddField}
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
};

export default FieldManager;
