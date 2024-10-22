import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore'; // Added writeBatch
import { useParams, useNavigate } from 'react-router-dom';

const AddItem = () => {
  const { categoryId } = useParams(); // Get category from URL
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate(); // Used for redirecting back
  const [step, setStep] = useState(1); // Tracks the current step
  const [comparisonItem, setComparisonItem] = useState(null); // Item to compare with
  const [rankCategory, setRankCategory] = useState(''); // Store the user's chosen category (Good, Okay, or Bad)
  const [rankedItems, setRankedItems] = useState([]); // Items in the selected category for comparison
  const [lo, setLo] = useState(0); // Starting lower bound
  const [hi, setHi] = useState(0); // Starting upper bound (to be updated)

  // Fetch category details when component mounts or when categoryId changes
  useEffect(() => {
    const fetchCategory = async () => {
      const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
      const categoryData = categoryDoc.data();
      setFields(categoryData.fields); // Set the fields for this category
    };
    fetchCategory();
  }, [categoryId]);

  // Handle form input changes for the new item details
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Step 1: Handle form submission to add item details and move to rank selection
  const handleSubmit = (e) => {
    e.preventDefault();
    if (fields.some(field => !formData[field])) {
      alert('Please fill in all required fields.');
      return;
    }
    // Proceed to Step 2: Ask for ranking choice (Good, Okay, Bad)
    setStep(2);
  };

  // Step 2: Handle ranking choice and fetch items in the selected category
  const handleRankingChoice = async (rank) => {
    setRankCategory(rank); // Store the chosen category (Good, Okay, Bad)
    
    // Fetch the items in the selected rank category
    const itemsSnapshot = await getDocs(collection(db, `categories/${categoryId}/items`));
    const itemsInRankCategory = itemsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.rankCategory === rank);

    // Sort items by rating to allow binary search and placement
    const sortedItems = itemsInRankCategory.sort((a, b) => a.rating - b.rating);

    setRankedItems(sortedItems); // Set sorted items for comparison
    setStep(3); // Move to comparison step
  };

  // Step 3: Handle comparison of the new item with existing items and place it correctly
  const handleComparisonChoice = async (isBetter) => {
    // Calculate the middle index between lo and hi
    const middleIndex = Math.floor((lo + hi) / 2);

    // Adjust the boundaries based on the comparison
    if (isBetter) {
      setLo(middleIndex + 1);
    } else {
      setHi(middleIndex - 1);
    }

    // If lo exceeds hi, we've found the position to insert the new item
    if (lo > hi) {
      rankedItems.splice(lo, 0, { ...formData, rankCategory });

      // Calculate new ratings based on the new item's position
      const totalRange = (1 / 3) * 10; // For example, Good category has range between 6.6 and 10
      const minRating = rankCategory === 'Good' ? (totalRange * 2) : rankCategory === 'Okay' ? (totalRange) : 0;

      rankedItems.forEach((item, index) => {
        item.rating = minRating + (totalRange / (rankedItems.length - 1)) * index;
      });

      // Now batch write to Firestore
      try {
        const batch = writeBatch(db);
        rankedItems.forEach((item) => {
          const itemRef = item.id ? doc(db, `categories/${categoryId}/items`, item.id) : doc(collection(db, `categories/${categoryId}/items`));
          batch.set(itemRef, item, { merge: true });
        });
        await batch.commit();
        navigate(`/categories/${categoryId}`);
      } catch (error) {
        console.error('Error adding item or updating ratings: ', error);
      }

      return;
    }

    // Otherwise, continue comparing the new item with the new middle item
    setComparisonItem(rankedItems[middleIndex]);
  };

  useEffect(() => {
    if (step === 3) {
      if (rankedItems.length > 0) {
        setLo(0); // Start with 0 as the lower bound
        setHi(rankedItems.length - 1); // Upper bound is the last index
        setComparisonItem(rankedItems[Math.floor((0 + (rankedItems.length - 1)) / 2)]); // Start comparison with the middle item
      } else {
        handleComparisonChoice(true, 0, -1); // Automatically insert if no items to compare with
      }
    }
  }, [step, rankedItems]);

  return (
    <div>
      {/* Step 1: Input item details */}
      {step === 1 && (
        <>
          <h2>Add a New Item</h2>
          <form onSubmit={handleSubmit}>
            {fields.map((field, index) => (
              <input
                key={index}
                type="text"
                placeholder={field}
                value={formData[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                required
              />
            ))}
            <button type="submit">Next</button>
          </form>
        </>
      )}

      {/* Step 2: Ask for Good/Okay/Bad ranking */}
      {step === 2 && (
        <>
          <h2>How would you rate this item?</h2>
          <button onClick={() => handleRankingChoice('Good')}>Good 😊</button>
          <button onClick={() => handleRankingChoice('Okay')}>Okay 😐</button>
          <button onClick={() => handleRankingChoice('Bad')}>Bad 😞</button>
          <button onClick={() => navigate(`/categories/${categoryId}`)}>Back</button>
        </>
      )}

      {/* Step 3: Perform comparison */}
      {step === 3 && comparisonItem && (
        <>
          <h2>Compare your item</h2>
          <p>Is your item better than {comparisonItem[fields[0]]}?</p> {/* Accessing the correct field */}
          <button onClick={() => handleComparisonChoice(true)}>Yes</button> {/* No longer passing lo, hi */}
          <button onClick={() => handleComparisonChoice(false)}>No</button>
          <button onClick={() => navigate(`/categories/${categoryId}`)}>Back</button>
        </>
      )}
    </div>
  );
};

export default AddItem;