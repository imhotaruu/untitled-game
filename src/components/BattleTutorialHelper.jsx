import { divineMoves, divinePhases, getDivinePhase } from "../data/divineTutorial";

export default function BattleTutorialHelper({ combat }) {
  const phase = getDivinePhase(combat);
  if (!phase || combat.status !== "active") return null;
  const move = divineMoves.find((entry) => entry.id === phase.moveId);
  return <aside className="battle-tutorial-helper" aria-label="Tutorial helper">
    <span className="tutorial-helper-step">Tutorial · {divinePhases.indexOf(phase) + 1} / {divinePhases.length}</span>
    <h3>{phase.label}</h3>
    <p className="tutorial-helper-objective">{phase.objective}</p>
    <p>{phase.id === "guided_strike" ? "Guiding Star guarantees your next physical strike will hit. Use it to follow a support spell with an attack." : move.description}</p>
    {phase.id === "ward" && <p>Magic uses mana. Spells can attack, protect, heal, or support—choose the effect that fits the situation.</p>}
    <span className="tutorial-helper-cost">{move.manaCost ? `${move.manaCost} mana` : `${move.cost} stamina`}</span>
  </aside>;
}
