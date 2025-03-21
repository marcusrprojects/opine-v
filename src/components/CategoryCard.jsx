import PropTypes from "prop-types";
import Card from "./Card";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/CategoryCard.css";

const CategoryCard = ({ category, onClick, onLike, liked }) => {
  const fieldNames =
    category.fields?.length > 0
      ? category.fields.map((f) => f.name).join(", ")
      : "No fields";

  const tagText =
    category.tags?.length > 0 ? category.tags.join(", ") : "No tags";

  return (
    <Card onClick={onClick}>
      <div className="card-header">
        <h4 className="card-title">{category.name}</h4>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onLike(category.id);
          }}
          className="like-icon"
        >
          {liked ? <FaHeart /> : <FaRegHeart />}
        </span>
      </div>
      <p className="card-content category-card-content">{fieldNames}</p>
      <span className="card-tags">{tagText}</span>
    </Card>
  );
};

CategoryCard.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
      })
    ),
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  liked: PropTypes.bool.isRequired,
};
export default CategoryCard;
