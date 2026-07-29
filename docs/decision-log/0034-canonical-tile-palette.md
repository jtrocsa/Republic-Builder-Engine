# 0034 — Canonical tile palette and the full tile-library catalog

**Date:** 2026-07-29
**Status:** Accepted
**Supersedes in part:** `0031-art-style-unification.md` (its Canonical Element Dictionary)

## Context

The tileset library grew from 9 packs / 87 files to **28 packs / 250 sheets** — roughly 20 packs
were purchased and added after the art guidance was written, and nothing had been decided about
any of them. All 48×48px, all from one commercial bundle, full usage rights held.

Meanwhile "what tile is grass here" was decided ad hoc, per map, inside each generator script as
local constants. `generate-caribbean-tmj.js` carried a comment noting its coordinates had been
confirmed by eyeballing a grid-labeled crop written to `/tmp` during authoring — an artifact no
later session could reproduce or check.

`art-and-map-style-guide.md` was the right idea in the wrong medium. Prose cannot fail, and two of
its claims were wrong:

- It named `Medieval Tavern/tile-B-01.png` as the canonical interior floor. A GID audit of
  `archive-room.tmj` shows the whole ground layer sits in the `firstgid: 513` range — that is
  `tile-B-05.png`. `tile-B-01.png` has no floor textures at all.
- Its own scope line still described the library as "9 packs (87 files, not 'thousands')."

## Decision

**1. Tile identity moves out of generator scripts into data.**
`apps/web/src/content/tilesets/canonical-palette.js` names one canonical tile per element, as
`{ sheet, row, col }`. Per-map palettes in `maps/` extend it. Generators keep layout and
collision-mask logic and lose their GID literals. `scripts/lib/palette-gids.js` derives firstgids,
sheet geometry (read from the PNG header) and the `tilesets[]` array.

**2. One painted 48px art family is canonical; off-style and off-grid packs are benched.**
Benched: `Modern World` (flat overworld art language), `Green Apocalyptic 1` (no APUSH setting),
`Green Apocalyptic 2` and `Modern Interiors` (off-grid), `army` (modern MBTs), `Labratory`
(sci-fi). Files stay on disk; a test enforces that nothing references them.

**3. The forward map slate for Periods 1–9 is decided now, sheet-level, not tile-level.**
`maps/planned-maps.js` records 22 planned map slots plus the live 5. Deliberately **no** tile
coordinates for unbuilt maps — a coordinate can only be chosen against a real composition, and
inventing one would be a guess dressed as a decision.

**4. Everything is enforced by a test.** `tests/unit/tile-palettes.test.js` (29 assertions) fails
if a palette names a missing sheet, an off-grid sheet, a coordinate outside its sheet, a benched
pack, or an unregistered gap.

## Findings worth recording

- **The three `Auto-tile-A4-*.png` sheets are byte-identical across 13 pack folders** — 34 files,
  3 unique, confirmed by content hash. Every other sheet in the library is unique. Referencing two
  paths to the same bytes would make Vite bundle the image twice, so `SHARED_SHEETS` pins one
  canonical path each.
- **18 sheets are off-grid** and cannot be addressed by `tiled-map-loader.js` at all: 13 ×
  `Green Apocalyptic 2` and `Modern World/1.png` at 2048² (42.67 tiles), and all 4
  `Modern Interiors` sheets. The loader computes `sx = (localId % columns) * tilewidth`, so an
  off-grid sheet draws misaligned art rather than failing — a silent failure mode worth a guard.
- **Genuinely valuable material that had never been catalogued:** `19th Centruy European Dock` is
  the strongest pack in the library for Chronicle (labelled COFFEE/sugar/grain cargo sacks,
  balance scales, quay, decking, coastal water); `Medieval harbor/tile-B-04.png` holds the only
  period square-rigged sailing ships anywhere in the collection; `farm/1.png` has cotton;
  `Wild West/tile-B-04.png` has the only rail track; `farm/2`/`6`/`7` are the best rural North
  American vernacular available and were previously dismissed as "one crop-row tile."
- **The "modern institute interior" gap is now closed but not actioned.** It was recorded when the
  only candidate was the off-grid `Modern Interiors`. `office/3.png`, `office/4.png`,
  `19th Century European City/tile-B-04.png` and `Steampunk/5.png` all fit. Recorded as a
  candidate; restyling the hub needs its own sign-off.

## Gaps that remain real

Indigenous North American architecture (blocks a Period 1 map), Civil War military camp (blocks a
Period 5 map), antebellum plantation great house (partial), mid-century streetscape (partial).
These need new art, not a better search of what exists.

## Consequences

- Four of the five live maps regenerate **byte-identically** after the refactor — verified by
  `git diff` on each `.tmj`. The refactor changed how tiles are named, not what is drawn.
- `riverbend-field.tmj` stays hand-authored; its palette is descriptive, extracted by GID audit.
- The `Sandy Island` pack the owner deleted took a dead cluster with it:
  `sandy-island-demo.tmj`, its generator, `resize-sandy-island-spritesheet.ps1`,
  `apps/web/tiled-preview.html` (which imported it and is not a Vite build entry), and the orphan
  `tilesets/spritesheet.json` whose sibling `.png` was already gone.
- `npm run assets:label` is now a committed tool, so no future session re-derives tile
  coordinates by hand in a temp directory.
