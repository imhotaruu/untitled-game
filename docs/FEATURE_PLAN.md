# Feature focus

Updated 2026-11-07. Keep upcoming work focused as requested by the user.

## Working agreement

- Define one clear outcome and a short scope before implementing each feature.
- Keep implementation and QA tied to that scope. Include fixes needed to complete it.
- Record unrelated ideas in the backlog instead of silently adding them to the active feature.
- If the user requests a scope change, make its effect on the current feature clear.
- Finish manual review and the authorized commit/push before starting the next feature.

## Completed

- Feature 31: village relationship chart, family connections, Rowan introduction, and secondary-page navigation.
- Feature 32: exploration encounters, common/rare choices, rewards, persistence, and location-list refinements. Committed and pushed as `f27b6ad`.

## Completed: Feature 33 — Crafting introduction and quest tracking

The user authorized implementation on 2026-11-07. Introduce crafting through a small quest from Rowan, with separate Crafting and Quests tabs using Back to Main navigation.

Scope:

- One introductory crafting quest.
- One starter recipe using existing materials.
- A Quests tab showing the active objective and completed quest.
- Safe material spending, once-only quest rewards, and save/load support.

Implementation: after the existing wood-delivery favor, Rowan offers **A Shape of Your Own** and supplies 1 Cloth. Craft a Handmade Training Sword at Village Square using 4 Wood and 1 Cloth, then show it to Rowan for 5 Gold. Keep and equip the sword (+2 Attack Power, +1 Guard Power). This recipe is a once-only equipment craft. Quests tracks Available, Active/ready, and Completed states. Save version 13 preserves the lesson and recipe progress.

Status: accepted by the user and committed/pushed as `a56dbb3`. See `docs/qa/feature-000033-crafting-introduction.md`.

User-requested scope addition on 2026-11-07: keep the lesson, recipe, and quest reward one-time. Add a default-on Settings preference to confirm gold-outlined story actions before performing them. Cancel leaves the action unperformed; regular actions and crafting do not prompt, and battle retains its own confirmation.

Remove the placeholder Continue Story action at the user's request. Story progression continues through the named interactions and gameplay events; none depend on that placeholder.

## Completed: Feature 34 — Prologue integration

Connect the prologue coherently to the current opening story and transition into the first chapter. Review the existing prologue files and current story progression before implementation, then address the continuity and transition changes needed for that connection. Preserve existing saves and progress.

The user proposes Chapter 1 Act 1 for the opening, with later progression advancing acts and chapters; a chapters-only structure is also under consideration. Naming is not finalized. Further crafting and quest expansion stays outside this feature.

The user supplied Prologue V2, **When the Stars Faltered**, and approved replacing its complementary-Order/Chaos paragraph: possibility and change belong to creation; Chaos threatens to unravel it. The six-scene script now establishes Astraea as Goddess of Stars, her blade Starwake, and Morveth, Aurelion, and Elaris. Player-facing source: `docs/story/prologue-v2.md`. Author-only future revelations are excluded from game content.

The temporary Astraea battle is a controlled tutorial: basic strike, Astral Ward, Guiding Star, guided strike, Starlight Mend, and Celestial Severance. Spells spend tutorial mana and apply mitigation, guided-strike, healing, and finishing effects. Shared combat playback handles short exchanges; full scene dialogue waits for manual advancement. This replaces the V1 Call for Aid encounter, not the normal Garron spar. Skip routes to birth/character creation. A name and gender form leads into the existing growing-up bridge and Chapter 1 at home. No divine stats or items carry into the adventure. No generated art, external audio, dependencies, or later magic progression added.

Save version 15 stores the V2 scene, tutorial phase, reading state, mana, and character-creation draft. V1 scene IDs migrate to corresponding V2 scenes; incompatible V1 battles restart at the tutorial introduction. Existing adventure saves stay in the adventure. Story replay stays isolated from the real character, including birth choices. Chapter 1 / Act 1 is working metadata; no later chapter gates are invented. Manual QA: `docs/qa/feature-000034-prologue-integration.md`. The user accepted this feature and authorized commit/push on 2026-11-07.

User-requested presentation update: one line at a time with typewriter reveal and a bouncing continuation arrow. Click the story area/arrow or use Enter/Space to reveal, then advance. Both the prologue and tutorial dialogue use it. Settings has independent Slow/Normal/Fast/Instant text speed; reduced motion keeps the arrow stationary. Rapid clicks are accepted without a cooldown. Modal dialogs pause the reader. Sounds will be supplied later. Saves resume the current passage from its first line, not its transient animation position.

Opening presentation now follows the user's reference: pulsing **Click to Begin** → separate **Prologue: When the Stars Faltered** title card → story → combat tutorial → story → character creation → Chapter 1. Story prose explicitly overrides the global uppercase button style. Visible scene headings/numbers, helper instructions, and Next Line labels are removed; speaker labels and the arrow remain. Order/Chaos receive the reference's gold/crimson emphasis. Settings/Save/Load are tucked under Options. The growing-up bridge is now the opening of Chapter 1 immediately after creation; older `years` cursors migrate to that chapter card. Reduced motion disables the opening pulse and title/arrow animations.

Battle conversations now use a bottom-screen angular dialogue panel over the existing battlefield, following the user's RPG reference. Named speakers receive CSS silhouette/initial portrait placeholders and a nameplate; narration/tutorial text omits the portrait. The shared typewriter, keyboard, and arrow behavior stays intact. The battlefield remains visible but its controls are inert/hidden from assistive technology until conversation ends; focus returns to combat afterward. No generated artwork or new assets added.

The user's second dialogue reference refines the placeholder to a larger unframed bust at left, a wide low dark panel with thin pale slanted edges, and a slim pale speaker tab above it. Smaller screens use a scaled portrait beside the text. This is a CSS presentation change; dialogue behavior and gameplay remain the same.

Feature 34 presentation refinements: Chapter 1 · Act 1 / A Place to Begin appears on a standalone title card before chapter narration. Tutorial objectives and spell definitions appear in a separate helper window. The shared Log is available throughout the game, records revealed narrative/speaker lines plus adventure story entries, and stays separate from battle damage messages. It preserves session history across passages; loading resets that history and imports saved adventure story entries.

## Later ideas

- More recipes, crafting depth, and additional village characters.
- Further encounters and combat encounters.
- Further story writing and expansion of the interactive prologue.
- Expanded party, relationship progression, and Codex pages.

These are backlog ideas, not promises for Feature 33 or a fixed order of work.
