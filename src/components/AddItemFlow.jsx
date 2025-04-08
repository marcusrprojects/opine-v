import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ItemDetailsStep from "./ItemDetailsStep";
import RankSelectionStep from "./RankSelectionStep";
import ComparisonStep from "./ComparisonStep";
import LoadingComponent from "./LoadingComponent";
import "../styles/AddItemFlow.css";
import LoadingMessages from "../enums/LoadingMessages";
import NavPanel from "./Navigation/NavPanel";

const AddItemFlow = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [itemData, setItemData] = useState({});
  const [rankCategory, setRankCategory] = useState("");
  const [fields, setFields] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFieldsLoading, setIsFieldsLoading] = useState(true);
  const [isStepValid, setIsStepValid] = useState(false);
  const [isRankingComplete, setIsRankingComplete] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      setIsFieldsLoading(true);
      try {
        const response = await fetch(`/api/getCategoryFields`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId }),
        });
        if (!response.ok) throw new Error("Failed to fetch fields");
        const data = await response.json();
        setFields(data.fields || []);
        setTiers(data.tiers || []);
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
      setIsFieldsLoading(false);
    };
    fetchFields();
  }, [categoryId]);

  const handleNext = () => {
    if (currentStep === 1 && !isStepValid) return;
    if (currentStep === 2 && rankCategory === "") {
      alert("Please select a tier before proceeding.");
      return;
    }
    if (currentStep === 3 && !isRankingComplete) {
      alert("Please complete the comparisons.");
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setRankCategory("");
    }
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate(`/categories/${categoryId}`);
    }
  };

  // Use secure endpoint to create the item.
  const handleSave = async (updatedRankedItems) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/createItem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          itemData,
          rankCategory,
          updatedRankedItems,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Item creation failed");
      navigate(`/categories/${categoryId}`);
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setLoading(false);
    }
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
        isNextDisabled={
          currentStep === 1
            ? !isStepValid
            : currentStep === 2
            ? rankCategory === ""
            : !isRankingComplete
        }
        currentStep={currentStep}
        totalSteps={3}
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
          <RankSelectionStep
            setRankCategory={setRankCategory}
            rankCategory={rankCategory}
            onNext={handleNext}
            tiers={tiers}
          />
        )}
        {currentStep === 3 && (
          <ComparisonStep
            categoryId={categoryId}
            itemData={itemData}
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

export default AddItemFlow;
