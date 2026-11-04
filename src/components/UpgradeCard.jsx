import { useId } from "react";
import { canPayResourceCost } from "../engine/resourceSystem";
import { getNextUpgradeCost, getUpgradeLevel, isUpgradeMaxed } from "../engine/upgradeSystem";
import { formatRegenValue } from "../utils/formatters";
import InfoRow from "./ui/InfoRow";

const previewStats = {
  maxHp: "Max health", maxMp: "Max mana", maxStamina: "Max stamina",
  hpRegen: "Health regen", staminaRegen: "Stamina regen",
};

export default function UpgradeCard({ upgrade, gameState, onPurchaseUpgrade }) {
  const costId = useId();
  const level = getUpgradeLevel(gameState, upgrade.id);
  const maxed = isUpgradeMaxed(gameState, upgrade);
  const cost = getNextUpgradeCost(gameState, upgrade);
  const affordable = cost !== null && canPayResourceCost(gameState.resources, cost);
  const status = maxed ? "Maximum level reached" : !cost ? "Upgrade unavailable"
    : affordable ? "Ready to upgrade" : "Not enough resources";

  return (
    <article className="upgrade-card">
      <div className="upgrade-card-header">
        <strong>{upgrade.label}</strong>
        <span>Level {level} / {upgrade.maxLevel}</span>
      </div>
      <div className="upgrade-copy">
        <p>{upgrade.description}</p>
        {upgrade.flavorText && <p className="upgrade-flavor">{upgrade.flavorText}</p>}
      </div>
      <div className="upgrade-preview">
        {upgrade.effects.filter((effect) => previewStats[effect.stat]).map((effect) => {
          const current = gameState.player[effect.stat];
          const unit = effect.stat.endsWith("Regen") ? "/s" : "";
          return <InfoRow key={effect.stat} label={previewStats[effect.stat]}
            value={maxed ? `${formatRegenValue(current)}${unit}`
              : `${formatRegenValue(current)}${unit} → ${formatRegenValue(current + effect.amount)}${unit}`} />;
        })}
      </div>
      <div className="upgrade-costs" id={costId}>
        {!maxed && cost && (Object.keys(cost).length ? <>
          <span className="upgrade-cost-label">Cost · owned / required</span>
          {Object.entries(cost).map(([resourceId, amount]) => {
            const resource = gameState.resources[resourceId];
            const owned = resource?.amount ?? 0;
            return <div className="upgrade-cost-row" key={resourceId} data-missing={owned < amount}>
              <span>{resource?.label || resourceId}</span>
              <strong>{owned} / {amount}{owned < amount ? ` · need ${amount - owned} more` : ""}</strong>
            </div>;
          })}
        </> : <p>Free</p>)}
        <p className="upgrade-status">{status}</p>
      </div>
      <button type="button" disabled={maxed || !affordable} aria-describedby={costId}
        aria-label={`Upgrade ${upgrade.label}`} onClick={() => onPurchaseUpgrade(upgrade)}>
        {maxed ? "Max level" : "Upgrade"}
      </button>
    </article>
  );
}
