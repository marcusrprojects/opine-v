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
import { withLoading } from '../utils/loadingUtils';
import LoadingMessages from '../enums/LoadingMessages';

const AddItemFlow = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [itemData, setItemData] = useState({});
  const [rankCategory, setRankCategory] = useState(null);
  const [fields, setFields] = useState([]);
  const [primaryField, setPrimaryField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFieldsLoading, setIsFieldsLoading] = useState(true); // New loading state for fields and primaryField

  useEffect(() => {
    const fetchFields = async () => {
      setIsFieldsLoading(true); // Start loading
      const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        setFields(categoryData.fields || []);
        setPrimaryField(categoryData.primaryField);
      }
      setIsFieldsLoading(false); // End loading after fetching
    };
    fetchFields();
  }, [categoryId]);

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const handleSave = async (updatedRankedItems) => {
    await withLoading(setLoading, async () => {
      await writeItemsToFirestore(categoryId, updatedRankedItems, rankCategory);
      navigate(`/categories/${categoryId}`);
    });
  };

  const updateItemData = (newData) => {
    setItemData(newData);
  };

  // Show loading component if `loading` or `isFieldsLoading` is true
  if (loading || isFieldsLoading) {
    return <LoadingComponent message={LoadingMessages.SAVING} />;
  }

  return (
    <div className="add-item-container">
      {currentStep === 1 && (
        <ItemDetailsStep
          fields={fields}
          primaryField={primaryField}
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
          primaryField={primaryField}
          rankCategory={rankCategory}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AddItemFlow;