import PropTypes from "prop-types";
import { FaFilter, FaHeart, FaRegHeart } from "react-icons/fa";
import Panel from "./Panel";
import Button from "./Button";

const CategoryViewerPanel = ({ onToggleFilter, onLike, isLiked }) => {
  return (
    <Panel>
      <Button
        onClick={onLike}
        title={isLiked ? "Unlike Category" : "Like Category"}
        icon={isLiked ? FaHeart : FaRegHeart}
      />
      <Button onClick={onToggleFilter} title="Filter Items" icon={FaFilter} />
    </Panel>
  );
};

CategoryViewerPanel.propTypes = {
  onToggleFilter: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  isLiked: PropTypes.bool.isRequired,
};

export default CategoryViewerPanel;
