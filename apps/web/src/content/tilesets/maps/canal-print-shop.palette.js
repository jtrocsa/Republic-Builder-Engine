// Palette for canal-print-shop.tmj — the printing office on Canal Crossroads' Market Street, and
// the first field interior any map opens into. Consumed by scripts/generate-canal-print-shop-tmj.js.
//
// The room is a partisan newspaper office and a jobbing shop in one, which is what an 1845 country
// printer actually was: the same press that struck Josiah Pike's Democratic sheet on Thursday ran a
// temperance pledge, a canal company's freight schedule and a sheriff's sale notice the rest of the
// week. The furniture has to carry that — an editor's desk *and* a working press floor, not a
// gentleman's study.
//
// ## Four decisions taken against a rendered preview rather than against the plan
//
// **Four objects here are commissioned, and each one was searched for first.** The press, the
// compositor's case, the stove and the paper stack; provenance and what was rejected for each are
// in derived-objects.manifest.js. Two of them replaced library tiles that were already stamped and
// then read wrong in the preview: `19th Century European City/tile-B-02` (8,14), catalogued as a
// hearth, renders as a small wall dresser, and tile-B-04 (12,6) reads unmistakably as stacked
// travelling luggage rather than as bales of paper. Both were caught by looking at
// `node scripts/assets/preview-map.js`'s output, not by reading the sheet.
//
// **The walls are plaster and the floor is boards, because the first pass made them the same
// thing.** The obvious choice was tile-B-04's panelled wainscot at (4,8) — the best-looking wall on
// the sheet — over the plank floor at (0,6). Rendered, the room was one continuous field of dark
// brown: the wall and the floor are the same timber at the same value, so the room had no edges. It
// is also the wrong register. Panelled mahogany is a gentleman's study; a country jobbing shop is
// whitewash and bare board, so the walls are the buff plaster at (4,2) and the contrast comes for
// free with the accuracy.
//
// **Every wall block carries one fully transparent bottom pixel row** (measured: 1.0% of a 2x2 at
// (4,0) and (4,2), all of it in that single row). On the `ground` layer that is a hole through to
// the page — a 1px black line under every wall tile, the same defect that shipped down a hundred
// tiles of canal bank in Phase 3. So the generator paints floor wall-to-wall on `ground` and puts
// the wall blocks on `structures` over it, with their collision declared as plain rects. The floor
// blocks themselves measure 0.0% and are safe where they are.
//
// **No framed art on the walls.** tile-B-04's two paintings at (12,8) and (12,9) are the Mona Lisa
// and a Renaissance portrait, rendered legibly enough to name at 1x. They are barred from every map
// in this repo, not merely from this one.
//
// Measured with `npm run assets:measure` and read off `npm run assets:label -- "<sheet>"`; the
// labelled grids live in gitignored reports/assets/labeled/.

import { tile } from "../canonical-palette.js";
import { CanalWorks } from "../derived-objects.coords.js";

export default {
  id: "canal-print-shop",
  period: 4,
  status: "live",
  map: "apps/web/src/content/maps/canal-print-shop.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes. tile-B-04 carries the whole room bar the seating and the stove; B-02 is
  // here only for those two, and both sheets are already bundled by nothing else, so this map pays
  // for them once and the tavern next door reuses them for free.
  sheets: [
    { path: "19th Century European City/tile-B-04.png", name: "european-city-b04" },
    { path: "19th Century European City/tile-B-02.png", name: "european-city-b02" },
    { path: "derived/canal-works.png", name: "derived-canal-works" },
  ],

  tiles: {
    // --- floors and walls, as whole authored 2x2 blocks ------------------------------------------
    /** Plain plank boards — the press floor and both aisles. 0.0% transparent. [measured] */
    floorPlank: tile("19th Century European City/tile-B-04.png", 0, 6, { h: 2, w: 2 }),
    /** Warm herringbone parquet — the editor's corner only. 0.0% transparent. [measured] */
    floorParquet: tile("19th Century European City/tile-B-04.png", 0, 0, { h: 2, w: 2 }),
    /** Buff plaster — the shop's walls. Goes on `structures`; see the header. [measured] */
    wallPlaster: tile("19th Century European City/tile-B-04.png", 4, 2, { h: 2, w: 2 }),
    /** Red brick, for the stove wall and the reveals either side of the doorway. [measured] */
    wallBrick: tile("19th Century European City/tile-B-04.png", 4, 0, { h: 2, w: 2 }),
    /** A worn patterned rug, under the editor's desk. [measured] */
    rug: tile("19th Century European City/tile-B-04.png", 2, 10, { h: 2, w: 2 }),

    // --- the way out -----------------------------------------------------------------------------
    /** Panelled door leaf. Two side by side read as the shop's street door. [measured] */
    door: tile("19th Century European City/tile-B-04.png", 6, 2, { h: 2, w: 2 }),
    /** Sash window, 1 col. The press floor needs north light and printers said so constantly. */
    window: tile("19th Century European City/tile-B-04.png", 6, 11, { h: 2 }),

    // --- the trade ---------------------------------------------------------------------------------
    /**
     * The iron hand press. Commissioned; see derived-objects.manifest.js. Stamped `solid` rather
     * than `base` — a press is against a wall with no walkable ground behind it, so lifting its
     * upper rows to the overlay would only let a player stand inside the frame.
     * [derived, 2 cols x 3 rows]
     */
    press: { ...CanalWorks.press },
    /** Sloped compositor's case of lead type. Commissioned. [derived, 2x2] */
    typeCase: { ...CanalWorks.typeCase },
    /** Corded bundles of printing sheets on a pallet. Commissioned. [derived, 2x2] */
    paperStack: { ...CanalWorks.paperStack },
    /** Tall press cupboard — where pulled sheets dry and proofs are kept. [measured] */
    proofCupboard: tile("19th Century European City/tile-B-02.png", 0, 8, { h: 2, w: 2 }),
    /** A plain heavy table — the imposing surface a forme is locked up on. [measured] */
    imposingTable: tile("19th Century European City/tile-B-02.png", 14, 4, { h: 2, w: 2 }),

    // --- the editor's corner -----------------------------------------------------------------------
    /** Writing desk with quill and inkstand — Pike's own, and where the job book sits. [measured] */
    editorDesk: tile("19th Century European City/tile-B-04.png", 10, 11, { h: 2, w: 2 }),
    /** Side chair, 1 col. [measured] */
    chair: tile("19th Century European City/tile-B-04.png", 10, 13, { h: 2 }),
    /** Filled bookcase, 2x2 — bound files of the paper's own back numbers. [measured] */
    bookcase: tile("19th Century European City/tile-B-04.png", 10, 6, { h: 2, w: 2 }),
    /** The wider bookcase run, 2 rows x 3 cols. [measured] */
    bookcaseWide: tile("19th Century European City/tile-B-04.png", 10, 8, { h: 2, w: 3 }),
    /** The office safe — subscription money and the shop's notes. 1x1. [measured] */
    safe: tile("19th Century European City/tile-B-04.png", 12, 14),

    // --- the stove and the dressing -----------------------------------------------------------------
    /** Cast-iron box stove with its pipe and a coal scuttle. Commissioned. [derived, 2x2] */
    stove: { ...CanalWorks.stove },
    /** Loose papers, 1x1 — set down wherever there is a flat surface, which is the whole point. */
    papers: tile("19th Century European City/tile-B-04.png", 15, 13),
    /** An open book, 1x1. [measured] */
    openBook: tile("19th Century European City/tile-B-04.png", 15, 14),
    /** Oil lamp, 1x1 — the shop worked past dark. [measured] */
    oilLamp: tile("19th Century European City/tile-B-04.png", 15, 15),
    /** Wall sconce, 1x1. [measured] */
    wallSconce: tile("19th Century European City/tile-B-04.png", 13, 11),
    /** Potted greenery, 1 col — stamped `base`, so the player walks behind the foliage. */
    plantPotted: tile("19th Century European City/tile-B-04.png", 12, 3, { h: 2 }),
  },
};
