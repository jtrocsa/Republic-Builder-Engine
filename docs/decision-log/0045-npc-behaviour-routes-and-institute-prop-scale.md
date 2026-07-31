# 0045 — An NPC has a job; a stool is not as tall as a person

**Status:** accepted · **Phase 62** · follows
[`0044`](0044-cast-scale-locomotion-and-grounding.md), which fixed how the cast moves and left open
what it is moving _for_.

## What was wrong

Four things, from one playtest note and two screenshots.

**1. Field labels sat across everyone's boots.** The name pill was positioned in the NPC button's
own pixels — `top: 64px` inside a 79px button, which is +24.5px from the anchor against a sprite
whose sole is at +27.8px. The Institute's pill read correctly by luck: `top: 98%` of a 48x56 box
happens to clear a hub sprite. Six layered `top` declarations had accumulated on the field rule
(70/82/74/64px, a narrow-viewport 56px, and four per-character 63px overrides), each nudging a
number that was measuring the wrong thing.

**2. Movement was still stop-start.** Phase 61 gave NPCs a believable _speed_; it did not make them
move _continually_. A wanderer walked about 40% of the time against a 0.6–3.2s pause, so most of the
cast was standing still at any moment. Their seeds differed, so they were out of phase — but they
shared a cadence, and a street of people on one cadence reads as a single thing slightly out of sync
with itself.

**3. Nobody had a reason to be anywhere.** A random point in a disc is more varied than the
four-waypoint rectangle it replaced and it is still nobody doing anything.

**4. The Institute's furniture was drawn at the wrong scale.** Measured as painted alpha bounds
against the cast's 45px standing body:

|                      | painted   | vs. body  | should be |
| -------------------- | --------- | --------- | --------- |
| stool                | **45px**  | **1.00×** | ~0.30×    |
| stoolAlt             | 46px      | 1.02×     | ~0.30×    |
| lowBench             | 37px      | 0.82×     | ~0.30×    |
| dwellings (all maps) | 94–183px  | 2.1–4.1×  | correct   |
| mature trees         | 129–142px | 2.9–3.2×  | correct   |

The buildings and the trees settle it: the cast size from Phase 61 is right, and the defect is that
every 1x1 prop in these packs is drawn to fill its 48px tile whatever the object is. A stool exactly
one body tall is the worst case of that, and it is the one the screenshot circled. Staff were also
standing _on_ the stools, which are `decor` and carry no collision.

## Decisions

**One expression puts every name pill below the feet.** `--cast-label-top: calc(50% + var(--cast-foot) + 8px)`,
shared by `.field-npc` and `.hub-npc`. Because `--cast-foot` already differs per surface, the same
declaration lands 2px under the sole in the field (+35.8px) and in the hub (+17.1px), and it tracks
the _character_ rather than the hit area — so the narrow-viewport button size no longer needs its own
number either. All eleven other `top` declarations are deleted.

**Three behaviours replace one.** `engine/npc-wander.js` becomes `engine/npc-behaviour.js` and owns
`station`, `route` and `wander`. What each person does now comes from what they say: the minister who
talks about the charter stands at the meetinghouse; the goodwife walks the road; the carpenter goes
between the barn and the farm stores; the servant works up and down his field.

**A route is authored as places, and the way between them is found.** New pure
`engine/npc-routing.js` runs a Dijkstra over the map's walkable cells, costing a road cell 1 and open
ground 4. That 4:1 ratio is the whole reason road cells are now exported out of the generators
(`*_ROADS`, alongside the existing `*_DOORS`): crops carry no collision on purpose, so nothing in
walkability says a field is a bad place to walk, and a plain shortest path sent the goodwife
diagonally across the beds.

This keeps the property that made Phase 61's wander safe. A stop is snapped to the nearest open
cell, a leg that cannot be pathed is dropped rather than throwing, a route with nothing left in it
degrades to a station — and every individual step is still gated by the live
`isFieldNpcBlocked`/`isHubNpcBlocked`. Authoring a route cannot strand anybody; at worst it costs
them a leg, and `tests/unit/field-map-coordinates.test.js` fails if a shipped route is in that state.

**Pauses become the exception.** A wanderer pauses 0–0.7s and samples its next target from an
annulus rather than the whole disc, so nobody takes a third-of-a-tile shuffle; a routed NPC pauses
only at a stop, 0.7–1.7s; and each NPC's pause range is scaled by a seeded cadence factor so two
people at neighbouring posts have different rhythms rather than the same rhythm offset. Measured
across the cast's real seeds, a wanderer now walks 72–84% of the time against roughly 40% before.

**The Institute's seating is new art, generated to size.** No smaller stool exists to swap to —
every furniture cell on `Medieval Tavern/tile-B-01.png` measures 42–48px. The replacements were
generated with the canvas _as_ the scale: a stool drawn on a 96x26 strip comes out 19px, and the
palette is forced from the Medieval Tavern stool it stands beside, so nothing is downscaled and it
belongs to the same room. 19px and 13px against a 45px body — knee height and shin height.

**People move off the furniture rather than the furniture gaining collision.** The reading stools
stay `decor`. A 1x1 `base` block covers `[row+0.4, row+1]`, which in the Main Hall's south aisle
would leave a 0.56-tile gap against a 0.5-tile foot box at four columns — technically passable and
miserable, which is the exact defect the hall was re-laid in Phase 58 to remove. So the three staff
posts moved instead, and a coordinate assertion keeps them moved.

## What watching it actually found

Three defects survived every unit and coordinate assertion and were caught by looking:

**Two NPCs who can stand on the same ground are interchangeable to the player.**
`nearestFieldInteraction()` answers with whoever is closest and cannot know which was meant, so this
is a content-reachability bug wearing a movement bug's clothes. It happened twice, in two different
ways, and neither was visible until people moved continually:

- The Powhatan pair's posts were 2.5 tiles apart and both wandered a 2.4 radius — two discs almost
  entirely on top of one another. A player who walked to the woman was answered by the man. The e2e
  reachability spec caught it two runs in three, the sort of intermittent report filed as a flake.
- The burgess's _route_ ran down the village spine past the stationed minister. His stops are 2.9
  tiles from the minister's post and his path came within 1.1 — inside the 1.45 interaction reach —
  so a walk to the minister sometimes opened the burgess instead. That one failed a
  **visual-regression** snapshot, one full run in seven, because the spec it broke reaches the
  charter through the minister's speech bubble.

Both are now placement changes, and the assertion that keeps them fixed measures a route's **whole
walked path**, not its stops — the stop-based version passed the burgess at 2.9 tiles. The bar is
1.5, just above interaction reach. Deliberately not 2.9 (the distance at which a player could never
be near two people at once): that would forbid two neighbours using the same street and make the
market square a morgue.

**A route through a stationed NPC blocks it outright.** Before his beat moved, the burgess spent
half his time stalled against the minister and covered 4 x 0.3 tiles of a 9.5-tile circuit — every
unit and coordinate assertion green. A stationed NPC is furniture to everyone else, so
`createNavGrid` now takes their posts as `occupied` and routes plan around them; that alone took him
to 88% walking over 4 x 6 tiles. Banked as `tests/e2e/npc-behaviour-field.spec.js`, which watches
Riverbend for fifteen seconds and asserts nobody is stuck.

**A tileset named in a palette but missing from the resolver draws an empty room.** Adding the
furnishings sheet without adding its `import.meta.glob` made `createTilesetImageResolver` throw and
the whole Main Hall render as a blank frame. The comment warning about this was already in the file,
from the last time it happened. The visual baseline caught it both times.

## Consequences

**Frame-rate independence had to be rebuilt, and it exposed a real bug.** With pauses able to be
shorter than one tick, discarding the unused remainder of a tick made two tick rates produce
different paths from the same seed. `stepBehaviour` now _spends_ a tick across phase changes rather
than applying it to one. Fixing that surfaced the underlying cause: `arriveAt` was a 0.06-tile
tolerance, which made arrival a free teleport of up to that distance, and how often an NPC ended a
tick inside the window depended on the tick size. Arrival is paid for in full now.

**`derived/institute-artifacts.png` changed without being asked to.** The committed sheet was stale:
it had been baked with a smoothing kernel before `resizeSprite` was corrected to `nearest`, so the
brass compass shipped soft and anti-aliased — exactly what that function's own comment argues
against. Re-running the packer produced the hard-edged version the code intends. Only the sprite
that uses `scale` was affected; everything else regenerated byte-identically, so the pipeline is
reproducible again and `--check` passes.

**Phase 61's hall baseline was stale too.** The re-banked Main Hall screenshot gained the player's
contact shadow. Reverting this phase's CSS and re-rendering still produces it, so it is not a change
here — the baseline was banked before Phase 61's final shadow pass landed and has been wrong since.

## Deliberately not done

**The Institute's tables, shelves and cabinets are still pack-scale** — 86–96px against a 45px body.
They are the most visible remaining inconsistency in the room, and less indefensible than the stool
was: a table seen from a high angle is mostly top surface in perspective, so its drawn height is not
all height. Replacing them is five more props including the Navigation Table, which is a load-bearing
interaction target with a specific look.

**Outdoor props are still oversized** — barrels 43px (0.96× body), crates 44px, hay bales 34px, fence
rails 35px, across all three field maps. Same defect, its own pass, so this phase's movement work is
not buried under a five-map art diff.

**Per-row depth sorting** is still not done, carried from `0044`.
