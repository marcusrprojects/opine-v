import { useState, useEffect } from 'react';
import RankSelectionStep from './RankSelectionStep';
import ComparisonStep from './ComparisonStep';
import LoadingComponent from './LoadingComponent';
import { refreshRankedItems } from '../utils/ranking';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingMessages from '../enums/LoadingMessages';

const ReRankFlow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { categoryId, existingItem } = location.state;
  const [currentStep, setCurrentStep] = useState(1); // Start from 1
  const [rankCategory, setRankCategory] = useState(existingItem.rankCategory);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch category fields
    const fetchFields = async () => {
      const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        setFields(categoryData.fields || []);
      }
    };
    fetchFields();
  }, [categoryId]);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    else navigate(`/categories/${categoryId}`); // Navigate back if on RankSelectionStep
  };

  const handleSave = async (updatedRankedItems) => {
    setLoading(true); // Start loading
    await refreshRankedItems(categoryId, updatedRankedItems, rankCategory);
    setLoading(false); // Stop loading
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
          rankCategory={rankCategory}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ReRankFlow;