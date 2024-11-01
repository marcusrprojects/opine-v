import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const ComparisonStep = ({ categoryId, itemData, fields, rankCategory, onBack, onSave }) => {
  const [rankedItems, setRankedItems] = useState([]);
  const [comparisonItem, setComparisonItem] = useState(null);
  const [lo, setLo] = useState(0);
  const [hi, setHi] = useState(0);
  const firstField = fields && fields.length > 0 ? fields[0] : null;

  // Fetch ranked items based on `rankCategory`
  useEffect(() => {
    const fetchRankedItems = async () => {
      const itemsSnapshot = await getDocs(collection(db, `categories/${categoryId}/items`));
      const itemsInRankCategory = itemsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => item.rankCategory === rankCategory && item.id !== itemData.id)
        .sort((a, b) => a.rating - b.rating);

      setRankedItems(itemsInRankCategory);
      setHi(itemsInRankCategory.length - 1);
    };

    fetchRankedItems();
  }, [categoryId, rankCategory, itemData.id]);

  // Set initial comparison item
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

  return (
    <div className="add-item-container">
      <h2>Compare your item</h2>
      <p>Which item is better?</p>
      <div className="comparison-buttons">
        <button className="button-common" onClick={() => onComparisonChoice(true)}>
          {firstField ? itemData[firstField] : "Current Item"}
        </button>
        <button className="button-common" onClick={() => onComparisonChoice(false)}>
          {firstField ? comparisonItem?.[firstField] : "Comparison Item"}
        </button>
      </div>
      <button className="button-nav" onClick={onBack}>Back</button>
      <button className="button-nav" onClick={() => onSave(rankedItems)}>Save</button>
    </div>
  );
};

// PropTypes for validation
ComparisonStep.propTypes = {
  categoryId: PropTypes.string.isRequired,
  itemData: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  rankCategory: PropTypes.number.isRequired,
  onBack: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ComparisonStep;