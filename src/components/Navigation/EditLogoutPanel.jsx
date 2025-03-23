import PropTypes from "prop-types";
import Panel from "./Panel";
import Button from "./Button";
import { FaEdit, FaSignOutAlt, FaUserClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "../../styles/EditLogoutPanel.css";

const EditLogoutPanel = ({
  onEdit,
  onToggleFollowRequests,
  showFollowRequests,
  hasFollowRequests,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="edit-logout-wrapper">
      <Panel>
        <Button onClick={onEdit} title="Edit Profile" icon={FaEdit} />
        {hasFollowRequests && (
          <Button
            onClick={onToggleFollowRequests}
            title="Follow Requests"
            icon={FaUserClock}
          />
        )}
        <Button
          onClick={() => logout(navigate)}
          title="Logout"
          icon={FaSignOutAlt}
        />
      </Panel>
      {showFollowRequests && (
        <div className="follow-requests-overlay">
          {/* FollowRequests component will be rendered from parent */}
        </div>
      )}
    </div>
  );
};

EditLogoutPanel.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onToggleFollowRequests: PropTypes.func.isRequired,
  showFollowRequests: PropTypes.bool.isRequired,
  hasFollowRequests: PropTypes.bool.isRequired,
};

export default EditLogoutPanel;
