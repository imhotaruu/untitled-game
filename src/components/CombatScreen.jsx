import { encounters } from "../data/encounters";
import CombatPanel from "./CombatPanel";
import useCombatPlayback from "./useCombatPlayback";
import { useState } from "react";
import TutorialReading from "./TutorialReading";
import PrologueSkipDialog from "./PrologueSkipDialog";
import DialogueHistoryButton from "./DialogueHistoryButton";

export default function CombatScreen({ combat, areaLabel, onMove, onDismiss, onOpenModal, magicUnlocked, inventory, combatPace = "normal", textSpeed = "normal", reducedMotion = false, replay = false, onExitReplay, onSkipPrologue, paused = false }) {
  const playback = useCombatPlayback(combat, onMove, combatPace);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const reading = combat.tutorial?.reading;
  return <>
    <header className="combat-screen-header">
      <div>
        <p>{areaLabel} · {encounters[combat.encounterId].tutorial ? "Prologue" : "Practice bout"}</p>
        <h1>{encounters[combat.encounterId].label}</h1>
      </div>
      <div className="top-actions" role="group" aria-label="Game options">
        <DialogueHistoryButton disabled={playback.busy || paused || confirmSkip} />
        <button type="button" disabled={playback.busy} aria-haspopup="dialog" onClick={() => onOpenModal("settings")}>Settings</button>
        {replay ? <button type="button" disabled={playback.busy} onClick={onExitReplay}>Exit Replay</button> : <>
          <button type="button" disabled={playback.busy} onClick={() => onOpenModal("save")}>Save</button>
          <button type="button" disabled={playback.busy} onClick={() => onOpenModal("load")}>Load</button>
          <button type="button" disabled={playback.busy} onClick={() => onOpenModal("reset")}>Reset</button>
        </>}
        {!replay && onSkipPrologue && <button type="button" disabled={playback.busy} onClick={() => setConfirmSkip(true)}>Skip Prologue</button>}
      </div>
    </header>
    <main className={reading ? "combat-screen combat-with-dialogue" : "combat-screen"} aria-label={reading ? "Tutorial story" : "Combat"}
      onClick={(event) => {
        if (!reading || paused || confirmSkip || event.target.closest("button, input, select, textarea, a, details, dialog, [role='dialog']")) return;
        event.currentTarget.querySelector(".narrative-screen-button")?.click();
      }}>
      <div className="combat-underlay" inert={Boolean(reading)} aria-hidden={reading ? true : undefined}>
        <CombatPanel combat={playback.combat} onMove={playback.chooseMove} onDismiss={onDismiss} dialogueActive={Boolean(reading)}
        busy={playback.busy} frame={playback.frame} reducedMotion={reducedMotion}
        magicUnlocked={magicUnlocked} inventory={inventory} />
      </div>
      {reading && <TutorialReading phaseId={reading} reducedMotion={reducedMotion} textSpeed={textSpeed} paused={paused || confirmSkip} onContinue={() => playback.chooseMove("continue_tutorial")} />}
    </main>
    {confirmSkip && <PrologueSkipDialog onCancel={() => setConfirmSkip(false)} onConfirm={() => { setConfirmSkip(false); onSkipPrologue(); }} />}
  </>;
}
