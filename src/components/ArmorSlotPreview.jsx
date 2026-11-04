import { useId, useState } from "react";

// UI previews only. Actual armor equipment and bonuses belong to a later feature.
const armorSlots = {
  head: { label: "Head Armor", description: "Helmets and headgear." },
  chest: { label: "Chest Armor", description: "Chestplates and body armor." },
  arms: { label: "Arm Armor", description: "Bracers and arm guards." },
  legs: { label: "Leg Armor", description: "Leggings and greaves." },
};

const bodyRegions = [
  { slot: "head", className: "silhouette-head" },
  { slot: "chest", className: "silhouette-body" },
  { slot: "arms", className: "silhouette-arm silhouette-arm-left", side: "left" },
  { slot: "arms", className: "silhouette-arm silhouette-arm-right", side: "right" },
  { slot: "legs", className: "silhouette-leg silhouette-leg-left", side: "left" },
  { slot: "legs", className: "silhouette-leg silhouette-leg-right", side: "right" },
];

export default function ArmorSlotPreview() {
  const [selectedSlot, setSelectedSlot] = useState("chest");
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const detailsId = useId();
  const selected = armorSlots[selectedSlot];

  return (
    <div className="armor-slot-preview">
      <div className="character-portrait">
        <span className="armor-hover-label" aria-hidden="true">
          {hoveredSlot ? `${armorSlots[hoveredSlot].label} · Empty` : "Select an armor slot"}
        </span>
        <div className="character-silhouette" role="group" aria-label="Armor slot previews">
          {bodyRegions.map((region) => (
            <button
              key={region.className}
              type="button"
              className={`body-part ${region.className}`}
              aria-label={`${armorSlots[region.slot].label}${region.side ? ` (${region.side})` : ""}: empty`}
              aria-pressed={selectedSlot === region.slot}
              aria-controls={detailsId}
              onPointerEnter={() => setHoveredSlot(region.slot)}
              onPointerLeave={() => setHoveredSlot(null)}
              onFocus={() => setHoveredSlot(region.slot)}
              onBlur={() => setHoveredSlot(null)}
              onClick={() => setSelectedSlot(region.slot)}
            />
          ))}
        </div>
      </div>
      <div className="armor-slot-details" id={detailsId} role="status" aria-atomic="true">
        <div className="armor-slot-details-heading">
          <strong>{selected.label}</strong>
          <span>Empty</span>
        </div>
        <p>{selected.description} No armor equipped.</p>
      </div>
    </div>
  );
}
