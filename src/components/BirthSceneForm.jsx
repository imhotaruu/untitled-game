import { useState } from "react";
import { characterGenders } from "../engine/prologueSystem";

export default function BirthSceneForm({ draft, onChange, onComplete, replay }) {
  const [error, setError] = useState("");
  return <form className="birth-scene-form" onSubmit={(event) => {
    event.preventDefault();
    if (!draft.name.trim()) { setError("Enter a name for your character."); return; }
    setError("");
    onComplete(draft);
  }}>
    <p>What will they call you?</p>
    <label htmlFor="birth-name">Name</label>
    <input id="birth-name" autoFocus autoComplete="off" maxLength={32} required value={draft.name}
      aria-describedby={error ? "birth-error" : undefined}
      onChange={(event) => onChange({ ...draft, name: event.target.value })} />
    <label htmlFor="birth-gender">Gender</label>
    <select id="birth-gender" value={draft.gender} onChange={(event) => onChange({ ...draft, gender: event.target.value })}>
      {characterGenders.map((gender) => <option key={gender}>{gender}</option>)}
    </select>
    {error && <p id="birth-error" role="alert">{error}</p>}
    {replay && <p className="prologue-detail">This is a replay. These choices will not change your character.</p>}
    <button className="primary" type="submit">Begin Your Life</button>
  </form>;
}
