import PropTypes from "prop-types";
import ItemCard from "./ItemCard";
import { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

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
  const [activeCard, setActiveCard] = useState(null);
  const hasSavedInitialItem = useRef(false);
  const activeFields = fields.filter((field) => field.active);
  const primaryField = activeFields[0];
  const primaryFieldId = primaryField?.id;

  useEffect(() => {
    const fetchRankedItems = async () => {
      const itemsSnapshot = await getDocs(
        collection(db, `categories/${categoryId}/items`)
      );
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

  const handleActivateCurrent = () => setActiveCard("current");
  const handleActivateComparison = () => setActiveCard("comparison");
  const handleDeactivate = () => setActiveCard(null);

  const onComparisonChoice = (isCurrentPreferred) => {
    let currentLo = lo;
    let currentHi = hi;
    let middleIndex = Math.floor((currentLo + currentHi) / 2);
    if (isCurrentPreferred) {
      currentLo = middleIndex + 1;
    } else {
      currentHi = middleIndex - 1;
    }
    setLo(currentLo);
    setHi(currentHi);
    if (currentLo > currentHi) {
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
            primaryValue={itemData[primaryFieldId] || "Current Item"}
            secondaryValues={activeFields.map((f) => itemData[f.id] || "")}
            rating={itemData.rating || 0}
            tiers={tiers}
            notes={itemData.notes || ""}
            onClick={() => {}}
            active={activeCard === "current"}
            onActivate={handleActivateCurrent}
            onDeactivate={handleDeactivate}
            rankCategory={rankCategory}
            className="comparison-item-card"
            hideRating={true}
          />
        </div>
        <div onClick={() => onComparisonChoice(false)}>
          <ItemCard
            primaryValue={comparisonItem[primaryFieldId] || "Comparison Item"}
            secondaryValues={activeFields.map(
              (f) => comparisonItem[f.id] || ""
            )}
            rating={comparisonItem.rating || 0}
            tiers={tiers}
            notes={comparisonItem.notes || ""}
            onClick={() => {}}
            active={activeCard === "comparison"}
            onActivate={handleActivateComparison}
            onDeactivate={handleDeactivate}
            rankCategory={comparisonItem.rankCategory || rankCategory}
            className="comparison-item-card"
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
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      active: PropTypes.bool,
    })
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
