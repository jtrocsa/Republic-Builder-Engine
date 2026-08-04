# 0035 — World scale, the map rebuild, and the walk-behind layer

**Date:** 2026-07-29
**Status:** accepted
**Supersedes in part:** `0029` (Caribbean layout), `0030` (Archive Room size), `0032` (Common
Cause layout). The art-sourcing rules in `0031`/`0034` are unchanged and still binding.

## Context

The five live maps were built one at a time against a 40×24 field grid and a 10×8 Archive Room,
each sized to whatever was needed at the time. A mockup of what the game should look like made
three deficiencies concrete: the maps are sparse, they are small, and the characters standing on
them are four art styles at five resolutions.

`0034` had just produced a verified tile dictionary (`canonical-palette.js`,
`TILE-LIBRARY-CATALOG.md`) covering all 250 sheets across 28 packs, but deliberately built
nothing. This phase spends that groundwork.

## Decisions

### 1. The field tile size is 48px, matching the art

`FIELD_GRID.tile` was **40** while every tileset is authored at **48**. The world canvas was
therefore resampled to 5/6 scale under `image-rendering: pixelated`, which drops source pixel
rows — the reason the tiles looked softer than the sheets they came from. It is now 48.

This was nearly free: every collision rect, land mask, NPC position, patrol waypoint and quest
point is stored in **tile units**, and `updateFieldPlayer()`'s camera measures its viewport live,
so the change rescales the world uniformly without touching a coordinate. Only absolutely-sized
sprite CSS needed adjusting (player 46×69 → 55×83, field NPCs 46×66 → 55×79).

### 2. Field maps are 56×36; the Archive Room is 20×12 and gets a camera

Fields grew from 40×24 to **56×36** — about 2.1× the walkable area. The field camera already
handled any world size, so this cost nothing but coordinate re-derivation.

The Archive Room grew from 10×8 to **20×12**. This one did need new code: hub rooms were laid out
as percentages of a box that stretches to fit, so growing the room would only have made its tiles
smaller. A grid that declares a `tile` size is now positioned in pixels inside `#hubWorld` and
scrolled by `updateHubCamera()`, which mirrors `updateFieldPlayer()`'s camera exactly — a pure
function of player position, clamped to the world edges, integer-rounded. The painted Main Hall
declares no `tile` and keeps the original percentage layout untouched.

### 3. Layers named `overlay*` draw above the player

`tiled-map-loader.js` drew every layer into one canvas beneath the sprites, so nothing could
occlude the player. `renderTiledMap` now takes a `depth` of `"below"` / `"overlay"` / `"all"`,
and a map with an `overlay` layer is rendered into two stacked canvases. This is what lets the
player walk behind a tree canopy — the single largest contributor to the Pokémon-like depth the
mockup has and the flat maps lacked.

Deliberately _not_ added: object layers, per-tile properties, layer opacity, flip/rotate flags.
All still unused, all still silently ignored.

### 4. Riverbend gets a generator; its two visible defects are fixed

Riverbend was the one live map with no generator — hand-built in the Tiled desktop app as the
original proof of concept, so its layout could not be re-derived. It now has
`scripts/generate-riverbend-tmj.js` like every other map.

Writing it surfaced two real defects in the shipped map:

- **Black gaps across every crop field.** The planted-row tiles are transparent _between_ the
  plants — props meant to be laid over soil, not full-bleed ground. Treated as ground, the page
  background showed through. Soil now goes down as ground with the crop on structures above it.
- **The river was floored with loose planks.** `tile-B-04`'s rows 8–11 are pier decking, and they
  had been tiled across the whole channel. The pier is now laid over water only, and the sheet's
  _vertical_ pier art is used where a pier runs north–south — the horizontal deck tile stacked
  downward is what produced the plank-stack look.

### 5. New art brought in from the catalog

Four sheets joined the bundle (and `farm/3` left it): `farm/6` (ground textures, crops, trees,
fencing, a well), `farm/7` (clapboard houses and barns), `Island survival/5` (the cartographer's
chart table, cargo, anchors), `Medieval harbor/tile-B-04` (the library's only period
square-rigged hulls). `dist/assets` went from 11 PNGs / 12.8 MB to 14 / 16 MB — an accepted cost.

`farm/7`'s clapboard housing is the single biggest quality step: Riverbend and Philadelphia no
longer borrow generic fantasy-town silhouettes for their dwellings.

**The Caribbean's CSS-drawn ship and cartographer table are gone**, replaced with real tile art.
They were positioned in absolute pixels tuned to the old 40px tile, so they silently desynced
from their collision rects the moment the tile scale was corrected — a latent bug the rebuild
removed rather than re-tuned.

### 6. Field/hub coordinate drift is now a test failure

A field map's art lives in a generated `.tmj`; its collision, NPC, patrol and quest coordinates
are hand-written constants in `main.js`. Nothing tied the two together but a comment reading
"kept in sync manually" — and that promise is exactly what breaks when a map is resized, silently:
an NPC in the sea, a marker inside a wall, a collision rect guarding empty grass.

`tests/unit/field-map-coordinates.test.js` (38 assertions) now checks, per map, that the `.tmj`
grid matches `FIELD_GRID`, every NPC and patrol waypoint is on walkable land and clear of
collision, every quest point is reachable from somewhere the player can stand, and every
collision rect both sits on land and has drawn art underneath it.

It earned its keep immediately, catching two bugs in the new Caribbean (a gardener pacing into
the conuco garden; a garden rect with no structures art beneath it) and two pre-existing ones in
the shipped Unit 2 and Unit 3 maps (`indentured-servant` pacing into the tobacco rows,
`loyalist-merchant` into the wharf, `farmwife` into a residence).

### 7. Characters: everything that costs no generations

The cast restyle is blocked on PixelLab credit (14 generations left on a trial, $0 balance;
~22 characters are needed). Everything free landed now:

- Both NPC groups were forced to `image-rendering: auto !important`, so every NPC rendered
  bilinear-blurred while the player beside them rendered crisp. Both are now `pixelated`.
- `scripts/assets/normalize-sprite-frames.js` is committed. The equivalent from the last Director
  swap was explicitly not committed, and its per-frame autocropping is why his frames were
  30×46 / 21×46 / 21×45 — a 1px difference that drifted his feet on every step. The new script
  measures a pose group together and bottom-aligns them on a shared canvas.
- `docs/art/CHARACTER-CAST-SPEC.md` records the 22-character roster, per-character descriptions
  and the exact PixelLab parameters, so generation is mechanical once credit exists.

## Consequences

- All 20 Playwright visual baselines were invalidated by design and re-recorded.
- `scripts/assets/preview-map.js` (`npm run assets:preview-map`) composites a `.tmj` to a PNG,
  which is now the cheapest way to check a map's layout — well below a browser pass on the ladder.
- The Georgian/Federal columned statehouse remains a registered gap. No pack in the library
  contains American columned civic architecture; Philadelphia still composites a stand-in.
