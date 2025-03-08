import PropTypes from "prop-types";
import Panel from "./Panel";
import Button from "./Button";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const EditLogoutPanel = ({ onEdit }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <Panel>
      <Button onClick={onEdit} title="Edit Profile" icon={FaEdit} />
      <Button
        onClick={() => logout(navigate)}
        title="Logout"
        icon={FaSignOutAlt}
      />
    </Panel>
  );
};

EditLogoutPanel.propTypes = {
  onEdit: PropTypes.func.isRequired,
};

export default EditLogoutPanel;
