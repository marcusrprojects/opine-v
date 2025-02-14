import PropTypes from "prop-types";
import CardList from "./CardList";
import ItemCard from "./ItemCard";

const ItemList = ({ items, primaryField, orderedFields, onItemClick }) => {
  return (
    <CardList
      items={items}
      renderCard={(item) => (
        <ItemCard
          key={item.id}
          primaryValue={item[primaryField] || "Unnamed Item"} // ✅ Pre-extracted title
          secondaryValues={orderedFields
            .filter((field) => field !== primaryField) // ✅ Exclude primary field
            .map((field) => item[field] || "N/A")} // ✅ Only pass values, not keys
          rating={item.rating || 0} // ✅ Keep rating
          rankCategory={item.rankCategory || 0}
          onClick={() => onItemClick(item.id)}
        />
      )}
    />
  );
};

ItemList.propTypes = {
  items: PropTypes.array.isRequired,
  primaryField: PropTypes.string.isRequired,
  orderedFields: PropTypes.array.isRequired,
  onItemClick: PropTypes.func.isRequired,
};

export default ItemList;
