// Palette for canal-boarding-house.tmj — the canal-side tavern and boardinghouse in Canal
// Crossroads' Immigrant Quarter. Consumed by scripts/generate-canal-boarding-house-tmj.js.
//
// The room is the one place on the map where the people the canal actually runs on are indoors and
// off shift: boat crews, Irish diggers, a boat family's wife, and a temperance visitor who has come
// in to press pledges on all of them. That collision is the point of the room, and the furniture has
// to make it possible — the sleeping alcove and the common table have to be one space you can stand
// in and see both halves of.
//
// ## What this palette costs the bundle: nothing
//
// All four sheets are already bundled. tile-B-04 and tile-B-02 come in with the printing office next
// door; the Dock sheet and `derived/canal-works.png` come in with the outdoor map. That is the
// whole reason both interiors were drawn from `19th Century European City` rather than from the
// Medieval Tavern pack the plan originally named — the tavern pack is *also* already bundled, by the
// three Institute rooms, but its furniture is medieval and this one is not the Institute.
//
// ## Two decisions
//
// **The bed, the wash tub and the stove are commissioned**; see derived-objects.manifest.js for what
// was searched for first. The bed is the one that matters: no bed exists anywhere in the library,
// which Phase 0 had already recorded, and a boardinghouse without one is a dining room. Three of
// them in a row along one wall is not decoration — canal boardinghouses slept men three and four to
// a bed and advertised it as a feature, and the room should say so before anybody in it does.
//
// **The walls are plaster and the floor is boards**, for the reason recorded at length in
// canal-print-shop.palette.js: the panelled wainscot that looked best on the sheet is the same
// timber at the same value as the plank floor, so a room built from both has no edges, and it is a
// gentleman's register besides. Same measured hairline caveat too — every wall block on this sheet
// carries one fully transparent bottom pixel row, so walls go on `structures` over painted floor
// rather than on `ground` over nothing.

import { tile } from "../canonical-palette.js";
import { CanalWorks } from "../derived-objects.coords.js";

export default {
  id: "canal-boarding-house",
  period: 4,
  status: "live",
  map: "apps/web/src/content/maps/canal-boarding-house.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes.
  sheets: [
    { path: "19th Century European City/tile-B-04.png", name: "european-city-b04" },
    { path: "19th Century European City/tile-B-02.png", name: "european-city-b02" },
    { path: "19th Centruy European Dock/tile-B-06.png", name: "european-dock-b06" },
    { path: "derived/canal-works.png", name: "derived-canal-works" },
  ],

  tiles: {
    // --- floors and walls, as whole authored 2x2 blocks ------------------------------------------
    /** Plank boards — the common room and both aisles. 0.0% transparent. [measured] */
    floorPlank: tile("19th Century European City/tile-B-04.png", 0, 6, { h: 2, w: 2 }),
    /** Bare grey flag — the kitchen end, where water gets spilled. 0.0% transparent. [measured] */
    floorStone: tile("19th Century European City/tile-B-04.png", 0, 14, { h: 2, w: 2 }),
    /** Buff plaster — the house's walls. Goes on `structures`; see the header. [measured] */
    wallPlaster: tile("19th Century European City/tile-B-04.png", 4, 2, { h: 2, w: 2 }),
    /** Red brick — the stove wall, the kitchen end and the doorway reveals. [measured] */
    wallBrick: tile("19th Century European City/tile-B-04.png", 4, 0, { h: 2, w: 2 }),

    // --- the way out -------------------------------------------------------------------------------
    /** Panelled door leaf. Two side by side read as the street door. [measured] */
    door: tile("19th Century European City/tile-B-04.png", 6, 2, { h: 2, w: 2 }),
    /** Sash window, 1 col. [measured] */
    window: tile("19th Century European City/tile-B-04.png", 6, 11, { h: 2 }),

    // --- the sleeping alcove ------------------------------------------------------------------------
    /** Plain rope bed with a straw tick. Commissioned; there is no bed in any pack. [derived, 2x2] */
    ropeBed: { ...CanalWorks.ropeBed },
    /** Small chest of drawers — what a boarder keeps. [measured] */
    boarderChest: tile("19th Century European City/tile-B-02.png", 8, 13, { h: 2 }),

    // --- the kitchen end -----------------------------------------------------------------------------
    /** Cast-iron box stove with its pipe and coal scuttle. Commissioned. [derived, 2x2] */
    stove: { ...CanalWorks.stove },
    /** Staved wash tub on its bench, with a paddle and folded linen. Commissioned. [derived, 2x2] */
    washTub: { ...CanalWorks.washTub },
    /** Glazed dresser stacked with plates — the house's crockery. [measured] */
    dresser: tile("19th Century European City/tile-B-02.png", 0, 10, { h: 2, w: 2 }),
    /** Plain cupboard, doors closed. [measured] */
    cupboard: tile("19th Century European City/tile-B-02.png", 0, 8, { h: 2, w: 2 }),
    /** Open shelving of jugs and glasses. [measured] */
    shelfCrockery: tile("19th Century European City/tile-B-02.png", 4, 12, { h: 2, w: 2 }),

    // --- the common room -------------------------------------------------------------------------------
    /** The long boarding table, chairs down both sides. 2 rows x 4 cols. [measured] */
    boardingTable: tile("19th Century European City/tile-B-02.png", 10, 0, { h: 2, w: 4 }),
    /** A plain deal table, no chairs. 2x2. [measured] */
    plainTable: tile("19th Century European City/tile-B-02.png", 14, 4, { h: 2, w: 2 }),
    /** Sideboard — the keeper's counter, where the reckoning is kept. [measured] */
    counter: tile("19th Century European City/tile-B-02.png", 10, 12, { h: 2, w: 2 }),
    /** Side chair, 1 col. [measured] */
    chair: tile("19th Century European City/tile-B-02.png", 12, 4, { h: 2 }),
    /** Settle bench. [measured] */
    settle: tile("19th Century European City/tile-B-02.png", 12, 6, { h: 2, w: 2 }),

    // --- stores and dressing ------------------------------------------------------------------------------
    // Off the Dock sheet the outdoor map already bundles: what a canal-side house has standing
    // about is freight, because that is what its lodgers carry for a living.
    /** Barrel, 1x1. [live] */
    barrel: tile("19th Centruy European Dock/tile-B-06.png", 10, 4),
    /** Second barrel front, so a row of them is not one tile repeated. [live] */
    barrelAlt: tile("19th Centruy European Dock/tile-B-06.png", 11, 5),
    /** Crate, 1x1. [live] */
    crate: tile("19th Centruy European Dock/tile-B-06.png", 10, 0),
    /** Grain sack, 1x1. [live] */
    grainSack: tile("19th Centruy European Dock/tile-B-06.png", 10, 6),
    /** Oil lamp, 1x1. [measured] */
    oilLamp: tile("19th Century European City/tile-B-04.png", 15, 15),
    /** An open book, 1x1 — the house register, on the keeper's counter. [measured] */
    openBook: tile("19th Century European City/tile-B-04.png", 15, 14),
    /** Wall sconce, 1x1. [measured] */
    wallSconce: tile("19th Century European City/tile-B-04.png", 13, 11),
    /** Potted greenery, 1 col — stamped `base`, so the player walks behind the foliage. */
    plantPotted: tile("19th Century European City/tile-B-04.png", 12, 3, { h: 2 }),
  },
};
