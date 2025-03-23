import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import TierSlider from "./TierSlider";
import TemplateDropdown from "./TemplateDropdown";
import ColorKey from "./ColorKey";
import { DEFAULT_TIER_PRESETS } from "../constants/TierTemplates";
// import "../styles/TierSettings.css";

const TierSettings = ({ tiers, setTiers, onCutoffUpdate }) => {
  const [cutoffs, setCutoffs] = useState(
    tiers.map((_, i) => (i + 1) * (10 / tiers.length))
  );

  // Sync cutoffs with tier length
  useEffect(() => {
    const newCutoffs = tiers.map((_, i) => (i + 1) * (10 / tiers.length));
    setCutoffs(newCutoffs);
    if (onCutoffUpdate) onCutoffUpdate(newCutoffs);
  }, [tiers, onCutoffUpdate]);

  const handleCutoffChange = (newCutoffs) => {
    setCutoffs(newCutoffs);
    if (onCutoffUpdate) onCutoffUpdate(newCutoffs);
  };

  const handleTemplateSelect = (preset) => {
    const newTiers = preset.tiers;
    setTiers(newTiers);
    setCutoffs(
      newTiers.map((_, i) =>
        parseFloat(((i + 1) * (10 / newTiers.length)).toFixed(2))
      )
    );
  };

  return (
    <div className="tier-settings-container">
      <h3 className="tier-settings-title">Tier Settings</h3>

      <div className="tier-settings-section">
        <TemplateDropdown
          onSelect={handleTemplateSelect}
          templates={DEFAULT_TIER_PRESETS}
        />
      </div>

      <div className="tier-settings-section">
        <TierSlider
          tiers={tiers}
          cutoffs={cutoffs}
          onChange={handleCutoffChange}
        />
      </div>

      <div className="tier-settings-section">
        <ColorKey tiers={tiers} />
      </div>
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
  onCutoffUpdate: PropTypes.func,
};

export default TierSettings;
