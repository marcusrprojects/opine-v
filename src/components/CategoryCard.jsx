import PropTypes from "prop-types";
import Card from "./Card";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../styles/CategoryCard.css";
import { useState, useRef, useEffect } from "react";
import { useUserCache } from "../context/useUserCache";

const CategoryCard = ({ category, onClick, onLike, liked }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [maxWidth, setMaxWidth] = useState(0);
  const headerRef = useRef(null);

  // Get the cached user info for the category's creator.
  const { getUserInfo } = useUserCache();
  const creatorInfo = getUserInfo(category.createdBy);
  const creatorUsername = creatorInfo ? creatorInfo.username : "Unknown";

  // Prepare tag text.
  const tagText =
    category.tags?.length > 0 ? category.tags.join(", ") : "No tags";

  // Measure header width and ensure a minimum width of 180px.
  useEffect(() => {
    if (headerRef.current) {
      const measuredWidth = Math.max(headerRef.current.offsetWidth, 180);
      setMaxWidth(measuredWidth);
    }
  }, [category.name, category.tags]);

  return (
    <Card
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="cat-card-header" ref={headerRef}>
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
      <div
        className={`card-tags-container ${isHovered ? "hovered" : ""}`}
        style={{ maxWidth }}
      >
        <div className="card-tags">
          <span className="tags-text">{tagText}</span>
          <span className="username-text">@{creatorUsername}</span>
        </div>
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
