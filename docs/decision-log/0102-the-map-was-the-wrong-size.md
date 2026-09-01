# 0102 — The map was the wrong size and nothing could have said so

**Phase 103 · 2026-08-31 · Accepted**

Unit 9's field map shipped in Phase 102 painted at **52×34** against a `FIELD_GRID` of **56×36**. It
is 56×36 now, and the reason it went a phase without anybody noticing is the subject of this entry:
every geometry assertion in the repository keys off `FIELD_MAPS`, and `0101` §7 deliberately kept the
unit out of `FIELD_MAPS` until it has a cast.

Supersedes `0101` on the map's dimensions only. Everything else that entry records still stands.

---

## 1. What was wrong

`FIELD_GRID` is one constant in `main.js` — `{ columns: 56, rows: 36, tile: 48 }` — and it is the
collision and camera world that **every** outdoor field map is played in. Only an interior declares a
size of its own; `activeFieldGrid()` reads `activeFieldMap().grid || FIELD_GRID`, and no outdoor map
sets `grid`. The comment above it has said so since Unit 4: _every field surface declares its own
size; only the outdoor maps share FIELD_GRID's 56×36._

Eight outdoor maps are 56×36. The ninth was 52×34. Had it been attached to a playable unit, the
engine would have run a 2688×1728 world over a 2496×1632 painting.

## 2. Why nothing failed

`tests/unit/field-map-coordinates.test.js` has checked exactly this since Unit 2:

```js
it("has a .tmj whose grid matches FIELD_GRID (normal case)", () => { … })
```

and it lives inside `describe.each(Object.entries(FIELD_MAPS))`. So does every other geometry
assertion in the file — rects in bounds, rects backed by art, rects on land, the flood fills.

`FIELD_MAPS` is the table of units a student can walk. That is the right key for a question about
NPCs, spawns or source points, because those only exist for a playable unit. **It is the wrong key
for a question about the map file**, and Phase 102 is the first time in this repository that the
difference could show, because it is the first time a map has been committed ahead of its unit.

That was a deliberate and, I still think, correct decision — a `FIELD_MAPS` entry with `npcs: []` is
scaffolding standing in for work that has not happened. What was missed is that it moved the map
outside every check at the same time. The map was generated, verified, rendered four times, run
through `map-tile-integrity` and committed, and the two suites that did see it — that one and
`tile-palettes` — both ask about tiles and sheets, never about the size of the world.

**This is the repository's oldest recurring defect wearing a new hat.** `FIELD_COPY`, `UNIT_MAP_VIEW`,
`UNIT_REVIEWS`, `UNIT_BADGES`, `LIAISON_MAPS`, `build-field-guide.js`'s four tables and Phase 100's
`checkActivityRoutes()` were all a per-unit list that quietly stopped short. This one is not a list
that stopped short — the list is complete and correct. **It is the guard keyed to the wrong list**,
which is the same failure one level up and produces the same silence.

## 3. The fix to the guard, which is the point of the phase

A new block in `field-map-coordinates.test.js` keyed off **the committed artifacts** rather than the
playable table: the `*-field.tmj` files on disk and the `*.blocks.js` modules beside them. It asserts
the grid, that every rect is in bounds and non-degenerate, and that every rect is backed by drawn
structure art — for every outdoor map that exists, playable or not.

Two details are load-bearing:

- **The derivation is the filename**, `<place>-field.tmj`, which is true of all eight outdoor maps
  and of no interior or hub room. A convention used as a type marker rots silently, so it is asserted
  in the other direction as well: every `FIELD_MAPS` entry's `.tmj` must match the pattern. If a
  future outdoor map is named something else, that check fails and says to rename it or stop deriving
  the list from the name.
- **There is a check that the glob found anything at all.** An `it.each` over an empty list passes,
  silently, and a guard that can go quiet the same way the thing it guards went quiet is not a guard.

Proved by breaking it: `WIDTH` back to 52, regenerate, and the run says
`furnace-bend-field.tmj is 52x36 and FIELD_GRID is 56x36`, naming the map and both numbers. Note that
the generator still reported `95 collision rects, 2/2 doors connected` at the wrong size, and the
trunk assertion added last phase still passed — every internal consistency check a map can make about
itself was green. **A map cannot check its own size against a world it does not import.**

## 4. What the extra four columns and two rows were spent on

Not on stretching everything. The bands all run column 4 to `EAST_END`, which is now a constant rather
than a repeated `47`, and the two new rows went to the slope, because depth is what this map is
composed around (`0101` §1) and the slope was the shallow half of it. The slope is seven rows deep
now against the quad's eleven, with four more trees and the growth thickening downhill instead of
stopping in a line four rows below the wall.

The four columns became **a fifth block on the east range**, and that was the second thing the render
caught.

## 5. Two renders, and both found the same class of thing again

`0101` §5 recorded four defects that only a render could catch. The resize produced two more, in the
same family, and both were caused by moving one thing and not the thing anchored to it.

- **A ten-column hole in the building row.** The first resize moved the whole east range four columns
  east to keep it flush with the widened bands, which opened a gap between the library's east wing and
  the administration block wide enough to see the sky through. A quadrangle whose east side is a gap
  is not a quadrangle — which is a finding the _first_ render of this map already made, about the
  first render's four buildings on a lawn. Making the extra width a fifth block closes it.
- **A service yard stranded in open ground.** The yard did not move with the range, so it began four
  columns east of the door it serves with lawn behind half of it, reading as a strip of road stopping
  in the middle of a campus. It now fills the alley exactly — column 26 to 31, the wing's east face to
  the administration block's west face — and its ends are two buildings. **A service yard is a gap
  between two buildings or it is nothing.**

Neither is a coordinate error and no assertion in the repository is capable of holding an opinion
about either. The rasteriser used here is worth keeping as a habit rather than as a tool: rendering a
committed `.tmj` to a PNG is about forty lines against `sharp`, and it is the only tier that has ever
caught anything on this map.

## 6. What was deliberately not done

- **No `FIELD_MAPS["unit-09"]` entry.** `0101` §7 stands unchanged, and this phase is the argument for
  why it can stand: the reason not to write a fake entry was never that the map did not need checking,
  it was that a fake entry is worse than none. The answer is to check the map without one.
- **No change to `0101`.** It records what was decided and why. A decision log is a record, not a wiki
  page; this entry supersedes it on one fact, and a pointer at the top of that file says so.
- **No cast, no interiors, no activities.** Unchanged, and still one decision: there is no 1990s body
  in 140 character sheets and the PixelLab balance is $16.76 with the subscription's generations
  exhausted.

## 7. Verification

`node scripts/generate-furnace-bend-tmj.js` — 56×36, **95 collision rects**, 2/2 doors routed, the
trunk assertion passing. `npm run maps:build` leaves a clean tree, so the committed map is what the
generator produces. `npm run test` — **2,052 passing** across 75 files, 2,016 before; the new ones are
the guard, and nine of them are the grid check now covering nine maps rather than eight. The guard
fails correctly when the width is broken. `validate:content` 0 errors, `lint` 0 errors and the 5
standing warnings, `format:check`, `cspell` and `build` clean.

**And by eye, three times**, which is where both of §5 came from and where all four of `0101` §5 came
from before them.
