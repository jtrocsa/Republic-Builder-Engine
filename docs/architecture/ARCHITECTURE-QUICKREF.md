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

## 5. Current active phase

**Verified dead-code removal** — deleting the confirmed zero-risk orphaned code (per `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` and `CURRENT-REPOSITORY-AUDIT.md`): the orphaned `apps/web/src/features/*` island (six files: `chronicle-institute.js`, `chronicle-identity.js`, `atlantic-crossroads-preview.js`, `author-content-store.js`, `player-profile-store.js`, and related empty `.gitkeep` folders), the dead `chronicle-case-001.js` content file, and any other import-graph-confirmed-unreachable code named in the audit. Status: **not started**.

## 6. Exact next phase

Same as §5 above — verified dead-code removal. Re-confirm each candidate's zero-risk status against the current import graph before deleting (don't trust the audit's file list without re-checking, since the tree has changed across Phases 2–4); delete nothing that has gained a real caller since the audit was written.

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
