# 0032 — Common Cause Field Rebuilt on a Real Tileset (PixelLab + Medieval Fantasy Town)

Date: 2026-07-18

## Decision

Replace Unit 3's field (`commonCauseWorldMarkup()`) — previously CSS-drawn boxes, one
`<div>` per `UNIT3_FIELD_BLOCKS` entry with a text label — with a real Tiled `.tmj` tile
composite, following the same `renderTiledMap()`/`createTilesetImageResolver()` pattern
already used for Caribbean (`0029`), Riverbend, and the Archive Room (`0030`). This closes
the Gap Register's one remaining entry from `0031`: no existing pack fit 1770s colonial
Philadelphia architecture.

`apps/web/src/content/maps/common-cause-field.tmj` is generated (not hand-edited) by
`scripts/generate-common-cause-tmj.js`. Rather than commission an entirely new custom
tileset, the map composites art from **five** sources:

- **Medieval Fantasy Town** `1.png`, `2.png`, `5.png` — ground/plaza fill, and building
  silhouettes for the print shop, family residence, statehouse steps, assembly hall,
  chapel, market stalls, and town well. Only the pack's **unlabeled** buildings and props
  were used; its two signed buildings ("Adventurer's Guild", "The Sword & Shield") were
  deliberately avoided as direct stamps, since baked-in fantasy-tavern signage would read
  as a more immediate anachronism than an unlabeled silhouette. The assembly hall still
  reuses that first building's roof and archway (a genuinely fitting civic-building
  shape) — the sign row (row 2 of its 4×4 block) is swapped for that same sheet's plain
  stone wall tile instead, so no readable text renders.
- **Medieval Fishing Village** `tile-B-04.png` — the wharf, already the pack's canonical
  dock/maritime source per the style guide.
- **PixelLab, one generated asset** — a 48×144px liberty pole
  (`Common Cause Philadelphia/liberty-pole.png`), the one element with no equivalent in
  any downloaded pack.

`UNIT3_FIELD_BLOCKS`, `isCommonCauseLand()`, `UNIT3_FIELD_NPCS`, and
`UNIT3_FIELD_NPC_PATROLS` in `main.js` were **not changed**. The generator script's
`stamp()` anchors are hand-placed to align with each `UNIT3_FIELD_BLOCKS` rect's
top-left corner (same convention as `0029`), verified after generation by reading the
emitted `.tmj`'s `structuresData` array directly and confirming each building's GIDs
match its intended sheet coordinates — not just by eyeballing a screenshot.

## Rationale

**PixelLab budget forced a pivot from the original plan.** The initial plan was to
generate the entire building set via PixelLab. A single `create_tiles_pro` validation
call (intended to produce ~3 ground tiles) instead returned a full 16-tile Wang-style
variation set and consumed 20 of the account's 35 remaining trial generations in one
call — an order of magnitude more than expected. Rather than gamble the remaining budget
on 10 more building calls of uncertain per-call cost, generation was paused and the
existing downloaded packs were inspected directly (grid-labeled crops of every candidate
sheet) for usable substitutes first. This matched explicit user direction mid-session:
PixelLab should be reserved for genuinely unique objects/characters with no pack
equivalent, not used as the default source when existing art can be reused. Medieval
Fantasy Town turned out to have a stone well, striped-awning market stalls, a
civic-hall-shaped building, an actual church with a steeple, and a wooden lookout
watchtower (a good stand-in for "frontier dispatch post") — covering 9 of the 10
buildings. Only the liberty pole had no existing-pack equivalent at all, so that one
object was generated via `create_map_object` (cost: 1 generation, as expected).

**Avoiding baked-in anachronistic text mattered more than using the "best-looking"
building.** Medieval Fantasy Town's grandest civic building has "ADVENTURER'S GUILD"
painted directly into the tile art, and its nicest shopfront says "THE SWORD & SHIELD" —
both would read as an immediate, visible break in a Revolutionary Philadelphia scene, a
more literal mismatch than reusing neutral furniture (the precedent `0030` already set
for the Archive Room). The assembly hall keeps that building's roof/archway shape but
swaps out the sign row for plain wall; the print shop uses a different, unlabeled
building entirely rather than reworking the tavern sign.

**Verification combined visual and data checks.** A Playwright pass confirmed the canvas
renders with no console errors, the camera/collision invariants hold (the player stops
at the print shop's boundary rather than walking through it), and 6 of the 10 buildings
were visually inspected directly (print shop, family residence, assembly hall archway,
chapel, market stalls, town well, liberty pole). Synthetic keyboard events proved
unreliable for covering the full 40-column map in a scripted session, so the remaining
three buildings (statehouse steps, wharf, frontier dispatch post) were verified by
reading the generated `.tmj`'s `structuresData` directly and confirming the GIDs at each
anchor match the intended sheet row/column — a stronger check than a screenshot glance,
since it confirms the exact source tile rather than just "something rendered there."

## Notes

- Bundle-size regression check: the `import.meta.glob` calls in `main.js` name the five
  exact sheet files used, never a whole pack folder — the same discipline `0029`/`0031`
  call out as a repeated regression risk.
- `docs/architecture/art-and-map-style-guide.md` updated: the colonial-architecture GAP
  row flips to `CANONICAL`, the Common Cause per-setting section and pack roster now
  describe the real sources, and the Gap Register is empty.
- `scripts/generate-common-cause-tmj.js` is checked in and re-runnable — regenerating the
  `.tmj` after any future `UNIT3_FIELD_BLOCKS` change is a
  `node scripts/generate-common-cause-tmj.js apps/web/src/content/maps/common-cause-field.tmj`
  away, not a hand-edit.
- The stale CSS-drawn-scene comment block in `main.js` (previously explaining _why_ no
  tileset existed) and all `.commoncause-ground`/`.commoncause-building*` CSS rules in
  `global.css` were removed as dead code alongside this change.
