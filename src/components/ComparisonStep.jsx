import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const ComparisonStep = ({
  categoryId,
  itemData,
  fields,
  rankCategory,
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
      const itemsInRankCategory = itemsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (item) =>
            item.rankCategory === rankCategory && item.id !== itemData.id
        )
        .sort((a, b) => a.rating - b.rating);

      setRankedItems(itemsInRankCategory);
      setHi(itemsInRankCategory.length - 1);

      if (itemsInRankCategory.length === 0 && !hasSavedInitialItem.current) {
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

  const onComparisonChoice = (isBetter) => {
    let currentLo = lo;
    let currentHi = hi;
    let middleIndex = Math.floor((currentLo + currentHi) / 2);

    if (isBetter) {
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

  return rankedItems.length > 0 ? (
    <div className="comparison-container">
      <h2>Which item do you prefer?</h2>
      <div className="comparison-buttons">
        <button onClick={() => onComparisonChoice(true)}>
          {itemData[primaryField] ?? "Current Item"}
        </button>
        <button onClick={() => onComparisonChoice(false)}>
          {comparisonItem?.[primaryField] ?? "Comparison Item"}
        </button>
      </div>
    </div>
  ) : null;
};

ComparisonStep.propTypes = {
  categoryId: PropTypes.string.isRequired,
  itemData: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string.isRequired })
  ).isRequired,
  rankCategory: PropTypes.number.isRequired,
  onSave: PropTypes.func.isRequired,
  setIsRankingComplete: PropTypes.func.isRequired,
};

export default ComparisonStep;
