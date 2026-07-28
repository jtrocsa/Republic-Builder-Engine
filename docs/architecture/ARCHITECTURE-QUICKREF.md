# Architecture Quick Reference

**Read this file first.** Consult the longer documents linked at the bottom only when you need deeper rationale than a bullet here provides. This file must be updated after every architecture or migration phase — see the update rule in `CLAUDE.md`.

## 1. Current project state

- The game is **Chronicle**, an AP U.S. History RPG. "Republic Builder Engine" is retired as the project's identity; the eventual multi-subject platform has no final name yet.
- The playable vertical slice is Unit 1 / Case 1.01 ("The Atlantic Crossroads"), fully playable end-to-end with all three sequential cases (case-001 through case-003 all have real, cited historical content). Unit 2 ("Colonial Crossroads," case-004 through case-006 plus unit review) is also complete with real content as of 2026-07-14.
- The entire running game is one file, `apps/web/src/main.js` (9,231 lines as of Phase 45 — re-check with a quick line count before citing it if much time has passed, don't trust a stale figure; Phase 45 was a CSS-only pass, so main.js barely moved from Phase 44's 9,243) — no framework, no React/Vue/Phaser. Procedural Web Audio lives in `apps/web/src/engine/audio-engine.js`; real-accounts/classroom/submission/grading logic lives in `apps/web/src/repositories/` (`remote-*`/`progress-repository.js`/`teacher-override-repository.js`) and `apps/web/src/engine/` (`auth-flows.js`, `evaluator-requests.js`, `evaluator-client.js`, `custom-content-authoring.js`).

## 2. Current branch / migration context

- Working branch: `main` (corrected 2026-07-27 — this line had stated `platform-architecture-refactor` since the original housekeeping pass; that branch no longer reflects reality and nothing currently depends on the distinction).
- This section originally described the documentation-first architecture pass (repository audit → tooling audit → platform proposal → skeptical simplification review → housekeeping). That pass is long since folded into the phase log below; Phases 8 onward are real shipped application code, not documentation-only.

## 3. Current approved architecture

- Keep working code where it lives (`main.js`, `content/*.js`); wrap it thinly rather than moving it.
- Add `export` to specific pure functions worth unit-testing (collision math, badge logic, save-merge logic) and test them **in place** — no physical extraction of movement/collision/camera/NPC code.
- The long-term domain map (`PlatformCore`, `ContentRegistry`, `WorldComposition`, `QuestEngine`, `WorldRuntime`, `packs/<subject>/`) is real and documented, but is **future direction, not current structure** — see `PLATFORM-ARCHITECTURE-PROPOSAL.md`.

## 4. Phase index

**Phase entries are one line here — narrative goes to `docs/architecture/PHASE-HISTORY.md`, which nothing is instructed to read.** This is the rule that keeps this file from re-bloating (it grew from 170 to 232 lines / 172 KB between the 2026-07-23 cost audit flagging exactly this and Phase 46 fixing it — don't repeat that). Consult `PHASE-HISTORY.md` (grep for "Phase N") only when you need the specific rationale/verification behind one phase.

- Repository audit, third-party tooling audit, platform architecture proposal, skeptical simplification review, housekeeping pass — the original documentation-first architecture pass, pre-numbered.
- Phase 2 — Vitest + jsdom test infra; `export`ed 6 pure `main.js` functions in place; 24 tests.
- Phase 3 — Zod + `validate:content`; 6 schema files; `local-content-repository.js`; 17 groups passing.
- Phase 4 — `local-progress-repository.js`, a thin wrapper around the untouched `chronicle-progress-store.js`.
- Phase 5 — dead-code removal: the orphaned `features/` island, `chronicle-case-001.js`, the dormant JSON content pipeline, the placeholder root `assets/` tree.
- Phase 6 — minimal Author Mode persistence fix (`local-teacher-override-store.js`).
- Phase 7 — post-minimal-architecture reassessment; verified Phases 1–6, flagged non-blocking defects, recommended content work next.
- Phase 8 — quest-type architecture: `mcq` + `evidence-organizing` types built, not yet wired into any screen.
- Phase 9 — `sequencing` + `hipp` quest types, a mini-games layer; still unwired.
- Phase 10 — first live quest-type wiring: MCQ → the new `practice-check` screen.
- Phase 11 — remaining 3 quest types wired into Practice Check.
- Phase 12 — Practice Check UI polish, four-Cs skill taxonomy, Caribbean Tiled rebuild.
- Phase 13 — scoped `main.js` modularization: `geometry.js`/`audio-engine.js` extracted, click-handler dispatcher decomposed.
- Phase 14 — Institute Archive Room: shell + Tiled interior.
- Phase 15 — Investigation/Archive Challenge cross-reference validation (Investigation/Archive plan, phase 1).
- Phase 16 — Archive Challenge quest types + case-006 migration (plan phase 2).
- Phase 17 — Investigation Challenge gate (plan phase 3).
- Phase 18 — Navigation Table cleanup + unit-completion gate (plan phase 4).
- Phase 19 — deleted `regionsScreen()`/the `"regions"` route (plan phase 5).
- Phase 20 — second-wave Investigation/Archive Challenge catalog: 4 more Investigation modes, 5 more Archive modes, unit-level bonus challenges introduced (unnumbered in the original log; referred to here as Phase 20 for indexing).
- Phase 21 — Unit 3 companion case-008, "The Founding Debate."
- Phase 22 — real accounts/classrooms/submissions/AI-backed grading on a live Supabase project — the forcing function for `PlatformCore`.
- Phase 23 — real Teacher Mode: curated content swaps, unit-floor gating, draft/publish.
- Phase 24 — Manage Content redesign: unit-grouped listing, generalized swap pipeline across all quest types, real "preview as student."
- Phase 25 — Manage Content usability follow-up: accordion, inline quest preview, read-only ledger preview.
- Phase 26 — real free-text content authoring (`custom_content_items`, the authoring-form text parser).
- Phase 27 — Manage Content usability + real Case 1.02 (Exchange Ledger) editing.
- Phase 28 — quest-type status/hint consolidation (`FOCUSED-MODERNIZATION-ROADMAP.md` item 1).
- Phase 29 — committed the Playwright suite (roadmap item 2) — `npm run test:e2e`, 11 specs.
- Phase 30 — native `<dialog>` for delete confirmation (roadmap item 3).
- Phase 31 — global Escape-key dismissal (roadmap item 4).
- Phase 32 — curated-alternate-content picker (roadmap item 5).
- Phase 33 — centralized teacher-screen async/error-state handling (roadmap item 6).
- Phase 34 — consolidated `previewSession`'s repeated manual guard (roadmap item 7).
- Phase 35 — native `<details>/<summary>` accordion prototype, shipped as the real implementation (roadmap item 8).
- Phase 36 — `aria-live` audit follow-up (roadmap item 9).
- Phase 37 — doc fix for the "two Manage Content screens" split (roadmap item 10 — closed the roadmap).
- Phase 38 — applied the two outstanding Supabase migrations (`0009`/`0010`), live-verified.
- Phase 39–42 — Manage Content wizard redesign, Phase A: case-005, case-003, case-002, case-008 migrated off the Navigation Table onto swappable `QUEST_TYPES` slots (Phase A complete at 42).
- Phase 43 — Manage Content wizard redesign, Phase B: the step-based Name → Preview → Keep/Edit/Replace wizard UI.
- Phase 44 — Chronicle Design System: teacher-facing UI polish/accessibility/performance (token layer, `c-*` primitives, button hierarchy — sub-passes C0–C9).
- Phase 45 — Gameplay Visual Foundation: 20 visual-regression baselines, CSS redeclaration cleanup, gold/black/ink token governance, dead-CSS sweep, 1366×768 Chromebook fixes.
- Phase 46 — session cost discipline: this file split from `PHASE-HISTORY.md`, `CLAUDE.md` verification ladder rewritten, `.claude/settings.json` added, Playwright MCP gated by default. See `docs/architecture/PHASES-46-50.md`.
- Phase 47 — Professional Teacher Interface: one type scale, one `.c-card` surface, one `pageHeaderMarkup()`/`sectionHeadMarkup()`, one 1180px container, one `<details>/<summary>` accordion pattern across every teacher screen (sub-phases 47A–47G). See `docs/architecture/PHASES-46-50.md`.

## 5. Current active phase

**Phases 46–50** are a five-phase program recorded in full at `docs/architecture/PHASES-46-50.md`: (46) session cost discipline, (47) professional teacher UI, (48) all missions visible on the Navigation Table, (49) Chronicle content/mechanics ROI moves, (50) Odysso platform ROI moves. Read that file for current phase detail — this section stays a one-line pointer, not a restatement, so it can't re-bloat.

## 6. Next approved phase

Phase 48 (The Full Mission Board — unhide all missions on the Navigation Table) follows Phase 47, per `PHASES-46-50.md`'s stated sequencing.

## 7. Approved immediate dependencies

- **Vitest** and **Zod** — the only two adopt-now major dependencies from the original architecture pass. No POC required for either. **Both are now installed**: Vitest (plus `jsdom` as its DOM-environment dependency) from Phase 2, Zod from Phase 3.
- **`@supabase/supabase-js`** — approved and installed in Phase 22 (Postgres + Auth + RLS), the concrete backend for real accounts/classrooms/submissions/grading. Used both from the browser (anon key, RLS-scoped) and from `api/` serverless functions (service-role key, privileged roster operations only).
- **Playwright** — the `playwright` core library was already installed (tooling audit era); Phase 29 added the actual `@playwright/test` test-runner package plus `playwright.config.js`/`tests/e2e/`, converting years of ad hoc manual passes into a real, committed, rerunnable suite (9 of 11 planned scenarios; 2 deferred, need a dedicated Supabase test project). `npm run test:e2e` runs it.
- ESLint + Prettier are already installed and working (`npm run lint`, `npm run format`) — not new, just confirm they stay enforced.

## 8. Deferred systems and tools

- **Tools deferred, not rejected:** Phaser 4.1.x, inkjs. Real candidates, no concrete forcing function yet (Phaser: no perf complaint exists yet; inkjs: today's dialogue is one static line per NPC, no branching need exists yet). **Playwright is no longer deferred** — see §7 above; Phase 29 shipped a real committed suite, not just ad hoc usage. **Tiled is no longer fully deferred**: `.tmj` rendering via `apps/web/src/engine/tiled-map-loader.js` is now an established narrow pattern for three real, live maps (Unit 2's Riverbend field since the Phase 7-era proof of concept, Unit 1's Caribbean field since Phase 12, and the Institute Archive Room since Phase 14 — see `docs/decision-log/0029-caribbean-tiled-rebuild.md` and `0030-archive-room-tiled-interior.md`). This is still not license for a bigger Tiled-authoring pipeline, a desktop-editor workflow, or a `QuestEngine` renderer registry — collision stays hand-coded in `main.js`, generated to match the tile art rather than the reverse.
- **Architecture deferred, not rejected:** `WorldComposition` (Blueprints/AI-generation/Publishing, including the full `TeacherWorld`→`PublicationVersion` draft/publish/versioning pipeline — Phase 22's content overrides deliberately stayed a flat classroom-scoped patch, not this), `QuestEngine`'s renderer/evaluation registries, `WorldRuntime`, 2 of the proposal's 7 repositories still not built (`World`/`Asset` — `Auth`/`Classroom`/`Submission` are now real as of Phase 22, `Content`/`Progress` were already real), full `packs/<subject>/` extraction. Revisit only when a second real subject pack exists — not on a calendar schedule. **`PlatformCore` (Identity/Classroom/Enrollment) is no longer deferred** — a real (if minimal) version shipped in Phase 22 once a real teacher/classroom pilot became real, per the exact condition this section used to name.
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
- `npm run test:e2e` (Playwright, real browser against a real dev server) — real, working, added in Phase 29. Config: `playwright.config.js` (repo root). Specs live in `tests/e2e/*.spec.js`, one file per scenario, sharing `tests/e2e/helpers/progress-seed.js` for localStorage-based state seeding. 9 of 11 planned scenarios; 2 deferred pending a dedicated Supabase test project (see Phase 29 above).
- Manual browser verification via `npm run dev` remains required for any player-visible change — lint/build passing is not sufficient, per `CLAUDE.md`'s development-workflow expectations.

## 11. Placeholder documents repaired in this pass

Four confirmed placeholder-stub documents (verbatim "Recovered placeholder file restored..." body) were found and repaired: `docs/architecture/repository-map.md`, `docs/content-guide/naming-and-placement.md`, `docs/decision-log/0001-engine-and-campaign-boundaries.md`, `docs/vertical-slice/case-1-01-atlantic-crossroads.md`. (`CURRENT-REPOSITORY-AUDIT.md` named the first, second, and fourth explicitly and reported "4 of ~50 markdown files" as stubs without naming the fourth; a direct repository grep for the stub's exact boilerplate text confirmed `decision-log/0001` as that fourth file — it is repaired here too since it's the founding ADR `README.md` and `CLAUDE.md` both point readers to.)

## 12. Longer documents (consult only when you need the rationale)

- `docs/architecture/CURRENT-REPOSITORY-AUDIT.md` — verified current-state findings.
- `docs/architecture/art-and-map-style-guide.md` — living reference for canonical tileset-element dictionary (which pack/sheet supplies grass, trees, buildings, etc., per historical setting). Updated during planning passes. Pairs with `docs/decision-log/0031-art-style-unification.md` and `docs/decision-log/0032-common-cause-tiled-rebuild.md` (the latter closed the guide's one Gap Register entry — case-007's Common Cause field is now a real `.tmj`, not CSS-drawn).
- `docs/architecture/THIRD-PARTY-TOOLING-AUDIT.md` — dependency research and verdicts.
- `docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md` — the long-term multi-subject-platform design.
- `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` — the binding near-term scope cut; when it disagrees with the proposal on what to build _now_, follow this document.
- `docs/development/UNIT-TESTING.md` — Phase 2 writeup: what's tested, why, the `main.js` import-safety guard, and what's deliberately untested.
- `docs/content/CONTENT-VALIDATION.md` — Phase 3 writeup: schemas added, the `local-content-repository.js` wrapper, the validation command, cross-reference checks, and known limitations (notably: `main.js`'s own embedded NPC/coordinate/badge dictionaries aren't reachable by a plain-Node validator script).
- `docs/architecture/LOCAL-PROGRESS-REPOSITORY.md` — Phase 4 writeup: why it's the only repository added, the actual (corrected) call-site count, save versioning, and save-compatibility verification.
- `docs/migrations/DEAD-CODE-REMOVAL.md` — Phase 5 writeup: per-candidate reverification results, what was deleted vs. preserved, reference cleanup performed, and post-deletion verification.
- `docs/teacher-mode/MINIMAL-LOCAL-OVERRIDES.md` — Phase 6 writeup: the two confirmed-broken fields, the override store's shape/stable-key convention/validation, resolution and reset behavior, and the manual verification procedure.
- `docs/architecture/POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` — Phase 7 writeup: verification status of all prior phases, remaining defects, the forcing-function evaluation for every deferred tool/system, the recommended next product milestone, and the conditions that should trigger another reassessment.
- `docs/architecture/QUEST-TYPE-ARCHITECTURE.md` — Phase 8 writeup (updated in place for Phase 9): all four quest types built, why each schema decision was made, verification status, the mini-games layer (§7), and an explicit flag that the quest-type layer is not yet wired into any live screen.
- `docs/architecture/session-reports/2026-07-11-overnight-quest-types-and-minigames.md` — Phase 9 session report: full punch list of what was built, judgment calls made, and what was deliberately left unfinished.
- `docs/architecture/session-reports/2026-07-18-real-teacher-mode-accounts-classrooms-grading.md` — Phase 22 session report: the Supabase schema/RLS design, every new file across both repos, judgment calls made (teacher self-serve signup), and the exact manual verification still required now that a real backend exists to test against.
- `docs/architecture/UI-DESIGN-SYSTEM.md` — Phase 44 writeup: the design-token layer, shared CSS/JS primitives, button hierarchy, accessibility and responsive expectations for new teacher-screen work, and an explicit list of what that pass deliberately did not do (full dead-CSS sweep, gameplay CSS restructuring, roving-tabindex tab navigation).

## 13. Project-level Claude Code subagents

Six project subagents live in `.claude/agents/` (git-tracked, shared across sessions once the harness has restarted after their creation): `content-designer`, `map-implementer`, `content-validator`, `test-writer`, `code-reviewer`, `doc-sync`. Each is scoped to one part of the content/test/validate/review/doc-sync loop described in `docs/architecture/QUEST-TYPE-ARCHITECTURE.md` — see each file's own frontmatter for its exact tool access and responsibilities.
