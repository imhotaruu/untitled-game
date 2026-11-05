import { encounters } from "../data/encounters";
import CombatPanel from "./CombatPanel";
import useCombatPlayback from "./useCombatPlayback";

export default function CombatScreen({ combat, areaLabel, onMove, onDismiss, onOpenModal, magicUnlocked, inventory }) {
  const playback = useCombatPlayback(combat, onMove);
  return <>
    <header className="combat-screen-header">
      <div>
        <p>{areaLabel} · Practice bout</p>
        <h1>{encounters[combat.encounterId].label}</h1>
      </div>
      <div className="top-actions" role="group" aria-label="Game saves">
        <button type="button" disabled={playback.busy} onClick={() => onOpenModal("save")}>Save</button>
        <button type="button" disabled={playback.busy} onClick={() => onOpenModal("load")}>Load</button>
        <button type="button" disabled={playback.busy} onClick={() => onOpenModal("reset")}>Reset</button>
      </div>
    </header>
    <main className="combat-screen" aria-label="Combat">
      <CombatPanel combat={playback.combat} onMove={playback.chooseMove} onDismiss={onDismiss}
        busy={playback.busy} frame={playback.frame}
        magicUnlocked={magicUnlocked} inventory={inventory} />
    </main>
  </>;
}
