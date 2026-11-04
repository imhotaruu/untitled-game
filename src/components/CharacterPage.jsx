import { useId, useState } from "react";
import { items } from "../data/items";
import { equipmentSlots, formatEquipmentSlotLabel } from "../data/equipmentSlots";
import {
  formatDerivedCombatStatValue,
  getDerivedCombatStats,
  getEquipmentBonusTotals,
} from "../engine/derivedStats";
import {
  formatResourceCost,
  getNextUpgradeCost,
  getUpgradeLevel,
  isUpgradeMaxed,
} from "../engine/upgradeSystem";
import {
  formatAttributeLabel,
  formatDerivedCombatStatLabel,
  formatRegenValue,
  formatStatLabel,
} from "../utils/formatters";
import InfoRow from "./ui/InfoRow";
import StatMeter from "./ui/StatMeter";
import ItemFeedbackPopup from "./ItemFeedbackPopup";
import ArmorSlotPreview from "./ArmorSlotPreview";
import EquipmentBonusText from "./ui/EquipmentBonusText";

const otherEquipmentSlots = equipmentSlots.filter((slot) => slot.group !== "armor");

const attributeOrder = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
  "luck",
];

const derivedCombatStatOrder = [
  "attackPower",
  "defense",
  "guardPower",
  "accuracy",
  "evasion",
  "criticalChance",
  "initiative",
  "focus",
  "resolve",
];

function CharacterPage({
  itemFeedback,
  onDismissItemFeedback,
  player,
  resources,
  gameState,
  currentAreaLabel,
  upgrades,
  activeTab,
  onChangeTab,
  onPurchaseUpgrade,
  onEquipItem,
  onUnequipSlot,
  onUseItem,
}) {
  const [inventoryTab, setInventoryTab] = useState("equipment");
  const inventoryTabsId = useId();
  const itemMap = new Map(items.map((item) => [item.id, item]));

  const discoveredResources = Object.entries(resources).filter(
    ([resourceId, resource]) => {
      return resourceId !== "gold" && resource.discovered;
    }
  );

  const inventoryItems = gameState.inventory?.items || [];
  const equipment = gameState.equipment || {};
  const combatTraining = gameState.progress?.combatTraining ?? 0;
  const combatBasicsUnlocked = Boolean(
    gameState.unlocks?.systems?.combat_basics
  );
  const basicGuardUnlocked = Boolean(gameState.unlocks?.systems?.basic_guard);
  const attributes = player.attributes || {};
  const derivedCombatStats = getDerivedCombatStats(player, gameState);
  const equipmentBonusTotals = getEquipmentBonusTotals(gameState);

  const resolvedInventoryItems = inventoryItems.map((entry) => {
    const itemId = entry.itemId || entry.id;
    const item = itemMap.get(itemId);

    return {
      entry,
      itemId,
      item,
      quantity: entry.quantity ?? 1,
    };
  });

  const equipmentInventoryItems = resolvedInventoryItems.filter(({ item }) => {
    return item?.type === "equipment";
  });

  const consumableItems = resolvedInventoryItems.filter(({ item }) => {
    return item?.type === "consumable";
  });

  const keyItems = resolvedInventoryItems.filter(({ item }) => {
    return item?.type === "key_item";
  });

  const unknownItems = resolvedInventoryItems.filter(({ item }) => {
    return !item;
  });

  const inventoryGroups = [
    { id: "equipment", label: "Equipment", items: equipmentInventoryItems },
    { id: "consumables", label: "Consumables", items: consumableItems },
    { id: "key-items", label: "Key Items", items: keyItems },
    ...(unknownItems.length ? [{ id: "unknown", label: "Unknown", items: unknownItems }] : []),
  ];
  const selectedInventoryGroup = inventoryGroups.find((group) => group.id === inventoryTab)
    || inventoryGroups[0];

  function handleInventoryTabKeyDown(event, index) {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % inventoryGroups.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + inventoryGroups.length) % inventoryGroups.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = inventoryGroups.length - 1;
    else return;

    event.preventDefault();
    setInventoryTab(inventoryGroups[nextIndex].id);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[nextIndex].focus();
  }

  return (
    <section className="character-page-panel">
      <ItemFeedbackPopup feedback={itemFeedback} onDismiss={onDismissItemFeedback} />
      <div className="panel-header">
        <h2>Character</h2>
      </div>

      <div className="character-page-tabs">
        <button
          type="button"
          className={activeTab === "overview" ? "primary" : ""}
          onClick={() => onChangeTab("overview")}
        >
          Overview
        </button>

        <button
          type="button"
          className={activeTab === "combat" ? "primary" : ""}
          onClick={() => onChangeTab("combat")}
        >
          Combat
        </button>

        <button
          type="button"
          className={activeTab === "upgrades" ? "primary" : ""}
          onClick={() => onChangeTab("upgrades")}
        >
          Upgrades
        </button>

        <button
          type="button"
          className={activeTab === "items" ? "primary" : ""}
          onClick={() => onChangeTab("items")}
        >
          Items
        </button>
      </div>

      <div className="character-page-content">
        {activeTab === "overview" && (
          <>
            <section className="character-card">
              <h3>Profile</h3>

              <div className="character-grid">
                <InfoRow label="Name" value={player.name} />
                <InfoRow label="Gender" value={player.gender} />
                <InfoRow label="Level" value={player.level} />
                <InfoRow label="Path" value={player.path} />
                <InfoRow label="Area" value={currentAreaLabel} />
                <InfoRow label="Day" value={player.day} />
              </div>
            </section>

            <section className="character-card">
              <h3>Attributes</h3>

              <div className="character-grid">
                {attributeOrder.map((attribute) => (
                  <InfoRow
                    key={attribute}
                    label={formatAttributeLabel(attribute)}
                    value={attributes[attribute] ?? 1}
                  />
                ))}
              </div>
            </section>

            <section className="character-card">
              <h3>Status Details</h3>

              <StatMeter
                label="Health"
                value={player.hp}
                max={player.maxHp}
                type="health"
              />

              <StatMeter
                label="Mana"
                value={player.mp}
                max={player.maxMp}
                type="mana"
              />

              <StatMeter
                label="Stamina"
                value={player.stamina}
                max={player.maxStamina}
                type="stamina"
              />

              <div className="character-grid">
                <InfoRow
                  label="HP Regen"
                  value={formatRegenValue(player.hpRegen)}
                />
                <InfoRow
                  label="Stamina Regen"
                  value={`${formatRegenValue(player.staminaRegen)}/s`}
                />
              </div>
            </section>

            <section className="character-card">
              <h3>Resources</h3>

              <InfoRow
                label={resources.gold.label}
                value={`${resources.gold.amount}g`}
                highlight
              />

              {discoveredResources.map(([resourceId, resource]) => (
                <InfoRow
                  key={resourceId}
                  label={resource.label}
                  value={resource.amount}
                />
              ))}

              {discoveredResources.length === 0 && (
                <p className="empty-note">No other resources discovered.</p>
              )}
            </section>
          </>
        )}

        {activeTab === "combat" && (
          <>
            <section className="character-card">
              <h3>Combat Foundation</h3>

              <div className="character-grid">
                <InfoRow
                  label="Combat Basics"
                  value={combatBasicsUnlocked ? "Unlocked" : "Locked"}
                  highlight={combatBasicsUnlocked}
                />
                <InfoRow
                  label="Combat Training"
                  value={combatTraining}
                  highlight={combatTraining > 0}
                />
                <InfoRow
                  label="Training Rank"
                  value={getCombatTrainingRank(combatTraining)}
                />
                <InfoRow
                  label="Basic Guard"
                  value={basicGuardUnlocked ? "Learned" : "Not learned"}
                  highlight={basicGuardUnlocked}
                />
              </div>
            </section>

            <section className="character-card">
              <h3>Derived Combat Stats</h3>

              <div className="character-grid">
                {derivedCombatStatOrder.map((statId) => (
                  <InfoRow
                    key={statId}
                    label={formatDerivedCombatStatLabel(statId)}
                    value={formatDerivedCombatStatValue(
                      statId,
                      derivedCombatStats[statId]
                    )}
                    highlight={
                      statId === "attackPower" ||
                      statId === "defense" ||
                      statId === "guardPower"
                    }
                  />
                ))}
              </div>
            </section>

            <section className="character-card character-card-wide">
              <h3>Equipment Bonuses</h3>

              <div className="character-grid">
                {Object.keys(equipmentBonusTotals).length > 0 ? (
                  Object.entries(equipmentBonusTotals).map(([statId, amount]) => (
                    <InfoRow
                      key={statId}
                      label={formatDerivedCombatStatLabel(statId)}
                      value={`+${formatDerivedCombatStatValue(statId, amount)}`}
                      highlight
                    />
                  ))
                ) : (
                  <p className="empty-note">
                    No equipment bonuses are active.
                  </p>
                )}
              </div>
            </section>

            <section className="character-card character-card-wide">
              <h3>Combat Notes</h3>

              <p className="empty-note">
                These stats are calculated from attributes, combat training,
                combat unlocks, and equipped item bonuses. They do not affect
                battle yet.
              </p>
            </section>
          </>
        )}

        {activeTab === "upgrades" && (
          <section className="character-card character-card-wide">
            <h3>Upgrades</h3>

            <div className="upgrade-list">
              {upgrades.map((upgrade) => {
                const level = getUpgradeLevel(gameState, upgrade.id);
                const maxed = isUpgradeMaxed(gameState, upgrade);
                const cost = getNextUpgradeCost(gameState, upgrade);

                return (
                  <div key={upgrade.id} className="upgrade-card">
                    <div className="upgrade-card-header">
                      <strong>{upgrade.label}</strong>
                      <span>
                        Lv. {level}/{upgrade.maxLevel}
                      </span>
                    </div>

                    <p>{upgrade.description}</p>

                    <div className="upgrade-card-footer">
                      <span>
                        {maxed
                          ? "Maxed"
                          : `Cost: ${formatResourceCost(cost, resources)}`}
                      </span>

                      <button
                        type="button"
                        disabled={maxed}
                        onClick={() => onPurchaseUpgrade(upgrade)}
                      >
                        {maxed ? "Max" : "Upgrade"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "items" && (
          <div className="character-items-layout character-card-wide">
            <section className="character-card character-appearance" aria-label="Character and equipped gear">
              <header className="character-appearance-header">
                <div>
                  <h3>Character</h3>
                  <p className="character-appearance-name">{player.name}</p>
                </div>
                <span>Level {player.level}</span>
              </header>

              <ArmorSlotPreview
                gameState={gameState}
                onEquipItem={onEquipItem}
                onUnequipSlot={onUnequipSlot}
              />

              <h3>Weapon & Accessories</h3>

              <div className="equipment-grid">
                {otherEquipmentSlots.map((slot) => {
                  const equippedItemId = equipment[slot.id];
                  const equippedItem = itemMap.get(equippedItemId);

                  return (
                    <div key={slot.id} className="equipment-slot">
                      <span className="equipment-slot-label">
                        {slot.label}
                      </span>

                      {equippedItem ? (
                        <>
                          <strong>{equippedItem.label}</strong>
                          <EquipmentBonusText item={equippedItem} />

                          <button
                            type="button"
                            aria-label={`Unequip ${equippedItem.label} from ${slot.label}`}
                            onClick={() => onUnequipSlot(slot.id)}
                          >
                            Unequip
                          </button>
                        </>
                      ) : (
                        <>
                          <strong>Empty</strong>
                          <p>No item equipped.</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="character-card inventory-container" aria-label="Inventory">
              <h3>Inventory</h3>

              <div className="inventory-tabs" role="tablist" aria-label="Inventory categories">
                {inventoryGroups.map((group, index) => (
                  <button
                    key={group.id}
                    type="button"
                    role="tab"
                    id={`${inventoryTabsId}-tab-${group.id}`}
                    aria-controls={`${inventoryTabsId}-panel-${group.id}`}
                    aria-selected={selectedInventoryGroup.id === group.id}
                    tabIndex={selectedInventoryGroup.id === group.id ? 0 : -1}
                    className={selectedInventoryGroup.id === group.id ? "primary" : ""}
                    onClick={() => setInventoryTab(group.id)}
                    onKeyDown={(event) => handleInventoryTabKeyDown(event, index)}
                  >
                    {group.label}
                  </button>
                ))}
              </div>

              {inventoryGroups.map((group) => (
                <div
                  key={group.id}
                  role="tabpanel"
                  id={`${inventoryTabsId}-panel-${group.id}`}
                  aria-labelledby={`${inventoryTabsId}-tab-${group.id}`}
                  hidden={selectedInventoryGroup.id !== group.id}
                  tabIndex={0}
                >
                  {selectedInventoryGroup.id === group.id && (
                    <InventoryPanel
                      title={group.label}
                      items={group.items}
                      equipment={equipment}
                      onEquipItem={onEquipItem}
                      onUseItem={onUseItem}
                    />
                  )}
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </section>
  );
}

function InventoryPanel({
  title,
  items,
  equipment,
  onEquipItem,
  onUseItem,
}) {
  return (
    <section className="inventory-panel" aria-label={title}>
      <header className="inventory-panel-header">
        <h4>{title}</h4>
        <span>{items.length} {items.length === 1 ? "type" : "types"}</span>
      </header>

      {items.length === 0 && (
        <p className="inventory-empty">No {title.toLowerCase()} yet.</p>
      )}

      <div className="inventory-grid">
        {items.map(({ itemId, item, quantity }) => {
          if (!item) {
            return (
              <article key={itemId} className="inventory-item" aria-label={itemId}>
                <div className="inventory-item-heading">
                  <strong>{itemId}</strong>
                  <span className="item-type-pill inventory-quantity" aria-label={`Quantity: ${quantity}`}>
                    x{quantity}
                  </span>
                </div>
                <p>Unknown item.</p>
              </article>
            );
          }

          const equippedSlotId = getEquippedSlotId(equipment, item.id);
          const canEquip = item.type === "equipment" && !equippedSlotId;
          const canUse = item.type === "consumable";

          return (
            <article key={item.id} className="inventory-item" aria-label={item.label}>
              <div className="inventory-item-heading">
                <strong>{item.label}</strong>
                <span className="item-type-pill inventory-quantity" aria-label={`Quantity: ${quantity}`}>
                  x{quantity}
                </span>
              </div>

              <div className="inventory-item-meta">
                <span className="item-type-pill">
                  {formatItemType(item)}
                </span>
                {item.category && <span className="item-type-pill">{item.category}</span>}
              </div>

              <div className="inventory-item-details">
                <p>{item.description}</p>
                <EquipmentBonusText item={item} />
                <UseEffectText item={item} />
              </div>

              {(equippedSlotId || canEquip || canUse) && (
                <div className="inventory-item-actions">
                  {equippedSlotId && (
                    <p className="inventory-equipped-status">
                      Equipped in {formatEquipmentSlotLabel(equippedSlotId)}
                    </p>
                  )}
                  {canEquip && (
                    <button
                      type="button"
                      aria-label={`Equip ${item.label}`}
                      onClick={() => onEquipItem(item.id)}
                    >
                      Equip
                    </button>
                  )}
                  {canUse && (
                    <button
                      type="button"
                      aria-label={`Use ${item.label}`}
                      onClick={() => onUseItem(item.id)}
                    >
                      Use
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function UseEffectText({ item }) {
  const useEffects = formatUseEffects(item.useEffects);

  if (useEffects.length === 0) {
    return null;
  }

  return (
    <p className="empty-note">
      Use: {useEffects.join(", ")}
    </p>
  );
}

function formatUseEffects(useEffects = {}) {
  const restore = useEffects.restore || {};

  return Object.entries(restore).map(([stat, amount]) => {
    return `Restores +${amount} ${formatStatLabel(stat)}`;
  });
}

function getEquippedSlotId(equipment, itemId) {
  if (!equipment) {
    return null;
  }

  return (
    Object.entries(equipment).find(([, equippedItemId]) => {
      return equippedItemId === itemId;
    })?.[0] || null
  );
}

function formatItemType(item) {
  if (item.type === "equipment" && item.slot) {
    return item.slot;
  }

  if (item.type === "key_item") {
    return "key item";
  }

  return item.type || "item";
}

function getCombatTrainingRank(combatTraining) {
  if (combatTraining >= 5) {
    return "Guard Basics";
  }

  if (combatTraining > 0) {
    return "Beginner";
  }

  return "Untrained";
}

export default CharacterPage;
