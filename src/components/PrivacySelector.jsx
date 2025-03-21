import PropTypes from "prop-types";
import { USER_PRIVACY, CATEGORY_PRIVACY } from "../constants/privacy";
import "../styles/PrivacySelector.css";

const PrivacySelector = ({ privacy, setPrivacy, type }) => {
  const handleToggle = () => {
    if (type === "user") {
      setPrivacy(
        privacy === USER_PRIVACY.PRIVATE
          ? USER_PRIVACY.PUBLIC
          : USER_PRIVACY.PRIVATE
      );
    } else if (type === "category") {
      setPrivacy(
        privacy === CATEGORY_PRIVACY.ONLY_ME
          ? CATEGORY_PRIVACY.DEFAULT
          : CATEGORY_PRIVACY.ONLY_ME
      );
    }
  };

  const isChecked =
    (type === "user" && privacy === USER_PRIVACY.PRIVATE) ||
    (type === "category" && privacy === CATEGORY_PRIVACY.ONLY_ME);

  return (
    <div className="privacy-section">
      <div className="toggle-privacy">
        <input
          type="checkbox"
          id="privacy-toggle"
          checked={isChecked}
          onChange={handleToggle}
        />
      </div>
    </div>
  );
};

PrivacySelector.propTypes = {
  privacy: PropTypes.string.isRequired,
  setPrivacy: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["user", "category"]).isRequired,
};

export default PrivacySelector;
