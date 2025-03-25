import PropTypes from "prop-types";
import Card from "./Card";
import "../styles/ItemCard.css";
import { calculateCardColor } from "../utils/ranking";

const ItemCard = ({
  primaryValue,
  secondaryValues,
  rating,
  tiers,
  onClick,
}) => {
  const ratingColor = calculateCardColor(rating, tiers);

  return (
    <Card onClick={onClick}>
      <div className="card-header item-card-header">
        <span className="rating" style={{ color: ratingColor }}>
          {parseFloat(rating || 0).toFixed(1)}
        </span>
        <h4 className="card-title">{primaryValue}</h4>
      </div>
      <div className="card-content">
        {secondaryValues.map((value, index) => (
          <p key={index} className="field-pair">
            <span>{value}</span>
          </p>
        ))}
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
};

export default ItemCard;
