import { useState, useEffect } from "react";
import RankSelectionStep from "./RankSelectionStep";
import ComparisonStep from "./ComparisonStep";
import LoadingComponent from "./LoadingComponent";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import LoadingMessages from "../enums/LoadingMessages";
import NavPanel from "./Navigation/NavPanel";

const ReRankFlow = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const existingItem = location.state?.existingItem || null;

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

  // Secure endpoint to handle rerank.
  const handleSave = async (updatedRankedItems) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rerankCategory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          newTiers: tiers,
          updatedItems: updatedRankedItems,
          rankCategory,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Re-ranking failed");
      navigate(`/categories/${categoryId}`);
    } catch (error) {
      console.error("Error saving re-ranked items:", error);
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
        isNextDisabled={
          currentStep === 1 ? rankCategory === "" : !isRankingComplete
        }
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
