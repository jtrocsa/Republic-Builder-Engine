// Palette for archive-room.tmj — the Institute Archive Room, the present-day hub interior next
// door to the Main Hall. Consumed by scripts/generate-archive-room-tmj.js.
//
// Why Medieval Tavern furniture dresses a present-day archive: decision log 0030. It is a
// deliberate, documented choice, not a placeholder. `Modern Interiors` was evaluated and
// rejected for a real technical reason (off-grid sheets the loader cannot address), and this
// catalog re-measured and confirmed that.
//
// Restyle candidate, NOT actioned here: office/3.png's double-sided library shelving and
// office/4.png's dark wood-panelled walls, plus 19th Century European City/tile-B-04.png's
// Victorian parquet and filled bookcases, would give the Institute a period-appropriate
// scholarly interior. That is a visual redesign with its own sign-off, not a side effect of
// naming tiles — see the catalog's `office` section.
//
// ## Phase 58: the same cells as the Main Hall, and measured footprints
//
// This file used to name a *different* subset of the same three sheets than
// institute-hall.palette.js, declare no `{ h, w }` anywhere, and pass sizes as bare literals at the
// generator's `gidRect(entry, 4, 2)` call sites. Three consequences, all of them visible in the
// shipped room:
//
//   - `recordShelf` / `recordRack` / `recordCanisters` were stamped 4 rows tall. tile-B-03 stacks
//     **two complete 2x2 units** per column pair with no transparent gutter, so each of the three
//     drew a whole second shelf unit below itself.
//   - `plantA` / `plantB` were stamped 2 wide. Every plant on that sheet is 1 wide, so both drew
//     one plant plus half of the next one along.
//   - `wallTorch` pointed at tile-B-03 (1,9), which is the *bottom half* of a 2-row sconce.
//
// None of it could fail a test: tile-footprints.test.js checks a declared footprint against the
// pixels, and nothing was declared. Every entry below carries its measured `{ h, w }`, so that guard
// now covers this room too.
//
// Where the two Institute interiors share a piece of furniture they now name the identical sheet
// cell — deliberately, so the rooms read as one building rather than merely as one art pack. Keep
// them in sync by hand rather than importing the hall's palette: these are two maps with two sheet
// orders, and a shared module would make a GID in one room depend on an edit in the other.
//
// Measured with:
//   npm run assets:measure -- "Medieval Tavern/tile-B-03.png" 10 4
// though note that on this sheet the connected-ink bounding box over-reports whenever two units
// abut, which is exactly how the 4-row shelves got in. Read the label render when it disagrees:
//   npm run assets:label -- "Medieval Tavern/tile-B-03.png"

import { CANONICAL, tile } from "../canonical-palette.js";
import { InstituteFurnishings } from "../derived-objects.coords.js";

export default {
  id: "archive-room",
  period: null, // present-day hub
  status: "live",
  map: "apps/web/src/content/maps/archive-room.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes. The first three match institute-hall.palette.js's order exactly; the
  // walls sheet is new here (the room had no walls at all before Phase 58).
  sheets: [
    { path: "Medieval Tavern/tile-B-01.png", name: "medieval-tavern-b01" },
    { path: "Medieval Tavern/tile-B-03.png", name: "medieval-tavern-b03" },
    { path: "Medieval Tavern/tile-B-05.png", name: "medieval-tavern-b05" },
    { path: "Medieval Tavern/Auto-tile-A4-walls-2.png", name: "medieval-tavern-walls-2" },
    // Appended last, deliberately: firstgid is assigned in this order, so a new sheet anywhere
    // earlier would renumber every GID already committed to archive-room.tmj.
    { path: "derived/institute-furnishings.png", name: "institute-furnishings" },
  ],

  tiles: {
    // --- terrain, as whole authored 2x2 blocks -------------------------------------------------
    // MapBuilder.groundBlock() tiles all four quadrants in their authored arrangement. The retired
    // generator instead picked one of four single quadrants per cell by `(col * 3 + row * 5) % 4`,
    // which is the same "scatter a quadrant of a block" mistake Phase 52 found on the field maps:
    // these four cells were drawn to sit together, so shuffling them reads as a quilt.
    /** Grey flagstone — the room's main floor. Same cell as the Main Hall's. */
    floorStone: { ...CANONICAL["floor.archive.stone"], h: 2, w: 2 },
    /** Warm plank flooring — the door runner and the east records alcove. */
    floorWood: { ...CANONICAL["floor.institute.wood"], h: 2, w: 2 },
    /** Tan cut stone — the west hearth nook. */
    floorSandstone: { ...CANONICAL["floor.institute.sandstone"], h: 2, w: 2 },
    /** Wood-panelled wall surface. Full-bleed, so it paves any wall run without corner tiles. */
    wallPanel: { ...CANONICAL["wall.interior.plank"], h: 2, w: 2 },
    /** Grey masonry wall, for the archway reveals either side of the doorway. */
    wallStone: { ...CANONICAL["wall.interior.stone"], h: 2, w: 2 },

    // --- doorway ---------------------------------------------------------------------------------
    /** Plank door leaf, 2 rows x 1 col. Two side by side read as double doors. [measured] */
    door: tile("Medieval Tavern/tile-B-05.png", 10, 8, { h: 2 }),

    // --- record storage --------------------------------------------------------------------------
    /** Tall carved cabinet, four fronts so a long run doesn't read as one tile repeated. [measured] */
    cabinetA: tile("Medieval Tavern/tile-B-03.png", 12, 0, { h: 2, w: 2 }),
    cabinetB: tile("Medieval Tavern/tile-B-03.png", 12, 2, { h: 2, w: 2 }),
    cabinetC: tile("Medieval Tavern/tile-B-03.png", 12, 4, { h: 2, w: 2 }),
    cabinetD: tile("Medieval Tavern/tile-B-03.png", 12, 6, { h: 2, w: 2 }),
    /** Low chest/press, waist height. [measured] */
    chestA: tile("Medieval Tavern/tile-B-03.png", 14, 0, { h: 2, w: 2 }),
    chestB: tile("Medieval Tavern/tile-B-03.png", 14, 4, { h: 2, w: 2 }),
    /** Open shelving stacked with sealed record bottles. [measured] */
    recordShelf: tile("Medieval Tavern/tile-B-03.png", 2, 8, { h: 2, w: 2 }),
    recordShelfAlt: tile("Medieval Tavern/tile-B-03.png", 4, 8, { h: 2, w: 2 }),
    /** Lattice-fronted rack — reads as archive pigeonholes. [measured] */
    pigeonholeUpper: tile("Medieval Tavern/tile-B-03.png", 2, 10, { h: 2, w: 2 }),
    pigeonholeLower: tile("Medieval Tavern/tile-B-03.png", 4, 10, { h: 2, w: 2 }),
    /** Barrel rack — reads as sealed record canisters. [measured] */
    recordCanisters: tile("Medieval Tavern/tile-B-03.png", 2, 12, { h: 2, w: 2 }),
    /** Shorter wall shelves of jars, pots and flasks — preserved-sample storage. [measured] */
    sampleShelfA: tile("Medieval Tavern/tile-B-05.png", 8, 0, { h: 2, w: 2 }),
    sampleShelfC: tile("Medieval Tavern/tile-B-05.png", 8, 4, { h: 2, w: 2 }),

    // --- working furniture ------------------------------------------------------------------------
    /**
     * Writing desk with its chair — the Archive Terminal the player walks up to. Nothing in this
     * sheet family reads as a console, and a desk where a Chronicler sits and writes is closer to
     * what the screen it opens actually is (the unit's SAQ/DBQ work) than a console would be.
     * [measured]
     */
    writingDesk: tile("Medieval Tavern/tile-B-03.png", 10, 4, { h: 2, w: 2 }),
    /** Long dark table for the transcription bench, 2 rows x 4 cols. [measured] */
    intakeTable: tile("Medieval Tavern/tile-B-01.png", 4, 8, { h: 2, w: 4 }),
    /** Long plain table, 2 rows x 4 cols. [measured] */
    readingTable: tile("Medieval Tavern/tile-B-05.png", 10, 4, { h: 2, w: 4 }),
    /** Round side table. Note this is tile-B-01's, not tile-B-03 (10,6) — that one has a roast
     *  dinner painted on it, which is the "no overtly tavern-specific props" rule. [measured] */
    roundTable: tile("Medieval Tavern/tile-B-01.png", 8, 12, { h: 2, w: 2 }),
    /** Seating, generated for this game rather than borrowed — see derived-objects.manifest.js.
     *  The pack's own stool is painted 45px tall, exactly a character's standing body; these are
     *  19px and 13px, which is what a stool and a bench are next to a person. [derived] */
    lowBench: { ...InstituteFurnishings.lowBench },
    stool: { ...InstituteFurnishings.stool },
    stoolAlt: { ...InstituteFurnishings.stoolAlt },
    /** Stone hearth with a lit fire. [measured] */
    fireplace: tile("Medieval Tavern/tile-B-03.png", 10, 14, { h: 2, w: 2 }),

    // --- dressing ---------------------------------------------------------------------------------
    // Institute colours: the gold and navy pennants, not tile-B-03 (0,12)'s heraldic
    // crossed-swords/lion pair the retired palette used.
    /** Gold pennant. [measured] */
    bannerGold: tile("Medieval Tavern/tile-B-03.png", 0, 10, { h: 2 }),
    /** Navy pennant. [measured] */
    bannerNavy: tile("Medieval Tavern/tile-B-03.png", 0, 11, { h: 2 }),
    /** Lit wall torch, 1x1 — cleaner than tile-B-03's sconce, which is 2 rows at (0,9). The retired
     *  palette pointed at (1,9), i.e. that sconce's bottom half on its own. [measured] */
    wallTorch: tile("Medieval Tavern/tile-B-05.png", 8, 12),
    /** Wall bracket with candles. [measured] */
    wallSconce: tile("Medieval Tavern/tile-B-05.png", 10, 12),
    /** Tall potted greenery, 1 col — stamped `base`, so the player walks behind the foliage.
     *  [measured] */
    plantTall: tile("Medieval Tavern/tile-B-03.png", 6, 9, { h: 2 }),
    plantPotted: tile("Medieval Tavern/tile-B-03.png", 6, 12, { h: 2 }),
    /** Woven rugs, 1 row x 2 cols. [measured] */
    rugRed: tile("Medieval Tavern/tile-B-03.png", 14, 10, { w: 2 }),
    rugGreen: tile("Medieval Tavern/tile-B-03.png", 15, 8, { w: 2 }),
  },
};
