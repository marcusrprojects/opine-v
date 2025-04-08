import PropTypes from "prop-types";
import Card from "./Card";
import "../styles/ItemCard.css";
import { calculateCardColor } from "../utils/ranking";
import { useState, useRef, useEffect } from "react";
import { FaQuestionCircle } from "react-icons/fa";

const ItemCard = ({
  primaryValue,
  secondaryValues,
  rating,
  tiers,
  onClick,
  notes,
  active,
  onActivate,
  onDeactivate,
  rankCategory,
  className = "",
  hideRating = false,
}) => {
  const ratingColor = calculateCardColor(rating, tiers, rankCategory);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const frontRef = useRef(null);

  // Measure the front view.
  useEffect(() => {
    if (frontRef.current) {
      const { offsetWidth, offsetHeight } = frontRef.current;
      setDimensions({
        width: Math.max(offsetWidth, 180),
        height: offsetHeight,
      });
    }
  }, [primaryValue, secondaryValues]);

  const numLines =
    dimensions.height > 0 ? Math.floor(dimensions.height / 14.4) : 1;

  const shouldFlip = notes && notes.trim().length > 0;
  const handleEnter = () => {
    if (shouldFlip) onActivate();
  };
  const handleLeave = () => {
    if (shouldFlip) onDeactivate();
  };

  return (
    <Card
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={className}
    >
      <div
        className="itemcard-container"
        style={{
          maxWidth: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        <div
          className={`itemcard-front ${active ? "fade-out" : "fade-in"}`}
          ref={frontRef}
        >
          <div className="card-header item-card-header">
            <span className="rating" style={{ color: ratingColor }}>
              {!hideRating ? (
                parseFloat(rating || 0).toFixed(1)
              ) : (
                <FaQuestionCircle
                  style={{ margin: "0 var(--padding-xsmall)" }}
                />
              )}
            </span>
            <h4 className="card-title">{primaryValue}</h4>
          </div>
          <div className="card-fields-container">
            {secondaryValues.map((value, index) => (
              <p key={index} className="field-pair">
                <span>{value}</span>
              </p>
            ))}
          </div>
        </div>
        {shouldFlip && (
          <div
            className={`itemcard-back ${active ? "fade-in" : "fade-out"}`}
            style={{ marginTop: `-${dimensions.height}px` }}
          >
            <p className="notes-text" style={{ WebkitLineClamp: numLines }}>
              {notes}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

ItemCard.propTypes = {
  primaryValue: PropTypes.string.isRequired,
  secondaryValues: PropTypes.array.isRequired,
  rating: PropTypes.number.isRequired,
  tiers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      cutoff: PropTypes.number.isRequired,
    })
  ).isRequired,
  onClick: PropTypes.func.isRequired,
  notes: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onActivate: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  rankCategory: PropTypes.string.isRequired,
  className: PropTypes.string,
  hideRating: PropTypes.bool,
};

export default ItemCard;
