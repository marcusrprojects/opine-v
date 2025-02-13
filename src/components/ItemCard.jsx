import PropTypes from "prop-types";
import Card from "./Card";
import "../styles/ItemCard.css";

const ItemCard = ({ item, primaryField, onClick }) => {
  return (
    <Card onClick={onClick}>
      <div className="card-header">
        <span className="item-rating">{item.rating.toFixed(1)}</span>
        <h4 className="card-title">{item[primaryField] || "Unnamed Item"}</h4>
      </div>
      <div className="card-content">
        {Object.keys(item)
          .filter((key) => key !== primaryField && key !== "rating")
          .map((field) => (
            <p key={field} className="field-pair">
              {field}: {item[field]}
            </p>
          ))}
      </div>
    </Card>
  );
};

ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
  primaryField: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ItemCard;
