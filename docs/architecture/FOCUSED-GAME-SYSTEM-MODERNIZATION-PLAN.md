# Focused Game System Modernization Plan

**Status:** planning document, not yet implemented. No source code, dependency, or asset has been changed as part of writing this plan. Line references verified against the repo as of 2026-07-23 (`apps/web/src/main.js` is 7999 lines).

**Reuse policy:** [`docs/architecture/OPEN-SOURCE-REUSE-DECISIONS.md`](OPEN-SOURCE-REUSE-DECISIONS.md) is binding for every reuse-vs-build decision in this plan — where the two disagree, that document wins. Workstream 2 below was revised against it (see the "Reuse policy revision" callout in that section) after an earlier version of this plan rejected pathfinding libraries without the evidence the owner's reuse policy now requires.

## Why this plan exists

`docs/architecture/CURRENT-GAME-ENGINE-AUDIT.md` established that Chronicle has no game engine, animation library, pathfinding library, or physics library anywhere. Movement, sprite "animation" (whole-PNG swap plus CSS bob), collision (hand-coded rectangle/ellipse arrays), and NPC patrol (scripted waypoints that abandon a leg when blocked) are all hand-rolled directly in `apps/web/src/main.js` and a thin `apps/web/src/engine/` folder. The audit's conclusion — consistent with this repo's binding scope document, `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` — was "improve in place, don't migrate": no forcing function for a full engine migration currently exists.

This plan acts on that conclusion. It is deliberately **not** a Phaser/PixiJS/Excalibur migration plan. It is five focused workstreams that improve movement, animation, collision data, NPC routing, and asset size within the existing DOM/CSS + Canvas2D-for-tile-art architecture, plus one section (Workstream 5) that defines objectively when a future engine evaluation would become worth doing.

Three companion docs hold full design detail for the workstreams that involve the most new surface area. This document is the entry point: it summarizes all five workstreams, gives full detail for the two that don't have a dedicated doc (NPC pathfinding, engine-migration decision gate), and carries every cross-cutting section (order, files, untouched systems, rollback, testing, risks, acceptance criteria, estimates, first task).

| Workstream | Detail lives in |
|---|---|
| 1. Character animation system | [`docs/art/CHARACTER-SPRITESHEET-STANDARD.md`](../art/CHARACTER-SPRITESHEET-STANDARD.md) |
| 2. NPC movement and pathfinding | This document, below |
| 3. Tiled as the source of truth | [`docs/architecture/TILED-RUNTIME-DATA-PLAN.md`](TILED-RUNTIME-DATA-PLAN.md) |
| 4. Asset optimization pipeline | [`docs/architecture/ASSET-PIPELINE-PLAN.md`](ASSET-PIPELINE-PLAN.md) |
| 5. Engine migration decision gate | This document, below |

---

## Workstream 1 summary — character animation system

New reusable module `apps/web/src/engine/sprite-animation.js`, replacing whole-PNG `.src` swapping (`fieldSpriteUrl()` at `main.js:5125-5131`, and the analogous NPC crossfade code in `updateFieldNpcs()` at `main.js:748-749`/`792-793` and `updateInstituteNpcs()` at `main.js:1356-1420`) with a spritesheet-driven CSS `background-position` stepping animation. Ships against a composited first-generation 2-pose sheet built from *existing* art via a new Sharp script — no new art generation is required to land this workstream. Full spritesheet convention, frame-order convention, directory structure, and animation-profile data structure are in `docs/art/CHARACTER-SPRITESHEET-STANDARD.md`.

## Workstream 2 — NPC movement and pathfinding

### Current behavior (verified)

Each field map has a hard-coded patrol table — `FIELD_NPC_PATROLS` (`main.js:625-662`, Caribbean/case-001, 6 NPCs × 4 waypoints), `UNIT2_FIELD_NPC_PATROLS` (`main.js:915-952`, Riverbend/case-004), `UNIT3_FIELD_NPC_PATROLS` (`main.js:1048-1085`, Common Cause), and the hub's `HUB_NPC_PATROLS` (`main.js:1299-1318`). `updateFieldNpcs()` (`main.js:733-798`, driven by `setInterval(updateFieldNpcs, 80)` at `main.js:799`) advances each NPC in a straight line toward its next waypoint. `isFieldNpcBlocked()` (`main.js:720-732`) reuses the same `rectsOverlap`/land-mask primitives the player uses. **When a step would collide, the NPC abandons the current leg and advances to the next scripted point** — there is no route-around-the-obstacle behavior. Per-NPC speed/timing offsets (seeded from array index) already prevent lockstep movement; this is preserved, not something this workstream needs to fix.

### Reuse policy revision (2026-07-23)

An earlier version of this section rejected three pathfinding libraries in a three-row table and recommended hand-rolling A* on the reasoning that it's "roughly 80–120 lines" — the project owner's binding reuse policy ([`OPEN-SOURCE-REUSE-DECISIONS.md`](OPEN-SOURCE-REUSE-DECISIONS.md)) explicitly calls that justification insufficient on its own. This section was redone against that policy: six real candidates were investigated with cited evidence (npm registry, GitHub, Bundlephobia, current as of 2026-07-23), not three asserted-and-dismissed ones. Full detail lives in `OPEN-SOURCE-REUSE-DECISIONS.md` §2 — this section carries the resulting table and recommendation.

### Package comparison

| Package | License | Version / activity | Module format | Grid-native | Weighted terrain | Diagonal + corner-cut | Verdict |
|---|---|---|---|---|---|---|---|
| `pathfinding` (PathFinding.js) | MIT | 0.4.18, npm-stale since 2016 (repo touched 2024, no release) | CJS/browser-script only | Yes | Partial — general weighting sits in an **unmerged PR** ([#151](https://github.com/qiao/PathFinding.js/pull/151/files)) | Yes | Rejected — the exact feature Chronicle needs isn't in the shipped version |
| `easystarjs` (EasyStar.js) | MIT | 0.4.4, npm-stale since 2020, [Snyk-flagged "likely discontinued"](https://snyk.io/advisor/npm-package/easystarjs) | CJS only | Yes | Yes | Yes | Rejected — stale, and its async-callback-only API is a poor fit for a synchronous per-tick patrol check |
| `ngraph.path` (+ `ngraph.grid`) | MIT | 1.6.1, published 2025-11-18, actively maintained | Real dual ESM/CJS | **No** — generic graph engine, grid must be hand-built as nodes/links | Via custom `distance()` | Must be hand-wired | Rejected — the wrong shape; the grid-construction adapter it needs is comparable in size to a purpose-built grid A*, failing the "adapter must be smaller" test |
| `astar-typescript` | MIT | 1.2.7, stale 3+ years | CJS only | Yes | Yes, weighted-grid mode | Yes | Rejected — unmaintained |
| `fast-astar` | MIT | 2.0.2, published 2026-02-19 — days old at research time | ESM, ships a WASM binary | Yes | Not documented | Yes | Rejected — too immature (single-maintainer, days-old), and the WASM asset complicates the Vite build for an undocumented feature |
| `@evilkiwi/astar` *(noted for completeness)* | **GPL-3.0** | Active | TS/ESM | Yes | Yes | Yes | **Disqualified outright** — copyleft license, wrong for a non-GPL commercial-education product |

### Recommendation: hand-rolled internal A*, using `tinyqueue` for the priority queue — pending owner sign-off

New file `apps/web/src/engine/npc-pathfinding.js`. Against the owner's approval criteria: **six candidates were investigated** (five real, one license-disqualified), each **rejected with cited evidence** above; the custom implementation is **smaller than the adapter `ngraph.path` would need** (building and maintaining a parallel graph representation from the tile grid, by hand-wiring diagonal adjacency and rebuilding on obstacle changes, is comparable in size to a purpose-built grid A*); **unit tests are required** or the workstream (see the testing-strategy section below); and this remains **pending explicit project-owner sign-off** before implementation, tracked in `OPEN-SOURCE-REUSE-DECISIONS.md` §8. Adding any of the rejected libraries would also be the first new *runtime* dependency this repo has added since the "Vitest and Zod are the only approved immediate major dependencies" decision, with no equivalent forcing function.

One change from the reasoning in the pre-revision version of this doc: the binary-heap/priority-queue component inside the A* search should **not** be hand-written. A binary heap is itself a solved, tiny problem with a well-maintained, near-zero-cost implementation available — **`tinyqueue`** ([mourner/tinyqueue](https://github.com/mourner/tinyqueue), ISC, zero dependencies, 454 B gzip, actively maintained by Mapbox's Vladimir Agafonkin) — so hand-writing one here would repeat the exact mistake this revision corrects elsewhere. The custom code this workstream actually contributes is the grid-construction/walkability-mask logic and the A* search loop wired around `tinyqueue`, both genuinely specific to how this repo already represents collision — not a generic data structure.

### Walkability grid — reuses existing collision code, adds no new collision data

```js
// apps/web/src/engine/npc-pathfinding.js (sketch, not final code)
// Cell is walkable iff the SAME test isFieldBlocked() already applies to the player is satisfied.
function buildWalkabilityGrid(map, { cellSize = 0.5 } = {}) {
  // for each grid cell (cx, cy):
  //   walkable = map.isLand(cx, cy)                                   // isCaribbeanLand / isRiverbendLand / isCommonCauseLand — already exported/available
  //           && !map.blocks.some(b => rectsOverlap(footBoxFor(cx, cy), b)); // footBoxFor, rectsOverlap — already exported from geometry.js
}
```

The grid is built **once per map**, at the same point the runtime already rebuilds per-map NPC state — `ensureFieldNpcRuntime()` (`main.js:685-691`) — not recomputed every tick. Dynamic obstacles (other NPCs, the player) are **not** baked into the grid; `isFieldNpcBlocked()` (`main.js:720-732`) keeps deciding whether the *current* step executes this tick, exactly as it does today. The A* layer only decides the *route*; the existing per-tick blocking check still gates each individual step. This means zero new collision data has to be authored — the grid is derived entirely from data that already exists.

### Integration with `updateFieldNpcs()`

The lerp/speed/facing math inside `updateFieldNpcs()` (`main.js:754-782`) is unchanged. Only the source of "what point are we lerping toward" changes: today it's `patrol[targetIndex]` (a raw scripted waypoint); after this workstream, for NPCs opted in, it's `state.currentPath[state.pathIndex]` (an A*-computed intermediate waypoint between the current position and the next scripted waypoint or destination). A per-NPC `behavior` field (see below) makes this an opt-in, gradual, and fully reversible migration — NPCs without the field keep today's exact straight-line-lerp-and-abandon behavior.

### Recalculation triggers

- Map change (grid rebuild — same event as today's `ensureFieldNpcRuntime()` call).
- A new patrol leg begins (path computed once per leg, not re-derived every tick).
- N consecutive ticks blocked by a dynamic obstacle (another NPC or the player standing in the way) → replan from the NPC's current position.
- Entering `travel-to-target` mode with a new destination.

### Patrol-region containment

An optional `patrolRegion: { x1, y1, x2, y2 }` on a patrol config, implemented as a cheap per-search grid mask — cells outside the region are excluded from *that NPC's* search only, not from a second stored grid. This keeps memory cost to one shared per-map walkability grid regardless of NPC count.

### Four behavior modes

1. **`stationary`** — formalizes today's implicit fallback (an NPC with no patrol entry uses `patrols[npc.id] || [{ x: npc.x, y: npc.y }]`) as an explicit, named field rather than an accidental array shape.
2. **`wander`** — new. Bounded-radius search from a home point (roughly 2–3 tiles), pick a reachable cell, A*-path to it, pause, repeat — using the existing per-NPC staggered timers so wandering NPCs don't move in synchronized patterns.
3. **`patrol`** — today's `*_FIELD_NPC_PATROLS`/`HUB_NPC_PATROLS` data, unchanged in shape, but each leg is now A*-routed instead of straight-line-lerped. This is the direct, visible fix for the confirmed give-up behavior at `main.js:777-781` (NPC abandons a blocked leg and jumps to the next scripted point) — patrol NPCs will instead route around whatever blocked them.
4. **`travel-to-target`** — new. A one-shot scripted relocation to an arbitrary coordinate (for example, an NPC walking to greet the player after a quest event), which is currently impossible without hand-authoring a bespoke one-off patrol array.

### Anti-goals (explicitly out of scope)

No physics engine, no steering-behavior library, no navmesh, no formation/flocking behavior beyond "don't move in lockstep" (already solved by existing per-NPC timing offsets). Facing/walking-animation state continues to be set from actual per-tick movement direction, exactly as today — this workstream changes *what point an NPC moves toward*, not how direction/animation state is derived from movement.

---

## Workstream 3 summary — Tiled as the source of truth

Full detail in [`docs/architecture/TILED-RUNTIME-DATA-PLAN.md`](TILED-RUNTIME-DATA-PLAN.md). Pilot map: `apps/web/src/content/maps/riverbend-field.tmj` (case-004), which today has exactly 2 tile layers and zero object layers. New Tiled object layers (collision, walkable regions, spawns, patrol paths, interaction triggers, camera bounds — plus a schema for patrol regions, dialogue triggers, doors/exits, quest triggers, and terrain cost that is decided now but left unpopulated for this pilot) are exposed via a new additive export, `objectsForLayer()`, in `apps/web/src/engine/tiled-map-loader.js`. Hand-coded collision (`UNIT2_FIELD_BLOCKS`, `isRiverbendLand`, `UNIT2_FIELD_NPC_PATROLS`) stays authoritative at runtime throughout the pilot; a new parity test and a dev-only visual overlay page are the validation mechanism. Only Riverbend is converted — the other four wired maps (Caribbean, Archive Room, Hallway, Common Cause) are untouched.

## Workstream 4 summary — asset optimization pipeline

Full detail in [`docs/architecture/ASSET-PIPELINE-PLAN.md`](ASSET-PIPELINE-PLAN.md). New `scripts/assets/` tree (Sharp-based), four new npm scripts (`assets:audit`, `assets:build`, `assets:optimize`, `build:analyze`), a new gitignored `apps/web/src/assets/generated/` output directory, and a JSON manifest. Targets the real, verified numbers: a 3.7 MB shipped JPG (`documents/source-waldseemuller-1507.jpg`) and several shipped 0.6–1.2 MB tileset PNGs, plus flags (as a separate repo-hygiene concern, not a current production-size fix, since Vite doesn't bundle unglobbed files) a 28 MB unreferenced `tilesets/spritesheet.png` and several multi-megabyte unreferenced tileset packs sitting in the repo.

---

## Workstream 5 — engine migration decision gate

This workstream is **documentation only in this pass** — it is not scheduled, and none of its trigger conditions are currently true.

### Objective trigger conditions

Any one of the following is sufficient to schedule the bounded proof-of-concept below. This list exists to make future engine-adoption decisions checkable rather than a matter of a gut feeling, mirroring this repo's own precedent of previously searching for a concrete forcing function and finding none in any category:

1. **Collision-expressiveness limit.** At least two real cases in the same unit need non-axis-aligned or multi-elevation collision that `rectsOverlap`/`ellipse`/the per-map land-mask functions in `apps/web/src/engine/geometry.js` and `main.js` cannot express in under roughly 20 lines of new hand-coded geometry.
2. **Performance ceiling.** A real map needs more than roughly 12 concurrently-active, independently-pathing NPCs, or true multi-NPC formation/following, **and** Chrome DevTools profiling shows the field-update path measurably exceeding an 8ms/frame budget at realistic NPC counts — measured, not assumed.
3. **Animation-fidelity ceiling.** An approved design spec names a specific effect (real-time shadow-casting, particle systems, arbitrary rotation blending) that the person implementing it confirms is unbuildable in CSS/DOM within a reasonable effort.
4. **Authoring-velocity signal.** Hand-coding a new map's collision/NPC/patrol data takes more than roughly twice as long as authoring the same map's Tiled visuals, self-reported across at least two consecutive map builds — i.e. Workstream 3 succeeds at the visual layer, but the logic layer becomes the actual bottleneck.
5. **Explicit owner override.** The project owner directly asks for an engine evaluation. This is always sufficient on its own — conditions 1–4 exist to give that decision an objective basis, not to gate it procedurally.

### Bounded proof-of-concept scope, if a trigger fires

- **One map:** a trimmed subset of Riverbend (`riverbend-field.tmj`) — chosen because it is also the Workstream 3 pilot and has the simplest collision/land-mask shape of the three field maps (a rectangle plus one river/bridge cutout, versus Caribbean's 4-ellipse union).
- **One player:** existing Chronicler sprite PNGs used as-is. The POC is testing engine fit for movement/collision/camera, not re-testing Workstream 1's DOM animation controller.
- **Two NPCs:** enough to exercise two of Workstream 2's four behavior modes (for example a patrol NPC and a stationary NPC).
- **One interaction:** walk into range of one existing interaction point, press a key, see a placeholder panel — proves input and proximity parity only.
- **One collision layer:** from Workstream 3's `collision` object layer if it exists by the time the POC runs, otherwise a direct hand-copy of `UNIT2_FIELD_BLOCKS`.
- **Explicit non-goals:** no save/load, no Author Mode, no dialogue system, no quest types, no accounts/classroom/grading, no visual polish beyond what's needed to compare movement feel.

### Isolation and time box

The POC lives in a fully separate top-level directory, `poc/phaser-riverbend/`, with its own `package.json` and `vite.config.js` — never wired into root npm scripts, never touching `apps/web/src/`. This lets it add an engine as a POC-scoped dependency without touching the real app's `package.json`, and gives it a one-line rollback: delete the directory. It is time-boxed (one to two focused sessions) with a hard finish line — it either demonstrably reproduces the five POC elements at equal-or-better feel than today's renderer, or it is deleted. This explicitly avoids repeating this repo's own cautionary precedent: `apps/web/src/features/` is an abandoned prior modularization attempt that CLAUDE.md calls out by name as "a cautionary example of this exact mistake," left behind as empty folders a future reader has to investigate and discover are nothing.

---

## Cross-cutting: recommended implementation order

1. **Workstream 4 (asset pipeline)** first. Zero gameplay risk — purely additive scripts and a new output directory. Its Sharp/manifest/file-hashing helpers are also a direct dependency of Workstream 1's sprite-sheet compositor, so building it first avoids writing the same helper twice.
2. **Workstream 3 (Tiled, Riverbend pilot, test-only)**. Low production risk since `main.js` never switches to reading Tiled data at runtime for the pilot. Deciding the object-layer schema before Workstream 2 needs a walkability-grid data source avoids that workstream guessing at a shape that later changes.
3. **Workstream 1 (animation controller)**. Rendering-only changes — no movement or collision math is touched — ships against existing art, and is the highest immediately-visible payoff of the five.
4. **Workstream 2 (pathfinding)**. Last among the four active workstreams, because it touches the exact movement/collision decision loop CLAUDE.md flags as regression-prone ("Gameplay invariants (regression-prone areas)"). It benefits from Workstream 1 having already proven the "add a new file, swap one call site, keep the old path available" rollout discipline this workstream also needs.
5. **Workstream 5 (decision gate)**. Documented now, not scheduled. The proof-of-concept only runs if a trigger condition in the section above actually trips.

## Cross-cutting: dependencies being considered

| Dependency | Workstream | Status in this plan |
|---|---|---|
| `pathfinding` / `easystarjs` / `ngraph.path` / `astar-typescript` / `fast-astar` / `@evilkiwi/astar` (npm) | 2 | Evaluated and **rejected**, each with cited evidence — hand-rolled A* recommended instead, pending owner sign-off (see Workstream 2 and `OPEN-SOURCE-REUSE-DECISIONS.md` §2) |
| `tinyqueue` | 2 | Recommended as a real (tiny) runtime dependency for the A* priority queue — ISC, 454 B gzip, actively maintained, see `OPEN-SOURCE-REUSE-DECISIONS.md` §2 |
| `sharp` | 1, 4 | Recommended as a real devDependency once implementation starts (Workstream 4) |
| `oxipng` | 4 | Recommended as an **optional external CLI**, not an npm dependency (every npm wrapper is stale) — see `ASSET-PIPELINE-PLAN.md` |
| `picomatch` / `csv-stringify` | 4 | Recommended as real devDependencies for `scripts/assets/` — see `ASSET-PIPELINE-PLAN.md` and `OPEN-SOURCE-REUSE-DECISIONS.md` §5 |
| `maxrects-packer` | 4 | Named for later (preferred over `free-tex-packer-core`), not adopted now — see `OPEN-SOURCE-REUSE-DECISIONS.md` §5 |
| `rollup-plugin-visualizer` | 4 | Recommended as a devDependency, gated behind `ANALYZE=true` so it never runs on normal builds |

No package is installed as part of this planning document. Each is a recommendation for a later, separately-approved implementation task.

## Cross-cutting: exact files likely to change

- `apps/web/src/main.js` — call-site swaps only, in the specific line ranges cited per workstream above (sprite `.src` assignment sites, `updateFieldNpcs()`'s target-point selection). No physical relocation of existing functions.
- `apps/web/src/engine/tiled-map-loader.js` — additive new export (`objectsForLayer`), Workstream 3.
- `apps/web/src/content/maps/riverbend-field.tmj` — new object layers added, Workstream 3.
- `apps/web/src/styles/global.css` — new parametrized `steps()` keyframe rules replacing `footstepBob`, `npcBodyWalk`, `npcPatrolBob`, `npcIdleFrame`, `npcStepFrame`; deletion of already-dead `playerIdle`/`.field-player` rules, Workstream 1.
- New file `apps/web/src/engine/sprite-animation.js`, Workstream 1.
- New file `apps/web/src/engine/npc-pathfinding.js`, Workstream 2.
- New tree `scripts/assets/` (`audit.js`, `build-sprite-sheets.js`, `optimize.js`, `manifest.js`, `lib/file-stats.js`), Workstream 1 and 4.
- `package.json` — four new npm scripts, and eventually `sharp` and `rollup-plugin-visualizer` as devDependencies.
- New, gitignored `apps/web/src/assets/generated/` directory, Workstream 1 and 4.
- `docs/architecture/ARCHITECTURE-QUICKREF.md` — **not** changed by this planning document; updated later, once real implementation phases actually land, per its own existing update convention.

## Cross-cutting: systems that must remain untouched

- The DOM/CSS `innerHTML` screen-swap renderer (`render()`, `VALID_SCREENS`, per-screen `*Screen()` functions) — Workstream 1 extends the CSS-stepping technique already in production, it does not replace the renderer.
- The `requestAnimationFrame` loop shape and the "camera is a pure function of player position, recomputed every tick" invariant (`runFieldMovementLoop`/`runHubMovementLoop`) — no workstream here touches camera math.
- Proximity-gated interaction, one-interaction-prompt-at-a-time, and NPC-anchored dialogue rendering — unrelated to all five workstreams.
- CLAUDE.md's "no physical extraction of movement/collision/camera/NPC logic out of `main.js` merely for architectural neatness" policy — every new module in this plan (`sprite-animation.js`, `npc-pathfinding.js`, `objectsForLayer()`, `scripts/assets/*`) is a brand-new, additive file, following the existing `geometry.js`/`audio-engine.js`/`tiled-map-loader.js` precedent, never a relocation of existing working code.
- The rule against creating empty future-architecture folders "for structure" — every new file/directory in this plan is populated by the workstream that creates it, not scaffolded ahead of use.

## Cross-cutting: rollback strategy

- **Workstream 1 / 2:** new files plus swapped call sites. Revert by reverting the call-site diff in `main.js`/`global.css` and deleting the new engine file. Because both are opt-in (a per-NPC `behavior` flag for Workstream 2; a straightforward CSS/markup swap for Workstream 1), rollout can also be partial and paused mid-way without a broken intermediate state.
- **Workstream 3:** hand-coded collision stays authoritative at runtime throughout the pilot, so reverting means simply not wiring `objectsForLayer()`'s output into any runtime code path — the `.tmj` file's new object layers are inert data until something reads them.
- **Workstream 4:** purely additive scripts and a generated output directory. Delete `scripts/assets/` and `apps/web/src/assets/generated/` to fully revert; no source asset is ever modified in place.
- **Workstream 5:** delete the isolated `poc/phaser-riverbend/` directory. Zero blast radius on `apps/web/` by construction.

## Cross-cutting: testing strategy

All new pure logic follows the existing Vitest convention exactly: tests live under `tests/unit/*.test.js`, run via `npm run test` (jsdom environment), and use the established "export in place, don't physically extract" pattern and `(normal case)`/`(boundary case)` naming (see `tests/unit/main-collision.test.js` for the reference style). Concretely:

- `apps/web/src/engine/sprite-animation.js`'s pure functions (`walkCycleProfile`, `resolveAnimationClass`) get direct unit tests, no DOM needed.
- `apps/web/src/engine/npc-pathfinding.js`'s grid-build and A* search get direct unit tests against small synthetic grids, plus at least one test built from a real map's actual block/land data.
- `objectsForLayer()` in `tiled-map-loader.js` gets a direct unit test (pure, DOM-free, same style as the existing `tilesForFrame()` tests), plus the new `tests/unit/riverbend-collision-parity.test.js` described in `TILED-RUNTIME-DATA-PLAN.md`.
- `scripts/assets/*` get lighter coverage — these are one-off Node scripts in the same category as the existing `scripts/generate-*-tmj.js` files, which have no dedicated tests today; a smoke test that the manifest shape is well-formed is sufficient.
- The `test-writer` subagent is the right owner for writing this coverage once real code lands in each workstream.
- The `map-implementer` subagent is the right owner for hand-authoring Workstream 3's Riverbend object-layer geometry — the same job it already does for hand-coded collision arrays, extended to a Tiled-object-layer output shape.
- Every workstream still requires a live `npm run dev` and manual (or Playwright-assisted) browser pass before being considered done — per CLAUDE.md's explicit rule that "compilation/syntax passing is not sufficient to call something fixed." This repo's own phase history includes multiple bugs in exactly this code (movement, collision, camera, NPC patrol) that were only caught by live interaction, never by lint, test, or build alone.

## Cross-cutting: risks

- **Stale pathfinding dependency**, if a package were adopted instead of hand-rolling — mitigated by the explicit hand-roll recommendation in Workstream 2.
- **Tiled/hand-coded collision drift** during the Workstream 3 transition — mitigated by the parity test and the dev-only visual overlay described in `TILED-RUNTIME-DATA-PLAN.md`.
- **CSS-stepping animation not matching the currently hand-tuned bob timing** on first pass — mitigated by keeping the old CSS in place, side-by-side, until the new animation is manually verified in-browser, only then deleting the old rules.
- **Scope creep toward premature engine adoption** — mitigated by Workstream 5's explicit, checkable trigger conditions and its isolated, disposable POC structure.
- **New devDependencies drifting outside this repo's documented approved-dependency posture** — mitigated by keeping the Workstream 4 tool list small (Sharp, optionally an external oxipng binary, optionally `rollup-plugin-visualizer`) and recording the decision in this doc rather than assuming it's automatically fine.

## Cross-cutting: acceptance criteria

For this planning deliverable itself: all four documents exist at their specified paths, cite verified current `file:line` references rather than stale or guessed ones, make concrete decided recommendations rather than open-ended lists of options wherever the source request asked to "propose," "design," "compare," or "recommend," and explicitly do not recommend an immediate engine migration.

For the workstreams once actually implemented (future work, listed here for continuity): player and NPC walking visibly alternates through a real multi-frame cycle rather than a whole-image swap plus CSS bob; patrol NPCs visibly route around a blocked path instead of abandoning the leg; the Riverbend `.tmj` file's object-layer data passes the parity test against `UNIT2_FIELD_BLOCKS`; `npm run build` output size for the currently-shipped 3.7 MB JPG and 0.6–1.2 MB tileset PNGs measurably shrinks; and `npm run dev` continues to produce identical player-visible behavior for everything not deliberately changed, per CLAUDE.md's "preserve the working game" invariant.

## Cross-cutting: estimated impact

- **Duplicated-code reduction:** three near-duplicate per-tick sprite-update call sites (player, field NPCs, hub NPCs) collapse into calls to one shared `sprite-animation.js` controller; five separate CSS keyframe blocks (`footstepBob`, `npcBodyWalk`, `npcPatrolBob`, `npcIdleFrame`, `npcStepFrame`) collapse into one generic, parametrized `steps()` keyframe rule; NPC sprite DOM nodes halve (two stacked `<img>` elements per NPC for the idle/step crossfade become one).
- **Visible walking-quality improvement:** today's walking animation is a 2-pose whole-image swap combined with a CSS position "bob," and patrol NPCs visibly abandon a blocked leg and jump to the next scripted point (confirmed at `main.js:777-781`) rather than routing around obstacles. Workstream 1 makes pose alternation a real, GPU-cheap timed cycle; Workstream 2 makes patrol and wandering NPCs visibly walk around obstacles instead of teleporting past them — a qualitative fix to the two most visually obvious rough edges in the game today.
- **Production-size improvement:** the shipped 3.7 MB `documents/source-waldseemuller-1507.jpg` is realistically reducible to roughly 1.5–2.5 MB via re-encoding with no visible quality loss for an archival document scan; shipped 0.6–1.2 MB tileset PNGs (for example `Medieval Fantasy Town/4.png` at 1.2 MB, `Island survival/tile-B-01.png` at roughly 1.1 MB) are realistically reducible 20–50% via palette optimization, since tile art is inherently low-color-count. The 28 MB `tilesets/spritesheet.png` and several multi-megabyte unreferenced tileset packs (`Green Apocalyptic 1`/`2`, `Sandy Island`, `Modern Interiors`, `Medieval harbor`) do not currently ship (Vite only bundles files an `import.meta.glob` call actually matches, and none of these are globbed anywhere in `main.js`) — flagging and optionally removing them is a repo-hygiene and accidental-inclusion-risk fix, not a current production-bundle-size fix.

## Cross-cutting: recommended first implementation task

**Superseded 2026-07-23.** This section originally recommended building `scripts/assets/audit.js` from scratch. That script (plus `manifest.js` and `lib/file-stats.js`) now already exists in the repo, uncommitted — but reviewing it against the reuse policy above found it hand-rolls three things with obvious, well-maintained library replacements: binary PNG/JPEG/GIF/SVG header parsers (`lib/file-stats.js`), CSV escaping (`manifest.js`'s `toCsv`/`csvCell`), and a glob-string-to-RegExp converter (`audit.js`'s `globToRegExp`). See `OPEN-SOURCE-REUSE-DECISIONS.md` §7.

**Revised recommended first task: fix those three violations** — replace the hand-rolled image-dimension parsers with Sharp's `.metadata()` (Sharp is already an approved dependency), the hand-rolled CSV writer with `csv-stringify/sync`, and the hand-rolled glob matcher with `picomatch.isMatch()`. Full reasoning in `OPEN-SOURCE-REUSE-DECISIONS.md` §9: it maximizes reuse (~150 lines of custom binary-parsing/glob/CSV logic deleted), is dev-tooling-only with zero gameplay risk, is fully reversible (one script tree, one revert), and proves the adapter-first discipline on code that already exists today before it's applied to the higher-stakes pathfinding/animation/Tiled workstreams. This is a separate, later implementation task, not part of this planning pass.
