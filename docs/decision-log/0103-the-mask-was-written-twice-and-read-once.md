# 0103 — The mask was written twice and read once

**Phase 104 · 2026-08-31 · Accepted**

Two numbers that only one thing read, found by looking for more of what `0102` found. Every outdoor
map's land mask now travels with the map as a picture and is held against `main.js`'s hand-written
copy cell for cell; every field interior's hand-written grid is held against the size it was actually
painted at.

Both audits came back **clean** — nothing was wrong. That is the finding, and §5 is about why it is
still worth a phase.

---

## 1. Where this came from

`0102` was a map at the wrong size that nothing could report, because the guard was keyed to the
table of playable units and the map was deliberately outside it. The general shape underneath it is
older and simpler: **a number with only one reader.** So the next thing to do was look for the rest of
them rather than wait for the next one to ship.

Two turned up in the surface layer, and both had been sitting there for many phases.

## 2. The land mask, written twice since `0036`

Every outdoor field map's mask exists in two places. `main.js` has `isCaribbeanLand`,
`isRiverbendLand` and six more; each generator has its own copy of the same function. `0036` chose
that deliberately: `main.js` is a browser bundle entry and cannot import a build script, so rather
than reach across that line the mask is duplicated, and the entry says plainly what the risk is — the
one thing that must never silently diverge is the ground the player collides with versus the ground
that got painted.

**Deliberate duplication is fine. Unchecked duplication is not**, and the only pair anything compared
was Richmond's, through a bespoke hundred-line suite that reaches it sideways through the bridges and
the bluff. Seven other pairs had no reader at all on the question of whether they matched.

What that leaves is a defect with no symptom. A cell open in one copy and closed in the other is
either painted ground the player cannot reach or reachable ground that was never painted — and both
render, both walk, and neither shows up in a screenshot of a map whose buildings are all still there.

## 3. What the fix is

`MapBuilder.toBlocksModule()` takes an `isLand` now and writes the generator's own mask into the
`.blocks.js` module beside the map, sampled at every cell centre. One test then holds `main.js`'s copy
against it across the whole 56×36 grid, for all eight playable maps, and names the disagreeing cells
and which side they came from.

**Rows of `#` and `.` rather than base64**, one string per row, because a coastline should be legible
in a diff:

```js
export const CARIBBEAN_FIELD_LAND = [
  "...........................#########....................",
  ".........................#############..................",
  ".......................#################................",
```

Move a treeline and the diff shows you the treeline moving. That is worth more than the ~340 bytes a
packed encoding would have saved, and it means the mask is reviewable by a person as well as by a
test.

**This test keys off `FIELD_MAPS`, deliberately, and that is not a relapse from `0102`.** The question
here is whether _`main.js`'s copy_ is right, and `main.js` only has a copy for a unit it can play. A
map committed ahead of its unit — which is exactly where Unit 9 is — has one mask, not two, and
nothing to disagree with. Key each guard to the table that answers its own question.

## 4. The interior grid, written twice since Phase 65

An interior is the one surface that does **not** share `FIELD_GRID`, so its size is written down
twice: `WIDTH`/`HEIGHT` in its generator, and a `grid` literal by hand in `main.js`. The interior
suite asserted `grid.tile === 48`, `columns > 0` and `rows > 0` — that the numbers were plausible,
never that they were the right numbers.

`room.grid` is what collision, the camera and `interiorGround()`'s land mask all read; the `.tmj` is
what gets painted. Disagreeing, the room is walkable where there is no floor or walled where there is
one. Ten rooms, twenty hand-written numbers, and no comparison. There is one now.

## 5. Both audits came back clean, and that is the result

All eight mask pairs agree exactly — in **both** directions, zero cells, which is a stronger result
than I expected and let the assertion be strict equality rather than a subset rule with exceptions.
Railhead's `main.js` copy carries an extra branch the generator's has not got, opening rows 17 to 19
across the creek for the crossing; it turns out to describe ground the generator's `isCreek` already
allowed, so the two agree anyway. All ten interior grids match their maps.

Nothing was broken. Two things follow from that and they point opposite ways, so both are worth
saying.

**It does not make the phase wasted.** A hand audit tells you the state of the repository on one
afternoon; a test tells you the state of it on every afternoon after that. I checked these pairs by
reading them, and reading sixteen small functions is exactly the kind of verification that is right
once and then quietly stops being true. The specific thing this defuses is close: `isFurnaceBendLand`
will be hand-copied into `main.js` when Unit 9's cast lands, and the obvious place to copy it from is
`0101`, whose numbers `0102` superseded. The moment that second copy exists it has a reader.

**And it is a real answer, not a null one.** "The eight masks agree" was not known before today. It
was assumed, which is not the same thing, and `0102` is a week-old demonstration of what assuming
costs.

## 6. What was deliberately not done

- **The duplication was not removed.** `0036`'s reasoning stands: `main.js` cannot import a build
  script. What has changed is that the copy is now checked, which was the only thing wrong with it.
- **No mask emitted for interiors.** Their mask is `interiorGround(grid)` — the whole room — so it
  carries no information the grid does not, and §4 already checks the grid.
- **No attempt to assert the crossings.** Where a mask opens over water because a deck is drawn, only
  the map knows that; Richmond and Ellis Island keep their bespoke suites, which is the right place
  for map-specific claims.

## 7. Verification

`npm run maps:build` — 22 maps, and only the nine outdoor `.blocks.js` modules changed; **no `.tmj`
moved**, because emitting the mask does not touch the painting. A second run leaves a clean tree.
`npm run test` — **2,070 passing** across 75 files, 2,052 before; the 18 new ones are 8 mask
cross-checks and 10 interior grids. Both guards proved by breaking them: a one-row change to
Fairmeadow's mask reports `50 cells where main.js's unit-08 mask and the generator's disagree` with
the cells named, and a two-column change to the lending office reports
`fairmeadow-building-and-loan declares 18x14 in main.js and is painted 16x14`. `validate:content` 0
errors, `lint` 0 errors and the 5 standing warnings, `format:check`, `cspell` and `build` clean.
