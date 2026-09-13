# 0135 — What the student downloads before they can move

**Phase 136 · 2026-09-12 · Accepted**

`vite.config.js` had no `build` block at all, so Vite's default inlined 507 sprite PNGs into the one
render-blocking module — 1.47 MB of base64, 38.6% of a 3.8 MB entry chunk. And Unit 9's map, which
nobody can enter, shipped 2.05 MB of art nothing else uses.

Both measured before and after, on the built output rather than on the source.

---

## 1. Unit 9's art, and why the reasoning that put it there was sound

`main.js` imported `furnace-bend-field.tmj?raw`, `JSON.parse`d it at module load, built a resolver
with five `eager: true` globs, and registered `SURFACE_TILESETS["unit-09"]`. The unit is in neither
`UNITS` nor `FIELD_MAPS`, so that entry is keyed by a unit nothing can select and could never be
called.

The argument for wiring it early is in `0101` §7 and it is a good one: **no placeholder cast, no stub
`FIELD_MAPS` entry with an empty npc list, no fake `worldMarkup`** — an entry standing in for work
that has not happened is scaffolding a future reader cannot tell from the real thing. That reasoning
is untouched here. What it did not account for is `eager: true`, which is a **static bundle
inclusion** whatever the runtime does with it. Two of the five sheets are declared by no other map:

| sheet                       | bytes     |
| --------------------------- | --------- |
| `University/tile-B-04.png`  | 1,016,421 |
| `Modern Park/tile-B-05.png` | 1,038,348 |

The other three are shared with Fairmeadow and cost nothing extra. So the bill was **2.05 MB in
every student's download for a unit none of them can reach**, plus a 19 KB `.tmj` parsed before
first paint. Confirmed: `dist/assets` goes **89 files → 87**, 39,073,234 → 36,998,894 bytes.

Nothing was deleted from disk. The `.tmj`, its generator and its `.blocks.js` all remain, and
`field-map-coordinates.test.js` still checks the committed file's grid and rects, because that block
keys off the `*-field.tmj` files rather than off `FIELD_MAPS`. `main.js` carries the restore
instructions at the point where the resolver used to be.

## 2. 507 sprites welded into the entry chunk

Vite inlines any asset under `assetsInlineLimit`, default 4 KB, as a base64 `data:` URI. The
character walk strips are almost all under that. So a student downloaded, decompressed, parsed and
evaluated **every sprite in the game** before the title screen could draw — and `index.html` is a
bare `<div id="app">` with no loading state, so that time is spent looking at a white page.

Measured on the built output, served over gzip with a cold cache, throttled to **4 Mbps / 100 ms
RTT** — a plausible school connection — five runs each, median:

|                        | entry chunk gzip | first interactive | requests | over the wire |
| ---------------------- | ---------------- | ----------------- | -------- | ------------- |
| default (4 KB)         | 1,710 KB         | **3,880 ms**      | 34       | 1,738 KB      |
| `assetsInlineLimit: 0` | 667 KB           | **1,788 ms**      | 4        | 691 KB        |

**61% off the gzipped chunk, 54% off time-to-interactive**, and the runs are tight — 3,868–3,893 ms
against 1,780–1,810 ms, so the gap is not noise.

**The usual objection to un-inlining is more requests, and the measurement says the opposite.**
Requests to reach an interactive title screen go **down**, 34 → 4 on the throttled run and 34 → 22
un-throttled, because the title screen needs no sprites at all. They stop being fetched up front and
start being fetched when a map draws.

## 3. Verifying a build option the test suite cannot see

This is the part that needed care. `npm run test:e2e` runs against `npm run dev`, and
`assetsInlineLimit` is a **build** option — in dev, Vite serves assets as URLs regardless. So the
suite, including all 61 visual baselines, is blind to this change by construction. Passing it proves
nothing about the thing being changed.

So the two builds were compared directly, each served with gzip and driven through the real title →
Student → Load Save entry into the Caribbean field:

- **The map is pixel-identical.** Both canvases hash the same across the two builds —
  `caribbeanTiledCanvas` at `7f90a2355ee66d39` (3,589,934 chars of data URL) and its overlay at
  `f3da6857acd3461c`.
- **Every sprite resolves.** Nine drawn on that screen: six data URIs and three files before, nine
  files after, **all 200**, with zero failed requests and zero page errors in either build. That is
  the specific risk of un-inlining — a sprite that 404s is an invisible `<span>`, not an error.

The visual suite was still run (21 passed, no baseline moved) because `main.js` changed for Unit 9.

## 4. A guard caught this, and re-keying it was the real work

`tests/unit/tile-palettes.test.js` failed immediately: _"furnace-bend-field draws
University/tile-B-04.png, but main.js has no import.meta.glob for it — the resolver will throw and
the map will render as an empty frame."_

That guard exists because the defect it names **has shipped three times**. But read what it asserts:
`createTilesetImageResolver()` has to be _called_ to throw, and it is only called for a map `main.js`
imports. Furnace Bend cannot draw a frame at all. The guard was keyed to _every committed palette_
when its question is _every map that renders_ — `0119`'s mistake, and `0133`'s, a third time.

It is keyed to the `?raw` import now. That excludes nothing that can fail: the moment somebody adds
the import back, every sheet is checked again.

**And the exclusion needed its own guard, so it got one.** The state it could otherwise hide is
precisely what this phase removed — a map `main.js` does not import whose sheets are globbed anyway,
which is bundle weight for something unreachable, invisible because nothing renders and nothing
throws. Watched fail by restoring one glob without the map: _"it globs 1 sheet(s) no other map uses,
which ships their bytes to every player for a map none of them can reach."_ The original assertion
was watched fail too, by dropping a glob from Fairmeadow, which does render.

**Two false starts, both worth recording**, because both are this file's own subject:

1. Keying on the bare filename read `main.js`'s **restore-instructions comment** as a wiring. Both
   checks match a call now — the import specifier and `import.meta.glob("…")` — because a sentence
   about a file is not a use of it, and this is a text scan of prose-heavy source.
2. Defining "exclusive to this map" as _globbed exactly once_ was simply wrong. Furnace Bend and
   Fairmeadow **share two sheets**, each globbed once, and that single glob belongs to the map that
   renders. Exclusivity is now asked of the other palettes, not of a count.

---

## Verification

`npm run check` clean — **2,315 unit tests across 79 files** (up 22), ESLint 0 errors and the same 5
pre-existing warnings, cspell across 603 files, `validate:content` at 169 groups. `npm run build`
clean. 21 visual tests passed, **no baseline moved**. The production A/B in §3 is the verification
that matters, because the suite cannot see this change.

## What this does not do

No code splitting. All eight units' content is still statically imported and evaluated at boot; the
entry chunk is 2.33 MB raw and Vite still warns about it. Splitting unit content behind dynamic
`import()` needs async boundaries in a synchronous codebase and is a design decision, not a build
setting.
