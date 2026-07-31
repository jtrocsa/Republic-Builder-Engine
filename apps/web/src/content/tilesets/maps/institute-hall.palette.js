// Palette for institute-hall.tmj — the Chronicle Institute's Main Hall, the present-day hub the
// player returns to between Chronotravel runs. Consumed by scripts/generate-institute-hall-tmj.js.
//
// Until Phase 54 the Main Hall was the one screen in the game that was not built from the tile
// library at all: a single hand-drawn `chronicle-institute-hub.png` stretched behind
// percentage-positioned CSS buttons. It read as a floor-plan diagram rather than as a room, and it
// could not gain walk-behind depth, generated collision, or a camera. This palette is what replaced
// it — see docs/decision-log/0037-institute-hall-tiled-rebuild.md.
//
// Sheet family: **Medieval Tavern**, the same three sheets the Archive Room and the onboarding
// hallway already draw from, so the three Institute interiors read as one building and Vite bundles
// no additional art for two of them. Decision log 0030 records why a medieval-tavern pack dresses a
// present-day archive, and the alternative (`office/3` + `office/4` + `19th Century European
// City/tile-B-04`) is a whole-Institute restyle with its own sign-off — taking it here would leave
// the Main Hall and the Archive Room next door in two different visual languages.
//
// Two additions beyond that family:
//
//   Auto-tile-A4-walls-2  full-bleed wall surfaces. The room has real walls, which the Archive Room
//                         does not — there, the perimeter is implied by furniture runs. Only the
//                         flat surface rows are used; the A4 corner/edge blob set is deliberately
//                         untouched, because a full-bleed material tiles correctly in every
//                         direction without it (the same property that lets Philadelphia's cobble
//                         pave an arbitrary shape).
//   Island survival/5     exactly three Institute artifacts, all with transparent surrounds: the
//                         compass-rose Navigation Table, a brass compass, and the display plinth
//                         the Preservation Case sits on. Nothing in the Medieval Tavern family
//                         reads as navigation or as a museum case — the closest candidates are a
//                         tavern bar and a wine rack. This is the same narrow, prop-only borrow the
//                         Caribbean palette already makes for Medieval harbor's ship hulls, and the
//                         chart table on this very sheet is already live on the Caribbean map.
//
// Every footprint below is measured, not declared:
//   npm run assets:measure -- "Medieval Tavern/tile-B-03.png" 12 0
// and tests/unit/tile-footprints.test.js fails the build if one drifts from the pixels.

import { CANONICAL, tile } from "../canonical-palette.js";
import { InstituteArtifacts, InstituteFurnishings } from "../derived-objects.coords.js";

export default {
  id: "institute-hall",
  period: null, // present-day hub
  status: "live",
  map: "apps/web/src/content/maps/institute-hall.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes.
  sheets: [
    { path: "Medieval Tavern/tile-B-01.png", name: "medieval-tavern-b01" },
    { path: "Medieval Tavern/tile-B-03.png", name: "medieval-tavern-b03" },
    { path: "Medieval Tavern/tile-B-05.png", name: "medieval-tavern-b05" },
    { path: "Medieval Tavern/Auto-tile-A4-walls-2.png", name: "medieval-tavern-walls-2" },
    { path: "Island survival/5.png", name: "island-survival-05" },
    // Appended last, deliberately: firstgid is assigned in this order, so a new sheet anywhere
    // earlier would renumber every GID already committed to institute-hall.tmj.
    { path: "derived/institute-artifacts.png", name: "institute-artifacts" },
    { path: "derived/institute-furnishings.png", name: "institute-furnishings" },
  ],

  tiles: {
    // --- terrain, as whole authored 2x2 blocks -------------------------------------------------
    // MapBuilder.groundBlock() tiles all four quadrants in their authored arrangement; naming a
    // single quadrant and scattering it is what made the field maps read as patchwork in Phase 52.
    /** Grey flagstone — the hall's main floor. */
    floorStone: { ...CANONICAL["floor.archive.stone"], h: 2, w: 2 },
    /** Warm plank flooring — the foyer runner and the Navigation Table dais, for visual zoning. */
    floorWood: { ...CANONICAL["floor.institute.wood"], h: 2, w: 2 },
    /** Tan cut stone — the Preservation Case alcove. Note this is `floor.institute.sandstone`, not
     *  `floor.archive.sandstone`: the latter's name is a misnomer for plank wood, so using it here
     *  would have painted the alcove and the dais in the same material. */
    floorSandstone: { ...CANONICAL["floor.institute.sandstone"], h: 2, w: 2 },
    /** Wood-panelled wall surface. Full-bleed, so it paves any wall run without corner tiles. */
    wallPanel: { ...CANONICAL["wall.interior.plank"], h: 2, w: 2 },
    /** Grey masonry wall, for the archway reveals either side of a doorway. */
    wallStone: { ...CANONICAL["wall.interior.stone"], h: 2, w: 2 },

    // --- doorways -------------------------------------------------------------------------------
    /** Plank door leaf, 2 rows x 1 col. Two side by side read as double doors. [measured] */
    door: tile("Medieval Tavern/tile-B-05.png", 10, 8, { h: 2 }),

    // --- record storage: the shelving runs that make the room a hall rather than a box -----------
    /** Tall carved cabinet, four fronts so a long run doesn't read as one tile repeated. [measured] */
    cabinetA: tile("Medieval Tavern/tile-B-03.png", 12, 0, { h: 2, w: 2 }),
    cabinetB: tile("Medieval Tavern/tile-B-03.png", 12, 2, { h: 2, w: 2 }),
    cabinetC: tile("Medieval Tavern/tile-B-03.png", 12, 4, { h: 2, w: 2 }),
    cabinetD: tile("Medieval Tavern/tile-B-03.png", 12, 6, { h: 2, w: 2 }),
    /** Low chest/press, waist height. [measured] */
    chestA: tile("Medieval Tavern/tile-B-03.png", 14, 0, { h: 2, w: 2 }),
    chestB: tile("Medieval Tavern/tile-B-03.png", 14, 4, { h: 2, w: 2 }),
    // The sheet stacks two complete shelf units per column pair — rows 2-3 and rows 4-5 — with no
    // transparent gutter between them, so each unit is 2x2. Declaring 3 rows (which is what
    // `assets:measure`'s connected-ink bounding box reports, because it merges the abutting pair)
    // draws the top course of the unit below; tests/unit/tile-footprints.test.js catches it.
    /** Lattice-fronted rack — reads as archive pigeonholes. [measured] */
    pigeonholeUpper: tile("Medieval Tavern/tile-B-03.png", 2, 10, { h: 2, w: 2 }),
    pigeonholeLower: tile("Medieval Tavern/tile-B-03.png", 4, 10, { h: 2, w: 2 }),
    /** Open shelving stacked with sealed record bottles. [measured] */
    recordShelf: tile("Medieval Tavern/tile-B-03.png", 2, 8, { h: 2, w: 2 }),
    recordShelfAlt: tile("Medieval Tavern/tile-B-03.png", 4, 8, { h: 2, w: 2 }),
    /** Shorter wall shelves of jars, pots and flasks — preserved-sample storage. [measured] */
    sampleShelfA: tile("Medieval Tavern/tile-B-05.png", 8, 0, { h: 2, w: 2 }),
    sampleShelfB: tile("Medieval Tavern/tile-B-05.png", 8, 2, { h: 2, w: 2 }),
    sampleShelfC: tile("Medieval Tavern/tile-B-05.png", 8, 4, { h: 2, w: 2 }),

    // --- working furniture ----------------------------------------------------------------------
    /** Long plain table, 2 rows x 4 cols — the reading hall's transcription bench. [measured] */
    readingTable: tile("Medieval Tavern/tile-B-05.png", 10, 4, { h: 2, w: 4 }),
    /** Shorter side table, 2 rows x 3 cols. [measured] */
    sideTable: tile("Medieval Tavern/tile-B-05.png", 10, 0, { h: 2, w: 3 }),
    /** Long dark table for the intake bench, 2 rows x 4 cols. [measured] */
    intakeTable: tile("Medieval Tavern/tile-B-01.png", 4, 8, { h: 2, w: 4 }),
    /** Backless bench, 2 rows x 4 cols. [measured] */
    bench: tile("Medieval Tavern/tile-B-01.png", 0, 8, { h: 2, w: 4 }),
    /** Round side table. [measured] */
    roundTable: tile("Medieval Tavern/tile-B-01.png", 8, 12, { h: 2, w: 2 }),
    /** Seating, generated for this game rather than borrowed — see derived-objects.manifest.js.
     *  The pack's own stool is painted 45px tall, exactly a character's standing body; these are
     *  19px and 13px, which is what a stool and a bench are next to a person. [derived] */
    lowBench: { ...InstituteFurnishings.lowBench },
    stool: { ...InstituteFurnishings.stool },
    stoolAlt: { ...InstituteFurnishings.stoolAlt },

    // --- Institute artifacts, from Island survival/5 ---------------------------------------------
    /**
     * The Navigation Table: a stone table with a compass rose and constellation chart engraved into
     * its top. This is the object the whole hub points at — the player walks to it to open the
     * Chronicle Navigation Table screen — and it is the reason this sheet is in the palette at all.
     * [measured]
     */
    navigationTable: tile("Island survival/5.png", 8, 5, { h: 2, w: 3 }),
    /**
     * Brass mariner's compass, repacked down to 1x1 so it sits *on* the Navigation Table as an
     * instrument. The source art is 2x2 — 96px, about the player's own height — and standing it on
     * the floor beside the table put a human-sized compass in the middle of the hall's main aisle,
     * where it was both absurd and one of the collisions the playtest report marked. Rescaled by
     * scripts/assets/pack-objects.js, which is also why it comes from the derived sheet rather than
     * from `Island survival/5` directly.
     */
    compassSmall: InstituteArtifacts.compassSmall,
    /** Stone plinth holding a lit artifact — the Preservation Case's display stand. [measured] */
    preservationPlinth: tile("Island survival/5.png", 8, 8, { h: 2, w: 2 }),
    /** Carved stone stela, the Institute's founding marker. [measured] */
    foundingStela: tile("Island survival/5.png", 0, 10, { h: 3, w: 2 }),

    // --- dressing -------------------------------------------------------------------------------
    // Institute colours: the gold and navy pennants, not the heraldic lion/crown pair.
    /** Gold pennant. [measured] */
    bannerGold: tile("Medieval Tavern/tile-B-03.png", 0, 10, { h: 2 }),
    /** Navy pennant. [measured] */
    bannerNavy: tile("Medieval Tavern/tile-B-03.png", 0, 11, { h: 2 }),
    /** Lit wall torch, 1x1 — cleaner than tile-B-03's sconce, which is 2 rows at (0,9). [measured] */
    wallTorch: tile("Medieval Tavern/tile-B-05.png", 8, 12),
    /** Wall bracket with candles. [measured] */
    wallSconce: tile("Medieval Tavern/tile-B-05.png", 10, 12),
    /** Tall potted greenery — stamped `base`, so the player walks behind the foliage. [measured] */
    plantTall: tile("Medieval Tavern/tile-B-03.png", 6, 9, { h: 2 }),
    plantPotted: tile("Medieval Tavern/tile-B-03.png", 6, 12, { h: 2 }),
    /** Woven rugs, 1 row x 2 cols. [measured] */
    rugRed: tile("Medieval Tavern/tile-B-03.png", 14, 10, { w: 2 }),
    rugBlue: tile("Medieval Tavern/tile-B-03.png", 14, 12, { w: 2 }),
    rugGreen: tile("Medieval Tavern/tile-B-03.png", 15, 8, { w: 2 }),
  },
};
