import PropTypes from "prop-types";
import Card from "./Card";
import "../styles/ItemCard.css";
import { calculateCardColor } from "../utils/ranking";

const ItemCard = ({
  primaryValue,
  secondaryValues,
  rating,
  rankCategory,
  onClick,
}) => {
  const ratingColor = calculateCardColor(rating, rankCategory);

  return (
    <Card onClick={onClick}>
      <div className="card-header">
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
  primaryValue: PropTypes.string.isRequired, // ✅ Only pass the extracted primary field
  secondaryValues: PropTypes.array.isRequired, // ✅ Only pass the values, no keys
  rating: PropTypes.number.isRequired,
  rankCategory: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ItemCard;
