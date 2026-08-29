// Palette for fairmeadow-model-house.tmj — the furnished house the developer keeps open on Sundays
// at Fairmeadow, Pennsylvania, August 1957. Consumed by
// scripts/generate-fairmeadow-model-house-tmj.js.
//
// ## The first interior in the game that is not old
//
// Every one of the eight rooms before this one was dressed out of `19th Century European City`:
// panelled wainscot, herringbone parquet, sash windows, a longcase clock. That was right eight
// times running and it is wrong here. The Fairmeadow Rancher was finished this spring. Nothing in
// it has a previous owner, a patina or a repair, and a room that reads as old reads as somebody
// else's — which is the one thing the sales office cannot afford, because the sheet on the card
// table ends *you will not have to imagine anything*.
//
// So this room is the library's `Living room` pack, and the lending office two miles away stays on
// the nineteenth-century sheets. **That contrast is the pair's whole argument** and it is the same
// shape as Ellis Island's: `immigrant-port-inquiry-room.palette.js` put the best floor in the
// building under the person most likely to be sent back. Here the newest room on the map is the one
// with nothing in it but a price, and the oldest is the one where the price is decided.
//
// ## Three sheets, and what each is carrying
//
// `Living room/Auto-tile-A4-walls-3.png` (239 KB) is the cheapest wall source in the library and
// also the right one: (13,6) is flat cream paint over a plain stained baseboard with **no cornice**,
// which is what a slab-on-grade tract house had. The two heavier candidates were both rejected by
// eye — walls-2 (3,2) carries a picture rail this house does not have, and walls-3 (3,10) is raised
// panelling, which is a fifty-year-old room pretending.
//
// `Living room/4.png` is the floors and the kitchen. It is the only sheet in the library with
// **mid-century domestic flooring** — basketweave parquet at (4,4) and two patterned vinyl tiles at
// (6,0) and (6,4) — and the only one with appliances in **mint green**, which is the single
// strongest 1957 signal the whole art library can make. The terms sheet promises "automatic washing
// machine, electric range and refrigerator included in the price"; two of those three are stamped
// in this room, in the colour the advertising used.
//
// `Living room/1.png` is everything a person sits on, sleeps in or walks through. Every entry below
// was measured with `scripts/assets/lib/sprite-geometry.js` before it was named, and the heights are
// the measured ones rather than the tidy ones — `sofaCream` is **h1**, not h2, because a sofa seen
// from twenty degrees above is short. Four candidates from `Living room/2.png` were dropped for the
// opposite reason: (0,1) and (2,2) are drawn touching their neighbours, so no whole-tile rect can
// take one without taking a slice of the next, which is the `farm/6.png` defect that
// `derived-objects.manifest.js` exists to record.
//
// ## What is deliberately not in here
//
// **No fireplace.** `Living room/6.png` has a brick chimney breast and it is a better-looking object
// than anything below. Eleven thousand nine hundred and ninety dollars on a concrete slab did not
// buy one.
//
// **No television.** (12,8) on this sheet is a low console that would read as one. A set was a
// separate purchase in 1957 and the sheet's list of inclusions is exact; adding one would quietly
// contradict the document the room exists to hand over.
//
// **No wall art, no photographs, no personal object of any kind.** Nobody lives here. The room is
// furnished and unoccupied, and the absence is the thing a player should feel before they read
// anything.
//
// Bundle cost: **1.49 MB across three sheets, all new.** The lending office next door adds nothing
// at all — it is on two sheets four other interiors already carry.

import { tile } from "../canonical-palette.js";

const WALLS = "Living room/Auto-tile-A4-walls-3.png";
const KITCHEN = "Living room/4.png";
const HOUSE = "Living room/1.png";

export default {
  id: "fairmeadow-model-house",
  period: 8,
  status: "live",
  map: "apps/web/src/content/maps/fairmeadow-model-house.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes.
  sheets: [
    { path: WALLS, name: "living-room-walls3" },
    { path: KITCHEN, name: "living-room-4" },
    { path: HOUSE, name: "living-room-1" },
  ],

  tiles: {
    // --- the shell, as whole authored 2x2 blocks ---------------------------------------------------
    /**
     * Warm ivory paint between two dark red-brown trim bands — a cornice above and a baseboard
     * below. Goes on `structures` over floor, never on `ground`: the block's bottom pixel row is
     * transparent, the property every interior wall in this repo relies on. [measured: terrain]
     *
     * (13,6) was here first and is flatter and truer — plain cream over one thin baseboard, which is
     * exactly what a slab-on-grade tract house had. It was replaced after the render for a reason
     * worth keeping: this room's floor is basketweave parquet, whose own brown frames sit at almost
     * the same value as that wall, so the outer walls and the partitions stopped reading as walls at
     * all and the whole plan blurred into one grid. Richmond's counting room does not have that
     * problem because its wainscot carries a dark dado. Two trim bands buy the same separation.
     * **The more accurate wall made an illegible room**, which is a trade this file should state
     * rather than quietly make.
     */
    wall: tile(WALLS, 8, 14, { h: 2, w: 2 }),
    /**
     * Glazed white tile with a dark grout line — the bathroom, and only the bathroom. The one place
     * in the house where the wall material changes, which is how a room three tiles wide reads as a
     * different room without a partition round it. [measured: terrain]
     */
    wallTiled: tile(WALLS, 3, 4, { h: 2, w: 2 }),

    /** Basketweave parquet. The living room, the hall and the bedrooms. [measured: terrain] */
    floorParquet: tile(KITCHEN, 4, 4, { h: 2, w: 2 }),
    /**
     * Patterned vinyl tile, slate-blue and cream diamonds — the kitchen and the dinette. Sampled at
     * `#838592`: blue channel highest with red and green level, so it is a neutral blue-grey and
     * nowhere near the band `MERIDIAN-VISUAL-IDENTITY.md` §3 reserves. [measured: terrain]
     */
    floorVinyl: tile(KITCHEN, 6, 0, { h: 2, w: 2 }),
    /** The paler figured vinyl — the bathroom floor, under the tiled wall. [measured: terrain] */
    floorVinylPale: tile(KITCHEN, 6, 4, { h: 2, w: 2 }),

    // --- the way in and the light ------------------------------------------------------------------
    /** The front door: a wood leaf with a nine-light glazed top. The way back out. [measured] */
    frontDoor: tile(HOUSE, 6, 8, { h: 2 }),
    /** A plain painted interior leaf, 1 col. The bathroom and the linen press. [measured] */
    interiorDoor: tile(HOUSE, 6, 7, { h: 2 }),
    /** The picture window, 2 cols — the living room's whole south wall in one object. [measured] */
    pictureWindow: tile(HOUSE, 0, 14, { h: 2, w: 2 }),
    /** A wood-framed casement, 1 col. Bedrooms and kitchen. [measured] */
    window: tile(HOUSE, 2, 14, { h: 2 }),

    // --- the kitchen -------------------------------------------------------------------------------
    /** Electric range in mint green. Included in the price; see the header. [measured] */
    rangeMint: tile(HOUSE, 2, 9, { h: 2 }),
    /** Refrigerator in mint green, the pair to it. [measured] */
    fridgeMint: tile(HOUSE, 2, 11, { h: 2 }),
    /** Sink base with a mixer tap, 1 col. [measured] */
    sinkBase: tile(HOUSE, 2, 10, { h: 2 }),
    /** Extractor hood over the range, 1x1 — hangs on the wall band, not the floor. [measured] */
    rangeHood: tile(HOUSE, 0, 9),
    /** A run of wall cabinets, tileable across four columns. [measured: terrain] */
    wallCabinets: tile(KITCHEN, 0, 3, { h: 2, w: 4 }),
    /** Toaster, 1x1 — the one loose object in the kitchen, and it is an appliance. [measured] */
    toaster: tile(KITCHEN, 14, 0),

    // --- the living room ----------------------------------------------------------------------------
    /** Three-seat sofa in cream, 2 cols x 1 row. The measured height, not the tidy one. [measured] */
    sofa: tile(HOUSE, 2, 0, { w: 2 }),
    /** Its matching armchair, 1x1. Two of them, either side. [measured] */
    armchair: tile(HOUSE, 2, 2),
    /** The second armchair, drawn facing the other way. [measured] */
    armchairAlt: tile(HOUSE, 2, 3),
    /**
     * A long low coffee table in walnut, 2 cols x 1 row.
     *
     * (4,2) was declared here first, measured **clean**, and is a **second brown sofa** — the sheet
     * stacks a three-seater directly above the table and the classifier has no opinion about what a
     * shape is. The render caught it. Nothing in the tooling can catch this class of error and
     * nothing should try; look at the room. [measured]
     */
    coffeeTable: tile(HOUSE, 5, 2, { w: 2 }),
    // (12,8) is not here, and the header's "no television" line is why. It is catalogued as a low
    // console and it **renders as a television**: two blue-grey glazed panels in a walnut case, at
    // sprite scale indistinguishable from a 1957 set in a cabinet. Stamped in the hall it quietly
    // contradicted the one document this room exists to hand over, whose list of inclusions is
    // exact and does not include a set. The render is what caught it.
    /** A small occasional table, 2 cols x 1 row. [measured] */
    sideTable: tile(HOUSE, 12, 4, { w: 2 }),
    /** A plain bench, 2 cols x 1 row — the dinette's seating, and the hall's. [measured] */
    bench: tile(HOUSE, 14, 4, { w: 2 }),
    /** A dark dining table, 2x2 — the dinette, so it is not the card table twice. [measured] */
    dinetteTable: tile(HOUSE, 0, 4, { h: 2, w: 2 }),
    /** A round stool, 1x1. [measured] */
    stool: tile(HOUSE, 14, 3),
    /** Open shelving, 1 col. Empty, and it stays empty. [measured] */
    shelf: tile(HOUSE, 8, 13, { h: 2 }),
    /**
     * A light-wood folding table, 2x2. **This is the card table**, and the terms sheets are stacked
     * on it — `record: "A single printed sheet from a stack on a card table in the model house"`.
     * The one piece of furniture in the house that is not for sale. [measured]
     */
    cardTable: tile(HOUSE, 2, 4, { h: 2, w: 2 }),
    /** A filled bookcase, 1 col. Staging: the shelves came with the house, the books did not. */
    bookcase: tile(HOUSE, 8, 10, { h: 2 }),
    /** A potted palm, 1 col — the sales office's own, moved in for the open house. [measured] */
    plant: tile(HOUSE, 0, 12, { h: 2 }),
    /** A smaller pot, 1x1. [measured] */
    plantSmall: tile(HOUSE, 5, 10),

    // --- the bedrooms ---------------------------------------------------------------------------------
    /** The double bed, 2x2. [measured] */
    bedDouble: tile(HOUSE, 10, 8, { h: 2, w: 2 }),
    /** A single bed with a red coverlet, 1 col. [measured] */
    bedSingle: tile(HOUSE, 12, 6, { h: 2 }),
    // There is no second single-bed pattern, and the third bedroom repeats `bedSingle` — which is
    // what a builder furnishing two children's rooms out of one order actually did.
    //
    // The sheet's other single at (12,7) was declared here and dropped after the render: at h3 the
    // rect reaches (14,7) and stamps a **cooking pot** at the foot of the bed, and at h2 it measures
    // `clipped`. That is the `farm/6.png` defect exactly — connected ink across a tile boundary.
    /** Nightstand, 1x1. [measured] */
    nightstand: tile(HOUSE, 10, 10),
    /**
     * A wardrobe, 1 col. Two side by side are a bedroom's storage wall.
     *
     * This replaced a "closet" entry at (6,10) that the render exposed as a **glazed panel door**:
     * two of them stamped against a bedroom's north wall read as a pair of doors opening onto the
     * garden, in a room whose north wall is the outside of the house. [measured]
     */
    wardrobe: tile(HOUSE, 8, 8, { h: 2 }),

    // --- the bathroom -----------------------------------------------------------------------------------
    /** Close-coupled pan, 1 col. One bath; the sheet says so. [measured] */
    toilet: tile(HOUSE, 8, 0, { h: 2 }),
    /** Vanity basin with a mirror over it, 1 col. [measured] */
    vanity: tile(HOUSE, 8, 2, { h: 2 }),
    /** The tub, 2x2. [measured] */
    bath: tile(HOUSE, 10, 4, { h: 2, w: 2 }),
  },
};
