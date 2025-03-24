import PropTypes from "prop-types";
import { useRef, useState, useEffect } from "react";
import "../styles/MultiThumbSlider.css";

const MultiThumbSlider = ({ tiers, onChange, onColorChange }) => {
  const trackRef = useRef(null);
  const [activeThumb, setActiveThumb] = useState(null);

  const getPercentage = (value) => (value / 10) * 100;

  // Convert a clientX position to a slider value (0–10)
  const getValueFromPosition = (clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = x / rect.width;
    const value = Math.min(Math.max(percentage * 10, 0), 10);
    return Math.round(value * 10) / 10;
  };

  const handleMouseDown = (index) => (e) => {
    e.preventDefault();
    setActiveThumb(index);
  };

  const handleMouseUp = () => setActiveThumb(null);

  // Only tiers except the last one are adjustable.
  const adjustableTiers = tiers.slice(0, tiers.length - 1);
  const adjustableCutoffs = adjustableTiers.map((tier) => tier.cutoff);
  // For segments, boundaries are: 0, adjustable cutoffs, and fixed 10.
  const fullCutoffs = [0, ...adjustableCutoffs, 10];

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (activeThumb === null) return;

      const value = getValueFromPosition(e.clientX);
      // Boundaries for the active thumb
      const min =
        activeThumb === 0 ? 0 : adjustableCutoffs[activeThumb - 1] + 0.1;
      const max =
        activeThumb === adjustableCutoffs.length - 1
          ? 10
          : adjustableCutoffs[activeThumb + 1] - 0.1;
      const clamped = Math.min(Math.max(value, min), max);

      // Update only the adjustable tier corresponding to activeThumb.
      const updatedTiers = [...tiers];
      updatedTiers[activeThumb] = {
        ...updatedTiers[activeThumb],
        cutoff: clamped,
      };
      onChange(updatedTiers);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeThumb, adjustableCutoffs, tiers, onChange]);

  return (
    <div className="multi-thumb-slider">
      <div className="slider-track" ref={trackRef}>
        {fullCutoffs.map((_, i) => {
          if (i === fullCutoffs.length - 1) return null;
          // Each segment gets its color from the corresponding tier.
          const left = getPercentage(fullCutoffs[i]);
          const width = getPercentage(fullCutoffs[i + 1]) - left;
          const color = tiers[i]?.color || "#ccc";

          return (
            <div
              key={`segment-${i}`}
              className="slider-segment"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: color,
              }}
              onClick={() => {
                // Create a hidden color input for selecting a new color
                const input = document.createElement("input");
                input.type = "color";
                input.value = color;
                input.style.display = "none";
                document.body.appendChild(input);
                input.click();

                input.oninput = (e) => {
                  onColorChange(i, e.target.value);
                  document.body.removeChild(input);
                };

                input.onblur = () => {
                  if (document.body.contains(input)) {
                    document.body.removeChild(input);
                  }
                };
              }}
            />
          );
        })}

        {adjustableCutoffs.map((value, i) => (
          <div
            key={`thumb-${i}`}
            className="slider-thumb tick"
            style={{ left: `${getPercentage(value)}%` }}
            onMouseDown={handleMouseDown(i)}
          >
            <div className="tick-line" />
            <div className="tick-label">{Number(value).toFixed(1)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

MultiThumbSlider.propTypes = {
  tiers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      cutoff: PropTypes.number,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  onColorChange: PropTypes.func.isRequired,
};

export default MultiThumbSlider;
