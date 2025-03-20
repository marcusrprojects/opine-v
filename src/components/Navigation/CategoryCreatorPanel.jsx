import PropTypes from "prop-types";
import {
  FaPlus,
  FaCog,
  FaFilter,
  FaHeart,
  FaRegHeart,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import Panel from "./Panel";
import Button from "./Button";

const CategoryCreatorPanel = ({
  onAdd,
  isAddDisabled,
  onToggleFilter,
  onLike,
  isLiked,
  onEdit,
  onDelete,
  showSettings,
  onSettingsToggle,
  canEdit,
}) => {
  return (
    <Panel>
      {/* If the user is the creator, display full control panel */}
      <Button
        onClick={onAdd}
        title="Add Item"
        icon={FaPlus}
        disabled={isAddDisabled}
      />
      <Button onClick={onSettingsToggle} title="Settings" icon={FaCog} />
      {showSettings && (
        <div className="category-actions open">
          <Button
            onClick={onToggleFilter}
            title="Filter Items"
            icon={FaFilter}
          />
          <Button
            onClick={onLike}
            title={isLiked ? "Unlike Category" : "Like Category"}
            icon={isLiked ? FaHeart : FaRegHeart}
          />
          <Button onClick={onEdit} title="Edit Category" icon={FaEdit} />
          {canEdit && (
            <Button onClick={onDelete} title="Delete Category" icon={FaTrash} />
          )}
        </div>
      )}
    </Panel>
  );
};

CategoryCreatorPanel.propTypes = {
  onAdd: PropTypes.func.isRequired,
  isAddDisabled: PropTypes.bool,
  onToggleFilter: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  isLiked: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showSettings: PropTypes.bool.isRequired,
  onSettingsToggle: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

export default CategoryCreatorPanel;
