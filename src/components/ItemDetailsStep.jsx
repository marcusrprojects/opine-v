import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
import "../styles/ItemDetailsStep.css";

const ItemDetailsStep = ({ 
  primaryField, 
  fields, 
  itemData, 
  updateItemData, 
  isEditable, 
  onValidationChange 
}) => {
  const [error, setError] = useState({}); // Track errors per field
  const CHAR_LIMIT = 32;
  const WORD_CHAR_LIMIT = 15;

  const validateField = useCallback((field, value) => {
    if (!value.trim()) {
      return 'This field is required.';
    }
    if (field === primaryField) {
      if (value.length > CHAR_LIMIT) {
        return `Maximum ${CHAR_LIMIT} characters allowed.`;
      }
      if (value.split(' ').some((word) => word.length > WORD_CHAR_LIMIT)) {
        return `Each word can have up to ${WORD_CHAR_LIMIT} characters.`;
      }
    }
    return null; // No error
  }, [primaryField, CHAR_LIMIT, WORD_CHAR_LIMIT]);

  const handleInputChange = (field, value) => {
    const errorMessage = validateField(field, value);

    // Update error state
    setError((prev) => ({
      ...prev,
      [field]: errorMessage,
    }));

    // Notify parent about validation status
    const allFieldsValid = fields.every(
      (field) => !validateField(field, itemData[field] || '')
    );
    onValidationChange(allFieldsValid);

    // Update item data
    updateItemData({ ...itemData, [field]: value });
  };

  useEffect(() => {
    // Initial validation check
    const allFieldsValid = fields.every(
      (field) => !validateField(field, itemData[field] || '')
    );
    onValidationChange(allFieldsValid);
  }, [itemData, fields, onValidationChange, validateField]);

  const handleBlur = (field) => {
    const errorMessage = validateField(field, itemData[field] || '');
    setError((prev) => ({ ...prev, [field]: errorMessage }));
  };

  return (
    <div className="item-details-step-container">
      <h2>Item Details</h2>
      {fields.map((field, index) => (
        <div key={index} className="input-container">
          <input
            type="text"
            placeholder={field}
            value={itemData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            readOnly={!isEditable}
            className={`field-data ${error[field] ? 'error' : ''}`}
            onBlur={() => handleBlur(field)}
            required
          />
          {error[field] && <p className="error-message">{error[field]}</p>}
        </div>
      ))}

      <div>
        <textarea
          placeholder="Notes"
          value={itemData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          readOnly={!isEditable}
          rows={4}
          className="notes-field"
        />
      </div>
    </div>
  );
};

// PropTypes for validation
ItemDetailsStep.propTypes = {
  primaryField: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  itemData: PropTypes.object.isRequired,
  updateItemData: PropTypes.func.isRequired,
  isEditable: PropTypes.bool.isRequired,
  onValidationChange: PropTypes.func.isRequired,
};

export default ItemDetailsStep;