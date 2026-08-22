# 0076 — The wharf at Ellis Island

**Phase 89C · 2026-08-22 · Accepted**

Unit 7's field map. Ellis Island, New York Harbor, 17 April 1907 — the seventh walkable outdoor
surface in the game, the first of Period 7, and the first map whose place is real and named.

Its brief was fixed in [`THE-MAP-PROGRAM.md`](../design/THE-MAP-PROGRAM.md) §5 ("a threshold place:
dense, vertical, institutional, and organised entirely around sorting people") and its cast landed
in Phase 89B. Nothing here is a new engine surface: a palette, a generator, and the usual wiring
sites in `main.js` — plus the `UNITS` line that finally makes Unit 7 reachable.

---

## 1. The rail divides the map and cannot be walked across

Everything on this wharf is placed by which side of one iron rail it is on. North: the government's
ground — the frontage, the forecourt, the gas lamps and the benches, the aid-society agent standing
there at the Commissioner's pleasure, and the man who came off the ferry to meet his cousin. South:
the landing stages, the baggage, the sheds, and eleven thousand seven hundred and forty-seven people
waiting to be read back to themselves off a sheet filled in for them in Europe.

**This is deliberately the inverse of Cottonwood Junction, whose line was walkable on purpose.**
Decision log [`0069`](0069-the-railhead.md) §1 argues that making the Kansas track solid would have
taught that the separation was natural rather than made. Here the separation _was_ made — it is four
feet of wrought iron on a stone plinth with exactly one opening in it — so the map draws it as the
obstruction it was. A unit should no more repeat its neighbour's composition than its neighbour's
activity engines.

The rail costs the player nothing. The gate is in the middle of it, two tiles wide, on the entrance
pavilion's own columns, so the gate, the paved walk beyond it and the door are all on one axis and a
player walking north never has to look for the way through. It costs the people on the map
everything: Ignacy Wozniak is on the north side because he has been a citizen since March, his
cousin is somewhere in the crowd on the south side, and they can talk and nothing else. The engine
lets that happen for free — `nearestFieldInteraction()` sorts by distance and knows nothing about
line of sight, so a player can stand at the rail and be answered across it, exactly as she could.

Mechanically the rail is `base` solidity: its stone plinth is a collision rect on `structures` and
its ironwork lifts to the overlay layer, so a body is drawn _behind_ the thing it is leaning on.
Stamped `solid` it would be two tiles thick, which is a wall.

## 2. A north-south fence does not exist in 250 sheets

The first plan for this map was better and is not buildable. It was a railed pen running north to
the doors — five tiles wide, the queue as architecture, the player walking the funnel a person
walked. Every fence, railing, hoarding and balustrade in the library is drawn **face-on**, so a
north–south run cannot be laid and cannot be faked by rotation.

That is a library fact worth writing down once rather than rediscovering: the art language of these
packs is a low top-down view in which vertical surfaces are drawn as elevations. Anything that reads
as a wall reads as a wall _facing south_.

What survived the constraint is the single east–west line above, which is a better composition
anyway — a funnel is a corridor, and this map wanted an obstruction.

## 3. The paving is the route and the cobble is everything else

Two made surfaces, and the split is the argument. The island is fill dumped behind a seawall and
cobbled like any working quay; cut flagstone is laid only where people are walked — the landing
stage to the wharf, the wharf to the gate, the gate to the doors, and the one branch east to the
inquiry wing. A student can read the whole procedure off the ground before anybody speaks.

This is the opposite call from Cottonwood Junction, whose palette argues at length that every
surface in town was the same packed earth. There the sameness was the finding. Here the difference
is.

Both surfaces are `19th Century European City/tile-B-05`, which is the third pair tried. The Dock
pack's own gravel and sand are a beach — pale, pebbled and grid-ruled at 48px. Its cobble at
`(14,0)` is the one Canal Crossroads already refused for the ground layer over a fully clear top
pixel row, and a hairline of page background would have run the whole width of this map. And
`stone.dock.flagstone` at `(14,4)` is not what its name says: taken as a 2×2 it reaches into row 15
and lays an ice-cream stand across the quay, twice per block.

## 4. The frontage is brick with a stone centre, which is the library agreeing with the history

The real Main Building is red brick with limestone trim and a taller entrance block. The City pack
has a four-by-four pale-stone civic pavilion at `(4,4)` and four-wide red-brick terraces at `(10,8)`
and `(10,12)` whose rooflines sit two rows lower. Laid with a common base row, a stone pavilion
rises out of a long brick wall — which is what the building does.

What the pack cannot give is the four domed corner towers, and nothing pretends otherwise: the
pavilion has one clock tower instead. Registered in
[`art-and-map-style-guide.md`](../architecture/art-and-map-style-guide.md).

The frontage runs edge to edge of the `.tmj`, not merely of the walkable rectangle, so there is no
visible end to it. The two bays that overhang the mask are stamped `decor` rather than `solid` — the
same rule Cottonwood Junction's framing cottonwoods run under, and for the same reason:
`field-map-coordinates.test.js` reads an unreachable collision rect on non-land as a building
standing in the sea, which at cols 0–3 is exactly what it would look like.

**The door graph is flat, so the board of special inquiry opens off the frontage.** A hearing room
in 1907 sat off the registry floor, upstairs, behind the hall — and CLAUDE.md is explicit that a
field interior is never nested. So the inquiry wing is entered twelve bays east of the main doors,
which is where the detention wing was and is as close to the truth as a flat graph gets. That bay is
drawn in a _different_ brick run from its neighbours, because a door that needs a label to be
findable is a door drawn wrong.

## 5. No vessel, and nothing growing

Two deliberate absences.

**No boat.** Eleven thousand people in a day means the barges shuttled continuously and the slip is
empty between them. The library's only flat-decked harbour craft is Steampunk's cargo barge at two
tiles by four — about four people long, which is absurd for a vessel that carried five hundred. An
empty landing stage with its posts is truer and better: the thing that brought you has gone, and the
only way off this island is through that door.

**No planting except in tubs.** The arrival side of the island in 1907 is seawall, fill and paving;
the lawns and the plane trees came later. A scatter pass across the cobble would have drawn a park,
which is the same class of error as a cactus in Kansas.

## 6. Two tiles that are not what they look like

Both cost a render to find, and both are recorded in the palette header rather than in a commit
message nobody re-reads.

`tile-B-06 (4,10)` and `(4,12)` look like jetty decking and are **landing-stage sprites** — a deck
with a mooring post at all four corners and transparent margins all round. Tiled by parity they
render as a raft of separate slats with the bay showing between them, which is what the first
preview drew. The two finger piers are `tile-B-04 (0,8)` plank decking instead, a full-bleed floor
texture painted on the **ground** layer in place of the water, with a heavy mooring post stamped at
the head of each stage for the thing the sprite was wanted for.

The ice-cream stand inside `stone.dock.flagstone` is the second, and is recorded in §3.

## 7. What this slice does not have

Five of the case's seven records are held by people who work indoors, which is the highest interior
share of any map in the game and is the station stating its own shape. **Until the two rooms ship,
those five rows in the Mission Tracker name their own document titles rather than a person**, which
is the one outcome `fieldObjectives()`'s own comment rules out.

That is a known and bounded intermediate state, not a defect to fix here. Unit 6's map slice shipped
in the same condition at two records of seven (Phase 85 → Phase 86); this one is worse in degree
because of where the cast stands. The first thing the next slice does is give those five an anchor,
and `FIELD_COPY["unit-07"]` is written to describe the two records that exist rather than to promise
five that do not.

Also absent, and deliberately: no activity engines yet (every one of the seven records carries
`activityRoute: null` and degrades to the reader, exactly as Unit 6's did between Phases 85 and 87),
and **no Meridian beat**. `THE-FIELD-LIAISON.md` §4 puts Units 7–8 at "reluctant alliance", which is
Scene E and a canon decision of its own. Voss gets a post on the map and a line, which is what Unit 7
owes her and all of it. She carries no `revealedText`; the railhead is the only map that does, and
`field-liaison.test.js` fails if a second grows one.

---

**Verified:** 1,722 unit tests (68 files), including 183 in `field-map-coordinates.test.js` — two of
which failed first and were both real: a passenger standing inside the baggage derrick's rect, and
the two overhanging frontage bays afloat. `validate:content` clean at 144 groups. Build and lint
clean. 20 visual-regression tests with exactly two baselines changed: the new wharf, and the
Navigation Table, which now lists a seventh period.
