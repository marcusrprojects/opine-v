import PropTypes from "prop-types";
import { useRef, useState, useEffect } from "react";
import "../styles/MultiThumbSlider.css";

const MultiThumbSlider = ({ tiers, onChange, onColorChange }) => {
  const trackRef = useRef(null);
  const colorInputRef = useRef(null);
  const [activeThumb, setActiveThumb] = useState(null);
  const [colorPicker, setColorPicker] = useState({
    visible: false,
    index: null,
    color: "",
    position: { left: 0, top: 0 },
  });

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

  // When a segment is clicked, show the color picker at the click position.
  const handleSegmentClick = (index, color, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!trackRef.current) return;

    // Calculate position relative to the slider track.
    const trackRect = trackRef.current.getBoundingClientRect();
    const segmentRect = e.currentTarget.getBoundingClientRect();
    const left = segmentRect.left - trackRect.left;
    const top = segmentRect.bottom - trackRect.top; // position below the segment

    setColorPicker({
      visible: true,
      index,
      color,
      position: { left, top },
    });
  };

  // Automatically open the native color picker as soon as the input appears.
  useEffect(() => {
    if (colorPicker.visible && colorInputRef.current) {
      if (colorInputRef.current.showPicker) {
        colorInputRef.current.showPicker();
      } else {
        colorInputRef.current.click();
      }
    }
  }, [colorPicker.visible]);

  // Handle the color picker's change event.
  const handleColorPickerChange = (e) => {
    onColorChange(colorPicker.index, e.target.value);
    setColorPicker({ ...colorPicker, visible: false });
  };

  return (
    <div className="multi-thumb-slider" style={{ position: "relative" }}>
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
              onClick={(e) => handleSegmentClick(i, color, e)}
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
      {colorPicker.visible && (
        <input
          ref={colorInputRef}
          type="color"
          value={colorPicker.color}
          style={{
            position: "absolute",
            left: `${colorPicker.position.left}px`,
            bottom: `${colorPicker.position.top}px`,
            zIndex: 1000,
          }}
          className="color-picker"
          onChange={handleColorPickerChange}
          onBlur={() => setColorPicker({ ...colorPicker, visible: false })}
          autoFocus
        />
      )}
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
