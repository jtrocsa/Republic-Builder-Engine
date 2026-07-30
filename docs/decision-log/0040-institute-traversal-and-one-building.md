# 0040 — A room you can walk, and two rooms that are one building

Status: accepted · Phase 58 (parts 1, 4, 5) · 2026-07-29

## Context

Playtesting the Phase 54–57 build produced a short report, and two items on it were the same defect
seen from different angles: **"I am getting stuck in the chronicle institute often… I can't even
reach the preservation case."**

A flood fill from the Main Hall's spawn at (11.5, 9) over `INSTITUTE_HALL_BLOCKS`, using the real
`hubFootBoxFor()` and `isHubBlocked()` rules, reached ~3,900 cells and never got within **3.3 tiles**
of `HUB_TARGETS.trophy`. The whole west end of the room was sealed: `sampleShelfC` at (5,4) plugged
the rows-4/5 cross-aisle, a reading table plugged the column beside it, and the west cabinets plugged
the south band from col 1 to col 7. What remained was a maze of one-tile lanes and isolated pockets.

Phase 57 had added a guard for exactly this area. It asserted that every `HUB_TARGETS` entry has _a_
clear cell within reach and that every spawn cell is clear — and it was green the whole time.
Clearance is a local property. Reachability is not, and only the second one is what a player
experiences.

## Decision

### Two open corridors, two lanes

The layout changed, not the collision. `generate-institute-hall-tmj.js` now alternates its four row
bands:

```
rows 0-1    north wall, Archive Room doorway at cols 11-12
rows 2-3    record storage, wall to wall
rows 4-5    OPEN cross-aisle, cols 1-21, no solid stamps at all
rows 6-7    the working middle, with lanes at cols 3-4 and cols 9-12
rows 8-9    OPEN south aisle, cols 1-21, no solid stamps at all
rows 10-11  south wall, foyer entrance at cols 11-12
```

Two full-width corridors joined by two lanes cannot produce a sealed pocket. That is the point: the
property is a consequence of the shape rather than something to re-verify by eye after every
furniture move. Everything that dresses the corridors is `decor` (rugs, stools) or `base` (planters),
so they read as furnished without narrowing.

`generate-archive-room-tmj.js` was rebuilt to the same rhythm — see below.

### Where `base` is and is not safe

A `base` stamp blocks only `[baseRow + 0.4, baseRow + 1]`, which is what makes walk-behind work, and
which also leaves the cells _above_ it open. In an open corridor that is a feature: the player rounds
a 1-tile planter without thinking. Against a wall it is a bug — a 1-tile `base` prop standing in a
2-tile nook seals that nook, because the only route in is the strip the prop blocks.

Both north-wall props hit exactly that case (the founding stela in the west corner, the tall planter
in the east) and both are `solid` now. Nothing is lost: the cell they would have let the player stand
in is a dead end against the wall, so there was never a walk-behind to see. The south-aisle planters
stay `base`, because the aisle runs past both sides of them.

This was caught by the new guard while drafting the layout, not after shipping it.

### The compass is 1x1 and sits on the table

"The big compass should be made smaller and placed on the nav table." The prop was drawn 2x2 — 96px,
about the player's own height — standing in the middle of the hall's main east–west aisle, where it
was one of the collisions marked on the screenshot and also a joke about the size of a compass.

Two small pieces of machinery made the request literal:

- `scripts/assets/pack-objects.js` gained a `scale` option (one `sharp.resize()`), so a derived sheet
  can hold a sprite at a footprint the source pack never drew it at. `nearest`, not a smoothing
  kernel: mitchell and lanczos3 were both rendered and compared at 6x, and each produces a visibly
  soft object that sits wrong beside the packs' 1px outlines.
- `MapBuilder.overlayStamp()` draws a prop on the overlay layer instead of `structures`. `stamp()`
  writes one tile per cell, so stamping the compass onto the table's top would have replaced that
  tile and shown floor around it. Overlay composites over the furniture. Only safe on cells the
  player can never stand on — a `solid` object's own footprint — since overlay art draws above them.

### Recall lands at the Navigation Table

Both recall paths (`field-recall`, `return-archive`) arrived at the Archive Room door in the _north_
wall — the far corner of the hall from the object the player left through — so every return from
Chronotravel began with the same walk back across the room. Both now spread
`safeInstituteSpawn(...instituteRecallSpawn())`, derived from `HUB_TARGETS.table`, so the two cannot
drift apart the way six hardcoded spawn literals did before Phase 57.

The onboarding hallway arrival keeps the foyer spawn: that one is a first entrance, not a return.

### The Archive Room is the same building now

It was the last generator not on `MapBuilder`, and all four consequences were visible in the room:

- **Collision was hand-written** — eleven rects transcribed by eye into `main.js`, with the matching
  rect in a trailing comment on each stamp. Generated from the stamps now, like every other map since
  Phase 53.
- **No overlay layer**, so nothing had walk-behind depth.
- **The floor was a quadrant shuffle**, `(col * 3 + row * 5) % 4`, scattering four cells authored to
  sit together as one 2x2 block — the same mistake Phase 52 found on the field maps.
- **Three shelf runs drew twice their footprint** and both plants drew half of their neighbour,
  because sizes were bare literals at the `gidRect(entry, 4, 2)` call sites and the palette declared
  no footprints at all. `wallTorch` pointed at the bottom half of a 2-row sconce. None of it could
  fail `tile-footprints.test.js`, which checks a _declared_ footprint.

And the room had no walls: its perimeter was implied by furniture runs with the page background
beyond, which is the main reason it did not read as the same building as the Main Hall. It now uses
the same four sheets, the same wall and floor materials, the same furniture cells, and the same
four-band layout.

The Archive Terminal moved onto the doorway's own columns at the head of the plank runner. An
intermediate draft put it at the far end of the north band, which made every visit "up a lane, then
turn east", because the middle band's tables stand between the aisle and the desk. A room the player
crosses dozens of times per unit should not make them round a corner to reach the one thing they came
for.

## Consequences

- **The guard is now reachability, not clearance.** `tests/unit/field-map-coordinates.test.js`
  flood-fills both hub rooms from their spawn and fails on any open cell it cannot reach, any target
  outside the reachable component, any spawn entry point outside it, and any patrol waypoint inside
  geometry. It failed on the shipped map (`1145 cells in x 1.3–21.7, y 2.1–8.9` stranded, `trophy`
  unreachable) before the re-lay and passes after.
- **Both hub rooms were measuring with the wrong foot box.** They used `footBoxFor` — the _field_ box,
  0.68 wide against the hub's 0.56 — so every gap assertion in both rooms was against a player who
  does not exist. `hubFootBoxFor()` is exported and used now.
- **The e2e walkers stopped being stopwatches.** `walkToHubTarget()` joins `walkToNpc()`: both read the
  game's own `.is-near` class and route by reading positions each step. The timed holds they replaced
  encoded one specific furniture layout ("east until the record chest stops you at x=18.72"), which is
  why the room being re-laid broke assertions about a thing that was working. The shared walker also
  had a real bug — a single `preferVertical` flag can only unstick a blocked _horizontal_ burst,
  because clearing it hands the choice back to "larger gap wins", which picks the blocked axis again
  whenever that axis is also the longer one. The Preservation Case walk deadlocked on exactly that.
- **A palette sheet missing from `main.js`'s resolver is not a missing tile.**
  `createTilesetImageResolver()` throws, `renderTiledMap()` rejects, and the whole map draws as an
  empty frame. Adding the derived compass sheet to the palette without adding it to the glob list did
  this to the entire Main Hall; the visual-regression baseline is what caught it.
- `floor.archive.sandstone` lost its last consumer and says so; `floor.archive.stone.b/c/d` are
  hallway-only now.
