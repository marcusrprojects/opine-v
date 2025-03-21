import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";
import "../styles/ItemDetailsStep.css";
import TextInput from "./TextInput";

const ItemDetailsStep = ({
  fields,
  itemData,
  updateItemData,
  onValidationChange,
}) => {
  const [error, setError] = useState({});
  const CHAR_LIMIT = 64;

  const validateField = useCallback(
    (fieldName, value) => {
      if (!value.trim()) {
        return "This field is required.";
      }
      if (value.length > CHAR_LIMIT) {
        return `Maximum ${CHAR_LIMIT} characters allowed.`;
      }
      return null;
    },
    [CHAR_LIMIT]
  );

  const handleInputChange = (fieldName, value) => {
    const errorMessage = validateField(fieldName, value);

    // Update error state
    setError((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }));

    // Notify parent about validation status
    const allFieldsValid = fields.every(
      ({ name }) => !validateField(name, itemData[name] || "")
    );
    onValidationChange(allFieldsValid);

    // Update item data
    updateItemData({ ...itemData, [fieldName]: value });
  };

  const handleBlur = (fieldName) => {
    const errorMessage = validateField(fieldName, itemData[fieldName] || "");
    setError((prev) => ({ ...prev, [fieldName]: errorMessage }));
  };

  useEffect(() => {
    const allFieldsValid = fields.every(
      ({ name }) => !validateField(name, itemData[name] || "")
    );
    onValidationChange(allFieldsValid);
  }, [itemData, fields, onValidationChange, validateField]);

  return (
    <div className="item-details-container">
      <h2>Item Details</h2>
      {fields.map(({ name }, index) => (
        <div key={index}>
          <TextInput
            value={itemData[name] || ""}
            onChange={(e) => handleInputChange(name, e.target.value)}
            placeholder={name}
            required
            onBlur={() => handleBlur(name)}
          />
          {error[name] && <p className="error-message">{error[name]}</p>}
        </div>
      ))}

      <textarea
        placeholder="Notes"
        value={itemData.notes || ""}
        onChange={(e) => handleInputChange("notes", e.target.value)}
        rows={4}
        className="text-input notes-field"
      />
    </div>
  );
};

ItemDetailsStep.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  itemData: PropTypes.object.isRequired,
  updateItemData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired,
};

export default ItemDetailsStep;
