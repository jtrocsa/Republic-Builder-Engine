// Generates apps/web/src/content/maps/fairmeadow-field.tmj and its collision module for case-022
// ("The Sixth Restriction" — Fairmeadow, Pennsylvania, August 1957).
//
// Run with: node scripts/generate-fairmeadow-tmj.js
//
// Which tile is lawn, black-top or brick comes from
// apps/web/src/content/tilesets/maps/fairmeadow-field.palette.js. Layering, terrain-block tiling
// and collision come from scripts/lib/map-builder.js. This script owns layout and the land mask.
//
// Building anchors are load-bearing: UNIT8_FIELD_NPCS and UNIT8_FIELD_SOURCE_POINTS in
// apps/web/src/main.js place people and readable records relative to them, and
// FIELD_MAPS["unit-08"].interiors will place two doorsteps against two of the door cells this file
// derives. A building may be resized but not moved without checking those.
// tests/unit/field-map-coordinates.test.js holds the two together.
//
// ── The layout argument ─────────────────────────────────────────────────────────────────────────
// THE-MAP-PROGRAM.md §5 asks for "low density, new construction, and a story that is entirely in
// the paperwork," and `unit-08-campaign.js`'s own case summary names the places: "a subdivision two
// weeks old and a borough two hundred years old, either side of a new expressway." So the map is
// drawn as three bands, north to south, and the middle one is the argument:
//
//   THE UNSOLD LOTS   scraped ground, lot stakes, a contractor's yard behind chain link. Fairmeadow
//                     is still going north, and the player can see where.
//   FAIRMEADOW        seven houses on three plans, lawns, poured walks, whips for street trees, and
//                     a car on every drive. The township building at the east end is older than all
//                     of it.
//   THE CORRIDOR      one carriageway paved and unopened, one still graded dirt with the plant on
//                     it. Guard rail on the finished side only, in broken runs.
//   THE BOROUGH       a two-hundred-year frontage — frame houses, a steeple, a commercial block and
//                     the building & loan — with mature trees over all of it.
//
// **Ellis Island's rail was four feet of iron with one gate in it, and the separation was the whole
// argument. This map inverts that on purpose.** The boundary here is a strip of dirt a player walks
// across in four seconds, unstopped and unchallenged, and the appraisal in the unit's content gives
// the ground on one side of it forty years of remaining economic life and the ground on the other
// fifteen. A unit should no more repeat its neighbour's composition than its neighbour's engines,
// and this one is drawn so that the deciding line is the one thing on the map you cannot see.
//
// **The old township road still crosses at grade**, at cols 26-27, running the full height of the
// map. Grade separation arrives with the interchange and the interchange arrives later; until then
// the road that was there first runs straight over the subgrade. It is why the player can cross at
// all, and it is the quietest thing on the map: this crossing closes when the road opens.
//
// ── What is not drawn ───────────────────────────────────────────────────────────────────────────
// **Nobody of the tract's own is on the highway and nothing is moving.** Every car is parked, on a
// drive, because the carriageway is unstriped and unopened — see note 2 in the palette header for
// why that reading was forced by the art and then paid for three times.
//
// **No fence in Fairmeadow.** The deed's fourth restriction permits four feet forward of the
// building line, and what a 1957 tract did with that permission was leave the lawns open, so the
// only picket on this map is around yards in the borough that have had one since before the
// covenant was written. The one new fence is chain link, around the contractor's yard.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/fairmeadow-field.palette.js";
import { MapBuilder, hash01, pick } from "./lib/map-builder.js";
import { RoadNetwork, blockGids, connectAll, doorCellOf } from "./lib/paths.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/fairmeadow-field.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/fairmeadow-field.blocks.js");

const WIDTH = 56;
const HEIGHT = 36;

// The rows everything on this map is placed against, so they are constants rather than literals
// repeated down the file. Read the file top to bottom and this is the section through the map.
const YARD_ROW = 2; // the unsold lots begin; the mask's north limit
const FAIR_FRONT_ROW = 5; // Fairmeadow's ground-contact row; its doors open onto row 6
const FAIR_SETBACK_ROW = 8; // the front lawns, last row: the drives and the cars stand on 6-8
const FAIR_WALK_ROW = 9; // the sidewalk in front of the houses
const DRIVE_ROW = 10; // Fairmeadow Drive, rows 10-11
const SOUTH_WALK_ROW = 12; // the drive's south sidewalk
const SHOULDER_ROW = 14; // the corridor's north shoulder, and the guard rail's row
const CARRIAGEWAY_ROW = 15; // the finished carriageway, rows 15-16
const SUBGRADE_ROW = 17; // the second carriageway, still dirt, rows 17-19
const BOROUGH_FRONT_ROW = 25; // the borough's ground-contact row; its doors open onto row 26
const BOROUGH_WALK_ROW = 26;
const BROAD_ROW = 27; // Broad Street, rows 27-28
const BROAD_WALK_ROW = 29;
const YARDS_ROW = 30; // the borough's back yards
const TREELINE_ROW = 34; // the mask's south limit

// The old township road. Two tiles wide, running the whole height of the map, and the only thing
// tying the two halves together.
const CROSS_COL = 26;

// **DRIVE_ROW must stay even.** `street` is a two-row band with a kerb baked along each edge and
// `groundBlock` tiles by absolute parity, so on an even row the block's first row lands and the
// kerbs sit outside; started on an odd row they swap, and the street grows a hard line down its
// middle with its edges open to the grass. Stated as an assertion rather than a comment because it
// is invisible in the .tmj and obvious only in a preview nobody may re-render.
if (DRIVE_ROW % 2 !== 0)
  throw new Error("DRIVE_ROW must be even — see fairmeadow-field.palette.js");

// --- must stay in lockstep with apps/web/src/main.js's isFairmeadowLand() ---
// Deliberately duplicated rather than imported (decision log 0036): main.js is a browser bundle
// entry, and the one thing that must never silently diverge is the ground the player collides with
// versus the ground that got painted.
//
// A rectangle, and that is the honest shape. There is no water on this map and no cliff; what
// frames it is what is drawn beyond the rectangle — scraped earth going north, where Fairmeadow is
// about to continue, and heavy old trees going south, which is the whole of the map's argument said
// twice at its two edges.
// The south limit is TREELINE_ROW itself and not half a tile short of it, which is a collision
// arithmetic point rather than a design one: a `base` stamp's rect runs from row + 0.4 to row + 1,
// so an object standing on the last walkable row has its rect *centred* 0.2 of a tile below that
// row's own centre. Cut the mask at 33.5 and the last row of the borough's yards is walkable while
// every fence and tree standing on it reads as afloat — which is what
// field-map-coordinates.test.js reported, eighteen times, the first time it ran on this map.
function isFairmeadowLand(x, y) {
  return x >= 3.5 && x <= 52.5 && y >= YARD_ROW && y <= TREELINE_ROW;
}

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

// --- ground -------------------------------------------------------------------------------------
// Four surfaces and the section through the map decides which. The frame beyond the mask is painted
// too — scraped earth above, rough grass below — so the edge of the world is more of the same place
// rather than the place the tiles stop.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    let surface = T.lawn;
    // The unsold lots and the frame above them. Down to the contractor's fence and not one row
    // short of it: the first render stopped the scraped ground two rows high and left the fence,
    // which is the yard's own south boundary, standing on lawn.
    if (row <= YARD_ROW + 2) surface = T.gradedEarth;
    else if (row >= SHOULDER_ROW && row < CARRIAGEWAY_ROW) surface = T.gradedEarth;
    else if (row >= CARRIAGEWAY_ROW && row < SUBGRADE_ROW) surface = T.asphalt;
    else if (row >= SUBGRADE_ROW && row < BOROUGH_FRONT_ROW - 4) surface = T.gradedEarth;
    else if (row >= BOROUGH_FRONT_ROW - 4) surface = T.grassRough;
    map.groundBlock(col, row, surface);
  }
}

// Crushed stone where the machines have been standing: the contractor's yard on the unsold lots,
// and two runs along the subgrade. Not a scatter — these are the places a thing was tipped.
// **Ragged at the ends, and the raggedness is the point.** Laid as clean rectangles — which is what
// the first render did — crushed stone reads as a poured concrete pad, because a hard straight edge
// is the one thing tipped stone never has. Two hashed cells of slack at each end of each row turn a
// slab back into a surface somebody dumped.
for (const [col1, row1, col2, row2] of [
  [8, YARD_ROW, 20, YARD_ROW + 1], // the yard behind the chain link
  [6, SUBGRADE_ROW + 1, 24, SUBGRADE_ROW + 2], // stone laid on the west half of the second carriageway
  [34, SUBGRADE_ROW, 49, SUBGRADE_ROW + 1], // and on the east half
]) {
  for (let row = row1; row <= row2; row += 1) {
    const west = col1 + Math.round(hash01(col1, row, 3) * 2);
    const east = col2 - Math.round(hash01(col2, row, 4) * 2);
    for (let col = west; col <= east; col += 1) map.groundBlock(col, row, T.gravel);
  }
}

// --- the three streets ----------------------------------------------------------------------------
// Painted before the footpath network so their gids can be handed to it as `harder`: a poured walk
// meeting a street joins it rather than punching a grey rectangle through it.
for (let row = DRIVE_ROW; row <= DRIVE_ROW + 1; row += 1) {
  for (let col = 4; col <= 51; col += 1) map.groundBlock(col, row, T.street);
}
for (let row = BROAD_ROW; row <= BROAD_ROW + 1; row += 1) {
  for (let col = 4; col <= 51; col += 1) map.groundBlock(col, row, T.brickStreet);
}
// The old road, full height. Painted last of the three so the junctions are plain black-top: an
// intersection has no kerb through it and no centre line across it.
for (let row = YARD_ROW; row <= BROAD_WALK_ROW; row += 1) {
  for (let col = CROSS_COL; col <= CROSS_COL + 1; col += 1) map.groundBlock(col, row, T.asphalt);
}

// --- the footpath network's authored trunk ----------------------------------------------------------
// Four runs, and they are the two places on this map where somebody poured a public walk. Everything
// else that leads to a door is a spur generated from the door itself, at the bottom of this file.
const HARDER = new Set([
  ...blockGids(map, T.asphalt),
  ...blockGids(map, T.street),
  ...blockGids(map, T.brickStreet),
]);
const [SPUR_MATERIAL] = palette.road;
const roads = new RoadNetwork(map, T[SPUR_MATERIAL], { harder: HARDER });
roads.run(5, FAIR_WALK_ROW, 50, FAIR_WALK_ROW); // in front of the houses
roads.run(5, SOUTH_WALK_ROW, 50, SOUTH_WALK_ROW); // the drive's south side
roads.run(5, BOROUGH_WALK_ROW, 50, BOROUGH_WALK_ROW); // Broad Street's north side
roads.run(5, BROAD_WALK_ROW, 50, BROAD_WALK_ROW); // and its south side
// The old road, joining rather than repainting — every cell of it is already `harder`. This is the
// run that makes the network one network: without it `connectAll` would route the borough's doors to
// the borough's own sidewalk and leave the two halves of the map two unconnected graphs, which is
// exactly the defect scripts/lib/paths.js's note 1 records from Riverbend's quarter.
roads.run(CROSS_COL, FAIR_WALK_ROW, CROSS_COL + 1, BROAD_WALK_ROW);

// --- structures ---------------------------------------------------------------------------------
// Every stamp declares what it is and its collision rect falls out of that. `solid` blocks the whole
// footprint, `base` blocks the ground-contact row and lifts the rest to the overlay layer so the
// player walks behind it, `decor` blocks nothing.
//
// Each building people go into is collected as a door: `doorCellOf()` reads the cell below the
// centre of the stamp's ground-contact row, so the spur the router paints starts where a person
// would step out.
const doors = [];
const withDoor = (col, row, entry, label) =>
  doors.push(doorCellOf(map.stamp(col, row, entry, "solid", label)));

// --- Fairmeadow's frontage --------------------------------------------------------------------------
// Six houses on three plans, laid west to east so no two neighbours are alike, with the township
// building between the fifth and the sixth. What varies between the plans is where the car goes —
// carport, attached garage, or neither — because that is the difference a buyer of one of these
// actually chose between; see decision log 0095 §3.
//
// The gap at cols 24-28 is the old township road, which was here before any of them.
//
// **The model house is the one with a door**, and it is third from the west because that is where a
// developer put it: far enough up the street that two finished houses stand in front of it and the
// place already looks like somewhere, near enough the entrance to walk to.
const MODEL_HOUSE_COL = 20;
const FAIR_HOUSES = [
  [5, T.houseDriveway],
  [12, T.houseCarport],
  [MODEL_HOUSE_COL, T.houseGarage],
  [29, T.houseCarport],
  [37, T.houseDriveway],
  [48, T.houseGarage],
];
for (const [col, entry] of FAIR_HOUSES) {
  // Ground-contact row is fixed and the stamp's top floats, so a three-row plan and a two-row plan
  // stand on the same line. Doing it the other way round steps the whole street.
  const top = FAIR_FRONT_ROW - (entry.h ?? 1) + 1;
  if (col === MODEL_HOUSE_COL) withDoor(col, top, entry, "model house");
  else map.stamp(col, top, entry, "solid", "Fairmeadow house");
}

// The township building: two storeys of sash-windowed clapboard with a portico, and older than
// everything either side of it. A township that has been a township since 1734 does not build a new
// hall because a developer arrives; it puts the developer's plan of lots on the board outside the
// one it has.
withDoor(43, FAIR_FRONT_ROW - 3, T.townshipHall, "township building");

// --- Fairmeadow's front gardens ------------------------------------------------------------------------
// A car on every drive, parked beside its house rather than in front of it — which is what a
// driveway is, and the only way a three-tile car stands in a three-row setback at all. The last
// house has no apron and no car outside: its is in the garage, which is what that plan was sold for.
for (const [col, car] of [
  [9, T.sedanTwoTone],
  [17, T.stationWagon],
  [24, T.sedanDarkGreen],
  [34, T.sedanTwoTone],
  [41, T.stationWagon],
]) {
  // The apron: poured concrete from the kerb to the house line, two tiles wide, and joined to the
  // network rather than merely painted the same colour — a drive is how a door reaches a street.
  for (let row = FAIR_FRONT_ROW; row <= FAIR_WALK_ROW; row += 1) {
    roads.paint(col, row);
    roads.paint(col + 1, row);
  }
  map.stamp(col, FAIR_SETBACK_ROW - (car.h ?? 1) + 1, car, "solid", "parked car");
}

// Street trees, planted this June: whips in the setback, one to a lot, clear of the drives. Nothing
// on this street is taller than its own roof, and that is the finding rather than an omission — see
// note 4 in the palette header.
// Against the house line rather than out at the kerb, and that is a collision decision rather than a
// planting one: `saplingLilac` is three rows tall, and one row lower it puts its foot on the
// sidewalk and cuts the walk in two places.
//
// **The third whip is at col 19 rather than col 22, and that is the model house's front door.**
// Phase 97 planted one per lot on a regular-looking spacing and put this one squarely on the only
// door cell on this street — `doorCellOf()` gives (22,6) and a whip is two wide and three tall, so
// it covered cols 22-23 for rows 6 to 8 and left no way to stand in front of the door at all. The
// door still worked, because a player could reach it side-on from the gap at cols 20-21, which is
// exactly the kind of half-broken that ships. Nothing in the suite catches it: the visual-regression
// shots enter a room by setting `currentFieldRoom` and never touch a doorstep, and CLAUDE.md says
// so in as many words. **Check a new interior's door cell against the outdoor furniture as well as
// against the cast** — the cast was checked in Phase 97 and the furniture was not.
const WHIPS = [T.saplingApple, T.saplingBlossom, T.saplingLilac];
for (const [index, col] of [7, 14, 19, 31, 39, 46, 51].entries()) {
  map.stamp(col, FAIR_SETBACK_ROW - 2, WHIPS[index % WHIPS.length], "solid", "street tree");
}

// The notice board outside the township building. One of the seven records is a legal advertisement
// in small type pinned to exactly this, and it is out here rather than behind that door because a
// legal notice is published by being posted — a student who never opens the door still walks past
// it.
map.stamp(44, FAIR_SETBACK_ROW, T.noticeBoard, "solid", "township notice board");
map.stamp(45, FAIR_SETBACK_ROW, T.noticeBoardAlt, "solid", "township notice board");

// Utility-company lamps, the same standard on both sides of the highway, because the same company
// put them up. At the corners rather than one to a house, which is how a 1957 street was lit.
for (const [col, row] of [
  [11, FAIR_SETBACK_ROW - 1],
  [33, FAIR_SETBACK_ROW - 1],
  [18, SOUTH_WALK_ROW],
  [42, SOUTH_WALK_ROW],
  [14, BROAD_WALK_ROW],
  [40, BROAD_WALK_ROW],
]) {
  map.stamp(
    col,
    row,
    (col + row) % 2 === 0 ? T.streetLamp : T.streetLampAlt,
    "base",
    "street lamp"
  );
}

// --- the unsold lots ------------------------------------------------------------------------------------
// Scraped ground, lot corners, and the contractor's yard. Fairmeadow is going north and the player
// can see exactly how far it has got: the stakes are set out on the same pitch as the houses below
// them, which is a plan of lots being walked before it is built.
for (const col of [7, 14, 22, 31, 39, 46, 51]) {
  map.stamp(col, YARD_ROW, T.stake, "solid", "lot stake");
}
// Chain link along the yard's south side — the only new fence anywhere on this map, and face-on, so
// it runs east-west and nothing else. Panels with a gate in them rather than a continuous run,
// because a contractor's fence is panels and because a run with no way through would seal a
// thousand cells of ground off from the map.
for (let col = 9; col <= 19; col += 1) {
  if (col === 13 || col === 14) continue; // the gate
  map.stamp(col, YARD_ROW + 2, T.chainLink, "base", "contractor's fence");
}
for (const [col, row, entry] of [
  [9, YARD_ROW, T.brickPallet],
  [12, YARD_ROW, T.cinderBlocks],
  [15, YARD_ROW, T.sandPile],
  [18, YARD_ROW, T.gravelPile],
  [34, YARD_ROW, T.brickStack],
  [37, YARD_ROW, T.roofingRoll],
  [41, YARD_ROW, T.cementBags],
  [49, YARD_ROW, T.emptyPallet],
]) {
  map.stamp(col, row, entry, "solid", "contractor's materials");
}
map.stamp(28, YARD_ROW, T.timberBaulk, "solid", "framing timber");

// --- the corridor ---------------------------------------------------------------------------------------
// Guard rail along the finished carriageway's north shoulder, in broken runs with gaps between them,
// because it is installed on the side that is finished and not on the side that is still dirt.
//
// **The gaps are the map's premise.** A continuous rail would make the boundary real, and the whole
// point of this map is that nothing on the ground stops anybody: the line that decides is a rating
// sheet in an office on the far side of it. `base` rather than `solid`, so a body on the shoulder is
// drawn behind the beam rather than in front of it.
for (let col = 5; col + 2 <= 51; col += 6) {
  if (col >= CROSS_COL - 4 && col <= CROSS_COL + 2) continue; // the old road's crossing
  map.stamp(col, SHOULDER_ROW, T.guardRail, "base", "highway guard rail");
}
// Two short lengths lying on the south shoulder, delivered and not yet set: the contractor is
// working west to east and has not reached this side.
for (const col of [8, 46]) {
  map.stamp(col, SUBGRADE_ROW + 3, T.guardRailShort, "base", "guard rail, delivered");
}
// The plant, on the carriageway that is not built. The same objects as the contractor's yard fifteen
// rows north, because in this township in 1957 they were the same contractor's.
for (const [col, row, entry] of [
  [10, SUBGRADE_ROW, T.gravelPile],
  [16, SUBGRADE_ROW, T.sandPile],
  [31, SUBGRADE_ROW + 1, T.gravelPile],
  [38, SUBGRADE_ROW, T.emptyPallet],
  [45, SUBGRADE_ROW + 1, T.sandPile],
]) {
  map.stamp(col, row, entry, "solid", "highway plant");
}
for (const [col, row] of [
  [12, SUBGRADE_ROW + 1],
  [34, SUBGRADE_ROW + 1],
  [49, SUBGRADE_ROW],
]) {
  map.stamp(col, row, T.timberBaulk, "solid", "formwork timber");
}
// Survey stakes down the centre line of the carriageway nobody has built. Somebody has already
// decided where it goes, which on this map is the sentence under everything.
for (let col = 6; col <= 50; col += 6) {
  if (col >= CROSS_COL - 1 && col <= CROSS_COL + 2) continue;
  map.stamp(col, SUBGRADE_ROW + 2, T.stake, "solid", "survey stake");
}

// --- the borough's frontage -------------------------------------------------------------------------------
// A two-hundred-year street, and it is not continuous: three runs with three gaps, because the
// player arrives from the north and meets the backs of these buildings first. Without a way through,
// half this map is a wall — see note 5 in the palette header.
//
// The west gap is the churchyard, the middle one is where the old township road comes down into
// Broad Street, and the east one is open ground with two old trees standing on it.
for (const [col, entry, label] of [
  [11, T.houseCream, "borough house"],
  [14, T.churchSteeple, "borough church"],
  [17, T.houseYellow, "borough house"],
  [20, T.houseRed, "borough house"],
  [22, T.houseBlue, "borough house"],
  [30, T.shopRange, "borough shopfronts"],
  [39, T.commercialRow, "commercial block"],
  [43, T.commercialRowAlt, "commercial block"],
  [48, T.houseBrown, "borough house"],
]) {
  map.stamp(col, BOROUGH_FRONT_ROW - (entry.h ?? 1) + 1, entry, "solid", label);
}
// **The building & loan, and its placement is what the southern half of this map is built around.**
// The institution that reads the appraisal has its own office standing on the ground the appraisal
// writes off. Four tiles of pale ashlar in the middle of a brick row — which is what a savings
// association built for itself in the 1920s, and the flagged half of a registered gap: see note 6 in
// the palette header.
withDoor(35, BOROUGH_FRONT_ROW - 3, T.buildingAndLoan, "building & loan association");

// --- the borough's trees and yards ---------------------------------------------------------------------------
// Mature stock, and a great deal of it. This is the loudest thing on the map and it is making an
// argument rather than a decoration: two centuries of growth over the side an appraiser gave fifteen
// years to, and whips over the side he gave forty.
// **Green stock only, and this is a date check rather than a taste one.** `derived/farm-trees.png`
// carries its maple in autumn dress and its cherry in fruit, and the first render of this map had a
// third of the borough turning orange under an August sky. The month is not decoration here — the
// deed is dated March 1953, the appraisal May 1957 and the map August 1957 — and a reader who can
// see a maple can see that somebody was not paying attention.
const CANOPY = [T.treeOak, T.treePine, T.treeBirch, T.treeApple];
// **Planted by the row the trunk stands on, not by the row the crown starts on**, because these are
// two, three and four rows tall and a list of stamp tops puts three of them a row past the mask
// with their feet in the frame. The north verge first — the strip between the highway's south
// shoulder and the backs of the frontage — and every one of these stands in a gap between buildings
// rather than behind one. The old road at cols 26-27 is deliberately clear: the first render put an
// oak in the middle of it.
for (const [index, [col, base]] of [
  [4, BOROUGH_FRONT_ROW - 1],
  [8, BOROUGH_FRONT_ROW],
  [24, BOROUGH_FRONT_ROW],
  [28, BOROUGH_FRONT_ROW - 1],
  [31, BOROUGH_FRONT_ROW - 2],
  [47, BOROUGH_FRONT_ROW - 2],
  [50, BOROUGH_FRONT_ROW],
  // ...then the back yards, where two centuries of somebody's planting is the point.
  [6, YARDS_ROW + 2],
  [12, YARDS_ROW + 3],
  [18, YARDS_ROW + 2],
  [24, YARDS_ROW + 3],
  [28, YARDS_ROW + 1],
  [31, YARDS_ROW + 2],
  [35, YARDS_ROW + 3],
  [37, YARDS_ROW + 3],
  [44, YARDS_ROW + 2],
  [46, YARDS_ROW + 3],
  [49, YARDS_ROW + 3],
].entries()) {
  const entry = CANOPY[index % CANOPY.length];
  map.stamp(col, base - (entry.h ?? 1) + 1, entry, "base", "borough tree");
}
// The frame below the mask: a heavy treeline, so the edge of the world going south is two hundred
// years of growth rather than the row the tiles stop on. `decor` — the whole footprint is outside
// the walkable rectangle, so a collision rect there is unreachable by construction, and
// field-map-coordinates.test.js reads an unreachable rect on non-land as a building standing in the
// sea. Same rule Cottonwood Junction's framing cottonwoods run under.
for (let col = 2; col <= 53; col += 4) {
  map.stamp(col, TREELINE_ROW, CANOPY[col % CANOPY.length], "decor", "treeline");
}

// Coursed stone along the churchyard, picket around two of the yards. Face-on, so east-west only,
// and Fairmeadow has none of either: the deed permits four feet forward of the building line and
// what a 1957 tract did with that permission was leave the lawns open.
// **Not along the pavement, which is where the first pass put it.** A churchyard wall does front the
// street, and eight tiles of `base` on row 26 severed the borough's own north sidewalk for a third
// of its length — a wall the player has to walk around by stepping into the road. It runs along the
// back of the burial ground instead, which is where the wall of an old borough churchyard mostly is
// anyway, and the pavement is clear from end to end.
for (let col = 6; col <= 12; col += 2) {
  map.stamp(col, YARDS_ROW, T.stoneWall, "base", "churchyard wall");
}
for (const [col1, col2, row] of [
  [8, 16, YARDS_ROW + 3],
  [33, 41, YARDS_ROW + 3],
]) {
  for (let col = col1; col + 1 <= col2; col += 2) {
    map.stamp(col, row, T.picketFence, "base", "yard fence");
  }
}
// Split rail along the open ground at the east end, which is field rather than yard.
for (let col = 45; col <= 51; col += 1) {
  map.stamp(col, YARDS_ROW, col % 2 === 0 ? T.railFence : T.railFenceAlt, "base", "rail fence");
}
// Two outbuildings on the back lots — a stable and a shed, both older than whatever replaced what
// was kept in them.
for (const [col, row] of [
  [20, YARDS_ROW + 1],
  [40, YARDS_ROW],
]) {
  map.stamp(col, row, T.shed, "solid", "borough outbuilding");
}
// Roses and flowering shrub against the frame houses. The borough's planting is somebody's, house by
// house; Fairmeadow's is the developer's, one whip to a lot, and the difference shows at a glance.
for (const [col, row, entry] of [
  [10, BOROUGH_WALK_ROW - 1, T.bushRose],
  [19, BOROUGH_WALK_ROW - 1, T.bushFlowering],
  [47, BOROUGH_WALK_ROW - 1, T.bushRose],
  [9, YARDS_ROW + 2, T.bushRose],
  [36, YARDS_ROW + 1, T.bushFlowering],
]) {
  map.stamp(col, row, entry, "solid", "garden planting");
}

// --- spurs: every door reaches the poured walk ---------------------------------------------------------------
// Run after every solid, base and decor stamp above: the router treats anything already occupied as
// impassable, so routing earlier would thread a spur under a stamp whose collision rect then blocks
// the very path it painted.
const spurs = connectAll(roads, { doors, isLand: isFairmeadowLand });

// --- scatter ------------------------------------------------------------------------------------------------
// Two passes, and they are deliberately different densities, because the two halves of this map are
// two different ages of ground. The borough's yards get long grass and shrub at 4%; Fairmeadow's
// lawns get nothing at all. A tract two weeks old has no volunteer growth on it, and putting some
// there would quietly undo the one contrast the whole map is built to make.
const YARD_SCATTER = [T.bushRose, T.bushFlowering];
for (let row = YARDS_ROW; row < TREELINE_ROW; row += 1) {
  for (let col = 5; col < 51; col += 1) {
    if (map.occupied(col, row) || roads.has(col, row)) continue;
    if (hash01(col, row, 11) >= 0.04) continue;
    map.stamp(col, row, pick(YARD_SCATTER, col, row, 7), "solid", "yard planting");
  }
}

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("FAIRMEADOW_FIELD_BLOCKS", "scripts/generate-fairmeadow-tmj.js", {
    isLand: isFairmeadowLand,
    doors,
    roads: roads.cells,
  })
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
console.log(`  ${spurs.connected}/${doors.length} doors connected to the poured walk`);
if (spurs.unreachable.length > 0) {
  // Hard failure, not a warning. A building with no path to it is the exact defect this pipeline
  // exists to prevent, and a warning in a build nobody watches is how it would come back.
  throw new Error(
    `no route to the poured walk from: ${JSON.stringify(spurs.unreachable)} - either the door is ` +
      `walled in by neighbouring stamps, or the trunk does not reach that part of the map`
  );
}
