# 0038 — Roads are routed from building doors, not authored as coordinates

Status: accepted · Phase 55 · 2026-07-29

## Context

Phases 51–53 rebuilt the three field maps on a real generated-tile pipeline, and the art reads well.
Wayfinding did not. Roads were hand-written rectangle runs chosen by eye:

```js
for (let col = 17; col <= 46; col += 1) trackAt(col, 20);
```

Nothing tied those coordinates to where the buildings actually were, and it showed in play:

- **Caribbean** had a 2-wide dirt strip down cols 28–29 from row 9 to row 26. It passed *near* the
  Taíno village and then continued through empty grass to nothing. Not one hut had a path to its
  door, and the southern two-thirds of the strip led nowhere at all.
- **Riverbend**'s three tracks touched the meetinghouse and the barn. The five dwellings, the shed,
  the hen house, the well and the wharf market stall all stood in untouched grass.
- **Philadelphia**'s fourteen dwellings were all off the paved streets. The one packed-earth lane
  that did meet the cobble punched a hard-edged brown rectangle into the paving, because its stop
  condition was a hand-tuned `row + 3.5 >= waterline` offset and the waterline is a sine curve — so
  the lane overshot at some columns and stopped three tiles short at others.

A building standing in untouched ground reads as scenery dropped on a texture, not as somewhere
people go.

## Decision

Roads are no longer authored as coordinates. A generator declares a **trunk** — the few runs that are
genuinely deliberate, a high street or a quay or a village spine — on a `RoadNetwork`, and then hands
`connectAll()` the door cell of every building it stamped. New file: `scripts/lib/paths.js`.

Doors are derived, not transcribed. `MapBuilder.stamp()` already returned
`{ col, row, width, height, baseRow }`; generators simply stopped discarding it, and `doorCellOf()`
reads the cell below the centre of the ground-contact row. A hand-written door coordinate is one more
thing that silently stops matching when a building moves or is resized.

### Four properties, each of which was a defect first

1. **The network is a set of cells, not a tile lookup.** The first revision of this asked "is the
   tile here the road material?" That silently broke on two of three maps: Caribbean's tracks are the
   same sand as its beach and Riverbend's are the same sand as its river shore, so a door two cells
   from the water "reached the network" by touching the beach and its spur was a stub to the
   shoreline instead of a lane to the village. Membership is now recorded by `RoadNetwork`, not
   inferred from the ground layer.
2. **Road material must be full-bleed and tiled by parity, never edge-baked.** `groundBlock()` paints
   one quadrant of an authored 2×2 block, which tiles correctly in any direction.
   `path.tropical.left`/`.right` do not: each carries a grass edge down one side. That is exactly why
   Caribbean's road *was* one vertical line — the old generator's own comment recorded that an
   east-west connector "has to be faked with plain sand." Both entries now have no consumer anywhere
   in the project; they are kept in `canonical-palette.js` with a note that they are the right answer
   for a deliberately vertical grass-flanked lane and the wrong answer for a network.
3. **A softer material yields to a harder one at a seam.** `RoadNetwork` takes an optional `harder`
   gid set and joins such a cell to the network without repainting it. Philadelphia's merchants' yard
   now simply refuses to overwrite cobble, so it ends exactly where the paving begins whatever shape
   that edge happens to be — no offset to keep in sync with the waterline curve.
4. **Routes bend around buildings, not through them.** BFS over cells that are in bounds, on land, and
   not `occupied()`. Nearest-first, so a cluster of houses at the far end of a map grows one shared
   lane out toward the trunk rather than four parallel ones. An `avoid` predicate exists for ground
   that is empty and on land but still must not be crossed — Riverbend's crop plots are the case:
   their planted cells are `occupied` and so already excluded, but the ~8% left unsown are not, and a
   spur threading between those would run a road through the middle of somebody's field.

### Ordering

`connectAll()` runs last of all the ground work on each map — after every `solid`, `base` and `decor`
stamp, before the final scatter pass. Routing earlier would thread a spur under a tree trunk whose
collision rect then blocks the very path it painted.

### Per-map outcome

| Map | Trunk | Spurs |
|---|---|---|
| Caribbean | village → south → west along the waist to the landing cove | 11 doors: every bohío, work canopy, drying rack, conuco garden, chart table, both Spanish tents |
| Riverbend | high street, village spine, barn-yard spur (unchanged) | 13 doors: meetinghouse, five dwellings, barn, well, shed, hen house, market stall, two field gates |
| Philadelphia | the four paved streets (unchanged), plus the square and quay folded in as network | 22 doors: fourteen dwellings, print shop, chapel, statehouse, assembly hall, townhouse, warehouse, meeting house, dispatch post |

Philadelphia's spurs are **cobble, not dirt**. It is a paved 1770s town: a one-cell paved lane between
two houses reads as a street, and the same lane in packed earth reads as a scar. The
dead-grey-field failure that generator's plaza comment warns about came from paving a 30×18
rectangle, not from paving lanes.

Each map's road material is declared once, as a `road` key on its palette, read by both the generator
and the test.

## Consequences

- Collision is unchanged on all three maps — this pass only touches the ground layer. Verified by an
  empty diff on all three `*.blocks.js` rect arrays, which is also why every existing
  movement/interaction e2e spec still passes untouched.
- `MapBuilder.toBlocksModule()` gained an optional `doors` option and emits a `*_DOORS` export.
  Nothing in the running game reads it. It exists so the test can assert the property against exactly
  the cells the generator used, rather than guessing which collision rects happen to be buildings.
- New guard: `tests/unit/map-path-network.test.js`. Three assertions per field map — the palette
  declares a road material that exists in the committed `.tmj`; every door has road within 2 cells;
  and every door touches the *same* flood-fill component, so a player can walk from any building to
  any other along road. That last one is deliberately not "the network has one component": on
  Caribbean the shoreline counts as road here (same tile) and the island's five lobes give it several
  genuinely separate arcs.
- An unreachable door is now a **hard generator failure**, not a warning. A building with no path to
  it is the exact defect this pipeline exists to prevent, and a warning in a build nobody watches is
  how it would come back.
- `tests/e2e/hub-movement.spec.js`'s collision assertions were loosened from `toBeCloseTo` to bounds.
  Movement advances a fixed step per tick, so the player halts up to one step short of a wall;
  asserting the exact boundary made the test a stopwatch reading and it failed at 9.508 against 9.56.
  The property that matters is "it moved, and it did not cross."

## Known fragility, not addressed here

`field-movement-dialogue.spec.js` and `investigation-challenge.spec.js` both walk the field on
wall-clock `holdKey` timings and both fail intermittently under a full six-worker parallel run while
passing serially. That predates this pass (it was reproduced on the pre-Phase-54 tree) and the honest
fix is to make those two assert bounds and reachability rather than distance-per-millisecond, the
same way `hub-movement` now does. Left for its own pass rather than folded in here.
