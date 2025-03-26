import PropTypes from "prop-types";
import { useEffect } from "react";

const RankSelectionStep = ({
  tiers,
  setRankCategory,
  rankCategory,
  onNext,
}) => {
  const handleRankingChoice = (tier) => {
    setRankCategory(tier);
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
        {tiers.map((tier) => (
          <button
            key={tier.name}
            onClick={() => handleRankingChoice(tier)}
            style={{ borderColor: tier.color }}
          >
            {tier.name}
          </button>
        ))}
      </div>
    </div>
  );
};

RankSelectionStep.propTypes = {
  tiers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      cutoff: PropTypes.number.isRequired,
    })
  ).isRequired,
  setRankCategory: PropTypes.func.isRequired,
  rankCategory: PropTypes.object,
  onNext: PropTypes.func.isRequired,
};

export default RankSelectionStep;
