import PropTypes from "prop-types";
import "../styles/CardList.css";

const CardList = ({ items, renderCard }) => {
  return (
    <div className="card-list">{items.map((item) => renderCard(item))}</div>
  );
};

CardList.propTypes = {
  items: PropTypes.array.isRequired,
  renderCard: PropTypes.func.isRequired,
};

export default CardList;
