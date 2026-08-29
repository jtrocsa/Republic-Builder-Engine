// Palette for fairmeadow-field.tmj (Unit 8's field map, the suburban corridor).
// Setting: Fairmeadow, in a Pennsylvania township outside Philadelphia, August 1957.
// Consumed by scripts/generate-fairmeadow-tmj.js.
//
// **The place is composite and the mechanism is not** — the opposite call from Ellis Island one
// unit back, and decision log `0094` §2 records why: the interview on this map asks eight invented
// people what they will say on the record, and eight invented people saying that about a real named
// town is an accusation against a real address. What is not invented is the geography. Bristol
// Borough is a river town of the 1690s; Bristol Township beside it took twelve thousand houses
// between 1952 and 1958; and the road that would become I-95 was being cut between them. Fairmeadow
// is that township and the borough below it is that borough, under names nobody has to defend.
//
// Seven decisions are worth stating, because each was arrived at against the art and each changed
// the layout.
//
// 1. **The map is one map with a line across the middle of it, and the line is nothing.** Ellis
//    Island's rail was four feet of iron with one gate in it and the separation *was* the argument.
//    Here the boundary is a strip of graded dirt the player crosses in four seconds without being
//    stopped — and the appraisal in `unit-08-campaign.js` gives the ground north of it forty years
//    of remaining economic life and the ground south of it fifteen. **A unit should no more repeat
//    its neighbour's composition than its neighbour's engines**, and the inversion is the whole
//    reason this one is drawn the way it is: what decides is on paper, and there is nothing on the
//    ground to see.
//
// 2. **The expressway is unfinished, and that is a fact about the art before it is a fact about the
//    history.** Every lane marking in 250 sheets runs north-south — `Highway Rest Area/tile-B-01`'s
//    double yellow is a vertical run at cols 5-6 — so an east-west highway cannot be striped. The
//    honest reading of an unstriped carriageway is a road that has not opened, which is what a road
//    looks like the month before it does, and it pays for itself three times over: it explains why
//    every car on this map is in a driveway, it puts `Construction/2` on the subgrade where the
//    second carriageway is not built yet, and it dates the sheet the appraiser is writing. **He is
//    rating a boundary that does not exist yet.**
//
// 3. **The old road still crosses it at grade**, at cols 26-27, and it is the only thing tying the
//    two halves of the map together. Grade separation comes with the interchange and the
//    interchange comes later; until then the township road runs straight over the subgrade the way
//    it always did. That is true of every expressway ever built through a settled place, it is the
//    reason the player can walk from one economic life to the other, and it is quietly the most
//    ominous thing on the map: this crossing closes when the road opens.
//
// 4. **The borough has trees and Fairmeadow does not**, and this is the one contrast a student can
//    read before anybody speaks. `derived/farm-trees.png` carries both halves of it — mature oak,
//    maple and pine for ground that has been lived on for two centuries, and the same sheet's
//    saplings for a street where the developer planted whips in June. It is also exactly what an
//    appraiser was scoring: `Highway Rest Area`'s own contemporary street furniture would have
//    flattened the two sides into one modern texture, which is why almost none of it is used.
//
// 5. **Every building in 250 sheets faces south**, so a street cannot have houses on both sides of
//    it and both frontages are north of their street. Fairmeadow's is one run of three plans on a
//    seven-column pitch; the borough's is a two-hundred-year frontage of frame houses, a
//    commercial block and a steeple, **with two alleys cut through it** — because the player
//    arrives from the north, meets the backs of those buildings first, and needs a way through to
//    the street their doors open onto. The alleys are not decoration; without them half this map is
//    a wall.
//
// 6. **The borough's commercial block is the registered gap being paid for in flagged coin.**
//    `architecture.twentiethCentury.commercialBlock` (canonical-palette.js's GAPS, Phase 96) has no
//    art anywhere in the library: `19th Century European City/tile-B-01` is Second Empire and
//    `Highway Rest Area/tile-B-02` is a strip mall with modern glazing and branding. The building &
//    loan takes that sheet's pale ashlar pavilion, which is close to right — a small classical
//    front is what a savings association built in 1926 — and the brick terraces either side of it
//    keep their mansards, which are not. Flagged here rather than left for a reader to notice, and
//    it is the same substitution `immigrant-port-field` records for the same sheet.
//
// 7. **Nothing on this map is `Highway Rest Area`'s modern furniture** except the guard rail, the
//    two notice boards and the ground. No vending machines, no ATMs, no wheelie bins, no branded
//    storefronts, and above all **none of that pack's forty vehicles** — they are contemporary to
//    the last one, and they are the reason `derived/suburban-tract.png` was commissioned in Phase 96
//    (decision log `0095`). The exclusion list is the discipline this map runs on; `p8-suburb` in
//    planned-maps.js carries it too.

import { CANONICAL, tile } from "../canonical-palette.js";
import { FarmBuildings, FarmTrees, SuburbanTract, TownCivic } from "../derived-objects.coords.js";

export default {
  id: "fairmeadow-field",
  period: 8,
  status: "live",
  map: "apps/web/src/content/maps/fairmeadow-field.tmj",
  // Three made surfaces, and the FIRST is what `RoadNetwork` paints new spurs in. Concrete, because
  // in a subdivision every door reaches the street by a poured walk and nothing else — a spur here
  // is literally the thing a builder poured. The asphalt and the brick are `harder`, so a walk
  // meeting either joins the network rather than punching a grey rectangle through it.
  road: ["walk", "asphalt", "brickStreet"],

  // Ordered — reshuffling changes every GID in the committed .tmj.
  // Four of the ten are derived sheets this repo packed itself; `suburban-tract` is new in Phase 96
  // and this is its first consumer.
  sheets: [
    { path: "derived/suburban-tract.png", name: "suburban-tract" },
    { path: "Highway Rest Area/tile-B-01.png", name: "highway-rest-area-b01" },
    { path: "Modern Park/tile-B-01.png", name: "modern-park-b01" },
    { path: "Modern Park/tile-B-02.png", name: "modern-park-b02" },
    { path: "Construction/2.png", name: "construction-2" },
    { path: "farm/6.png", name: "farm-6" },
    { path: "derived/farm-buildings.png", name: "farm-buildings" },
    { path: "derived/farm-trees.png", name: "farm-trees" },
    { path: "derived/town-civic.png", name: "town-civic" },
    { path: "19th Century European City/tile-B-01.png", name: "european-city-b01" },
  ],

  tiles: {
    // --- ground ---------------------------------------------------------------------------------
    /**
     * Fairmeadow's lawn: flat, mown, and the same green edge to edge.
     *
     * `Modern Park`'s rather than `farm/6`'s, and the difference is the point. This one is a single
     * even tone with no tufting in it, which is what a lawn seeded in April and cut every Saturday
     * since looks like, and what the sheet's own catalog entry warns is "flatter and lower-contrast
     * than the historical packs' ground". Here that is not a caveat; it is the finding.
     */
    lawn: { ...CANONICAL["grass.lawn.mown"], h: 2, w: 2 },
    /**
     * The borough's grass: two-toned, tufted, uncut at the edges. `farm/6`'s field grass, on ground
     * that has been somebody's yard for six generations.
     */
    grassRough: tile("farm/6.png", 6, 0, { h: 2, w: 2 }),
    /**
     * Graded earth. The unbuilt lots at the top of the map and the expressway's second carriageway
     * at the middle of it are the same surface, because they are the same operation: a scraper has
     * been over both this summer.
     */
    gradedEarth: { ...CANONICAL["path.earth.graded"], h: 2, w: 2 },
    /** Crushed stone, on the subgrade and in the material yard. */
    // **One tile wide, not two.** The column to this one's right on the sheet is the pale ragged
    // edge where the drawn patch of stone ends, and it carries see-through holes — on the ground
    // layer a hole is the page showing through. tests/unit/map-tile-integrity.test.js reported eight
    // of them the first time this map ran.
    gravel: { ...CANONICAL["path.stone.crushed"], h: 2, w: 1 },
    /**
     * Poured concrete: sidewalks, front walks, driveways and aprons. The spur material — see the
     * note on `road` above.
     */
    walk: { ...CANONICAL["path.concrete.walk"], h: 2, w: 2 },
    /**
     * Plain black-top, unstriped. Both carriageways of the expressway and the old township road
     * that crosses them.
     *
     * Unstriped is not a compromise — see note 2 in the header. The one marked road tile in this
     * library runs north-south and this highway runs east-west, and an unopened road is the reading
     * that costs nothing and buys the whole middle of the map.
     */
    asphalt: { ...CANONICAL["path.asphalt.plain"], h: 2, w: 2 },
    /**
     * The residential street: a two-row band with a kerb baked along its north edge, a dashed
     * centre line down the middle of it and a second kerb along its south edge.
     *
     * **Only ever laid on an even row**, because `groundBlock` tiles by absolute parity: at row 10
     * the block's first row lands and the kerb is on top, at row 11 its second lands and the kerb is
     * underneath. Started on an odd row the two kerbs swap and the street grows a hard line down its
     * middle with its edges open to the grass.
     */
    street: tile("Highway Rest Area/tile-B-01.png", 2, 0, { h: 2, w: 4 }),
    /**
     * Broad Street, in the borough: red brick laid in running bond.
     *
     * Not a substitution. Delaware Valley river towns paved in brick and a good many of those
     * streets were still brick in 1957; a borough that had not repaved since the trolley came out is
     * the same borough the appraiser gives fifteen years to.
     */
    brickStreet: { ...CANONICAL["stone.paver.brick"], h: 2, w: 2 },

    // --- Fairmeadow: the three plans ---------------------------------------------------------------
    // Commissioned in Phase 96 into derived/suburban-tract.png. What varies between them is where
    // the car goes — a carport, an attached garage, or neither — because Levitt's Bucks County
    // models were one house sold as several and that is the difference a buyer chose between. See
    // decision log 0095 §3.
    /** Five tiles wide, and the widest thing in Fairmeadow: butter clapboard with an open carport. */
    houseCarport: SuburbanTract.houseCarport,
    /** Brick veneer and siding, with an attached garage. The model house, and the one with a door. */
    houseGarage: SuburbanTract.houseGarage,
    /** Turquoise siding, a chimney, and nowhere to put a car but the drive. */
    houseDriveway: SuburbanTract.houseDriveway,

    // --- Fairmeadow: the cars ---------------------------------------------------------------------
    // Three bodies at one scale, and every one of them is parked. Nothing moves on this map: the
    // expressway is not open and the drive is a street with eleven houses on it.
    sedanTwoTone: SuburbanTract.sedanTwoTone,
    sedanDarkGreen: SuburbanTract.sedanDarkGreen,
    stationWagon: SuburbanTract.stationWagon,

    // --- the borough --------------------------------------------------------------------------------
    /**
     * The building & loan: a pale ashlar front with three arched openings and a clock tower.
     *
     * The flagged half of the registered `architecture.twentiethCentury.commercialBlock` gap — see
     * note 6. It is on the *rated-down* side of the highway, which is the placement the whole
     * southern half of this map is built around: the institution that reads the appraisal has its
     * own office on the ground the appraisal writes off.
     */
    buildingAndLoan: tile("19th Century European City/tile-B-01.png", 4, 4, { h: 4, w: 4 }),
    /** The commercial terraces either side of it. Second Empire, and flagged as such. */
    commercialRow: tile("19th Century European City/tile-B-01.png", 10, 8, { h: 2, w: 4 }),
    commercialRowAlt: tile("19th Century European City/tile-B-01.png", 10, 12, { h: 2, w: 4 }),
    /** The one brick range with a plain ground-floor door: the borough's own shopfronts. */
    shopRange: tile("19th Century European City/tile-B-01.png", 8, 12, { h: 2, w: 4 }),
    /**
     * The borough's houses: painted clapboard, two storeys, sash windows, no two the same colour.
     * `derived/farm-buildings.png`, which is `farm/7`'s North American vernacular repacked onto the
     * grid — eighteenth and nineteenth century, which is precisely the age of the housing stock a
     * two-hundred-year-old river borough still had in 1957.
     */
    houseRed: FarmBuildings.houseRed,
    houseYellow: FarmBuildings.houseYellow,
    houseBlue: FarmBuildings.houseBlue,
    houseBrown: FarmBuildings.houseBrown,
    houseCream: FarmBuildings.houseCream,
    /** The tallest thing on the map, and it is on the side with fifteen years left. */
    churchSteeple: TownCivic.churchSteeple,
    /**
     * The township building: two storeys of sash-windowed clapboard with a portico, older than
     * anything it now administers. The notice board outside it carries Ordinance No. 118.
     */
    townshipHall: FarmBuildings.statehouse,
    /** A borough outbuilding — a shed or a stable behind a house, on the back lots. */
    shed: FarmBuildings.warehouse,

    // --- planting -------------------------------------------------------------------------------------
    // The map's loudest argument, and see note 4. Mature stock south of the highway, whips north of
    // it, and nothing at all on the lots that have not been sold.
    // Green stock only. `derived/farm-trees.png` also carries a maple in autumn dress and a cherry
    // in fruit, and both are deliberately absent: this map is dated August 1957 and the first render
    // of it had a third of the borough turning orange. An old apple in a yard behind a frame house
    // is the one fruiting tree that belongs here, and it belongs on the borough's side only.
    treeOak: FarmTrees.treeOak,
    treePine: FarmTrees.treePine,
    treeBirch: FarmTrees.treeBirch,
    treeApple: FarmTrees.treeApple,
    saplingApple: FarmTrees.saplingApple,
    saplingBlossom: FarmTrees.saplingBlossom,
    saplingLilac: FarmTrees.saplingLilac,
    bushRose: FarmTrees.bushRose,
    bushFlowering: FarmTrees.bushFlowering,
    /** The clipped foundation shrub — the one piece of planting a new house came with. */
    shrub: tile("Highway Rest Area/tile-B-01.png", 6, 14),

    // --- fences and edges ------------------------------------------------------------------------------
    /**
     * The borough's picket fence, around yards that have had one since before the covenant existed.
     *
     * **Face-on only, like every fence in this library**, so it runs east-west and nothing else.
     * Fairmeadow has none: the deed's fourth restriction permits four feet forward of the building
     * line, and what a 1957 tract actually did with that permission was leave the lawns open.
     */
    picketFence: tile("farm/6.png", 11, 0, { h: 1, w: 2 }),
    /** Split rail along the back lots and the field edge. */
    railFence: tile("farm/6.png", 10, 4),
    railFenceAlt: tile("farm/6.png", 10, 5),
    /** Coursed stone, along the churchyard. */
    stoneWall: tile("farm/6.png", 10, 8, { h: 1, w: 2 }),
    /** Chain link, around the material yard on the unsold lots. The only new fence on the map. */
    chainLink: tile("farm/6.png", 11, 6),
    /**
     * Highway guard rail: a w-beam on posts, and the one piece of `Highway Rest Area`'s furniture
     * this map takes at full value.
     *
     * Stamped in broken runs with gaps between them, because it is installed along the finished
     * carriageway and not along the one that is still dirt. The gaps are also how the player gets
     * across, which is the map's entire premise — a continuous rail would make the boundary real,
     * and the point is that it is not.
     */
    guardRail: tile("Highway Rest Area/tile-B-01.png", 11, 13, { h: 1, w: 3 }),
    guardRailShort: tile("Highway Rest Area/tile-B-01.png", 7, 14, { h: 1, w: 2 }),

    // --- street furniture --------------------------------------------------------------------------------
    /**
     * The two notice boards: timber-framed, glazed, with printed sheets behind them.
     *
     * One of the seven records is a legal advertisement in small type pinned to exactly this, and
     * the reason it is out here rather than inside the township building is that a legal notice is
     * published by being *posted*. A student who never opens the door still walks past it.
     */
    noticeBoard: tile("Highway Rest Area/tile-B-01.png", 7, 12),
    noticeBoardAlt: tile("Highway Rest Area/tile-B-01.png", 7, 13),
    /** Plain utility-company street lamps, the same on both sides of the highway. */
    streetLamp: tile("Modern Park/tile-B-02.png", 0, 10, { h: 2, w: 1 }),
    streetLampAlt: tile("Modern Park/tile-B-02.png", 0, 11, { h: 2, w: 1 }),

    // --- the works ------------------------------------------------------------------------------------------
    // `Construction/2`, and it does two jobs at once: the material yard on Fairmeadow's unsold lots
    // and the plant on the expressway's second carriageway. That they are the same objects is the
    // truth of 1957 in this township — one contractor's yard supplied both, and the same scraper
    // graded both.
    sandPile: tile("Construction/2.png", 2, 6, { h: 2, w: 2 }),
    gravelPile: tile("Construction/2.png", 2, 8, { h: 2, w: 2 }),
    cinderBlocks: tile("Construction/2.png", 2, 10, { h: 2, w: 2 }),
    brickPallet: tile("Construction/2.png", 0, 12, { h: 2, w: 2 }),
    brickStack: tile("Construction/2.png", 4, 10, { h: 2, w: 2 }),
    cementBags: tile("Construction/2.png", 4, 0, { h: 2, w: 2 }),
    emptyPallet: tile("Construction/2.png", 4, 8, { h: 2, w: 2 }),
    timberBaulk: tile("Construction/2.png", 6, 10, { h: 1, w: 4 }),
    roofingRoll: tile("Construction/2.png", 13, 8, { h: 3, w: 2 }),
    /** An upright timber, stamped singly. On the unsold lots these are the lot corners. */
    stake: tile("Construction/2.png", 6, 14, { h: 2, w: 1 }),
  },
};
