import PropTypes from "prop-types";
import CardList from "./CardList";
import ItemCard from "./ItemCard";

const ItemList = ({ items, orderedFields, onItemClick }) => {
  const [primaryField, ...secondaryFields] = orderedFields;

  return (
    <CardList
      items={items}
      renderCard={(item) => (
        <ItemCard
          key={item.id}
          primaryValue={item[primaryField] || "Unnamed Item"}
          secondaryValues={secondaryFields.map((field) => item[field] || "N/A")}
          rating={item.rating || 0}
          rankCategory={item.rankCategory || 0}
          onClick={() => onItemClick(item.id)}
        />
      )}
    />
  );
};

ItemList.propTypes = {
  items: PropTypes.array.isRequired,
  orderedFields: PropTypes.array.isRequired,
  onItemClick: PropTypes.func.isRequired,
};

export default ItemList;
