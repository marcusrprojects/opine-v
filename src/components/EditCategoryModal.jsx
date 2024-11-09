import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaTrash } from 'react-icons/fa';
import "../styles/EditCategoryModal.css";

const EditCategoryModal = ({ fields, onSave, onClose }) => {
  const [newField, setNewField] = useState("");

  const handleAddField = () => {
    if (newField && !fields.includes(newField) && newField !== "notes") {
      onSave([...fields, newField]);
      setNewField("");
    }
  };

  const handleRemoveField = (field) => {
    onSave(fields.filter(f => f !== field));
  };

  return (
    <div className="modal">
      <h3>Edit Fields</h3>
      <ul>
        {fields.map(field => (
          <li key={field}>
            {field}
            {field !== "Notes" && (
              <FaTrash className="icon delete-icon" onClick={() => handleRemoveField(field)} />
            )}
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Add new field"
        value={newField}
        onChange={(e) => setNewField(e.target.value)}
      />
      <button onClick={handleAddField}>Add Field</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

// Define prop types
EditCategoryModal.propTypes = {
    fields: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  };
  
  export default EditCategoryModal;