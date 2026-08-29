# 0096 — The line is a strip of dirt

**Phase 97 · 2026-08-28 · Accepted**

Unit 8's field map, its cast of eight, and its line in `main.js`'s `UNITS`. **Chronicle covers CED
Periods 1–8 of 9 as of this phase.** Third slice of **Candidate B**, after the content (Phase 95,
`0094`) and the art (Phase 96, `0095`).

`fairmeadow-field.tmj` — 56×36, ten sheets, 134 collision rects — plus `UNIT8_FIELD_NPCS`, the land
mask, the resolver, the copy and the registration. Two interiors and three activities are the
remaining slices, in that order.

---

## 1. The composition inverts Ellis Island's, and that is a rule rather than a preference

`0076` built Unit 7 around one line the player cannot cross: four feet of wrought iron across the
whole wharf with a single gate in it, and the separation _was_ the argument. This map is built around
a line the player **can** cross, in four seconds, unstopped and unchallenged — and the appraisal in
this unit's own content gives the ground on one side of it forty years of remaining economic life and
the ground on the other fifteen.

The rule is the one `THE-MAP-PROGRAM.md` states for engines and this phase applies to composition: **a
unit should no more repeat its neighbour's layout than its neighbour's slate.** But the inversion is
not novelty for its own sake. It is what Unit 8 is about. Ellis Island's separation was built, staffed
and visible, and a student can point at it. Fairmeadow's was written down in an office in May and
there is nothing whatever on the ground to see. A map that fenced this one would have taught the
opposite of the unit.

So the map is three bands north to south — the unsold lots, the tract, the corridor, the borough — and
the only thing joining the two halves is **the old township road, still crossing the expressway at
grade** because grade separation arrives with the interchange and the interchange arrives later. That
is true of every expressway ever cut through a settled place, it is why the player can cross at all,
and it is the quietest thing on the map: the foreman is the one person out here who knows that when
the road opens this crossing comes out.

## 2. The art decided the expressway was unfinished before the history did

**Every lane marking in 250 sheets runs north-south.** `Highway Rest Area/tile-B-01`'s double yellow
is a vertical run at cols 5-6 of its own sheet, so an east-west carriageway is either unstriped or
impossible — the same property that stopped Unit 7 drawing a north-south railed queue, in a different
axis.

Reading an unstriped carriageway as **a road that has not opened** costs nothing and pays three
times. It explains why every car on this map is parked on a drive. It puts `Construction/2` on the
second carriageway, where the plant and the survey stakes belong. And it dates the sheet the appraiser
is holding: **he is rating a boundary that does not exist yet.** One paved side, one still graded
dirt, guard rail installed along the finished shoulder only and in broken runs — and the gaps in that
rail are the map's premise, because a continuous one would make the boundary real.

## 3. Every building faces south, so the borough needed alleys

The library's whole art language draws vertical surfaces as elevations, so a street cannot have houses
on both sides of it: both frontages are north of their street and the player always approaches a door
from the south. Ellis Island solved this by putting its one building along the top of the frame.

This map has two frontages and the player arrives at the top of it, which means they meet the **backs**
of the borough's buildings first. The frontage is therefore three runs with three gaps — the
churchyard at the west, the old road in the middle, open ground with two old trees at the east.
Without them half this map is a wall. That is not a decorative choice and it is the kind of thing that
looks like one in a diff.

## 4. The trees are the argument, and they were nearly in the wrong season

The one contrast a student can read before anybody speaks is that **the borough has trees and
Fairmeadow does not** — two centuries of oak, pine and birch over the ground rated at fifteen years,
and this June's whips over the ground rated at forty. It is also literally what an appraiser was
scoring.

`derived/farm-trees.png` carries both halves of that and also carries a maple in autumn dress and a
cherry in fruit. The first render of this map had a third of the borough turning orange under an
August sky, on a map whose deed is dated March 1953 and whose appraisal is dated May 1957. Green stock
only now, with the reason in the palette beside the list, because the next person to reach for that
sheet will reach for the maple: it is the best-looking tree on it.

## 5. Four things the render caught that nothing else would have

Each of these passed every test in the repository and was visible the moment the map or the cast was
looked at, which is the rung of the ladder map work actually lives on.

- **A tree standing in the middle of the road.** The borough's north verge trees were placed as
  stamp tops in a list, and one of them landed across the only route between the two halves of the
  map. Nothing checks that a route stays open, because the router runs before the scatter and the
  crossing is walkable in the collision data either way.
- **Crushed stone laid as a rectangle reads as a poured pad**, because a hard straight edge is the
  one thing tipped stone never has. Two hashed cells of slack at each end of each row fixed it.
- **A churchyard wall lying across the pavement.** Eight tiles of `base` on the borough's own
  sidewalk row, severing the walk for a third of its length so the player has to step into the road
  to get past. Correct as architecture, wrong as a floor. It runs along the back of the burial ground
  now.
- **One character came back with her background baked in.** All eight frames of
  `suburb-householder`'s east walk cycle arrived at 79% opacity — a flat grey rectangle behind the
  figure instead of transparency. The build does not notice: it crops to the alpha box, so an opaque
  frame makes the crop window the whole canvas, and the symptom three steps later is that **her head
  is clipped flat in all four directions**. Caught by the contact sheet and confirmed by a scan of
  every cached frame for the same defect; one direction re-rolled and nothing else in the cast has
  it. **A whole direction can lose its alpha, and every number in the pipeline stays plausible.**

## 6. Two costs the map build has that the art build did not

- **`assets:build-characters` grew an `--only=` flag.** PixelLab's bulk archive for two characters
  imported in earlier phases — `abolitionist-lecturer` and `port-steerage-woman` — has since lost one
  frame of one direction each, so a full run now throws `ENOENT` on art nobody is changing and blocks
  eight new characters on two old ones. Their committed sheets are correct and were built when those
  frames existed; rebuilding them is a separate decision from importing a unit. **The flag is only
  safe because the canvas is pinned rather than derived** — `canonicalCanvas()` returns
  `SPRITE_CANVAS` and merely warns when the cast wants more — and that is stated where the flag is.
- **`tests/unit/field-map-coordinates.test.js` measures a collision rect by its centre**, and a
  `base` rect runs from `row + 0.4` to `row + 1`, so an object standing on the last walkable row is
  centred 0.2 of a tile past that row's own centre. Cutting the mask at 33.5 left the borough's last
  yard row walkable while every fence and tree standing on it read as afloat — eighteen of them. The
  mask ends at 34.0.

## 7. What was deliberately not done

- **No interiors, and two of the seven records are therefore not reachable yet.** The model house's
  terms sheet is on a card table and the building & loan's underwriting checklist is on a desk; both
  land with those rooms. This is exactly the state Unit 7 shipped in at Phase 89C, whose two interiors
  came in 89D, and the doors are stamped and routed so the rooms have somewhere to attach.
- **No activities.** Slate B — `interview` · `discrepancy` · `trace` — is fixed and every
  `activityRoute` is still `null`. The interview's eight-invented-neighbours problem is what made the
  place composite in the first place (`0094` §2); building it is its own phase.
- **Voss gets a line and no `revealedText`.** `THE-FIELD-LIAISON.md` §4 puts Units 7–8 at "reluctant
  alliance", which is Scene E and a canon decision of its own; `tests/unit/field-liaison.test.js`
  fails if a second map grows a reveal.
- **No new Chronotravel plate and no new Navigation Table view.** Both were paid for in Phase 95 —
  the plate in the Phase 88A commission, and the view because all three of this unit's cases fall
  inside the existing `north-america` box.

## 8. Verification

`npm run check` — 1,955 unit tests (1,920 before), 0 lint errors, cspell clean, `validate:content` 0
errors across 157 groups. `npm run build` clean. `node scripts/generate-fairmeadow-tmj.js` — 134
collision rects, 3/3 doors routed to the poured walk. `npm run docs:field-guide` rebuilds with the new
map. `npm run assets:audit` — the eight new sprite sheets are ~3 KB each against a 50 KB budget.

Three checks specific to this map, run before the suite could load at all:

- **Reachability**, by breadth-first flood from the spawn over a half-tile lattice: **6,174 open cells,
  6,174 reached, zero stranded.** No pocket, on a map whose whole point is that you can get from one
  side to the other.
- **Every NPC's foot box against every collision rect**, which found the township secretary standing
  inside a parked station wagon.
- **A full alpha scan of every cached frame of all eight characters**, which found the householder's
  east cycle and nothing else.

And by eye, four times: the whole map at 1400px after each pass, the cast contact sheet before and
after the re-roll, and the map again with every NPC coordinate and the spawn drawn on it.
