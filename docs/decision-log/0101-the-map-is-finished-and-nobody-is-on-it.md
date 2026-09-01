# 0101 — The map is finished and nobody is on it

**Phase 102 · 2026-08-31 · Accepted** — **superseded on one fact by `0102`:** this map was
committed at 52×34 and every outdoor field map must be `FIELD_GRID`'s 56×36. It is 56×36 as of
Phase 103, which also explains why nothing in the repository could say so. Everything else below
stands.

Unit 9's field map: `furnace-bend-field.tmj`, 52×34, five sheets, 79 collision rects, two doors both
routed. **No cast, no `FIELD_MAPS` entry, no line in `UNITS`**, and §7 is about why those three are
one decision rather than an oversight.

Third slice of Unit 9, after the content (Phase 100, `0099`) and the art reconnaissance (Phase 101,
`0100`). Follows `0096`, which is the equivalent slice for Unit 8 and whose method this reuses.

---

## 1. The third map in a row cannot be built around a line

`0076` built Ellis Island around one line the player cannot cross. `0096` built Fairmeadow around one
line they cross in four seconds that turns out to be nothing, and made the inversion a rule: **a unit
should no more repeat its neighbour's composition than its neighbour's engines.**

Obeying that rule a third time means not drawing a third line. What this map is built around is
**depth** — three thresholds in sequence, each quieter and harder than the one before it. The quad,
which anyone may walk on. The reading room, which you may enter but must ask in. And the processing
room beneath it, which is not announced anywhere. That is Unit 9's own finding standing up as
geography, and `THE-MAP-PROGRAM.md` §5 asks for exactly it: _keep that ranking legible in the
geography._

**And the ranking runs backwards against the walk.** `0099` §4 found that the three locks rank in the
order nobody expects — the FOIA response weakest because it is the only one obliged to explain
itself, the deed stronger because it needs no reason, the bad scan strongest because nobody decided
anything. So the scan sits behind no threshold at all: it is on a screen in the open, first, and
everything that is harder to reach does less damage. A player walking inward is walking away from the
thing that hurt them.

## 2. The library has two doors and that is the whole argument in four tiles

Two stamps, one continuous eight-tile frontage, two doors on it four tiles apart. The public entrance
stands at the head of the paved axis. The service door into the processing room opens off a strip of
black-top with planting either side and **nothing pointing at it**.

Both faces are south because every building in 250 sheets is drawn as a south elevation (`0096` §3),
so the difference between the two doors is not orientation — it is that one is on the walk and one is
not. **The room where you ask and the room where it is decided have different doors**, and a player
who finds the second has found the argument without being told it.

## 3. The works are not drawn, and the absence is the strongest fact on the map

The unit is set twenty years after the mill at the bottom of the hill went cold. The obvious move is a
silhouette on the south horizon, and `Factory/1` and `/3` would have supplied one at the cost of a
sixth sheet.

It would have been wrong. A works twenty years closed in this valley is not a ruin and not a landmark:
it was scrapped, the ground was cleared, and what is down there is a flat green field. Drawing the
mill makes the argument visible, **and the argument is that it is not.** What the player can see of
the thing everybody on this map is fighting over is nothing whatever, and the only evidence it
happened is indoors, in boxes, under three different locks.

The hill itself is said with a low retaining wall and one gap in it — see §5 — with rough grass and
older, greener trees below, where the campus stops mowing.

## 4. Five sheets, none of them derived, which no other field map can say

`p8-campus`'s three sheets plus two, and **not one commissioned object on the whole map.** Every other
field map in the programme draws on at least one sheet this repository packed itself. That is Phase
101's finding restated as a manifest: the reconnaissance came back mostly yes (`0100` §1), and this
is what mostly yes looks like when it is spent.

October cost nothing either. `Modern Park/tile-B-05` carries five autumn crowns and three of them have
fallen leaves drawn at the base, so the quad is red, gold and tan and the slope keeps its greens.

## 5. Four things the render caught, and one of them renamed a tile

Each passed every test in the repository and was obvious the moment the map was looked at, which is
the rung of the ladder this work lives on. Four renders.

- **A brick forecourt that was a brick wall lying down.** `stone.paver.brick` reads as flat
  running-bond paving on the sheet; laid as a two-by-two terrain block it comes up with a pale coping
  along its top edge and dark vertical joints, and what landed in front of the library was
  unmistakably a wall. Not a parity error — the block simply contains an edge course. The palette
  carries a note where that entry used to be, because the next author will find the tile and reach
  for it.
- **The steps were not steps.** `Modern Park/tile-B-01`'s stepped edge was taken for a flight down the
  slope. Rendered on real ground it is a low concrete retaining wall with planting along the top —
  which is a **better** object for the head of a bank than the one that was asked for, so it is kept
  under the name the render earned. Same call `0095` §5 records for the abatis. The entry is
  `quadWall` now and the header says why.
- **Buildings standing on a field.** Four four-tile blocks on a fifty-two-tile row with lawn running
  up to every doorway. A quadrangle is an enclosure; the blocks abut in ranges now, and a made
  surface at the foot of a building is what tells the eye the building is founded.
- **A service yard that took three materials to get right.** Crushed stone first — one tile wide, and
  a one-wide block in a four-tile pocket with Fairmeadow's raggedness slack at each end came out as a
  single tan square in the middle of a concrete apron; that trick needs a run to be ragged along.
  Graded earth next, and worse: a hard-edged brown rectangle set into a poured forecourt reads as a
  hole in the campus. Black-top is what a library actually backs a truck onto and is one shade off
  the concrete rather than four.

## 6. Four trees were standing on the walks, and now the generator says so

The avenue's first placement seeded pairs at `QUAD_ROW + 4` and `AXIS_ROW + 5`. A two-tile crown
seeded at row R contacts the ground at R + 1, so those four contacted on `AXIS_ROW` and
`SOUTH_WALK_ROW` exactly — **four trees standing on the two walks they were meant to flank.** The
south walk is one row deep, so a tree on it does not decorate it, it severs it.

This is Fairmeadow's defect twice over (`0096` §5: the tree in the road, and the churchyard wall
across the pavement), and both times a human eye caught it. **Nothing in the pipeline checks that a
walk stays open**, because the router runs after the stamps and treats occupied cells as impassable —
so it routes cheerfully around the obstruction and reports every door connected. It did: `2/2`, four
times, with trees in the road.

So the generator now asserts it. The check runs against the **authored trunk only** — the runs painted
by hand, not the spurs, because a spur is generated to reach a door and is allowed to end at one — and
it throws with the offending cells named. **Proved by putting a tree back**: `authored trunk cells are
blocked by a stamp: 23,18 24,18`. It is thirty lines and it is the eye, written down.

## 7. No cast, and it is one decision rather than three omissions

**There is no 1990s body in 140 character sheets.** The field cast runs from 1492 to 1957 and stops;
Unit 8's eight are suburban 1957, and the Institute's four are the player's colleagues and cannot be
strangers on a campus. Eight new sprites is a PixelLab commission, the balance is **$16.76 with the
subscription's generations exhausted**, and `0100` §6 already recorded that spending it is a decision
for the repository's owner rather than a step in a build order.

What follows from that is that three things are missing together, not separately: with no cast there
are no source points, with no source points there is nothing to walk to, and a `UNITS` line would put
a player on an empty quadrangle with seven records nobody is holding. So:

- **No `FIELD_MAPS["unit-09"]` entry.** It would need `npcs`, `behaviours`, `sourcePoints` and
  `worldMarkup`, and filling those with `[]`, `{}` and a stub is scaffolding standing in for work that
  has not happened — which `CLAUDE.md` names as the mistake `features/{assessment,codex}` already
  made, and which a future reader cannot tell from the real thing.
- **What _is_ wired is exactly what the sheets need to be reachable**: the raw `.tmj` import, the
  resolver, and one line in `SURFACE_TILESETS`. That table is keyed by unit, so the line is inert
  until unit-09 is playable and correct when it is. No dead code, no stub.

**The measurable cost of wiring a phase early is about 2 MB.** `University/tile-B-04.png` and
`Modern Park/tile-B-05.png` now ship in `dist/` — 38 MB total — for a map no player can reach. That is
the honest price of the resolver landing before the cast, it is recorded rather than discovered, and
it goes to work the moment the eight bodies do.

## 8. What was deliberately not done

- **No interiors.** The reading room and the processing room are the next slice after the cast, and
  the two door cells this generator derives are where they will attach.
- **No activities.** Slate C — `interview` · `assembly` · `trace` — is fixed and every `activityRoute`
  is still `null`.
- **No car park**, which the render forced rather than a preference: there is no 1990s automobile in
  the library, so a lot could only ever be a grey rectangle with nothing in it, and that does not read
  as a Tuesday afternoon, it reads as unfinished ground. The road keeps a grass verge instead.
- **No commission**, per §7 and `0100` §6.

## 9. Verification

`node scripts/generate-furnace-bend-tmj.js` — 79 collision rects, 2/2 doors routed to the poured walk,
and the new trunk assertion passing (and failing correctly when broken). `npm run test` — **2,016
passing** across 75 files, 2,004 before; the twelve new ones are the palette's, and
`map-tile-integrity.test.js` checks the committed `.tmj` against the pixels of its five sheets and is
clean, so nothing is stamped into fewer cells than its art occupies. `npm run lint` — 0 errors and the
5 standing warnings, one new one of my own removed. `format:check`, `cspell` and `npm run build` clean.

**And by eye, four times**, at 2496×1632, once per pass — which is the only tier that can see any of
§5 or §6, and the tier every one of them was actually caught on.
