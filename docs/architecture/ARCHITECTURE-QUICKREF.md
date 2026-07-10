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

## 5. Current active phase

**Phase 1 — Documentation housekeeping.** (Matches `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` §11, step 1.) Status: **complete** as of this document's creation.

## 6. Exact next phase

**Phase 2 — Add Vitest; export and test a handful of pure `main.js` functions in place** (collision math, badge-earned logic, save-merge logic). No code moves. Not started. Zod schema work (Phase 3 in the review) may proceed in parallel since it's independent.

## 7. Approved immediate dependencies

- **Vitest** and **Zod** — the only two adopt-now major dependencies. No POC required for either.
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
- `npm run validate:content` — **stub only**, logs a message, does not validate anything yet.
- No `npm test` exists yet. `tests/` is empty aside from `.gitkeep`. Vitest lands in Phase 2.
- Manual browser verification via `npm run dev` remains required for any player-visible change — lint/build passing is not sufficient, per `CLAUDE.md`'s development-workflow expectations.

## 11. Placeholder documents repaired in this pass

Four confirmed placeholder-stub documents (verbatim "Recovered placeholder file restored..." body) were found and repaired: `docs/architecture/repository-map.md`, `docs/content-guide/naming-and-placement.md`, `docs/decision-log/0001-engine-and-campaign-boundaries.md`, `docs/vertical-slice/case-1-01-atlantic-crossroads.md`. (`CURRENT-REPOSITORY-AUDIT.md` named the first, second, and fourth explicitly and reported "4 of ~50 markdown files" as stubs without naming the fourth; a direct repository grep for the stub's exact boilerplate text confirmed `decision-log/0001` as that fourth file — it is repaired here too since it's the founding ADR `README.md` and `CLAUDE.md` both point readers to.)

## 12. Longer documents (consult only when you need the rationale)

- `docs/architecture/CURRENT-REPOSITORY-AUDIT.md` — verified current-state findings.
- `docs/architecture/THIRD-PARTY-TOOLING-AUDIT.md` — dependency research and verdicts.
- `docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md` — the long-term multi-subject-platform design.
- `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` — the binding near-term scope cut; when it disagrees with the proposal on what to build *now*, follow this document.
