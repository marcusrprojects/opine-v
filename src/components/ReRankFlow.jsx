import { useState, useEffect } from "react";
import RankSelectionStep from "./RankSelectionStep";
import ComparisonStep from "./ComparisonStep";
import LoadingComponent from "./LoadingComponent";
import { refreshRankedItems, writeItemsToFirestore } from "../utils/ranking";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import LoadingMessages from "../enums/LoadingMessages";
import NavPanel from "./Navigation/NavPanel";

const ReRankFlow = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const existingItem = location.state?.existingItem || null;
  const initialRankCategory = existingItem?.rankCategory || null;

  const [currentStep, setCurrentStep] = useState(1);
  const [rankCategory, setRankCategory] = useState(null);
  const [fields, setFields] = useState([]);
  const [primaryField, setPrimaryField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFieldsLoading, setIsFieldsLoading] = useState(true);
  const [isRankingComplete, setIsRankingComplete] = useState(false);

  useEffect(() => {
    if (!existingItem) {
      navigate(`/categories/${categoryId}`);
      return;
    }
  }, [existingItem, navigate, categoryId]);

  useEffect(() => {
    const fetchFields = async () => {
      setIsFieldsLoading(true);
      try {
        const categoryDoc = await getDoc(doc(db, "categories", categoryId));
        if (categoryDoc.exists()) {
          const categoryData = categoryDoc.data();
          setFields(categoryData.fields || []);
          setPrimaryField(categoryData.primaryField);
        }
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
      setIsFieldsLoading(false);
    };

    fetchFields();
  }, [categoryId]);

  const handleNext = () => {
    if (currentStep === 1 && rankCategory === null) {
      console.warn("Trying to go to Step 2 without selecting a rank category");
      alert("Please select a ranking category before proceeding.");
      return;
    }

    if (currentStep === 2 && !isRankingComplete) {
      console.warn("Trying to move forward before ranking is complete");
      return; // Prevent skipping ranking process
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setRankCategory(null);
    } else {
      navigate(`/categories/${categoryId}/item/${existingItem.id}`);
    }
  };

  const handleSave = async (updatedRankedItems) => {
    setLoading(true);

    try {
      await writeItemsToFirestore(categoryId, updatedRankedItems, rankCategory);

      if (initialRankCategory !== rankCategory) {
        await refreshRankedItems(categoryId, initialRankCategory);
      }

      navigate(`/categories/${categoryId}`);
    } catch (error) {
      console.error("Error saving re-ranked item:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || isFieldsLoading) {
    return <LoadingComponent message={LoadingMessages.UPDATING} />;
  }

  return (
    <div>
      <NavPanel
        onBack={handleBack}
        onNext={handleNext}
        isBackDisabled={false}
        isNextDisabled={currentStep === 1 && rankCategory === null}
        currentStep={currentStep}
        totalSteps={2} // Adjust as per the Re-Ranking Flow
      />

      <div className="add-item-container">
        {currentStep === 1 && (
          <RankSelectionStep
            setRankCategory={setRankCategory}
            rankCategory={rankCategory}
            onNext={handleNext}
          />
        )}
        {currentStep === 2 && (
          <ComparisonStep
            categoryId={categoryId}
            itemData={existingItem}
            fields={fields}
            primaryField={primaryField}
            rankCategory={rankCategory}
            onSave={handleSave}
            setIsRankingComplete={setIsRankingComplete}
          />
        )}
      </div>
    </div>
  );
};

export default ReRankFlow;
