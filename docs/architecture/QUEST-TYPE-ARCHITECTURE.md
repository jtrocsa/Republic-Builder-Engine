# Quest-Type Architecture (Phase 8, extended by the Phase 9 pass below)

Status: content/test/validation layer complete for four quest types; **not yet wired into the running game**. This is a deliberate scope boundary, not an oversight — see §5.

> **2026-07-11 update**: This document originally covered Phase 8's two quest types (MCQ, Evidence Organizing). A same-day follow-up pass ("Phase 9" — see `docs/architecture/session-reports/2026-07-11-overnight-quest-types-and-minigames.md` for the full writeup) added two more quest types (Sequencing, Source Analysis/HIPP) plus a separate, non-rubric-scored `apps/web/src/mini-games/` layer. §2–§4 below are updated in place to describe all four quest types; §5–§6 (the "not yet wired" flag) still apply to all four, unchanged in substance.

## 1. What this is and why it exists now

Prior to this phase, every Chronicle activity independently reimplemented one of two shapes:

- **Source-attached MCQ**: `REVIEW.mcq` (`unit-01-campaign.js`/`unit-02-campaign.js`), `EXCHANGE_RECORDS` (case-002), each with its own `prompt`/`choices`/`answer` handling hand-coded into `main.js`.
- **Evidence-organizing (drag cards into slots, then a check)**: `EMPIRE_EVIDENCE`/`EMPIRE_CONNECTIONS` (case-003, hard-coded expected order), `TRIANGLE_LEGS`/`TRIANGLE_CARGO` (case-005), `REGION_RECORDS`/`REGION_EVIDENCE` (case-006) — three separate, near-identical implementations in `main.js`, each with its own render function and its own grading logic.

This phase extracts the two recurring shapes into typed, reusable, testable content contracts + renderers, so future units reuse a renderer instead of hand-rolling a fourth or fifth copy of the same pattern.

This was **explicitly deferred** as recently as `docs/architecture/POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` (Phase 7), which found no forcing function for anything resembling a `QuestEngine` renderer registry and recommended pure content work instead. Phase 8 is a **direct scope decision by the project owner**, not a rediscovered forcing function — the owner determined the game is entering a genuine multi-unit content-growth track and wants this reuse layer in place before duplicating the pattern a fourth time, rather than after. See `ARCHITECTURE-QUICKREF.md` §5 for the same note in the shorter reference doc.

This is explicitly **not** a reopening of the deferred `PlatformCore`/`WorldComposition`/`QuestEngine` registry/`WorldRuntime` work in `PLATFORM-ARCHITECTURE-PROPOSAL.md`. That work is about cross-subject infrastructure (accounts, publishing, world composition) for a second subject that doesn't exist yet. This is in-subject reuse inside Chronicle only — two hand-written lookup entries, no plugin discovery, no dynamic registration, no new dependency.

## 2. What was built

### Folder split

- **`apps/web/src/quest-types/generic/mcq-quest.js`** — subject-agnostic. Field names (`prompt`, `choices`, `answer`, `explanation`, `id`) carry no history-specific assumption; this file would work unchanged for a hypothetical future non-history subject. Content schema (`McqQuestSchema`) **extends** `McqQuestionSchema`, newly exported from `apps/web/src/content/schemas/review.schema.js`, rather than duplicating an equivalent shape — the same shape `REVIEW.mcq` already validates against.
- **`apps/web/src/quest-types/generic/sequencing-quest.js`** (added 2026-07-11) — subject-agnostic. Field names (`id`, `label`, `position`) carry no history-specific assumption. Chronological reasoning in the real AP rubrics is about causal/developmental logic, not date recall — content authors are responsible for choosing item sets with a genuine cause-and-effect relationship (not machine-checkable, so this is authoring guidance in the schema's own header comment, not a schema field). Scoring is all-or-nothing per item set (`gradeSequencingQuest` requires every item's position to match, no partial credit for a near-miss order), matching the rubric's per-point-independent-but-binary logic.
- **`apps/web/src/quest-types/history/evidence-organizing-quest.js`** — deliberately subject-coupled: sources carry historical `attribution` and a `skillCategory` (historical-thinking-skill category, e.g. Contextualization/Sourcing and Situation/Continuity and Change), matched against typed `slots`, with an optional free-text `reflectionPrompt` gated at a minimum length. This generalizes the existing `TRIANGLE_CARGO`/`REGION_EVIDENCE` pattern (parameterized-by-valid-slot-ids Zod factory functions, following the precedent in `apps/web/src/content/schemas/unit02-activities.schema.js`) rather than the more hard-coded `EMPIRE_EVIDENCE`/`EMPIRE_CONNECTIONS` shape.
- **`apps/web/src/quest-types/history/source-analysis-quest.js`** (added 2026-07-11, the HIPP quest type) — deliberately subject-coupled: a `document` (text + attribution) plus 1-2 `hippPrompts[]`, each tagging one HIPP dimension (Historical situation / Intended audience / Point of view / Purpose) with an `argument` context and `options[]`. The real DBQ sourcing point only rewards explaining *how or why* a HIPP element matters to an argument, not merely identifying it — the schema encodes this directly: exactly one `correct` (explanation-linked) option is required per prompt, at least one `identificationOnly && !correct` distractor is required (an option that names the HIPP element correctly but doesn't connect it to an argument — this must score zero), and an option can never be both `correct` and `identificationOnly` (all enforced by Zod `superRefine`, not just described in a comment). Scoring is binary per dimension per document — no invented partial-credit scale.
- **`apps/web/src/quest-types/shared/html.js`** — a small `escapeHtml()` helper shared by all four renderers. Deliberately does not import from `main.js` (whose own `esc()` is module-private) and is not imported by `main.js` — `quest-types/` is self-contained.
- **`apps/web/src/quest-types/index.js`** — the minimal lookup: a plain object literal, `QUEST_TYPES = { mcq: {...}, sequencing: {...}, "evidence-organizing": {...}, hipp: {...} }`, each entry holding `{ schema, listSchema, render, grade }`. `renderQuest(questType, quest, state)` / `gradeQuest(questType, quest, state)` throw on an unknown key. The evidence-organizing entry keeps its original Phase 8 key name (`"evidence-organizing"`, not a shorter `"evidence"`) since renaming a shipped, already-wired key for no functional reason isn't worth the churn. Adding a fifth quest type later is one more object entry — nothing else in this file changes shape.

### Schema decision (step 1 of the source prompt)

Confirmed the existing Phase 3 Zod schemas already cover ~80% of the original two shapes and were extended, not replaced:

- MCQ: reused `McqQuestionSchema` (now exported) verbatim via `.extend({ id })`.
- Evidence-organizing: no existing schema covered "sources with historical-thinking-skill attribution matched to typed slots with a length-gated reflection" as one contract — `unit02-activities.schema.js`'s `buildTriangleCargoSchema`/`buildRegionEvidenceSchema` factory pattern was the closest precedent and was followed directly (same `assertUniqueIds` cross-field-uniqueness idiom, same "factory takes valid slot ids, enum-constrains the reference field" idiom), rather than inventing a new pattern.
- Sequencing and Source Analysis (HIPP) (2026-07-11 addition) had no existing precedent in the Phase 3 schemas — both were built fresh, following the same local-per-file duplicate-id-check idiom already used by `mcq-quest.js`/`evidence-organizing-quest.js` rather than factoring out a shared cross-folder helper (each quest-type file stays self-contained by design).

### First real content

`apps/web/src/content/quests/unit-01-quests.js`:

- `UNIT_01_MCQ_QUESTS` — 3 new MCQ items grounded in Case 1.01's real `CASE_001_SOURCES` (the Taíno context record, the Columbus letter, the Waldseemüller map), each testing HIPP-style sourcing reasoning rather than recall. This **supplements** the existing `REVIEW.mcq` end-of-unit review; it does not replace or duplicate it — the two serve different moments (mid-case practice vs. end-of-unit review).
- `UNIT_01_EVIDENCE_ORGANIZING_QUESTS` — one quest reusing the same three Case 1.01 sources (by the same ids as `CASE_001_SOURCES`, intentionally, for consistency), asking the player to match each record to the historical-thinking skill it best demonstrates (Contextualization / Sourcing and Situation / Continuity and Change), plus a length-gated reflection prompt.
- `UNIT_01_SEQUENCING_QUESTS` (added 2026-07-11) — one quest, a 5-item causal chain grounded in Case 1.01's real sources and `EXCHANGE_RECORDS` (pre-contact Taíno society → Columbus's 1492 contact/1493 letter → the 1507 Waldseemüller map reflecting changed geographic knowledge → the 1520 smallpox epidemic → horses reshaping later societies), explicitly asking the player to sequence by cause-and-effect, not date recall.
- `UNIT_01_SOURCE_ANALYSIS_QUESTS` (added 2026-07-11) — one quest using the real Columbus 1493 letter to Rafael Sánchez, tagging exactly 2 HIPP dimensions (Intended audience, Purpose) that are genuinely arguable for this document. Both dimensions have a real, considered identification-only distractor (not a placeholder) — see the session report for the full authoring-cost discussion the source prompt asked to be flagged.

### Validation wiring

- `apps/web/src/repositories/local-content-repository.js` — added `mcqQuests`/`evidenceOrganizingQuests` to the `unit01` group in Phase 8; added `sequencingQuests`/`sourceAnalysisQuests` in the 2026-07-11 pass.
- `scripts/validate-content.js` — Phase 8 added two `runSchema(...)` calls; the 2026-07-11 pass added two more. `npm run validate:content` now checks **21** groups (was 19 after Phase 8, 17 before it), 0 errors.

### Tests

Following the repo's existing conventions exactly (`(normal case)`/`(boundary case)`/`(invalid/missing data)`/`(duplicate ID)` suffixes, `safeParse` + issue-message-substring assertions for schema tests):

- `tests/unit/quest-type-mcq.test.js` — schema (normal/boundary/invalid/duplicate), render (content, selected-state, HTML escaping), grade (correct/incorrect/unanswered), plus a sanity check that the real `UNIT_01_MCQ_QUESTS` content parses.
- `tests/unit/quest-type-evidence-organizing.test.js` — schema (normal/boundary/invalid cross-slot reference/duplicate source id/duplicate slot id/duplicate quest id), render (sources, slots, placed-source display, reflection field presence, HTML escaping), grade (complete/wrong-placement/reflection-too-short/no-reflection-required), plus a sanity check on the real `UNIT_01_EVIDENCE_ORGANIZING_QUESTS` content.
- `tests/unit/quest-type-sequencing.test.js` (added 2026-07-11) — schema (normal/boundary/permutation-gap-or-repeat-invalid/duplicate item id/duplicate quest id), render (item labels, authored-order fallback, custom `state.order`, HTML escaping), grade (all-or-nothing correct/incorrect — explicitly including a last-two-items-swapped near-miss that still grades incorrect).
- `tests/unit/quest-type-source-analysis.test.js` (added 2026-07-11) — schema (the `correct`+`identificationOnly` contradiction rejected, exactly-one-correct enforced, identification-only-distractor-required enforced, options-count/duplicate-option-id/max-2-dimensions/duplicate-dimension all enforced), render (document text/attribution, per-dimension options, selected-state, HTML escaping), grade (**the specific test the source prompt asked for**: selecting the real shipped `identificationOnly` distractor for `columbus-audience` scores that dimension `false`/0 points, while selecting the explanation-linked option scores it `true`/1 point; `complete` only once every dimension is earned).
- `tests/unit/mini-game-cargo-sorting.test.js` / `tests/unit/mini-game-storm-navigation.test.js` (added 2026-07-11) — pure game-state logic for the two mini-games (see §7 below); no Zod schema exists for these since they're deliberately not content-validated.

## 3. Verification status

Run live from the repo root:

- **`npm run validate:content`** — 21/21 groups pass, 0 errors (17 before Phase 8, 19 after Phase 8, 21 after the 2026-07-11 pass).
- **`npm run test`** — 179/179 passing, 15 test files (81 before Phase 8; 108/10 files after Phase 8; the 2026-07-11 pass added 4 more quest-type/mini-game test files, +71 tests).
- **`npm run lint`** — same baseline as before Phase 8: 1 pre-existing error + 7 pre-existing warnings, all in `main.js`, none introduced by any quest-type/mini-game pass.
- **`npm run build`** — succeeds (module count unchanged from before Phase 8 — expected, see §5: nothing new is imported by `main.js` yet, so nothing new enters the bundle).
- **Browser verification (2026-07-11 addition)**: Phase 8 performed none, since nothing player-visible changed. The 2026-07-11 pass built two dev-only preview harnesses — `apps/web/quest-type-preview.html` (all four quest types) and `apps/web/mini-games-preview.html` (both mini-games) — matching the existing `apps/web/tiled-preview.html` precedent (not linked from the game, not part of `npm run build`), and ran a scripted Playwright pass against both confirming real rendering and click-driven interaction/grading for all four quest types and both mini-games. See the session report for the full pass/fail list.

## 4. Deliberately not built in this phase

Per the source prompts' explicit scope (Phase 8's original two-type scope, plus the 2026-07-11 pass's explicit exclusions):

- Any quest type beyond the four now built (Thesis/argument-building, Causation-as-node-graph, role-play/simulation, SAQ/LEQ-as-quest-format were all explicitly named and explicitly deferred in the 2026-07-11 pass — see the session report).
- Any new map for Atlantic Crossroads — quest-type/mini-game work is activity infrastructure only.
- A registry, plugin-discovery, or dynamic-registration mechanism — `QUEST_TYPES` is a four-entry object literal, nothing more.
- Teacher-facing UI for picking a quest type or source count (a natural future extension of `local-teacher-override-store.js`, not built now).
- A shared abstraction layer between the two mini-games, or a third mini-game, or any currency/wallet/economy/leaderboard/multiplayer mechanic for the mini-games layer — see §7.
- Anything from the standing deferred-systems list (Phaser, Tiled, Playwright's full e2e-suite/CI-gate role — the narrow agent-verification use is unchanged, `PlatformCore`, `WorldComposition`, `WorldRuntime`, the remaining 5 repositories, accounts, classrooms, database work, AI content generation).

## 7. Mini-games layer (2026-07-11, new — not part of Phase 8)

`apps/web/src/mini-games/` is a sibling folder to `quest-types/`, explicitly **not** quest-type infrastructure: no Zod schema, no historical-thinking-skill coupling, no gating behind correct/incorrect answers. It exists purely as a pacing/reward break between earnest quest content.

- `cargo-sorting.js` — Caribbean/Unit 1 flavor timed sorting game (goods into ship holds), reusing the drag-into-slot interaction pattern from Sequencing/the map-jigsaw puzzle with a different skin. Default goods are Columbian-Exchange-era Caribbean trade goods (maize, cassava, cacao, cotton, gold ore, tobacco) — deliberately not Unit 2's triangular-trade goods, to keep the framing on period-appropriate trade logistics for Case 1.01's actual setting rather than risk trivializing forced labor via a sorting-puzzle skin. Flagged explicitly for the project owner in the session report.
- `storm-navigation.js` — Atlantic-crossing flavor timing/reflex game (dodge hazards across 3 lanes). Purely an arcade break, not meant to teach anything.

Both files stay flat (no `generic/`/`history/`-style split, no shared helper module) since two mini-games isn't enough data to know what's actually reusable — each has its own trivial local `escapeHtml`. Neither introduces a currency, wallet, leaderboard, or persistent economy; neither has any multiplayer/opponent-AI mechanic. A third mini-game (a tower-defense-style concept) was discussed and explicitly deferred, not built.

Verified via `apps/web/mini-games-preview.html` (dev-only, same non-build-entry pattern as `tiled-preview.html`) and a scripted Playwright pass confirming both games render and respond to click-driven interaction (cargo placement, lane movement/clamping) correctly.

## 5. Deliberately not built in this phase — and the one thing worth flagging

**`main.js` was not touched, and nothing in `quest-types/` or `content/quests/` is imported by it.** The new code is real, typed, tested, and validated, but currently has zero runtime callers — the same structural shape the now-deleted `apps/web/src/features/` island had before it was confirmed dead and removed (`docs/migrations/DEAD-CODE-REMOVAL.md`).

This was a deliberate choice for this pass, not an omission: the source prompt's ordered build steps (schema check → MCQ type → evidence-organizing type → lookup → content → tests → validate → review) stop short of "wire a new screen into `main.js`'s `VALID_SCREENS`/render switch," and `main.js`'s screen dispatch + drag/drop action handlers are exactly the regression-prone surface `CLAUDE.md`'s "Preserve the working game" and gameplay-invariants sections warn against touching without deliberate, browser-verified care. Bundling that wiring into the same pass as the schema/renderer work risked a rushed integration into the single most fragile file in the repo.

**This must not be left here indefinitely.** Recommended immediate next step: wire one real screen (the natural candidate is a new practice-check screen reachable from the Institute Archive or from within Case 1.01's field, rendering `UNIT_01_MCQ_QUESTS`/`UNIT_01_EVIDENCE_ORGANIZING_QUESTS` via `renderQuest()`/`gradeQuest()`) as its own small, separately-scoped, browser-verified follow-up — not bundled silently into unrelated future work. Until that happens, this phase should be understood as "the reusable layer exists and is proven correct in isolation," not "the game now has new player-visible content."

## 6. Recommended next step

Wire one live screen to the new quest types (see §5), verified in the browser per `CLAUDE.md`'s development-workflow expectations — not just `npm run test`/`lint`/`build` passing. After that, the next approved product step reverts to `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §7's original recommendation: build out the Atlantic or Hispaniola badge area, now using these quest types where they fit instead of hand-duplicating the pattern a fourth time.
