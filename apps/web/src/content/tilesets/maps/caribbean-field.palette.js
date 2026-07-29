// Palette for caribbean-field.tmj (Unit 1 / case-001, "The Atlantic Crossroads").
// Setting: a Caribbean island, 1492. Consumed by scripts/generate-caribbean-tmj.js.
//
// Every coordinate here is verified by the fact that the shipping map renders correctly with it
// today — these were lifted from that generator's own constants and cross-checked against a GID
// audit of the committed .tmj. See docs/decision-log/0029-caribbean-tiled-rebuild.md.

import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "caribbean-field",
  period: 1,
  status: "live",
  map: "apps/web/src/content/maps/caribbean-field.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in
  // the committed .tmj changes.
  sheets: [
    { path: "Island survival/tile-B-01.png", name: "island-survival-b01" },
    { path: "Island survival/tile-B-02.png", name: "island-survival-b02" },
    { path: "Island survival/5.png", name: "island-survival-05" },
    // Ships only. This pack's *water* is flatter and more saturated than Island survival's and
    // the two must never share a coastline (see TILE-LIBRARY-CATALOG.md), but its transparent-
    // background hulls sit on Island survival water with no seam. It is also the only source of
    // period square-rigged sailing ships anywhere in the library.
    { path: "Medieval harbor/tile-B-04.png", name: "medieval-harbor-b04" },
  ],

  tiles: {
    // --- terrain, straight from the canonical palette ---
    sand: CANONICAL["sand.tropical"],
    sandDriftwood: CANONICAL["sand.tropical.driftwood"],
    sandShells: CANONICAL["sand.tropical.shells"],
    grassA: CANONICAL["grass.tropical"],
    grassB: CANONICAL["grass.tropical.alt"],
    grassTuft: CANONICAL["grass.tropical.tuft"],
    waterShallow: CANONICAL["water.tropical.shallow"],
    waterDeep: CANONICAL["water.tropical.deep"],
    pathLeft: CANONICAL["path.tropical.left"],
    pathRight: CANONICAL["path.tropical.right"],

    // --- setting-specific, not canonical anywhere else ---
    /** Full-bleed underwater coral cluster. Open water only — it has no shoreline edge. */
    coralPatch: tile("Island survival/tile-B-01.png", 4, 8),

    // Single-cell props.
    campfire: tile("Island survival/tile-B-01.png", 13, 12),
    canoe: tile("Island survival/tile-B-01.png", 13, 13),
    crateA: tile("Island survival/tile-B-01.png", 15, 13),
    crateB: tile("Island survival/tile-B-01.png", 15, 14),
    tent: tile("Island survival/tile-B-01.png", 14, 11),

    // Palms — top-left of a 1-wide x 2-tall crown-then-trunk stamp.
    palmA: tile("Island survival/tile-B-01.png", 12, 0),
    palmB: tile("Island survival/tile-B-01.png", 12, 1),
    palmC: tile("Island survival/tile-B-01.png", 14, 0),

    // Bohío huts — top-left of a 2x2 stamp, roof row over walled base. [labeled]
    hutOpenDoor: tile("Island survival/tile-B-02.png", 0, 0),
    hutClosedDoorRound: tile("Island survival/tile-B-02.png", 2, 12),
    hutClosedDoorSquare: tile("Island survival/tile-B-02.png", 0, 2),
    /** Fourth bohío, door plus side window. [labeled] */
    hutDoorWindow: tile("Island survival/tile-B-02.png", 2, 0),
    /** Larger conical thatched house — reads as the village's principal dwelling. [labeled] */
    hutLarge: tile("Island survival/tile-B-02.png", 4, 0),
    /** Open-sided thatched work canopy on posts, no walls. [labeled] */
    workCanopy: tile("Island survival/tile-B-02.png", 4, 4),
    /** Timber drying/storage rack, 2 tall x 2 wide. [labeled] */
    dryingRack: tile("Island survival/tile-B-02.png", 10, 2),

    // Garden — full-bleed leafy rows with fence posts baked in, used as a ground-layer patch
    // for the village conuco rather than as a structures stamp. [labeled]
    gardenRowTop: tile("Island survival/tile-B-02.png", 14, 4),
    gardenRowBottom: tile("Island survival/tile-B-02.png", 15, 4),

    /** Full-bleed jungle canopy. Drawn on the overlay layer so the player walks *under* it. */
    jungleCanopy: tile("Island survival/tile-B-01.png", 8, 12),

    // Small transparent-background scatter decor, 1x1. Purely visual — no collision rects, so
    // the player walks over them; they exist to break up open grass at the new map size.
    // [labeled]
    scatterBoulder: tile("Island survival/tile-B-01.png", 12, 6),
    scatterRock: tile("Island survival/tile-B-01.png", 13, 6),
    scatterPebble: tile("Island survival/tile-B-01.png", 14, 6),
    scatterFern: tile("Island survival/tile-B-01.png", 12, 7),
    scatterBush: tile("Island survival/tile-B-01.png", 13, 7),
    scatterShrub: tile("Island survival/tile-B-01.png", 14, 7),
    scatterReed: tile("Island survival/tile-B-01.png", 15, 7),
    scatterPlant: tile("Island survival/tile-B-01.png", 12, 8),

    // Cartographer's chart table — 2 rows x 3 cols, a world map on wooden rollers. Replaces the
    // CSS-drawn `.cartographer-table` div, whose absolute pixel offsets were tied to the old
    // 40px tile size. [labeled]
    chartTable: tile("Island survival/5.png", 8, 0),
    /** Loose map scrolls, 2x2. [labeled] */
    mapScrolls: tile("Island survival/5.png", 8, 3),
    /** Ship's anchor, 2x2. [labeled] */
    anchor: tile("Island survival/5.png", 6, 2),
    /** Supply barrel. [labeled] */
    barrel: tile("Island survival/5.png", 0, 6),
    /** Lidded shipping crate. [labeled] */
    seaCrate: tile("Island survival/5.png", 0, 8),

    // The Spanish flotilla, anchored offshore — replaces the CSS-drawn `.spanish-ship` div.
    // Three-masted square-rigged hulls, period-correct for 1492. [labeled]
    /** Flagship: 2 rows x 3 cols, masts on the upper row. */
    shipFlagship: tile("Medieval harbor/tile-B-04.png", 0, 13),
    /** Caravel: 2 rows x 2 cols. */
    shipCaravelA: tile("Medieval harbor/tile-B-04.png", 0, 4),
    /** Second caravel, different livery. */
    shipCaravelB: tile("Medieval harbor/tile-B-04.png", 2, 4),
    /** Ship's boat drawn up on the sand, 2 rows x 1 col. */
    shipsBoat: tile("Medieval harbor/tile-B-04.png", 4, 2),
  },
};
