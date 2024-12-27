import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const ComparisonStep = ({ categoryId, itemData, primaryField, rankCategory, onSave }) => {
  const [rankedItems, setRankedItems] = useState([]);
  const [comparisonItem, setComparisonItem] = useState(null);
  const [lo, setLo] = useState(0);
  const [hi, setHi] = useState(0);
  const hasSavedInitialItem = useRef(false); // Track if initial item has been saved

  useEffect(() => {
    const fetchRankedItems = async () => {
      const itemsSnapshot = await getDocs(collection(db, `categories/${categoryId}/items`));
      const itemsInRankCategory = itemsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => item.rankCategory === rankCategory && item.id !== itemData.id)
        .sort((a, b) => a.rating - b.rating);

      setRankedItems(itemsInRankCategory);
      setHi(itemsInRankCategory.length - 1);

      // Check if no items are in rank category and ensure we save only once
      if (itemsInRankCategory.length === 0 && !hasSavedInitialItem.current) {
        onSave([{ ...itemData, rankCategory }]);
        hasSavedInitialItem.current = true; // Set flag to prevent duplicate saves
      }
    };

    fetchRankedItems();
  }, [categoryId, rankCategory, itemData, onSave]);

  // Set initial comparison item if there are ranked items
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
      onSave(updatedRankedItems); // Call `onSave` with the updated ranking order
    } else {
      middleIndex = Math.floor((currentLo + currentHi) / 2);
      setComparisonItem(rankedItems[middleIndex]);
    }
  };

  return rankedItems.length > 0 ? (
    <div className="add-item-container">
      <h2>Compare your item</h2>
      <p>Which item is better?</p>
      <div className="comparison-buttons">
        <button onClick={() => onComparisonChoice(true)}>
          {primaryField ? itemData[primaryField] : "Current Item"}
        </button>
        <button onClick={() => onComparisonChoice(false)}>
          {primaryField ? comparisonItem?.[primaryField] : "Comparison Item"}
        </button>
      </div>
      {/* <button className="button-nav" onClick={onBack}>Back</button> */}
    </div>
  ) : null;
};

// PropTypes for validation
ComparisonStep.propTypes = {
  categoryId: PropTypes.string.isRequired,
  itemData: PropTypes.object.isRequired,
  primaryField: PropTypes.string.isRequired,
  // fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  rankCategory: PropTypes.number.isRequired,
  // onBack: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ComparisonStep;