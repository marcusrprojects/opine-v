import PropTypes from "prop-types";
import { PRIVACY_LEVELS, PRIVACY_LABELS } from "../constants/privacy";
import "../styles/PrivacySelector.css";

const PrivacySelector = ({ privacy, setPrivacy }) => {
  return (
    <div className="privacy-section">
      <label className="edit-label">Privacy</label>
      <select
        className="select-privacy"
        value={privacy}
        onChange={(e) => setPrivacy(Number(e.target.value))}
      >
        {Object.values(PRIVACY_LEVELS).map((level) => (
          <option key={level} value={level}>
            {PRIVACY_LABELS[level]}
          </option>
        ))}
      </select>
    </div>
  );
};

PrivacySelector.propTypes = {
  privacy: PropTypes.number.isRequired,
  setPrivacy: PropTypes.func.isRequired,
};

export default PrivacySelector;
