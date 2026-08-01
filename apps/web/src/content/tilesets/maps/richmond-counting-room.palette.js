// Palette for richmond-counting-room.tmj — the trader's counting room on Cary Street, Shockoe
// Bottom. Consumed by scripts/generate-richmond-counting-room-tmj.js.
//
// ## The register rule governs this palette, not just the dialogue
//
// The decision-log rule for Shockoe Bottom is that nothing here may be theatrical, and it binds the
// art before it binds a line of speech. There are no chains in this room, no auction block, no cell
// door, no ledger open at a page of names rendered legibly enough to read. The horror of the place
// is that it is a well-kept commercial office, and the way to say that is to draw a well-kept
// commercial office. A student who walks in and thinks *this is just an office* has understood the
// exhibit; a student who walks into a dungeon has been told what to feel and learned nothing.
//
// ## The wainscot the printing office rejected is right here
//
// canal-print-shop.palette.js records rejecting `tile-B-04` (4,8) — panelled wainscot, the
// best-looking wall on the sheet — on two grounds: it is the same timber at the same value as the
// plank floor, so a room built from both has no edges, and panelled mahogany is a gentleman's study
// rather than a country jobbing shop.
//
// The second objection is exactly why it belongs here. This *is* a gentleman's office: Richmond's
// traders and their agents were respectable men of business with respectable premises, members of
// the same commercial associations as the forwarding merchants two doors down, and the room they
// worked in looked like it.
//
// The first objection is real, and it is answered the same way the printing office answered it —
// board in the outer office, herringbone parquet at the trader's own end, so the pattern changes
// under the player's feet even where the value does not, and the rug marks the desk.
//
// The first draft answered it differently and wrongly, which is worth recording: it took `tile-B-04`
// (0,14) as flagstone, on the strength of canal-boarding-house.palette.js calling it "bare grey
// flag." Rendered at full size across two thirds of a room it is unmistakably a **wall** — coursed
// grey masonry with mortar joints, laid flat. It is fine as the one-block kitchen end of a
// boardinghouse and it is not a floor. There are exactly four floors on this sheet, all of them
// wood: herringbone at (0,0) and (2,0), board at (0,6) and (2,6).
//
// ## Some chairs, a strong door, and nothing else
//
// Two things carry what the room is, and both are ordinary furniture:
//
//   three chairs   in a row against the outer-office wall, facing the trader's end. An office with
//                  seating for people who are not customers is an office that keeps people waiting in
//                  it, and that is the whole of what needs saying. Nathan Purcell is standing beside
//                  them rather than sitting on one, which is a different sentence.
//   yardDoor       a heavy door in the NORTH wall, opposite the street. It opens on the walled yard
//                  the outdoor map already draws as a locked gate with a chain across it — see
//                  generate-richmond-tmj.js's note on why that yard is stamped empty. The door does
//                  not open: no interior lies behind it, and the player is told so by a person
//                  rather than by a locked-door message.
//
// Every coordinate below is read off `npm run assets:label -- "<sheet>"` and the transparency
// caveats are inherited from the two Canal Crossroads interiors, which measured this sheet first:
// every wall block carries one fully transparent bottom pixel row, so walls go on `structures` over
// painted floor rather than on `ground` over nothing.
//
// Bundle cost: zero. Both sheets are already carried by the Unit 4 interiors, and
// derived/civil-war-works.png by the Richmond outdoor map.

import { tile } from "../canonical-palette.js";

export default {
  id: "richmond-counting-room",
  period: 5,
  status: "live",
  map: "apps/web/src/content/maps/richmond-counting-room.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes.
  sheets: [
    { path: "19th Century European City/tile-B-04.png", name: "european-city-b04" },
    { path: "19th Century European City/tile-B-02.png", name: "european-city-b02" },
  ],

  tiles: {
    // --- floors and walls, as whole authored 2x2 blocks --------------------------------------------
    /** Plain board — the outer office, where people stand and wait. 0.0% transparent. [measured] */
    floorBoard: tile("19th Century European City/tile-B-04.png", 2, 6, { h: 2, w: 2 }),
    /** Herringbone parquet — the trader's own end, behind the rail. 0.0% transparent. [measured] */
    floorParquet: tile("19th Century European City/tile-B-04.png", 0, 0, { h: 2, w: 2 }),
    /** Panelled wainscot: cream above, dark dado below. The room's walls; see the header. */
    wallWainscot: tile("19th Century European City/tile-B-04.png", 4, 8, { h: 2, w: 2 }),
    /** The patterned run of the same wainscot, for the trader's end. */
    wallWainscotFigured: tile("19th Century European City/tile-B-04.png", 4, 12, { h: 2, w: 2 }),
    /** Red brick — the reveals of both doors, so masonry reads where masonry is. [measured] */
    wallBrick: tile("19th Century European City/tile-B-04.png", 4, 0, { h: 2, w: 2 }),
    /** A worn patterned carpet, under the trader's desk only. [measured] */
    rug: tile("19th Century European City/tile-B-04.png", 2, 10, { h: 2, w: 2 }),

    // --- the two doors ------------------------------------------------------------------------------
    /** Plain panelled leaf. Two side by side are the Cary Street door, and the way out. [measured] */
    door: tile("19th Century European City/tile-B-04.png", 6, 2, { h: 2, w: 2 }),
    /**
     * The yard door, in the north wall. Heavier than the street door and set in a carved frame,
     * which is the only way the art can say "this one is not for customers" without a chain on it.
     * It does not open. See the header.
     */
    yardDoor: tile("19th Century European City/tile-B-04.png", 6, 0, { h: 2, w: 2 }),
    /** Sash window, 1 col — Cary Street light, over the outer office. [measured] */
    window: tile("19th Century European City/tile-B-04.png", 6, 11, { h: 2 }),

    // --- the trader's end ----------------------------------------------------------------------------
    /** Writing desk with an inkstand and a quill — where the hire contracts are signed. [measured] */
    tradersDesk: tile("19th Century European City/tile-B-04.png", 10, 11, { h: 2, w: 2 }),
    /** The office safe. 1x1. [measured] */
    safe: tile("19th Century European City/tile-B-04.png", 12, 14),
    /** Filled bookcase — bound ledgers, one volume a year. [measured] */
    ledgerPress: tile("19th Century European City/tile-B-04.png", 10, 6, { h: 2, w: 2 }),
    /** The wider run of the same, 2 rows x 3 cols. [measured] */
    ledgerPressWide: tile("19th Century European City/tile-B-04.png", 10, 8, { h: 2, w: 3 }),
    /** Longcase clock. A counting house ran to the hour and charged by the day. [measured] */
    tallClock: tile("19th Century European City/tile-B-04.png", 10, 3, { h: 2 }),

    // --- the clerks' room -----------------------------------------------------------------------------
    /** The long plain writing table the day book is kept on, 2 rows x 4 cols. [measured] */
    clerksTable: tile("19th Century European City/tile-B-02.png", 14, 0, { h: 2, w: 4 }),
    /** A plain side table, 2x2 — the copying desk. [measured] */
    sideTable: tile("19th Century European City/tile-B-02.png", 14, 4, { h: 2, w: 2 }),
    /** Sideboard, doors closed — where the current month's papers are locked up. [measured] */
    pressCupboard: tile("19th Century European City/tile-B-02.png", 10, 12, { h: 2, w: 2 }),
    /**
     * A plain wooden side chair, 1 col — and the only chair in either Richmond interior, deliberately.
     *
     * Three other candidates were stamped and rendered first, and all three are the same defect: on
     * this sheet and on B-02, a "one column" chair is drawn overlapping its neighbour, so the tile
     * cuts it down the middle and draws a sliver of the chair beside it. B-04 (8,13) is a green
     * padded stool besides, and B-02 (12,4) is half of one carved dining chair and half of another.
     * A repeated chair is a much smaller sin than a clipped one, which is the same lesson
     * derived-objects.manifest.js exists to record: art that crosses tile boundaries has to be
     * repacked or left alone, not stamped and hoped over.
     */
    chair: tile("19th Century European City/tile-B-04.png", 10, 13, { h: 2 }),

    // --- what lies on the furniture ------------------------------------------------------------------------
    /** An open book, 1x1 — the day book on the clerks' table. This map's record anchors to it. */
    openBook: tile("19th Century European City/tile-B-04.png", 15, 14),
    /** Loose papers, 1x1. [measured] */
    papers: tile("19th Century European City/tile-B-04.png", 15, 13),
    /** Oil lamp, 1x1. [measured] */
    oilLamp: tile("19th Century European City/tile-B-04.png", 15, 15),
    /** Pen stand, 1x1. [measured] */
    penStand: tile("19th Century European City/tile-B-04.png", 15, 12),
    /** Wall sconce, 1x1. [measured] */
    wallSconce: tile("19th Century European City/tile-B-04.png", 13, 11),
  },
};
