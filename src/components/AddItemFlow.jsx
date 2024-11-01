import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ItemDetailsStep from './ItemDetailsStep';
import RankSelectionStep from './RankSelectionStep';
import ComparisonStep from './ComparisonStep';
import LoadingComponent from './LoadingComponent';
import { writeItemsToFirestore } from '../utils/ranking';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import "../styles/AddItem.css";

const AddItemFlow = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [itemData, setItemData] = useState({});
  const [rankCategory, setRankCategory] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
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
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleSave = async (updatedRankedItems) => {
    setLoading(true); // Start loading
    await writeItemsToFirestore(categoryId, updatedRankedItems, rankCategory);
    setLoading(false); // Stop loading
    navigate(`/categories/${categoryId}`);
  };

  const updateItemData = (newData) => {
    setItemData(newData);
  };

  // Show loading component if `loading` is true
  if (loading) {
    return <LoadingComponent message="Saving item..." />;
  }

  return (
    <div className="add-item-container">
      {currentStep === 1 && (
        <ItemDetailsStep
          fields={fields}
          itemData={itemData}
          updateItemData={updateItemData}
          onNext={handleNext}
          isEditable={true}
        />
      )}
      {currentStep === 2 && (
        <RankSelectionStep
          setRankCategory={setRankCategory}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 3 && (
        <ComparisonStep
          categoryId={categoryId}
          itemData={itemData}
          fields={fields}
          rankCategory={rankCategory}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AddItemFlow;