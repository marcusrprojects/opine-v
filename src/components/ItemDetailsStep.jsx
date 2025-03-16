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
    (field, value) => {
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

  const handleInputChange = (field, value) => {
    const errorMessage = validateField(field, value);

    // Update error state
    setError((prev) => ({
      ...prev,
      [field]: errorMessage,
    }));

    // Notify parent about validation status
    const allFieldsValid = fields.every(
      (field) => !validateField(field, itemData[field] || "")
    );
    onValidationChange(allFieldsValid);

    // Update item data
    updateItemData({ ...itemData, [field]: value });
  };

  useEffect(() => {
    // Initial validation check
    const allFieldsValid = fields.every(
      (field) => !validateField(field, itemData[field] || "")
    );
    onValidationChange(allFieldsValid);
  }, [itemData, fields, onValidationChange, validateField]);

  const handleBlur = (field) => {
    const errorMessage = validateField(field, itemData[field] || "");
    setError((prev) => ({ ...prev, [field]: errorMessage }));
  };

  return (
    <div className="item-details-container">
      <h2>Item Details</h2>
      {fields.map((field, index) => (
        <div key={index}>
          <TextInput
            value={itemData[field] || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={field}
            required
            onBlur={() => handleBlur(field)}
          />
          {error[field] && <p className="error-message">{error[field]}</p>}
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

// PropTypes for validation
ItemDetailsStep.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  itemData: PropTypes.object.isRequired,
  updateItemData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired,
};

export default ItemDetailsStep;
