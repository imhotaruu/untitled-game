import StatMeter from "./ui/StatMeter";
import useHitReaction from "./useHitReaction";

export default function BattlePartyStrip({ members, activeMemberId, finished, onDetails, busy = false, frame = null, reducedMotion = false }) {
  return <section className="battle-party" aria-label="Party status">
    <h2>Your party</h2>
    <div className="battle-party-strip">
      {members.map((member) => <PartyPortrait key={member.id} member={member}
        active={member.id === activeMemberId} finished={finished} onDetails={onDetails} busy={busy} reducedMotion={reducedMotion}
        cue={member.id === "player" && frame?.actor === "player" ? frame : null} />)}
    </div>
  </section>;
}

function PartyPortrait({ member, active, finished, onDetails, busy, cue, reducedMotion }) {
  const portraitRef = useHitReaction(member.hp, cue, reducedMotion);
  return <article className="battle-party-card" data-active={active}>
        <span className="party-turn-label">{finished ? "Spar ended" : active ? busy ? "Acting" : "Your turn" : "Ready"}</span>
        <button type="button" className="party-portrait" ref={portraitRef} disabled={busy} onClick={() => onDetails(member.id)}
          aria-label={`View ${member.name}'s battle details`} aria-haspopup="dialog">
          <span className="portrait-silhouette" aria-hidden="true"><span /></span>
          <span className="portrait-details-label">Details</span>
        </button>
        <h3>{member.name}</h3>
        <StatMeter label="HP" value={member.hp} max={member.maxHp} type="health" />
        <StatMeter label="ST" value={member.stamina} max={member.maxStamina} type="stamina" />
      </article>;
}
