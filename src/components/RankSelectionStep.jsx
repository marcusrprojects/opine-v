import PropTypes from 'prop-types';
import RankCategory from '../enums/RankCategory';

const RankSelectionStep = ({ setRankCategory, onNext, onBack }) => {
  const handleRankingChoice = (rank) => {
    setRankCategory(rank);
    onNext();
  };

  return (
    <div className="add-item-container">
      <h2>How would you rate this item?</h2>
      <div className="rating-buttons">
        <button
          onClick={() => handleRankingChoice(RankCategory.GOOD)}
          style={{ color: `hsl(120, 40%, 60%)` }}
        >
          Good
        </button>
        <button
          onClick={() => handleRankingChoice(RankCategory.OKAY)}
          style={{ color: `hsl(60, 40%, 60%)` }}
        >
          Okay
        </button>
        <button
          onClick={() => handleRankingChoice(RankCategory.BAD)}
          style={{ color: `hsl(0, 40%, 60%)` }}
        >
          Bad
        </button>
      </div>
      <button className="button-nav" onClick={onBack}>Back</button>
    </div>
  );
};

// PropTypes for validation
RankSelectionStep.propTypes = {
  setRankCategory: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default RankSelectionStep;