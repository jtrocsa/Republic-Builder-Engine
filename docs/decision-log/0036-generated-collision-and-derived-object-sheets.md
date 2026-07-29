# 0036 — Generated collision, measured footprints, and derived object sheets

- **Status:** Accepted
- **Date:** 2026-07-29
- **Phase:** 53
- **Supersedes:** the "collision is always a separate hand-coded array in `main.js`" non-negotiable
  in `art-and-map-style-guide.md`, and decision log `0032`'s acceptance of Medieval Fantasy Town
  silhouettes for Philadelphia's buildings.

## Context

Phase 52 rebuilt all five maps at world scale. In play the result read as awkward in a way that was
hard to name from a screenshot: trees cut down the middle, half a barrel, a giant map scroll lying
loose on the grass, hard tan squares of sand in the middle of green grass, "a different kind of
water in between the water", logs sliced at a tile edge, and buildings the player could walk on top
of and render pasted in front of.

Opening the actual tilesheets showed these were not taste problems. They were three mechanical
defect classes, each with a single cause, and none of them could fail a test:

1. **Object footprints were declared by hand and never validated.** A palette recorded an object's
   size in a JSDoc comment (`// 3x2`) and the generator repeated it as literal `gidRect(entry, h, w)`
   arguments. Nothing checked either number against the pixels. `farm/6.png`'s trees are not
   tile-aligned at all — `treeBirch` was declared 3 rows × 2 cols at (0,8), but the apple tree's
   fruiting crown starts 19px inside that rect's second column, so the birch stamp painted a slice
   of a *different, fruiting* tree beside the birch while clipping the birch's own crown. `farm/7`
   packs its clapboard housing tightly enough that `houseCream`'s rect caught three neighbours, and
   `houseBlue` pointed at empty background — it drew nothing at all on the shipped map.
   `Island survival/5.png`'s `barrel` and `seaCrate` were declared 1×1 with 2-tile-tall art.

2. **Opaque terrain quadrants were used as scattered decoration.** These packs author terrain in
   96×96 (2×2) blocks. `CANONICAL["grass.tropical.tuft"]` is the bottom-left quadrant of a *sand*
   block — that is the tan square in the middle of green grass. `sand.tropical.driftwood`,
   `sand.tropical.shells` and the Caribbean's `coralPatch` are each one quadrant of a 2×2 block, so
   they rendered as half a log, a corner of shells, a quarter of a coral cluster. The Caribbean also
   picked randomly between two quadrants of the *same* grass block, which is why its ground read as
   patchwork rather than as a field.

3. **Collision was hand-maintained in parallel with the art.** `FIELD_BLOCKS`, `UNIT2_FIELD_BLOCKS`
   and `UNIT3_FIELD_BLOCKS` were ~80 rects in `main.js`, kept in sync with three generator scripts
   by eye — each generator carried the matching rect in a trailing comment on every `stamp()` call.
   Every rect covered only the object's ground-contact row. That is right for a tree trunk and wrong
   for a house, and it is why the player could walk onto a bohío's thatch.

The stated quality bar was the Institute Archive Room, and it is instructive: a coherent full-bleed
floor, everything else a correctly-sized object stamped on top, all grid-aligned. That arrangement
was incidental there. This phase makes it structural.

## Decision

### 1. Collision is generated from the stamps

Each `scripts/generate-*-tmj.js` now writes `apps/web/src/content/maps/<map>.blocks.js` alongside
its `.tmj`, from the same stamp calls that painted the tiles. `main.js` imports those into
`FIELD_MAPS`; the three hand-written arrays are deleted.

A stamp declares what it is and the rect follows:

| Solidity | Blocks | Layer |
| --- | --- | --- |
| `solid` | the whole footprint | `structures` |
| `base` | the ground-contact row only | base row on `structures`, everything above on `overlay` |
| `decor` | nothing | `structures` |

**This amends a documented non-negotiable**, and the amendment is narrow. Nothing is derived from
the `.tmj` — the `.tmj` still carries visuals only. The rect comes from the stamp, which is upstream
of both the tiles and the collision. Land and water masks stay hand-written predicates
(`isCaribbeanLand`, `isRiverbendLand`, `isCommonCauseLand`), still deliberately duplicated between
`main.js` and each generator, because a mismatch between the coastline the player collides with and
the coastline that got painted must stay a code-review catch.

Unreachable scenery is `decor`. Riverbend's 24-tree framing line sits entirely outside the walkable
rectangle; giving it rects would put two dozen collision boxes in ground the player can never enter.

### 2. Footprint is data, measured from the pixels

`tile(sheet, row, col, { h, w })` carries the footprint; `gidRect(entry)` reads it off the entry and
throws if a call site contradicts it. `scripts/assets/lib/sprite-geometry.js` measures where art
actually is — flood-filling the connected blob from a seed cell, bounded to the declared rect plus a
tile of margin — and classifies a footprint as `terrain` / `clean` / `oversized` / `clipped` /
`contaminated` / `empty`. `npm run assets:measure -- --audit` runs it across every entry in all five
palettes.

Two calibrations in there are worth keeping:

- **Contamination means ink from a blob that continues *outside* the rect.** A second blob lying
  wholly inside it is part of the same object — a detached chimney, a spray of blossom the outline
  does not quite connect — and counting those flags half the library.
- **It has to be at a visible scale.** These packs abut sprites tightly; four palms in a row each
  bleed one to three pixels of frond into the next column. The shipped defect was a 19px-wide slice
  of apple tree, over a thousand pixels. Both an absolute floor (200px) and a relative one (2% of
  the sprite) are required so neither a large sprite nor a small one gets a free pass.

### 3. Art that is not on the tile grid gets repacked, not re-declared

`npm run assets:pack-objects` reads
`apps/web/src/content/tilesets/derived-objects.manifest.js`, flood-fills each named object (or takes
an explicit `box` where sprites physically touch), crops it, pads it to whole tiles **horizontally
centred and bottom-anchored** — matching `tiled-map-loader.js`'s bottom-edge anchoring so the
collision rect still lands under the trunk — and writes a derived sheet plus a generated coordinates
module. Output is byte-deterministic, the same property Phase 51 established for the `.tmj` files,
so the PNGs are committed and regenerating is a no-op diff.

Precedent: `Common Cause Philadelphia/liberty-pole.png` was already a single-object sheet cut to the
grid. This generalises it. No amount of re-declaring `row`/`col` can fix a sprite the pack drew
across a tile boundary; the art has to move.

Three sheets exist so far: `derived/farm-trees.png` (13 trees, saplings and bushes),
`derived/farm-buildings.png` (10 clapboard buildings) and `derived/town-civic.png` (2 churches).

### 4. Ground is opaque, structures are cut-outs, terrain is tiled in its authored block

- A `ground` cell must have no see-through holes, or the page background shows through the world.
- A shape stamped above the ground must read as a cut-out. Judged per *stamped shape*, not per cell:
  adjacent drawn cells are grouped and the shape's exposed border must carry some transparency. A
  building's interior cells are legitimately opaque; what is not legitimate is a shape that is
  opaque in every cell *and* opaque to its own border, which is a square of swapped material.
- Anything that genuinely is a floor — pier decking, a paved quay, a moored rowboat with the pack's
  own water painted into it — goes on `ground`, where it replaces the water instead of covering it.
- Terrain is painted with `groundBlock()`, which tiles the authored block by `(row % h, col % w)`
  parity.
- Scattered detail is a transparent prop on `structures`, never a swapped ground tile.

### 5. Philadelphia's buildings come from the derived clapboard, not Medieval Fantasy Town

Decision log `0032` accepted the Fantasy Town silhouettes because no pack contains Georgian/Federal
American civic architecture. That remains true and the gap stays registered. But those particular
entries were unusable rather than merely imperfect: `printShop` and `familyResidence` cut windows
out of the middle of a continuously-painted mass, `assemblyHall` and `statehouseSteps` were
full-bleed terrain stamped above the ground, and `marketStalls` pointed at cobblestone and spanned
two different awnings. `farm/7`'s painted clapboard is a better stand-in on the merits as well as a
working one.

The standing exclusion on Fantasy Town's **signed** buildings is unchanged and now moot for this
map — the two churches are the only art still drawn from that pack, and both are unlabelled.

## Consequences

- ~80 hand-maintained collision rects deleted from `main.js`; three generated modules replace them.
- `farm/7.png`, `Medieval Fantasy Town/1.png` and `5.png` dropped out of the production bundle,
  replaced by three much smaller derived sheets.
- Three new test files make the whole defect class mechanical:
  `tests/unit/map-tile-integrity.test.js` (ground opacity, cut-out shapes, 48px grid, over all five
  committed `.tmj` files) and `tests/unit/tile-footprints.test.js` (every palette entry's footprint
  against its sheet's pixels). `tests/unit/field-map-coordinates.test.js` keeps the NPC/patrol/source
  half honest and immediately found five real conflicts the rebuild introduced — Columbus pacing
  into the cartographer's table now that it blocks its whole footprint, two palms whose trunks stood
  in the sea, the player spawning inside a cold frame, a fountain astride Philadelphia's south exit,
  and a hay bale floating in the Delaware.
- Riverbend and Philadelphia gained e2e visual-regression baselines; the Caribbean was previously
  the only field map with one.
- **What is not decidable from pixels alone**, and is deliberately not tested: whether a footprint
  *clips* its sprite. These packs abut sprites with no transparent gutter — the bohío huts sit
  directly on top of one another — so "ink continues past this rect" cannot distinguish one sprite
  spanning two cells from two complete sprites touching. That stays a preview-PNG read, per the
  verification ladder.
