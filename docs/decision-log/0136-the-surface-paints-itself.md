# 0136 — The surface paints itself

**Phase 137 · 2026-09-12 · Accepted**

The last thing about a field surface that was still hand-dispatched. Nineteen `if`s in `render()`
become one call, and the table that already described everything else about a surface now describes
this too.

---

## 1. What it was

```js
if (activeFieldMap().id === "unit-02") renderRiverbendTiledMap();
if (activeFieldMap().id === "unit-01") renderCaribbeanTiledMap();
…sixteen more…
```

Nineteen consecutive lines, each re-calling `activeFieldMap()`, and the code's own comment conceded
the point: _"This is still the one genuinely hard-coded per-map switch in the field runtime — a new
map or room adds a line here."_

Everything else about a surface had already been made data. `FIELD_MAPS` entries carry `id`, `grid`,
`isLand`, `blocks`, `roads`, `npcs`, `behaviours`, `sourcePoints`, `musicScene` — and `worldMarkup`,
which is **already a function**. An interior declares the identical shape, which is what lets
`activeFieldMap()` be the whole switch for collision, navigation, proximity and interaction.
Painting was the one exception.

## 2. Why this was safe to do mechanically

Two things had to hold, and both were checked before anything moved rather than assumed:

- **Every one of the 21 `renderXTiledMap` wrappers had exactly one call site** — this chain. There
  was no second caller to keep in sync, so moving the reference onto the surface is a move, not a
  redesign.
- **All 22 are hoisted `function` declarations**, not `const` arrows
  (`grep -c "^const render[A-Za-z]*TiledMap"` → **0**). A `const` would have been in its temporal
  dead zone inside the `FIELD_MAPS` literal, which is defined thousands of lines later in source but
  evaluated at module load. Interiors are attached after the literal anyway, so they were never at
  risk; the eight outdoor entries were.

## 3. The failure mode is quieter than what it replaced, so the guard ships with it

`activeFieldOutdoorMap()` falls back to `FIELD_MAPS["unit-01"]`, so a surface **always** resolves.
That means a surface missing `renderMap` does not throw and does not blank the screen — it evaluates
`?.()` to nothing and paints **an empty frame**, with the cast, the record markers and the recall
beacon all drawn on top of it. That is the `FIELD_COPY` failure shape exactly, and this is the third
phase of this audit to meet it.

The chain it replaces was at least _visible_: nineteen lines you could count against a list of maps.
A table entry is not. So `tests/unit/field-map-coordinates.test.js` asserts one `renderMap` per
walkable field surface — **all eighteen, interiors included**, because a room that paints nothing is
exactly as broken as a map that does. Watched fail both ways: with `unit-06`'s entry removed
(_"unit-06 has no renderMap, so render() calls nothing for it and the surface paints nothing at all
— no error, no blank-screen exception, just an empty frame"_) and with `fairmeadow-model-house`'s.

The guard derives its list from `FIELD_MAPS` and each map's `interiors`, so a nineteenth surface is
covered the day it is declared, without anyone remembering this file.

## 4. The three hub rooms stay as they are

`render()` still ends with a three-way branch on `progress.currentHubRoom` for the Entrance Hall, the
Archive Room and the Hallway. That was left alone deliberately: it dispatches on a **room id, not a
surface id**, there is no hub equivalent of `FIELD_MAPS` to hang a `renderMap` on, and inventing one
to tidy three lines is a bigger change than the one it tidies. Three lines you can read is not the
problem nineteen were.

## 5. Size

`main.js` is 34 insertions against 28 deletions — the chain and its comment out, eighteen
`renderMap:` lines and a shorter comment in. The net is six lines, which is not the point; the point
is that a nineteenth surface now costs a field in its own entry rather than a line in a switch
somebody has to find.

Two documents move with it, because this adds a field to the surface shape: `activeFieldMap()`'s
docstring, which enumerates what an interior declares, and CLAUDE.md's **"An interior declares
exactly the fields an outdoor map declares — that shape-equality is the design"** invariant.

---

## Verification

**All 61 visual baselines unmoved**, which is the gate that matters here: the suite photographs every
one of the eight outdoor maps and all ten interiors, so a surface that stopped painting would show as
an empty frame in its own baseline. 21 visual tests passed.

Every field and interior e2e spec run as well — `suburb-interiors`, `richmond-interiors`,
`railhead-interiors`, `port-interiors`, `field-interiors`, `field-recall`,
`field-dialogue-lifecycle`, `npc-behaviour-field` — 20 tests, all passing.

`npm run check` clean: **2,333 unit tests across 79 files** (up 18), ESLint 0 errors and the same 5
pre-existing warnings, cspell across 604 files, `validate:content` at 169 groups. `npm run build`
clean. `field-map-coordinates.test.js` goes **431 → 449**.
