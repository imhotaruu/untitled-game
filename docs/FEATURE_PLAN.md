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

## Current: Feature 33 — Crafting introduction and quest tracking

The user authorized implementation on 2026-11-07. Introduce crafting through a small quest from Rowan, with separate Crafting and Quests tabs using Back to Main navigation.

Scope:

- One introductory crafting quest.
- One starter recipe using existing materials.
- A Quests tab showing the active objective and completed quest.
- Safe material spending, once-only quest rewards, and save/load support.

Implementation: after the existing wood-delivery favor, Rowan offers **A Shape of Your Own** and supplies 1 Cloth. Craft a Handmade Training Sword at Village Square using 4 Wood and 1 Cloth, then show it to Rowan for 5 Gold. Keep and equip the sword (+2 Attack Power, +1 Guard Power). This recipe is a once-only equipment craft. Quests tracks Available, Active/ready, and Completed states. Save version 13 preserves the lesson and recipe progress.

Status: implemented, automated checks passed, and accepted by the user on 2026-11-07 with commit/push authorized. See `docs/qa/feature-000033-crafting-introduction.md`.

User-requested scope addition on 2026-11-07: keep the lesson, recipe, and quest reward one-time. Add a default-on Settings preference to confirm gold-outlined story actions before performing them. Cancel leaves the action unperformed; regular actions and crafting do not prompt, and battle retains its own confirmation.

Remove the placeholder Continue Story action at the user's request. Story progression continues through the named interactions and gameplay events; none depend on that placeholder.

## Next: Feature 34 — Prologue integration

Connect the prologue coherently to the current opening story and transition into the first chapter. Review the existing prologue files and current story progression before implementation, then address the continuity and transition changes needed for that connection. Preserve existing saves and progress.

The user proposes Chapter 1 Act 1 for the opening, with later progression advancing acts and chapters; a chapters-only structure is also under consideration. Naming is not finalized. Further crafting and quest expansion stays outside this feature.

## Later ideas

- More recipes, crafting depth, and additional village characters.
- Further encounters and combat encounters.
- Further story writing and expansion of the interactive prologue.
- Expanded party, relationship progression, and Codex pages.

These are backlog ideas, not promises for Feature 33 or a fixed order of work.
