import PropTypes from "prop-types";
import Card from "./Card";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/CategoryCard.css";
import { useState } from "react";
import { useUserCache } from "../context/useUserCache";

const CategoryCard = ({ category, onClick, onLike, liked }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Use our custom context/hook to get the username for the creator ID.
  const { getUsername } = useUserCache();
  const creatorUsername = getUsername(category.createdBy) || "Unknown";

  // Show tags normally.
  const tagText =
    category.tags?.length > 0 ? category.tags.join(", ") : "No tags";

  return (
    <Card
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      // onMouseEnter={() => console.log("hey")}
      onMouseLeave={() => setIsHovered(false)}
    >
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
      <div className="card-tags-container">
        <span className={`card-tags ${isHovered ? "show-username" : ""}`}>
          <span className="tags-text">{tagText}</span>
          <span className="username-text">@{creatorUsername}</span>
        </span>
      </div>
    </Card>
  );
};

CategoryCard.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdBy: PropTypes.string.isRequired,
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
