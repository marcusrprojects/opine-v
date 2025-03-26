import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";
import MultiThumbSlider from "./MultiThumbSlider";
import TemplateDropdown from "./TemplateDropdown";
import TextInput from "./TextInput";
import { DEFAULT_TIER_PRESETS } from "../constants/TierTemplates";
import { FaPlus, FaMinus } from "react-icons/fa";
import "../styles/TierSettings.css";
import { generateUniqueTierId } from "../utils/tierUtils";

const TierSettings = ({ tiers, setTiers }) => {
  const [presetId, setPresetId] = useState("good-ok-bad");
  const [customState, setCustomState] = useState({ tiers: [] });

  // Ensure each tier has a cutoff, spacing them evenly
  const attachCutoffsToTiers = (tierArray) => {
    const spacing = 10 / tierArray.length;
    return tierArray.map((tier, i) => ({
      ...tier,
      cutoff: parseFloat(((i + 1) * spacing).toFixed(2)),
    }));
  };

  const handleTemplateSelect = useCallback(
    (preset) => {
      const tiersWithCutoffs = attachCutoffsToTiers(
        preset.tiers.map((t) => ({ ...t }))
      );
      setPresetId(preset.id);
      setTiers(tiersWithCutoffs);
    },
    [setTiers]
  );

  useEffect(() => {
    if (presetId === "custom") {
      setTiers(customState.tiers);
    } else {
      const preset = DEFAULT_TIER_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        const tiersWithCutoffs = attachCutoffsToTiers(
          preset.tiers.map((t) => ({ ...t }))
        );
        setTiers(tiersWithCutoffs);
      }
    }
  }, [presetId, customState, setTiers]);

  // Updates tiers with evenly recalculated cutoffs and switches to custom
  const updateAndSwitchToCustom = (newTiers) => {
    const updated = newTiers.map((tier) => {
      if (!tier.id) {
        return { ...tier, id: generateUniqueTierId(newTiers) };
      }
      return tier;
    });
    setCustomState({ tiers: [...updated] });
    setPresetId("custom");
    setTiers(updated);
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    updateAndSwitchToCustom(updated);
  };

  // Now accepts an updated tiers array (which has new cutoff values)
  const handleCutoffChange = (updatedTiers) => {
    setCustomState({ tiers: [...updatedTiers] });
    setPresetId("custom");
    setTiers(updatedTiers);
  };

  const handleColorChange = (index, newColor) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], color: newColor };
    updateAndSwitchToCustom(updated);
  };

  const handleAddTier = () => {
    const updatedTiers = [...tiers, { name: `New Tier`, color: "#CCCCCC" }];
    updateAndSwitchToCustom(updatedTiers);
  };

  const handleRemoveTier = (index) => {
    if (tiers.length <= 2) return;
    const updatedTiers = tiers.filter((_, i) => i !== index);
    updateAndSwitchToCustom(updatedTiers);
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
      cutoff: PropTypes.number,
    })
  ).isRequired,
  setTiers: PropTypes.func.isRequired,
};

export default TierSettings;
