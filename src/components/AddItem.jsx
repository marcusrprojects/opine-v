import { writeItemsToFirestore } from '../utils/ranking';
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import RankCategory from '../enums/RankCategory';
import '../styles/AddItem.css';

const AddItem = () => {
  const { categoryId } = useParams();
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null); // State to hold any errors
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [comparisonItem, setComparisonItem] = useState(null);
  const [rankCategory, setRankCategory] = useState(RankCategory.OKAY);
  const [rankedItems, setRankedItems] = useState([]);
  const [lo, setLo] = useState(0);
  const [hi, setHi] = useState(0);
  const CHAR_LIMIT = 32; // Character limit for the first field
  const WORD_CHAR_LIMIT = 15; // Word character limit for each word in the first field

  useEffect(() => {
    // Scrolls the page to the top when the component is mounted
    window.scrollTo(0, 0);
  }, []);

  // Fetch category details when component mounts or when categoryId changes
  useEffect(() => {
    const fetchCategory = async () => {
      const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
      const categoryData = categoryDoc.data();
      setFields(categoryData.fields);
    };
    fetchCategory();
  }, [categoryId]);

  // Handle form input changes for the new item details
  const handleChange = (field, value) => {
    // Set limits only for the first field
    if (field === fields[0]) {
      if (value.length > CHAR_LIMIT) {
        setError(`Maximum ${CHAR_LIMIT} characters allowed for ${fields[0]}`);
        return;
      }

      const words = value.split(' ');
      const isWordTooLong = words.some(word => word.length > WORD_CHAR_LIMIT);
      if (isWordTooLong) {
        setError(`Each word in the ${fields[0]} field can have up to ${WORD_CHAR_LIMIT} characters.`);
        return;
      }
    }
    
    setError(null); // Clear error if within limit
    setFormData({ ...formData, [field]: value });
  };

  // Handle going back to the previous step or category page
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1); // Go to the previous step
    } else {
      navigate(`/categories/${categoryId}`); // Go back to category page
    }
  };

  // Step 1: Handle form submission to add item details and move to rank selection
  const handleSubmit = (e) => {
    e.preventDefault();
    if (fields.some(field => !formData[field])) {
      alert('Please fill in all required fields.');
      return;
    }
    setStep(2);
  };

  const handleRankingChoice = async (rank) => {
    setRankCategory(rank);
    
    const itemsSnapshot = await getDocs(collection(db, `categories/${categoryId}/items`));
    const itemsInRankCategory = itemsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.rankCategory === rank);

    if (itemsSnapshot.empty || itemsInRankCategory.length === 0) {
      const range = (1 / 3) * 10;
      const rating = rank === RankCategory.GOOD ? range * 2.5 : rank === RankCategory.OKAY ? range * 1.5 : range * 0.5;
      const newItem = { ...formData, rankCategory: rank, rating: rating };
      await writeItemsToFirestore([newItem]);
    }

    const sortedItems = itemsInRankCategory.sort((a, b) => a.rating - b.rating);
    setRankedItems(sortedItems);
    setHi(sortedItems.length - 1);
    setStep(3);
  };

  const handleComparisonChoice = async (isBetter) => {
    let currentLo = lo;
    let currentHi = hi;
    let middleIndex = Math.floor((currentLo + currentHi) / 2);

    if (isBetter) {
      currentLo = middleIndex + 1;
    } else {
      currentHi = middleIndex - 1;
    }

    middleIndex = Math.floor((currentLo + currentHi) / 2);

    if (currentLo > currentHi) {
      rankedItems.splice(currentLo, 0, { ...formData, rankCategory });
      writeItemsToFirestore(rankedItems);
    } else {
      setComparisonItem(rankedItems[middleIndex]);
      setLo(currentLo);
      setHi(currentHi);
    }
  };

  useEffect(() => {
    if (step === 3 && rankedItems.length > 0) {
      const middleIndex = Math.floor((0 + (rankedItems.length - 1)) / 2);
      setComparisonItem(rankedItems[middleIndex]);
    }
  }, [step, rankedItems]);

  return (
    <div className="add-item-container">
      {step === 1 && (
        <>
          <h2>Add a New Item</h2>
          <form onSubmit={handleSubmit}>
            {fields.map((field, index) => (
              <div key={index}>
                <input
                  type="text"
                  placeholder={field}
                  value={formData[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required
                />
                {index === 0 && error && <p className="error-message">{error}</p>}
              </div>
            ))}
            <div className="button-nav-container">
              <button className="button-nav" onClick={handleBack}>Back</button>
              <button className="button-nav" type="submit" disabled={!!error}>Next</button>
            </div>
          </form>
        </>
      )}
  
      {step === 2 && (
        <>
          <h2>How would you rate this item?</h2>
          <div className="rating-buttons">
            <button className="button-common" onClick={() => handleRankingChoice(RankCategory.GOOD)} style={{ backgroundColor: `hsl(120, 40%, 60%)` }}>Good</button>
            <button className="button-common" onClick={() => handleRankingChoice(RankCategory.OKAY)} style={{ backgroundColor: `hsl(60, 40%, 60%)` }}>Okay</button>
            <button className="button-common" onClick={() => handleRankingChoice(RankCategory.BAD)} style={{ backgroundColor: `hsl(0, 40%, 60%)` }}>Bad</button>
          </div>
          <button className="button-nav" onClick={handleBack}>Back</button>
        </>
      )}
  
      {step === 3 && comparisonItem && (
        <>
          <h2>Compare your item</h2>
          <p>Which item is better?</p>
          <div className="comparison-buttons">
            <button className="button-common" onClick={() => handleComparisonChoice(true)}>{formData[fields[0]]}</button>
            <button className="button-common" onClick={() => handleComparisonChoice(false)}>{comparisonItem[fields[0]]}</button>
          </div>
          <button className="button-nav" onClick={handleBack}>Back</button>
        </>
      )}
    </div>
  );
};

export default AddItem;