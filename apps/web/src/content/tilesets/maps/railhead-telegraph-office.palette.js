// Palette for railhead-telegraph-office.tmj — the Western Union office at Cottonwood Junction,
// Kansas, June 1873. Consumed by scripts/generate-railhead-telegraph-office-tmj.js.
//
// ## The other machine on this street
//
// The land office next door makes title. This room makes **price and time**, and it is the reason
// a cattle drover standing in a pen forty rods south of here is paid on a number decided in Kansas
// City that morning. Everything in it exists to move words: an instrument table railed off from
// the public, a message file, a counter you hand a blank across and pay by the word, and a bench
// for the people waiting on an answer. There is no clock in here on purpose — standard time did
// not arrive on the railroads until 1883, and a wall clock in a Kansas telegraph office in 1873
// would be showing local sun time and quietly telling the wrong story about what the wire had
// already done to distance.
//
// ## Read railhead-land-office.palette.js first
//
// The two rooms were built together and that file carries the three findings both of them rest on:
// the Wild West pack has no interior floor and no interior door, the A4 material sheets must be
// addressed through `SHARED_SHEETS` because the pack copies are byte-identical, and a flat
// repeating material only reads as a wall if it has a base rail drawn along the bottom of the
// block. Everything here follows those.
//
// The one difference is deliberate: the land office is white painted panelling and this room is
// plain board. A federal office was whitewashed and a leased telegraph room was not, and the two
// walls are how a player knows at a glance which door they came through.
//
// ## The typewriter that is not in here
//
// `tile-B-09` (8,12) is a desk with a typewriter on it, and it is exactly the machine this room
// looks like it wants. The Sholes and Glidden went on sale in 1874. One year is still an
// anachronism, and it would be the most conspicuous object on the map — so the operator's desk is
// (10,8) instead: a copying press, a hand stamp, and an open message book. The instrument itself
// is a dark case laid the length of the key table at (10,0), which is what a sounder and key on a
// resonator board look like from above, and it is the closest true thing on any of these sheets.
//
// Bundle cost: zero new sheets. `tile-B-03` and the shared A4 floor arrive with the land office,
// `tile-B-09` is shared between the two rooms, `19th Century European City/tile-B-04` is carried
// by all four existing interiors, and `SHARED_SHEETS.wallsA` is the only sheet unique to this room.

import { SHARED_SHEETS, tile } from "../canonical-palette.js";

const EU = "19th Century European City/tile-B-04.png";
const WW3 = "Wild West/tile-B-03.png";
const WW9 = "Wild West/tile-B-09.png";

export default {
  id: "railhead-telegraph-office",
  period: 6,
  status: "live",
  map: "apps/web/src/content/maps/railhead-telegraph-office.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes.
  sheets: [
    { path: SHARED_SHEETS.floors, name: "shared-a4-floors" },
    { path: SHARED_SHEETS.wallsB, name: "shared-a4-walls-b" },
    { path: WW3, name: "wild-west-b03" },
    { path: WW9, name: "wild-west-b09" },
    { path: EU, name: "european-city-b04" },
  ],

  tiles: {
    // --- floor and wall, as whole authored 2x2 blocks ----------------------------------------------
    /** The same mid-brown plank floor as the land office. Same street, same builder. [measured] */
    floorBoard: tile(SHARED_SHEETS.floors, 3, 10, { h: 2, w: 2 }),
    /**
     * Dark stained panelling over a plank base rail — the same sheet as the land office's white,
     * two blocks along, and the strongest contrast against this floor that the A4 sheets hold.
     *
     * The first pass used a plain board wall instead, on the reasoning that a leased telegraph room
     * would not be painted. Rendered at full size the room had no edges at all: board wall and board
     * floor are the same species at the same value, and the vertical-versus-horizontal grain that
     * looks like plenty of separation on a tile sheet disappears across fourteen rows. That is the
     * defect richmond-counting-room.palette.js names in its own header, arrived at from the other
     * direction, and the fix here is the same one — change the value, not just the pattern.
     * [measured]
     */
    wallWainscot: tile(SHARED_SHEETS.wallsB, 3, 8, { h: 2, w: 2 }),

    // --- the way in and the light --------------------------------------------------------------------
    /** Plain panelled leaf. Two side by side are the Front Street door, and the way out. [measured] */
    door: tile(EU, 6, 2, { h: 2, w: 2 }),
    /** Sash window, 1 col. [measured] */
    window: tile(EU, 6, 11, { h: 2 }),

    // --- the rail ---------------------------------------------------------------------------------------
    /**
     * The same counter-and-rail unit the land office uses, in the brass colourway rather than the
     * dark iron. `base` solidity: the counter body blocks its ground-contact row and the rail lifts
     * to the overlay, so the operator behind it draws correctly. [measured]
     */
    counterRail: tile(WW3, 12, 2, { h: 2, w: 2 }),
    /**
     * The message window: a counter under a shelved valance, with a cash drawer and a bundle of
     * notes on it. Where a blank is handed in and paid for by the word. A complete object with
     * clear margins inside its 2x2 — the column profile puts 15 empty pixels at its left edge and
     * 15 at its right. [measured]
     */
    messageWindow: tile(WW3, 12, 10, { h: 2, w: 2 }),

    // --- the operator's end -------------------------------------------------------------------------------
    /**
     * The key table: a plain desk with a long dark instrument case laid the length of it and an
     * inkwell beside it. See the header for why this is the instrument and the typewriter is not.
     * [measured]
     */
    keyTable: tile(WW9, 10, 0, { h: 2, w: 2 }),
    /** The operator's desk: a copying press, a hand stamp, an open message book. [measured] */
    operatorDesk: tile(WW9, 10, 8, { h: 2, w: 2 }),
    /** A closed press cupboard — the file of messages sent, which the company required kept. [measured] */
    fileCupboard: tile(WW9, 0, 14, { h: 2, w: 2 }),
    /** A shelf of bound volumes: the tariff books and the code books. [measured] */
    shelfLedgers: tile(WW9, 6, 12, { h: 2, w: 2 }),

    // --- the public half ---------------------------------------------------------------------------------
    /** A plain plank bench, 2x2. [measured] */
    bench: tile(WW9, 12, 0, { h: 2, w: 2 }),
    /** A second bench, a shade darker. [measured] */
    benchWorn: tile(WW9, 12, 8, { h: 2, w: 2 }),
    /** A plain writing desk against the public wall — the shelf a sender drafts a blank on. [measured] */
    writingDesk: tile(WW9, 8, 2, { h: 2, w: 2 }),

    // Nothing loose is declared. Every desk on `tile-B-09` arrives with its own ledger, inkwell,
    // pen stand and chair drawn on it, so the overlay props this palette carried in its first pass
    // were never stamped — see the note in scripts/generate-railhead-land-office-tmj.js.
  },
};
