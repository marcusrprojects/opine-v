import PropTypes from "prop-types";
import { useEffect } from "react";
import RankCategory from "../archives/RankCategory";

const RankSelectionStep = ({ setRankCategory, rankCategory, onNext }) => {
  const handleRankingChoice = (rank) => {
    setRankCategory(rank);
  };

  useEffect(() => {
    if (rankCategory !== null) {
      onNext();
    }
  }, [rankCategory, onNext]);

  return (
    <div className="rank-container">
      <h2>How would you rate this item?</h2>
      <div className="rating-buttons">
        <button
          onClick={() => handleRankingChoice(RankCategory.GOOD)}
          style={{ borderColor: `hsl(120, 40%, 60%)` }}
        >
          Good
        </button>
        <button
          onClick={() => handleRankingChoice(RankCategory.OKAY)}
          style={{ borderColor: `hsl(60, 40%, 60%)` }}
        >
          Okay
        </button>
        <button
          onClick={() => handleRankingChoice(RankCategory.BAD)}
          style={{ borderColor: `hsl(0, 40%, 60%)` }}
        >
          Bad
        </button>
      </div>
    </div>
  );
};

// PropTypes for validation
RankSelectionStep.propTypes = {
  setRankCategory: PropTypes.func.isRequired,
  rankCategory: PropTypes.number,
  onNext: PropTypes.func.isRequired,
  // onBack: PropTypes.func.isRequired,
};

export default RankSelectionStep;
