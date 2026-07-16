# 0030 — Institute Archive Room Given a Real Tiled Interior

Date: 2026-07-15

## Decision

The Institute Archive Room (added earlier this session, commit `c75ac65`) shipped with no
background art — it fell back to `.institute-map`'s plain navy CSS background, unlike the
Main Hall's illustrated `chronicle-institute-hub.png`. This pass gives it a real explorable
interior, following the same `renderTiledMap()`/`createTilesetImageResolver()` pattern
already used for Riverbend and the Caribbean field (`0029-caribbean-tiled-rebuild.md`).
`apps/web/src/content/maps/archive-room.tmj` is generated (not hand-edited) by
`scripts/generate-archive-room-tmj.js`, scoped to exactly the three sheets it uses
(`tile-B-01.png`, `tile-B-03.png`, `tile-B-05.png` from the **Medieval Tavern** pack) in the
`import.meta.glob` call, not the whole pack folder.

The room now has a stone floor, a wood-floor "reading nook," an archive record shelf and a
wine-rack-style record cabinet (both reused from tavern shelving/wine-rack sprites — read
naturally as record storage), a long reading table, a stool, and two corner wall torches.
`ARCHIVE_ROOM_BLOCK_RECTS` was re-measured against the generated art (two rects: the
shelving block and the table) rather than left at its placeholder single desk-sized rect.

## Rationale

**Medieval Tavern, not Modern Interiors.** The obvious-sounding "office/archive" candidate —
the unused `Modern Interiors` pack, whose furniture sheet has filing cabinets, a wood card
catalog, desks, and computer terminals — was evaluated and rejected after direct pixel
inspection. Its sheets (400×600, 800×800, 815×819px, no consistent tile grid) are hand-packed
sprite-preview sheets, not a uniform Tiled-ready tile atlas — an alpha-transparency gutter
scan across all four sheets found almost no clean row/column gaps, meaning individual
furniture pieces sit at arbitrary, irregular pixel offsets that `tiled-map-loader.js` (which
assumes one fixed `tilewidth`/`tileheight`/`columns` per tileset image) can't address without
extremely fragile, hand-hunted per-sprite crop coordinates. `Medieval Tavern`, by contrast, is
confirmed to be the exact same 768×768px/48px-tile/16-column/zero-margin family already
proven by `Island survival` (Caribbean) and `Medieval Fishing Village`/`Medieval Fantasy
Town`/`farm` (Riverbend) — grid math could be trusted immediately, verified by generating
labeled-overlay crops of the candidate sheets. It also fits the project's visual language
better: CLAUDE.md's visual-design section explicitly asks for "blue/gold/bronze/parchment
historical-adventure look, not a generic admin-panel style," and `Modern Interiors`'
blue-plastic office furniture and computer monitors would have pulled the opposite direction.
A tavern's wine-rack shelving, wooden crates, and warm torch-light reads as "archive record
storage" with only a change of framing text, not a change of art.

**No wall auto-tiles.** `Medieval Tavern`'s `Auto-tile-A4-Walls-*.png` sheets use an RPG
Maker-style autotile blob layout (large multi-cell swatches implying corner/edge blend
rules), which `tiled-map-loader.js` doesn't parse and which would be high-risk to hand-derive
without a Tiled GUI to iterate against. The room draws only `ground` and `structures` tile
layers, same as Caribbean/Riverbend; "walls" are still the existing `.institute-map` CSS
frame (gold border, rounded corners), not tile art — consistent with how the Main Hall and
both field maps already treat their outer bounds.

**A per-room CSS aspect-ratio override, not a resized grid.** `ARCHIVE_ROOM_GRID` (10×8,
1.25:1) doesn't match `.institute-map`'s existing `aspect-ratio: 1.67/1` (tuned for the Main
Hall's 18×12 grid and, not coincidentally, Caribbean/Riverbend's 40×24 grids). Resizing
`ARCHIVE_ROOM_GRID` to match would have meant rescaling every existing
`ARCHIVE_ROOM_TARGETS` coordinate and `ARCHIVE_ROOM_BLOCK_RECTS` entry for no functional
gain. Instead, a scoped `.institute-map--archive-room { aspect-ratio: 1.25/1; }` rule (added
to `global.css`, applied only via a second class on the Archive Room's own `<section>`)
leaves the Main Hall/field-map sizing untouched.

## Notes

- **A real bug caught by browser verification, not by lint/build.** The first collision-rect
  placement for the reading table (`x2: 4.85`) overlapped the `exitDoor` spawn point's
  foot-box by ~0.13 grid units (the spawn is `exitDoor.x, exitDoor.y - 0.6` = `5.0, 6.1`; a
  foot-box radius of 0.28 reaches `x=4.72`, inside a rect ending at `4.85`). The player's very
  first frame in the room already read as colliding with the table, and the hub movement loop
  refuses to advance out of a currently-blocked position — every arrow key silently did
  nothing. `npm run test`/`build`/`lint`/`validate:content` all passed the whole time; only a
  scripted Playwright walk through the room caught it. Fixed by tightening the rect to
  `x2: 4.6` (collision intentionally smaller than the drawn table, same convention as
  `0026-archive-pathing-cursor-audio.md`).
- Verified in-browser via a scripted Playwright pass: entered the room from the Main Hall
  door, confirmed the tile canvas rendered with zero console errors, walked to and opened the
  Archive Terminal dialogue, walked into the reading table and confirmed collision stops the
  player at its edge, returned to the Terminal, then exited back to the Main Hall and
  confirmed the Director/Amani/Julian NPCs, Preservation Case, and Navigation Table all still
  render unchanged.
- Bundle-size regression check: the `Medieval Tavern` `import.meta.glob` is scoped to the
  three sheets actually referenced, confirmed by grepping the production build output for
  `Medieval Tavern/` paths (exactly `tile-B-01.png`, `tile-B-03.png`, `tile-B-05.png` appear —
  not the pack's other two `tile-B-*` sheets or its three `Auto-tile-A4-Walls-*` sheets).
- `scripts/generate-archive-room-tmj.js` is checked in and re-runnable — regenerating the
  `.tmj` after any future furniture/layout change is a
  `node scripts/generate-archive-room-tmj.js apps/web/src/content/maps/archive-room.tmj`
  away, not a hand-edit.
- The Archive Terminal's own placeholder dialogue ("Archive Challenges for this unit are
  still being cataloged") is unchanged by this pass — this is art only, no Archive Challenge
  content or data-model work is included here.
