# Architecture Quick Reference

**Read this file first.** Consult the longer documents linked at the bottom only when you need deeper rationale than a bullet here provides. This file must be updated after every architecture or migration phase — see the update rule in `CLAUDE.md`.

## 1. Current project state

- The game is **Chronicle**, an AP U.S. History RPG. "Republic Builder Engine" is retired as the project's identity; the eventual multi-subject platform has no final name yet.
- The playable vertical slice is Unit 1 / Case 1.01 ("The Atlantic Crossroads"), fully playable end-to-end; Unit 2 ("Riverbend Settlement") is live but placeholder content.
- The entire running game is one file, `apps/web/src/main.js` (~2,930 lines) — no framework, no React/Vue/Phaser.

## 2. Current branch / migration context

- Working branch: `platform-architecture-refactor`.
- This document sits at the end of a documentation-first architecture pass: repository audit → tooling audit → platform proposal → skeptical simplification review → this housekeeping pass.
- No application code has been changed by any step in that pass. The codebase today is byte-for-byte the same game it was before the architecture review started.

## 3. Current approved architecture

- Keep working code where it lives (`main.js`, `content/*.js`); wrap it thinly rather than moving it.
- Add `export` to specific pure functions worth unit-testing (collision math, badge logic, save-merge logic) and test them **in place** — no physical extraction of movement/collision/camera/NPC code.
- The long-term domain map (`PlatformCore`, `ContentRegistry`, `WorldComposition`, `QuestEngine`, `WorldRuntime`, `packs/<subject>/`) is real and documented, but is **future direction, not current structure** — see `PLATFORM-ARCHITECTURE-PROPOSAL.md`.

## 4. Work completed so far

- Repository audit, third-party tooling audit, platform architecture proposal, and a skeptical simplification review — all four documents exist under `docs/architecture/`.
- This housekeeping pass: corrected `CLAUDE.md`'s stale claims, repaired 4 confirmed placeholder-stub docs (see §11), repaired decision-log numbering (duplicate `0006` → `0006`/`0006a`; missing `0020` backfilled from an existing milestone doc), and created this file.
- Phase 2: added Vitest (+ jsdom for `main.js`'s DOM-dependent module scope), `export`ed six existing `main.js` functions/state (`ellipse`, `isCaribbeanLand`, `rectsOverlap`, `footBoxFor`, `badgeRecordsForUnit`, `unlockNext`, `progress`) in place, added a narrow `if (app)` boot guard so importing `main.js` no longer boots the live app as a side effect, and added 24 tests across 3 files under `tests/unit/`. Full writeup: `docs/development/UNIT-TESTING.md`.
- Phase 3: added Zod, wrote 6 schema files under `apps/web/src/content/schemas/` validating `unit-01-campaign.js`/`unit-02-campaign.js` in place (ids, titles, unit/case/source/mcq/saq structure, answer-index bounds, and cross-references like empire connections → evidence ids, triangle cargo → leg ids, region evidence → region ids), created `apps/web/src/repositories/local-content-repository.js` (one real caller: the validation script), and made `scripts/validate-content.js` a real Zod-backed validator with a global case/source id-uniqueness check across both units. All 17 content groups pass against real content today — no corrections were needed. Added 28 tests across 2 new files under `tests/unit/`. Full writeup: `docs/content/CONTENT-VALIDATION.md`.
- Phase 4: created `apps/web/src/repositories/local-progress-repository.js`, a thin wrapper around `chronicle-progress-store.js` (untouched, not moved or rewritten). Actual direct call-site count in `main.js` was **8**, not the ~4 originally estimated (`readProgress` ×1, `saveProgress` ×2 direct + ×1 via the `save()` wrapper ~60+ sites use, `resetProgress` ×3, `hasSavedProgress` ×1) — corrected and documented. Only the import statement and the one `readProgress()`→`loadProgress()` call site needed edits; `saveProgress`/`resetProgress`/`hasSavedProgress` kept identical names so every other call site (including all ~60+ indirect `save()` calls) needed no changes. Added a minimal additive `schemaVersion` field + `migrateProgress()` guard at the repository layer (store's data shape unaffected); verified old saves without `schemaVersion` still load correctly with nothing dropped. Added 10 tests in a new file under `tests/unit/`. Full writeup: `docs/architecture/LOCAL-PROGRESS-REPOSITORY.md`.
- Phase 5 (dead-code removal): re-verified every candidate from `CURRENT-REPOSITORY-AUDIT.md`/`ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` against the current import graph (all still zero-risk — nothing had gained a caller since the audit), then deleted: the orphaned `apps/web/src/features/*` island (6 files + its 5 empty `.gitkeep` folders), `apps/web/src/content/chronicle-case-001.js`, `apps/web/src/content/cases/case-atlantic-crossroads.preview.js` (the island's sole content dependency), `apps/web/src/engine/content/author-content-store.js` (the island's sole store dependency), `apps/web/src/engine/player/player-profile-store.js`, the dormant `content/campaigns/` + `content/library/` JSON pipeline, and the placeholder-only root `assets/` tree. Updated `README.md`'s canonical-homes table, `docs/content-guide/naming-and-placement.md`, `.claude/skills/chronicle-institute-conventions/SKILL.md`, `docs/content/CONTENT-VALIDATION.md`, and added a historical note to decision-log `0005` to stop pointing at deleted paths. Left historical audit/proposal/review documents and milestone docs unedited (they're point-in-time records, not living references). Full writeup: `docs/migrations/DEAD-CODE-REMOVAL.md`.
- Phase 6 (minimal Author Mode persistence fix): confirmed the two broken fields are exactly `main.js`'s `authorPanel()` `[data-copy="unit-title"]`/`[data-copy="unit-question"]` inputs (backing `UNIT_01.title`/`UNIT_01.centralQuestion`) — `data-profile="name"` was already working and untouched. Created `apps/web/src/repositories/local-teacher-override-store.js` (storage key `republic-builder.chronicle.teacher-overrides.v1`, a flat `{ [contentId]: { [fieldName]: value } }` patch blob, Zod-validated per-entry so malformed data can't wipe unrelated overrides). Added `resolvedUnitTitle()`/`resolvedUnitCentralQuestion()` wrappers in `main.js` and used them everywhere the unit title/central question already render to students (institute hub line, archive atlas label, review/completion headings) plus one new "Guiding question" line in `archiveScreen()` — the central question had no student-facing display before this phase, so the fix's own required behavior ("show the override where it's displayed") needed one minimal new line, not a new editable field. Added a single combined "Reset content overrides to official text" button (shown only when an override exists) plus small "edited" flags in the panel, since no reset control existed. Kept the "Author Mode" label unchanged. `export`ed `resolvedUnitTitle`/`resolvedUnitCentralQuestion` from `main.js` (same in-place-export pattern as Phase 2) and added 18 tests across two new files, `tests/unit/local-teacher-override-store.test.js` (the store in isolation) and `tests/unit/main-teacher-overrides.test.js` (the `main.js` wiring). `npm run test` (81/81 passing), `npm run validate:content`, `npm run build`, and `npm run lint` (same one pre-existing unrelated error as before, no new errors) all pass. Full writeup: `docs/teacher-mode/MINIMAL-LOCAL-OVERRIDES.md`.
- Phase 7 (post-minimal-architecture reassessment): re-verified all 6 phases above live (`npm run test` 81/81, `npm run build` 90 modules, `npm run validate:content` 17/17, `npm run lint` unchanged from baseline, `apps/web/src/features/` confirmed actually deleted, all 3 repository files confirmed present) and searched for concrete forcing-function evidence across Phaser/Tiled, Playwright, inkjs, subject-pack extraction, PlatformCore/accounts/classrooms, and WorldComposition/AI generation — found none in any category. Flagged (not fixed, no code changed) a small set of pre-existing, non-blocking defects: 7 long-standing ESLint warnings in `main.js` including two suspicious defined-but-never-called functions (`moveInstitutePlayer`, `moveFieldPlayer`) worth a name-check before movement code is next touched, and two stale doc figures (`UNIT-TESTING.md`'s test count, `CLAUDE.md`'s `main.js` line count — actual is now 2,964 lines / 81 tests across 8 files). Recommended the next milestone be product work (expand real Unit 1 content into the next badge area) rather than any new architecture phase. Full writeup: `docs/architecture/POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md`.
- Phase 8 (quest-type architecture): a deliberate, explicit owner-directed override of Phase 7's hold-pattern (see §5) — not a rediscovered forcing function. Built exactly two quest types: `apps/web/src/quest-types/generic/mcq-quest.js` (extends the newly-exported `McqQuestionSchema` from `review.schema.js`) and `apps/web/src/quest-types/history/evidence-organizing-quest.js` (generalizes the `TRIANGLE_CARGO`/`REGION_EVIDENCE` factory-schema pattern), plus a two-entry lookup object at `apps/web/src/quest-types/index.js` (not a registry). Added first real content for Case 1.01 at `apps/web/src/content/quests/unit-01-quests.js` (3 MCQ items + 1 evidence-organizing quest, grounded in the real `CASE_001_SOURCES`). Wired into `local-content-repository.js`/`scripts/validate-content.js` (19/19 groups pass, was 17). Added 27 tests across 2 new files (`npm run test` 108/108, was 81). `npm run lint`/`npm run build` unchanged from baseline. **Important: `main.js` was not touched — nothing renders this content in the running game yet.** This was a deliberate scope boundary for this pass (see full writeup), not an oversight, but it means the new code is currently unreached at runtime, structurally similar to the now-deleted `features/` island until a screen is wired to it. Full writeup, including the explicit flag and recommended next step: `docs/architecture/QUEST-TYPE-ARCHITECTURE.md`.

## 5. Current active phase

**Post-Phase-8 — holding pattern on architecture, product work approved next, with one flagged follow-up.** Phase 8 (quest-type architecture) is complete as scoped — see §4. It was a deliberate, explicit override of the prior Phase 7 hold-pattern, made by the project owner rather than found by a forcing-function review: the owner decided the game is entering a genuine content-growth track (more units, more badge areas, more activity variety) and wanted a small, scoped quest-type layer in place now rather than continuing to hand-duplicate the MCQ/evidence-organizing pattern per case. This was **not** a rediscovery of a forcing function under §8/§9's criteria — it was a scope decision the owner is entitled to make directly.

Scope stayed deliberately narrow: exactly two quest types (`generic/mcq-quest`, `history/evidence-organizing-quest`), no registry/plugin-discovery system, no `PlatformCore`/`WorldComposition`/`QuestEngine` — those remain deferred per §8.

## 6. Exact next phase

**No new architecture phase is scheduled.** Two items are queued, in order:

1. **Wire one live screen to the new quest types** (flagged, not yet done, in `docs/architecture/QUEST-TYPE-ARCHITECTURE.md` §5–6) — a small, separately-scoped, browser-verified follow-up so Phase 8's content stops being unreached code. Recommended candidate: a practice-check screen reachable from the Institute Archive or Case 1.01's field, rendering `UNIT_01_MCQ_QUESTS`/`UNIT_01_EVIDENCE_ORGANIZING_QUESTS` via `renderQuest()`/`gradeQuest()`.
2. **Then revert to product-track**: expand real Unit 1 content by building out the next badge area (Atlantic or Hispaniola), now using the quest types where they fit, per `docs/architecture/POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §7. That document also names two small, optional, separately-scoped hygiene follow-ups (the `moveInstitutePlayer`/`moveFieldPlayer` dead-code check, and refreshing the two stale doc figures) that are not bundled into the content work.

Do not begin Playwright, Phaser, Tiled, inkjs, `PlatformCore`, World Composition, full Teacher Mode (`TeacherWorld`/`PublicationVersion`/publishing/classrooms), or any database work without a concrete forcing function — see `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §10 for the specific conditions that would count. Revisit that document when one of those becomes real, not on a calendar schedule.

## 7. Approved immediate dependencies

- **Vitest** and **Zod** — the only two adopt-now major dependencies. No POC required for either. **Both are now installed**: Vitest (plus `jsdom` as its DOM-environment dependency) from Phase 2, Zod from Phase 3.
- ESLint + Prettier are already installed and working (`npm run lint`, `npm run format`) — not new, just confirm they stay enforced.

## 8. Deferred systems and tools

- **Tools deferred, not rejected:** Playwright, Phaser 4.1.x, Tiled, inkjs. Real candidates, no concrete forcing function yet (Playwright: worth doing whenever convenient, not blocking anything; Phaser/Tiled: no real second map or perf complaint exists yet; inkjs: today's dialogue is one static line per NPC, no branching need exists yet).
- **Architecture deferred, not rejected:** `PlatformCore` (Identity/Classroom/Enrollment), `WorldComposition` (Blueprints/AI-generation/Publishing), `QuestEngine`'s renderer/evaluation registries, `WorldRuntime`, 5 of the proposal's 7 repositories (`Auth`/`Classroom`/`Submission`/`World`/`Asset`), full `packs/<subject>/` extraction. Revisit only when a second real subject pack or a second real user/classroom exists — not on a calendar schedule.
- **Explicitly rejected:** Yarn Spinner (unshipped official JS runtime), H5P-as-platform-core (state-ownership conflict), Spine, LDtk, TexturePacker (no current problem they solve). Consider-later, not adopted: Storybook, Phaser Editor v5, Sentry, GitHub Actions CI, axe-core/Lighthouse CI.

## 9. Systems that must not be restored

- Founder Paths, professions, Historian Skills, clothing/wardrobe-slot systems — removed from the design, do not reintroduce even if a future request seems to imply them.
- The player identity model stays minimal: display name + one of two appearance choices only.

## 10. Verification commands currently available

- `npm run dev` / `npm run build` / `npm run preview` — real, working (Vite).
- `npm run lint` — real, working (ESLint flat config).
- `npm run format` / `npm run format:check` — real, working (Prettier).
- `npm run validate:content` — real, working, added in Phase 3. Runs `scripts/validate-content.js` under plain Node (not Vite), validating `unit-01-campaign.js`/`unit-02-campaign.js` with Zod schemas from `apps/web/src/content/schemas/` plus two cross-file id-uniqueness checks. See `docs/content/CONTENT-VALIDATION.md`.
- `npm run test` (Vitest, non-watch, CI-compatible) and `npm run test:watch` — real, working, added in Phase 2. Config: `vitest.config.js` (repo root, deliberately separate from `vite.config.js`). Tests live in `tests/unit/`. See `docs/development/UNIT-TESTING.md`, `docs/content/CONTENT-VALIDATION.md`, and `docs/architecture/LOCAL-PROGRESS-REPOSITORY.md`.
- Manual browser verification via `npm run dev` remains required for any player-visible change — lint/build passing is not sufficient, per `CLAUDE.md`'s development-workflow expectations.

## 11. Placeholder documents repaired in this pass

Four confirmed placeholder-stub documents (verbatim "Recovered placeholder file restored..." body) were found and repaired: `docs/architecture/repository-map.md`, `docs/content-guide/naming-and-placement.md`, `docs/decision-log/0001-engine-and-campaign-boundaries.md`, `docs/vertical-slice/case-1-01-atlantic-crossroads.md`. (`CURRENT-REPOSITORY-AUDIT.md` named the first, second, and fourth explicitly and reported "4 of ~50 markdown files" as stubs without naming the fourth; a direct repository grep for the stub's exact boilerplate text confirmed `decision-log/0001` as that fourth file — it is repaired here too since it's the founding ADR `README.md` and `CLAUDE.md` both point readers to.)

## 12. Longer documents (consult only when you need the rationale)

- `docs/architecture/CURRENT-REPOSITORY-AUDIT.md` — verified current-state findings.
- `docs/architecture/THIRD-PARTY-TOOLING-AUDIT.md` — dependency research and verdicts.
- `docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md` — the long-term multi-subject-platform design.
- `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` — the binding near-term scope cut; when it disagrees with the proposal on what to build *now*, follow this document.
- `docs/development/UNIT-TESTING.md` — Phase 2 writeup: what's tested, why, the `main.js` import-safety guard, and what's deliberately untested.
- `docs/content/CONTENT-VALIDATION.md` — Phase 3 writeup: schemas added, the `local-content-repository.js` wrapper, the validation command, cross-reference checks, and known limitations (notably: `main.js`'s own embedded NPC/coordinate/badge dictionaries aren't reachable by a plain-Node validator script).
- `docs/architecture/LOCAL-PROGRESS-REPOSITORY.md` — Phase 4 writeup: why it's the only repository added, the actual (corrected) call-site count, save versioning, and save-compatibility verification.
- `docs/migrations/DEAD-CODE-REMOVAL.md` — Phase 5 writeup: per-candidate reverification results, what was deleted vs. preserved, reference cleanup performed, and post-deletion verification.
- `docs/teacher-mode/MINIMAL-LOCAL-OVERRIDES.md` — Phase 6 writeup: the two confirmed-broken fields, the override store's shape/stable-key convention/validation, resolution and reset behavior, and the manual verification procedure.
- `docs/architecture/POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` — Phase 7 writeup: verification status of all prior phases, remaining defects, the forcing-function evaluation for every deferred tool/system, the recommended next product milestone, and the conditions that should trigger another reassessment.
- `docs/architecture/QUEST-TYPE-ARCHITECTURE.md` — Phase 8 writeup: the two quest types built, why each schema decision was made, verification status, and an explicit flag that this layer is not yet wired into any live screen.

## 13. Project-level Claude Code subagents

Six project subagents live in `.claude/agents/` (git-tracked, shared across sessions once the harness has restarted after their creation): `content-designer`, `map-implementer`, `content-validator`, `test-writer`, `code-reviewer`, `doc-sync`. Each is scoped to one part of the content/test/validate/review/doc-sync loop described in `docs/architecture/QUEST-TYPE-ARCHITECTURE.md` — see each file's own frontmatter for its exact tool access and responsibilities.
