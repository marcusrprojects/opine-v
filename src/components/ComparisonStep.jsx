import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import ItemCard from "./ItemCard";
import "../styles/ComparisonStep.css";

const ComparisonStep = ({
  categoryId,
  itemData,
  fields,
  rankCategory,
  tiers,
  onSave,
  setIsRankingComplete,
}) => {
  const [rankedItems, setRankedItems] = useState([]);
  const [comparisonItem, setComparisonItem] = useState(null);
  const [lo, setLo] = useState(0);
  const [hi, setHi] = useState(0);
  const hasSavedInitialItem = useRef(false);
  const primaryField = fields[0]?.name;

  useEffect(() => {
    const fetchRankedItems = async () => {
      const itemsSnapshot = await getDocs(
        collection(db, `categories/${categoryId}/items`)
      );
      // Filter items whose rankCategory (unique id) matches the selected tier and exclude the new item.
      const itemsInTier = itemsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (item) =>
            item.rankCategory === rankCategory && item.id !== itemData.id
        )
        .sort((a, b) => a.rating - b.rating);
      setRankedItems(itemsInTier);
      setHi(itemsInTier.length - 1);
      if (itemsInTier.length === 0 && !hasSavedInitialItem.current) {
        // If no items exist, insert the new item directly.
        onSave([{ ...itemData, rankCategory }]);
        hasSavedInitialItem.current = true;
        setIsRankingComplete(true);
      }
    };

    fetchRankedItems();
  }, [categoryId, rankCategory, itemData, onSave, setIsRankingComplete]);

  useEffect(() => {
    if (rankedItems.length > 0) {
      const middleIndex = Math.floor((lo + hi) / 2);
      setComparisonItem(rankedItems[middleIndex]);
    }
  }, [lo, hi, rankedItems]);

  // When a card is clicked, adjust the binary search range.
  const onComparisonChoice = (isCurrentPreferred) => {
    let currentLo = lo;
    let currentHi = hi;
    let middleIndex = Math.floor((currentLo + currentHi) / 2);
    if (isCurrentPreferred) {
      // The current item is preferred, so shift the lower bound upward.
      currentLo = middleIndex + 1;
    } else {
      // The comparison item is preferred, so shift the upper bound downward.
      currentHi = middleIndex - 1;
    }
    setLo(currentLo);
    setHi(currentHi);

    if (currentLo > currentHi) {
      // The binary search is done. Insert the new item at index currentLo.
      const updatedRankedItems = [...rankedItems];
      updatedRankedItems.splice(currentLo, 0, { ...itemData, rankCategory });
      setRankedItems(updatedRankedItems);
      onSave(updatedRankedItems);
      setIsRankingComplete(true);
    } else {
      middleIndex = Math.floor((currentLo + currentHi) / 2);
      setComparisonItem(rankedItems[middleIndex]);
    }
  };

  if (!comparisonItem) return null;

  return (
    <div className="comparison-container">
      <h2>Which item do you prefer?</h2>
      <div className="comparison-cards">
        <div onClick={() => onComparisonChoice(true)}>
          <ItemCard
            primaryValue={itemData[primaryField] || "Current Item"}
            secondaryValues={fields.map((f) => itemData[f.name] || "")}
            rating={itemData.rating || 0}
            tiers={tiers}
            notes={itemData.notes || ""}
            // Disable flipping behavior for comparison (or adjust as needed).
            active={false}
            onClick={() => {}}
            onActivate={() => {}}
            onDeactivate={() => {}}
            rankCategory={rankCategory}
            className={`comparison-item-card`}
          />
        </div>
        <div onClick={() => onComparisonChoice(false)}>
          <ItemCard
            primaryValue={comparisonItem[primaryField] || "Comparison Item"}
            secondaryValues={fields.map((f) => comparisonItem[f.name] || "")}
            rating={comparisonItem.rating || 0}
            tiers={tiers}
            notes={comparisonItem.notes || ""}
            active={false}
            onClick={() => {}}
            onActivate={() => {}}
            onDeactivate={() => {}}
            rankCategory={comparisonItem.rankCategory || rankCategory}
            className={`comparison-item-card`}
          />
        </div>
      </div>
    </div>
  );
};

ComparisonStep.propTypes = {
  categoryId: PropTypes.string.isRequired,
  itemData: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string.isRequired })
  ).isRequired,
  rankCategory: PropTypes.string.isRequired,
  tiers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      cutoff: PropTypes.number.isRequired,
    })
  ).isRequired,
  onSave: PropTypes.func.isRequired,
  setIsRankingComplete: PropTypes.func.isRequired,
};

export default ComparisonStep;
