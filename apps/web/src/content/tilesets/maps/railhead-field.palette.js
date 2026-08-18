// Palette for railhead-field.tmj (Unit 6's field map, "Cottonwood Junction").
// Setting: a fictional but grounded Kansas railhead on the Neosho, June 1873.
// Consumed by scripts/generate-railhead-tmj.js.
//
// This is the first map in the game drawn from the `Wild West` pack, and the first whose
// organising feature is a line rather than a shore. Five decisions are worth stating, because
// each was arrived at against the art and each changed the layout.
//
// 1. **The track is walkable, and that is a design decision rather than a shortcut.** The pack
//    draws a running line as a horizontal strip that is transparent above and below the ballast,
//    so it cannot go on the ground layer — a transparent pixel there is a hole through to the
//    page. It goes on `structures` as `decor`, which means no collision: a player crosses the
//    line anywhere. Making it solid would cut the map cleanly in half and put the Kanza village
//    behind a wall, and the brief (`THE-MAP-PROGRAM.md` §5) wants the line to divide the map
//    *visually* — town on one side, the people whose land is being sold on the other — while a
//    student can still walk across it. A single-track prairie line in 1873 had no fence and no
//    embankment worth the name. Walking over it is what it was like.
//
// 2. **The depot's bottom row is track, and that is why it lines up.** `tile-B-04` draws the whole
//    trackside as one vertical band: building, platform deck, rails. Measured per pixel row, the
//    rails inside the depot's bottom tile occupy y=26–47 and the standalone running-line tile
//    occupies y=26–47 — the same band, so the two butt together with no seam. That is why the
//    depot is `h: 3` and is anchored two rows above `TRACK_ROW` rather than beside it. The covered
//    platform next to it is `h: 2` and cannot do the same; see its own entry for why.
//
// 3. **No cacti, and the pack is full of them.** Seven of `tile-B-02`'s and `tile-B-04`'s loose
//    props are saguaro and barrel cactus. Kansas tallgrass prairie has neither; this is a place
//    of bluestem, cottonwood along the water, and sunflower. Reaching for the pack's most
//    obviously "western" scatter would put the Sonoran Desert 700 miles east of itself, which is
//    the same class of error as the Chinese work camp `THE-MAP-PROGRAM.md` §5 removed from this
//    unit's brief. The scatter here is farm/6's grass and shrubs instead.
//
// 4. **The town's frontages are the four blank ones, not the signed ones.** `tile-B-02` has
//    twenty-odd storefronts and most carry a painted sign — SALOON, BANK, SHERIFF, HOTEL. A land
//    office with SHERIFF over the door is worse than no building. Four frontages carry no sign at
//    all — `(6,10)`, `(6,12)`, `(10,8)`, `(10,10)` — and those are the land office, the telegraph
//    office, the town-site office and the store. The pens, the hide shed and the stable are drawn
//    from unsigned art for the same reason.
//
// 5. **The pens have no cattle in them, and that is flagged rather than hidden.** The pack draws
//    a corral as a complete enclosure and has no cattle sprite at all; the one animal on these
//    sheets is a horse inside a stable frontage. Empty pens at a railhead in the shipping season
//    is a real loss, and the map carries it because the alternative — no pens — deletes the
//    industry the whole land sale was for. Registered in docs/architecture/art-and-map-style-guide.md.
//
// The creek is the same `Medieval Fishing Village/tile-B-04` water Riverbend and Canal Crossroads
// already use, and the reason it is here at all is the name: cottonwood grows on the plains where
// there is water, a railhead was sited where a locomotive could take water, and the Kanza reserve
// was on the Neosho. One feature doing three jobs.

import { FarmTrees, IndigenousVillage, CivilWarWorks } from "../derived-objects.coords.js";
import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "railhead-field",
  period: 6,
  status: "live",
  map: "apps/web/src/content/maps/railhead-field.tmj",
  // One made surface, and it is the whole answer: a railhead town two years old had no paving
  // anywhere, because the money went into the grade. Every street, every yard, the roadbed either
  // side of the rails and every door spur is the same packed earth.
  //
  // A second, lighter "trampled" ground was tried for the yards and the camp so they would not
  // read as roads, and there is nothing in the library that can be it. `farm/6`'s straw block is a
  // framed field with green edges baked in and tiles as a grid of rectangles; Wild West's own
  // street sand carries a ragged transition edge in its own rows and hitching rails one row below;
  // the dock's packed dirt alternates with stone. The honest reading is that a stock yard and the
  // street were the same dirt, so they are.
  road: ["dirt"],

  // Ordered — reshuffling changes every GID in the committed .tmj.
  // Three of the seven are already bundled by other maps and cost nothing new to the build:
  // farm/6 by Riverbend, the fishing-village water by Riverbend and Canal Crossroads, and the two
  // derived sheets by Riverbend and Richmond.
  sheets: [
    { path: "Wild West/tile-B-04.png", name: "wild-west-b04" },
    { path: "Wild West/tile-B-02.png", name: "wild-west-b02" },
    { path: "Wild West/tile-B-08.png", name: "wild-west-b08" },
    { path: "farm/6.png", name: "farm-6" },
    { path: "Medieval Fishing Village/tile-B-04.png", name: "medieval-fishing-village-b04" },
    { path: "Medieval Fantasy Town/2.png", name: "medieval-fantasy-town-2" },
    { path: "derived/farm-trees.png", name: "derived-farm-trees" },
    { path: "derived/indigenous-village.png", name: "derived-indigenous-village" },
    { path: "derived/civil-war-works.png", name: "derived-civil-war-works" },
  ],

  tiles: {
    // --- ground: authored terrain blocks -------------------------------------------------------
    /** The prairie. June, so green — the golden plains of the postcard are August. */
    grass: tile("farm/6.png", 6, 0, { h: 2, w: 2 }),
    /**
     * Every street, yard and door spur in town. See `road` above.
     *
     * Wild West's own street art was tried first and dropped: it is a sand fill with a ragged
     * grass transition baked into its own edge rows, so it can only be laid as the pack's
     * authored blob and not as a network. This is full-bleed and tiles in any direction.
     */
    dirt: { ...CANONICAL["path.packed.earth"], h: 2, w: 2 },
    /**
     * Worked soil, under every crop block. One tile, not a 2x2: the column beside it on this row
     * is dry straw, so a 2-wide block lays alternating brown and tan bands through every field.
     * Repeating furrows is what ploughed ground looks like anyway.
     *
     * This is load-bearing rather than decorative. Every one of `farm/6`'s planted blocks is
     * 12-16% see-through — the pack draws plants standing above soil, not soil with plants in it —
     * so a crop laid straight onto the ground layer shows the page background through as hard
     * black grid lines in every field. Soil goes on the ground, the crop goes above it.
     */
    soil: tile("farm/6.png", 7, 2),

    // Crop plots for the homestead claim. Full-bleed soil-and-planting blocks, so they are ground
    // rather than props — the same treatment Riverbend's fields get, and for the same reason:
    // laid on `structures` over a separate soil tile, the transparent gaps between stems show the
    // page background through as hard black holes in every field.
    /** Winter wheat, the crop the Kansas land boom was actually sold on. */
    plotWheat: tile("farm/6.png", 6, 14, { h: 2, w: 2 }),
    /** Sunflower — native prairie, and the one piece of this pack's scatter that belongs here. */
    plotSunflower: tile("farm/6.png", 8, 8, { h: 2, w: 2 }),
    /** Maize on the Kanza ground, west of the creek. */
    plotMaize: tile("farm/6.png", 8, 6, { h: 2, w: 2 }),

    // The creek and its banks. Horizontal strips eight tiles long, not 2x2 blocks: the pack draws
    // one continuous watercourse across the row and it has to be tiled that way or the ripple
    // lines break at every tile boundary.
    water: tile("Medieval Fishing Village/tile-B-04.png", 15, 0, { h: 1, w: 8 }),
    surf: tile("Medieval Fishing Village/tile-B-04.png", 14, 0, { h: 1, w: 8 }),
    shoreSand: tile("Medieval Fishing Village/tile-B-04.png", 13, 0, { h: 1, w: 8 }),

    // --- the line ------------------------------------------------------------------------------
    /**
     * The running line. Two columns of clean straight track, tiled by parity along `TRACK_ROW`.
     *
     * Cols 8–9 rather than 0–7: the pack's first eight columns of this row have the station
     * platform baked into their upper half, and cols 11–12 carry a switch and the start of a
     * curve. These two are the only pair that is nothing but rail.
     *
     * Goes on `structures` as `decor`. See note 1 in the header for why it carries no collision.
     */
    track: tile("Wild West/tile-B-04.png", 2, 8, { h: 1, w: 2 }),
    /**
     * The depot: ticket office, platform, and the rails in front of it, as one piece.
     *
     * Four columns wide rather than three. The building itself ends four pixels into its fourth
     * column, so cropping to three would slice the right wall; taking the fourth brings in the
     * line signal standing beside it, which is a better trade than a seam.
     */
    depot: tile("Wild West/tile-B-04.png", 0, 0, { h: 3, w: 4 }),
    /**
     * The covered platform east of the depot — benches, a ticket window, freight against the wall.
     *
     * Two rows, where the depot beside it is three, and the difference is not a style choice.
     * `tile-B-04` draws its whole trackside as one continuous 5x11 picture — station, fence,
     * platform, standpipe, rails and loading deck all touching — and
     * `tests/unit/tile-footprints.test.js` measures a declared footprint against its neighbours.
     * The station's three rows cut clean; the platform's third row does not, because the standpipe
     * at (2,7) runs into it. Cutting at two rows loses about twenty pixels of deck depth and
     * nothing else: the running line is drawn along the row below by `decorBlock`, so the deck
     * still ends at the rails.
     */
    depotPlatform: tile("Wild West/tile-B-04.png", 0, 4, { h: 2, w: 4 }),
    /** Loading deck with crates and barrels on it, and the rails along its foot. */
    freightDeck: tile("Wild West/tile-B-04.png", 3, 0, { h: 1, w: 4 }),
    /** The tank the locomotives water at, which is why the town is on the creek. */
    waterTower: tile("Wild West/tile-B-04.png", 12, 5, { h: 2, w: 1 }),
    waterTowerAlt: tile("Wild West/tile-B-04.png", 12, 6, { h: 2, w: 1 }),

    // --- the town: four unsigned frontages, one signed nothing ---------------------------------
    // See note 4 in the header. Each is 2x2 and each has a real door in its ground-contact row,
    // which is what `doorCellOf()` reads to start a spur.
    /** The United States land office. Its register is inside; so is the patent. */
    landOffice: tile("Wild West/tile-B-02.png", 6, 10, { h: 2, w: 2 }),
    /** The telegraph office: porch, rail, open door. */
    telegraphOffice: tile("Wild West/tile-B-02.png", 6, 12, { h: 2, w: 2 }),
    /** The town-site company's office — the man selling lots in a town that is mostly stakes. */
    townsiteOffice: tile("Wild West/tile-B-02.png", 10, 8, { h: 2, w: 2 }),
    /** The store. Everything anybody here eats came off the line and is sold through this door. */
    store: tile("Wild West/tile-B-02.png", 10, 10, { h: 2, w: 2 }),
    /**
     * Three more unsigned frontages, for the rest of the street.
     *
     * A railhead town in its second season was mostly buildings without a settled use — the
     * boarding house, the eating house, the room somebody was calling a bank this month. Naming
     * each one in the generator rather than here is deliberate: the art is generic and what the
     * building *is* belongs next to where it stands.
     */
    frontageA: tile("Wild West/tile-B-08.png", 14, 4, { h: 2, w: 2 }),
    frontageB: tile("Wild West/tile-B-08.png", 14, 8, { h: 2, w: 2 }),
    frontageC: tile("Wild West/tile-B-08.png", 14, 10, { h: 2, w: 2 }),
    /**
     * The public notice board outside the land office.
     *
     * The most quietly load-bearing prop on this map: a land sale was advertised by posted notice,
     * and this is where the Kanza reserve was offered in 160-acre tracts. It stands where a player
     * walks past it on the way to the office door.
     */
    noticeBoard: tile("Wild West/tile-B-08.png", 3, 12, { h: 1, w: 2 }),
    /** Livery stable, open-fronted, with a horse in it. */
    stable: tile("Wild West/tile-B-02.png", 6, 14, { h: 2, w: 2 }),
    /** The hide shed: open front, a ladder, a hide hanging in the dark. */
    hideShed: tile("Wild West/tile-B-02.png", 10, 14, { h: 2, w: 2 }),

    // --- street furniture ----------------------------------------------------------------------
    trough: tile("Wild West/tile-B-02.png", 9, 2, { h: 1, w: 2 }),
    troughAlt: tile("Wild West/tile-B-02.png", 9, 8, { h: 1, w: 2 }),
    hitchRail: tile("Wild West/tile-B-02.png", 15, 4, { h: 1, w: 2 }),
    barrels: tile("Wild West/tile-B-02.png", 8, 10, { h: 2, w: 1 }),
    crates: tile("Wild West/tile-B-02.png", 8, 11, { h: 1, w: 1 }),
    sacks: tile("Wild West/tile-B-02.png", 9, 11, { h: 1, w: 1 }),
    oxWagon: tile("Wild West/tile-B-02.png", 14, 8, { h: 2, w: 2 }),

    // --- the stock yards -----------------------------------------------------------------------
    // The pack draws a corral as a finished enclosure rather than as modular rail, so a pen is one
    // 2x2 stamp and not a fence run. Solid: a pen is a thing you look into, not a room.
    penChute: tile("Wild West/tile-B-08.png", 4, 8, { h: 2, w: 2 }),
    pen: tile("Wild West/tile-B-08.png", 4, 10, { h: 2, w: 2 }),
    // Four columns, not three. Measured, the art runs 0.06..3.94 across cols 12-15 as one
    // enclosure — cropping at 3 slices its right-hand rail off and leaves an orphan at (4,14).
    penWide: tile("Wild West/tile-B-08.png", 4, 12, { h: 2, w: 4 }),
    /** A straight run of rail, for the fence lines that are not pens. */
    railFence: tile("Wild West/tile-B-08.png", 7, 12, { h: 1, w: 2 }),
    stockBarn: tile("Wild West/tile-B-08.png", 6, 8, { h: 2, w: 2 }),
    hayStack: tile("Wild West/tile-B-08.png", 6, 0, { h: 1, w: 1 }),
    hayBales: tile("Wild West/tile-B-08.png", 3, 2, { h: 1, w: 1 }),
    stockTrough: tile("Wild West/tile-B-08.png", 3, 8, { h: 1, w: 1 }),

    // --- the homestead claim -------------------------------------------------------------------
    /** The claim shanty. A log cabin with a porch — more than most 1873 claims had. */
    claimCabin: tile("Wild West/tile-B-08.png", 6, 14, { h: 2, w: 2 }),
    /** The section house — the crew that maintains this stretch of line lives in it. */
    sectionHouse: tile("Wild West/tile-B-08.png", 8, 14, { h: 2, w: 2 }),
    /** Split rail, from farm/6 rather than the corral sheet: a claim fence is not a stock pen. */
    fenceRail: tile("farm/6.png", 10, 0, { h: 1, w: 2 }),
    fenceRailAlt: tile("farm/6.png", 10, 2, { h: 1, w: 2 }),
    fenceGate: tile("farm/6.png", 10, 6, { h: 1, w: 2 }),
    well: tile("farm/6.png", 14, 0, { h: 2, w: 2 }),

    // --- the graders' camp ---------------------------------------------------------------------
    // Wall tents, from the Richmond commission. Army pattern is exactly right here and is not a
    // substitution: the Union Pacific's Kansas branches ran their construction camps out of Civil
    // War surplus, and the graders on this map are the veterans and immigrants who came with it.
    wallTent: CivilWarWorks.wallTent,
    supplyWagon: CivilWarWorks.supplyWagon,

    // --- the Kanza village ---------------------------------------------------------------------
    // Commissioned in Phase 83; see docs/decision-log/0067-the-gap-that-was-three-gaps.md. Four of
    // the sheet's seven objects belong at Council Grove on the Neosho — the bark lodge, the drying
    // rack, the staked hide, and the agency stone hut. The tipis do not: they are Plains forms and
    // the Kanza lived in lodges and used bark-and-mat construction on the reserve.
    barkLodge: IndigenousVillage.barkLodge,
    earthLodge: IndigenousVillage.earthLodge,
    dryingRack: IndigenousVillage.dryingRack,
    hideStretcher: IndigenousVillage.hideStretcher,
    /**
     * One of the 138 one-room limestone houses the government built for the Kanza in 1862.
     *
     * The Kanza declined to live in square rooms and stabled animals in them; in 1866, while the
     * people were away on the winter hunt, settlers stripped the doors and window sashes and left
     * them unusable. The commissioned art has empty frames with black openings, which is what that
     * looks like. `THE-MAP-PROGRAM.md` §5: nothing has to explain it and nothing should.
     */
    agencyStoneHut: IndigenousVillage.agencyStoneHut,

    // --- trees and scatter ---------------------------------------------------------------------
    // Cottonwood is the tree this place is named for and the library has no cottonwood. The oak
    // and the birch stand in for it — the birch better than it has any right to, because a mature
    // cottonwood's bark is pale grey and deeply furrowed and reads at this size the way that sheet
    // draws a birch. Both go along the creek and nowhere else: a treeline across open tallgrass
    // would be the same error as the cactus, in the other direction.
    //
    // `treeMaple` was in this list and is out. It is drawn in full autumn orange, and this map is
    // 4 June.
    treeOak: FarmTrees.treeOak,
    treeBirch: FarmTrees.treeBirch,
    // Low scrub for the creek bottom, and nothing taller. `saplingLilac` was tried as scatter and
    // dropped for the same reason as the maple: it is a small tree, and scattering small trees
    // across tallgrass prairie draws parkland.
    bushBerry: FarmTrees.bushBerry,
    bushFlowering: FarmTrees.bushFlowering,
  },
};
