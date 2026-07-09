# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Republic Builder Engine — a reusable historical RPG engine. The first campaign is **Chronicle**, an AP U.S. History experience. The current playable vertical slice is Unit 1 / Case 1.01 ("The Atlantic Crossroads"): a browser-based, top-down field/dialogue game about the Columbian Exchange. Latest delivered build per the decision log is Milestone 3.4.15 ("Side Sprite and Audio SFX Polish").

### Product intent

The goal is a Pokémon-inspired APUSH RPG students use across a full school year — approachable controls, a stylized explorable world, NPC dialogue bubbles, independent NPC movement, location-specific music, and badge/collection progression — not a quiz site or worksheet reskin. Gameplay is meant to train authentic AP U.S. History skills (HIPP source analysis, SAQ/LEQ/DBQ argument construction, evidence-based reasoning) using real primary sources and the actual College Board rubrics where applicable, rather than relying on trivia recall. Game progression must never grant unfair advantages on graded assessments — cosmetic rewards, organizers, and alternate routes are fine; pay-to-win or build-to-win mechanics on assessments are not.

Narrative frame: the player is recruited at the Chronicle Institute (present day) because the historical record has become damaged/unstable, becomes a "Chronicler," and uses "Chronotravel" to visit historical settings, gather evidence from people and primary sources, and transmit/preserve records back at the Institute Archive to earn area badges. Historical dialogue may take reasonable dramatic liberties but should stay in the speaking character's voice — avoid fourth-wall commentary, repeated "this is dramatized" disclaimers inside conversations, or modern educational narration coming out of a historical figure's mouth.

## Commands

Run from the repo root (npm scripts shell out to Vite, which is rooted at `apps/web` via `vite.config.js`):

- `npm run dev` — start the Vite dev server (opens the browser automatically)
- `npm run build` — production build (output in `apps/web/dist/`)
- `npm run preview` — preview a production build
- `npm run validate:content` — placeholder only; not yet implemented (just logs a message)

There is no test runner, linter, or type checker configured (`tests/` exists but is empty aside from `.gitkeep`). Do not assume `npm test` or lint scripts exist.

## Architecture

### The app is currently one file

Despite the modular folder structure (`apps/web/src/engine/`, `apps/web/src/features/`), the entire running game is implemented in **`apps/web/src/main.js`** (~1,350 lines). It owns: screen routing/state machine, field and hub movement/collision/NPC patrol logic, dialogue, procedural Web Audio (music + SFX), the map-jigsaw puzzle, the exchange ledger, the Author Mode panel, and all HTML rendering (via template-literal strings, not a framework — there is no React/Vue/etc.).

The files under `apps/web/src/features/*` (`chronicle-institute.js`, `chronicle-identity.js`, `atlantic-crossroads-preview.js`) and `apps/web/src/engine/content/author-content-store.js` / `apps/web/src/engine/player/player-profile-store.js` are **not imported by `main.js`** — they are earlier/parallel modularization attempts that are currently dead code. Before assuming feature logic lives in one of these files, check whether `main.js` actually imports it. When extending gameplay, the pragmatic move is usually to edit `main.js` directly rather than wire in an orphaned module, unless the user is deliberately doing the modularization work.

`main.js` only imports:

- `./styles/global.css`
- named exports from `./content/unit-01-campaign.js` (`BRAND`, `UNIT_01`, `CASE_001_SOURCES`, `EXCHANGE_RECORDS`, `EMPIRE_EVIDENCE`, `EMPIRE_CONNECTIONS`, `REVIEW`)
- `readProgress` / `saveProgress` / `resetProgress` from `./engine/chronicle-progress-store.js`

### State and persistence

`apps/web/src/engine/chronicle-progress-store.js` defines `DEFAULT_PROGRESS` (current screen, unlocked/completed cases, per-case evidence, dialogue responses, exchange ledger, empire connections, review answers, etc.) and reads/writes it to `localStorage` under the key `republic-builder.chronicle.unit-01.v2`. This is the single source of runtime save state — there is no backend. `progress.currentScreen` plus `VALID_SCREENS` in `main.js` drive the screen-routing state machine (`institute`, `field`, `archive`, `map-jigsaw`, `source`, `ledger`, `review`, `completion`, etc.).

### Engine vs. content boundary

The repo's stated architecture rule (from `README.md` and the decision log): **engine code never contains APUSH-specific facts.** In practice today, `main.js` still mixes engine mechanics (movement, collision, screen transitions) with Chronicle/Unit-1-specific data (NPC dialogue text, field coordinates, quest names) inline — the clean separation described in the docs is aspirational for the current vertical slice, not yet fully realized. Canonical folder intent, per `README.md`:

| Thing                                              | Home                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Reusable engine systems                            | `apps/web/src/engine/`                                                               |
| Feature-level UI                                   | `apps/web/src/features/`                                                             |
| Campaign/unit content (JS, imported at build time) | `apps/web/src/content/`                                                              |
| Campaign/unit content (JSON records)               | `content/campaigns/`                                                                 |
| Primary sources, NPC records, location records     | `content/library/`                                                                   |
| Images, maps, audio, icons                         | `assets/` (repo-root) vs. `apps/web/src/assets/` (currently used by the running app) |
| JSON schemas                                       | `data/schemas/`                                                                      |
| Docs                                               | `docs/`                                                                              |
| Build/import/validation scripts                    | `scripts/`                                                                           |

Note there are two parallel asset trees: `assets/` at the repo root (mostly `.gitkeep` placeholders, intended as the long-term canonical home) and `apps/web/src/assets/` (where the actual sprites/maps/documents used by `main.js` currently live, referenced via `new URL(..., import.meta.url)`).

There is also a parallel, currently-unused JSON content pipeline under `content/campaigns/chronicle/units/unit-01/` (`campaign.json`, `unit.json`, `case.json`, `activities/*.json`, `assessments/*.json`) plus record templates in `content/library/`. `main.js` does not read from these — it reads from the hand-authored JS in `apps/web/src/content/`. Treat the JSON tree as the intended future data-driven format, not the current runtime source of truth.

### Author Mode

A development-only in-app panel (toggled via the chrome button, rendered by `authorPanel()` in `main.js`) lets non-engineers edit front-facing copy (titles, questions, names) without touching layout, scoring, or progression logic. Edits currently persist to `localStorage` only, scoped to a small set of fields — see `docs/decision-log/0003-author-mode-and-content-overrides.md`.

### Documentation conventions

- `docs/decision-log/000N-*.md` — numbered ADRs recording _why_ a design choice was made (read the highest-numbered ones for the most current architectural context; earlier ones may describe superseded milestones).
- `docs/architecture/*.md` and `docs/content-guide/*.md` — several of these (e.g. `repository-map.md`, `naming-and-placement.md`, decision `0001`) are currently placeholder stubs ("Recovered placeholder file restored...") rather than live documentation — don't treat their presence as meaning the content exists; check the file body before citing it.
- `docs/milestone-*.md` at the top level of `docs/` duplicate/mirror some `decision-log` entries by milestone number.

## Terminology

Use these consistently in code, copy, and UI strings — they're the game's fixed internal vocabulary:

- **Chronicle Institute** — the organization; **Institute Archive** — the visible hub room/screen name (`chrome()`'s "Institute" branding + `HUB_TARGETS`/`institute` screen in `main.js`).
- **Chronotravel** — traveling to a historical setting (the `travel` screen / "Initiate Chronotravel").
- **Preservation Case** — the badge-case UI opened from the Archive trophy shelf (`unitOneBadgeCaseMarkup()` in `main.js`), styled like a Pokémon badge case, not a debug panel.
- **Navigation Table** — the physical Archive object the player walks to and interacts with to pick a case/route (`archive` screen, `HUB_TARGETS.table`).
- **Recall to Archive** — the field control that returns the player to the Institute.
- Unit 1 badge areas: **Caribbean**, **Atlantic**, **Hispaniola** (`unitOneBadgeRecords()` — Atlantic and Hispaniola are defined as locked/future badges; only Caribbean/`case-001` is currently playable).
- Institute NPCs: Director Rowan Hale, Dr. Amani Soto ("archive researcher"), Professor Julian Park ("route historian") — referenced in code as `director`, `amani`, `julian`.

## Gameplay invariants (regression-prone areas)

These patterns recurred as bugs across many hotfix milestones (3.4.5 through 3.4.15 in the decision log) — be deliberate when touching this code, and visually re-test rather than trusting a syntax check.

- **Camera must stay a pure function of player position.** `updateFieldPlayer()` / the hub equivalent recompute `fieldCamera`/hub transform every tick from `fieldMovement.x/y` (clamped to viewport bounds, integer-rounded to avoid blurry text). Don't introduce `scrollIntoView()`, `.focus()`-triggered scrolling, or click-handlers that move the camera toward a clicked DOM element — several past regressions came from exactly that.
- **Proximity-gated interaction.** NPCs/objects only become interactable within a reach radius (see `targetDistance`/`targetReach`/`nearestHubTarget` for the hub, and the analogous field logic) — both `E` keypress and click should require the player already be in range, not act as a teleport-and-interact.
- **One interaction prompt at a time**, cleared when dialogue closes, the player moves out of range, the screen changes, or progress resets — watch for stale "Press E" prompts or duplicate prompts after refactors.
- **Dialogue renders anchored to the speaking NPC**, in a layer that doesn't force the world transform to reset or the document to scroll.
- **NPC movement respects the same collision as the player** (`FIELD_BLOCKS`/`HUB_BLOCK_RECTS`, land checks via `isCaribbeanLand`), uses per-NPC patrol timing/offsets so NPCs don't march in lockstep, and swaps sprite sets by facing direction (`down`/`up`/`side`, with `-step` walking frames) rather than sliding a front-facing sprite sideways.

## Visual design language

- Palette (see CSS custom properties in `apps/web/src/styles/global.css`): deep navy (`--navy`), gold (`--gold`, `--gold-soft`), warm parchment/ink (`--paper`, `--ink`), muted teal accents. Keep new UI within this blue/gold/bronze/parchment historical-adventure look, not a generic admin-panel style.
- A custom bronze/gold ornate arrow cursor is already implemented as an inline SVG data URI in `global.css` — reuse/extend it rather than reverting to the system cursor for in-game surfaces.
- Don't cluster interactive elements together while leaving large map areas empty — placement should be diegetic (e.g. cartographer table near the ship, canoe worker near shore) and UI chrome (status panels, prompts) should sit outside the playable floor rather than overlapping NPCs, furniture, or pathways.

## Persistence

Current implementation is a single flat `localStorage` blob (`chronicle-progress-store.js`, key `republic-builder.chronicle.unit-01.v2`) with no backend — this is intentional for the prototype stage to avoid ongoing hosting/database costs. Design intent for later: keep save/load behind a small service/adapter (not scattered `localStorage` calls) with a versioned save schema, so a hosted backend (Firebase/Supabase/etc.) can be swapped in later without a full rewrite. When adding new persisted fields, extend `DEFAULT_PROGRESS` and the corresponding merge logic in `readProgress()` rather than reading `localStorage` directly elsewhere.

## Development workflow expectations

- Prefer small, focused changes over broad refactors; don't fix unrelated things in the same pass.
- Avoid modifying `vite.config.js` unless the task genuinely requires it.
- Compilation/syntax passing is not sufficient to call something fixed — this is a visual/interactive game. Run `npm run dev`, reproduce the reported behavior in the browser, and verify the specific interaction (movement, collision, dialogue, camera) before considering a change done, per this repo's `/verify` skill expectations.
- Don't commit until the requested behavior has actually been tested.
