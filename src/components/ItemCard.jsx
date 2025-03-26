import PropTypes from "prop-types";
import Card from "./Card";
import "../styles/ItemCard.css";
import { calculateCardColor } from "../utils/ranking";
import { useState, useRef, useEffect } from "react";

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
}) => {
  const ratingColor = calculateCardColor(rating, tiers);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const frontRef = useRef(null);

  // Measure the front side (which will govern container dimensions)
  useEffect(() => {
    if (frontRef.current) {
      const { offsetWidth, offsetHeight } = frontRef.current;
      setDimensions({
        width: Math.max(offsetWidth, 180), // Minimum width of 180px
        height: offsetHeight,
      });
    }
  }, [primaryValue, secondaryValues]);

  // Compute the number of lines that can fit in the back view.
  const numLines =
    dimensions.height > 0 ? Math.floor((dimensions.height + 4) / 14.4) : 1;

  // Only flip if notes are non-empty.
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
    >
      <div
        className="itemcard-container"
        style={{
          maxWidth: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        {/* Front view is always rendered for measurement and fixed sizing */}
        <div
          className={`itemcard-front ${active ? "fade-out" : "fade-in"}`}
          ref={frontRef}
        >
          <div className="card-header item-card-header">
            <span className="rating" style={{ color: ratingColor }}>
              {parseFloat(rating || 0).toFixed(1)}
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
        {/* Back view: notes, overlaid using a negative margin */}
        {shouldFlip && (
          <div
            className={`itemcard-back ${active ? "fade-in" : "fade-out"}`}
            style={{ marginTop: `-${dimensions.height}px` }}
            lang="en"
          >
            <p
              className="notes-text"
              style={{
                WebkitLineClamp: numLines,
              }}
            >
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
};

export default ItemCard;
