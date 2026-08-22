// Palette for immigrant-port-inquiry-room.tmj — the room a board of special inquiry sat in at the
// immigrant station, Ellis Island, 17 April 1907. Consumed by
// scripts/generate-immigrant-port-inquiry-room-tmj.js.
//
// ## The nicest room in the building is the one where the decision is made
//
// This is the contrast the inspection hall's palette sets up and this file completes. Twelve bays
// west, the registry floor is pale grouted tile under buff plaster: a hard, plain, public surface
// for eleven thousand people. Here it is herringbone parquet under panelled wainscot, with a carpet
// on it and a clock in the corner — a committee room, furnished the way the government furnished
// committee rooms, because that is what it was.
//
// Nobody chose that as a cruelty and the room is not drawn as one. It is simply what a hearing room
// in a federal building looked like in 1907, and the fact that the best floor in the station is
// under the person most likely to be sent back is the finding rather than the staging. A student who
// notices it has noticed something true; a student who does not has still walked into a room that
// feels different from the one they left, which is what the change of material is for.
//
// ## Three chairs with nobody in them
//
// The board was **three inspectors**, sitting together, deciding by majority, in private, on the
// record — about four hundred cases a day across the station's boards, with an appeal to Washington
// and a right for a relative or a society to be heard. `scripts/assets/character-manifest.js` says
// plainly why none of the three is drawn: *a hearing that fits in a name pill is a hearing a player
// thinks they have met.* So the table is stamped with its chairs and the chairs are empty, and the
// two people in the room are the clerk who types the minute and the nineteen-year-old standing in
// front of it.
//
// `19th Century European City/tile-B-02` (2,0) is the table: four columns, chairs drawn round it,
// nobody sitting. It is the same sheet and the same idiom as the boardinghouse's long table on Canal
// Crossroads — a table with places set at it is the one piece of furniture in these packs that can
// say who is expected without drawing them.
//
// ## What is deliberately not in here
//
// **No bar, no dock, no rail.** The rail belongs to the room next door, where it divides eleven
// thousand people from four desks. Repeating it here would make the hearing look like a trial, and
// a board of special inquiry was an administrative panel, not a court — which is exactly why its
// decision could be made on a two-minute conversation and a printed sheet.
//
// **No framed art**, per the standing bar on tile-B-04's (12,8) and (12,9).
//
// Bundle cost: **zero**. Both sheets are already carried by Canal Crossroads' and Richmond's four
// interiors.

import { tile } from "../canonical-palette.js";

const EU4 = "19th Century European City/tile-B-04.png";
const EU2 = "19th Century European City/tile-B-02.png";

export default {
  id: "immigrant-port-inquiry-room",
  period: 7,
  status: "live",
  map: "apps/web/src/content/maps/immigrant-port-inquiry-room.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes.
  sheets: [
    { path: EU4, name: "european-city-b04" },
    { path: EU2, name: "european-city-b02" },
  ],

  tiles: {
    // --- floor and wall, as whole authored 2x2 blocks ---------------------------------------------
    /** Warm herringbone parquet, wall to wall. 0.0% transparent. [measured] */
    floorParquet: tile(EU4, 0, 0, { h: 2, w: 2 }),
    /**
     * Cream panelling over a dark wainscot dado. Goes on `structures` over floor, never on `ground`
     * — see the note in the inspection hall's palette for the transparent bottom pixel row.
     *
     * canal-print-shop.palette.js records rejecting this exact block over *plank* boards, where the
     * dado and the floor were the same timber at the same value and the room came out with no
     * edges. Richmond's counting room then shipped it over herringbone and it reads correctly,
     * because the parquet is a full value lighter than the dado and the panels above are cream.
     * [measured]
     */
    wallWainscot: tile(EU4, 4, 8, { h: 2, w: 2 }),
    /** A worn patterned carpet — the floor a person stands on to be heard. [measured] */
    rug: tile(EU4, 2, 10, { h: 2, w: 2 }),

    // --- the way out and the light -----------------------------------------------------------------
    /** Panelled leaf. Two side by side are the wing door, and the way back out. [measured] */
    door: tile(EU4, 6, 2, { h: 2, w: 2 }),
    /** Sash window, 1 col. [measured] */
    window: tile(EU4, 6, 11, { h: 2 }),

    // --- the board ---------------------------------------------------------------------------------
    /**
     * The board's table: four columns, chairs drawn round it, nobody in them. See the header for
     * why the three inspectors are not on this map. [measured]
     */
    boardTable: tile(EU2, 2, 0, { h: 2, w: 4 }),
    /** The clerk's own table, with an inkstand and a pen on it — where the minute is typed. */
    clerkDesk: tile(EU4, 10, 11, { h: 2, w: 2 }),
    /** A press of bound minute books: every hearing this board has held, in order. [measured] */
    minutePress: tile(EU4, 10, 6, { h: 2, w: 2 }),
    /** A side chair, 1 col. The one an appearing passenger is offered, and often is not. */
    chair: tile(EU4, 10, 13, { h: 2 }),

    // --- the waiting side ---------------------------------------------------------------------------
    /** A plain public bench, iron ends and slats — the same one the hall next door uses. */
    bench: tile(EU4, 14, 2, { h: 2, w: 2 }),
    /** The second bench of the pair. [measured] */
    benchAlt: tile(EU4, 14, 4, { h: 2, w: 2 }),
    /**
     * A long-case clock, 1 col. The hall next door has one too, and it means the opposite thing
     * there: two minutes at a desk against however long this takes. [measured]
     */
    tallClock: tile(EU4, 10, 3, { h: 2 }),
    /** Wall sconce, 1x1. [measured] */
    wallSconce: tile(EU4, 13, 11),
  },
};
