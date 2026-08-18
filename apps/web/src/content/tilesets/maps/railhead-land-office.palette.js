// Palette for railhead-land-office.tmj — the United States district land office at Cottonwood
// Junction, Kansas, June 1873. Consumed by scripts/generate-railhead-land-office-tmj.js.
//
// ## The room the receipt comes out of
//
// `railhead-land-office-receipt` is the map's first record and the one every other document on it
// leans against, and until now it was handed over on a street. This is the room it is written in:
// a counter, a set of tract books, a safe for the cash, and one desk. Unit 6's title is "A
// Continent on Paper" and this is the machine that makes the paper.
//
// The register rule from Shockoe Bottom governs the furniture here for the same reason it governed
// it there. **Nothing in this room is sinister.** There is no locked ledger, no shadow, no vault
// door, no cell. It is a well-lit government office with a rail across it, and a student who walks
// in and thinks *this is just an office* has understood the exhibit exactly. The proceeds of the
// sale are credited to the Kanza account in the Treasury and every clause of that is lawful; what
// makes it a finding is that the party being credited is 160 miles away under compulsion, and no
// piece of furniture in here knows that.
//
// ## Three things measured rather than assumed
//
// 1. **The Wild West pack has no interior floor and no interior door.** Eleven sheets, and every
//    horizontal surface on them is either boardwalk with sand baked into its edges (`tile-B-10`) or
//    a street. The floor here is `Auto-tile-A4-Walls-1` (3,10) — mid-brown plank, verified by the
//    same 5x5 parity tiling every ground block in the game goes through — and the door and sash
//    window are the ones the four existing interiors already use, off
//    `19th Century European City/tile-B-04`.
//
//    That last borrowing is worth defending rather than apologising for. A four-panel door and a
//    double-hung sash in a two-year-old Kansas frame building came off a car from an eastern
//    sash-and-door mill, because there was no mill here and there was a railroad. The one piece of
//    this room that is not local is the piece that arrived by rail, which is the unit's argument
//    stated in joinery.
//
// 2. **The A4 sheets are addressed through SHARED_SHEETS, not through the `Wild West/` copy.**
//    Verified by content hash: `Wild West/Auto-tile-A4-Walls-1.png` and
//    `Medieval Tavern/Auto-tile-A4-Walls-1.png` are byte-identical, and naming both paths would
//    make Vite bundle the same image twice. canonical-palette.js has held that rule since it was
//    written; this palette is the first map to actually consume it.
//
// 3. **A wall has to carry a base rail or it reads as a floor.** richmond-counting-room.palette.js
//    records taking coursed grey masonry for flagstone and finding out at full size that it was a
//    wall; this is the same mistake with the signs reversed. Every candidate on the A4 sheets that
//    is a flat repeating material was rendered as a 14-row room before one was chosen, and the two
//    that read unambiguously as walls are the two with a plank ledge drawn along the bottom of the
//    block. This room takes the white painted panelling; the telegraph office next door takes the
//    board. Federal offices were whitewashed and telegraph offices were not.
//
// ## What is deliberately not in here
//
// No wanted posters, which is nine tenths of `tile-B-03`'s wall art and belongs in a sheriff's
// office. No jail bars, no gun rack, no vault door — the sheet's most striking pieces are all from
// the wrong building. The safe in this room is a plain floor safe standing beside the tract books,
// because a receiver held cash overnight and that is the whole of why it is there.
//
// Bundle cost: three new sheets (`tile-B-03`, and the two shared A4 sheets, which no map has
// carried before). `19th Century European City/tile-B-04` is already carried by all four existing
// interiors, and `tile-B-09` by the telegraph office beside this one.

import { SHARED_SHEETS, tile } from "../canonical-palette.js";

const EU = "19th Century European City/tile-B-04.png";
const WW3 = "Wild West/tile-B-03.png";
const WW9 = "Wild West/tile-B-09.png";

export default {
  id: "railhead-land-office",
  period: 6,
  status: "live",
  map: "apps/web/src/content/maps/railhead-land-office.tmj",

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
    /** Mid-brown plank floor. Tiles clean at 5x5 parity; 0.0% transparent. [measured] */
    floorBoard: tile(SHARED_SHEETS.floors, 3, 10, { h: 2, w: 2 }),
    /**
     * White painted panelling over a plank base rail. The rail is what makes it a wall rather than
     * a floor — see note 3 in the header — and the white is what makes this room the bright one of
     * the pair. [measured]
     */
    wallPanel: tile(SHARED_SHEETS.wallsB, 3, 10, { h: 2, w: 2 }),

    // --- the way in and the light --------------------------------------------------------------------
    /** Plain panelled leaf. Two side by side are the Front Street door, and the way out. [measured] */
    door: tile(EU, 6, 2, { h: 2, w: 2 }),
    /** Sash window, 1 col — Front Street light over the public half. [measured] */
    window: tile(EU, 6, 11, { h: 2 }),

    // --- the counter -----------------------------------------------------------------------------------
    /**
     * A panelled counter with an iron rail standing on it, 2x2, drawn with a gate notch in the
     * middle of its own span. Everything above the counter top is transparent, so it goes on
     * `structures` and is stamped `base`: the counter body blocks its ground-contact row and the
     * rail lifts to the overlay, which is what lets a clerk standing behind it draw correctly.
     *
     * The dark-iron colourway of four on the sheet. The telegraph office takes the brass one, so
     * the two rooms are told apart by their rail as well as by their wall. [measured]
     */
    counterRail: tile(WW3, 12, 0, { h: 2, w: 2 }),

    // --- behind the counter ------------------------------------------------------------------------------
    /**
     * The tract books and the safe, drawn as one piece. This 2x2 is two complete objects abutting —
     * a pigeon-hole press with papers in the holes, and a floor safe beside it — and the column
     * profile puts the join exactly on the tile boundary at col 13, with clear margins at both
     * outer edges. Stamping it as one piece is therefore honest rather than a clip, and it is also
     * the truth about the room: the books and the money stood together because the same officer was
     * answerable for both. [measured]
     */
    tractPress: tile(WW3, 10, 12, { h: 2, w: 2 }),
    /** The register's own desk: a pen stand, an open ledger, bound volumes, and his chair. [measured] */
    registerDesk: tile(WW9, 8, 8, { h: 2, w: 2 }),
    /**
     * The plat table — a plain desk with a rolled sheet laid the length of it and an inkstand. The
     * township plat is what the tract books are indexed against and what the deputy surveyor's
     * field book is returned with, so this is the one piece of furniture in the room that the
     * survey record on the section lines north of town points back at. [measured]
     */
    platTable: tile(WW9, 10, 0, { h: 2, w: 2 }),
    /** A plain writing desk with an open book and an inkwell — the clerk's copying desk. [measured] */
    copyDesk: tile(WW9, 8, 4, { h: 2, w: 2 }),
    /** A closed press cupboard, doors shut. The current quarter's returns. [measured] */
    pressCupboard: tile(WW9, 0, 14, { h: 2, w: 2 }),

    // --- the public half ---------------------------------------------------------------------------------
    /** A plain plank bench, 2x2. What a land office gave people to wait on. [measured] */
    bench: tile(WW9, 12, 0, { h: 2, w: 2 }),
    /** A second bench, a shade darker. [measured] */
    benchWorn: tile(WW9, 12, 8, { h: 2, w: 2 }),

    // Nothing loose is declared. Every desk on `tile-B-09` arrives with its own ledger, inkwell,
    // pen stand and chair drawn on it — see the note in
    // scripts/generate-railhead-land-office-tmj.js for what happened when this palette tried to add
    // more.
  },
};
