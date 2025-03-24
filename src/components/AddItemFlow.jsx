import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ItemDetailsStep from "./ItemDetailsStep";
import ComparisonStep from "./ComparisonStep";
import LoadingComponent from "./LoadingComponent";
import { writeItemsToFirestore } from "../utils/ranking";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "../styles/AddItemFlow.css";
import { withLoading } from "../utils/loadingUtils";
import LoadingMessages from "../enums/LoadingMessages";
import NavPanel from "./Navigation/NavPanel";

const AddItemFlow = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [itemData, setItemData] = useState({});
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFieldsLoading, setIsFieldsLoading] = useState(true);
  const [isStepValid, setIsStepValid] = useState(false);
  const [isRankingComplete, setIsRankingComplete] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      setIsFieldsLoading(true);
      const categoryDoc = await getDoc(doc(db, "categories", categoryId));
      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        setFields(categoryData.fields ?? []);
      }
      setIsFieldsLoading(false);
    };
    fetchFields();
  }, [categoryId]);

  const handleNext = () => {
    if (currentStep === 1 && !isStepValid) {
      return; // Prevent navigating if validation fails
    }
    if (currentStep === 2 && !isRankingComplete) {
      alert("Please complete the comparisons.");
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate(`/categories/${categoryId}`);
    }
  };

  const handleSave = async (updatedRankedItems) => {
    await withLoading(setLoading, async () => {
      // Write the items with their new ratings.
      await writeItemsToFirestore(categoryId, updatedRankedItems);
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
    <div>
      <NavPanel
        onBack={handleBack}
        onNext={handleNext}
        isBackDisabled={false}
        isNextDisabled={!(currentStep === 1 && isStepValid)}
        currentStep={currentStep}
        totalSteps={2}
      />

      <div className="add-item-container">
        {currentStep === 1 && (
          <ItemDetailsStep
            fields={fields}
            itemData={itemData}
            updateItemData={updateItemData}
            onValidationChange={setIsStepValid}
          />
        )}

        {currentStep === 2 && (
          <ComparisonStep
            categoryId={categoryId}
            itemData={itemData}
            fields={fields}
            onSave={handleSave}
            setIsRankingComplete={setIsRankingComplete}
          />
        )}
      </div>
    </div>
  );
};

export default AddItemFlow;
