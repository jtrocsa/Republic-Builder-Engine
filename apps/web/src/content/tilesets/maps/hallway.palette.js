// Palette for hallway.tmj — the Chronicle Institute's Entrance Hall, the room the player walks
// into before the Main Hall. Consumed by scripts/generate-hallway-tmj.js.
//
// Until Phase 62 this map was a 6x10 strip of bare stone floor with no walls, because the corridor
// was a five-second scripted cutscene: two sprites lerped up a fixed track while the art scaled, and
// the "walls" were two CSS gradient bands in .hallway-viewport. It is a real, walkable hub room now —
// the player's first moment of control — so it needs the same things the other two Institute
// interiors have: walls, collision, walk-behind depth, and furniture at a human scale. See
// docs/decision-log/0046-institute-entrance-hall-and-escort-walk.md.
//
// Sheet family and tile entries are taken from institute-hall.palette.js deliberately, and mostly
// verbatim: this room's north doors open directly into the Main Hall, so the two have to read as one
// building. Decision log 0030 records why a medieval-tavern pack dresses a present-day archive.
//
// Two sheets beyond the original three:
//
//   Auto-tile-A4-walls-2  full-bleed wall surfaces. Only the flat surface rows are used; the A4
//                         corner/edge blob set is deliberately untouched, for the reason recorded in
//                         institute-hall.palette.js — a full-bleed material paves any wall run
//                         correctly without it.
//   institute-furnishings the seating, generated for this game rather than borrowed.
//
// Not added, deliberately: `Island survival/5` and `derived/institute-artifacts`. Those carry the
// Navigation Table, the brass compass and the Preservation Case plinth — the objects that make the
// Main Hall the Main Hall. An entrance hall that also held them would blunt the handoff.
//
// Every footprint below is measured, not declared, and tests/unit/tile-footprints.test.js fails the
// build if one drifts from the pixels.

import { CANONICAL, tile } from "../canonical-palette.js";
import { InstituteFurnishings } from "../derived-objects.coords.js";

export default {
  id: "hallway",
  period: null, // present-day hub
  status: "live",
  map: "apps/web/src/content/maps/hallway.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes. The two new sheets are appended for exactly that reason. Whatever is
  // listed here must also be globbed by resolveHallwayTilesetImage() in main.js:
  // createTilesetImageResolver() throws on a sheet the .tmj names and the resolver doesn't, and the
  // map then renders as an empty frame rather than failing loudly.
  sheets: [
    { path: "Medieval Tavern/tile-B-01.png", name: "medieval-tavern-b01" },
    { path: "Medieval Tavern/tile-B-03.png", name: "medieval-tavern-b03" },
    { path: "Medieval Tavern/tile-B-05.png", name: "medieval-tavern-b05" },
    { path: "Medieval Tavern/Auto-tile-A4-walls-2.png", name: "medieval-tavern-walls-2" },
    { path: "derived/institute-furnishings.png", name: "institute-furnishings" },
  ],

  tiles: {
    // --- terrain, as whole authored 2x2 blocks -------------------------------------------------
    /** Grey flagstone — the hall's main floor. */
    floorStone: { ...CANONICAL["floor.archive.stone"], h: 2, w: 2 },
    /** Warm plank flooring — the spine the player and the Director walk, for visual zoning. */
    floorWood: { ...CANONICAL["floor.institute.wood"], h: 2, w: 2 },
    /** Tan cut stone — the threshold inside the entry doors. */
    floorSandstone: { ...CANONICAL["floor.institute.sandstone"], h: 2, w: 2 },
    /** Wood-panelled wall surface. Full-bleed, so it paves any wall run without corner tiles. */
    wallPanel: { ...CANONICAL["wall.interior.plank"], h: 2, w: 2 },
    /** Grey masonry wall, for the archway reveals either side of a doorway. */
    wallStone: { ...CANONICAL["wall.interior.stone"], h: 2, w: 2 },

    // --- doorways -------------------------------------------------------------------------------
    /** Plank door leaf, 2 rows x 1 col. Two side by side read as double doors. [measured] */
    door: tile("Medieval Tavern/tile-B-05.png", 10, 8, { h: 2 }),

    // --- record storage: the shelving runs that make the room a hall rather than a box -----------
    /** Tall carved cabinet, four fronts so a long run doesn't read as one tile repeated. [measured] */
    cabinetA: tile("Medieval Tavern/tile-B-03.png", 12, 0, { h: 2, w: 2 }),
    cabinetB: tile("Medieval Tavern/tile-B-03.png", 12, 2, { h: 2, w: 2 }),
    cabinetC: tile("Medieval Tavern/tile-B-03.png", 12, 4, { h: 2, w: 2 }),
    cabinetD: tile("Medieval Tavern/tile-B-03.png", 12, 6, { h: 2, w: 2 }),
    /** Low chest/press, waist height. [measured] */
    chestA: tile("Medieval Tavern/tile-B-03.png", 14, 0, { h: 2, w: 2 }),
    chestB: tile("Medieval Tavern/tile-B-03.png", 14, 4, { h: 2, w: 2 }),
    /** Lattice-fronted rack — reads as archive pigeonholes. [measured] */
    pigeonholeUpper: tile("Medieval Tavern/tile-B-03.png", 2, 10, { h: 2, w: 2 }),
    pigeonholeLower: tile("Medieval Tavern/tile-B-03.png", 4, 10, { h: 2, w: 2 }),
    /** Open shelving stacked with sealed record bottles. [measured] */
    recordShelf: tile("Medieval Tavern/tile-B-03.png", 2, 8, { h: 2, w: 2 }),
    recordShelfAlt: tile("Medieval Tavern/tile-B-03.png", 4, 8, { h: 2, w: 2 }),
    /** Shorter wall shelves of jars, pots and flasks — preserved-sample storage. [measured] */
    sampleShelfA: tile("Medieval Tavern/tile-B-05.png", 8, 0, { h: 2, w: 2 }),
    sampleShelfB: tile("Medieval Tavern/tile-B-05.png", 8, 2, { h: 2, w: 2 }),
    sampleShelfC: tile("Medieval Tavern/tile-B-05.png", 8, 4, { h: 2, w: 2 }),

    // --- working furniture ----------------------------------------------------------------------
    /** Long plain table, 2 rows x 4 cols — the intake bench records are logged at. [measured] */
    readingTable: tile("Medieval Tavern/tile-B-05.png", 10, 4, { h: 2, w: 4 }),
    /** Long dark table, 2 rows x 4 cols. [measured] */
    intakeTable: tile("Medieval Tavern/tile-B-01.png", 4, 8, { h: 2, w: 4 }),
    /** Seating, generated for this game rather than borrowed — see derived-objects.manifest.js.
     *  The pack's own stool is painted 45px tall, exactly a character's standing body; these are
     *  19px and 13px, which is what a stool and a bench are next to a person. [derived] */
    lowBench: { ...InstituteFurnishings.lowBench },
    stool: { ...InstituteFurnishings.stool },
    stoolAlt: { ...InstituteFurnishings.stoolAlt },

    // --- dressing -------------------------------------------------------------------------------
    // Institute colours: the gold and navy pennants, not the heraldic lion/crown pair.
    /** Gold pennant. [measured] */
    bannerGold: tile("Medieval Tavern/tile-B-03.png", 0, 10, { h: 2 }),
    /** Navy pennant. [measured] */
    bannerNavy: tile("Medieval Tavern/tile-B-03.png", 0, 11, { h: 2 }),
    /** Lit wall torch, 1x1 — cleaner than tile-B-03's sconce, which is 2 rows at (0,9). [measured] */
    wallTorch: tile("Medieval Tavern/tile-B-05.png", 8, 12),
    /** Wall bracket with candles. [measured] */
    wallSconce: tile("Medieval Tavern/tile-B-05.png", 10, 12),
    /** Tall potted greenery — stamped `base`, so the player walks behind the foliage. [measured] */
    plantTall: tile("Medieval Tavern/tile-B-03.png", 6, 9, { h: 2 }),
    plantPotted: tile("Medieval Tavern/tile-B-03.png", 6, 12, { h: 2 }),
    /** Woven rugs, 1 row x 2 cols. [measured] */
    rugRed: tile("Medieval Tavern/tile-B-03.png", 14, 10, { w: 2 }),
    rugBlue: tile("Medieval Tavern/tile-B-03.png", 14, 12, { w: 2 }),
    rugGreen: tile("Medieval Tavern/tile-B-03.png", 15, 8, { w: 2 }),
  },
};
