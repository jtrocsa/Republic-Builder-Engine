// Palette for riverbend-field.tmj (Unit 2 / case-004, "Riverbend Settlement").
// Setting: a New England river settlement, ~1620s. Consumed by scripts/generate-riverbend-tmj.js.
//
// Phase 53 rewrote this file around three rules that the previous revision broke, each of which
// was visible in play:
//
//   1. Terrain is declared as its authored block, not as a tile. `farm/6` draws ground in 96x96
//      (2x2) blocks whose quadrants only read as continuous texture in their authored
//      arrangement; the generator tiles the block by parity. Four grass cells picked at random
//      is a quilt, not a lawn.
//   2. Anything stamped above the ground has to be a cut-out. The crop rows used to go on
//      `structures` over tilled soil; they are full-bleed plots with their own soil painted in,
//      so they belong on the ground. The pier decking and the moored rowboats are the same case —
//      the pack paints its own water into them.
//   3. Buildings and trees come from the derived, tile-aligned sheets. `farm/7` packs its
//      clapboard housing tightly enough that the old `houseCream` rect caught three neighbours
//      and `houseBlue` pointed at empty background — it drew nothing at all on the shipped map.
//
// Coordinates are [labeled] — read off `npm run assets:label` grid renders of each sheet.

import { FarmBuildings, FarmTrees } from "../derived-objects.coords.js";
import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "riverbend-field",
  period: 2,
  status: "live",
  map: "apps/web/src/content/maps/riverbend-field.tmj",
  // Which of `tiles` this map's roads are painted in. Read by the generator's RoadNetwork and by
  // tests/unit/map-path-network.test.js, so "what is a road here" is stated once.
  //
  // Packed earth, not `shoreSand`. Phase 55 generated the track network but painted it in the tile
  // this map already had to hand, which was the fishing pack's wet-sand *shore strip* — so every
  // track through the settlement read as a ribbon of riverbank laid across the commons. `shoreSand`
  // keeps its real job below, painting the first land cell east of the water.
  road: "dirt",

  // Ordered — firstgid is assigned in this order and must not be reshuffled.
  sheets: [
    { path: "Medieval Fishing Village/tile-B-04.png", name: "medieval-fishing-village-b04" },
    { path: "farm/6.png", name: "farm-6" },
    { path: "derived/farm-trees.png", name: "derived-farm-trees" },
    { path: "derived/farm-buildings.png", name: "derived-farm-buildings" },
    // Ground only, and only one block of it: the packed earth the roads are painted in. `farm/6`'s
    // own bare-soil block is 9-18% see-through (the pack draws it as clods over another surface — see
    // `soil` below) and its ploughed furrows read as a *field*, not a road. Nothing else from this
    // pack is drawn here.
    { path: "Medieval Fantasy Town/2.png", name: "medieval-fantasy-town-2" },
  ],

  tiles: {
    // --- ground: authored terrain blocks -------------------------------------------------------
    /** The settlement's lawn and commons. */
    grass: tile("farm/6.png", 6, 0, { h: 2, w: 2 }),
    // Ploughed furrows, and the only fully-opaque worked soil on the sheet. The bare-soil block
    // at (8,2) looks like the obvious choice and is not: it is 9-18% see-through, because the
    // pack draws it as clods sitting on top of this. Everything in `farm/6`'s planted rows is
    // built the same way, which is why the crop plots go above the ground rather than on it.
    // One tile, not a block: this row's next column over is dry straw, so a 2-wide block lays
    // alternating brown and tan bands through every field. Repeating furrows is what ploughed
    // ground looks like anyway.
    soil: tile("farm/6.png", 7, 2),
    /** Packed earth — every road and door spur in the settlement. See `road` above. */
    dirt: { ...CANONICAL["path.packed.earth"], h: 2, w: 2 },

    // Crop plots. Full-bleed soil-and-planting blocks, so they are ground, not props. The old map
    // laid them on `structures` over a separate soil tile and the transparent gaps between plants
    // showed the page background through as hard black holes in every field.
    plotCabbage: tile("farm/6.png", 6, 8, { h: 2, w: 2 }),
    plotCarrot: tile("farm/6.png", 6, 10, { h: 2, w: 2 }),
    plotPotato: tile("farm/6.png", 6, 12, { h: 2, w: 2 }),
    plotWheat: tile("farm/6.png", 6, 14, { h: 2, w: 2 }),
    plotRoot: tile("farm/6.png", 8, 4, { h: 2, w: 2 }),
    plotMaize: tile("farm/6.png", 8, 6, { h: 2, w: 2 }),
    plotPumpkin: tile("farm/6.png", 8, 10, { h: 2, w: 2 }),

    // River and shore. These are horizontal strips eight tiles long, not 2x2 blocks — the pack
    // draws one continuous seascape across the row and it has to be tiled that way or the wave
    // lines break every tile. `surf` is the sand-meets-water band and must sit exactly one row
    // inside the land mask's boundary or the coastline reads as a step.
    water: tile("Medieval Fishing Village/tile-B-04.png", 15, 0, { h: 1, w: 8 }),
    surf: tile("Medieval Fishing Village/tile-B-04.png", 14, 0, { h: 1, w: 8 }),
    shoreSand: tile("Medieval Fishing Village/tile-B-04.png", 13, 0, { h: 1, w: 8 }),
    shoreCobble: tile("Medieval Fishing Village/tile-B-04.png", 12, 0, { h: 1, w: 8 }),

    // Waterfront floor pieces — drawn onto the ground layer, over water. Every one of these has
    // the pack's own river painted into it edge to edge.
    /** East-west decking with pilings on the row below. */
    pierDeck: tile("Medieval Fishing Village/tile-B-04.png", 8, 4, { h: 2, w: 4 }),
    /** North-south walkway. Not interchangeable with the deck: stacking the deck tile downward
     *  renders as a heap of loose planks rather than a walkway. */
    pierWalk: tile("Medieval Fishing Village/tile-B-04.png", 8, 2, { h: 4, w: 2 }),
    rowboatWhite: tile("Medieval Fishing Village/tile-B-04.png", 10, 0, { h: 1, w: 2 }),
    rowboatRed: tile("Medieval Fishing Village/tile-B-04.png", 11, 0, { h: 1, w: 2 }),
    /** The settlement's shallop, moored off the wharf. */
    fishingBoat: tile("Medieval Fishing Village/tile-B-04.png", 10, 4, { h: 2, w: 3 }),

    // --- structures: cut-out objects, footprints measured from the pixels ----------------------
    // Dwellings and the meetinghouse, repacked onto the tile grid — see
    // apps/web/src/content/tilesets/derived-objects.manifest.js for provenance.
    houseRed: FarmBuildings.houseRed,
    houseYellow: FarmBuildings.houseYellow,
    houseBlue: FarmBuildings.houseBlue,
    houseBrown: FarmBuildings.houseBrown,
    houseCream: FarmBuildings.houseCream,
    meetinghouse: FarmBuildings.meetinghouse,
    barn: FarmBuildings.barn,

    /** Stone well with a shingled roof. */
    well: tile("farm/6.png", 14, 0, { h: 2, w: 2 }),
    /** Timber storage shed. */
    shed: tile("farm/6.png", 14, 2, { h: 2, w: 2 }),
    /** Cold frame for seedlings. */
    coldFrame: tile("farm/6.png", 14, 4, { h: 2, w: 2 }),
    /** Hen house. */
    coop: tile("farm/6.png", 14, 11, { h: 2, w: 2 }),

    // Fencing — two tiles per section, laid in runs. Split-rail reads correctly for a 17th-century
    // field boundary; the same sheet's chain-link (11,6-7) and its tractor row (15,13-15) are
    // modern and must never appear on this map.
    fenceRail: tile("farm/6.png", 10, 0, { h: 1, w: 2 }),
    fenceRailAlt: tile("farm/6.png", 10, 2, { h: 1, w: 2 }),
    fenceGate: tile("farm/6.png", 10, 6, { h: 1, w: 2 }),

    // Trees, repacked. The tree line and the settlement's three shade trees both draw from here.
    treeOak: FarmTrees.treeOak,
    treeMaple: FarmTrees.treeMaple,
    treePine: FarmTrees.treePine,
    treeBirch: FarmTrees.treeBirch,
    treeApple: FarmTrees.treeApple,
    treeCherry: FarmTrees.treeCherry,
    saplingApple: FarmTrees.saplingApple,
    saplingBlossom: FarmTrees.saplingBlossom,
    bushRose: FarmTrees.bushRose,
    bushBerry: FarmTrees.bushBerry,
    bushFlowering: FarmTrees.bushFlowering,

    /** Market stalls on the wharf — cloth awnings, not shopfronts. */
    marketStall: tile("Medieval Fishing Village/tile-B-04.png", 8, 10, { h: 2, w: 2 }),
    fishStall: tile("Medieval Fishing Village/tile-B-04.png", 8, 8, { h: 2, w: 2 }),

    // Dockside and farmyard clutter, one tile each.
    crate: tile("Medieval Fishing Village/tile-B-04.png", 9, 13),
    barrel: tile("Medieval Fishing Village/tile-B-04.png", 9, 14),
    barrelAlt: tile("Medieval Fishing Village/tile-B-04.png", 9, 15),
    netPile: tile("Medieval Fishing Village/tile-B-04.png", 9, 12),
    ropeCoil: tile("Medieval Fishing Village/tile-B-04.png", 6, 13),
    lobsterPots: tile("Medieval Fishing Village/tile-B-04.png", 6, 12),
    anchorProp: tile("Medieval Fishing Village/tile-B-04.png", 6, 10),
    shoreRocks: tile("Medieval Fishing Village/tile-B-04.png", 6, 9),
    buoy: tile("Medieval Fishing Village/tile-B-04.png", 8, 12),
    produceCrate: tile("farm/6.png", 10, 14),
    grainSack: tile("farm/6.png", 10, 13),
    hayBale: tile("farm/6.png", 13, 13),
  },
};
