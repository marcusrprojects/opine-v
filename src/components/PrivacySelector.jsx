import PropTypes from "prop-types";
import { USER_PRIVACY, CATEGORY_PRIVACY } from "../constants/privacy";
import "../styles/PrivacySelector.css";

const PrivacySelector = ({ privacy, setPrivacy, type }) => {
  const privacyOptions = {
    user: {
      private: USER_PRIVACY.PRIVATE,
      public: USER_PRIVACY.PUBLIC,
    },
    category: {
      private: CATEGORY_PRIVACY.ONLY_ME,
      public: CATEGORY_PRIVACY.DEFAULT,
    },
  };

  const handleToggle = () => {
    setPrivacy(
      privacy === privacyOptions[type].private
        ? privacyOptions[type].public
        : privacyOptions[type].private
    );
  };

  const isPrivate = privacy === privacyOptions[type].private;

  return (
    <div className="privacy-section">
      <div className="toggle-privacy">
        <input
          type="checkbox"
          id={`privacy-toggle`}
          checked={isPrivate}
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
