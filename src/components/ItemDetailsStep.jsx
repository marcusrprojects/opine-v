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

  const validateField = useCallback(
    (fieldName, value) => {
      if (fieldName === "link") {
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

  const handleInputChange = (fieldName, value) => {
    if (fieldName !== "link") {
      const errorMessage = validateField(fieldName, value);
      setError((prev) => ({
        ...prev,
        [fieldName]: errorMessage,
      }));
    }
    updateItemData({ ...itemData, [fieldName]: value });
    // Recheck overall validity for required fields.
    const allFieldsValid = fields.every(
      ({ name }) => !validateField(name, itemData[name] || "")
    );
    onValidationChange(allFieldsValid);
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
  };

  useEffect(() => {
    const allFieldsValid = fields.every(
      ({ name }) => !validateField(name, itemData[name] || "")
    );
    onValidationChange(allFieldsValid);
  }, [itemData, fields, onValidationChange, validateField]);

  const primaryFieldName = fields[0].name;
  const primaryValue = itemData[primaryFieldName] || "";

  // Determine approved link: if a valid link is provided, use it; otherwise, fallback to Wikipedia search.
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

      {/* Optional Reference Link input */}
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
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  itemData: PropTypes.object.isRequired,
  updateItemData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired,
};

export default ItemDetailsStep;
