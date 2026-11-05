import { useEffect, useRef, useState } from "react";
import { resolveCombatTurn } from "../engine/combatSystem";

const durations = { use: 700, hit: 900, miss: 800, block: 800, restore: 750, turn: 650, wait: 850, result: 900 };

export default function useCombatPlayback(combat, onMove) {
  const [playback, setPlayback] = useState(null);
  const pendingRef = useRef(null);
  const busy = Boolean(playback && playback.source === combat);
  const frame = busy ? playback.frames[playback.index] : null;

  useEffect(() => {
    if (!playback || playback.source !== combat) {
      pendingRef.current = null;
      return;
    }
    const timer = setTimeout(() => {
      if (pendingRef.current !== playback.token) return;
      if (playback.index + 1 < playback.frames.length) {
        setPlayback({ ...playback, index: playback.index + 1 });
      } else {
        pendingRef.current = null;
        setPlayback(null);
        onMove(playback.moveId);
      }
    }, durations[frame.kind] || 800);
    return () => clearTimeout(timer);
  }, [playback, combat, frame, onMove]);

  function chooseMove(moveId) {
    if (pendingRef.current) return;
    const result = resolveCombatTurn(combat, moveId);
    if (result.combat === combat) return;
    if (moveId === "retreat") {
      onMove(moveId);
      return;
    }
    const token = {};
    pendingRef.current = token;
    setPlayback({ source: combat, moveId, frames: result.frames, index: 0, token });
  }

  return {
    busy,
    frame: frame ? { ...frame, id: `${combat.round}-${playback.index}` } : null,
    combat: frame ? { ...combat, player: frame.player, enemy: frame.enemy } : combat,
    chooseMove,
  };
}
