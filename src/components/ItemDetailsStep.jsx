import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ItemDetailsStep = ({ primaryField, fields, itemData, updateItemData, onNext, isEditable }) => {
  const [error, setError] = useState(null);
  const CHAR_LIMIT = 32;
  const WORD_CHAR_LIMIT = 15;
  const navigate = useNavigate();
  const { categoryId } = useParams(); // Gets categoryId from URL parameters

  const handleInputChange = (field, value) => {
    if (field === primaryField) {
      if (value.length > CHAR_LIMIT) {
        setError(`Maximum ${CHAR_LIMIT} characters allowed for ${primaryField}`);
        return;
      }
      const words = value.split(' ');
      if (words.some(word => word.length > WORD_CHAR_LIMIT)) {
        setError(`Each word in the ${primaryField} field can have up to ${WORD_CHAR_LIMIT} characters.`);
        return;
      }
    }
    setError(null);
    updateItemData({ ...itemData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fields.some(field => !itemData[field])) {
      alert('Please fill in all required fields.');
      return;
    }
    onNext();
  };

  const handleBack = () => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="item-details-step-container">
      <h2>Item Details</h2>
      <form onSubmit={handleSubmit}>
        {fields.map((field, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder={field}
              value={itemData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              readOnly={!isEditable}
              required
            />
            {field === primaryField && error && <p className="error-message">{error}</p>}
          </div>
        ))}
        <div className="button-nav-container">
          <button className="button-nav" type="button" onClick={handleBack}>Back</button>
          <button className="button-nav" type="submit" disabled={!!error}>Next</button>
        </div>
      </form>
    </div>
  );
};

// PropTypes for validation
ItemDetailsStep.propTypes = {
  primaryField: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  itemData: PropTypes.object.isRequired,
  updateItemData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  isEditable: PropTypes.bool.isRequired,
};

export default ItemDetailsStep;