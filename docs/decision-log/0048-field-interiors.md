# 0048 — A field map can open into a room

**Phase 65.** Status: accepted. Extends `0040-institute-traversal-and-one-building.md`, whose
`activeHub*()` switches this mirrors one for one.

## Context

Every field map in the game was one flat outdoor surface. A building was a solid stamp with a door
painted on it, and whatever happened inside it happened in dialogue or did not happen. That was
sufficient while a case's records were three objects and three people standing in the open, and it
stopped being sufficient the moment two units were planned around documents that only exist indoors:
a printer's order book on the press-room table, a boardinghouse register behind the keeper's
counter, a slave trader's day book, a hospital ward's register page.

There was already a working answer to this problem in the same file. The Institute is three rooms of
three different sizes — Entrance Hall 20×18, Main Hall 23×12, Archive Room 20×12 — switched by a
single persisted field `progress.currentHubRoom` and resolved through
`activeHubGrid()`/`activeHubBlocks()`/`activeHubTargets()`/`activeHubNpcRuntime()`. Nothing about
that pattern is hub-specific. The decision here is mostly the decision *not* to invent a second one.

## Decisions

### 1. An interior is the same shape as an outdoor map

`FIELD_MAPS[unitId].interiors` is a record of surfaces, and each one declares exactly the fields an
outdoor map declares: `id`, `grid`, `isLand`, `blocks`, `roads`, `npcs`, `behaviours`,
`sourcePoints`, `musicScene`, `worldMarkup` — plus three of its own, `entry`, `exit` and `door`.

That equality is the whole design, and it is worth stating why rather than treating it as tidiness.
`isFieldBlocked()`, `isFieldGroundStandable()`, `fieldNavGridFor()`, `buildFieldNpcRuntime()`,
`updateFieldProximityUi()` and `nearestFieldInteraction()` already read the map through one
accessor. Making `activeFieldMap()` return the room instead of the town meant **all six carried over
to interiors without being touched.** Collision, NPC behaviour, routing, proximity styling and
record anchoring work indoors because they were never told they were outdoors.

The three extra fields are the door on both sides of itself: `door` is where the marker stands on the
outdoor map, `entry` is where the player lands inside, `exit` is the threshold cell that sends them
back.

`isLand` is required rather than optional, and a shared `interiorGround(grid)` factory supplies it —
a plain in-bounds test, because an interior's walls are collision rects, not a coastline. A surface
that omits it throws `map.isLand is not a function` on the first movement frame, which is a boot
failure rather than a graceful degradation, so the factory exists to make the correct answer the
short one.

### 2. Two persisted fields, and the second one is not derivable

`currentFieldRoom` (null means outdoors) and `fieldReturn` (`{ x, y, facing }`, captured on entry)
extend `DEFAULT_PROGRESS` and the `readProgress()` merge, per the documented pattern for new
persisted fields.

`fieldReturn` could in principle be recomputed from the door's own coordinates, and should not be.
The player did not necessarily arrive at the door from the front, and putting them back on a fixed
doorstep rather than where they were standing is the kind of small dishonesty that reads as a bug.
It is persisted rather than held in a module `let` for the same reason `currentFieldRoom` is: a
refresh inside a building must come back inside that building. An early build put the player
outdoors on reload, which is a silent save-shape bug rather than a visible one.

### 3. A door is an interaction, not a trigger volume

`nearestFieldInteraction()` gained a third kind alongside `npc` and `source`, at the same 1.45-tile
reach and in the same nearest-wins sort. Walking over a threshold does not enter a building; pressing
`E` or clicking within reach does.

This is the proximity-gated-interaction invariant applied to a new noun, and it has a cost that shows
up immediately in authoring: **a door competes with everything else at that reach.** Canal
Crossroads learned this the expensive way when its editor stood a tenth of a tile from the print
shop's threshold and made the room unreachable from every approach. The convention that came out of
it — post a doorstep NPC two and a half tiles clear of the door — is now written into the source
comments beside both units' rosters.

### 4. A room smaller than its frame is centred, not clamped

The outdoor camera follows the player and clamps at the world's edges. That formula degenerates to a
top-left pin the moment the world stops being bigger than the viewport, which every interior is on at
least one axis. `updateFieldPlayer()` centres instead when `worldWidth <= viewport.width` (and
independently on y).

This does **not** breach the camera invariant. The camera is still a pure function of player
position; for a small room it is a constant one. The Chimborazo ward at 24×14 is the only interior
that exceeds its frame on both axes and therefore the only one that still scrolls — which is also
why it is the only baseline that proves the scrolled path draws to the edges.

### 5. Records are per-surface; the checklist is not

A case's `sources` list is the whole case's, on every surface. `fieldSourceSignal()` therefore had to
gain a guard: a record whose source point is not declared on the current surface draws nothing here.
Without it, the three records out in the town rendered inside the print shop as live markers stacked
on `sourcePointPosition()`'s (10,10) fallback, in the middle of the room.

The **Records to Recover** checklist is deliberately the opposite. It lists all of a case's records
wherever the player is standing, because it is the only thing that tells them there is anything
behind a door at all. (Phase 73 found that this cut both ways: the checklist was reading source
points off the *active* surface too, so every record living elsewhere fell through to its long
historical title instead of naming the person carrying it. It resolves across every surface of the
unit's map now.)

### 6. Recall to Archive is suppressed indoors

Recalling to the Institute from inside a building would leave `fieldReturn` pointing at a room the
player is no longer standing in. The beacon simply does not render on an interior surface; step
outside first.

## Consequences

- Four rooms exist across two units: Canal Crossroads' printing office (20×14) and canal-side
  boardinghouse (22×14), Richmond's commission-house counting room (18×14) and Chimborazo ward
  (24×14). Each is a generated `.tmj` + `.blocks.js` from the same `MapBuilder` pipeline as an
  outdoor map, so none of it is a second art workflow either.
- `FIELD_GRID` stays exported and stays 56×36. It is the outdoor constant the coordinate test
  asserts against; interiors declare their own grid, which is what `activeFieldGrid()` is for.
- **Interiors must be attached after the `FIELD_MAPS` literal, not inside it.** A room's `blocks`
  const is declared further down the file, and reading one from inside the literal is a
  temporal-dead-zone `ReferenceError` that takes the app down on boot. Both units' blocks carry a
  comment saying so.
- `tests/unit/field-map-coordinates.test.js` gained an interior suite that enrols automatically off
  any `FIELD_MAPS` entry via `describe.runIf` — it ran against zero rooms when it was written and
  four now, with no edit. It reuses the existing `hubTraversal()` flood fill: connectivity from
  entry, no sealed pocket of open floor, entry and exit standable, NPCs off furniture, territories
  1.5 tiles apart. It has caught two real sealed pockets (a woodpile in Richmond's churchyard, a
  potted fern in the ward's south-east corner) and two NPCs standing in furniture.
- `tests/e2e/field-interiors.spec.js` and `tests/e2e/richmond-interiors.spec.js` bank the
  walkthrough for both units.

## What this is not

Not a cutscene system, not a portal graph, and not a general "sub-map" abstraction. An interior
belongs to exactly one unit's outdoor map and is reachable only from its own door. There is no
interior of an interior, no interior shared between units, and no route that enters one — a room's
`roads` is `[]` on all four, because a room has no roads and the router has no business in it.

The engine shipped **dormant** at Phase 65: no map declared `interiors` for two more phases. It was
verified end to end against a scaffold that reused `archive-room.tmj`, and that scaffold was removed
rather than committed, because a canal storehouse opening into a copy of the Institute Archive is
incoherent content on a unit students already play.
