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
    setHi(sortedItems.length - 1); // Upper bound is the last index
    setStep(3); // Move to comparison step
  };

  // Step 3: Handle comparison of the new item with existing items and place it correctly
  const handleComparisonChoice = async (isBetter) => {
    // Use local variables to keep track of lo and hi updates
    let currentLo = lo;
    let currentHi = hi;
  
    // Calculate the middle index between currentLo and currentHi
    let middleIndex = Math.floor((currentLo + currentHi) / 2);
    console.log("at beg of HCC:", "lo:", currentLo, "hi:", currentHi, "middleIndex:", middleIndex);
  
    // Adjust the boundaries based on the comparison
    if (isBetter) {
      currentLo = middleIndex + 1;
    } else {
      currentHi = middleIndex - 1;
    }

    middleIndex = Math.floor((currentLo + currentHi) / 2);
    console.log("HCC post-conditional:", "lo:", currentLo, "hi:", currentHi, "middleIndex:", middleIndex);

    // If currentLo exceeds currentHi, we've found the position to insert the new item
    if (currentLo > currentHi) {
      rankedItems.splice(currentLo, 0, { ...formData, rankCategory });
      // Call the async function to write to Firestore
      writeItemsToFirestore(rankedItems);
    } else {
      // Continue comparing with the next middle item
      setComparisonItem(rankedItems[middleIndex]);
    
      // Finally, update lo and hi states once the logic has finished
      setLo(currentLo);
      setHi(currentHi);
    }
  };

  // Firestore write logic moved to its own async function
  const writeItemsToFirestore = async (items) => {
    const totalRange = (1 / 3) * 10;
    const minRating = rankCategory === 'Good' ? (totalRange * 2) : rankCategory === 'Okay' ? totalRange : 0;

    items.forEach((item, index) => {
      item.rating = minRating + (totalRange / (items.length - 1)) * index;
    });

    try {
      const batch = writeBatch(db);
      items.forEach((item) => {
        const itemRef = item.id
          ? doc(db, `categories/${categoryId}/items`, item.id)
          : doc(collection(db, `categories/${categoryId}/items`));
        batch.set(itemRef, item, { merge: true });
      });
      await batch.commit();
      navigate(`/categories/${categoryId}`);
    } catch (error) {
      console.error('Error writing items to Firestore:', error);
    }
  };

  useEffect(() => {
    if (step === 3) {
      if (rankedItems.length > 0) {
        const middleIndex = Math.floor((0 + (rankedItems.length - 1)) / 2);
        console.log("useEffect comparison item:", rankedItems[middleIndex]);
        setComparisonItem(rankedItems[middleIndex]); // Start comparison with the middle item
      } else {
        // handleComparisonChoice(true, 0, -1); // Automatically insert if no items to compare with
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
          <p>Which item is better?</p>
          <button onClick={() => handleComparisonChoice(true)}>{formData[fields[0]]}</button>
          <button onClick={() => handleComparisonChoice(false)}>{comparisonItem[fields[0]]}</button><br></br><br></br>
          <button onClick={() => navigate(`/categories/${categoryId}`)}>Back</button>
        </>
      )}
    </div>
  );
};

export default AddItem;