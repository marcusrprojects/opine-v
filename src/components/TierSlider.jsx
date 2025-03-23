import PropTypes from "prop-types";
// import "../styles/TierSlider.css";

const TierSlider = ({ tiers, cutoffs, onChange }) => {
  const handleSliderChange = (index, value) => {
    const updated = [...cutoffs];
    updated[index] = parseFloat(value);
    onChange(updated);
  };

  return (
    <div className="tier-slider">
      {cutoffs.slice(0, -1).map((cutoff, index) => (
        <div className="slider-row" key={index}>
          <label>
            {tiers[index].name} / {tiers[index + 1].name}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={cutoff}
            onChange={(e) => handleSliderChange(index, e.target.value)}
          />
          <span className="cutoff-value">{cutoff.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

TierSlider.propTypes = {
  tiers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  cutoffs: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TierSlider;
