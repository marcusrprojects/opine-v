import PropTypes from "prop-types";
import { useState, useEffect, useCallback } from "react";
import MultiThumbSlider from "./MultiThumbSlider";
import TemplateDropdown from "./TemplateDropdown";
import TextInput from "./TextInput";
import { DEFAULT_TIER_PRESETS } from "../constants/TierTemplates";
import { FaPlus, FaMinus } from "react-icons/fa";
import "../styles/TierSettings.css";
import { generateUniqueTierId } from "../utils/tierUtils";

// Default one-tier configuration for custom mode.
const DEFAULT_ONE_TIER = [
  { name: "Custom Tier", color: "#CCCCCC", cutoff: 10 },
];

const TierSettings = ({ tiers, setTiers }) => {
  // If tiers exist, default to "custom"; otherwise, default to the preset "good-ok-bad".
  const initialPresetId = tiers && tiers.length > 0 ? "custom" : "good-ok-bad";
  const [presetId, setPresetId] = useState(initialPresetId);
  // Initialize custom state with existing tiers (or empty array).
  const [customState, setCustomState] = useState({ tiers: tiers || [] });

  // Helper: space tiers evenly by assigning cutoffs.
  const attachCutoffsToTiers = useCallback((tierArray) => {
    const spacing = 10 / tierArray.length;
    return tierArray.map((tier, i) => ({
      ...tier,
      cutoff: parseFloat(((i + 1) * spacing).toFixed(2)),
    }));
  }, []);

  const handleTemplateSelect = useCallback(
    (preset) => {
      // When a preset is selected, apply its tiers.
      const tiersWithCutoffs = attachCutoffsToTiers(
        preset.tiers.map((t) => ({ ...t }))
      );
      setPresetId(preset.id);
      setTiers(tiersWithCutoffs);
    },
    [attachCutoffsToTiers, setTiers]
  );

  useEffect(() => {
    if (presetId === "custom") {
      setTiers(
        customState.tiers.length > 0 ? customState.tiers : DEFAULT_ONE_TIER
      );
    } else {
      const preset = DEFAULT_TIER_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        const tiersWithCutoffs = attachCutoffsToTiers(
          preset.tiers.map((t) => ({ ...t }))
        );
        setTiers(tiersWithCutoffs);
      }
    }
  }, [presetId, customState, setTiers, attachCutoffsToTiers]);

  // Update tiers and switch to custom mode.
  const updateAndSwitchToCustom = (newTiers) => {
    const usedIds = newTiers.filter((t) => t.id).map((t) => t.id);
    const updated = newTiers.map((tier) => {
      if (!tier.id) {
        const newId = generateUniqueTierId(usedIds);
        usedIds.push(newId);
        return { ...tier, id: newId };
      }
      return tier;
    });
    // Force the highest-tier's cutoff to 10 (whether there's one tier or more).
    updated[updated.length - 1].cutoff = 10;
    setCustomState({ tiers: [...updated] });
    setPresetId("custom");
    setTiers(updated);
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    updateAndSwitchToCustom(updated);
  };
  const handleColorChange = (index, newColor) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], color: newColor };
    updateAndSwitchToCustom(updated);
  };

  const handleAddTier = () => {
    const updatedTiers = [
      ...tiers,
      { name: `New Tier`, color: "#CCCCCC", cutoff: 10 },
    ];
    updateAndSwitchToCustom(updatedTiers);
  };

  const handleRemoveTier = (index) => {
    // Allow removal until at least one tier remains.
    if (tiers.length <= 1) return;
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
          <div className="tier-row" key={tier.id || i}>
            <TextInput
              value={tier.name}
              onChange={(e) => handleTierChange(i, "name", e.target.value)}
              placeholder="Tier Name"
            />
            <div className="tier-icons">
              {tiers.length > 1 && (
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
        onChange={updateAndSwitchToCustom}
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
      id: PropTypes.string,
    })
  ).isRequired,
  setTiers: PropTypes.func.isRequired,
};

export default TierSettings;
