import PropTypes from "prop-types";
import CardList from "./CardList";
import ItemCard from "./ItemCard";
import { useState, useEffect } from "react";

const ItemList = ({ items, orderedFields, tiers, onItemClick }) => {
  const [activeCardId, setActiveCardId] = useState(null);
  const [primaryFieldObj, ...secondaryFieldObjs] = orderedFields;
  const primaryField = primaryFieldObj?.name;
  const secondaryFields = secondaryFieldObjs.map((f) => f.name);

  // Clear active card when mouse leaves document.
  useEffect(() => {
    const handleMouseOut = (event) => {
      if (!event.relatedTarget && !event.toElement) {
        setActiveCardId(null);
      }
    };
    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, []);

  return (
    <CardList
      items={items}
      renderCard={(item) => (
        <ItemCard
          key={item.id}
          primaryValue={item[primaryField] || "Unnamed Item"}
          secondaryValues={secondaryFields.map((field) => item[field] || "N/A")}
          rating={item.rating || 0}
          notes={item.notes ?? ""}
          tiers={tiers}
          onClick={() => onItemClick(item.id)}
          active={activeCardId === item.id}
          onActivate={() => setActiveCardId(item.id)}
          onDeactivate={() => setActiveCardId(null)}
          rankCategory={item.rankCategory || ""}
        />
      )}
    />
  );
};

ItemList.propTypes = {
  items: PropTypes.array.isRequired,
  orderedFields: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string.isRequired })
  ).isRequired,
  tiers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string, // if needed
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      cutoff: PropTypes.number.isRequired,
    })
  ).isRequired,
  onItemClick: PropTypes.func.isRequired,
};

export default ItemList;
