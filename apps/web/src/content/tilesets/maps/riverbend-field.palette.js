// Palette for riverbend-field.tmj (Unit 2 / case-004, "Riverbend Settlement").
// Setting: a New England river settlement, ~1620s. Consumed by scripts/generate-riverbend-tmj.js.
//
// This map used to be the odd one out: hand-built in the Tiled desktop app as the original .tmj
// proof of concept, with no generator, so this palette could only describe what the committed
// file happened to draw. It now has a generator like every other live map, and this palette is
// generative again.
//
// The rebuild also fixed two visible defects in the hand-authored version: transparent crop
// tiles were stamped over cells with no ground tile underneath, so the field showed hard black
// gaps; and pier decking from tile-B-04's rows 8-11 was tiled across the whole river, which is
// why the water read as a floor of loose planks.
//
// Coordinates are [labeled] — read off `npm run assets:label` grid renders of each sheet.

import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "riverbend-field",
  period: 2,
  status: "live",
  map: "apps/web/src/content/maps/riverbend-field.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled.
  sheets: [
    { path: "Medieval Fishing Village/tile-B-04.png", name: "medieval-fishing-village-b04" },
    { path: "Medieval Fantasy Town/1.png", name: "medieval-fantasy-town-1" },
    // farm/6 (ground textures, crops, trees, fencing, well) and farm/7 (clapboard houses and
    // barns) replace farm/3. They are the best American vernacular in the library and the whole
    // reason this map no longer has to borrow generic fantasy-town silhouettes for its housing.
    { path: "farm/6.png", name: "farm-6" },
    { path: "farm/7.png", name: "farm-7" },
  ],

  tiles: {
    // --- ground ---
    // Grass comes from farm/6 rather than CANONICAL grass.colonial (Medieval Fantasy Town/1):
    // farm/6 ships a 2x2 variation block, so a large field of it doesn't show the one-tile
    // repeat that was plainly visible across the old map.
    grass: tile("farm/6.png", 6, 0),
    grassB: tile("farm/6.png", 6, 1),
    grassC: tile("farm/6.png", 7, 0),
    grassD: tile("farm/6.png", 7, 1),
    dirt: CANONICAL["path.colonial.dirt"],
    dirtAlt: CANONICAL["path.colonial.dirt.alt"],
    /** Tilled soil, full-bleed. */
    tilled: tile("farm/6.png", 6, 2),
    tilledAlt: tile("farm/6.png", 7, 3),
    /** Planted rows, full-bleed — maize and cabbage plots. */
    cropCorn: tile("farm/6.png", 8, 6),
    cropCornAlt: tile("farm/6.png", 9, 7),
    cropCabbage: tile("farm/6.png", 6, 8),
    cropRoot: tile("farm/6.png", 6, 12),

    // Water and shore, all full-bleed ground tiles. `shoreEdge` is the sand-meets-water band and
    // must sit exactly one row inside the land mask's boundary or the coastline reads as a step.
    water: tile("Medieval Fishing Village/tile-B-04.png", 15, 0),
    waterAlt: tile("Medieval Fishing Village/tile-B-04.png", 15, 4),
    shoreEdge: tile("Medieval Fishing Village/tile-B-04.png", 14, 0),
    shoreSand: tile("Medieval Fishing Village/tile-B-04.png", 13, 0),
    shoreCobble: tile("Medieval Fishing Village/tile-B-04.png", 12, 0),

    // --- structures ---
    // Dwellings: 2 cols x 2 rows each, top-left anchor. Clapboard in four liveries.
    houseRed: tile("farm/7.png", 2, 2),
    houseYellow: tile("farm/7.png", 2, 4),
    houseBlue: tile("farm/7.png", 6, 6),
    houseCream: tile("farm/7.png", 6, 2),
    houseBrown: tile("farm/7.png", 4, 4),
    /** Meetinghouse — the settlement's largest building, 4 rows x 4 cols. */
    meetinghouse: tile("farm/7.png", 0, 12),
    /** Barn, 4 rows x 3 cols. */
    barn: tile("farm/7.png", 4, 8),

    /** Stone well with a shingled roof, 2x2. */
    well: tile("farm/6.png", 14, 0),
    /** Timber storage shed, 2x2. */
    shed: tile("farm/6.png", 14, 2),
    /** Scarecrow, 2 rows x 1 col. */
    scarecrow: tile("farm/6.png", 11, 4),

    // Fencing — 1x1, laid in runs. Split-rail reads correctly for a 17th-century field boundary;
    // the same sheet's chain-link (11,6-7) and its tractor/trailer row (15,13-15) are modern and
    // must never appear on this map.
    fenceRail: tile("farm/6.png", 10, 0),
    fenceRailAlt: tile("farm/6.png", 10, 1),
    fenceGate: tile("farm/6.png", 10, 6),

    // Trees — transparent-background canopies, 3 rows x xn cols, trunk on the bottom row.
    treeOak: tile("farm/6.png", 0, 0), // 3x3
    treeAutumn: tile("farm/6.png", 0, 3), // 3x3
    treePine: tile("farm/6.png", 0, 6), // 3x2
    treeBirch: tile("farm/6.png", 0, 8), // 3x2
    treeApple: tile("farm/6.png", 0, 10), // 3x2
    /** Small bushes, 1x1. */
    bushA: tile("farm/6.png", 5, 0),
    bushB: tile("farm/6.png", 5, 1),
    bushC: tile("farm/6.png", 5, 3),

    // Waterfront. The pier is decking-with-pilings meant to be laid over water; drawing it as a
    // ground fill is what broke the old map.
    pierDeck: tile("Medieval Fishing Village/tile-B-04.png", 8, 4),
    pierPost: tile("Medieval Fishing Village/tile-B-04.png", 9, 4),
    pierHead: tile("Medieval Fishing Village/tile-B-04.png", 8, 2), // 4 rows x 2 cols, runs south
    rowboatWhite: tile("Medieval Fishing Village/tile-B-04.png", 10, 0), // 1 row x 2 cols
    rowboatRed: tile("Medieval Fishing Village/tile-B-04.png", 11, 0), // 1 row x 2 cols
    /** Market stall with a cream awning, 2 rows x 2 cols. */
    marketStall: tile("Medieval Fishing Village/tile-B-04.png", 8, 10),

    // Dockside props, 1x1.
    crate: tile("Medieval Fishing Village/tile-B-04.png", 9, 13),
    barrel: tile("Medieval Fishing Village/tile-B-04.png", 9, 14),
    barrelAlt: tile("Medieval Fishing Village/tile-B-04.png", 9, 15),
    netPile: tile("Medieval Fishing Village/tile-B-04.png", 9, 12),
    ropeCoil: tile("Medieval Fishing Village/tile-B-04.png", 6, 13),
    anchorProp: tile("Medieval Fishing Village/tile-B-04.png", 6, 10),
    shoreRocks: tile("Medieval Fishing Village/tile-B-04.png", 6, 9),
    /** Produce crates and hay, for the field and market edges. */
    produceCrate: tile("farm/6.png", 10, 14),
    hayBale: tile("farm/6.png", 13, 13),
    grainSack: tile("farm/6.png", 10, 13),
  },
};
