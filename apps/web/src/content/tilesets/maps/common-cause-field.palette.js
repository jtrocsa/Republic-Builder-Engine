// Palette for common-cause-field.tmj (Unit 3 / case-007, "The Common Cause").
// Setting: Philadelphia, 1770s. Consumed by scripts/generate-common-cause-tmj.js.
//
// The binding constraint on this map, from decision log 0032: no pack contains Georgian/Federal
// American civic architecture, so every building here is composited from Medieval Fantasy
// Town's UNLABELLED silhouettes. Its signed buildings ("Adventurer's Guild", "The Sword &
// Shield") are permanently off-limits — a readable fantasy-tavern sign baked into the pixel art
// is a worse anachronism than reusing an unlabelled shape. The assembly hall in particular
// reuses a signed building's roof and archway with the sign row swapped for plain stone wall.
//
// The liberty pole is the one element with no equivalent in any purchased pack, and the only
// PixelLab-generated asset in the repo.

import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "common-cause-field",
  period: 3,
  status: "live",
  map: "apps/web/src/content/maps/common-cause-field.tmj",

  // Ordered — reshuffling changes every GID in the committed .tmj.
  sheets: [
    { path: "Medieval Fantasy Town/1.png", name: "medieval-fantasy-town-1" },
    { path: "Medieval Fantasy Town/2.png", name: "medieval-fantasy-town-2" },
    { path: "Medieval Fantasy Town/5.png", name: "medieval-fantasy-town-5" },
    { path: "Medieval Fishing Village/tile-B-04.png", name: "medieval-fishing-village-b04" },
    {
      path: "Common Cause Philadelphia/liberty-pole.png",
      name: "common-cause-philadelphia-liberty-pole",
    },
    // Clapboard houses and barns. These are far better American vernacular than Medieval Fantasy
    // Town's silhouettes and are the single biggest step this map takes toward reading as a
    // colonial port rather than a generic old-world town.
    { path: "farm/7.png", name: "farm-7" },
    // Fencing, trees, produce and hay for the market and churchyard.
    { path: "farm/6.png", name: "farm-6" },
    // Ships only — the library's only period square-rigged hulls. Its water is never used here.
    { path: "Medieval harbor/tile-B-04.png", name: "medieval-harbor-b04" },
  ],

  tiles: {
    // --- ground ---
    groundPlazaA: CANONICAL["stone.colonial.cobble"],
    /** Near-identical cobble, alternated with the above for light texture. */
    groundPlazaB: CANONICAL["stone.colonial.cobble.alt"],
    groundExterior: CANONICAL["grass.colonial.plaza"],

    // --- buildings: top-left anchors of multi-tile stamps, all unlabelled silhouettes ---
    /** 4x4. */
    printShop: tile("Medieval Fantasy Town/1.png", 0, 4),
    /** 4x4. */
    familyResidence: tile("Medieval Fantasy Town/1.png", 4, 0),
    /** 1 row x 4 cols — stairs and archway only. */
    statehouseSteps: tile("Medieval Fantasy Town/1.png", 8, 8),
    /** 4x4. Sign row deliberately replaced with plain stone wall by the generator. */
    assemblyHall: tile("Medieval Fantasy Town/5.png", 0, 8),
    /** 3 rows x 4 cols. */
    chapel: tile("Medieval Fantasy Town/5.png", 8, 4),
    /** 3 rows x 2 cols — the watchtower silhouette. */
    frontierDispatchPost: tile("Medieval Fantasy Town/5.png", 8, 12),
    /** 2 rows x 4 cols. */
    marketStalls: tile("Medieval Fantasy Town/2.png", 4, 0),
    /** 2x2. */
    townWell: tile("Medieval Fantasy Town/2.png", 6, 8),
    /** 2 rows x 4 cols. */
    wharf: tile("Medieval Fishing Village/tile-B-04.png", 8, 0),
    /** 1 col x 3 rows. The one generated asset in the repo. */
    libertyPole: tile("Common Cause Philadelphia/liberty-pole.png", 0, 0),

    // --- waterfront ---
    /** Delaware river water, full-bleed. [labeled] */
    water: tile("Medieval Fishing Village/tile-B-04.png", 15, 0),
    waterAlt: tile("Medieval Fishing Village/tile-B-04.png", 15, 4),
    /** Surf line where the water meets the quay. [labeled] */
    shoreEdge: tile("Medieval Fishing Village/tile-B-04.png", 14, 0),
    /** Stone quay paving. [labeled] */
    quayStone: tile("Medieval Fishing Village/tile-B-04.png", 12, 0),
    // The sheet carries two pier orientations and they are not interchangeable: rows 8-9 across
    // cols 0-7 are an east-west deck, while cols 2-3 down rows 8-11 are a north-south walkway.
    // A pier running out from a south-facing quay needs the vertical one — stacking the
    // horizontal deck tile downward renders as a stack of loose planks.
    /** North-south pier walkway, 4 rows x 2 cols. [labeled] */
    pierVertical: tile("Medieval Fishing Village/tile-B-04.png", 8, 2),
    /** Moored merchantman, 2 rows x 3 cols. [labeled] */
    shipMerchant: tile("Medieval harbor/tile-B-04.png", 0, 13),
    /** Smaller coastal trader, 2x2. [labeled] */
    shipSloop: tile("Medieval harbor/tile-B-04.png", 2, 4),
    /** Cargo lighter, 1 row x 4 cols. [labeled] */
    shipBarge: tile("Medieval harbor/tile-B-04.png", 1, 8),
    rowboat: tile("Medieval Fishing Village/tile-B-04.png", 10, 0), // 1 row x 2 cols

    // --- townscape: clapboard housing, 2x2 each, top-left anchor [labeled] ---
    houseRed: tile("farm/7.png", 2, 2),
    houseYellow: tile("farm/7.png", 2, 4),
    houseBlue: tile("farm/7.png", 6, 6),
    houseCream: tile("farm/7.png", 6, 2),
    houseBrown: tile("farm/7.png", 4, 4),
    /** Merchant's townhouse — 4 rows x 4 cols, the largest clapboard building on the sheet. */
    townhouse: tile("farm/7.png", 0, 12),
    /** Warehouse, 4 rows x 3 cols. */
    warehouse: tile("farm/7.png", 4, 8),

    // --- churchyard, market and street furniture ---
    fenceRail: tile("farm/6.png", 10, 0),
    fenceRailAlt: tile("farm/6.png", 10, 1),
    fenceGate: tile("farm/6.png", 10, 6),
    treeOak: tile("farm/6.png", 0, 0), // 3x3
    treeAutumn: tile("farm/6.png", 0, 3), // 3x3
    treeBirch: tile("farm/6.png", 0, 8), // 3x2
    bushA: tile("farm/6.png", 5, 0),
    bushB: tile("farm/6.png", 5, 1),
    produceCrate: tile("farm/6.png", 10, 14),
    grainSack: tile("farm/6.png", 10, 13),
    hayBale: tile("farm/6.png", 13, 13),
    crate: tile("Medieval Fishing Village/tile-B-04.png", 9, 13),
    barrel: tile("Medieval Fishing Village/tile-B-04.png", 9, 14),
    barrelAlt: tile("Medieval Fishing Village/tile-B-04.png", 9, 15),
    ropeCoil: tile("Medieval Fishing Village/tile-B-04.png", 6, 13),
    /** Awninged market stall, 2x2 — used alongside the Medieval Fantasy Town stall row. */
    awningStall: tile("Medieval Fishing Village/tile-B-04.png", 8, 10),
  },
};
