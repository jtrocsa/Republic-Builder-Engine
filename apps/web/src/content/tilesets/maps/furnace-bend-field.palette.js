// Palette for furnace-bend-field.tmj (Unit 9's field map, the campus archive).
// Setting: Furnace Bend State University, a valley city in north-eastern Ohio, October 1998.
// Consumed by scripts/generate-furnace-bend-tmj.js.
//
// **The place is composite, the mechanisms are not**, and decision log `0099` §5 records why more
// sharply than Unit 8's: the interview on this map asks eight invented people what a stranger is
// entitled to see, and eight invented people saying that about a real named university is an
// accusation against a real address. What is not invented is any of the machinery — the FOIA
// exemptions and the two amendments that shaped the letter, the standard clauses of an American
// deed of gift, filming from a publisher's file copy, and the community campaign the coalition's
// proposal reconstructs.
//
// Six decisions, each arrived at against the art, and each of which changed the layout.
//
// 1. **This map is not built around a line, because the last two were.** Ellis Island was one line
//    the player cannot cross; Fairmeadow was one line they cross in four seconds that turns out to
//    be nothing. `0096` §1 makes that inversion a rule rather than a preference, and applying the
//    rule a third time means not drawing a third line. What this map is built around is **depth**:
//    three thresholds, in a row, each quieter and harder than the one before it — the quad, which
//    anyone may walk on; the reading room, which you may enter but must ask in; and the processing
//    room under it, which is not announced anywhere. That is the unit's own finding standing up as
//    geography, and `THE-MAP-PROGRAM.md` §5 asks for exactly it.
//
// 2. **The library has two doors and they are twenty metres apart.** The public entrance is on the
//    axis, at the head of the paved walk, facing the quad. The service door into the processing
//    room is at the end of a short apron off the east wing, behind planting, and nothing points at
//    it. **The room where you ask and the room where it is decided have different doors**, and a
//    player who finds the second one has found the argument without being told it. Both faces are
//    south because every building in 250 sheets is drawn as a south elevation (`0096` §3) — the
//    difference between them is not orientation, it is that one is on the walk and one is not.
//
// 3. **The most damaging thing on this map is in the most public place on it.** The three locks
//    rank in the order nobody expects (`0099` §4): the FOIA response is the weakest because it is
//    the only one obliged to explain itself, the deed of gift is stronger because it needs no
//    reason, and the bad scan beats both because nobody decided anything. So the scan is not behind
//    any threshold at all. It is on a screen anyone can walk up to, in the open, first — and the
//    ranking runs backwards against the walk, which is the point.
//
// 4. **The works are not drawn, and their absence is the strongest fact on the map.** The unit is
//    set twenty years after the mill at the bottom of the hill went cold, and the obvious move is a
//    silhouette of it on the south horizon. `Factory/1` and `/3` would supply one. But a works
//    twenty years closed in this valley is not a ruin and not a landmark — it was scrapped, the
//    ground was cleared, and what is down there is a flat green field with nothing standing on it.
//    Drawing the mill would make the argument visible and the argument is that it is not. **What
//    the player can see of the thing everybody on this map is fighting over is nothing whatever,
//    and the only evidence it happened is indoors, in boxes, under three different locks.**
//
// 5. **The hill is drawn as a retaining wall, and the render is what decided that.** There is no
//    height in this engine and a valley city has to be said some other way, so `Modern Park/
//    tile-B-01`'s stepped edge was taken for a flight of steps down the slope. Rendered on real
//    ground it is not a stair — it is a low concrete retaining wall with planting along the top of
//    it, which is a better object for this map than the one that was asked for and is kept under
//    the name the render earned. **A retaining wall is what stands at the head of a bank**, it has
//    one gap in it, and the gap is the only way down. Below it the campus stops mowing. It is the
//    only place on the map where the player walks downhill, and they are walking towards the thing
//    that is not there.
//
// 6. **October is in the tileset and did not have to be commissioned.** Phase 101 (`0100`) found
//    `Modern Park/tile-B-05` carrying five autumn crowns, three of them with fallen leaves drawn at
//    the base. The quad's trees are red, gold and tan; the older trees on the slope keep more green,
//    the way trees under a hill do. The month is load-bearing — `0099` §5: the Electronic FOIA
//    Amendments had just come fully into force, the first big local-history scanning projects were
//    putting microfilm on the open web, and records officers were writing schedules that treated
//    electronic mail as not a record.
//
// ── The exclusion list, which is the discipline this map runs on ────────────────────────────────
// **Every screen on this map comes from `office/1`** — but no screen is drawn out of doors, so the
// rule bites on the two interiors rather than here. It is stated in this header anyway because the
// interiors will be built against this palette: `office/1`'s workstations are beige CRTs and are
// correct for 1998, and `office/2`'s and `office/3`'s are flat panels from 2005 at the earliest.
// See `0100` §2 and `p9-reading-room` in planned-maps.js.
//
// **Nothing from `University/tile-B-04`'s modern glass block** at rows 8-11, cols 8-15 — rooftop
// HVAC plant and curtain walling that reads 2010s against the 1960s and 70s brick this campus is
// built from. **No sports track**, which is on the same sheet and would turn a records map into a
// school map. And **none of `Highway Rest Area`'s vehicles**, for the reason Phase 96 commissioned
// a fleet: they are contemporary to the last one, and there is no 1990s car in the library. So
// **there is no car park on this map**, which is a decision the render forced rather than a
// nicety: an empty lot is a grey rectangle with nothing in it, and a grey rectangle with nothing in
// it does not read as a Tuesday afternoon, it reads as unfinished ground. The campus road keeps a
// grass verge instead, and every vehicle on this map is off-camera.

import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "furnace-bend-field",
  period: 9,
  status: "live",
  map: "apps/web/src/content/maps/furnace-bend-field.tmj",
  // Poured concrete first: on a campus every door reaches the walk by a poured path and nothing
  // else, so a spur the network paints is literally the thing the estates office poured. The paver
  // and the asphalt are `harder`, so a spur meeting either joins it rather than punching a grey
  // rectangle through it.
  road: ["walk", "paver", "asphalt"],

  // Ordered — reshuffling changes every GID in the committed .tmj.
  // Five sheets, and no derived sheet at all, which no other field map in the programme can say.
  // That is the Phase 101 finding restated as a manifest: this map needed nothing commissioned.
  sheets: [
    { path: "University/tile-B-04.png", name: "university-b04" },
    { path: "Modern Park/tile-B-01.png", name: "modern-park-b01" },
    { path: "Modern Park/tile-B-05.png", name: "modern-park-b05" },
    { path: "Highway Rest Area/tile-B-01.png", name: "highway-rest-area-b01" },
    { path: "farm/6.png", name: "farm-6" },
  ],

  tiles: {
    // --- ground -----------------------------------------------------------------------------------
    /**
     * The quad: mown, even, and the same green edge to edge. The grounds crew is the one department
     * on this map whose budget survived.
     */
    lawn: { ...CANONICAL["grass.lawn.mown"], h: 2, w: 2 },
    /**
     * Below the steps: two-toned, tufted, uncut. `farm/6`'s field grass, on the slope the campus
     * stopped mowing at some point nobody minuted.
     *
     * The contrast between this and `lawn` is the one thing on the map a student can read before
     * anybody speaks, and it is the same device Fairmeadow used for its two halves — except that
     * here the unkempt side is not somebody's home. It is where the works were.
     */
    grassRough: tile("farm/6.png", 6, 0, { h: 2, w: 2 }),
    /** Pale square pavers: the quad's cross-axis, and the walk to the library door. */
    paver: tile("Modern Park/tile-B-01.png", 4, 8, { h: 2, w: 2 }),
    /** Poured concrete: the apron in front of the library and the service yard. The spur material. */
    walk: { ...CANONICAL["path.concrete.walk"], h: 2, w: 2 },
    // `stone.paver.brick` was here, as a red-brick forecourt at the library's own front, and it
    // is gone because the render disagreed with the catalog. On the sheet that region reads as flat
    // running-bond paving; laid as a two-by-two terrain block on real ground it comes up with a
    // pale coping along its top edge and dark vertical joints, and what lands in front of the
    // library is unmistakably a **brick wall lying down**. Not a scale error and not a tiling
    // parity error — the block simply contains an edge course. The forecourt is poured concrete
    // now, which is what a 1970s campus actually laid, and this note is here so the next author
    // does not rediscover the tile and reach for it again.
    /** Plain black-top: the campus road along the south of the quad, and the car park. */
    asphalt: { ...CANONICAL["path.asphalt.plain"], h: 2, w: 2 },
    /**
     * Crushed stone, one tile wide rather than two.
     *
     * The column to this one's right on the sheet is the pale ragged edge where the drawn patch
     * ends and it carries see-through holes; on the ground layer a hole is the page showing
     * through. `tests/unit/map-tile-integrity.test.js` reported eight of them the first time
     * Fairmeadow ran, and the note is repeated here rather than cross-referenced because the next
     * person to reach for this tile will be reading this file.
     */
    gravel: { ...CANONICAL["path.stone.crushed"], h: 2, w: 1 },
    /** Graded earth: the service yard's turning area, where a truck backs twice a week. */
    gradedEarth: { ...CANONICAL["path.earth.graded"], h: 2, w: 2 },

    // --- the campus ---------------------------------------------------------------------------------
    // Four buildings off University/tile-B-04, every one of them two rows by four columns, which is
    // that sheet's own pitch and was measured off the pixels rather than read off the catalog.
    /**
     * **The Whitmore Library.** Red brick, a pale recessed centre bay, and a portico over the
     * doors — a 1957 building on a campus that grew when the works were running, which is the
     * quiet joke of the map: the library was paid for by the company whose records it now cannot
     * let you read.
     */
    library: tile("University/tile-B-04.png", 4, 0, { h: 2, w: 4 }),
    /** The east wing, lower and plainer. The service door into the processing room is on its face. */
    libraryWing: tile("University/tile-B-04.png", 6, 0, { h: 2, w: 4 }),
    /** An academic block: long, grey, regular windows. Two of these frame the quad. */
    hallLong: tile("University/tile-B-04.png", 2, 0, { h: 2, w: 4 }),
    /** A brick block with glazing at the ground floor — the student union end of the quad. */
    hallBrick: tile("University/tile-B-04.png", 0, 8, { h: 2, w: 4 }),

    // --- planting ---------------------------------------------------------------------------------
    // Modern Park/tile-B-05, and every crown here is two tiles by two. Five of the six are in
    // autumn dress and three of those carry fallen leaves at the base — see note 6 in the header.
    /** Red maple, with leaves down. The quad's centre tree. */
    treeRed: tile("Modern Park/tile-B-05.png", 0, 10, { h: 2, w: 2 }),
    /** Gold, with leaves down. */
    treeGold: tile("Modern Park/tile-B-05.png", 2, 4, { h: 2, w: 2 }),
    /** Orange-red, with leaves down. */
    treeOrange: tile("Modern Park/tile-B-05.png", 2, 2, { h: 2, w: 2 }),
    /** Tan, turned but not yet dropping. */
    treeTan: tile("Modern Park/tile-B-05.png", 0, 4, { h: 2, w: 2 }),
    /** Olive, half-turned. The slope's trees, which are older and further behind. */
    treeOlive: tile("Modern Park/tile-B-05.png", 6, 4, { h: 2, w: 2 }),
    /** Still green. Below the steps, in the shade of the hill. */
    treeGreen: tile("Modern Park/tile-B-05.png", 0, 0, { h: 2, w: 2 }),
    /** Clipped box, one tile. Foundation planting along the library front and the service apron. */
    shrub: tile("Modern Park/tile-B-05.png", 8, 0, { h: 1, w: 1 }),
    /** A second box, slightly larger. Alternated with `shrub` so a run is not a stencil. */
    shrubAlt: tile("Modern Park/tile-B-05.png", 8, 1, { h: 1, w: 1 }),

    // --- edges ------------------------------------------------------------------------------------
    /**
     * The low concrete retaining wall at the head of the slope, with planting along the top of it.
     * **This is the hill** — see note 5 in the header, which records that it was commissioned in
     * the layout as a flight of steps and is named for what it turned out to be. Laid as a run
     * along the quad's south boundary with exactly one gap in it, and the gap is the only way down.
     */
    quadWall: tile("Modern Park/tile-B-01.png", 3, 12, { h: 2, w: 2 }),
  },
};
