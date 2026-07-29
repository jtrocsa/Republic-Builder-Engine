// Palette for caribbean-field.tmj (Unit 1 / case-001, "The Atlantic Crossroads").
// Setting: a Caribbean island, 1492. Consumed by scripts/generate-caribbean-tmj.js.
//
// Every footprint here is measured, not declared: `npm run assets:measure -- "<sheet>" <row> <col>`
// reports what the pixels actually occupy, and tests/unit/map-tile-integrity.test.js fails the
// build if a stamped object's art runs past the cells the map gave it.
//
// Phase 53 rewrote the terrain half of this file. The sheet authors ground as 96x96 blocks — four
// quadrants that only read as continuous texture in their authored arrangement — and the previous
// revision took single quadrants out of those blocks and used them as scattered accents. That is
// what put hard tan squares of *sand* in the middle of green grass ("grass.tropical.tuft" is a
// sand tile), sliced driftwood logs in half, and dropped a quarter of a coral cluster into open
// water as a visibly different square of blue. Terrain is now always a whole block, tiled by
// parity, and every piece of scatter is a transparent prop on the structures layer instead.

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
    // --- terrain, as whole authored 2x2 blocks -------------------------------------------------
    // The canonical entries name each block's top-left quadrant; the `{ h: 2, w: 2 }` footprint is
    // what tells MapBuilder.groundBlock() to tile all four in their authored arrangement.
    sand: { ...CANONICAL["sand.tropical"], h: 2, w: 2 },
    grass: { ...CANONICAL["grass.tropical"], h: 2, w: 2 },
    waterShallow: { ...CANONICAL["water.tropical.shallow"], h: 2, w: 2 },
    waterDeep: { ...CANONICAL["water.tropical.deep"], h: 2, w: 2 },
    pathLeft: CANONICAL["path.tropical.left"],
    pathRight: CANONICAL["path.tropical.right"],

    // --- decor props: transparent, stamped on structures, never on the ground layer ------------
    // These replace the terrain quadrants the previous revision used as accents. Each one is a
    // cut-out object with alpha around it, so it sits *on* the sand or grass rather than replacing
    // a patch of it with a different material.
    /** Driftwood log pair, washed up on the beach. */
    driftwood: tile("Island survival/tile-B-01.png", 13, 4, { w: 2 }),
    /** Conch shell. */
    shellConch: tile("Island survival/tile-B-01.png", 13, 10),
    /** Scallop shell. */
    shellScallop: tile("Island survival/tile-B-01.png", 13, 11),
    /** Branching coral head, for the shallow reef band. Transparent, so the turquoise reads through. */
    coralBranch: tile("Island survival/tile-B-01.png", 12, 9),
    /** Soft coral / anemone. */
    coralSoft: tile("Island survival/tile-B-01.png", 13, 8),
    /** Red sea fan. */
    coralFan: tile("Island survival/tile-B-01.png", 13, 9),
    /** Floating seaweed frond. */
    seaweed: tile("Island survival/tile-B-01.png", 12, 12),
    /** Boulder pile, 2x2 — the island's one piece of large natural cover. */
    boulderPile: tile("Island survival/tile-B-01.png", 14, 4, { h: 2, w: 2 }),

    // Small transparent scatter, 1x1. Purely visual — `decor` solidity, so the player walks over
    // them and no collision rect is generated. This is the replacement for the sand-based
    // "tall grass tuft" ground tile that used to be scattered across the island's grass.
    scatterBoulder: tile("Island survival/tile-B-01.png", 12, 6),
    scatterRock: tile("Island survival/tile-B-01.png", 13, 6),
    scatterPebble: tile("Island survival/tile-B-01.png", 14, 6),
    scatterFern: tile("Island survival/tile-B-01.png", 12, 7),
    scatterBush: tile("Island survival/tile-B-01.png", 13, 7),
    scatterShrub: tile("Island survival/tile-B-01.png", 14, 7),
    scatterGrass: tile("Island survival/tile-B-01.png", 15, 6),
    scatterPlant: tile("Island survival/tile-B-01.png", 12, 8),

    // --- single-cell props ---------------------------------------------------------------------
    campfire: tile("Island survival/tile-B-01.png", 13, 12),
    /** Dugout canoe. Two cells wide — drawn 1x1 until Phase 53, which cut off its stern. */
    canoe: tile("Island survival/tile-B-01.png", 13, 13, { w: 2 }),
    crateA: tile("Island survival/tile-B-01.png", 15, 13),
    crateB: tile("Island survival/tile-B-01.png", 15, 14),
    tent: tile("Island survival/tile-B-01.png", 14, 11),
    /**
     * Barrel and lidded crate for the Spanish landing stores. These come from tile-B-01's
     * transparent object band, not from `5.png` — `5.png`'s barrels are two tiles tall and were
     * stamped as one, which is why the shipped map showed a barrel sliced off at the waist.
     */
    barrel: tile("Island survival/tile-B-01.png", 15, 11),
    barrelAlt: tile("Island survival/tile-B-01.png", 15, 12),
    seaCrate: tile("Island survival/tile-B-01.png", 15, 13),

    // Palms — crown over trunk. The trunk row carries the collision rect; the crown is lifted to
    // the overlay layer by `base` solidity, so the player walks behind it.
    palmA: tile("Island survival/tile-B-01.png", 12, 0, { h: 2 }),
    palmB: tile("Island survival/tile-B-01.png", 12, 1, { h: 2 }),
    palmC: tile("Island survival/tile-B-01.png", 12, 2, { h: 2 }),
    palmD: tile("Island survival/tile-B-01.png", 14, 0, { h: 2 }),

    // --- structures ----------------------------------------------------------------------------
    // Bohío huts — roof row over walled base, 2x2. [labeled]
    hutOpenDoor: tile("Island survival/tile-B-02.png", 0, 0, { h: 2, w: 2 }),
    hutClosedDoorRound: tile("Island survival/tile-B-02.png", 2, 12, { h: 2, w: 2 }),
    hutClosedDoorSquare: tile("Island survival/tile-B-02.png", 0, 2, { h: 2, w: 2 }),
    /** Fourth bohío, door plus side window. [labeled] */
    hutDoorWindow: tile("Island survival/tile-B-02.png", 2, 0, { h: 2, w: 2 }),
    /** Larger conical thatched house — reads as the village's principal dwelling. [labeled] */
    hutLarge: tile("Island survival/tile-B-02.png", 4, 0, { h: 2, w: 2 }),
    /** Open-sided thatched work canopy on posts, no walls. [labeled] */
    workCanopy: tile("Island survival/tile-B-02.png", 4, 4, { h: 2, w: 2 }),
    /** Timber drying/storage rack. [labeled] */
    dryingRack: tile("Island survival/tile-B-02.png", 10, 2, { h: 2, w: 2 }),

    // Conuco garden — a leafy planted row with bamboo posts baked in, 2 tall. The sheet runs this
    // art continuously across cols 2-13, so it tiles horizontally: the map places the neighbouring
    // cell, which is what keeps it from reading as a cut-off hedge.
    gardenRow: tile("Island survival/tile-B-02.png", 14, 4, { h: 2 }),

    // There is deliberately no "jungle canopy" entry any more. The old one was a *full-bleed*
    // ground tile stamped onto the overlay layer, so walking into the grove hid the player
    // completely behind an opaque green square rather than reading as tree cover. Walk-behind now
    // comes from palms stamped with `base` solidity, whose crowns are transparent art.

    // Cartographer's chart table — a world map on wooden rollers, the Waldseemüller puzzle's
    // physical anchor. [labeled]
    chartTable: tile("Island survival/5.png", 8, 0, { h: 2, w: 3 }),
    /** Ship's anchor, beached. [labeled] */
    anchor: tile("Island survival/5.png", 6, 2, { h: 2, w: 2 }),

    // The Spanish flotilla, anchored offshore. Three-masted square-rigged hulls, period-correct
    // for 1492. [labeled]
    /** Flagship. Four cells wide — declared 3 until Phase 53, which cut off its bowsprit. */
    shipFlagship: tile("Medieval harbor/tile-B-04.png", 0, 12, { h: 2, w: 4 }),
    /** Caravel. */
    shipCaravelA: tile("Medieval harbor/tile-B-04.png", 0, 4, { h: 2, w: 2 }),
    /** Second caravel, different livery. */
    shipCaravelB: tile("Medieval harbor/tile-B-04.png", 2, 4, { h: 2, w: 2 }),
    /** Ship's boat drawn up on the sand. */
    shipsBoat: tile("Medieval harbor/tile-B-04.png", 4, 2, { h: 2 }),
  },
};
