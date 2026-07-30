# Art & Map Style Guide

The rules for map art. Read this before touching any `.tmj`, palette, or tileset pack.

This guide states **rules and per-setting assignments**. It deliberately no longer carries the
tile-by-tile dictionary it used to — that is now real, checkable code and data:

| For                                                            | Read                                                                                                             |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| The one canonical tile per element, with coordinates           | [`apps/web/src/content/tilesets/canonical-palette.js`](../../apps/web/src/content/tilesets/canonical-palette.js) |
| What is on each of the 250 sheets, and which packs are benched | [`TILE-LIBRARY-CATALOG.md`](TILE-LIBRARY-CATALOG.md)                                                             |
| What a specific map uses                                       | `apps/web/src/content/tilesets/maps/<map>.palette.js`                                                            |
| Which packs a future map will use                              | [`maps/planned-maps.js`](../../apps/web/src/content/tilesets/maps/planned-maps.js)                               |
| How to export a map from Tiled                                 | [`tiled-map-import-checklist.md`](tiled-map-import-checklist.md)                                                 |

Also pairs with decision log `0031` (art-style unification) and `0033` (this pass).

## Why the dictionary moved into code

A markdown table cannot be checked. The previous version of this guide named canonical sheets in
prose, and two of its claims turned out to be wrong once they were audited against the maps that
actually ship:

- It named `Medieval Tavern/tile-B-01.png` as the canonical interior floor. A GID audit of
  `archive-room.tmj` shows its entire ground layer sits in the `firstgid: 513` range — that is
  **`tile-B-05.png`**. `tile-B-01.png` contains no floor textures at all.
- Its scope line described "the 9 tileset packs already in the repo (87 files, not 'thousands')."
  The library is **28 packs and 250 sheets**, and the packs that arrived later include the
  strongest material in the collection.

Both errors were invisible because nothing could fail on them. Now `npm run test` fails if a
palette names a sheet that does not exist, a coordinate outside its sheet, an off-grid sheet, or
a benched pack.

## Non-negotiables

- **48×48px tiles, orthogonal, CSV tile-layer format, no flip/rotate.** The loader
  (`tiled-map-loader.js`) reads plain `data: [gid, ...]` arrays and ignores flip flags.
- **Never guess a tile coordinate.** Run `npm run assets:label -- "<Pack>/<sheet>.png"`, which
  writes a coordinate-labeled copy to the gitignored `reports/assets/labeled/`, and read it off
  the grid.
- **Tileset image resolution is a per-pack scoped `import.meta.glob` naming exact files** — never
  a whole-folder `/**` glob. This has regressed twice, once shipping 117 MB of unused art. The
  palette names sheets; `main.js` still globs them individually.
- **Collision for a field map is generated from its stamps** (Phase 53, decision log `0036`). Each
  generator writes `<map>.blocks.js` alongside its `.tmj`; `main.js` imports it into `FIELD_MAPS`.
  Land/water masks stay hand-written predicates (`isCaribbeanLand`-style), deliberately duplicated
  between `main.js` and the generator so a mismatch is a code-review catch.

  _This amends the previous rule, "collision is always a separate hand-coded array in `main.js`."_
  That rule was written when maps were hand-placed and it held for exactly as long as the two
  halves were small. What it produced instead was every generator carrying the matching rect in a
  trailing comment on every `stamp()` call, and a building getting only a ground-contact row — so
  the player could walk onto roofs and render pasted on a facade. Nothing is derived from the
  `.tmj` even now: the rect comes from the stamp that also wrote the tiles, which is upstream of
  both.

- **A stamp declares what it is; the rect follows.** `solid` blocks the whole footprint (buildings,
  carts, market stalls — anything you cannot enter). `base` blocks only the ground-contact row and
  lifts everything above it to the map's `overlay` layer, so the player walks behind the canopy
  (trees, palms, poles). `decor` blocks nothing. Unreachable scenery — a tree line outside the
  walkable rectangle — is `decor`: a rect the player can never touch is noise in the array.
- **`ground` is opaque; `structures` and `overlay` are cut-outs.** A ground tile with see-through
  holes shows the page background through the world. A fully-opaque tile stamped above the ground
  is a hard-edged square of swapped material — that is what put tan squares of sand in the middle
  of green grass and a patch of a different blue inside the water. Anything that genuinely is a
  floor (pier decking, a paved quay, a moored boat with its own water painted in) goes on `ground`.
  Enforced by `tests/unit/map-tile-integrity.test.js` against the actual pixels.
- **Terrain is tiled in its authored block, by parity.** These packs draw ground as 96×96 (2×2)
  blocks whose quadrants only read as continuous texture in their authored arrangement; some are
  horizontal strips instead. Declare the footprint on the palette entry and use `groundBlock()`.
  Picking among a block's quadrants at random reads as a visible quilt, not as ground.
- **Scattered detail is an object, not a swapped ground tile.** A tuft, a shell, a piece of
  driftwood, a coral head — stamp a transparent prop on `structures`. Using one quadrant of a
  terrain block as an "accent" is how the shipped maps got half a log and a quarter of a coral
  cluster.
- **An object's footprint is data, measured from the pixels** — `tile(sheet, row, col, { h, w })`,
  checked by `tests/unit/tile-footprints.test.js`. When the art is not on the tile grid, repack it
  into `assets/tilesets/derived/` via `npm run assets:pack-objects` rather than picking a rect that
  clips it or catches its neighbour. `npm run assets:measure -- "<sheet>" <row> <col>` reports the
  real bounds.
- **When a `.tmj` is generated by a script, the script is the source of truth.** Re-run it; never
  hand-edit the JSON. All five live maps are generated.
- **Tile identity lives in the palette, layout lives in the generator.** A generator script must
  not contain a raw `gid(row, col)` literal for a tile the palette could name.
- **Shore props are derived from the coastline, not transcribed from it.** Every field map draws
  its shoreline from a curve, so a hand-picked coordinate that is beach today is open grass or
  open water after any rescale. Seed the prop and settle it with `MapBuilder.snapTo()`.
- **An interior must be fully connected — no pocket of floor the player cannot reach** (Phase 58,
  decision log `0040`). Both Institute rooms alternate their row bands: two full-width open corridors,
  no solid stamps at all, joined by lanes at least two tiles wide. Two open corridors joined by two
  lanes cannot produce a sealed pocket, which is the point — the property is a consequence of the
  shape rather than something to re-verify by eye after every furniture move.

  The Main Hall shipped without this. Its west end was sealed behind three furniture runs and the
  Preservation Case sat 3.3 tiles from anywhere a player could stand, on a screen every session passes
  through. The guard at the time asserted that each target had _a_ clear cell within reach —
  clearance, which is local, and not the property a player experiences.
  `tests/unit/field-map-coordinates.test.js` now flood-fills both rooms from their spawn and fails on
  any open cell, target, spawn entry point or patrol waypoint outside the reachable component.

  Two corollaries, each of which was a defect first:

  - **`base` is unsafe against a wall.** It blocks only `[baseRow + 0.4, baseRow + 1]`, leaving the
    cells above it open — fine in a corridor the player rounds, sealing in a two-tile nook where that
    strip is the only way in. Use `solid` for a wall-side prop; the walk-behind it gives up was a dead
    end nobody could see anyway.
  - **A prop that sits _on_ another prop goes on `overlay`, not `structures`.** `structures` holds one
    tile per cell, so stamping the second one replaces the first and shows floor around it. Use
    `MapBuilder.overlayStamp()`, and only on a cell the player can never stand on (a `solid` object's
    own footprint), since overlay art draws above them.

- **Every building has a road to its door, and the road is routed, not authored** (Phase 55,
  decision log `0038`). A generator declares only a trunk — a high street, a quay, a village spine —
  on a `RoadNetwork`, then hands `connectAll()` the door cell of every building it stamped;
  `doorCellOf(stamp)` derives that cell from the stamp itself. An unreachable door is a hard
  generator failure, and `tests/unit/map-path-network.test.js` re-checks the committed maps.

  _This replaces "paths are hand-placed tile runs."_ That rule produced roads with no relationship to
  the buildings: the Caribbean's only path ran past the Taíno village and on through empty grass to
  nothing, with no hut connected to it at all.

  Four rules follow from it, each of which was a defect first:

  - **A road material must be full-bleed and tiled by parity.** `path.tropical.left`/`.right` carry a
    baked-in grass edge down one side, so a run using them can only ever go north–south. That is
    literally why the Caribbean had one vertical line. Use a full-bleed block via `groundBlock()`.
  - **A road is packed earth — `path.packed.earth` — on every map, tropical or temperate** (Phase 58,
    decision log `0041`). Phase 55 satisfied the full-bleed rule above by reaching for whatever ground
    tile the map already had, which made Caribbean's tracks literal beach sand and Riverbend's the
    fishing pack's wet-sand _shore strip_. Both read as a patch of sand dropped on grass, because they
    were. Check a new road on an `assets:preview-map` render against that map's own grass before
    committing it; do not assume a material reads as a road because it is not grass.
  - **Network membership is recorded, never inferred from the tile.** This mattered acutely while
    Caribbean's tracks were the same sand as its beach — "is the tile here the road material?"
    connected waterfront buildings to the shoreline instead of to the village. It stays the rule now
    that roads are a distinct material: a spur that crosses paving is still road.
  - **A softer material yields to a harder one at a seam.** Pass `harder` and let the spur join a
    paved cell without repainting it. Hand-tuned stop offsets do not survive a curved boundary —
    Philadelphia's dirt lane punched a brown rectangle into the quay at some columns and stopped
    three tiles short at others.
  - **Route after every stamp, before the final scatter pass.** Routing earlier threads a spur under a
    tree trunk whose collision rect then blocks the path it just painted.

## The art-style rule

**One painted 48px family is canonical.** These packs mix cleanly on a single map:

> Island survival · Medieval Fantasy Town · Medieval Fishing Village · Medieval harbor ·
> Medieval Tavern · 19th Century European City · 19th Centruy European Dock · Wild West ·
> Steampunk · Factory · Construction · war ruins · farm · office · University · Living room ·
> Highway Rest Area · Modern Park · WWI Fleet · WWI Military Equipment · modern military ·
> Common Cause Philadelphia

**Benched:** `Modern World` (flat overworld art language), `Green Apocalyptic 1` (no APUSH
setting), `Green Apocalyptic 2` / `Modern Interiors` (off-grid, technically unusable), `army` and
`Labratory` (anachronistic / sci-fi). Reasons per pack are in the catalog. Benching is a
documentation act — the files stay on disk, and the palette test enforces that nothing references
them.

**Do not mix water families.** Island survival, Medieval harbor and 19th Centruy European Dock all
render water at different saturation and outline weight. Pick one per coastline.

### Standing content exclusions

These are permanent, not per-map judgement calls:

- **Medieval Fantasy Town's signed buildings** — "Adventurer's Guild", "The Sword & Shield",
  "The Griffin's Rest", "Weapon Shop", "POTIONS". A readable fantasy sign baked into the pixel art
  is a worse anachronism than an unlabelled silhouette. Only unlabelled cottage/hall/church/
  watchtower art may be used. (Decision log `0032`; `common-cause-field` already swaps a sign row
  for plain stone wall to honour this.)
- **Medieval Fantasy Town's castles and magic** — sheets `12` and `17` (crenellated fortresses,
  portcullises, drawbridges) and `7`/`10`'s potion shelves, crystal balls, rune stones, wizard
  statues and weapon racks.
- **farm's modern vehicles** — the tractors, pickups and vans on `3.png` and `6.png`.
- **war ruins' modern intrusions** — cars, vans, graffiti, wheelie bins, playground equipment.
- **Island survival's coloured gem and crystal deposits** on `tile-B-05`/`tile-B-06`.

## Per-setting palette assignments

Same element, different era. This is what keeps "grass" meaning one specific tile _within_ a
setting while letting settings look distinct from each other. Live maps first; the forward slate
for Periods 1–9 lives in `planned-maps.js`.

### Caribbean, 1492 — `case-001`, `caribbean-field.tmj`

Island survival throughout: `tile-B-01` for all terrain, `tile-B-02` for the bohío huts. Generated
by `scripts/generate-caribbean-tmj.js` against `caribbean-field.palette.js`. The generator
duplicates `main.js`'s `isCaribbeanLand()` ellipse mask deliberately, so the art's coastline and
the walkable boundary cannot drift apart — **do not "deduplicate" that.**

### Riverbend, ~1620s New England — `case-004`, `riverbend-field.tmj`

`farm/6` for terrain (the grass block, the planted crop blocks, ploughed soil, split-rail fencing,
well and shed) + Medieval Fishing Village `tile-B-04` (river, shore, pier decking, dockside
clutter) + `derived/farm-trees` and `derived/farm-buildings` for the tree line, orchard and
clapboard housing. Generated by `scripts/generate-riverbend-tmj.js`. This was the last
hand-authored map in the repo until Phase 52 gave it a generator.

Two arrangements here are load-bearing and easy to undo by accident. The **crop plots are two
layers** — ploughed soil on `ground`, the planted rows above it on `structures` — because the
pack's planted blocks are transparent between the stems; laying them straight onto the ground
shows the page background through every field. And **`soil` is the single furrow tile at (7,2),
not the bare-soil block at (8,2)**, which looks like the obvious choice and is 9–18% see-through.

### The Institute — Main Hall, Archive Room, onboarding hallway

Medieval Tavern `tile-B-05` (floor, doors, benches, sample shelves, torches), `tile-B-03` (record
shelving, cabinets, chests, pennants, greenery, rugs, hearth, writing desk), `tile-B-01` (long tables,
round table, stools) and `Auto-tile-A4-walls-2` (wall surfaces — surface rows only, no autotiler
needed). The Main Hall adds `Island survival/5` for three Institute artifacts nothing in the tavern
family can stand in for (the compass-rose Navigation Table, the Preservation Case plinth, the founding
stela) plus `derived/institute-artifacts` for the 1×1 compass on the table.

Reusing tavern furniture for a present-day archive is **deliberate and documented** (decision log
`0030`), not an unaddressed mismatch. Use only shelving/table/bench/stool/torch pieces — avoid overtly
tavern-specific props (tankards, wine racks, drinking banners, and the round table at `tile-B-03`
(10,6), which has a roast dinner painted on it) that break the "archive record storage" reading.

**The two walkable rooms are one building, and that is a rule, not a coincidence** (Phase 58, decision
log `0040`). Where they share a piece of furniture they name the identical sheet cell; both use the
same wall and floor materials, the same four-band layout, generated collision and an overlay layer.
Keep them in sync by hand rather than importing one palette into the other: they are two maps with two
sheet orders, and a shared module would make a GID in one room depend on an edit in the other. All
three maps declare the same sheets in the same order so Vite bundles no extra image.

### Common Cause, 1770s Philadelphia — `case-007`, `common-cause-field.tmj`

Medieval Fantasy Town `2.png` (cobble, grass, market stalls, well, fountain, street furniture),
Medieval Fishing Village `tile-B-04` (Delaware, quay, piers, quayside cargo), Medieval harbor
`tile-B-04` (moored shipping — its water is never used here), `farm/6` (churchyard rail, produce),
`derived/farm-buildings` and `derived/town-civic` for every building, and the PixelLab-generated
liberty pole, the one element with no equivalent in any purchased pack.

**Phase 53 retired the Medieval Fantasy Town building silhouettes on this map**, which decision log
`0032` had accepted as a forced compromise. They were not merely a stylistic mismatch: `1.png`'s
houses are painted as one continuous mass with no gutter between them, so any whole-tile rect cut a
window out of the middle of it, and `5.png`'s assembly hall was full-bleed stone-wall terrain. What
replaced them is `farm/7`'s painted clapboard, repacked onto the grid. A two-storey sash-windowed
clapboard with a portico and dormers is a defensible 1770s statehouse; a half-timbered guild hall
never was. The **Georgian/Federal civic architecture gap stays registered** — this is a good
stand-in, not the real thing.

## Gap register

Elements with no acceptable tile anywhere in the library. Recorded so a map author stops and asks
rather than forcing a bad fit. Mirrored in `canonical-palette.js`'s `GAPS` export, and the palette
test fails if a planned map claims a gap that is not registered there.

| Gap                                        | Detail                                                                                                                                                                                                                                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Indigenous North American architecture** | Longhouse, pueblo, plains lodge. Nothing fits. Island survival's bohío huts are Caribbean/Taíno-appropriate and correctly used for `case-001`; reusing them as generic "Native American" would flatten distinct cultures into one wrong image. Blocks `p1-indigenous-settlement`. |
| **Civil War military camp**                | Union/Confederate tents, artillery, earthworks. The WWI packs are the wrong war by fifty years; `army`/`modern military` by a century. Blocks `p5-civil-war-camp`.                                                                                                                |
| **Antebellum plantation great house**      | Greek Revival columned house. Fields and quarters are well covered (`farm/1`, `farm/2`, `farm/6`, `Wild West/tile-B-08`); the great house is not. Partial.                                                                                                                        |
| **Mid-century streetscape**                | 1950s-specific. Highway Rest Area / Modern Park / Living room read contemporary. Partial; acceptable stand-in, flagged.                                                                                                                                                           |

The **"modern institute interior"** gap this register used to carry is now **closed**, though not
yet actioned. It was recorded when the only candidate was the off-grid `Modern Interiors` pack;
`office/3.png` (double-sided library shelving), `office/4.png` (dark panelled walls),
`19th Century European City/tile-B-04.png` (parquet, bookcases, writing desk) and `Steampunk/5.png`
(card-catalogue cabinets, globes, brass telescopes) are all on-grid and in the painted family.
Recorded as the `institute-archive-restyle` candidate in `planned-maps.js`. **Restyling the hub is
a visual redesign needing its own sign-off — naming the tiles does not authorise doing it.**

## Camera & dialogue conventions — deliberately not redesigned

Both are invariant-protected in `CLAUDE.md`'s "Gameplay invariants" section, sourced from real
regressions across milestones 3.4.5–3.4.15. This section is unchanged from the previous revision
of this guide and is restated so it isn't silently reopened.

- **Camera** (`.field-viewport`, a pure function of player position, clamped and integer-rounded)
  stays exactly as it is. The current top-down 48px framing already reads reasonably close to a
  Pokémon-style camera; retuning zoom or aspect for marginal visual gain isn't worth risking a
  protected invariant.
- **Dialogue** (`.field-speech-bubble`, anchored above the speaking NPC, no world-transform reset)
  also stays exactly as it is. It is not a Pokémon-style full-width bottom text box, and that is
  deliberate — any future "more Pokémon" restyle should work _within_ the anchored-bubble mechanic
  (border treatment, optional portrait chip) using the existing `--navy`/`--gold`/`--paper`
  tokens, not restructure how dialogue attaches to the world.
