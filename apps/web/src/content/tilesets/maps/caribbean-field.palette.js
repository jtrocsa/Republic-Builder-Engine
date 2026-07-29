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

    // Bohío huts — top-left of a 2x2 stamp, roof row over walled base.
    hutOpenDoor: tile("Island survival/tile-B-02.png", 0, 0),
    hutClosedDoorRound: tile("Island survival/tile-B-02.png", 2, 12),
    hutClosedDoorSquare: tile("Island survival/tile-B-02.png", 0, 2),
  },
};
