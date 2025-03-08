import PropTypes from "prop-types";
import Panel from "./Panel";
import Button from "./Button";
import { FaEdit } from "react-icons/fa";

const EditPanel = ({ onEdit }) => {
  return (
    <Panel>
      <Button onClick={onEdit} title="Edit Profile" icon={FaEdit} />
    </Panel>
  );
};

EditPanel.propTypes = {
  onEdit: PropTypes.func.isRequired,
};

export default EditPanel;
