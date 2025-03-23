import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import TierSlider from "./TierSlider";
import TemplateDropdown from "./TemplateDropdown";
import TextInput from "./TextInput";
import { DEFAULT_TIER_PRESETS } from "../constants/TierTemplates";
import { FaPlus, FaMinus } from "react-icons/fa";

const TierSettings = ({ tiers, setTiers, cutoffs, setCutoffs }) => {
  const [selectedPresetId, setSelectedPresetId] = useState("good-ok-bad");
  const [customState, setCustomState] = useState(null);

  const updateCutoffsFromTiers = (tierArray) => {
    const spacing = 10 / tierArray.length;
    return tierArray.map((_, i) => parseFloat(((i + 1) * spacing).toFixed(2)));
  };

  // Sync tiers/cutoffs with selected preset unless custom
  useEffect(() => {
    if (selectedPresetId === "custom") {
      if (customState) {
        setTiers(customState.tiers);
        setCutoffs(customState.cutoffs);
      }
    } else {
      const preset = DEFAULT_TIER_PRESETS.find(
        (p) => p.id === selectedPresetId
      );
      setTiers(preset.tiers.map((t) => ({ ...t }))); // clone to avoid mutation
      setCutoffs(updateCutoffsFromTiers(preset.tiers));
    }
  }, [customState, selectedPresetId, setCutoffs, setTiers]);

  const switchToCustom = (newTiers = tiers, newCutoffs = cutoffs) => {
    setCustomState({ tiers: [...newTiers], cutoffs: [...newCutoffs] });
    setSelectedPresetId("custom");
  };

  const handleTemplateSelect = (preset) => {
    setSelectedPresetId(preset.id);
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    switchToCustom(updated, cutoffs);
  };

  const handleCutoffChange = (newCutoffs) => {
    switchToCustom(tiers, newCutoffs);
  };

  const handleAddTier = () => {
    const newTier = {
      name: `New Tier`,
      color: "#CCCCCC",
    };
    const updatedTiers = [...tiers, newTier];
    const updatedCutoffs = updateCutoffsFromTiers(updatedTiers);
    switchToCustom(updatedTiers, updatedCutoffs);
  };

  const handleRemoveTier = (index) => {
    if (tiers.length <= 2) return;
    const updatedTiers = tiers.filter((_, i) => i !== index);
    const updatedCutoffs = updateCutoffsFromTiers(updatedTiers);
    switchToCustom(updatedTiers, updatedCutoffs);
  };

  return (
    <div className="tier-settings">
      <h3>Tier Settings</h3>

      <TemplateDropdown
        templates={[
          ...DEFAULT_TIER_PRESETS,
          { id: "custom", name: "Custom", tiers: [] },
        ]}
        selectedId={selectedPresetId}
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
            <input
              type="color"
              value={tier.color}
              onChange={(e) => handleTierChange(i, "color", e.target.value)}
              title="Pick Tier Color"
            />
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
        ))}
      </div>

      <TierSlider
        tiers={tiers}
        cutoffs={cutoffs}
        onChange={handleCutoffChange}
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
