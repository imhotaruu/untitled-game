import { useEffect, useId, useRef, useState } from "react";
import { getCombatIntent, getHitChance } from "../engine/combatSystem";
import BattlePartyStrip from "./BattlePartyStrip";
import CombatOverlay from "./CombatOverlay";
import BattleCommands from "./BattleCommands";
import useHitReaction from "./useHitReaction";
import LogScrollControl from "./ui/LogScrollControl";
import StatMeter from "./ui/StatMeter";

const outcomeLabels = { victory: "Spar won", defeat: "Spar lost", retreat: "Spar ended" };

export default function CombatPanel({ combat, onMove, onDismiss, magicUnlocked, inventory, busy = false, frame = null }) {
  const [preview, setPreview] = useState({ label: "Commands", description: "Choose a category or a defensive move." });
  const [overlay, setOverlay] = useState(null);
  const [awayFromLatest, setAwayFromLatest] = useState(false);
  const headingRef = useRef(null);
  const logRef = useRef(null);
  const detailsId = useId();
  const enemyRef = useHitReaction(combat.enemy.hp, frame?.actor === "enemy" ? frame : null);
  const active = combat.status === "active";
  const intent = getCombatIntent(combat);
  const latest = combat.log[0] || { round: 0, messages: ["Choose a command when you are ready."] };
  const message = frame?.message || latest.messages.at(-1);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [combat.status]);

  function openOverlay(type) {
    if (busy) return;
    setAwayFromLatest(false);
    setOverlay(type);
  }

  function jumpToLatest() {
    if (logRef.current) {
      logRef.current.scrollTop = 0;
      logRef.current.focus({ preventScroll: true });
    }
    setAwayFromLatest(false);
  }

  return <div className="combat-layout">
    <section className="battle-stage" aria-label="Battlefield">
      <header className="battle-stage-header">
        <h2 ref={headingRef} tabIndex={-1} className="battle-turn-banner">
          {busy ? `${frame.actor === "enemy" ? `${combat.enemy.name}'s turn` : "Resolving your move"} / ${String(combat.round).padStart(2, "0")}`
            : active ? `Your turn / ${String(combat.round).padStart(2, "0")}` : outcomeLabels[combat.status]}
        </h2>
        <div className="battle-tools" role="group" aria-label="Battle information">
          <button type="button" disabled={busy} aria-haspopup="dialog" onClick={() => openOverlay("details")}>Details</button>
          <button type="button" disabled={busy} aria-haspopup="dialog" onClick={() => openOverlay("log")}>Battle Log</button>
        </div>
      </header>

      <div className="battle-enemy" data-defeated={combat.enemy.hp === 0}>
        <div className="enemy-figure" ref={enemyRef} aria-hidden="true">
          <span className="enemy-figure-aura" />
          <span className="portrait-silhouette"><span /></span>
          <span className="enemy-figure-ground" />
        </div>
        <div className="enemy-nameplate">
          <h3>{combat.enemy.name}</h3>
          <StatMeter label="HP" value={combat.enemy.hp} max={combat.enemy.maxHp} type="health" />
        </div>
      </div>

      {active && !busy && <div className="battle-intent">
        <span>Next move</span><strong>{intent.label}</strong>
        <p>{intent.description}</p>
      </div>}

      <div className="battle-message" key={frame?.id || `${latest.round}-${combat.status}`}>
        <span className="battle-message-label">{busy ? `Turn ${combat.round}` : latest.round ? `Turn ${latest.round}` : "Opening"}</span>
        <p>{message}</p>
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {message}
        {!busy && (active ? ` Your turn. ${intent.description}` : ` ${outcomeLabels[combat.status]}.`)}
      </p>
    </section>

    <div className="battle-dock">
      <section className="battle-commands" aria-label="Battle commands">
        {active ? <BattleCommands combat={combat} magicUnlocked={magicUnlocked} inventory={inventory}
          busy={busy} onMove={onMove} onPreview={setPreview} detailsId={detailsId} /> : <div className="battle-result">
          <h2>{outcomeLabels[combat.status]}</h2>
          <p>Your adventure health, stamina, and items are unchanged.</p>
          <button className="primary" type="button" onClick={onDismiss}>Return to Adventure</button>
        </div>}
      </section>

      <BattlePartyStrip members={[{ ...combat.player, id: "player" }]} activeMemberId={active && frame?.actor !== "enemy" ? "player" : null}
        busy={busy} frame={frame} finished={!active} onDetails={() => openOverlay("details")} />

      <aside className="battle-command-guide" aria-label={active ? "Command description" : "Practice results"}>
        {busy ? <div id={detailsId}><h3>Turn in progress</h3><p>Watch the exchange. Commands return when the turn finishes.</p></div> : active ? <div id={detailsId}>
          <h3>{preview.label}</h3><p>{preview.description}</p>
          {combat.player.stamina < preview.cost && <p className="battle-cost-warning">Not enough stamina. Guard or Recover to regain it.</p>}
        </div> : <div><h3>{outcomeLabels[combat.status]}</h3><p>You can return to the adventure whenever you are ready.</p></div>}
        <p className="battle-practice-note">Practice bout · Separate vitals<br />No rewards or lasting injuries</p>
      </aside>
    </div>

    {overlay && <CombatOverlay title={overlay === "log" ? "Battle Log" : `${combat.player.name} · Battle details`}
      onClose={() => setOverlay(null)}>
      {overlay === "log" ? <>
        <div className="battle-log-tools"><LogScrollControl canJump={awayFromLatest} onJump={jumpToLatest} /></div>
        <div className="story-reader battle-log-reader" ref={logRef} role="region" aria-label="Combat history"
          tabIndex={0} onScroll={(event) => setAwayFromLatest(event.currentTarget.scrollTop > 8)}>
          <ol className="story-passages">
            {combat.log.map((entry, index) => <li className="story-passage" key={entry.round} data-latest={index === 0}>
              <span className="story-latest-label">{entry.round ? `Turn ${entry.round}` : "Opening"}{index === 0 ? " · Latest" : ""}</span>
              {entry.messages.map((message, messageIndex) => <p key={messageIndex}>{message}</p>)}
            </li>)}
          </ol>
        </div>
      </> : <>
        <div className="combat-vitals">
          <StatMeter label="Health" value={combat.player.hp} max={combat.player.maxHp} type="health" />
          <StatMeter label="Stamina" value={combat.player.stamina} max={combat.player.maxStamina} type="stamina" />
        </div>
        <dl className="combat-stat-details">
          <div><dt>Attack Power</dt><dd>{combat.player.attackPower}</dd></div>
          <div><dt>Defense</dt><dd>{combat.player.defense}</dd></div>
          <div><dt>Guard Power</dt><dd>{combat.player.guardPower}</dd></div>
          <div><dt>Hit chance</dt><dd>{getHitChance(combat.player, combat.enemy)}%</dd></div>
          <div><dt>Evasion</dt><dd>{combat.player.evasion}%</dd></div>
          <div><dt>Critical chance</dt><dd>{combat.player.criticalChance}%</dd></div>
        </dl>
      </>}
    </CombatOverlay>}
  </div>;
}
