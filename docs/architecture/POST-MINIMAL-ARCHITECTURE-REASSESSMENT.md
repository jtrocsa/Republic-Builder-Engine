# Post-Minimal-Architecture Reassessment

Status: complete. This is the "stop and reassess based on real usage" step named as the next phase in `ARCHITECTURE-QUICKREF.md` §6 after the minimal Author Mode persistence fix (Phase 6) — the last step of `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md`'s near-term sequence (§11 step 7 / §17 item 7). This is a review-and-planning document only: no application code, dependencies, or architecture were changed to produce it.

## 1. Completed phases

| Phase                                   | Summary                                                                                                                                       | Status   |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Documentation housekeeping              | Corrected stale `CLAUDE.md` claims, repaired 4 placeholder-stub docs, fixed decision-log numbering (duplicate `0006`, missing `0020`)         | Complete |
| Phase 2 — Vitest setup                  | Added Vitest + jsdom, exported 6 `main.js` functions for testing, added a boot guard, 24 initial tests                                        | Complete |
| Phase 3 — Zod content validation        | Added Zod, 6 schema files, `local-content-repository.js`, made `scripts/validate-content.js` real                                             | Complete |
| Phase 4 — local progress repository     | Added `local-progress-repository.js` thin wrapper around `chronicle-progress-store.js`, added `schemaVersion` + `migrateProgress()`           | Complete |
| Phase 5 — dead-code removal             | Deleted `apps/web/src/features/*` island, `chronicle-case-001.js`, the dormant JSON content pipeline, and the placeholder root `assets/` tree | Complete |
| Phase 6 — minimal Author Mode overrides | Created `local-teacher-override-store.js`, fixed the two broken content-edit fields, added display + reset UI                                 | Complete |

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

> **Update, 2026-07-10**: Forcing function found. While building the quest-type renderers (MCQ, evidence-organizing), no way existed to verify new UI actually renders or responds correctly — Vitest covers logic, not rendered output. Playwright + Chromium installed as a scoped agent-verification tool for confirming UI output during development, not as a full e2e suite and not as a CI gate. The broader "Playwright as a hard requirement" item remains deferred; only this narrow use is now active.

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

| System                                       | Decision                                                                    | Evidence                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Phaser                                       | Continue deferring                                                          | No perf problem, no authoring bottleneck, second map is placeholder |
| Tiled                                        | Continue deferring                                                          | Same as Phaser — no real second map complexity yet                  |
| Playwright                                   | Partially active — scoped to agent UI verification, full e2e still deferred | See 2026-07-10 update note in §5                                    |
| inkjs                                        | Continue deferring                                                          | Dialogue is static; no approved branching quest design exists       |
| Subject-pack extraction (`packs/<subject>/`) | Continue deferring                                                          | Only one real subject exists; Unit 2 is placeholder                 |
| PlatformCore / accounts / classrooms         | Continue deferring                                                          | Zero account/classroom code; no real second user                    |
| WorldComposition / AI generation             | Continue deferring                                                          | No second subject in development, no template system exists         |

No system here rises even to "conduct a small proof of concept" — the evidence bar the task set wasn't met for any of them, and per its own instruction ("default to continued deferral when evidence is weak"), a POC would be manufacturing work rather than responding to a real signal.

## 7. Recommended next product milestone

**Expand real Unit 1 content — build out the next badge area (Atlantic or Hispaniola).** Case 1.01/Caribbean is currently the only fully playable case; Atlantic and Hispaniola are defined in `unitOneBadgeRecords()` but locked/future. This is where the game actually grows in player-facing value right now, and it's squarely product work rather than architecture work — no new engine capability is implied, it reuses the same field/hub/dialogue/collision systems Case 1.01 already exercises.

Separately-scoped, optional, trivial hygiene items surfaced by this review (not bundled into the content work, and not requiring their own phase):

- Confirm whether `moveInstitutePlayer` / `moveFieldPlayer` are truly dead code or a naming collision worth resolving, before the next time movement code is touched.
- Refresh `docs/development/UNIT-TESTING.md`'s test count and `CLAUDE.md`'s `main.js` line count.

## 8. Recommended next architecture milestone

**None.** No new architecture phase is scheduled coming out of this reassessment. One condition is worth watching _during_ the recommended content work rather than pre-building for: if building out the next badge area's map turns out to require real terrain/collision complexity the current hand-coded-array approach can't reasonably handle, that observation is itself the Phaser/Tiled forcing function named in §5 — it should trigger picking this document back up, not a silent decision to start Phaser mid-content-work.

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

## 11. 2026-07-10 addendum: Riverbend Tiled tileset proof of concept

Owner-directed scoped POC (explicit override of §6/§9's continued-deferral verdict for Tiled, in the same vein as Phase 8's owner override — not a rediscovered forcing function under §10). Six commercially licensed itch.io tile packs had already been downloaded into `apps/web/src/assets/tilesets/`; the task was to inventory them and rebuild Unit 2's placeholder Riverbend map as a real `.tmj` file, on that one map only, without touching Unit 1, the movement/collision engine, or anything else.

**What was built:** `apps/web/src/content/maps/riverbend-field.tmj` (a real, hand-authored Tiled JSON map, two tile layers, three tilesets: `Medieval Fishing Village/tile-B-04.png`, `Medieval Fantasy Town/1.png`, `farm/3.png`), plus `apps/web/src/engine/tiled-map-loader.js` (a ~70-line generic orthogonal `.tmj` canvas compositor — no Tiled-authoring code, just a GID-to-source-rect blitter). `main.js`'s `riverbendWorldMarkup()` now renders a `<canvas>` instead of the old static `riverbend-field.png`, composited client-side on first visit to the Unit 2 field screen. `UNIT2_FIELD_BLOCKS`, `isRiverbendLand`, NPC data, patrols, and source points were **not touched** — verified via a scripted Playwright pass (no live Tiled application exists in this environment, so authoring was done by hand-deriving tile coordinates from pixel-cropped, labeled screenshots of the source sheets, then generating the `.tmj` with a throwaway Node script): the canvas renders real tile art (grass, river with a bridge crossing, two houses, a meetinghouse, tobacco field rows, a dock with boats and a lighthouse, wharf crates), player movement and river/bridge collision behave exactly as before (blocked at the riverbank except through the bridge band), and an NPC (`settlement-burgess`) opens its existing dialogue on click at the existing proximity gate. `npm run test` (108/108), `npm run lint` (same pre-existing 1 error/7 warnings, nothing new), `npm run build`, and `npm run validate:content` (17/17) all pass unchanged.

**Inventory (Part 1), condensed:** of the six requested packs, four (Medieval Fantasy Town / Fishing Village / harbor / Tavern) are 48px RPG-Maker-MV-convention sheets; Farm and Island survival are a different, coarser 96px icon-sheet style (a real tile-size mismatch, handled by anchoring the 96px farm tiles to a single cell of the 48px map grid per Tiled's own oversized-tile convention, not by resampling art). **No license, readme, or credits file exists anywhere in the downloaded asset tree for any of the six packs** — this needs to be manually confirmed against itch.io purchase records before any of this art ships; it wasn't determined here. Medieval Fishing Village was chosen as the settlement base (better scale match than Harbor's bigger port); Medieval Tavern was skipped per the task's own fallback rule (interior-only, no exterior shell); Island survival was skipped as a poor thematic fit (tropical, no real pier).

**Part 3 evaluation:**

- _Was authoring in Tiled meaningfully easier/faster than hand-coding a `FIELD_BLOCKS`-style array?_ Not in this pass — but the comparison isn't clean. No live Tiled application exists in this environment, so "authoring" here meant hand-deriving GIDs from cropped screenshots and writing a Node script to emit the JSON, which is strictly _more_ work than a hand-coded rectangle array (which needs no asset comprehension at all). A genuine early misread of one sheet (`tile-B-02.png` was assumed, from a full-thumbnail glance, to be a composed building/dock scene; a precise pixel crop later showed it's actually a loose crate/rope/icon sheet, and the real scene sheet was `tile-B-04.png`) cost a full rebuild cycle and was only caught by rendering and screenshotting the result, not by inspecting the source more carefully. That failure mode is specific to authoring blind; a human using Tiled's actual GUI — click a tile in a visible palette, see it placed immediately, use the built-in terrain/autotile brush these RPG-Maker-style sheets are designed for — would very plausibly not hit it. **This POC did not validate the thing it set out to validate**, because the tool under test was never actually used as a GUI.
- _Does the result look more consistent with a defined art direction than the current Unit 1 vs Unit 2 mismatch?_ Partially. The map now shows real, legible buildings/water/dock/field art instead of a flat placeholder PNG, which reads as more "finished." But it's a hand-glued composite of three visually distinct packs, has at least one visible rendering artifact (a faint blue color bleed around the tobacco crop tiles, not yet root-caused), and the grass/dirt-path fill uses single hand-picked "safe" cells rather than real terrain-blended edges — so it doesn't yet demonstrate a _solved_ art-direction problem, just that assembling something coherent-looking from these packs is possible.
- _Friction worth recording:_ (1) no Tiled GUI available to actually test the authoring workflow this POC exists to evaluate; (2) these packs are RPG-Maker-autotile-convention sheets meant for a terrain-brush tool, and hand-placing individual GIDs to fake flat fills produces visible seams; (3) the 48px/96px tile-size mismatch required a non-obvious Tiled convention (bottom-left-anchored oversized tiles) that had to be derived and debugged rather than looked up; (4) zero license documentation for any pack is a real ship-blocking gap, independent of the Tiled question; (5) on the positive side, the runtime side worked cleanly — the compositor is small and generic, and because Unit 2's field was already "one full-bleed background image inside a camera-transformed container," swapping the `<img>` for a `<canvas>` touched nothing else in `main.js`, confirming the engine-integration risk is low regardless of how maps get authored.

**Recommendation: inconclusive, need a second data point — specifically, one where an actual Tiled GUI is used.** This pass validates that the `.tmj` _runtime format and engine integration_ are low-risk and reusable (worth keeping in mind next time a real second map is needed), but it does not validate or refute Tiled's _authoring_ value, because the authoring here was done blind, by hand, without the tool this POC was supposed to be testing. §6/§9's continued-deferral verdict for Tiled stands; this addendum doesn't overturn it. If Tiled adoption is revisited, the next test should be a human (or an agent with actual GUI/MCP access to Tiled) doing the authoring, not another blind-JSON pass like this one.

### 2026-07-10, later same day: loader hardening + data points #2 and #3

Owner is hand-building a second map in the real Tiled desktop app (not by an agent) to produce
the "actual GUI" data point §11 called for. While that's in progress, the loader was hardened and
a third data point was produced for comparison.

**Loader hardening (`apps/web/src/engine/tiled-map-loader.js`):** audited against four cases the
owner already anticipated needing for a hand-built map:

- Empty/transparent cells (GID `0`) — already handled correctly (skipped, no placeholder drawn);
  no change needed, a regression test was added to lock it in.
- Animated tiles (`tileset.tiles[].animation`) — **was not read at all**; added generically (any
  tile with animation data animates, keyed by local tile id, no per-tile special-casing). A map
  with zero animated tiles takes the same single-static-draw path as before — no added
  per-frame redraw cost for Riverbend or any future non-animated map.
- External tileset image path resolution — **was not generic**: the previous implementation
  matched on a hardcoded `tileset.name → import` lookup table requiring a hand-written entry per
  image, and ignored the `.tmj`'s own `image` path entirely. Replaced with a path-tail matcher
  (matches on the portion of the path after `assets/tilesets/`, tolerant of any `../` nesting or
  authoring-machine path shape) fed by `import.meta.glob`, scoped per pack folder rather than one
  global glob (see next point for why).
- Multiple tilesets on one map — already handled correctly (GID-range lookup already worked for
  any tileset count); confirmed via a new test with two synthetic tilesets, no change needed.

**A real regression caught before it shipped:** the first version of the generic image resolver
used one unscoped `import.meta.glob("../assets/tilesets/**/*.png", { eager: true })` inside the
loader, so _any_ map's tileset would resolve with zero code changes anywhere. Building confirmed
this bundled **every** file under `assets/tilesets/` into every production build — 117MB across
85 PNGs, most belonging to packs not referenced by any real map — versus ~22MB for only the packs
Riverbend actually uses. Fixed by scoping the glob to specific pack folders at the call site
(`createTilesetImageResolver(...)` takes one or more glob results); a genuinely new pack folder
now needs one glob line added in `main.js`, but an already-referenced folder, or a new image
inside one, needs none. This is documented as the tradeoff it is in
`docs/architecture/tiled-map-import-checklist.md` §2, not silently accepted.

New export: `docs/architecture/tiled-map-import-checklist.md` — map settings (orthogonal, CSV
tile layers, 40×24 @ 48px, no flip flags), the tileset-image folder convention above, and what to
report back after an export.

**Data point #2 — pending, owner hand-authoring in Tiled GUI.** No new folder was needed:
`apps/web/src/content/maps/` (where `riverbend-field.tmj` already lives) is the existing,
documented drop location. Nothing to add here until the file arrives.

**Data point #3 — machine-authored rebuild of the Unit 1 Caribbean map.** Built
`apps/web/src/content/maps/caribbean-field.tmj` (40×24 @ 48px, matching `FIELD_GRID`), replicating
the layout of the existing hand-coded `FIELD_BLOCKS`/`isCaribbeanLand`/`FIELD_NPCS` (ship + cove
west, garden + three "bohios" north, canoe + camp east, water margin south, all at the same
world-grid coordinates) using the Medieval Harbor pack (`tile-B-03.png` for
water/coastline/dock/boats/props, `tile-B-05.png` for buildings), plus the already-bundled
Fantasy Town grass tile and farm-pack corn tile reused from Riverbend. Rendered via the same
`renderTiledMap`/`createTilesetImageResolver` used for Riverbend, behind a standalone, unwired dev
page (`apps/web/tiled-preview.html`) — not linked from the game, not part of `npm run build`
(confirmed absent from `dist/` after a build). The live Unit 1 renderer (`caribbeanWorldMarkup()`,
`FIELD_BLOCKS`, `isCaribbeanLand`) was **not touched**.

**A real regression this pass caught before shipping (documented above too, repeated here for the
data-point record):** the first version of the generic tileset-image resolver used one unscoped,
eager `import.meta.glob` over the whole `assets/tilesets/` tree — building confirmed this bundled
117MB across 85 PNGs (every downloaded pack, used or not) into every production build. Fixed by
scoping the glob per pack folder at the call site; production build size returned to ~22-26MB.
This was caught by actually running `npm run build` and inspecting `dist/`, not by reading the
code — the same "render/build it and look" discipline the POC's own report named as the fix for
its one authoring mistake.

**Two more mistakes this pass caught the same way — by rendering and zooming in, not by reading
the labeled sheet:** (1) the tile picked for the "canoe" was actually a dock-plank tile; the real
round top-down boat hull was one row up in the same sheet. (2) The tile picked for a garden
crop-row, copied from `riverbend-field.tmj`'s own declared farm-pack tile size (96px, 8 columns),
turned out to be wrong — pixel inspection showed `farm/3.png` is actually a regular 48px/16-column
grid, and the specific cell Riverbend uses straddles two unrelated sprites (corn and a scarecrow)
at that assumed boundary. Riverbend's own tile happens to render tolerably by luck; this rebuild
uses the corrected 48px grid instead of propagating the same imprecision into new content. Neither
mistake was visible from the labeled contact-sheet screenshots alone — both only showed up once
the actual composited frame was rendered and inspected at zoom, reinforcing that verifying Tiled
work means looking at the rendered result, not just the source sheet.

**Composition fidelity and honest pack-fit gaps:**

- Ship, cove, dock, coastline, crates, and the market-awning-as-tent all read reasonably close to
  the original's relative placement and scale.
- **Medieval Harbor has no vegetation of any kind** (no palm, tree, or shrub tile) — the four palm
  clusters in the original map have no equivalent art here and are left as bare grass. This is a
  real gap for a tropical scene, not a rendering limitation.
- **No hut/tropical-architecture tiles exist in this pack** — the three "bohio" Taino homes are
  stood in with small European stone/timber cottages from `tile-B-05.png`. Thematically wrong, not
  a subtle judgment call; flagged so it isn't mistaken for a real option if this ever gets wired
  in.
- **No campfire/fire-pit tile exists** — left unrepresented (bare grass) rather than faked.
- **No flat grass/sand base-terrain tile exists anywhere in the Harbor pack** — it's an
  overlay/prop pack meant to sit on a separate base-terrain sheet, which wasn't part of the six
  inventoried packs. Interior land fill reuses the already-bundled Fantasy Town grass tile instead.
- **Coastline only has one edge orientation** (sand-above/water-below within a single tile) — with
  no tile flip/rotate support in the loader (an explicit, documented scope boundary, not an
  oversight), only the map's south edge got a proper sand/wave transition; other edges are a hard
  grass/water cut. Rotation support wasn't in scope for this pass.

Net: this data point shows the `.tmj` pipeline itself (loader, resolver, animation support,
multi-tileset handling) is solid and reusable — the friction was entirely in picking correct tile
coordinates from a real-world, imperfectly-gridded asset pack, which is exactly the kind of
mistake a human using Tiled's live-preview GUI (data point #2) would likely not make, since they'd
see the tile land in the wrong place immediately rather than only in a rendered screenshot.
