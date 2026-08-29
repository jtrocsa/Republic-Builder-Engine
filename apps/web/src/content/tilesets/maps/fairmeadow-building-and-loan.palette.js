// Palette for fairmeadow-building-and-loan.tmj — the office of a borough savings and loan
// association, two miles from Fairmeadow, August 1957. Consumed by
// scripts/generate-fairmeadow-building-and-loan-tmj.js.
//
// ## The oldest room on the newest map
//
// The model house at the other end of this map was finished in the spring and is dressed entirely
// out of the `Living room` pack. This room is dressed out of the same two nineteenth-century sheets
// that furnished Richmond's counting room, Ellis Island's hearing room and the Canal Crossroads
// boarding house, and **the fifty-year gap between the two interiors is the pair's whole argument**.
//
// It is also just true. A borough building and loan in 1957 was an institution of the 1890s that had
// never had a reason to be refurnished: panelled wainscot, a plain board floor, a counter, bound
// volumes, a floor safe, a clock. The one thing in this room that is younger than the room is a
// printed sheet of paper clipped together on a desk — `suburb-underwriting-checklist`, whose own
// `record` line reads *kept on the mortgage officer's desk, not in any file*. Everything the player
// can see is filing; the document that decides is the one that is not filed. Building the room out
// of old joinery is what makes that visible without a word of narration.
//
// ## Nothing was commissioned and nothing was repacked
//
// The first pass went looking for a steel filing cabinet, on the reasoning that it is the object
// that dates an office to the twentieth century. `office/1.png` and `office/4.png` both have good
// ones and **neither can be stamped**: office/4's are drawn overlapping each other, so a whole-tile
// rect takes a slice of the neighbouring cabinet, and office/1's are drawn against an opaque beige
// wall band with no alpha at all, so a rect takes the wall with them. Repacking office/1's would
// have carried the wall into `derived/` along with the cabinet.
//
// That is the point at which Phase 96's rule applies in reverse. The register entry it would have
// opened — a steel office file — names a real thing and could have been commissioned. It was not
// commissioned because **the room is better without it**: an association with no filing cabinets at
// all, only ledger presses and a safe, says the same date the cabinet would have said and lands the
// record's own sentence on the way past. See decision log `0097`.
//
// ## Bundle cost: zero
//
// Both sheets are already carried by four other interiors, which is the same line
// `immigrant-port-inquiry-room.palette.js` gets to write and for the same reason.

import { tile } from "../canonical-palette.js";

const EU4 = "19th Century European City/tile-B-04.png";
const EU2 = "19th Century European City/tile-B-02.png";

export default {
  id: "fairmeadow-building-and-loan",
  period: 8,
  status: "live",
  map: "apps/web/src/content/maps/fairmeadow-building-and-loan.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes.
  sheets: [
    { path: EU4, name: "european-city-b04" },
    { path: EU2, name: "european-city-b02" },
  ],

  tiles: {
    // --- floor and wall, as whole authored 2x2 blocks ------------------------------------------------
    /**
     * Plain board — the public side of the counter, where people stand. The counting room in
     * Richmond splits its floor the same way and for the same reason: the material changes at the
     * line, so the line is legible before anybody explains it. [measured: terrain]
     */
    floorBoard: tile(EU4, 2, 6, { h: 2, w: 2 }),
    /** Herringbone parquet — the officers' side, behind the counter. [measured: terrain] */
    floorParquet: tile(EU4, 0, 0, { h: 2, w: 2 }),
    /**
     * Panelled wainscot: cream above, dark dado below. Goes on `structures` over floor, never on
     * `ground` — its bottom pixel row is transparent. [measured: terrain]
     */
    wallWainscot: tile(EU4, 4, 8, { h: 2, w: 2 }),
    /** Red brick — the reveal of the street door, so masonry reads where masonry is. [measured] */
    wallBrick: tile(EU4, 4, 0, { h: 2, w: 2 }),
    /** A worn patterned carpet, under the mortgage officer's desk only. [measured] */
    rug: tile(EU4, 2, 10, { h: 2, w: 2 }),

    // --- the way out and the light ---------------------------------------------------------------------
    /**
     * Panelled leaf. Two side by side are the street door, and the way back out.
     *
     * The classifier calls this rect `clipped` and it is right — the art is three rows and this
     * takes two. It is kept anyway, because the top row is stamped inside the wall band where the
     * wainscot draws over it, and because both shipped rooms that use this door declare exactly
     * this rect (`richmond-counting-room`, `immigrant-port-inquiry-room`). Changing it here alone
     * would make one door in the game a different height from every other one. [measured]
     */
    door: tile(EU4, 6, 2, { h: 2, w: 2 }),
    /** Sash window, 1 col — Broad Street light over the public side. [measured] */
    window: tile(EU4, 6, 11, { h: 2 }),
    /** Wall sconce, 1x1. [measured] */
    wallSconce: tile(EU4, 13, 11),

    // --- the counter -------------------------------------------------------------------------------------
    /**
     * The counter: a long plain writing table, 2 rows x 4 cols, stamped twice with a gap between the
     * runs. It is the room's one piece of structure. An application is handed across it, the sheet
     * with the location questions on it never crosses back, and the player has to walk round the end
     * to reach the desk — which is the whole geometry of Part Three of the checklist in one object.
     * [measured]
     */
    counter: tile(EU2, 14, 0, { h: 2, w: 4 }),
    /** A plain side table, 2x2 — the writing slope on the public side, for filling forms in. */
    writingTable: tile(EU2, 14, 4, { h: 2, w: 2 }),

    // --- the officers' side ---------------------------------------------------------------------------------
    /**
     * Writing desk with an inkstand — **the mortgage officer's**, and the checklist is on it. The
     * record anchors here. [measured]
     */
    officersDesk: tile(EU4, 10, 11, { h: 2, w: 2 }),
    /** The floor safe. 1x1. An association's share ledgers and its cash both lived in one. */
    safe: tile(EU4, 12, 14),
    /** Filled bookcase — bound mortgage ledgers, one volume a year. [measured] */
    ledgerPress: tile(EU4, 10, 6, { h: 2, w: 2 }),
    /** The wider run of the same, 2 rows x 3 cols. [measured] */
    ledgerPressWide: tile(EU4, 10, 8, { h: 2, w: 3 }),
    /** Sideboard, doors closed — the current month's applications, locked up. [measured] */
    pressCupboard: tile(EU2, 10, 12, { h: 2, w: 2 }),
    /** Longcase clock, 1 col. A committee that met on Tuesday mornings owned one. [measured] */
    tallClock: tile(EU4, 10, 3, { h: 2 }),

    // --- what lies on the furniture ---------------------------------------------------------------------------
    /**
     * A plain wooden side chair, 1 col. The only chair pattern in the room, deliberately — see the
     * long note in `richmond-counting-room.palette.js`: every other one-column chair on these two
     * sheets is drawn overlapping its neighbour, so the tile cuts it in half.
     */
    chair: tile(EU4, 10, 13, { h: 2 }),
    /** Loose papers, 1x1 — an application part-filled, on the writing slope. [measured] */
    papers: tile(EU4, 15, 13),
    /**
     * An open book, 1x1 — the current ledger, on the counter. [measured]
     *
     * The pen stand at (15,12) that the counting room stamps beside its own is left out here: it
     * measures `clipped` at 1x1, and this room has no second consumer arguing for it.
     */
    openBook: tile(EU4, 15, 14),
  },
};
