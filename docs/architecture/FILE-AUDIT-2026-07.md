# File Audit — 2026-07

Status: current-state inspection, verified against live repo commands run today (`npm run
test`, `npm run build`, `npm run validate:content`, `wc -l`, `grep`), not against prior
documentation claims. Point-in-time record — like the other audit/reassessment docs in this
folder, don't treat it as a living reference; re-run the checks below if it's been a while.

**Method note on how this audit was produced**, since it's directly relevant to future passes:
three Haiku-model agents ran the mechanical scans in parallel (line counts, doc-claim
cross-checks, dead-export search), then every claim that mattered for a recommendation was
independently re-verified with direct commands before being written down here. Two of the three
Haiku outputs contained real errors: one mistranscribed part of `main.js`'s import list
(dropped two real imports, invented one that doesn't exist), and both disagreed with each other
on the asset file count (62 vs. 148) and gave an incorrect "used" verdict on
`moveInstitutePlayer`/`moveFieldPlayer` by conflating "the name appears elsewhere in the file"
with "something outside the function actually calls it." Haiku fan-out is worth it for bulk
mechanical measurement, but nothing it reports should go into a document or a decision without
a stronger-model spot-check first — that discipline is what this report followed.

## 1. Executive summary

The codebase is not bloated relative to what it does — `main.js` (3,328 lines) and `global.css`
(7,036 lines) are the two real size outliers, and a prior architecture phase already did the
modularization that matters (`repositories/`, `quest-types/`, `engine/`, Zod schemas, 179
passing tests). The actual problems found are narrower: `CLAUDE.md` and
`ARCHITECTURE-QUICKREF.md` are meaningfully stale on several verifiable numbers, `main.js` has
one large (~860-line) block of unnamed inline event-listener code, `global.css` has never been
split despite being the single largest source file in the repo, and two small pieces of
confirmed-dead code sit in `main.js`. None of this blocks adding Unit 3+ content — the content
layer (`content/`, `quest-types/`) is already in good shape for that per
`NEXT-UNITS-ROADMAP.md`.

## 2. Current file-size table

| Area                             | Lines                 | Notes                                                                                                                            |
| -------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/main.js`           | 3,328                 | Single largest source (non-CSS) file                                                                                             |
| `apps/web/src/styles/global.css` | 7,036                 | Largest source file in the repo, period — larger than `main.js`                                                                  |
| `apps/web/src/content/` (all JS) | 1,618                 | `unit-01-campaign.js` 370, `unit-02-campaign.js` 416, `quests/unit-01-quests.js` 225, 6 schema files ~434, 2 defaults files ~173 |
| `apps/web/src/quest-types/`      | 676                   | `index.js` + generic/history quest renderers                                                                                     |
| `apps/web/src/engine/`           | 254                   | `tiled-map-loader.js` 177, `chronicle-progress-store.js` 77                                                                      |
| `apps/web/src/repositories/`     | 185                   | 3 thin-wrapper files                                                                                                             |
| `apps/web/src/mini-games/`       | 248                   | `cargo-sorting.js`, `storm-navigation.js` — built + tested, **not wired into `main.js`** (known, per `NEXT-UNITS-ROADMAP.md` §6) |
| `tests/unit/`                    | 2,038 across 15 files | 179 tests, all passing (`npm run test`, verified today)                                                                          |
| Assets (`apps/web/src/assets/`)  | 148 files             | `CLAUDE.md`'s "62 real files" is stale — verified via `find`, count more than doubled                                            |

Build facts (verified today via `npm run build`): 130 modules transformed, JS bundle 294.93 KB
(gzip 102.57 KB), CSS bundle 114.79 KB (gzip 24.98 KB). Content validation
(`npm run validate:content`): 21/21 groups pass, 0 errors.

## 3. Confirmed doc-staleness

| Doc claim                                                 | Says                                                              | Actual                                                                                                                                                                                                                                                                                   | Verified via                                                |
| --------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `CLAUDE.md` main.js line count                            | "~2,991 lines"                                                    | 3,328                                                                                                                                                                                                                                                                                    | `wc -l`                                                     |
| `CLAUDE.md` "main.js only imports..." list                | 4 sources: styles, unit-01/02 campaigns, defaults, progress store | Also imports from `repositories/local-progress-repository.js`, `repositories/local-teacher-override-store.js`, `quest-types/index.js`, `quest-types/history/evidence-organizing-quest.js`, `content/quests/unit-01-quests.js`, `engine/tiled-map-loader.js`, plus two `.tmj` raw imports | Direct `grep -n "^import" apps/web/src/main.js`             |
| `CLAUDE.md` asset count                                   | "62 real files"                                                   | 148 files                                                                                                                                                                                                                                                                                | `find apps/web/src/assets -type f \| wc -l`                 |
| `CLAUDE.md` `VALID_SCREENS` example list                  | 8 screens named                                                   | 25 screens actually defined (missing e.g. `practice-check`, all 5 `intro-*` screens, `triangle`, `regions`)                                                                                                                                                                              | Direct read of `main.js:929-955`                            |
| `CLAUDE.md` orphaned `apps/web/src/features/` description | Described as present (deleted `.gitkeep` island)                  | Directory doesn't exist — already deleted in an earlier dead-code-removal phase                                                                                                                                                                                                          | `find`/`ls`                                                 |
| `ARCHITECTURE-QUICKREF.md` Phase 7 test/build snapshot    | 81 tests/8 files, 90 modules, 17/17 content groups                | 179 tests/15 files, 130 modules, 21/21 content groups                                                                                                                                                                                                                                    | `npm run test`, `npm run build`, `npm run validate:content` |
| `docs/development/UNIT-TESTING.md`                        | Matches 179 tests / 15 files                                      | Matches current reality                                                                                                                                                                                                                                                                  | Already accurate — no fix needed                            |

`ARCHITECTURE-QUICKREF.md`'s Phase 9 entry (179/179, 15 files) is itself already correct and
current — only the older Phase 7 snapshot and the `CLAUDE.md` claims above are stale. This is a
narrower gap than it might look: most of the drift is `CLAUDE.md` not being touched since an
earlier phase, not a systemic problem across all docs.

## 4. `main.js` hotspot map

Rough responsibility clusters (line ranges approximate, boundaries are the top-level function
declarations):

| Lines         | Cluster                                                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 71–402        | Tiled map rendering (Riverbend/Caribbean)                                                                                                                                                              |
| 402–978       | Field NPC runtime & movement/collision                                                                                                                                                                 |
| 978–1240      | Procedural Web Audio (music + SFX)                                                                                                                                                                     |
| 1212–1568     | Data lookups, screen renderers: intro/onboarding flow                                                                                                                                                  |
| 1385–1568     | Institute hub player movement/collision                                                                                                                                                                |
| 1560–1819     | Hub/archive/travel screen renderers, field (world map) player movement/collision                                                                                                                       |
| 1819–2271     | Field interaction/UI, per-case quest/activity screen renderers                                                                                                                                         |
| 2271–2402     | `render()` — main screen dispatcher (single ~131-line function)                                                                                                                                        |
| 2402–2470     | Progress mutation helpers                                                                                                                                                                              |
| **2470–3328** | **One large inline `if (app) {...}` block wiring every DOM event listener (mousedown/click/keydown/keyup/blur) — ~858 lines, over a quarter of the file, with no named function boundaries inside it** |

The 2470–3328 block is the single clearest "this is why the file feels big" finding — not
because the logic is wrong, but because there's no way to jump to "the click handler" or "the
keydown handler" by name; it's all one anonymous mass.

## 5. Test-coverage gap

Only 3 of 15 test files exercise `main.js` directly: `main-collision.test.js` (62 lines),
`main-badges-quests.test.js` (58 lines), `main-teacher-overrides.test.js` (28 lines) — 148 lines
of test code against a 3,328-line file. The other 12 test files cover `quest-types/`,
`repositories/`, `engine/`, `mini-games/`, and content schemas, which is exactly right for
those layers — the gap is specific to `main.js`'s own logic (movement/collision math, badge
unlocks, screen dispatch), most of which is not `export`ed and so can't be unit-tested without
first exporting it (per the repo's own sanctioned "export in place" pattern).

## 6. Confirmed dead code

- **`EMPIRE_CONNECTIONS`** (`main.js:8`) — imported, never referenced again anywhere in the file.
- **`isGarden`** (`main.js:1964`, inside `villageSceneMarkup()`) — assigned, never read.
- **`moveInstitutePlayer`** (`main.js:1512`) and **`moveFieldPlayer`** (`main.js:1789`) — each
  calls only itself recursively (`1512→1536`, `1789→1814`); nothing outside either function ever
  triggers the first call. Genuinely unreachable, not merely low-usage. This matches what
  `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` flagged as "worth a direct check before anyone
  next touches movement code" — that check is now done: they're dead.

## 7. Prioritized punch list

| #   | Item                                                                                                                             | Risk                  | Status vs. binding architecture docs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Fix the confirmed-stale numbers in §3 (`CLAUDE.md`, `ARCHITECTURE-QUICKREF.md`)                                                  | Zero-risk             | Doc-only, no code change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2   | Remove `EMPIRE_CONNECTIONS` import, `isGarden` variable, `moveInstitutePlayer`, `moveFieldPlayer`                                | Zero/low-risk         | Pure dead-code deletion, not "extraction" — compliant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 3   | Split `global.css` into per-screen files                                                                                         | **Deferred — see §8** | Turned out higher-risk than initially assessed; not executed this pass                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 4   | Decompose `main.js`'s 2470–3328 event-listener block into named, `export`-in-place handler functions                             | Medium-risk           | **Done** for `handleAppClick`/`handleAppMousedown` (split into 7 named group functions, dispatched via a thin loop) — see `ARCHITECTURE-QUICKREF.md`'s phase log. `handleAppChange`/`handleAppInput` and the four drag-drop handlers were assessed in the same pass and left as-is (already reasonably factored, not the flagged hotspot). The same pass also physically extracted the self-contained, zero-DOM-coupling Web Audio engine and pure geometry helpers into `engine/audio-engine.js`/`engine/geometry.js` — a narrow, deliberate exception to the no-physical-extraction policy, scoped to code the policy's own reasoning (DOM/camera/movement coupling) never covered; see the phase-log entry for the full rationale. |
| 5   | (Flagged, not scoped into this pass) Backfill `main.js` test coverage for movement/collision/badge logic as more units are added | N/A — future work     | Matches `test-writer` agent's existing scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 6   | (Flagged, not scoped into this pass) Wire `mini-games/` into a real unit's pacing beat                                           | N/A — future work     | Already named in `NEXT-UNITS-ROADMAP.md` §6, not this audit's job to re-scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## 8. `global.css` split — deferred, higher-risk than initially assessed

Item 3 above was originally scoped as a low-risk pure file-split, based on
`CURRENT-REPOSITORY-AUDIT.md`'s (stale) characterization of `global.css` as "one screen-block
per screen." Direct inspection before starting the split found that's wrong: the file is
organized **chronologically by milestone/hotfix patch**, not by screen. The same top-level
selectors are re-declared repeatedly across scattered sections relying on CSS cascade order
(later source position wins for equal specificity) to produce the final look — e.g.
`.case-field-player` appears as a fresh top-level selector 8 separate times across the file,
`.field-npc` 7 times, `.field-viewport` and `.caribbean-world` 6 times each (verified via
`grep -oE` for top-level selector declarations, sorted by frequency).

A thematic per-screen split — the kind that actually delivers "find the field CSS fast" — would
require regrouping these scattered declarations by screen while exactly preserving their
relative source order for every repeated selector, both within and across the new files. Get
this wrong for even one selector and the result is a silent visual regression that a spot-check
of a few representative screens would very plausibly miss, since the risk is specifically in
subtle override interactions from older milestone-era patches. This is a bigger, more careful
piece of work than a file-split — closer to needing computed-style diffing across all ~25
screens and their sub-states than a quick reorg.

**Decision: not executed in this pass.** If picked up later, treat it as its own scoped task
with real before/after visual verification across all screens, not a quick mechanical split.

## 9. Explicitly out of scope for this and any near-term pass

Per `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` (binding per `ARCHITECTURE-QUICKREF.md` §3/§8),
still true after this audit:

- No `packs/<subject>/` extraction or subject-pack folder split — only one real subject exists.
- No physical extraction of movement/collision/camera/NPC code out of `main.js` into separate
  files — only `export` in place, only physically move if/when a Phaser adapter replaces it.
- No new empty future-architecture folders.
- No Phaser/Tiled-authoring-pipeline/full-Playwright-e2e/inkjs adoption without a forcing
  function per `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §10.

Nothing found in this audit rises to a forcing function for any of the above — file size alone
isn't one; the deferral conditions are unchanged.
