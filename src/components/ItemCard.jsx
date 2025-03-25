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

  // Measure the front view once to fix container dimensions.
  useEffect(() => {
    if (frontRef.current) {
      const { offsetWidth, offsetHeight } = frontRef.current;
      setDimensions({
        width: Math.max(offsetWidth, 180), // Ensure a minimum width (e.g., 220px)
        height: offsetHeight,
      });
    }
  }, [primaryValue, secondaryValues]);

  // Only flip if notes are non-empty.
  const shouldFlip = notes && notes.trim().length > 0;

  // Use parent's callbacks to control active state.
  const handleMouseEnter = () => {
    if (shouldFlip) onActivate();
  };

  const handleMouseLeave = () => {
    if (shouldFlip) onDeactivate();
  };

  return (
    <Card
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="itemcard-container"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        {!active ? (
          <div className="itemcard-front" ref={frontRef}>
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
        ) : (
          <div className="itemcard-back">
            <p className="notes-text">{notes}</p>
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
