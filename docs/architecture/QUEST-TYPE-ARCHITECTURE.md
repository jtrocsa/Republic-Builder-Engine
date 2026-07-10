# Quest-Type Architecture (Phase 8)

Status: content/test/validation layer complete; **not yet wired into the running game**. This is a deliberate scope boundary, not an oversight — see §5.

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
- **`apps/web/src/quest-types/history/evidence-organizing-quest.js`** — deliberately subject-coupled: sources carry historical `attribution` and a `skillCategory` (historical-thinking-skill category, e.g. Contextualization/Sourcing and Situation/Continuity and Change), matched against typed `slots`, with an optional free-text `reflectionPrompt` gated at a minimum length. This generalizes the existing `TRIANGLE_CARGO`/`REGION_EVIDENCE` pattern (parameterized-by-valid-slot-ids Zod factory functions, following the precedent in `apps/web/src/content/schemas/unit02-activities.schema.js`) rather than the more hard-coded `EMPIRE_EVIDENCE`/`EMPIRE_CONNECTIONS` shape.
- **`apps/web/src/quest-types/shared/html.js`** — a small `escapeHtml()` helper shared by both renderers. Deliberately does not import from `main.js` (whose own `esc()` is module-private) and is not imported by `main.js` — `quest-types/` is self-contained.
- **`apps/web/src/quest-types/index.js`** — the minimal lookup: a plain object literal, `QUEST_TYPES = { mcq: {...}, "evidence-organizing": {...} }`, each entry holding `{ schema, listSchema, render, grade }`. `renderQuest(questType, quest, state)` / `gradeQuest(questType, quest, state)` throw on an unknown key. Adding a third quest type later is one more object entry — nothing else in this file changes shape.

### Schema decision (step 1 of the source prompt)

Confirmed the existing Phase 3 Zod schemas already cover ~80% of both shapes and were extended, not replaced:

- MCQ: reused `McqQuestionSchema` (now exported) verbatim via `.extend({ id })`.
- Evidence-organizing: no existing schema covered "sources with historical-thinking-skill attribution matched to typed slots with a length-gated reflection" as one contract — `unit02-activities.schema.js`'s `buildTriangleCargoSchema`/`buildRegionEvidenceSchema` factory pattern was the closest precedent and was followed directly (same `assertUniqueIds` cross-field-uniqueness idiom, same "factory takes valid slot ids, enum-constrains the reference field" idiom), rather than inventing a new pattern.

### First real content

`apps/web/src/content/quests/unit-01-quests.js`:

- `UNIT_01_MCQ_QUESTS` — 3 new MCQ items grounded in Case 1.01's real `CASE_001_SOURCES` (the Taíno context record, the Columbus letter, the Waldseemüller map), each testing HIPP-style sourcing reasoning rather than recall. This **supplements** the existing `REVIEW.mcq` end-of-unit review; it does not replace or duplicate it — the two serve different moments (mid-case practice vs. end-of-unit review).
- `UNIT_01_EVIDENCE_ORGANIZING_QUESTS` — one quest reusing the same three Case 1.01 sources (by the same ids as `CASE_001_SOURCES`, intentionally, for consistency), asking the player to match each record to the historical-thinking skill it best demonstrates (Contextualization / Sourcing and Situation / Continuity and Change), plus a length-gated reflection prompt.

### Validation wiring

- `apps/web/src/repositories/local-content-repository.js` — added `mcqQuests`/`evidenceOrganizingQuests` to the `unit01` group.
- `scripts/validate-content.js` — added two `runSchema(...)` calls against the new list schemas. `npm run validate:content` now checks **19** groups (was 17), 0 errors.

### Tests

Two new files, following the repo's existing conventions exactly (`(normal case)`/`(boundary case)`/`(invalid/missing data)`/`(duplicate ID)` suffixes, `safeParse` + issue-message-substring assertions for schema tests):

- `tests/unit/quest-type-mcq.test.js` — schema (normal/boundary/invalid/duplicate), render (content, selected-state, HTML escaping), grade (correct/incorrect/unanswered), plus a sanity check that the real `UNIT_01_MCQ_QUESTS` content parses.
- `tests/unit/quest-type-evidence-organizing.test.js` — schema (normal/boundary/invalid cross-slot reference/duplicate source id/duplicate slot id/duplicate quest id), render (sources, slots, placed-source display, reflection field presence, HTML escaping), grade (complete/wrong-placement/reflection-too-short/no-reflection-required), plus a sanity check on the real `UNIT_01_EVIDENCE_ORGANIZING_QUESTS` content.

## 3. Verification status

Run live from the repo root at the end of this phase:

- **`npm run validate:content`** — 19/19 groups pass, 0 errors (was 17/17 before this phase).
- **`npm run test`** — 108/108 passing, 10 test files (was 81/81 across 8 files before this phase — the 27 new tests are exactly the two new files above).
- **`npm run lint`** — same baseline as before this phase: 1 pre-existing error + 7 pre-existing warnings, all in `main.js`, none introduced by this phase. The new quest-type/content/test files introduce zero new lint findings.
- **`npm run build`** — succeeds, 90 modules transformed (unchanged from before this phase — expected, see §5: nothing new is imported by `main.js` yet, so nothing new enters the bundle).
- Manual browser verification was **not** performed for this phase, because nothing player-visible changed — see §5.

## 4. Deliberately not built in this phase

Per the source prompt's explicit scope:

- Any quest type beyond MCQ and evidence-organizing (SAQ, puzzle, timeline, matching, etc.).
- Any new map for Atlantic Crossroads — this phase is activity-quest infrastructure only.
- A registry, plugin-discovery, or dynamic-registration mechanism — `QUEST_TYPES` is a two-entry object literal, nothing more.
- Teacher-facing UI for picking a quest type or source count (a natural future extension of `local-teacher-override-store.js`, not built now).
- Anything from the standing deferred-systems list (Phaser, Tiled, Playwright, inkjs, subject-pack extraction, `PlatformCore`, `WorldComposition`, `WorldRuntime`, the remaining 5 repositories, accounts, classrooms, database work, AI content generation).

## 5. Deliberately not built in this phase — and the one thing worth flagging

**`main.js` was not touched, and nothing in `quest-types/` or `content/quests/` is imported by it.** The new code is real, typed, tested, and validated, but currently has zero runtime callers — the same structural shape the now-deleted `apps/web/src/features/` island had before it was confirmed dead and removed (`docs/migrations/DEAD-CODE-REMOVAL.md`).

This was a deliberate choice for this pass, not an omission: the source prompt's ordered build steps (schema check → MCQ type → evidence-organizing type → lookup → content → tests → validate → review) stop short of "wire a new screen into `main.js`'s `VALID_SCREENS`/render switch," and `main.js`'s screen dispatch + drag/drop action handlers are exactly the regression-prone surface `CLAUDE.md`'s "Preserve the working game" and gameplay-invariants sections warn against touching without deliberate, browser-verified care. Bundling that wiring into the same pass as the schema/renderer work risked a rushed integration into the single most fragile file in the repo.

**This must not be left here indefinitely.** Recommended immediate next step: wire one real screen (the natural candidate is a new practice-check screen reachable from the Institute Archive or from within Case 1.01's field, rendering `UNIT_01_MCQ_QUESTS`/`UNIT_01_EVIDENCE_ORGANIZING_QUESTS` via `renderQuest()`/`gradeQuest()`) as its own small, separately-scoped, browser-verified follow-up — not bundled silently into unrelated future work. Until that happens, this phase should be understood as "the reusable layer exists and is proven correct in isolation," not "the game now has new player-visible content."

## 6. Recommended next step

Wire one live screen to the new quest types (see §5), verified in the browser per `CLAUDE.md`'s development-workflow expectations — not just `npm run test`/`lint`/`build` passing. After that, the next approved product step reverts to `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §7's original recommendation: build out the Atlantic or Hispaniola badge area, now using these quest types where they fit instead of hand-duplicating the pattern a fourth time.
