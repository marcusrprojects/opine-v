import PropTypes from "prop-types";
import { FaFilter, FaHeart, FaRegHeart, FaDice } from "react-icons/fa";
import Panel from "./Panel";
import Button from "./Button";

const CategoryViewerPanel = ({
  onToggleFilter,
  onLike,
  isLiked,
  onRandomReference,
}) => {
  return (
    <Panel>
      <Button
        onClick={onLike}
        title={isLiked ? "Unlike Category" : "Like Category"}
        icon={isLiked ? FaHeart : FaRegHeart}
      />
      <Button onClick={onToggleFilter} title="Filter Items" icon={FaFilter} />
      <Button
        onClick={onRandomReference}
        title="Random Reference"
        icon={FaDice}
      />
    </Panel>
  );
};

CategoryViewerPanel.propTypes = {
  onToggleFilter: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  isLiked: PropTypes.bool.isRequired,
  onRandomReference: PropTypes.func.isRequired,
};

export default CategoryViewerPanel;
