# Dead Code Removal — Phase 5

Status: complete. Executed on branch `platform-architecture-refactor`, following `docs/architecture/ARCHITECTURE-QUICKREF.md` §5/§6 and the deletion list in `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` §9/§11 step 5.

## Method

For every candidate: searched static imports, dynamic imports, string-based paths, build scripts (`vite.config.js`, `eslint.config.js`, `package.json`), tests (`tests/unit/*`), documentation, and asset references across the whole repository — not just the paths the original audit named, since the audit is a point-in-time snapshot and three architecture phases (Phases 2–4: Vitest, Zod, the progress repository) have landed since it was written. Only candidates with zero live callers after this re-check were deleted. Two additional files not in the original candidate list (`apps/web/src/content/cases/case-atlantic-crossroads.preview.js` and `apps/web/src/engine/content/author-content-store.js`) were pulled in because they were sole dependencies of the `features/` island named in the audit — deleting the island without them would have left orphaned code with the exact same zero-caller profile.

## Candidates

### `apps/web/src/features/*` (orphaned island: `chronicle-institute.js`, `chronicle-identity.js`, `atlantic-crossroads-preview.js`, plus empty `assessment/`, `codex/`, `character-creation/` `.gitkeep` folders)

- **Verification**: grepped the full repo for `features/chronicle-institute`, `features/chronicle-identity`, `features/case-player`, and any `from ".../features` import pattern. Confirmed `main.js`'s actual import list (`main.js:1-28`, re-read directly) does not reference `apps/web/src/features/` anywhere. Only hits were in documentation (audit/review docs, two historical milestone docs, `SKILL.md`) describing it as dead.
- **Result**: no live caller. Matches the audit's finding exactly; nothing changed in the repo tree since the audit that would revive it.
- **Deleted**: yes — entire `apps/web/src/features/` directory (6 real files + 5 `.gitkeep`-only folders).
- **Reference cleanup**: updated `README.md` (removed "Feature-level UI" row), `docs/content-guide/naming-and-placement.md`, `.claude/skills/chronicle-institute-conventions/SKILL.md` (repository-structure diagram and dead-code bullets), `docs/architecture/ARCHITECTURE-QUICKREF.md`. Left `docs/architecture/milestone-02-1-field-movement-and-art-polish.md`, `docs/architecture/milestone-02-chronicle-identity-and-field-entry.md`, and the four long architecture audit/review/proposal documents untouched — they are historical, point-in-time records of what was built/analyzed at the time, not living references a reader would follow to find current code.
- **Discrepancy from audit**: none.

### `apps/web/src/content/chronicle-case-001.js`

- **Verification**: grepped for `chronicle-case-001` repo-wide. Only hit outside documentation was the file itself; nothing imports it.
- **Result**: no live caller.
- **Deleted**: yes.
- **Reference cleanup**: updated `docs/content-guide/naming-and-placement.md` and `docs/content/CONTENT-VALIDATION.md` (marked its "not validated because dead" note as historical — file is now gone, not just unvalidated) and `SKILL.md`.
- **Discrepancy from audit**: none.

### `apps/web/src/content/cases/case-atlantic-crossroads.preview.js` _(not in the original candidate list — added after re-verification)_

- **Verification**: grepped for `case-atlantic-crossroads.preview`. Its only importer was `apps/web/src/features/case-player/atlantic-crossroads-preview.js`, itself part of the orphaned island above.
- **Result**: sole caller was dead code being deleted in this same pass; zero live callers.
- **Deleted**: yes (as part of removing the `features/` island's dependency chain).
- **Discrepancy from audit**: the audit already named this file as dead (`CURRENT-REPOSITORY-AUDIT.md` §2, §20) but the user's candidate list for this pass didn't repeat it explicitly. Included it anyway per the task's "any other import-graph-confirmed-unreachable code named in the audit" scope — leaving it in place would have meant deleting the `features/` island while leaving one of its two dependencies orphaned in the tree.

### `apps/web/src/engine/content/author-content-store.js` _(not in the original candidate list — added after re-verification)_

- **Verification**: grepped for `author-content-store`. Its only two importers were `features/chronicle-institute/chronicle-institute.js` and `features/chronicle-identity/chronicle-identity.js`, both part of the orphaned island above.
- **Result**: sole callers were dead code being deleted in this same pass; zero live callers.
- **Deleted**: yes, same reasoning as the preview-case file above.
- **Discrepancy from audit**: same as above — named as dead in the audit (`CURRENT-REPOSITORY-AUDIT.md` §11, §16, §20) but not repeated in the user's explicit candidate list; included to avoid leaving an orphaned half of the `features/` island's dependency chain.

### `apps/web/src/engine/player/player-profile-store.js`

- **Verification**: grepped for `player-profile-store`. Only importer was `features/chronicle-identity/chronicle-identity.js`, part of the orphaned island.
- **Result**: no live caller.
- **Deleted**: yes.
- **Reference cleanup**: updated `SKILL.md`'s dead-code bullet and structure diagram. Added a historical note to `docs/decision-log/0005-chronicle-identity-and-first-field-entry.md`, whose "Consequences" section instructed future work to preserve this file's "public contract" — that guidance is now stale since the file was never actually live; the note clarifies the real identity-persistence contract is `chronicle-progress-store.js`'s `profile.name`/`profile.appearance` fields. Did not edit the milestone doc that also names this file (`milestone-02-chronicle-identity-and-field-entry.md`) — historical record of what was designed at the time, not a living reference.
- **Discrepancy from audit**: none.

### `content/campaigns/`

- **Verification**: grepped for `content/campaigns` repo-wide and confirmed via `Glob` that `apps/web/src` contains no reference to this path. Confirmed file contents (`campaign.json`, `unit.json`, `case.json`, `activities/*.json`, `assessments/*.json`) all self-declare placeholder/vertical-slice status per the audit.
- **Result**: no live caller; dormant, fourth incompatible content schema as documented.
- **Deleted**: yes.
- **Reference cleanup**: updated `README.md`'s canonical-homes table, `docs/content-guide/naming-and-placement.md`.
- **Discrepancy from audit**: none.

### `content/library/`

- **Verification**: same grep/glob pass as `content/campaigns/` above; confirmed contents are template/skeleton records only (`source-record.template.json`, `npc-record.template.json`, `location-record.template.json`, a `README.md`).
- **Result**: no live caller.
- **Deleted**: yes.
- **Reference cleanup**: same as `content/campaigns/` above.
- **Discrepancy from audit**: none.

### Root `assets/` (repo root, `.gitkeep`-only placeholder tree)

- **Verification**: `Glob` confirmed all 8 entries under root `assets/` were `.gitkeep` files (`shared/{ui,icons,audio,characters}/.gitkeep`, `campaigns/chronicle/{maps,portraits,illustrations,documents}/.gitkeep`) — zero real asset files. Grepped for any reference to this path from `apps/web/src` or build config; confirmed all 62 real asset files (61 PNG + 1 JPG) live under `apps/web/src/assets/` and are referenced from there via `new URL(..., import.meta.url)` in `main.js`.
- **Result**: no live caller, contains no real content.
- **Deleted**: yes.
- **Reference cleanup**: updated `README.md`'s canonical-homes table (`assets/` row now points at `apps/web/src/assets/`).
- **Discrepancy from audit**: none.

## Not deleted

Nothing on the candidate list survived re-verification as "no longer dead" — every candidate's zero-caller status held. `apps/web/src/engine/chronicle-progress-store.js`, `apps/web/src/repositories/*`, `apps/web/src/content/schemas/*`, `apps/web/src/content/unit-01-campaign.js`, `apps/web/src/content/unit-02-campaign.js`, `apps/web/src/content/chronicle-opening.defaults.js`, and `apps/web/src/content/chronicle-identity.defaults.js` were all confirmed live (imported by `main.js` or by `scripts/validate-content.js`) and preserved untouched.

## Post-deletion verification

- `npm run test` — 62/62 tests pass (unchanged from baseline; none of the deleted code was under test).
- `npm run validate:content` — 17/17 groups pass, 0 errors (unchanged from baseline; validation never covered the deleted dormant/dead content).
- `npm run build` — succeeds, same asset/module output shape as baseline.
- `npm run lint` — same 1 pre-existing error (`main.js:2069`, unrelated to this pass, not touched) and warnings, minus the warnings that were coming from the now-deleted `features/` files (`atlantic-crossroads-preview.js:125,192`, `chronicle-identity.js:18,362`).
- Repository-wide grep for every deleted path/filename after cleanup: zero hits outside historical audit/review/proposal/milestone documents (left as point-in-time records per `CLAUDE.md`'s "don't delete historical architecture documents" rule) and this document.
- Manual browser check (`npm run dev`): main menu loads; "Continue"/new game flow reaches the Institute Archive hub; field screen loads and renders NPCs/collision; "reset" quest-reset action clears state and returns to main menu; existing `localStorage` save under `republic-builder.chronicle.unit-01.v2` still restores progress on reload; Unit 1 Case 1.01 content (sources, exchange ledger, review) still loads and plays.

## Documentation updated

- `README.md` — canonical-homes table corrected to remove deleted paths.
- `docs/content-guide/naming-and-placement.md` — "folders that exist but aren't where content should go" section rewritten as "folders that no longer exist."
- `docs/content/CONTENT-VALIDATION.md` — marked the chronicle-case-001.js/content-campaigns exclusion note as historical (files are gone, not just unvalidated).
- `docs/decision-log/0005-chronicle-identity-and-first-field-entry.md` — added a historical note superseding stale forward-looking guidance about `player-profile-store.js`.
- `.claude/skills/chronicle-institute-conventions/SKILL.md` — repository-structure diagram and dead-code bullets updated to match the current tree.
- `docs/architecture/ARCHITECTURE-QUICKREF.md` — Phase 5 marked complete under §4/§5; §6 now names the minimal Author Mode persistence fix as the next phase.

Not updated (deliberately): `docs/architecture/CURRENT-REPOSITORY-AUDIT.md`, `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md`, `docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md`, `docs/architecture/THIRD-PARTY-TOOLING-AUDIT.md`, `docs/architecture/repository-map.md`, and the `docs/architecture/milestone-*.md` files that reference deleted paths — these are dated, point-in-time analysis/decision records, not living references; per `CLAUDE.md`, historical architecture documents aren't deleted or rewritten merely because implementation moved on.
