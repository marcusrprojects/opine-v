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

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (activeThumb === null) return;

      const value = getValueFromPosition(e.clientX);
      // Get current cutoff values from tiers
      const currentCutoffs = tiers
        .map((t) => t.cutoff)
        .filter((v) => typeof v === "number");

      // Prevent thumb from crossing its neighbors
      const min = activeThumb === 0 ? 0 : currentCutoffs[activeThumb - 1] + 0.1;
      const max =
        activeThumb === currentCutoffs.length - 1
          ? 10
          : currentCutoffs[activeThumb + 1] - 0.1;
      const clamped = Math.min(Math.max(value, min), max);

      // Update only the cutoff for the active tier
      const updated = [...tiers];
      updated[activeThumb] = { ...updated[activeThumb], cutoff: clamped };
      onChange(updated);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeThumb, tiers, onChange]);

  // Create an array of cutoff numbers, then add 0 at the beginning and 10 at the end
  const cutoffs = tiers
    .map((tier) => tier.cutoff)
    .filter((v) => typeof v === "number");
  const fullCutoffs = [0, ...cutoffs, 10];

  return (
    <div className="multi-thumb-slider">
      <div className="slider-track" ref={trackRef}>
        {fullCutoffs.map((_, i) => {
          if (i === fullCutoffs.length - 1) return null;
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

        {cutoffs.map((value, i) => (
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
