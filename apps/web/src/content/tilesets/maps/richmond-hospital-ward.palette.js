// Palette for richmond-hospital-ward.tmj — one ward of Chimborazo Hospital, on the hill east of
// Richmond. Consumed by scripts/generate-richmond-hospital-ward-tmj.js.
//
// ## Non-graphic is a palette decision before it is a writing one
//
// The plan's rule for this room is "non-graphic throughout: the evidence is the register page, not
// the wounds," and the palette is where that is either kept or lost. So: **every cot in this room is
// empty and made up.** The commissioned `hospitalCot` was drawn that way on purpose — see
// derived-objects.manifest.js — and there is no wounded figure, no bandage, no basin of anything, no
// blood, and no surgical instrument anywhere in this list.
//
// The obvious objection is that Chimborazo in 1864 was full, so a ward of empty cots is a lie of
// omission. It would be, if the room said nothing else. What the room actually says is carried by
// Jane Ferris and Delia Marsh standing in it and by the register on the matron's desk, which is
// where the ward's arithmetic lives: how many came in, how many went back to the ranks, how many
// did not — including, in Delia's case, what the register does not record at all. A ledger
// column is a more honest instrument for that than a painted casualty, and it is the one a
// Chronicler is here to read. The generator's header records the same decision from the layout side.
//
// ## What Chimborazo actually looked like, and what the library can do about it
//
// The real hospital was around one hundred and fifty whitewashed frame buildings on a hill — long,
// single-storey, plank-floored, windows down both long walls for ventilation, which was the era's
// whole theory of hospital design and the reason Chimborazo's mortality was as low as it was. The
// building label on the outdoor map says "a Chimborazo ward" rather than "Chimborazo" for exactly
// this reason: compressing a hundred and fifty buildings into one is honest only if the name admits
// it.
//
// So the room is long and narrow — 24x14, the widest interior in the game — with sash windows the
// length of both long walls and nothing ornate in it. That last part is a real constraint, because
// `19th Century European City/tile-B-02` is a *parlour* pack: carved dining suites and upholstered
// armchairs, almost all of it too fine for a military hospital. Six plain pieces come off it and the
// rest of the room is B-04's presses, cabinet and desk, which are plainer.
//
// Bundle cost: zero. Both sheets come in with the Unit 4 interiors and derived/civil-war-works.png
// with the Richmond outdoor map.

import { tile } from "../canonical-palette.js";
import { CivilWarWorks } from "../derived-objects.coords.js";

export default {
  id: "richmond-hospital-ward",
  period: 5,
  status: "live",
  map: "apps/web/src/content/maps/richmond-hospital-ward.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes.
  sheets: [
    { path: "19th Century European City/tile-B-04.png", name: "european-city-b04" },
    { path: "19th Century European City/tile-B-02.png", name: "european-city-b02" },
    { path: "derived/civil-war-works.png", name: "derived-civil-war-works" },
  ],

  tiles: {
    // --- floors and walls -----------------------------------------------------------------------------
    /** Scrubbed plank boards, wall to wall. A ward floor was washed daily. 0.0% transparent. */
    floorPlank: tile("19th Century European City/tile-B-04.png", 0, 6, { h: 2, w: 2 }),
    /**
     * Whitewash — the palest wall on the sheet, and a registered compromise rather than a match.
     * Rendered, it reads as pale coursed brick rather than as limewash over board, and Chimborazo's
     * wards were frame buildings. Nothing on any interior sheet in the library is limewashed
     * planking; the alternative was the wainscot next door in the counting room, which would make a
     * military hospital and a slave trader's office the same room. Pale brick is the wrong material
     * and the right value, and at 48px the value is what a player reads.
     *
     * On `structures` over painted floor: this block carries one fully transparent bottom pixel row,
     * and on the ground layer that is a hole through to the page. [measured by the Unit 4 interiors]
     */
    wallWhitewash: tile("19th Century European City/tile-B-04.png", 4, 2, { h: 2, w: 2 }),
    /** Red brick — the door reveals and the stove wall. [measured] */
    wallBrick: tile("19th Century European City/tile-B-04.png", 4, 0, { h: 2, w: 2 }),

    // --- the way out, and the light ---------------------------------------------------------------------
    /** Plain panelled leaf. Two side by side are the ward door onto Broad Street. [measured] */
    door: tile("19th Century European City/tile-B-04.png", 6, 2, { h: 2, w: 2 }),
    /**
     * Sash window, 1 col. Stamped the length of both long walls, which is not decoration: cross
     * ventilation was the design principle Chimborazo was built on and the thing its surgeons wrote
     * about. A ward with two windows would be the wrong building.
     */
    window: tile("19th Century European City/tile-B-04.png", 6, 11, { h: 2 }),

    // --- the ward itself -------------------------------------------------------------------------------
    /**
     * A folding camp cot, empty and made up. Commissioned for this room; see the header for why it
     * is empty and derived-objects.manifest.js for why it is narrower and lower than Canal
     * Crossroads' rope bedstead. One column wide and two rows tall, so a row of them lines up.
     * [derived, 1 col x 2 rows]
     */
    cot: CivilWarWorks.hospitalCot,
    /** A plain small table with a drawer, 1 col — one between each pair of cots. [measured] */
    bedsideTable: tile("19th Century European City/tile-B-02.png", 12, 8, { h: 2 }),
    /** A second bedside front, so a ward of them is not one tile repeated. [measured] */
    bedsideTableAlt: tile("19th Century European City/tile-B-02.png", 10, 8, { h: 2 }),

    // --- the matron's end ------------------------------------------------------------------------------
    /**
     * The matron's desk. The ward register lies open on it, and this room's record anchors there —
     * see the header on why a ledger column is the right instrument for what happened here.
     */
    matronDesk: tile("19th Century European City/tile-B-04.png", 10, 11, { h: 2, w: 2 }),
    /** Plain wooden side chair, 1 col. The only chair in either Richmond interior — see that palette
     * for why the three alternatives all clip their neighbour. */
    chair: tile("19th Century European City/tile-B-04.png", 10, 13, { h: 2 }),
    /** The long plain work table — where dressings are rolled and rations are portioned. 4x2. */
    wardTable: tile("19th Century European City/tile-B-02.png", 14, 0, { h: 2, w: 4 }),
    /** A plain deal table, 2x2. [measured] */
    plainTable: tile("19th Century European City/tile-B-02.png", 14, 4, { h: 2, w: 2 }),

    // --- stores -----------------------------------------------------------------------------------------
    /** A tall plain press — the ward's linen, which a matron accounted for by the piece. [measured] */
    linenPress: tile("19th Century European City/tile-B-04.png", 8, 6, { h: 2, w: 2 }),
    /** A second press, so the two ends of the ward are not the same tile. [measured] */
    linenPressAlt: tile("19th Century European City/tile-B-04.png", 8, 8, { h: 2, w: 2 }),
    /**
     * A glazed cabinet. The ward's medicines, and the reason it is glazed and not open: by 1864 the
     * blockade had made quinine and morphine scarce enough to lock up, and Confederate surgeons were
     * substituting dogwood and willow bark for cinchona and writing about it in the medical journals.
     */
    medicineCabinet: tile("19th Century European City/tile-B-04.png", 8, 4, { h: 2, w: 2 }),
    /** A plain closed cupboard, 2x2 — the ward's stores. [measured] */
    storeCupboard: tile("19th Century European City/tile-B-02.png", 6, 10, { h: 2, w: 2 }),
    /** A low open shelf, 2x2. [measured] */
    lowShelf: tile("19th Century European City/tile-B-02.png", 6, 14, { h: 2, w: 2 }),

    // --- what lies on the furniture -------------------------------------------------------------------------
    /** An open book, 1x1 — the ward register. This room's record anchors to it. [measured] */
    openBook: tile("19th Century European City/tile-B-04.png", 15, 14),
    /** Loose papers, 1x1 — requisitions, which a matron spent her day on. [measured] */
    papers: tile("19th Century European City/tile-B-04.png", 15, 13),
    /** Oil lamp, 1x1. A ward was watched through the night. [measured] */
    oilLamp: tile("19th Century European City/tile-B-04.png", 15, 15),
    /** Wall sconce, 1x1. [measured] */
    wallSconce: tile("19th Century European City/tile-B-04.png", 13, 11),
  },
};
