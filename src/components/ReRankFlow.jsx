import { useState, useEffect } from 'react';
import RankSelectionStep from './RankSelectionStep';
import ComparisonStep from './ComparisonStep';
import LoadingComponent from './LoadingComponent';
import { refreshRankedItems, writeItemsToFirestore } from '../utils/ranking';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LoadingMessages from '../enums/LoadingMessages';

const ReRankFlow = () => {
  const { categoryId } = useParams(); // Retrieve categoryId from item data
  const location = useLocation();
  const navigate = useNavigate();
  const { existingItem } = location.state;
  const initialRankCategory = existingItem.rankCategory; // Store initial rank category for comparison

  const [currentStep, setCurrentStep] = useState(1); // Start from RankSelectionStep
  const [rankCategory, setRankCategory] = useState(initialRankCategory); // Track new rank category if it changes
  const [fields, setFields] = useState([]);
  const [primaryField, setPrimaryField] = useState(null); // Add primaryField state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch category fields and primaryField based on categoryId from item data
    const fetchFields = async () => {
      const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        setFields(categoryData.fields || []);
        setPrimaryField(categoryData.primaryField); // Set primaryField from category data
      }
    };
    fetchFields();
  }, [categoryId]);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    else navigate(`/categories/${categoryId}/item/${existingItem.id}`);
  };

  const handleSave = async (updatedRankedItems) => {
    setLoading(true);

    // Update the new category, including the item in its new rank category
    await writeItemsToFirestore(categoryId, updatedRankedItems, rankCategory);

    // Check for cross-category re-ranking
    const isCrossCategory = initialRankCategory !== rankCategory;

    if (isCrossCategory) {
      // Update the old category to remove the item
      await refreshRankedItems(categoryId, initialRankCategory);
    }

    setLoading(false);
    navigate(`/categories/${categoryId}`);
  };

  // Show loading component if `loading` is true
  if (loading) {
    return <LoadingComponent message={LoadingMessages.UPDATING} />;
  }

  return (
    <div className="add-item-container">
      {currentStep === 1 && (
        <RankSelectionStep
          itemData={existingItem}
          setRankCategory={setRankCategory}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 2 && (
        <ComparisonStep
          categoryId={categoryId}
          itemData={existingItem}
          fields={fields}
          primaryField={primaryField} // Pass primaryField to ComparisonStep
          rankCategory={rankCategory}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ReRankFlow;