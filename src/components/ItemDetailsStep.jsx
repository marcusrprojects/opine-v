import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";
import "../styles/ItemDetailsStep.css";
import TextInput from "./TextInput";
import { FaWikipediaW } from "react-icons/fa";
import { isValidUrl } from "../utils/validationUtils";

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
      if (fieldName === "link") {
        if (!value.trim()) return null; // optional field
        if (!isValidUrl(value.trim())) {
          return "Please enter a valid URL.";
        }
        return null;
      }
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
    if (fieldName === "link") {
      updateItemData({ ...itemData, [fieldName]: value });
      return;
    }
    const errorMessage = validateField(fieldName, value);
    setError((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }));
    const allFieldsValid = fields.every(
      ({ name }) => !validateField(name, itemData[name] || "")
    );
    onValidationChange(allFieldsValid);
    updateItemData({ ...itemData, [fieldName]: value });
  };

  const handleBlur = (fieldName) => {
    if (fieldName === "link") {
      const currentValue = itemData[fieldName] || "";
      if (currentValue.trim() && !isValidUrl(currentValue.trim())) {
        alert("Invalid URL entered. Resetting the reference link.");
        updateItemData({ ...itemData, [fieldName]: "" });
      }
      return;
    }
    const errorMessage = validateField(fieldName, itemData[fieldName] || "");
    setError((prev) => ({ ...prev, [fieldName]: errorMessage }));
  };

  useEffect(() => {
    const allFieldsValid = fields.every(
      ({ name }) => !validateField(name, itemData[name] || "")
    );
    onValidationChange(allFieldsValid);
  }, [itemData, fields, onValidationChange, validateField]);

  // Compute the reference link for the primary field (always using Wikipedia).
  const primaryFieldName = fields[0].name;
  const primaryValue = itemData[primaryFieldName] || "";
  const referenceLink = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
    primaryValue
  )}`;

  return (
    <div className="item-details-container">
      <div className="item-details-header">
        <h2>Item Details</h2>
        {primaryValue && (
          <a
            href={referenceLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Reference Link"
            className="wiki-link"
          >
            <FaWikipediaW className="link-icon" />
          </a>
        )}
      </div>

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

      <div>
        <TextInput
          value={itemData.link || ""}
          onChange={(e) => handleInputChange("link", e.target.value)}
          placeholder="Reference Link (optional)"
          onBlur={() => handleBlur("link")}
        />
      </div>
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
