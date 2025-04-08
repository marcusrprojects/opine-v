import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";
import "../styles/ItemDetailsStep.css";
import TextInput from "./TextInput";
import LinkHeader from "./LinkHeader";
import { isValidUrl } from "../utils/validationUtils";

const ItemDetailsStep = ({
  fields,
  itemData,
  updateItemData,
  onValidationChange,
}) => {
  const [error, setError] = useState({});
  const CHAR_LIMIT = 64;

  // Only include active fields.
  const activeFields = fields.filter((field) => field.active);

  const validateField = useCallback(
    (fieldId, value) => {
      if (fieldId === "link") {
        if (!value.trim()) return null;
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

  const handleInputChange = (fieldId, value) => {
    if (fieldId !== "link") {
      const errorMessage = validateField(fieldId, value);
      setError((prev) => ({ ...prev, [fieldId]: errorMessage }));
    }
    updateItemData({ ...itemData, [fieldId]: value });
    const allFieldsValid = activeFields.every(
      (field) => !validateField(field.id, itemData[field.id] || "")
    );
    onValidationChange(allFieldsValid);
  };

  const handleBlur = (fieldId) => {
    if (fieldId === "link") {
      const currentValue = itemData[fieldId] || "";
      if (currentValue.trim() && !isValidUrl(currentValue.trim())) {
        alert("Invalid URL entered. Resetting the reference link.");
        updateItemData({ ...itemData, [fieldId]: "" });
      }
      return;
    }
  };

  useEffect(() => {
    const allFieldsValid = activeFields.every(
      (field) => !validateField(field.id, itemData[field.id] || "")
    );
    onValidationChange(allFieldsValid);
  }, [itemData, activeFields, onValidationChange, validateField]);

  const primaryField = activeFields[0];
  const primaryFieldId = primaryField?.id;
  const primaryValue = primaryField ? itemData[primaryFieldId] || "" : "";

  const approvedLink =
    itemData.link && isValidUrl(itemData.link.trim())
      ? itemData.link
      : `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
          primaryValue
        )}`;

  return (
    <div className="item-details-container">
      <LinkHeader
        title="Item Details"
        link={approvedLink}
        iconVisible={Boolean(primaryValue || itemData.link)}
      />
      {activeFields.map((field) => (
        <div key={field.id}>
          <TextInput
            value={itemData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.name}
            required
            onBlur={() => handleBlur(field.id)}
          />
          {error[field.id] && (
            <p className="error-message">{error[field.id]}</p>
          )}
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
          placeholder="Optional http(s) link"
          onBlur={() => handleBlur("link")}
        />
      </div>
    </div>
  );
};

ItemDetailsStep.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      active: PropTypes.bool,
    })
  ).isRequired,
  itemData: PropTypes.object.isRequired,
  updateItemData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired,
};

export default ItemDetailsStep;
