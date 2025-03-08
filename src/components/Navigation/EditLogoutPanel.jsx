import PropTypes from "prop-types";
import Panel from "./Panel";
import Button from "./Button";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/useAuth";

const EditLogoutPanel = ({ onEdit }) => {
  const { logout } = useAuth(); // Get logout function from AuthContext

  return (
    <Panel>
      <Button onClick={onEdit} title="Edit Profile" icon={FaEdit} />
      <Button onClick={logout} title="Logout" icon={FaSignOutAlt} />
    </Panel>
  );
};

EditLogoutPanel.propTypes = {
  onEdit: PropTypes.func.isRequired,
};

export default EditLogoutPanel;
