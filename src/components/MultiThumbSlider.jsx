import PropTypes from "prop-types";
import { useRef, useState, useEffect } from "react";
import "../styles/MultiThumbSlider.css";

const MultiThumbSlider = ({ tiers, cutoffs, onChange, onColorChange }) => {
  const trackRef = useRef(null);
  const [activeThumb, setActiveThumb] = useState(null);

  const getPercentage = (value) => (value / 10) * 100;

  const getValueFromPosition = (clientX) => {
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
      const updated = [...cutoffs];
      updated[activeThumb] = value;
      onChange(updated);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeThumb, cutoffs, onChange]);

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
            className="slider-thumb"
            style={{ left: `${getPercentage(value)}%` }}
            onMouseDown={handleMouseDown(i)}
          >
            <span className="thumb-label">{value.toFixed(1)}</span>
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
    })
  ).isRequired,
  cutoffs: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
  onColorChange: PropTypes.func.isRequired,
};

export default MultiThumbSlider;
