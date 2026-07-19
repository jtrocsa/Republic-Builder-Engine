# 0029 — Caribbean Field Rebuilt on the Island Survival Tileset

Date: 2026-07-13

## Decision

Replace Unit 1's field (`caribbeanWorldMarkup()`) — previously 100% CSS-drawn shapes
(gradients, `clip-path` polygons, no tile art at all) — with a real Tiled `.tmj` tile
composite, following the same `renderTiledMap()`/`createTilesetImageResolver()` pattern
already used for Unit 2's Riverbend field. `apps/web/src/content/maps/caribbean-field.tmj`
is generated (not hand-edited) by `scripts/generate-caribbean-tmj.js` from the **Island
survival** tileset (`apps/web/src/assets/tilesets/Island survival/tile-B-01.png` and
`tile-B-02.png`), scoped to just those two sheets in the `import.meta.glob` call rather
than the whole 13-sheet pack folder.

An earlier, unwired prototype (`caribbean-field.tmj` built against the `Medieval Harbor`
pack, only ever reachable via the dev-only `apps/web/tiled-preview.html`) is superseded —
its own documented postmortem (`docs/architecture/POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md`
§11) found Medieval Harbor has no huts, palms, or campfire tiles at all, a poor fit for a
tropical Taíno scene. Island survival, inspected directly (grid-labeled crops of every
sheet), turned out to have real thatched bohío huts, multiple palm variants, a lit campfire,
a canoe/rowboat, a canvas tent, crates, and a full autotile coastline blob set — everything
needed from one pack, avoiding the seam problems of gluing multiple mismatched packs
together.

`FIELD_BLOCKS`, `isCaribbeanLand`, `FIELD_NPCS`, and `FIELD_NPC_PATROLS` in `main.js` were
**not changed** — the generator script treats those existing hand-authored coordinates as
the source of truth and places tile stamps to match them, and the ground layer is computed
by literally reusing `isCaribbeanLand`'s exact ellipse-union formula (padded ±1.2 grid units
for sand/shallow-water rings) rather than hand-tracing a coastline. Visual coastline and
walkable-land boundary can't drift apart because they're generated from the same math.

## Rationale

**No true autotile blob edges, deliberate simplification.** `tiled-map-loader.js` has no
flip/rotate support, and hand-computing correctly-oriented diagonal edge tiles for a
four-ellipse-union coastline (not a single straight shoreline) across 960 cells, without a
Tiled GUI, was judged too failure-prone for the value. Instead the ground layer uses
concentric rings of safe, uniform, non-directional textures (deep water → shallow water →
sand → grass), computed by padding the land-mask ellipses in/out — a real visual upgrade
over CSS gradients with near-zero placement risk. Island survival's coastline autotile set
(confirmed present) is available for a future pass if a smoother coastline is worth the
authoring cost later.

**The Spanish ship stays a CSS overlay**, not a tile stamp. Island survival's only ship art
is a wrecked hull (it's a castaway/survival-themed pack) — the wrong story beat for an
arriving, intact 1492 caravel. `.spanish-ship`/`.ship-shadow`/`.cartographer-table` are kept
as absolutely-positioned divs drawn on top of the tile canvas, same as before.

**Orphaned PNG props** (`rowboat.png`, `palm.png`, `shore-rocks.png`, `supply-crate.png`,
`field-tent.png`, `field-lantern.png`) were left unreferenced rather than wired in — Island
survival's native tile equivalents (palm, canoe, crate, tent) matched the rest of the new
scene's style better than compositing in separately-styled standalone PNGs would have. They
remain on disk, unused, same as before this change — not deleted, in case a later pass wants
them (e.g. `field-lantern.png` has no confirmed Island survival equivalent).

**Dead CSS removed.** All the CSS rules that existed only to draw the old scene
(`.ocean-layer`, `.island-sand/grass/main/west/east`, `.shore-rock*`, `.bohio*`, `.hut-one/
two/three`, `.canoe`/`.canoe-one`, `.garden`/`.garden-one`/`.crop-row*`, `.spanish-camp`,
`.campfire`/`.village-campfire`, `.crate`/`.crate-one`, `.tent-small`, `.palm`/`.p1-p4`) were
deleted from `global.css`, including a duplicate copy that existed at two separate locations
in the file (confirmed via grep that none of these class names render anywhere in `main.js`
after the swap before deleting). `.spanish-ship`/`.ship-shadow`/`.cartographer-table` and
their responsive/`!important` override blocks were kept intact.

## Notes

- Bundle-size regression check: the `import.meta.glob` for the new tileset is scoped to the
  two sheets actually referenced (`tile-B-01.png`, `tile-B-02.png`), not the whole `Island
survival/**` folder — an unscoped glob would have bundled all 13 sheets (many MB) into
  production regardless of use, the exact regression `tiled-map-import-checklist.md` warns
  about. (Separately, and pre-existing: Unit 2's own `Medieval Fishing Village/**` glob is
  itself unscoped and bundles a few files its `.tmj` doesn't reference — not touched here,
  out of scope for this pass.)
- Verified in-browser via a scripted Playwright pass (not just build/lint): the map renders
  with no console errors, the village/path/huts/palms/canoe/campfire/tent/ship all appear in
  their designed positions across the west (ship/cartographer), village (huts/path), and east
  (camp) regions, and walking the player toward open water stops cleanly at the sand/water
  boundary — confirming the land-mask/tile-art alignment holds in practice, not just in
  theory.
- `scripts/generate-caribbean-tmj.js` is checked in and re-runnable — regenerating the `.tmj`
  after any future `FIELD_BLOCKS`/`isCaribbeanLand` change (or a different tile choice) is a
  `node scripts/generate-caribbean-tmj.js apps/web/src/content/maps/caribbean-field.tmj`
  away, not a hand-edit.
- `.claude/agents/map-implementer.md`'s "Tiled remains deferred" line is now stale for this
  narrow case (Tiled `.tmj` rendering is an established pattern for two maps) — updated
  alongside this change.
