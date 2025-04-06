import { useState, useEffect } from "react";
import RankSelectionStep from "./RankSelectionStep";
import ComparisonStep from "./ComparisonStep";
import LoadingComponent from "./LoadingComponent";
import {
  writeItemsToFirestore,
  recalcRankingsForCategory,
} from "../utils/ranking";
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
  const initialRankCategory = existingItem?.rankCategory || "";

  const [currentStep, setCurrentStep] = useState(1);
  const [rankCategory, setRankCategory] = useState("");
  const [fields, setFields] = useState([]);
  const [tiers, setTiers] = useState([]);
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
          setFields(categoryData.fields ?? []);
          setTiers(categoryData.tiers ?? []);
        }
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
      setIsFieldsLoading(false);
    };
    fetchFields();
  }, [categoryId]);

  const handleNext = () => {
    if (currentStep === 1 && rankCategory === "") {
      alert("Please select a tier before proceeding.");
      return;
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
      setRankCategory("");
    } else {
      navigate(`/categories/${categoryId}/items/${existingItem.id}`);
    }
  };

  const handleSave = async (updatedRankedItems) => {
    setLoading(true);
    try {
      await writeItemsToFirestore(categoryId, updatedRankedItems, rankCategory);
      if (initialRankCategory !== rankCategory) {
        await recalcRankingsForCategory(categoryId, initialRankCategory);
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
        isNextDisabled={true}
        currentStep={currentStep}
        totalSteps={2}
      />
      <div className="add-item-container">
        {currentStep === 1 && (
          <RankSelectionStep
            setRankCategory={setRankCategory}
            rankCategory={rankCategory}
            onNext={handleNext}
            tiers={tiers}
          />
        )}
        {currentStep === 2 && (
          <ComparisonStep
            categoryId={categoryId}
            itemData={existingItem}
            fields={fields.filter((f) => f.active)}
            rankCategory={rankCategory}
            onSave={handleSave}
            setIsRankingComplete={setIsRankingComplete}
            tiers={tiers}
          />
        )}
      </div>
    </div>
  );
};

export default ReRankFlow;
