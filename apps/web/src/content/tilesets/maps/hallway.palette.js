// Palette for hallway.tmj — the Institute onboarding corridor.
// Consumed by scripts/generate-hallway-tmj.js.
//
// Deliberately identical sheets to archive-room.palette.js, for two reasons: visual continuity
// between the two Institute interiors, and so Vite bundles no extra tileset image (the glob
// call sites in main.js target the same three file paths).
//
// This map is a scripted cutscene — runHallwayWalk() in main.js drives the sprite directly, so
// there is no collision or interaction data here, only art.

import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "hallway",
  period: null, // present-day hub
  status: "live",
  map: "apps/web/src/content/maps/hallway.tmj",

  // tile-B-01 carries no tile this map draws, but it stays in the list: removing it would
  // shift tile-B-03's and tile-B-05's firstgid and rewrite every GID in the committed .tmj for
  // no benefit. It also keeps the sheet order byte-identical to archive-room's.
  sheets: [
    { path: "Medieval Tavern/tile-B-01.png", name: "medieval-tavern-b01" },
    { path: "Medieval Tavern/tile-B-03.png", name: "medieval-tavern-b03" },
    { path: "Medieval Tavern/tile-B-05.png", name: "medieval-tavern-b05" },
  ],

  tiles: {
    stoneFloor: [
      CANONICAL["floor.archive.stone"],
      CANONICAL["floor.archive.stone.b"],
      CANONICAL["floor.archive.stone.c"],
      CANONICAL["floor.archive.stone.d"],
    ],
    /** Left-wall shelving, top-left of a 1-wide x 2-tall stamp. */
    recordShelfLeft: tile("Medieval Tavern/tile-B-03.png", 2, 8),
    /** Right-wall rack, top-left of a 1-wide x 2-tall stamp. */
    recordRackRight: tile("Medieval Tavern/tile-B-03.png", 2, 10),
    wallTorch: tile("Medieval Tavern/tile-B-03.png", 1, 9),

    // Cabinet fronts, 2 cols x 2 rows, same entries the Archive Room uses. Laid down both walls
    // of the corridor so the walk into the Institute reads as passing through stacks rather than
    // down a bare stone passage. [labeled]
    cabinetA: tile("Medieval Tavern/tile-B-03.png", 12, 0),
    cabinetB: tile("Medieval Tavern/tile-B-03.png", 12, 2),
    cabinetC: tile("Medieval Tavern/tile-B-03.png", 12, 4),
    cabinetD: tile("Medieval Tavern/tile-B-03.png", 12, 6),
    /** Institute banners, 2 rows x 2 cols. [labeled] */
    bannerPair: tile("Medieval Tavern/tile-B-03.png", 0, 12),
  },
};
