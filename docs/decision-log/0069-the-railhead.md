# 0069 — The railhead

**Phase 85 · 2026-08-17 · Accepted**

Unit 6's field map. Cottonwood Junction, Kansas, 4 June 1873 — the first map of Periods 6–9, the
first drawn from the `Wild West` pack, and the sixth walkable outdoor surface in the game.

Its brief was fixed in [`THE-MAP-PROGRAM.md`](../design/THE-MAP-PROGRAM.md) §5 and its cast landed
in the commit before this one. Nothing here is a new engine surface: a palette, a generator, and
nine wiring sites in `main.js`.

---

## 1. The line divides the map and does not block it

Everything on this map is placed by which side of the rails it is on. North: the depot, the land
office, the telegraph office, the town-site office, the store, and a homestead claim under fence —
every building where a piece of paper is made or kept. South: the Kanza village on the creek, the
hide yard, the graders' camp, and the stock pens at the loading chute.

**The track is walkable, and that is the decision rather than the shortcut.** Making it solid would
cut the map cleanly in half and put the village behind a wall. The composition says the separation
was made; a map that fenced its own argument off would be saying it was natural. A single-track
prairie line in 1873 had no fence and no embankment worth the name, so walking across it is also
simply what it was like.

Mechanically that costs nothing. The running-line tile is transparent above and below its ballast,
so it cannot go on the ground layer anyway — it goes on `structures` as `decor`, which is no
collision by construction.

## 2. Four defects the coordinate test caught, and one the browser did

`tests/unit/field-map-coordinates.test.js` failed four ways on the first wiring, and every one was
real:

- the freight teamster stood **inside the loading chute**, and both his route stops were in pens;
- two creek cottonwoods carried **collision rects out on the margin**, where no player can reach
  them — which the test reads, correctly, as a tree standing in the creek;
- the land agent's **walked path** passed 1.20 tiles from the stationed telegraph operator. Front
  Street is the only road on the town side and three of the four paper men stand on it, so a routed
  body hugs the road — `npc-routing.js` costs a road cell a quarter of open ground. Moving the beat
  a row south did not fix it; the router detoured back onto the road. He is stationed now, and the
  map's motion is the teamster, the grader, and the two who work in place.

The fifth was invisible to the whole suite. **`FIELD_COPY` falls back to Unit 1 when a map has no
entry**, silently, and `fieldScreen()`'s own comment records that a student who walked into a
Chesapeake building was once told to follow the Caribbean shoreline. Unit 6 shipped with exactly
that defect and it took a dev-server screenshot to see it: a Kansas railhead briefing the player to
"follow the shoreline toward the Spanish camp." There is a guard test now, reading `main.js` as
source because the table is not exported.

## 3. The art was read, not guessed

Every coordinate in the palette was measured before it was written — grid-labelled sheets for the
layout, per-pixel row and column profiles for the footprints, and a 5×5 parity tiling for every
candidate ground block. Four decisions came out of that and none of them survived first contact
with intuition:

- **The depot's bottom row IS track.** `tile-B-04` draws its whole trackside as one continuous
  5×11 picture. Measured per pixel row, the rails inside the depot's bottom tile occupy y=26–47 and
  the standalone running-line tile occupies y=26–47 — the same band, so they butt with no seam.
  The covered platform beside it cannot do the same, because the standpipe at (2,7) runs into its
  third row and `tile-footprints.test.js` says so; it is two rows and loses about twenty pixels of
  deck depth.
- **There is no second ground.** A lighter "trampled" surface for the yards was tried and there is
  nothing in the library that can be it: `farm/6`'s straw block is a framed field with green edges
  and tiles as a grid of rectangles, Wild West's street sand carries a ragged transition in its own
  rows, the dock's packed dirt alternates with stone. A stock yard and the street were the same
  dirt, so they are.
- **Crops need soil under them.** Every one of `farm/6`'s planted blocks is 12–16% see-through, so
  the first render drew hard black grid lines through every field. Soil on the ground, crop above.
- **`freightWagon` was a wagon plus a sand path.** A 1×3 footprint that `tile-footprints.test.js`
  passed, because that test looks for a neighbouring _sprite_ and a path is ground. Caught by eye
  in the browser and dropped.

## 4. What the map refuses to do

- **No cacti.** Seven of this pack's loose props are saguaro and barrel cactus, and Kansas
  tallgrass prairie has neither. Reaching for the most obviously "western" scatter would have put
  the Sonoran Desert 700 miles east of itself — the same class of error as the Chinese work camp
  §5 removed from this unit's brief.
- **No signed frontages.** Twenty-odd storefronts on `tile-B-02` carry a painted sign; a land
  office with SHERIFF over the door is worse than no building. The four unsigned ones are the land
  office, the telegraph office, the town-site office and the store.
- **No road to the village.** A door there would run the town's dirt streets across to a lodge, and
  the road network is the town's. Annexing the village onto it is the map making a claim the unit
  spends three missions complicating. It has its own ground and nothing reaches it.
- **No cattle**, because there are none in the library. Registered as a gap; the pens are empty in
  the shipping season, which is a real loss on a map about the industry the land sale was for.

## 5. What verified it

`npm run test` — 1551 unit assertions, including 153 in `field-map-coordinates.test.js` over this
map and six new ones guarding `FIELD_COPY`. `npm run validate:content` — 0 errors.
`npm run test:e2e --workers=1` — 172 passed, with exactly **one** baseline updated: the Navigation
Table, which now lists a sixth period and reflows. The diff was opened and every difference in it
was that. `npm run build` clean, lint 0 errors, cspell clean.

And **by eye in a browser**, on a new `?warp=railhead` dev state, which is what found the field-copy
defect and the sand-path wagon. Neither was reachable from any committed spec.

## What this does not do

- **No interiors.** `THE-MAP-PROGRAM.md` §5 calls for a land office and a telegraph office, and
  they are not built. The two buildings are facades, which is the state Units 1–3 shipped in and
  the state Units 4–5 were in between Phase 62 and Phase 65. Next.
- **No activities.** All six records are still `activityRoute: null` and the case's slate — C,
  `interview · assembly · trace` — is unauthored. Same stage Units 3–5 sat in until Phase 81F.
- **Nothing about the reveal.** Voss's line on this map reports Meridian's operation as a fact she
  is puzzled by, and nothing here is named. The reveal itself is not built.
