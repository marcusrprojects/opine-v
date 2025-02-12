import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ItemDetailsStep from "./ItemDetailsStep";
import RankSelectionStep from "./RankSelectionStep";
import ComparisonStep from "./ComparisonStep";
import LoadingComponent from "./LoadingComponent";
import { writeItemsToFirestore } from "../utils/ranking";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "../styles/AddItemFlow.css";
import { withLoading } from "../utils/loadingUtils";
import LoadingMessages from "../enums/LoadingMessages";
import NavPanel from "./NavPanel";

const AddItemFlow = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [itemData, setItemData] = useState({});
  const [rankCategory, setRankCategory] = useState(null);
  const [fields, setFields] = useState([]);
  const [primaryField, setPrimaryField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFieldsLoading, setIsFieldsLoading] = useState(true);
  const [isStepValid, setIsStepValid] = useState(false); // Track step validation
  const [isRankingComplete, setIsRankingComplete] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      setIsFieldsLoading(true);
      const categoryDoc = await getDoc(doc(db, "categories", categoryId));
      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        setFields(categoryData.fields || []);
        setPrimaryField(categoryData.primaryField);
      }
      setIsFieldsLoading(false);
    };
    fetchFields();
  }, [categoryId]);

  const handleNext = () => {
    if (!isStepValid && currentStep === 1) {
      return; // Prevent navigating to the next step if validation fails
    }

    if (currentStep === 2 && rankCategory === null) {
      // Prevent navigating to step 3 if rankCategory is not selected
      alert("Please select a rank category before proceeding.");
      return;
    }

    // Prevent skipping forward in Step 3
    if (currentStep === 3 && !isRankingComplete) {
      alert("Please compare the necessary items.");
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setRankCategory(null); // Clear rank when going back to Step 2
    }
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate(`/categories/${categoryId}`);
    }
  };

  const handleSave = async (updatedRankedItems) => {
    await withLoading(setLoading, async () => {
      await writeItemsToFirestore(categoryId, updatedRankedItems, rankCategory);
      navigate(`/categories/${categoryId}`);
    });
  };

  const updateItemData = (newData) => {
    setItemData(newData);
  };

  if (loading || isFieldsLoading) {
    return <LoadingComponent message={LoadingMessages.SAVING} />;
  }

  return (
    <div className="add-item-container">
      {/* <NavPanel
        onBack={handleBack}
        onNext={handleNext}
        isBackDisabled={currentStep === 1}
        isNextDisabled={currentStep === 1 && !isStepValid} // Disable based on validation
      /> */}
      <NavPanel
        onBack={handleBack}
        onNext={handleNext}
        isBackDisabled={currentStep === 1}
        isNextDisabled={currentStep === 1 && !isStepValid}
        currentStep={currentStep}
        totalSteps={3} // Adjust if needed
      />

      {currentStep === 1 && (
        <ItemDetailsStep
          fields={fields}
          itemData={itemData}
          updateItemData={updateItemData}
          onValidationChange={setIsStepValid} // Pass validation state to AddItemFlow
        />
      )}

      {currentStep === 2 && (
        <RankSelectionStep
          setRankCategory={setRankCategory}
          rankCategory={rankCategory}
          onNext={handleNext}
        />
      )}

      {currentStep === 3 && (
        <ComparisonStep
          categoryId={categoryId}
          itemData={itemData}
          fields={fields}
          primaryField={primaryField}
          rankCategory={rankCategory}
          onSave={handleSave}
          setIsRankingComplete={setIsRankingComplete}
        />
      )}
    </div>
  );
};

export default AddItemFlow;
