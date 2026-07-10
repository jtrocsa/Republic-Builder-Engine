---
name: chronicle-institute-conventions
description: Use whenever working on the Republic Builder Engine / Chronicle Institute RPG in this repository — the avatar/Chronicler identity, progression (badges, Preservation Cases), the case framework, dialogue/narrative content, the Institute Archive onboarding loop, Author Mode, or art assets under apps/web/src/assets. Consult this even if the user just says "the game," "the RPG," "Chronicle," or references a milestone number — these all refer to this project.
---

# Chronicle Institute Conventions

Project-specific conventions for Republic Builder Engine / the Chronicle campaign, so this doesn't need to be re-derived from scratch every session. Everything below is grounded in the current repo state (`CLAUDE.md`, `README.md`, `docs/decision-log/`, and the actual file tree) as of this writing — re-check anything marked `[CONFIRM]` before relying on it, since this is a fast-moving prototype.

## Project overview

- **What it is:** Republic Builder Engine — a reusable historical RPG engine. The first campaign is **Chronicle**, an AP U.S. History experience.
- **Current playable vertical slice:** Unit 1 / Case 1.01, "The Atlantic Crossroads."
- **Stack:** Vite + vanilla JS/HTML/CSS. No framework (no React/Vue). No backend — `localStorage` only.
- **No test runner, linter, or type checker is configured.** Don't assume `npm test` or lint scripts exist.
- **Latest delivered build:** Milestone 3.4.15, "Side Sprite and Audio SFX Polish" (decision log entry `0027-side-sprite-audio-sfx.md`). `[CONFIRM]` the highest-numbered file in `docs/decision-log/` before citing a milestone number — this moves fast.

## The one-file reality

- `apps/web/src/main.js` (~1,350 lines) is where almost everything actually runs: screen routing/state machine, field and hub movement/collision/NPC patrol logic, dialogue, procedural Web Audio (music + SFX), the map-jigsaw puzzle, the exchange ledger, the Author Mode panel, and all HTML rendering via template-literal strings.
- `apps/web/src/features/` and its supporting dead stores (`chronicle-institute.js`, `chronicle-identity.js`, `atlantic-crossroads-preview.js`, `author-content-store.js`, `player-profile-store.js`) were an earlier/parallel modularization attempt that was never imported by `main.js` — confirmed dead via import-graph trace and deleted in the dead-code-removal pass (`docs/migrations/DEAD-CODE-REMOVAL.md`). Don't recreate this island; if new feature logic is needed, edit `main.js` directly unless the user is deliberately doing modularization work.
- The one exception: `apps/web/src/engine/chronicle-progress-store.js` (`readProgress`/`saveProgress`/`resetProgress`) is real and is the single source of runtime save state, under the `localStorage` key `republic-builder.chronicle.unit-01.v2`.
- Default move when extending gameplay: edit `main.js` directly rather than wire in an orphaned module — unless the user is deliberately doing the modularization work.

## Core systems, in this codebase's actual terms

- **Avatar / identity** — the player is a "Chronicler." Identity today is just `profile.name` / `profile.appearance` (`'a'` or `'b'`, selecting sprite sets) inside `DEFAULT_PROGRESS` in `chronicle-progress-store.js`. `chronicle-identity.defaults.js` (still live, imported by `main.js`) sketches a richer identity system in copy only; the code implementation that once lived in `features/chronicle-identity/chronicle-identity.js` was dead and has been deleted (`docs/migrations/DEAD-CODE-REMOVAL.md`).
- **Progression** — badge/case unlocks tracked in the progress store: `unlocked`, `completedCases`, `caseEvidence`, `exchangeLedger`, `empireConnections`, `empireOrder`. Rendered via the **Preservation Case** UI (`unitOneBadgeCaseMarkup()` in `main.js`), styled like a Pokémon badge case. Badge areas: **Caribbean** (playable, `case-001`), **Atlantic**, **Hispaniola** (defined but locked/future).
- **Case framework** — a "Case" is one historical scenario (e.g. `case-001`, "The Atlantic Crossroads"). Canonical shape lives in `apps/web/src/content/unit-01-campaign.js`, which exports `BRAND`, `UNIT_01`, `CASE_001_SOURCES`, `EXCHANGE_RECORDS`, `EMPIRE_EVIDENCE`, `EMPIRE_CONNECTIONS`, `REVIEW`. Sources are meant for HIPP-style primary-source analysis; `REVIEW` carries SAQ/LEQ-style prompts tied to actual College Board rubrics. (A dormant parallel JSON pipeline under `content/campaigns/chronicle/units/unit-01/` used to exist as a fourth incompatible schema for this same content — it was never read by `main.js` and was deleted in the dead-code-removal pass, `docs/migrations/DEAD-CODE-REMOVAL.md`.)
- **Narrative framework** — dialogue text is authored inline in `main.js`, rendered anchored to the speaking NPC. Historical figures may take dramatic liberties but must stay in-voice: no fourth-wall commentary, no "this is dramatized" disclaimers mid-conversation, no modern educational narration coming out of a historical figure's mouth.
- **Onboarding** — the **Institute Archive** hub (`institute` screen) is the first-time loop: Director Rowan Hale, Dr. Amani Soto ("archive researcher"), and Professor Julian Park ("route historian") brief the player before **Chronotravel**.
- **Author Mode** — real and implemented (`authorPanel()` in `main.js`, per decision log `0003`). Dev-only panel that edits **content only**: titles, questions, names, dates, prompts, source metadata, alt text. It does **not** expose layout/CSS, navigation rules, scoring, progression rules, or data architecture. Saves drafts to `localStorage`, can export/import JSON, and reset to repo defaults. A future auth/role system is meant to gate its availability in published builds — not built yet.

## Fixed terminology — use these exact terms

- **Chronicle Institute** (the organization) vs. **Institute Archive** (the visible hub screen/room).
- **Chronotravel** — traveling to a historical setting.
- **Preservation Case** — the badge-case UI, styled like a Pokémon badge case, not a debug panel.
- **Navigation Table** — the physical Archive object/interaction point (`HUB_TARGETS.table`) used to pick a case/route.
- **Recall to Archive** — the field control that returns the player to the Institute.
- Badge areas: **Caribbean**, **Atlantic**, **Hispaniola**.
- Institute NPCs: Director Rowan Hale (`director`), Dr. Amani Soto (`amani`), Professor Julian Park (`julian`).

## Art asset standards (as actually used today)

- Character, NPC, hub, and map sprites are **PNG** — see `apps/web/src/assets/chronicle-sprites/`, `.../institute/`, `.../maps/`. No WebP or SVG sprite files exist in the current build.
- Primary-source scans are **JPG** (e.g. `source-waldseemuller-1507.jpg`).
- UI chrome (e.g. the custom bronze/gold cursor) is **inline SVG embedded as a data URI directly in `global.css`**, not standalone `.svg` asset files — reuse/extend that pattern for new UI chrome rather than introducing separate SVG assets or reverting to system UI.
- Sprite naming convention to follow for new characters: `<character>-<facing>[-step].png`, facing ∈ `{down, up, side}`, with a `-step` variant for walking frames alongside the idle frame. Don't add a front-facing-only sprite that slides sideways — see the "Gameplay invariants" note on NPC sprite sets below.
- Two parallel asset trees exist: `assets/` at the repo root (long-term canonical home per `README.md`, currently mostly placeholders) vs. `apps/web/src/assets/` (where sprites/maps/documents actually live and are referenced via `new URL(..., import.meta.url)` in `main.js`). Put new sprites in `apps/web/src/assets/` to match what's actually wired up, unless the task is explicitly the migration to `assets/`.

## Repository structure (actual, current)

Confirmed-dead code (the `features/` island, `chronicle-case-001.js`, `player-profile-store.js`, `author-content-store.js`, the dormant `content/campaigns/`+`content/library/` JSON pipeline, and the placeholder root `assets/` tree) was removed in a dead-code-removal pass — see `docs/migrations/DEAD-CODE-REMOVAL.md`. Don't expect to find those paths; don't recreate them speculatively.

```
apps/web/src/
  main.js                       # the real app — screens, movement, dialogue, audio, Author Mode
  content/
    unit-01-campaign.js          # imported by main.js — canonical Case 1.01 content
    unit-02-campaign.js          # imported by main.js — placeholder Unit 2 content
    chronicle-identity.defaults.js
    chronicle-opening.defaults.js
    schemas/                     # Zod schemas validating the above, in place
  engine/
    chronicle-progress-store.js  # the real persistence layer
  repositories/
    local-progress-repository.js # thin wrapper main.js imports around chronicle-progress-store.js
    local-content-repository.js  # thin wrapper scripts/validate-content.js imports
  assets/
    chronicle-sprites/   (PNG — Chroniclers, field NPCs, props)
    institute/           (PNG — hub NPCs)
    maps/                (PNG)
    documents/           (JPG — primary source scans)
  styles/global.css       # palette, cursor SVG data URI

docs/decision-log/000N-*.md                   # numbered ADRs — read the highest-numbered for current context
```

## Visual design language

- Palette via CSS custom properties in `global.css`: deep navy (`--navy`), gold (`--gold`/`--gold-soft`), warm parchment/ink (`--paper`/`--ink`), muted teal accents. New UI should stay in this blue/gold/bronze/parchment historical-adventure look, not a generic admin-panel style.
- Placement should be diegetic (cartographer table near the ship, canoe worker near shore, etc.) — don't cluster interactive elements together while leaving map areas empty, and keep status panels/prompts outside the playable floor rather than overlapping NPCs or pathways.

## Gameplay invariants — regression-prone, be deliberate here

These recurred as bugs across many hotfix milestones (3.4.5–3.4.15 in the decision log):

- **Camera must stay a pure function of player position.** Recomputed every tick from `fieldMovement.x/y`, clamped to viewport bounds, integer-rounded. Never introduce `scrollIntoView()`, `.focus()`-triggered scrolling, or click-handlers that move the camera toward a clicked element.
- **Proximity-gated interaction.** NPCs/objects only interactable within a reach radius (`targetDistance`/`targetReach`/`nearestHubTarget` and the field equivalent) — both `E` keypress and click require the player already be in range.
- **One interaction prompt at a time**, cleared on dialogue close, moving out of range, screen change, or progress reset.
- **Dialogue renders anchored to the speaking NPC**, without resetting the world transform or scrolling the document.
- **NPC movement respects the same collision as the player** (`FIELD_BLOCKS`/`HUB_BLOCK_RECTS`, `isCaribbeanLand`), uses per-NPC patrol timing so NPCs don't march in lockstep, and swaps sprite sets by facing direction rather than sliding a front-facing sprite sideways.

## Working conventions

- Small, focused changes — don't fix unrelated things in the same pass, and don't touch `vite.config.js` unless the task genuinely requires it.
- The engine/content boundary ("engine code never contains APUSH-specific facts") is the stated goal, not current reality — `main.js` mixes both today. Don't invent a strict separation that doesn't exist, but don't make the mixing worse without being asked to do the modularization work.
- Compiling/syntax-passing is not "done." Run `npm run dev`, reproduce the actual interaction in the browser (movement, collision, dialogue, camera), and don't commit until that's verified — see the `/verify` skill.
- When adding new persisted fields, extend `DEFAULT_PROGRESS` and the merge logic in `readProgress()` in `chronicle-progress-store.js` rather than reading `localStorage` directly elsewhere.
- If a change to one system (e.g. progression) would require a corresponding change in another (e.g. new badge art, new Case content shape), flag it explicitly rather than silently making both changes.

## Open questions / not established in this repo

- Whether an "APUSH with Mr. Ramsey" course website exists as a separate connected project — not present in this repository. Don't assume integration points with an external site exist without checking.
- The auth/role system meant to gate Author Mode in published deployments (mentioned as future work in decision log `0003`) is not built yet.
