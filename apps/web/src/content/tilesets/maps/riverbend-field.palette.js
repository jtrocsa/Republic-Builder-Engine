// Palette for riverbend-field.tmj (Unit 2 / case-004, "Riverbend Settlement").
// Setting: a New England river settlement, ~1620s.
//
// Unlike the other live maps, this one has NO generator script — it was hand-built in the Tiled
// desktop app as the original .tmj proof of concept. So this palette is descriptive rather than
// generative: it records what the committed map actually draws (extracted by GID audit of the
// .tmj, not from a script's constants) so that hand-editing it later stays consistent, and so
// the palette integrity test covers it like any other map.
//
// If this map is ever rebuilt as a generated one, this file is already the input.

import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "riverbend-field",
  period: 2,
  status: "live",
  map: "apps/web/src/content/maps/riverbend-field.tmj",
  generated: false, // hand-authored in Tiled; see above

  // Order matches the committed .tmj's own tilesets[] array.
  sheets: [
    { path: "Medieval Fishing Village/tile-B-04.png", name: "medieval-fishing-village-b04" },
    { path: "Medieval Fantasy Town/1.png", name: "medieval-fantasy-town-1" },
    { path: "farm/3.png", name: "farm-3" },
  ],

  tiles: {
    // --- ground ---
    /** The dominant base fill — 784 of the ground layer's cells. */
    grass: CANONICAL["grass.colonial"],
    dirt: CANONICAL["path.colonial.dirt"],
    dirtAlt: CANONICAL["path.colonial.dirt.alt"],
    water: CANONICAL["water.harbor.temperate"],
    shoreMud: CANONICAL["shore.temperate.mud"],
    shoreSand: CANONICAL["shore.temperate.sand"],
    /** Wet shoreline edge. */
    shoreEdge: tile("Medieval Fishing Village/tile-B-04.png", 13, 3),
    /** Tilled crop rows forming the settlement's cultivated field patch. Confirmed by GID audit
     *  to be a repeated ground-fill tile, not a vehicle — the farm pack's tractors and pickups
     *  are never used here and must not be. */
    cropRows: CANONICAL["crop.rows"],

    // --- structures ---
    wharfPlank: CANONICAL["wood.wharf.plank"],
    /** Sparse crop accent stamped over the field. */
    cropAccent: CANONICAL["crop.accent"],
  },
};
