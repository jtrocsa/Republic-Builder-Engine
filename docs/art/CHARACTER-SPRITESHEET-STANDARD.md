# Character Spritesheet Standard

**Status:** planning document, not yet implemented. Part of [`docs/architecture/FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md`](../architecture/FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md)'s Workstream 1. Line references verified against the repo as of 2026-07-23.

**Reuse policy:** [`docs/architecture/OPEN-SOURCE-REUSE-DECISIONS.md`](../architecture/OPEN-SOURCE-REUSE-DECISIONS.md) is binding for the reuse-vs-build decision below — see its §3 for the full sprite-animation-library research.

## Current state (verified)

Chronicle's player and NPC "animation" today is **whole-image swapping**, not spritesheet frame-slicing:

- **Player**: `fieldSpriteAssets` (`main.js:464-505`) is a nested map of `appearance {a, b} × direction {down, up, side} × state {idle, step}` — 2 × 3 × 2 = **12 separate PNG files**, e.g. `chronicle-sprites/field/chronicler-a-down-idle.png`, `chronicler-a-down-step.png`. `fieldSpriteUrl()` (`main.js:5125-5131`) picks one URL per tick based on current facing/moving state; `updateFieldPlayer()` (`main.js:5171-5194`) assigns it to `sprite.src`.
- **Field NPCs**: `fieldNpcSprites` (`main.js:374-462`) — 6 characters (`taino-elder`, `taino-gardener`, `taino-fisher`, `spanish-sailor`, `columbus`, `spanish-scribe`) × 4 files each (base/down-idle, `-step`, `-side`, `-side-step`) = **24 files**. `updateFieldNpcs()` patches two stacked `<img>` elements per NPC (`.npc-frame--idle` / `.npc-frame--step`) at `main.js:748-749` and `792-793`, and CSS opacity rules crossfade between them (`global.css:6399-6401`, `6866-6873`).
- **Hub NPCs**: `instituteNpcSprites` (`main.js:510-529`) — 3 characters (`director`, `amani`, `julian`) × 3 files each (base/down-idle, `-side`, `-side-step` — **no dedicated down-step frame**) = **9 files**. Patched in `updateInstituteNpcs()` (`main.js:1356-1420`).
- **Walking "animation"** is a CSS `@keyframes footstepBob` position bob (`global.css:4445-4449`, applied to `.hub-player.is-walking, .case-field-player.is-walking` at `global.css:4441-4444`) for the player, and `@keyframes npcBodyWalk` (`global.css:6757-6765`) / `@keyframes npcPatrolBob` (`global.css:6887+`, overrides with `!important`) plus the idle/step opacity crossfade for NPCs — not real multi-frame walk-cycle animation.
- `image-rendering: pixelated` is **already applied** at `global.css:4436-4439` for the player sprite — nearest-neighbor rendering is not a new requirement, it's a preservation requirement.
- Dead CSS worth deleting in the same pass: `@keyframes playerIdle` (`global.css:2846-2853`), applied only to `.field-player` (`global.css:1256-1264`) — a class that is not `.case-field-player` and appears to be unused by current markup.

All individual sprite files are small (roughly 240 bytes to 1.8 KB) — this is a maintainability and animation-quality problem, not a file-size problem.

## Spritesheet file convention

One horizontal strip per character/appearance/direction, replacing that direction's separate idle/step PNGs:

```
<character-id>-<direction>.png
```

Examples: `chronicler-a-down.png`, `chronicler-a-side.png`, `chronicler-a-up.png`, `npc-columbus-down.png`, `npc-columbus-side.png`, `director-down.png`, `director-side.png`.

- **Directions:** `down`, `up`, `side` (mirrored via CSS `transform: scaleX(-1)` for `left`, exactly as today's code already collapses `left`/`right` into one `side` asset — see `fieldSpriteUrl()`'s `direction` computation at `main.js:5127-5129`). This preserves the existing 3-asset-per-character convention rather than doubling to 4 directions of art.
- **Frame size:** configurable, defaulting to **48×48px** (the current Chronicle standard — every existing sprite in `chronicle-sprites/field/` and `institute/` is authored at this size). The animation-profile data structure below takes `frameSize` as a parameter specifically so a future character sheet at a different resolution isn't blocked by a hard-coded constant.
- **Frame order in the strip, left to right:** `left-step`, `standing`, `right-step`, `standing` — 4 frames. This is the natural walk-cycle sequence the task calls for, and it means a single `frames: [0, 1, 2, 3]` array produces a correct loop with no special-casing (the strip already repeats the standing pose at both the loop seam and the midpoint, so playback wraps cleanly from frame 3 back to frame 0).
- **File format:** PNG, indexed/palette color (matches existing art), no embedded animation metadata — frame layout is described by the JS profile below, not by the file itself. This keeps the art pipeline simple (any image editor or the `build-sprite-sheets.js` compositor described below can produce a valid sheet) and keeps frame timing/looping logic in code, where it's testable.

## Directory structure

```
apps/web/src/assets/
  chronicle-sprites/
    field/                        # unchanged — existing per-state PNGs stay as compositor input
      chronicler-a-down-idle.png
      chronicler-a-down-step.png
      ...
  generated/                      # new, gitignored (see ASSET-PIPELINE-PLAN.md)
    sprite-sheets/
      chronicler-a-down.png
      chronicler-a-side.png
      chronicler-a-up.png
      chronicler-b-down.png
      chronicler-b-side.png
      chronicler-b-up.png
      npc-taino-elder-down.png
      npc-taino-elder-side.png
      ...
      director-down.png
      director-side.png
      ...
```

Source per-state PNGs under `chronicle-sprites/field/` and `institute/` are **not deleted or moved** — they remain the compositor's input (see "Art generation strategy" below). Generated sheets live under `apps/web/src/assets/generated/sprite-sheets/`, following the same gitignored-output convention as the rest of the asset pipeline (`docs/architecture/ASSET-PIPELINE-PLAN.md`).

## Animation-profile data structure

New module `apps/web/src/engine/sprite-animation.js` (a new, small, additive file — same shape as `apps/web/src/engine/geometry.js` and `apps/web/src/engine/audio-engine.js`, not a relocation of existing code):

```js
// apps/web/src/engine/sprite-animation.js

export const DEFAULT_FRAME_SIZE = { width: 48, height: 48 };

// Frame order in the strip: left-step, standing, right-step, standing.
export function walkCycleProfile({ columns = 4, frameSize = DEFAULT_FRAME_SIZE } = {}) {
  return {
    columns,
    frameWidth: frameSize.width,
    frameHeight: frameSize.height,
    states: {
      // "standing/pass" frame only — animation-play-state effectively paused on frame 1.
      idle: { frames: [1], fps: 1 },
      // left-step, stand, right-step, stand — the natural walking sequence.
      step: { frames: [0, 1, 2, 3], fps: 8 },
      // reserved for later: a distinct running cadence, same frame indices, higher fps.
      run: { frames: [0, 1, 2, 3], fps: 14 },
    },
  };
}

// direction is one of "down" | "up" | "left" | "right" (left/right both resolve to the "side" sheet,
// mirrored via a CSS class, exactly as fieldSpriteUrl() already collapses them today).
export function resolveAnimationClass({ direction, moving }) {
  const dir = direction === "left" || direction === "right" ? "side" : direction;
  return `sprite-anim--${dir}-${moving ? "step" : "idle"}`;
}

export function isMirrored(direction) {
  return direction === "left";
}
```

`walkCycleProfile()` and `resolveAnimationClass()` are pure, DOM-free functions — unit-testable directly, following the same pattern as `tiled-map-loader.js`'s `tilesForFrame()`. The `run` state is present but unused today; it exists so a later feature (if Chronicle ever adds a run/sprint input) has a slot to fill without changing the data shape, per the task's "support different animation speeds for walking, running, and idle states later" requirement — this is a schema decision, not new behavior, following this repo's own precedent of deciding a field's shape ahead of a feature actually using it (e.g. `unit.archiveChallenges[]`, populated only in a later phase).

## Renderer choice: CSS `background-position` stepping, not `<canvas>`

**Decision: keep this CSS-only for now, using `background-position` stepped by a `steps()` timing function against the new sprite-sheet image, applied via a small set of classes generated from `resolveAnimationClass()`.**

Justification:
- The existing DOM already uses this exact mechanism for the current bob/crossfade animations — `footstepBob` (`global.css:4445-4449`) and the NPC `npcIdleFrame`/`npcStepFrame` cadence (`global.css:6402-6417`) are both CSS `@keyframes` driving visual state on a timer. Spritesheet stepping is a direct, same-technique extension: instead of animating `transform: translate()` or `opacity`, the keyframes animate `background-position-x` in discrete steps.
- A `<canvas>`-per-character approach would require a second per-frame JS render loop, duplicating responsibility with `runFieldMovementLoop`/`runHubMovementLoop` (`main.js:5232-5275`, `main.js:4658-4700`) — code CLAUDE.md explicitly protects under "Gameplay invariants (regression-prone areas)." It would also mean replacing every `.hub-player img` / `.case-field-player img` / `.npc-frame--idle` / `.npc-frame--step` CSS selector with new canvas-draw code, a much larger and riskier diff for the same visual outcome.
- CSS stepping keeps the change additive and reversible: the new sprite-sheet `<img>` (or `background-image` div) can sit right next to the old per-state `<img>` during rollout, and rollback is deleting the new CSS/markup, not untangling a second render loop from the first.
- Nearest-neighbor rendering (`image-rendering: pixelated`) already applies to `background-image` exactly as it does to `<img src>` — carrying it forward is a one-line requirement, not a new capability to build.

### Why native CSS, not a library

Per the project owner's reuse-first policy ([`../architecture/OPEN-SOURCE-REUSE-DECISIONS.md`](../architecture/OPEN-SOURCE-REUSE-DECISIONS.md)), the CSS-only decision above was checked against real library alternatives, not assumed:

- **This is an established, named technique**, not a gap libraries exist to fill. CSS-Tricks' ["Clever Uses for Step Easing"](https://css-tricks.com/clever-uses-for-step-easing/) is the canonical reference — it documents exactly this `background-position` + `steps()` mechanism and calls sprite animation `steps()`'s single most popular use case. MDN documents the underlying `steps()` timing-function syntax. This plan's approach matches that established pattern; cite the CSS-Tricks article by name in `sprite-animation.js`'s code comments as the pattern being followed.
- **Libraries investigated and rejected**: `jsprite` (license listing is inconsistent between npm/repo, 5 years stale, ~3.4 MB unpacked for a config wrapper around the same frame-index math this plan already writes by hand); `Sprite` by antonjb (MIT, architecturally the closest match — CSS `background-position` driven by requestAnimationFrame — but **archived by its author in June 2021**, and duplicating the "rAF driving background-position" logic is exactly what this plan's renderer-choice section above already argues against, since it would compete with the existing movement-loop rAF rather than reuse the browser's own CSS animation engine); `sprite-js` (low activity, no evidence of real maintenance); canvas-based sprite libraries (`spritejs` and similar) (wrong rendering model entirely — Chronicle is DOM/CSS, and adopting a canvas library here would mean running a second render pipeline alongside the existing DOM one).
- **Conclusion**: none of the investigated libraries offer real functionality (frame remapping, sheet packing, event hooks) beyond what the ~15–20 line `resolveAnimationClass()`/`walkCycleProfile()` adapter above already provides, and the closest architectural match is unmaintained. Native CSS is Option C, chosen with evidence, not by default.

### Adaptability to Canvas or an engine later

Because `walkCycleProfile()`/`resolveAnimationClass()` describe animation state as **pure data** (frame indices, columns, fps) rather than as CSS class names baked into game logic, a future Canvas- or engine-based renderer only needs a new "apply" function that reads the same profile and draws frame rects via `ctx.drawImage(sheet, sx, sy, fw, fh, dx, dy, fw, fh)` instead of setting a CSS class — the same shape `tiled-map-loader.js`'s `tilesForFrame()` already uses for tile art. No game-state logic (facing, moving, which character) needs to change; only the "how do pixels get to the screen" layer would be swapped, which is exactly this repo's stated modernization philosophy (see the migration decision gate in the master plan) — improve in place now, without foreclosing a later renderer swap.

## Preservation requirements (already true today — must not regress)

| Requirement | Current mechanism | Note |
|---|---|---|
| Nearest-neighbor rendering | `image-rendering: pixelated` at `global.css:4436-4439` | Carry forward onto the new sprite-sheet element/background-image |
| Preserve last facing direction on stop | `fieldMovement.facing` (`main.js:531`) only changes when a movement key is held; `fieldSpriteUrl()` reads `facing` regardless of `moving` | The new controller must read the same `facing`/`moving` state and must not reset direction when movement stops |
| Feet aligned identically across frames | Existing art is manually aligned per file today | The compositor (below) must not introduce vertical drift when assembling frames into a strip — verify visually before replacing any live sprite |

## Configurable frame dimensions

`walkCycleProfile({ frameSize })` takes an explicit `{ width, height }` rather than hard-coding `48`. The default (`DEFAULT_FRAME_SIZE`) is 48×48 to match every current asset, but nothing in the module assumes that value — a future character sheet authored at a different resolution (for instance, a larger boss/mentor sprite) can pass its own `frameSize` without a code change.

## Which existing functions and assets get wrapped or replaced

| Existing | Fate |
|---|---|
| `fieldSpriteAssets` (`main.js:464-505`) | Kept as-is — becomes the **compositor input list**, not deleted. The 12 existing per-state PNGs are the source images the build script reads. |
| `fieldNpcSprites` (`main.js:374-462`), `instituteNpcSprites` (`main.js:510-529`) | Same — kept as compositor input, not deleted. |
| `fieldSpriteUrl()` (`main.js:5125-5131`) | Call site replaced by one `resolveAnimationClass()` call; the function itself can be deleted once the markup change lands and is verified in-browser. |
| `updateFieldPlayer()` (`main.js:5171-5194`) | The single line `sprite.src = fieldSpriteUrl();` becomes a class/style update using `resolveAnimationClass()`; the rest of the function (camera, proximity, prompt logic) is untouched. |
| `updateFieldNpcs()` NPC-frame lines (`main.js:748-749`, `792-793`) | The two-stacked-`<img>` idle/step crossfade markup collapses to one element with a sprite-sheet background and one class update. |
| `updateInstituteNpcs()` (`main.js:1356-1420`), hub NPC sprite selection | Same shape of change, for the hub's 3 NPCs. |
| CSS: `footstepBob`, `npcBodyWalk`, `npcPatrolBob`, `npcIdleFrame`, `npcStepFrame` (`global.css:4445-4449`, `6757-6765`, `6887+`, `6402-6417`) | Superseded by one or two generic, parametrized `steps()` background-position keyframe rules driven by the animation profile, rather than five separate hand-tuned blocks. |
| CSS: `playerIdle` (`global.css:2846-2853`) / `.field-player` (`global.css:1256-1264`) | Deleted as already-dead code in the same pass — zero risk, confirmed unused by current markup. |

## Art generation strategy: ship the controller now, defer new art

**Decision: land the controller against a composited first-generation 2-pose sheet built from existing art, not against newly generated N-frame walk-cycle art.**

The existing per-state PNGs give only 2 poses per direction (idle, step) — compositing them as-is into a strip yields a 2-frame sheet, not a true 4-frame `left-step / standing / right-step / standing` cycle. This is still a real improvement: it unifies "whole-image `.src` swap" plus "two-stacked-`<img>` crossfade" plus "CSS bob" into one CSS-only stepped animation, removes per-tick JS `.src` churn, and — critically — **ships the controller with zero art dependency**, decoupling the engineering work from the content work. A later, separate content task can regenerate real multi-frame walk-cycle art (this environment already has PixelLab MCP tools — `create_character`, `animate_character` — that are a natural fit for that follow-on) and drop it into the exact same profile shape (a longer `frames` array, a higher `fps`) with no controller code change required.

**Build script:** `scripts/assets/build-sprite-sheets.js` (Sharp-based, part of Workstream 4's asset pipeline — see `docs/architecture/ASSET-PIPELINE-PLAN.md`), which horizontally composites each character/appearance/direction's existing `[idle, step]` pair from `chronicle-sprites/field/` and `institute/` into `apps/web/src/assets/generated/sprite-sheets/`, and records each output in the shared asset manifest.

## Explicitly not required to land this workstream

New art assets, a texture-atlas packer (not needed at this sprite count — see `docs/architecture/ASSET-PIPELINE-PLAN.md`'s note that `free-tex-packer-core` is named for later, not adopted now), a `<canvas>` renderer, or any change to `runFieldMovementLoop`/`runHubMovementLoop`/collision/camera code.
