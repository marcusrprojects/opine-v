import PropTypes from "prop-types";
import Card from "./Card";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useTagMap } from "../context/useTagMap";
import "../styles/CategoryCard.css";

const CategoryCard = ({ category, onClick, onLike, liked }) => {
  const tagMap = useTagMap();

  const tagNames = (category.tags || []).map(
    (tagId) => tagMap[tagId] || "Unknown"
  );

  return (
    <Card onClick={onClick}>
      <div className="card-header">
        <h4 className="card-title">{category.name}</h4>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="like-icon"
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
        </span>
      </div>
      <p className="card-content category-card-content">
        {category.fields.length > 0 ? category.fields.join(", ") : "No fields"}
      </p>
      <span className="card-tags">
        {tagNames.length > 0 ? tagNames.join(", ") : "No tags"}
      </span>
    </Card>
  );
};

CategoryCard.propTypes = {
  category: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  liked: PropTypes.bool.isRequired,
};

export default CategoryCard;
