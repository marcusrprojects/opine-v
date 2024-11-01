import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import RankSelectionStep from './RankSelectionStep';
import ComparisonStep from './ComparisonStep';
import LoadingComponent from './LoadingComponent';
import { refreshRankedItems } from '../utils/ranking';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ReRankFlow = ({ categoryId, existingItem }) => {
  const [currentStep, setCurrentStep] = useState(2);
  const [rankCategory, setRankCategory] = useState(existingItem.rankCategory);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    if (currentStep > 2) setCurrentStep((prev) => prev - 1);
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
    return <LoadingComponent message="Saving re-ranked items..." />;
  }

  return (
    <div className="add-item-container">
      {currentStep === 2 && (
        <RankSelectionStep
          itemData={existingItem}
          setRankCategory={setRankCategory}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 3 && (
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

// PropTypes for validation
ReRankFlow.propTypes = {
  categoryId: PropTypes.string.isRequired,
  existingItem: PropTypes.shape({
    rankCategory: PropTypes.number.isRequired,
    // other fields as needed in the existing item structure
  }).isRequired,
};

export default ReRankFlow;