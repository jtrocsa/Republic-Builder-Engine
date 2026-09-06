# 0119 — The guard was keyed to the surface, not the question

**Phase 120 · 2026-09-06 · Accepted**

Two read-only surveys — one over the game's twenty-one walkable surfaces and their guards, one over
every viewport and clipping assertion in the suite — found the same shape twice:

> **A guard is keyed to the surface class it was written for, not to the question it asks.**

Interiors got a rect-in-bounds check in Phase 113 because somebody noticed they were missing it; the
Main Hall never did. Six of the eight outdoor maps have no sealed-pocket check, though every interior
and every hub room has one. `cast-legibility.spec.js` measured eighteen surfaces of twenty-one, and
the three it skipped are the ones every session begins and ends in.

This phase closes those gaps. It is almost all test code — but it found three defects, and one of
them is a guard that had been reporting "clean" about nothing at all.

---

## 1. The guard that could not fail

Phase 113 gave the ten field interiors a check that every collision rect is backed by drawn art, and
`0112` §3 reports it **clean on all ten**, "which is a result rather than a null one."

It would have reported that whatever the rooms looked like.

The predicate asks whether **any** tile layer has paint in the cell. Every surface in this repository
has a `ground` layer, and `ground` is painted in **every cell of all twenty-two of them** — 224 of
224 in the lending office, 336 of 336 in the hospital ward, 276 of 276 in the Main Hall. There is no
cell anywhere that fails "some layer has paint". The test was true before it was asked.

Proved by injecting one collision rect onto a patch of bare floor in the lending office and running
the suite with Phase 113's predicate restored: **348 passed**. With `ground` excluded it fails by
name.

**Note which vacuity this is**, because the file already carries the other one. Phase 113
deliberately added `expect(room.blocks.length).toBeGreaterThan(0)` beside it, reasoning that a filter
over an empty list passes — and that line is correct and does not catch this. Here the list was full
and the _predicate_ was always true. **A guard can be vacuous on either axis and only one of them
looks empty.**

Corrected to every layer but the floor. All ten rooms are still clean, and so is every other surface:
verified against the tighter `structures`-only predicate too, on all twenty-two, so the looser
version costs nothing today and will not false-fail on a future prop stamped onto the overlay.

The same sweep found the outdoor version opening with `if (!structures) return;` — **a test that
passes by returning early**, reporting clean for a map whose structures layer it could not find. It
asserts now, and carries the anti-vacuity line the interiors had.

## 2. The room every session passes through

**The Main Hall was the only one of the twenty-one walkable surfaces asked neither rect question.**
`HUB_BLOCK_RECTS` was imported into `field-map-coordinates.test.js` and used once, as the flood
fill's input. The eight outdoor maps have had both checks for phases; the ten interiors got them in
Phase 113; the Archive Room and the Entrance Hall have both.

`0112` §3 says "the outdoor maps and **both hub rooms** have been checked" for exactly these two.
There are three hub rooms. It is Phase 118's twelve counted claims one document further down — a
number that stayed plausible because nobody re-derived it.

Both now run, and both are clean. Proved by injecting an out-of-bounds rect and a rect on bare floor
and watching each fail by name.

## 3. Reachability was local everywhere it mattered

`fieldTraversal()` has existed since Phase 105 and was instantiated **twice**: for Richmond's bluff
and for Ellis Island's rail, both times to prove a _named barrier_ has exactly the crossings its map
claims. **Six of the eight outdoor maps were never flood-filled at all.**

Every other reachability assertion on an outdoor map is _local_ — is there standable ground within
this thing's own reach — which is answered a tile away from the thing and says nothing about whether
a walk can arrive there. That is the question a student asks.

The new check puts every object-anchored record, every interior doorstep, every NPC and the recall
beacon inside the spawn's own component, each at the game's own reach. Stated that way rather than as
"no open ground is stranded", because an outdoor map may legitimately hold ground nobody is meant to
walk to — a sandbar, a roof, the far bank — and a pocket of scenery is not a defect the way a pocket
of room is.

Proved by stamping a wall across Fairmeadow south of the spawn: it names the building & loan's
doorstep and the two borough NPCs, and nothing else.

This also closes the hole `CLAUDE.md` names in as many words. The interior block's doorstep check
asks only whether _some_ cell within 1.45 of the door is standable, so a doorstep in a sealed pocket
passes it; it stays, because it is cheap and names the room rather than the unit, but it now says
what it cannot see.

## 4. The table nobody read

**The interior block never read `room.behaviours`.** Everything in it reads `room.npcs[].x/y` — where
a person is _declared_ — and the game moves them from a different table that nothing held against the
first. Ten rooms, twenty-four jobs, four outdoor guards with no counterpart in here at all.

The first run found one:

> `richmond-ward-nurse` is declared at **(4.0, 8.4)** and her wander home is **(4.0, 8.6)**.

The only body in the game whose two tables disagree about where it starts. It stood for phases
because nothing in here asked. The declared coordinate wins, because it is the one other code reads —
a source anchor takes it before the first tick moves anybody — and the disc is marginally better
there too, 75% open against 70%. Nine pixels.

Added with it: two people's ground held 1.5 tiles apart, and every body's ground held out of a
record's 1.55 and **the exit's 1.45**. That last is CLAUDE.md's _"a door is an interaction, and it
competes for the same reach"_ — `nearestFieldInteraction()` sorts an interior's people, its records
and its way out into one nearest-wins list, so a body inside the exit's reach can answer instead of
the door, which is how a room becomes one you cannot leave. Phase 97 checked the cast and not the
furniture and Phase 98 paid for it; the eight outdoor maps have had this since Part 6B.

Proved by parking the lending office's clerk on the doorstep — `suburb-counter-clerk comes 0.80
within the way out's 1.45 reach` — and beside the officer — `1.00 tiles apart`.

## 5. The flake that was recorded twice and never routed

`suburb-interiors.spec.js` asserts a locked record's refusal names the appraisal, and it was seen
receiving an empty string. `0118` §8 recorded it as wanting its own look.

It is not load. The assertion needs `e` to reach the **desk record** at (6.0, 4.0) rather than the
**mortgage officer** at (4.5, 4.6), and `nearestFieldInteraction()` sorts by raw distance and takes
the first. The bisector between them crosses his row at x 5.37 and his reach ends at 5.95: a window
**0.6 of a tile wide**, and `walkTo` returns the instant `.is-near` lights on the officer, in bursts
of up to 2.5 tiles. Land west of it and `e` opens the man, `toggleFieldDialogue()` clears
`progress.fieldNotice`, and the assertion times out on empty text. The test asserted nothing about
where it had landed, while its own neighbour twenty lines up pins the arrival for the model-house
door.

**Ask the game, do not restate its rule.** A locked record draws no world marker, so there is no
`.is-near` to read for it, and recomputing the sort in the spec is what `0093` forbids. So a third
dev probe, gated exactly as the two beside it: `window.__chronicleReach()` returns
`nearestFieldInteraction()`'s own answer. The spec steps east until the game says the desk is what
`e` will reach — bounded by that state and not by a count of milliseconds, which is Phase 119's rule
and the third time this suite has needed it.

Proved both ways. With a deliberate westward overshoot the loop recovers and the test passes; with
the loop disabled it fails as `standing at 3.29,3.90, e has to reach the checklist rather than the
man beside it — Received: "suburb-mortgage-officer"`. That is the flake, named, where it used to be
an empty string and a diagnosis of "load".

## 6. Twenty surfaces, not twenty-one

`cast-legibility.spec.js` now measures the Main Hall and the Entrance Hall as well — five bodies no
automated check had ever looked at, in the rooms every mission starts and ends in, whose own
screenshots hide `.hub-npc` before they fire. All three hub rooms draw onto the same
`.field-world-overlay` canvas the file already samples; the only thing missing was that
`__chronicleCast()` had no hub branch, so there was nothing to ask.

**The Archive Room is deliberately not the twenty-first.** Nobody lives in it — `main.js` returns
`HUB_NPC_RUNTIME_NONE` for that room and always has — so a row here would report clean about an empty
list, which is §1's mistake with a different face.

Both rooms come back clean, and the reason is structural rather than lucky: the Institute's overlay
layers hold **three tiles between them**, at (18,6), (1,8) and (21,8), none of them oversized. A
single 48×48 tile cannot bury a body the way a maple canopy can. The measurement is live all the
same — a body parked under (18,6) reads **24.2%** where the Director at his real post reads 0%, and
dropping the cap to 20 fires the assertion with the room's own message.

## 7. What turned out not to be a gap

The survey listed the Entrance Hall as missing the Main Hall's NPC-clear-of-an-object's-reach check.
It is not missing it: `HALLWAY_TARGETS` holds one entry, the Director, and he carries no `marker` by
design because he is a person rather than furniture. The room has no objects, so the question has no
subject, and a check with nothing to measure is what §1 is about.

Recorded rather than written.

## 8. The numbers

|                                                    | Before | After                              |
| -------------------------------------------------- | ------ | ---------------------------------- |
| `field-map-coordinates.test.js`                    | 346    | **406**                            |
| Walkable surfaces with a cast-versus-overlay guard | 18/21  | **20/21**, the 21st having no cast |
| Surfaces with both rect guards                     | 20/21  | **21/21**                          |
| Outdoor maps flood-filled from their spawn         | 2/8    | **8/8**                            |
| Interiors whose behaviour table is read at all     | 0/10   | **10/10**                          |

Defects found: a vacuous guard, a body whose two tables disagreed, and a flake that was geometry
rather than load. **No visual baseline moved** — the only game-code changes are a nine-pixel wander
home and two dev-only probes, and every probe is verified absent from the production build.

## 9. What this leaves

Phase 121 is approved and is the other half of the survey: **2 of 11 student-facing screens have any
fold or clipping assertion**, only the Navigation Table is measured at both sizes a student gets, and
no CSS breakpoint exists between 1220px and 1400px — so 1280 and 1366 share one untested layout
regime. The suite records content sitting below the fold in seven separate comments and then
baselines those elements individually to step around it.

One candidate is already on the table and wants a browser rather than an argument:
`global.css` argues `.field-tracker` must be 232px because "at 208px the header wrapped", and
overrides it to **200px below 1400px** thirty lines down — both in the same Phase 57 commit. The
width the comment defends has never applied on any screen a student owns.
