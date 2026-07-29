// Palette for common-cause-field.tmj (Unit 3 / case-007, "The Common Cause").
// Setting: Philadelphia, 1770s. Consumed by scripts/generate-common-cause-tmj.js.
//
// Decision log 0032 recorded a hard constraint: no pack contains Georgian/Federal American civic
// architecture, so this map composited its buildings out of Medieval Fantasy Town's unlabelled
// silhouettes. Phase 53 retires that compromise. Those silhouettes were not merely a stylistic
// mismatch — they were unusable:
//
//   * `printShop` and `familyResidence` pointed into Medieval Fantasy Town/1, whose houses are
//     painted as one continuous mass with no transparent gutter between them. The declared 4x4
//     rects each cut a window out of the middle of that mass, so the map drew half a thatched
//     roof with a neighbour's wall sliced off at the tile edge.
//   * `assemblyHall` and `statehouseSteps` are full-bleed terrain — stone-wall and paving tiles,
//     opaque to their borders. Stamped above the ground they laid a hard grey square over the
//     square rather than standing on it.
//   * `marketStalls` pointed at cobblestone, not stalls, and was stamped 2 rows x 4 cols across
//     two different awnings.
//
// What replaces them is `farm/7`'s painted clapboard, repacked onto the tile grid (see
// apps/web/src/content/tilesets/derived-objects.manifest.js). A two-storey sash-windowed
// clapboard with a portico and dormers is a defensible 1770s statehouse; a half-timbered guild
// hall never was. The two churches are the one thing still drawn from Medieval Fantasy Town, and
// they too are repacked. Its signed buildings ("Adventurer's Guild", "The Sword & Shield") remain
// permanently off-limits — a readable fantasy tavern sign baked into pixel art is a worse
// anachronism than any silhouette.
//
// The liberty pole is the one element with no equivalent in any purchased pack, and the only
// PixelLab-generated asset in the repo.

import { FarmBuildings, FarmTrees, TownCivic } from "../derived-objects.coords.js";
import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "common-cause-field",
  period: 3,
  status: "live",
  map: "apps/web/src/content/maps/common-cause-field.tmj",

  // Ordered — reshuffling changes every GID in the committed .tmj.
  sheets: [
    { path: "Medieval Fantasy Town/2.png", name: "medieval-fantasy-town-2" },
    { path: "Medieval Fishing Village/tile-B-04.png", name: "medieval-fishing-village-b04" },
    {
      path: "Common Cause Philadelphia/liberty-pole.png",
      name: "common-cause-philadelphia-liberty-pole",
    },
    { path: "farm/6.png", name: "farm-6" },
    // Ships only — the library's only period square-rigged hulls. Its water is never used here.
    { path: "Medieval harbor/tile-B-04.png", name: "medieval-harbor-b04" },
    { path: "derived/farm-trees.png", name: "derived-farm-trees" },
    { path: "derived/farm-buildings.png", name: "derived-farm-buildings" },
    { path: "derived/town-civic.png", name: "derived-town-civic" },
  ],

  tiles: {
    // --- ground: authored terrain blocks -------------------------------------------------------
    /** The paved civic square and the streets running out of it. */
    cobble: { ...CANONICAL["stone.colonial.cobble"], h: 2, w: 2 },
    /** Grass everywhere else inside the town bounds, and across the framing margin. */
    grass: { ...CANONICAL["grass.colonial.plaza"], h: 2, w: 2 },
    /** Packed earth, for the lane down to the wharf. */
    dirt: tile("Medieval Fantasy Town/2.png", 0, 4, { h: 2, w: 2 }),

    // The Delaware. Horizontal strips eight tiles long — the pack draws one continuous seascape
    // across the row, so tiling it any other way breaks the wave lines every tile.
    water: tile("Medieval Fishing Village/tile-B-04.png", 15, 0, { h: 1, w: 8 }),
    surf: tile("Medieval Fishing Village/tile-B-04.png", 14, 0, { h: 1, w: 8 }),
    // The quay is paved with the square's own cobble. The fishing-village sheet's shoreline row
    // looks like the obvious choice and is not: it is a one-row rock-and-sand transition, so
    // repeating it down three rows of river frontage lays alternating bands of boulder, sand and
    // stray water across the whole bank.

    // Waterfront floor pieces, drawn onto the ground layer over water — each has the pack's own
    // river painted into it edge to edge, so above the ground they lay a hard square of slightly
    // different blue over the Delaware.
    /** North-south pier walkway. Not interchangeable with the sheet's east-west decking. */
    pierVertical: tile("Medieval Fishing Village/tile-B-04.png", 8, 2, { h: 4, w: 2 }),
    /** East-west decking with pilings on the row below — the town wharf. */
    wharfDeck: tile("Medieval Fishing Village/tile-B-04.png", 8, 4, { h: 2, w: 4 }),
    rowboat: tile("Medieval Fishing Village/tile-B-04.png", 10, 0, { h: 1, w: 2 }),

    // --- civic buildings, repacked onto the tile grid -------------------------------------------
    /** The assembly hall — clapboard, two storeys, dormers and a stepped portico. */
    assemblyHall: FarmBuildings.meetinghouse,
    /** The statehouse across the square from it. */
    statehouse: FarmBuildings.statehouse,
    /** The print shop where the Dickinson broadside is set. */
    printShop: FarmBuildings.townhouseGrey,
    /** Christ Church — the library's only steepled church. */
    chapel: TownCivic.churchSteeple,
    /** A second, smaller church for the far side of town. */
    chapelSmall: TownCivic.chapel,
    /** Riverside warehouse. */
    warehouse: FarmBuildings.warehouse,
    /** Merchant's townhouse on the north side. */
    townhouse: FarmBuildings.houseCream,
    /** Frontier dispatch post, west of the square — where news from the Ohio country arrives. */
    dispatchPost: FarmBuildings.houseBrown,

    // --- townscape: clapboard housing ----------------------------------------------------------
    houseRed: FarmBuildings.houseRed,
    houseYellow: FarmBuildings.houseYellow,
    houseBlue: FarmBuildings.houseBlue,
    houseBrown: FarmBuildings.houseBrown,
    houseCream: FarmBuildings.houseCream,

    // --- the square ----------------------------------------------------------------------------
    /** 3 rows x 1 col. The one generated asset in the repo. */
    libertyPole: tile("Common Cause Philadelphia/liberty-pole.png", 0, 0, { h: 3, w: 1 }),
    /** Brick-coped town well. */
    townWell: tile("Medieval Fantasy Town/2.png", 6, 8, { h: 2, w: 2 }),
    /** Public fountain at the square's south end. */
    fountain: tile("Medieval Fantasy Town/2.png", 10, 10, { h: 2, w: 2 }),
    /** Public notice board — where the broadsides go up. */
    noticeBoard: tile("Medieval Fantasy Town/2.png", 6, 14, { h: 2, w: 2 }),
    bench: tile("Medieval Fantasy Town/2.png", 11, 12, { h: 1, w: 2 }),
    signpost: tile("Medieval Fantasy Town/2.png", 8, 14, { h: 2, w: 1 }),

    // Market stalls — each is one 2x2 canopy-and-counter, not a slice of the sheet's stall row.
    stallButcher: tile("Medieval Fantasy Town/2.png", 4, 0, { h: 2, w: 2 }),
    stallBaker: tile("Medieval Fantasy Town/2.png", 4, 4, { h: 2, w: 2 }),
    stallProduce: tile("Medieval Fantasy Town/2.png", 4, 8, { h: 2, w: 2 }),
    stallGreengrocer: tile("Medieval Fantasy Town/2.png", 6, 4, { h: 2, w: 2 }),
    stallDryGoods: tile("Medieval Fantasy Town/2.png", 6, 6, { h: 2, w: 2 }),
    /** Awninged booth from the fishing-village sheet — cloth canopy, reads as a market stall. */
    awningStall: tile("Medieval Fishing Village/tile-B-04.png", 8, 10, { h: 2, w: 2 }),
    fishStall: tile("Medieval Fishing Village/tile-B-04.png", 8, 8, { h: 2, w: 2 }),

    // --- moored shipping -----------------------------------------------------------------------
    shipMerchant: tile("Medieval harbor/tile-B-04.png", 0, 12, { h: 2, w: 4 }),
    shipSloop: tile("Medieval harbor/tile-B-04.png", 2, 4, { h: 2, w: 2 }),
    shipBarge: tile("Medieval harbor/tile-B-04.png", 1, 8, { h: 1, w: 4 }),
    shipsBoat: tile("Medieval harbor/tile-B-04.png", 4, 2, { h: 2, w: 2 }),

    // --- churchyard, market and street furniture -----------------------------------------------
    // Split-rail fencing, two tiles per section.
    fenceRail: tile("farm/6.png", 10, 0, { h: 1, w: 2 }),
    fenceRailAlt: tile("farm/6.png", 10, 2, { h: 1, w: 2 }),
    fenceGate: tile("farm/6.png", 10, 6, { h: 1, w: 2 }),

    treeOak: FarmTrees.treeOak,
    treeMaple: FarmTrees.treeMaple,
    treeBirch: FarmTrees.treeBirch,
    treeCherry: FarmTrees.treeCherry,
    bushRose: FarmTrees.bushRose,
    bushFlowering: FarmTrees.bushFlowering,

    // Quayside cargo — the Triangle-Trade goods this case is about.
    crate: tile("Medieval Fishing Village/tile-B-04.png", 9, 13),
    barrel: tile("Medieval Fishing Village/tile-B-04.png", 9, 14),
    barrelAlt: tile("Medieval Fishing Village/tile-B-04.png", 9, 15),
    ropeCoil: tile("Medieval Fishing Village/tile-B-04.png", 6, 13),
    netPile: tile("Medieval Fishing Village/tile-B-04.png", 9, 12),
    anchorProp: tile("Medieval Fishing Village/tile-B-04.png", 6, 10),
    produceCrate: tile("farm/6.png", 10, 14),
    grainSack: tile("farm/6.png", 10, 13),
    hayBale: tile("farm/6.png", 13, 13),
  },
};
