# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The current game is **Chronicle**, an AP U.S. History RPG. The current playable vertical slice is Unit 1 / Case 1.01 ("The Atlantic Crossroads"): a browser-based, top-down field/dialogue game about the Columbian Exchange. Latest delivered build per the decision log is Milestone 3.4.15 ("Side Sprite and Audio SFX Polish").

**"Republic Builder Engine" is retired as the project's identity.** The repository was originally framed as a reusable engine of that name; that framing is no longer current. The eventual multi-subject platform this codebase may grow into **does not yet have a final name** — don't invent one or reintroduce "Republic Builder" branding in new code, docs, or copy. (The string still appears in a few live/dead source locations — e.g. `package.json`'s package name, `BRAND.engine` in content, the browser tab title — as a known, not-yet-actioned cleanup item; leave those alone unless a task specifically asks you to touch product branding.)

**Removed systems — do not restore:** Founder Paths, professions, Historian Skills, and clothing/wardrobe-slot systems have been removed from the design and must not be reintroduced. The player identity model is intentionally minimal (display name + one of two appearance choices only — see `docs/decision-log/0005-chronicle-identity-and-first-field-entry.md`); pronouns, wardrobes, professions, cosmetics, and inventory remain deliberately out of scope, not merely deferred to a later milestone.

### Product intent

The goal is a Pokémon-inspired APUSH RPG students use across a full school year — approachable controls, a stylized explorable world, NPC dialogue bubbles, independent NPC movement, location-specific music, and badge/collection progression — not a quiz site or worksheet reskin. Gameplay is meant to train authentic AP U.S. History skills (HIPP source analysis, SAQ/LEQ/DBQ argument construction, evidence-based reasoning) using real primary sources and the actual College Board rubrics where applicable, rather than relying on trivia recall. Game progression must never grant unfair advantages on graded assessments — cosmetic rewards, organizers, and alternate routes are fine; pay-to-win or build-to-win mechanics on assessments are not.

Narrative frame: the player is recruited at the Chronicle Institute (present day) because the historical record has become damaged/unstable, becomes a "Chronicler," and uses "Chronotravel" to visit historical settings, gather evidence from people and primary sources, and transmit/preserve records back at the Institute Archive to earn area badges. Historical dialogue may take reasonable dramatic liberties but should stay in the speaking character's voice — avoid fourth-wall commentary, repeated "this is dramatized" disclaimers inside conversations, or modern educational narration coming out of a historical figure's mouth.

## Commands

Run from the repo root (npm scripts shell out to Vite, which is rooted at `apps/web` via `vite.config.js`):

- `npm run dev` — start the Vite dev server (opens the browser automatically)
- `npm run build` — production build (output in `apps/web/dist/`)
- `npm run preview` — preview a production build
- `npm run validate:content` — real, working Zod-based validator (25 content schema/cross-reference groups as of Unit 2's 5-commit content completion pass). Validates `unit-01-campaign.js` and `unit-02-campaign.js` against schemas in `apps/web/src/content/schemas/`, runs global case/source id-uniqueness checks across both units, and checks cross-references (empire connections, triangle cargo, region evidence). See `docs/content/CONTENT-VALIDATION.md`.
- `npm run lint` — real, working ESLint flat config (`eslint.config.js`)
- `npm run format` / `npm run format:check` — real, working Prettier

A test runner **is** configured: `npm run test` (Vitest, non-watch, CI-compatible) runs tests from `tests/unit/` — see `docs/development/UNIT-TESTING.md`. There is no type checker configured yet. ESLint and Prettier **are** configured and working — don't claim otherwise.

## Architecture

### The app is currently one file

The entire running game is implemented in **`apps/web/src/main.js`** (6,235 lines as of Phase 24, which reorganized Teacher Mode's Manage Content screens into a Unit→Mission listing, generalized its content-swap pipeline to all 4 quest types, and added a real "Preview as student" that navigates into the actual student-facing screens, on top of Phase 23's original content-swap/unit-floor screens and Phase 22's accounts/classroom/grading screens; re-check the line count with a quick `wc -l` before citing it if much time has passed, don't trust a stale figure). It owns: screen routing/state machine, field and hub movement/collision/NPC patrol logic, dialogue, the map-jigsaw puzzle, the exchange ledger, the Author Mode panel, quest rendering/grading, the join/login/teacher-dashboard/grading/manage-content screens, and all HTML rendering (via template-literal strings, not a framework — there is no React/Vue/etc.). Procedural Web Audio (music + SFX) lives in `apps/web/src/engine/audio-engine.js`; real-accounts/classroom/submission/grading logic lives in `apps/web/src/repositories/` and `apps/web/src/engine/` (`auth-flows.js`, `evaluator-requests.js`, `evaluator-client.js`) — both imported by `main.js`.

An orphaned second implementation of the onboarding→field→case-player loop (`apps/web/src/features/*`, plus its two supporting dead stores `engine/content/author-content-store.js` / `engine/player/player-profile-store.js`) used to exist alongside `main.js` — six files total, never imported by it, containing two more dead Author Mode implementations on top of `main.js`'s own broken one. It was confirmed zero-risk (per `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md`) and deleted in a dead-code-removal pass — see `docs/migrations/DEAD-CODE-REMOVAL.md`. Don't recreate it; when extending gameplay, edit `main.js` directly unless deliberately doing modularization work.

There is also a **Unit 2 campaign** (`content/unit-02-campaign.js`, "Colonial Crossroads" / "Riverbend Settlement," case-004), with real, cited historical content across all three cases (case-004 Riverbend, case-005 Triangle Ledger, case-006 Charter & Compact) and the unit-level Archive Review. The serverless AI-grading backend at `api/evaluate.js` + `api/_lib/rubrics.js` (a real Claude-Haiku HIPP/SAQ/LEQ/DBQ evaluator — it's why `@anthropic-ai/sdk` is a production dependency) was unwired from the frontend for a long time; **as of Phase 22 it is wired up**, called from `sourceReader()`'s "initial reading" and the Archive Review SAQ block via `apps/web/src/engine/evaluator-requests.js`/`evaluator-client.js`. It still only ever returns formative feedback, never a grade — a teacher enters the real grade via the new `gradingScreen()`.

`main.js`'s import list (not exhaustive — three more unit content modules and quest-content modules follow the same pattern as unit-01's) now also reaches into the real-accounts layer added in Phase 22:

- `./styles/global.css`
- named exports from `./content/unit-01-campaign.js` / `unit-02-campaign.js` / `unit-03-campaign.js` (content shapes, all live-real with cited historical content)
- `./content/chronicle-opening.defaults.js` and `./content/chronicle-identity.defaults.js`
- `loadProgress` / `saveProgress` / `resetProgress` / `hasSavedProgress` / `hydrateRemoteProgress` from `./repositories/progress-repository.js` (a facade in front of the untouched `local-progress-repository.js`/`chronicle-progress-store.js`, adding background Supabase sync — see Persistence below)
- named exports from `./repositories/teacher-override-repository.js` (a facade in front of the untouched `local-teacher-override-store.js`, adding classroom-scoped remote overrides)
- `renderQuest` / `gradeQuest` from `./quest-types/index.js`
- `REFLECTION_MIN_LENGTH` from `./quest-types/history/evidence-organizing-quest.js`
- named exports from `./content/quests/unit-01-quests.js` (and the unit-02/unit-03 equivalents)
- `renderTiledMap` / `createTilesetImageResolver` from `./engine/tiled-map-loader.js`
- `ellipse` / `rectsOverlap` / `footBoxFor` from `./engine/geometry.js`
- `playSfx` / `playQuestSfx` / `toggleAudio` / `updateMusicForScreen` / `isAudioEnabled` from `./engine/audio-engine.js`
- named exports from `./repositories/remote-auth-repository.js`, `remote-classroom-repository.js`, `remote-submission-repository.js` (real accounts/classrooms/submissions, Phase 22)
- `validateJoinCode` / `validateStudentIdCode` / `validatePassword` from `./engine/auth-flows.js`
- `buildHippEvaluationRequest` / `buildSaqEvaluationRequest` from `./engine/evaluator-requests.js`, `evaluateSubmission` from `./engine/evaluator-client.js` (the now-wired AI grading backend)
- two `.tmj` raw map imports from `./content/maps/`

### State and persistence

`apps/web/src/engine/chronicle-progress-store.js` defines `DEFAULT_PROGRESS` (current screen, unlocked/completed cases, per-case evidence, dialogue responses, exchange ledger, empire connections, review answers, quest responses, `submissions`, `lastSavedAt`, etc.) and reads/writes it to `localStorage` under the key `republic-builder.chronicle.unit-01.v2`. **As of Phase 22, `localStorage` is no longer the only copy of a signed-in student's save** — `apps/web/src/repositories/progress-repository.js` sits in front of the untouched `local-progress-repository.js`/`chronicle-progress-store.js` and debounce-pushes to a real Supabase backend in the background (no-op if signed out), with a `hydrateRemoteProgress()` step merging a remote copy in on sign-in (last-write-wins by `lastSavedAt`). `localStorage` remains the fast/offline-first path and the only copy for anyone not signed into a classroom. `main.js` accesses this via `loadProgress` / `saveProgress` / `resetProgress` / `hasSavedProgress` / `hydrateRemoteProgress` exported from `progress-repository.js`. `progress.currentScreen` plus `VALID_SCREENS` in `main.js` drive the screen-routing state machine — examples include `institute`, `field`, `archive`, `practice-check`, `join`, `login`, `teacher-dashboard`, `grading`, and many others (30+ screens total).

Real accounts/classrooms/submissions/grades now also live in Supabase (schema + RLS in `supabase/migrations/0001_init.sql`) — `profiles`, `classrooms`, `roster_slots`, `student_world_profiles` (the remote mirror of the `progress` blob above), `submissions`, `evaluations`, `manual_grades`, `content_overrides`. See `docs/architecture/session-reports/2026-07-18-real-teacher-mode-accounts-classrooms-grading.md` for the full design and what's still unverified against a real project.

### Engine vs. content boundary

The repo's stated architecture rule (from the decision log): **engine code never contains APUSH-specific facts.** In practice today this is violated in at least three confirmed places — case-ID literals (`"case-001"`) are hard-coded directly into movement/interaction-gating code in `main.js`, not merely into content files. Treat the clean separation described in older docs as aspirational for the current vertical slice, not yet fully realized. Canonical folder intent (corrected against the actual repository — the old table here previously had the asset-tree row backwards):

| Thing                                          | Home                                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| Reusable engine systems                        | `apps/web/src/engine/`                                                                  |
| Campaign/unit content actually used at runtime | `apps/web/src/content/` (`unit-01-campaign.js` real, `unit-02-campaign.js` real)        |
| Images, maps, audio, icons                     | `apps/web/src/assets/` — 148 real files, referenced via `new URL(..., import.meta.url)` |
| JSON schemas                                   | `data/schemas/` (currently one example instance, not a real JSON Schema)                |
| Docs                                           | `docs/`                                                                                 |
| Build/import/validation scripts                | `scripts/`                                                                              |

The placeholder-scaffold root `assets/` tree and the orphaned `apps/web/src/features/` island named in older revisions of this table were deleted in a dead-code-removal pass — see `docs/migrations/DEAD-CODE-REMOVAL.md`.

There is also a **dormant, unread** JSON content pipeline under `content/campaigns/chronicle/units/unit-01/` (`campaign.json`, `unit.json`, `case.json`, `activities/*.json`, `assessments/*.json`) plus record templates in `content/library/`. `main.js` never imports from this tree (confirmed by import-graph trace). It represents a _fourth_ incompatible schema for the same Case 1.01 source content (alongside the live `unit-01-campaign.js` shape and two dead ones) — don't treat its presence as meaning it's wired up, and don't reconcile the schemas speculatively; that's tracked as future `ContentRegistry`/Zod work in `docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md`, not a current task.

### Author Mode and real Teacher Mode (Phase 22 — no longer a stub)

A development-only in-app panel (toggled via the chrome button, rendered by `authorPanel()` in `main.js`) lets a teacher edit two front-facing copy fields (unit title, central question) without touching layout, scoring, or progression logic — see `docs/decision-log/0003-author-mode-and-content-overrides.md` for the original intent. **This is real and working**, not a stub: edits persist via `apps/web/src/repositories/teacher-override-repository.js`, which falls back to a per-browser `local-teacher-override-store.js` for signed-out/local dev, or writes to a classroom-scoped `content_overrides` Supabase table once a real teacher/classroom is active (Phase 22). (An earlier revision of this file claimed the two content-edit inputs had no working event listener — that was fixed in an earlier phase and this file simply hadn't been updated; don't trust old staleness claims about this panel without checking `main.js` directly.)

Beyond Author Mode's content overrides, Chronicle now has real teacher-facing tooling: a teacher creates a classroom, provisions a student roster, reviews AI-evaluated submissions, and enters manual grades via the `teacher-dashboard`/`grading` screens (`main.js`) backed by a real, live Supabase project (accounts, classrooms, submissions, evaluations, manual grades — schema in `supabase/migrations/0001_init.sql`). A separate **Manage Content** screen (also `main.js`, `manageContentScreen()`/`manageContentCaseScreen()`) lets a teacher browse every mission grouped by unit, see what kind of mission it is (walkable map vs. activity vs. Archive-Challenge-only), and swap a curated alternate for any of a mission's editable slots (source, or any of the 4 quest types) with a draft/preview/publish step, backed by `classroom_content_selections` (`supabase/migrations/0006_teacher_mode.sql`, generalized by `0007_generalize_content_slots.sql`). This is a real, bounded content-selection pipeline (pick from a small pre-authored pool per slot), **not** a from-scratch content-authoring tool — a teacher cannot write new question text/choices/answers through this screen; that remains a deferred future system. See `docs/architecture/session-reports/2026-07-18-real-teacher-mode-accounts-classrooms-grading.md` for the original design and `ARCHITECTURE-QUICKREF.md`'s Phase 22–24 entries for current status, including which migration (`0007`) still needs to be applied to the live project. This does **not** include an `Assignment`/due-date model, classroom analytics, or a general content draft/publish/versioning pipeline — those remain deferred per `PLATFORM-ARCHITECTURE-PROPOSAL.md`.

### Current architecture direction — read `ARCHITECTURE-QUICKREF.md` first

**Read `docs/architecture/ARCHITECTURE-QUICKREF.md` before any other architecture document.** It's short by design and states the current phase, what's approved, and what's explicitly deferred. Only open the longer documents below when you need the deeper rationale behind a QUICKREF line:

- `docs/architecture/CURRENT-REPOSITORY-AUDIT.md` — what actually exists in the repo today (line counts, dead code, schema conflicts), verified against source, not against prior doc claims.
- `docs/architecture/THIRD-PARTY-TOOLING-AUDIT.md` — which dependencies are approved now, prototype-gated, or rejected, and why.
- `docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md` — the long-term multi-subject-platform design (domains, data models, migration phases). Describes **future direction, not current implementation** — `PlatformCore`, `WorldComposition`, `QuestEngine`'s renderer/evaluation registries, `WorldRuntime`, the full 7-repository persistence layer, and `packs/<subject>/` extraction are all documented here as where the architecture is headed, not code that exists or should be scaffolded yet.
- `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` — a skeptical pass that cuts the proposal above down to what a solo developer should actually build near-term. **This is the binding scope document, not the proposal** — when the two disagree on what to build _now_, follow the review, not the proposal.

**Near-term architecture is deliberately minimal**, per the review: keep working code where it already lives (`main.js`, `content/*.js`) and add thin wrappers/tests/schemas around it rather than moving it. Concretely:

- **Vitest and Zod are the only approved immediate major dependencies.** Both are adopt-now, zero-POC-required.
- **Playwright, Phaser, Tiled, and inkjs are deferred** — real candidates for later, not currently being adopted, no POC scheduled unless a task explicitly says otherwise.
- **`PlatformCore`, `WorldComposition`, runtime registries, activity-renderer registries, full subject-pack extraction (`packs/<subject>/`), accounts, classrooms, publishing, and any database** are documented future directions in the proposal above — not current implementation tasks. Don't scaffold them because the proposal describes them.
- **Do not create empty future-architecture folders** (`platform-core/`, `world-composition/`, `quest-engine/`, `runtime/`, `packs/`, etc.) "for structure." The repo already has a cautionary example of this exact mistake: `apps/web/src/features/{assessment,codex,character-creation}/` are empty `.gitkeep` folders from an earlier modularization attempt that a future reader has to investigate and discover are nothing. Don't add more.
- **Do not physically extract working movement, collision, camera, or NPC logic out of `main.js` merely for architectural neatness.** It works, it has no test coverage either way, and moving it is pure code-motion risk with no near-term payoff — per the review, add `export` to specific functions worth unit-testing and test them in place instead. Only physically extract this code if/when a proven Phaser adapter is actually replacing it, which is not scheduled.
- **Preserve the working game.** Every change should leave `npm run dev` producing identical player-visible behavior unless the task's explicit goal is new behavior — verify in the browser, not just via lint/build.

### Documentation conventions

- `docs/decision-log/NNNN-*.md` — numbered ADRs recording _why_ a design choice was made (read the highest-numbered ones for the most current architectural context; earlier ones may describe superseded milestones). Numbering was repaired to resolve a duplicate `0006` and backfill a missing `0020` — see the note at the top of `docs/decision-log/0006-field-movement-and-art-polish.md` and `docs/decision-log/0006a-field-definition-pass.md` if you need the history of that fix.
- `docs/architecture/*.md` and `docs/content-guide/*.md` — most are real, substantive documents. A small number were previously verbatim placeholder stubs ("Recovered placeholder file restored...") and have since been repaired with real content; if you find a file whose entire body is still that sentence, it's genuinely empty — don't cite it as evidence a described system exists, and consider it a candidate for the same repair pass documented in `ARCHITECTURE-QUICKREF.md`.
- `docs/milestone-*.md` at the top level of `docs/` duplicate/mirror some `decision-log` entries by milestone number.
- **After every architecture or migration phase, update `docs/architecture/ARCHITECTURE-QUICKREF.md`**: mark the completed phase, record the next approved phase, note any important decisions made, and record newly approved or newly deferred dependencies. Do not let it go stale — a stale quickref is worse than no quickref, because future sessions will trust it.

## Terminology

Use these consistently in code, copy, and UI strings — they're the game's fixed internal vocabulary:

- **Chronicle Institute** — the organization; **Institute Archive** — the visible hub room/screen name (`chrome()`'s "Institute" branding + `HUB_TARGETS`/`institute` screen in `main.js`).
- **Chronotravel** — traveling to a historical setting (the `travel` screen / "Initiate Chronotravel").
- **Preservation Case** — the badge-case UI opened from the Archive trophy shelf (`unitOneBadgeCaseMarkup()` in `main.js`), styled like a Pokémon badge case, not a debug panel.
- **Navigation Table** — the physical Archive object the player walks to and interacts with to pick a case/route (`archive` screen, `HUB_TARGETS.table`).
- **Recall to Archive** — the field control that returns the player to the Institute.
- Unit 1 badge areas: **Caribbean**, **Atlantic**, **Hispaniola** — all three cases have real, fully-cited content and are playable via normal sequential progression (case-001 → case-002 → case-003), accessible after completing the prior case. Case-002 (Atlantic Exchange, `exchangeLedgerScreen()`) and case-003 (Hispaniola Empire, `empireScreen()`) are not placeholder content or locked behind missing implementation — they are reachable, fully playable, and real.
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

`chronicle-progress-store.js` (key `republic-builder.chronicle.unit-01.v2`) is still the base layer: a single flat `localStorage` blob, and the only save state for anyone not signed into a real classroom. **As of Phase 22, this is no longer the only copy for a signed-in student**: a real Supabase backend now exists (accounts, classrooms, submissions, evaluations, manual grades, classroom-scoped content overrides — schema in `supabase/migrations/0001_init.sql`), and `apps/web/src/repositories/progress-repository.js` layers background sync on top of the untouched local store — exactly the "small service/adapter in front of a versioned save schema" this section used to describe as future design intent. When adding new persisted fields, still extend `DEFAULT_PROGRESS` and the merge logic in `readProgress()` — that pattern is unchanged, just now also mirrored to `student_world_profiles` in Supabase. See `docs/architecture/session-reports/2026-07-18-real-teacher-mode-accounts-classrooms-grading.md` for the full design and what's still unverified against a live project.

## Development workflow expectations

- Prefer small, focused changes over broad refactors; don't fix unrelated things in the same pass.
- Avoid modifying `vite.config.js` unless the task genuinely requires it.
- Compilation/syntax passing is not sufficient to call something fixed — this is a visual/interactive game. Run `npm run dev`, reproduce the reported behavior in the browser, and verify the specific interaction (movement, collision, dialogue, camera) before considering a change done, per this repo's `/verify` skill expectations.
- Don't commit until the requested behavior has actually been tested.
- **Standing permission to `git push` to `main`.** The user (jtrocsa) wants their Vercel deployment (auto-deploys on push to `main`, connected via GitHub) to reflect changes in real time without approving every push — granted 2026-07-12. Commit and push to `main` after finishing and verifying a change, without asking first each time. This does not relax the testing bar above: still verify the change (build passes at minimum; browser-check interactive changes) before pushing, since a push here is an immediate production deploy. Still avoid other destructive/shared-state git operations (force-push, history rewrites, branch deletion) without asking, per the general git safety rules — this exception covers plain `git push` to `main` only.
