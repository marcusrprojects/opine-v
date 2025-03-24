import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";
import MultiThumbSlider from "./MultiThumbSlider";
import TemplateDropdown from "./TemplateDropdown";
import TextInput from "./TextInput";
import { DEFAULT_TIER_PRESETS } from "../constants/TierTemplates";
import { FaPlus, FaMinus } from "react-icons/fa";
import "../styles/TierSettings.css";

const TierSettings = ({ tiers, setTiers, cutoffs, setCutoffs }) => {
  const [presetId, setPresetId] = useState("good-ok-bad");
  const [customState, setCustomState] = useState({ tiers: [], cutoffs: [] });

  const updateCutoffsFromTiers = (tierArray) => {
    const spacing = 10 / tierArray.length;
    return tierArray
      .map((_, i) => parseFloat(((i + 1) * spacing).toFixed(2)))
      .slice(0, tierArray.length - 1);
  };

  const handleTemplateSelect = useCallback(
    (preset) => {
      const tierCount = preset.tiers.length;
      const defaultCutoffs = preset.tiers
        .map((_, i) => parseFloat(((i + 1) * (10 / tierCount)).toFixed(2)))
        .slice(0, tierCount - 1);

      setPresetId(preset.id);
      setTiers(preset.tiers.map((t) => ({ ...t }))); // clone to avoid mutation
      setCutoffs(defaultCutoffs);
    },
    [setCutoffs, setTiers]
  );

  // On mount and when switching presetId
  useEffect(() => {
    if (presetId === "custom") {
      setTiers(customState.tiers);
      setCutoffs(customState.cutoffs);
    } else {
      const preset = DEFAULT_TIER_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        const defaultCutoffs = updateCutoffsFromTiers(preset.tiers);
        setTiers(preset.tiers.map((t) => ({ ...t })));
        setCutoffs(defaultCutoffs);
      }
    }
  }, [presetId, customState, setTiers, setCutoffs]);

  const switchToCustomMode = (newTiers, newCutoffs) => {
    setCustomState({ tiers: [...newTiers], cutoffs: [...newCutoffs] });
    setPresetId("custom");
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    switchToCustomMode(updated, cutoffs);
  };

  const handleCutoffChange = (updatedCutoffs) => {
    switchToCustomMode(tiers, updatedCutoffs);
  };

  const handleColorChange = (index, newColor) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], color: newColor };
    switchToCustomMode(updated, cutoffs);
  };

  const handleAddTier = () => {
    const newTier = { name: `New Tier`, color: "#CCCCCC" };
    const updatedTiers = [...tiers, newTier];
    const updatedCutoffs = updateCutoffsFromTiers(updatedTiers);
    switchToCustomMode(updatedTiers, updatedCutoffs);
  };

  const handleRemoveTier = (index) => {
    if (tiers.length <= 2) return;
    const updatedTiers = tiers.filter((_, i) => i !== index);
    const updatedCutoffs = updateCutoffsFromTiers(updatedTiers);
    switchToCustomMode(updatedTiers, updatedCutoffs);
  };

  return (
    <div className="tier-settings">
      <TemplateDropdown
        templates={[
          ...DEFAULT_TIER_PRESETS,
          { id: "custom", name: "Custom", tiers: customState.tiers },
        ]}
        selectedId={presetId}
        onSelect={handleTemplateSelect}
      />

      <div className="tier-list">
        {tiers.map((tier, i) => (
          <div className="tier-row" key={i}>
            <TextInput
              value={tier.name}
              onChange={(e) => handleTierChange(i, "name", e.target.value)}
              placeholder="Tier Name"
            />
            <div className="tier-icons">
              {tiers.length > 2 && (
                <FaMinus
                  className="remove-tier-icon"
                  onClick={() => handleRemoveTier(i)}
                />
              )}
              {i === tiers.length - 1 && (
                <FaPlus className="add-tier-icon" onClick={handleAddTier} />
              )}
            </div>
          </div>
        ))}
      </div>

      <MultiThumbSlider
        tiers={tiers}
        cutoffs={cutoffs}
        onChange={handleCutoffChange}
        onColorChange={handleColorChange}
      />
    </div>
  );
};

TierSettings.propTypes = {
  tiers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  setTiers: PropTypes.func.isRequired,
  cutoffs: PropTypes.arrayOf(PropTypes.number).isRequired,
  setCutoffs: PropTypes.func.isRequired,
};

export default TierSettings;
