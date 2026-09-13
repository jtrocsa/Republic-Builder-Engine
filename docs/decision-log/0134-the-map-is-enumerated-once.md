# 0134 — The map is enumerated once

**Phase 135 · 2026-09-12 · Accepted**

Every `render()` on a map screen re-walked the whole tilemap. Pressing `E` on an NPC cost one;
pressing `E` again to close cost another. The enumeration is memoised now, and the one thing that
would make that unsound is checked rather than assumed.

---

## 1. Why the existing guard could not work

`renderTiledMapWithOverlay()` guards its redraw on `canvas.dataset.rendered !== "true"`. That flag
lives on the `<canvas>` element — and `render()` ends with `app.innerHTML = html`, which destroys it.
The canvas handed to the next call is always a fresh node with no flag, so the guard has only ever
deduplicated repeat calls **within one mount**, which is not where the cost is.

So the trigger is not some rare path. It is every full render on the field or a hub room:
`toggleFieldDialogue()` ends `save(); render();`, and so does the Mission Tracker toggle, whose own
comment observes that "re-rendering the whole field screen is what every other field action does."

## 2. What it cost, measured — and a number corrected

Parsing the committed `.tmj` files, per `render()` on a 56×36 outdoor map:

| map              | cell iterations | tile objects | `drawImage` |
| ---------------- | --------------- | ------------ | ----------- |
| caribbean-field  | 12,096          | 4,456        | 2,228       |
| riverbend-field  | 12,096          | 5,266        | 2,633       |
| richmond-field   | 12,096          | 5,588        | 2,794       |
| fairmeadow-field | 12,096          | 5,244        | 2,622       |

Four walks per render: `tilesForFrame()` is called twice per canvas — once at `:197` to build
`drawnTilesets`, once inside `drawFrame` — and there are two canvases, `below` and `overlay`.

**`0131` §8 said 24,192 and that was wrong; it is corrected in place.** The error is worth recording
because it is the same species as the audit that produced it. Both the audit and my own arithmetic
assumed `selectLayers()` filtered _after_ the cell walk, so that the overlay canvas scanned all three
layers to emit fourteen tiles. It does not — `tilesForFrame()` iterates `selectLayers(tmj, depth)`
and only ever touches that depth's own layers. The overlay pass walks its single 2,016-cell layer,
not 6,048. **The figure was double the truth, and it was read off the code rather than measured.**
The tile-object counts were right.

`animationIndexByTileset(tmj)` was also rebuilt on every `renderTiledMap()` call — a `Map` of `Map`s
over every tileset's `tiles` array, ten tilesets deep on Richmond, for a result that cannot change.

Measured end to end, A/B on the same machine against the same map with the JIT warmed —
`tilesForFrame()` called four times as one `render()` does, 200 iterations each arm:

|        | enumeration per `render()` |
| ------ | -------------------------- |
| before | **0.360 ms**               |
| after  | **0.011 ms**               |

After a map's first paint a render costs **no cell iterations at all** — four cache lookups. The
first paint is unchanged, which is the point: nothing the player waits for on arrival got slower.

## 3. What is cached, and what deliberately is not

**The enumeration, not the draw calls.** The canvas is a new DOM node and `renderTiledMap()` sets
`canvas.width`, which clears it, so the drawing genuinely must happen again — the ~2,700 `drawImage`
calls stay. Anyone reading this later should not expect them to disappear.

Removing those too would mean caching the **composited bitmap**, and that was weighed and declined:
at 2688×1728 a cached copy is **~18.6 MB per canvas** against ~500 KB for a tile list, and the page
already holds two canvases that size. The list is where the measured cost was.

Both caches are `WeakMap`s keyed by the parsed `.tmj` object, so a map the player never visits is
never enumerated and nothing is retained beyond that object's own life.

## 4. The one thing that makes it unsound, checked rather than assumed

The cache is only correct because `elapsedMs` cannot matter — and it cannot matter only while
nothing on the map animates. **No committed `.tmj` has an animated tileset**, verified across all
twenty-two. That makes the cache safe today and a trap tomorrow: a naive version would freeze the
first animated map anyone authors onto whichever frame happened to be cached first, silently.

So `tilesForFrame()` computes `cacheable` from the animation index itself and a map with any
animated tileset falls through to the live walk, exactly as before. There is deliberately **no
identity check** on the passed index: an all-empty index cannot change the output whoever built it,
and an index that does animate never reads or writes the cache.

The `drawnTilesets` double-call at `:197` needed no separate fix — the second call is now a `Map`
lookup, so the cache subsumes it.

## 5. The guards, and which one was already there

Four new tests in `tests/unit/tiled-map-loader.test.js`: a repeated `(map, depth)` returns the same
array; the cache is keyed by depth, so the overlay pass does not get the ground pass's tiles; it is
keyed by map, so two maps do not share a list; and **a map with an animated tileset is not cached**.

That last one is the one that matters, and it was watched fail by replacing the check with
`const cacheable = true` — the tempting simplification. **Two tests catch it, and one of them
predates this phase**: `"picks the animated tile's active frame for the given elapsed time"` has been
in this file since the loader was written. The risk was already understood here; it just had nothing
to break until now.

## 6. Verification

The 61 committed visual baselines are the correctness gate, and they are the right tool: a single
tile in the wrong place moves a screenshot. **All 21 visual tests passed, no baseline moved.**
`frame-budget.spec.js` — the spec asserting that walking costs zero renders — passes.

The full Playwright suite was run, because this change touches every map render: **378 passed, 0
failed, 3 flaky, 20.2m.**

Three flaky is not nothing, and `playwright.config.js` says so itself — _"the number to watch is
`flaky`, not `passed`"_. So they were checked rather than waved through.

Two of the three are in `non-field-missions.spec.js` and `liaison-intro.spec.js`, and the
`non-field-missions` failure is inside `enterSavedGame()` clicking **Student** on the title screen
— _"element was detached from the DOM, retrying … waiting for navigation to finish"_ — which is a
page-load race before any map exists, on a spec about the missions that do **not** walk one.

`liaison-intro` does render a tilemap, so that one was A/B'd rather than argued: three runs per arm
with `--retries=0`, the memoised loader against the committed one.

|                    | result                                               |
| ------------------ | ---------------------------------------------------- |
| after (memoised)   | 6 passed / 6 passed / 6 passed — 29.2s, 29.3s, 29.7s |
| before (committed) | 6 passed / 6 passed / 6 passed — 29.5s, 29.6s, 29.1s |

Identical, within noise. The flakes belong to the suite under twenty minutes of parallel load, not
to this change.

`npm run check` clean. `npm run build` clean.

---

## What this does not address

`render()` still rebuilds the entire screen for a change that affects one panel: ~20–25 KB of HTML
and 150–200 nodes on the field, on every `E` press. This phase makes that cheaper, not rarer. The
file already contains the pattern for making it rarer — `closeFieldDialogueOnMove()` patches two
nodes and explains why — and applying it to the dialogue and tracker paths is a separate, larger
change with its own risk.
