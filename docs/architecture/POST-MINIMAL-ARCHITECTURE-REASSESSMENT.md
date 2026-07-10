# Post-Minimal-Architecture Reassessment

Status: complete. This is the "stop and reassess based on real usage" step named as the next phase in `ARCHITECTURE-QUICKREF.md` §6 after the minimal Author Mode persistence fix (Phase 6) — the last step of `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md`'s near-term sequence (§11 step 7 / §17 item 7). This is a review-and-planning document only: no application code, dependencies, or architecture were changed to produce it.

## 1. Completed phases

| Phase | Summary | Status |
| --- | --- | --- |
| Documentation housekeeping | Corrected stale `CLAUDE.md` claims, repaired 4 placeholder-stub docs, fixed decision-log numbering (duplicate `0006`, missing `0020`) | Complete |
| Phase 2 — Vitest setup | Added Vitest + jsdom, exported 6 `main.js` functions for testing, added a boot guard, 24 initial tests | Complete |
| Phase 3 — Zod content validation | Added Zod, 6 schema files, `local-content-repository.js`, made `scripts/validate-content.js` real | Complete |
| Phase 4 — local progress repository | Added `local-progress-repository.js` thin wrapper around `chronicle-progress-store.js`, added `schemaVersion` + `migrateProgress()` | Complete |
| Phase 5 — dead-code removal | Deleted `apps/web/src/features/*` island, `chronicle-case-001.js`, the dormant JSON content pipeline, and the placeholder root `assets/` tree | Complete |
| Phase 6 — minimal Author Mode overrides | Created `local-teacher-override-store.js`, fixed the two broken content-edit fields, added display + reset UI | Complete |

## 2. Verification status

Run live from the repo root during this reassessment (read-only; no files changed by these runs):

- **`npm run test`** — 81/81 passing, 8 test files: `chronicle-progress-store`, `content-cross-reference`, `content-schemas`, `local-progress-repository`, `local-teacher-override-store`, `main-badges-quests`, `main-collision`, `main-teacher-overrides`.
- **`npm run build`** — succeeds, 90 modules transformed, ~826ms.
- **`npm run validate:content`** — a real, Zod-backed command (not a placeholder). 17/17 content groups pass, 0 errors.
- **`npm run lint`** — not fully clean. 1 pre-existing error + 7 pre-existing warnings, all in `main.js`, none introduced by Phase 6. Detailed in §3.
- **`npm run format:check`** — 42 files flagged, unchanged in count from the prior session; pre-existing repo-wide Prettier/CRLF drift, unrelated to recent work.
- **`apps/web/src/main.js` line count** — 2,964 lines (`CLAUDE.md`'s "~2,930" figure is stale by ~34 lines).
- **`apps/web/src/features/`** — confirmed actually deleted, not merely documented as deleted.
- **`apps/web/src/repositories/`** — confirmed contains all three expected files (`local-content-repository.js`, `local-progress-repository.js`, `local-teacher-override-store.js`).
- **Highest decision-log entry** — `0027-side-sprite-audio-sfx.md`, Milestone 3.4.15 — confirms `CLAUDE.md`'s milestone claim is still current; nothing newer exists.

### Gameplay invariants (checklist items 11–14)

Field movement, the archive room, quest reset, and save restoration were **not re-driven in a live browser during this reassessment** — no headless-browser tool (Playwright/`chromium-cli`) is available in this environment, and this pass is research-only per the task's own scope ("review and planning task only"). The evidence available instead:

- `main-collision.test.js` exercises the collision primitives underlying field/hub movement.
- `main-badges-quests.test.js` exercises badge unlock and quest-reset logic.
- `local-progress-repository.test.js` exercises save load/migrate/restore, including the `schemaVersion` guard added in Phase 4.
- The decision log documents 15 hotfix milestones (3.4.1 through 3.4.15) resolving exactly these categories (camera, collision, dialogue anchoring, NPC patrol), with no open regression noted since the newest entry.

This is indirect evidence, not a live confirmation. Stated explicitly rather than implied, per `CLAUDE.md`'s instruction to say so when the UI hasn't actually been driven.

## 3. Remaining defects

None of these are new or introduced by Phase 6 — they predate it and were simply not previously enumerated together.

- **`main.js:2093`** — `no-useless-assignment` (ESLint error). Already known and documented; left untouched per explicit prior instruction not to touch unrelated code.
- **Unused-variable warnings (7 total)**, all in `main.js`:
  - `EMPIRE_CONNECTIONS` imported but unused (L8).
  - `lastSfxAt` should be `const`, never reassigned (L913).
  - **`moveInstitutePlayer` (L1408) and `moveFieldPlayer` (L1685) — defined but never called.** These names strongly resemble the hub/field movement-update functions described in `CLAUDE.md`'s "Gameplay invariants" section. Their presence as dead code suggests either an earlier refactor left a renamed/superseded duplicate behind, or they're genuinely orphaned. Worth a direct check before anyone next touches movement code, so a real function isn't mistaken for dead, or vice versa. Not investigated further here — flagged, not fixed, since this reassessment makes no code changes.
  - Unused locals: `observed` (L1853), `isGarden` (L1856), `moves` (L2941).
- **Prettier drift** — 42 files fail `format:check`, stable across sessions, spanning docs, config, and source. Consistent with Windows CRLF line endings rather than a real style violation; a bulk `prettier --write` was deliberately not run in the prior session to avoid touching unrelated files in a focused change, and the same reasoning applies here.
- **Doc staleness**:
  - `docs/development/UNIT-TESTING.md` still says "24 tests... three files"; actual is now 81 tests across 8 files. The suite grew across Phases 3–6 without this doc being revisited.
  - `CLAUDE.md`'s main.js line count ("~2,930") is stale by ~34 lines against the current 2,964 — ironic given that exact sentence tells the reader not to trust a stale figure.

None of these block anything; they're cleanup candidates, not defects that affect player-facing behavior or the validity of the phases above.

## 4. Current architecture summary

- **Runtime:** one file, `apps/web/src/main.js` (2,964 lines) — screen routing, field/hub movement and collision, dialogue, procedural Web Audio, the map-jigsaw puzzle, the exchange ledger, and the Author Mode panel. No framework.
- **Content:** `apps/web/src/content/unit-01-campaign.js` (real, Case 1.01) and `unit-02-campaign.js` (placeholder), validated by 6 Zod schema files, checked by a real `npm run validate:content`.
- **Persistence:** `localStorage` only, three separate keyed stores — gameplay progress (`chronicle-progress-store.js`, wrapped by `local-progress-repository.js`), content overrides (`local-teacher-override-store.js`), no accounts, no backend wired to the frontend.
- **Testing:** Vitest + jsdom, 8 files, 81 tests, covering collision primitives, progress-store merge/migration logic, content schema/cross-reference validation, badge/quest logic, and the teacher-override store (including its `main.js` wiring).
- **Dependencies beyond baseline:** exactly Vitest and Zod, as approved. `@anthropic-ai/sdk` remains present (backing the disconnected `api/evaluate.js`) but unwired to the frontend, unchanged.
- **Confirmed absent:** `apps/web/src/features/*` (dead-code island), any second real subject pack, any account/classroom/auth code, Phaser, Tiled, inkjs, Playwright.

## 5. Forcing-function evaluation

No category below has a concrete forcing function today. Each is evaluated against the specific evidence bar the task set, not against the long-term platform vision (which is explicitly not a forcing function by itself).

### Phaser and Tiled

Two maps exist: `atlantic-navigation-table.png` (Unit 1, real) and `riverbend-field.png` (Unit 2, placeholder). Each is authored as its own hand-coded coordinate-array/ellipse function in `main.js` (`FIELD_BLOCKS`/`isCaribbeanLand`, `UNIT2_FIELD_BLOCKS`/`isRiverbendLand`, `HUB_BLOCK_RECTS`) — real duplication, already named as a pattern in `THIRD-PARTY-TOOLING-AUDIT.md`. But: no performance complaint exists (`performance.now()` calls are just frame timing, not a flagged problem), no map-authoring-bottleneck comment or TODO was found, and the second map ships with placeholder content rather than real terrain complexity. The duplication is a known shape, not a demonstrated problem.

**No forcing function. Continue deferring.**

### Playwright

Not installed; no code references it. The 15 documented hotfix milestones (3.4.1–3.4.15) are the closest thing to "repeated regressions across workflows," but they were each resolved via manual browser verification without automation, and nothing in the now-complete near-term sequence required it. Manual verification hasn't yet become the actual blocker described in the task's forcing-function bar (routes/persistence flows needing e2e coverage, deployment confidence requiring automation).

**No forcing function. Continue deferring** (remains optional/nonblocking, as already noted in the architecture docs).

### inkjs

Dialogue in `main.js` is entirely static strings (`FIELD_NPCS[].text`) or JS closures (`HUB_TARGETS[id].dialogue()`) — no branching, no variables, no conditions-as-data, confirmed by direct inspection of both content files and the tooling audit's own characterization. No approved quest design currently requires branching, conditional paths, or rejoining story branches.

**No forcing function. Continue deferring.**

### Subject-pack extraction

No second subject exists anywhere in the repo. `unit-02-campaign.js` (408 lines) is explicitly self-labeled as placeholder in its own source comments — it mirrors the shape of `unit-01-campaign.js` but isn't real content. There is exactly one real subject (APUSH/Chronicle), so there is nothing to extract a boundary between yet.

**No forcing function. Continue deferring.**

### PlatformCore, accounts, and classrooms

No account, login, classroom, or multi-user code exists anywhere in `apps/web/src` or `api/`. `api/evaluate.js` — the one piece of backend infrastructure that exists — is confirmed fully disconnected from the frontend (zero references from `apps/web/src`). No second real user, teacher, or classroom pilot is in evidence.

**No forcing function. Continue deferring.**

### World Composition and AI generation

No second subject is in active development, and no reusable activity-template or content-catalog assembly system exists in code — `PlatformCore`/`WorldComposition` remain exactly what `PLATFORM-ARCHITECTURE-PROPOSAL.md` already says they are: future direction, not current implementation.

**No forcing function. Continue deferring.**

## 6. Decision for each deferred system

| System | Decision | Evidence |
| --- | --- | --- |
| Phaser | Continue deferring | No perf problem, no authoring bottleneck, second map is placeholder |
| Tiled | Continue deferring | Same as Phaser — no real second map complexity yet |
| Playwright | Continue deferring | Not blocking; manual verification has resolved regressions so far without it |
| inkjs | Continue deferring | Dialogue is static; no approved branching quest design exists |
| Subject-pack extraction (`packs/<subject>/`) | Continue deferring | Only one real subject exists; Unit 2 is placeholder |
| PlatformCore / accounts / classrooms | Continue deferring | Zero account/classroom code; no real second user |
| WorldComposition / AI generation | Continue deferring | No second subject in development, no template system exists |

No system here rises even to "conduct a small proof of concept" — the evidence bar the task set wasn't met for any of them, and per its own instruction ("default to continued deferral when evidence is weak"), a POC would be manufacturing work rather than responding to a real signal.

## 7. Recommended next product milestone

**Expand real Unit 1 content — build out the next badge area (Atlantic or Hispaniola).** Case 1.01/Caribbean is currently the only fully playable case; Atlantic and Hispaniola are defined in `unitOneBadgeRecords()` but locked/future. This is where the game actually grows in player-facing value right now, and it's squarely product work rather than architecture work — no new engine capability is implied, it reuses the same field/hub/dialogue/collision systems Case 1.01 already exercises.

Separately-scoped, optional, trivial hygiene items surfaced by this review (not bundled into the content work, and not requiring their own phase):
- Confirm whether `moveInstitutePlayer` / `moveFieldPlayer` are truly dead code or a naming collision worth resolving, before the next time movement code is touched.
- Refresh `docs/development/UNIT-TESTING.md`'s test count and `CLAUDE.md`'s `main.js` line count.

## 8. Recommended next architecture milestone

**None.** No new architecture phase is scheduled coming out of this reassessment. One condition is worth watching *during* the recommended content work rather than pre-building for: if building out the next badge area's map turns out to require real terrain/collision complexity the current hand-coded-array approach can't reasonably handle, that observation is itself the Phaser/Tiled forcing function named in §5 — it should trigger picking this document back up, not a silent decision to start Phaser mid-content-work.

## 9. Systems that remain explicitly deferred

Phaser, Tiled, Playwright, inkjs, subject-pack extraction (`packs/<subject>/`), `PlatformCore`, `WorldComposition`, `QuestEngine` renderer/evaluation registries, `WorldRuntime`, the remaining 5 of 7 proposed repositories, accounts, classrooms, `TeacherWorld`/`PublicationVersion`/`ClassroomPublication`/full publish-versioning Teacher Mode, any database, and AI content generation.

## 10. Conditions that should trigger another reassessment

- A second real subject pack is approved and enters active development.
- A real teacher or second user needs an account.
- A real classroom pilot gets scheduled.
- New content work measurably hits a map- or collision-authoring wall the current hand-coded-array approach can't reasonably handle.
- Manual browser verification becomes repeatedly burdensome, or regressions recur across full workflows despite it.
- An approved quest design requires branching dialogue, dialogue variables, or rejoining story branches.
- `api/evaluate.js` gets wired to the frontend (would itself warrant revisiting the AI-grading boundary, separately from the systems above).

Revisit this document when one of these becomes real — not on a calendar schedule.
