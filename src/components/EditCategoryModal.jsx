import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaTrash } from 'react-icons/fa';
import "../styles/EditCategoryModal.css";

const EditCategoryModal = ({ fields, primaryField, categoryName, onNameChange, onSave, onClose }) => {
  const [newField, setNewField] = useState("");
  const [primaryFieldIndex, setPrimaryFieldIndex] = useState(fields.indexOf(primaryField));
  const [editableCategoryName, setEditableCategoryName] = useState(categoryName);

  const handleAddField = () => {
    if (newField && !fields.includes(newField) && newField !== "Notes") {
      const updatedFields = [...fields, newField];
      onSave(updatedFields, updatedFields[primaryFieldIndex] || updatedFields[0]);
      setNewField("");
    }
  };

  const handleRemoveField = (field) => {
    if (field === fields[primaryFieldIndex]) {
      alert("You must select a new primary field before deleting this one.");
      return;
    }
    const updatedFields = fields.filter(f => f !== field);
    onSave(updatedFields, updatedFields[primaryFieldIndex] || updatedFields[0]);
  };

  const handlePrimaryFieldChange = (index) => {
    setPrimaryFieldIndex(index);
    onSave(fields, fields[index]);
  };

  const handleCategoryNameChange = () => {
    onNameChange(editableCategoryName);
  };

  return (
    <div className="modal">
      <input
        type="text"
        className="category-name-input"
        value={editableCategoryName}
        onChange={(e) => setEditableCategoryName(e.target.value)}
        onBlur={handleCategoryNameChange}
        placeholder="Category Name"
      />
      <ul>
        {fields.map((field, index) => (
          <li key={field} className="field-item">
            <label className="primary-field-radio">
              <input
                type="radio"
                name="primaryField"
                checked={primaryFieldIndex === index}
                onChange={() => handlePrimaryFieldChange(index)}
              />
              {primaryFieldIndex === index && (
                <span className="tooltip">Primary Field</span>
              )}
            </label>
            {field}
            <FaTrash
              className="icon delete-icon"
              onClick={() => handleRemoveField(field)}
            />
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Add new field..."
        value={newField}
        onChange={(e) => setNewField(e.target.value)}
      />
      <button onClick={handleAddField}>Add Field</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

EditCategoryModal.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  primaryField: PropTypes.string.isRequired,
  categoryName: PropTypes.string.isRequired,
  onNameChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditCategoryModal;