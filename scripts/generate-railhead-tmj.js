// Generates apps/web/src/content/maps/railhead-field.tmj and its collision module for case-016
// ("Cottonwood Junction", Unit 6's Kansas railhead, June 1873).
//
// Run with: node scripts/generate-railhead-tmj.js
//
// Which tile is prairie, creek or depot comes from
// apps/web/src/content/tilesets/maps/railhead-field.palette.js. Layering, terrain-block tiling and
// collision come from scripts/lib/map-builder.js. This script owns layout and the land mask.
//
// Building anchors are load-bearing: UNIT6_FIELD_NPCS and UNIT6_FIELD_SOURCE_POINTS in
// apps/web/src/main.js place people and readable records relative to them, so a building may be
// resized but not moved without checking those. tests/unit/field-map-coordinates.test.js holds the
// two together.
//
// ── The layout argument ─────────────────────────────────────────────────────────────────────────
// The line runs east-west across the whole map and everything is placed by which side of it a
// thing is on. That is the map making the unit's claim without a word of dialogue:
//
//   NORTH of the line   the town. Depot, land office, telegraph office, town-site office, store —
//                       every building on this map where a piece of paper is made or kept, plus
//                       the homestead claim in the north-east, which is what the paper buys.
//   SOUTH of the line   what the paper is for, west to east: the Kanza village on the creek, the
//                       hide yard, the graders' camp, and the stock pens at the loading chute.
//
// The player crosses the line freely — see note 1 in the palette header. The division is a
// composition, not a wall, and a map that fenced its own argument off would be teaching that the
// separation was natural rather than made.
//
// The south-west corner is deliberate and is the hardest thing on this map to get right. A village
// in the middle of being removed sits upstream on the creek, with its crops still planted and its
// racks still hung; a quarter mile east is the camp grading the line that the removal paid for.
// Neither is drawn as a ruin and neither is drawn as a curiosity. They are two places on one
// morning.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/railhead-field.palette.js";
import { MapBuilder, hash01, pick } from "./lib/map-builder.js";
import { RoadNetwork, connectAll, doorCellOf } from "./lib/paths.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/railhead-field.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/railhead-field.blocks.js");

const WIDTH = 56;
const HEIGHT = 36;

// The line. Everything on this map is placed relative to it, so it is a constant rather than a
// literal repeated down the file.
const TRACK_ROW = 18;

// --- must stay in lockstep with apps/web/src/main.js's isRailheadLand() ---
// Deliberately duplicated rather than imported: main.js is a browser bundle entry, and the one
// thing that must never silently diverge is the water the player collides with versus the water
// that got painted.
//
// Cottonwood Creek runs down the western edge, bending east as it goes south, and everything west
// of it is outside the walkable rectangle. So there is no far bank to strand a player on: the
// creek is a boundary the map is drawn against rather than an obstacle inside it. The one place it
// is crossed is the ford at the line, which is why a town is here at all — a locomotive takes
// water, and a grade crosses where the banks are lowest.
function creekEastBank(y) {
  return 4.6 + Math.max(0, y - 16.0) * 0.3 + Math.sin(y * 0.31) * 1.3;
}
function creekWestBank(y) {
  return creekEastBank(y) - 3.4;
}
const FORD_ROWS = [TRACK_ROW - 1, TRACK_ROW, TRACK_ROW + 1];
function isCreek(x, y) {
  if (FORD_ROWS.some((row) => y >= row && y < row + 1)) return false;
  return x <= creekEastBank(y) && x >= creekWestBank(y);
}
// The walkable rectangle stops short of the map edge on all four sides so the framing scatter
// falls entirely OUTSIDE it. Same reasoning as Riverbend's tree line: a reachable trunk needs
// collision, and framing is scenery rather than an obstacle course.
function isRailheadLand(x, y) {
  if (x < 7.0 || x > 53.5 || y < 4.0 || y > 32.0) return false;
  return !isCreek(x, y);
}

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

// --- ground -------------------------------------------------------------------------------------
// Prairie covers the out-of-bounds margin too: the margin is framed by the creek and its trees
// rather than by a visible edge of nothing.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    const cx = col + 0.5;
    const cy = row + 0.5;
    let block = T.grass;
    if (isCreek(cx, cy)) {
      block = isCreek(cx + 1.0, cy) && isCreek(cx - 1.0, cy) ? T.water : T.surf;
    } else if (isCreek(cx - 1.0, cy) || isCreek(cx + 1.0, cy)) {
      block = T.shoreSand; // the bank, both sides
    }
    map.groundBlock(col, row, block);
  }
}

// The roadbed and the two working yards, all in the same packed earth as the streets — see the
// `road` note in the palette for why there is no second, lighter ground. Painted before the road
// network, so a street laid across a yard still routes and still reads.
function yard(col1, row1, col2, row2) {
  for (let row = row1; row <= row2; row += 1) {
    for (let col = col1; col <= col2; col += 1) {
      if (isCreek(col + 0.5, row + 0.5)) continue;
      map.groundBlock(col, row, T.dirt);
    }
  }
}
yard(0, TRACK_ROW - 1, 55, TRACK_ROW + 1); // the graded roadbed, edge to edge
// Front Street's whole apron, joining the shopfronts to the roadbed as one surface. A green strip
// between the street and the track is what the first pass drew, and it read as two parallel roads
// with a lawn between them; a railhead town's frontage was dirt from the shop door to the rails.
yard(12, 12, 44, TRACK_ROW - 2);
yard(37, 21, 53, 30); // the stock yards
yard(25, 22, 35, 30); // the graders' camp

// --- roads --------------------------------------------------------------------------------------
// Four deliberate runs. Front Street parallel to the line on the town side, a cross street north
// from the depot, the yard road on the south side serving the pens and the camp, and the grade
// crossing that joins the two halves. Everything else that leads to a door is a spur generated
// from the door itself, at the bottom of this file — see scripts/lib/paths.js for why roads are no
// longer authored as coordinates.
const roads = new RoadNetwork(map, T[palette.road[0]]);
roads.run(13, 13, 45, 13); // Front Street
roads.run(30, 7, 30, 16); // the cross street, north from the depot
roads.run(19, 25, 48, 25); // the yard road, south of the line
roads.run(30, 16, 30, 25); // the grade crossing

// --- crop plots ---------------------------------------------------------------------------------
// Worked soil on the ground, the planting above it: every one of `farm/6`'s planted blocks is
// 12-16% see-through, so laying one straight onto the ground layer shows the page background as
// hard black grid lines through every field. Both layers tile the authored block by parity. Crops
// carry no collision — the player walks the rows.
//
// Recorded so the path router routes around the fields rather than through them: their planted
// cells are `occupied` and therefore already excluded, but the ~7% left bare for texture are not,
// and a spur threading between those would put a road through the middle of a wheat bed.
const PLOT_RECTS = [];
function plot(col1, row1, col2, row2, block) {
  PLOT_RECTS.push({ col1, row1, col2, row2 });
  for (let row = row1; row <= row2; row += 1) {
    for (let col = col1; col <= col2; col += 1) {
      if (!isRailheadLand(col + 0.5, row + 0.5)) continue;
      map.groundBlock(col, row, T.soil);
      // The odd bed is left bare so the fields do not read as printed wallpaper. Decided per 2x2
      // bed rather than per cell: one bare cell inside a planted block reads as a hole punched in
      // the crop rather than as ground waiting to be sown.
      if (hash01(Math.floor(col / 2), Math.floor(row / 2), 3) < 0.04) continue;
      map.decorBlock(col, row, block);
    }
  }
}
// The claim: one quarter-section's worth of the 160 acres the reserve was resold in, fenced and
// under wheat. This is what a buyer got, and it is deliberately the most orderly ground on the map.
plot(45, 4, 52, 7, T.plotWheat);
plot(45, 8, 52, 9, T.plotSunflower);
// The Kanza women's corn ground, on the creek north of the village. It is planted and being worked
// in the same June the land office is selling the section it stands on.
plot(8, 21, 15, 26, T.plotMaize);

// --- the line -----------------------------------------------------------------------------------
// Laid on `structures` with no collision, because the running-line tile is transparent above and
// below its ballast and a transparent pixel on the ground layer is a hole through to the page.
// `decorBlock` tiles the two clean track columns by parity, so the rails run unbroken.
for (let col = 0; col < WIDTH; col += 1) {
  map.decorBlock(col, TRACK_ROW, T.track);
}

// --- structures ---------------------------------------------------------------------------------
// Every stamp declares what it is and its collision rect falls out of that. `solid` blocks the
// whole footprint, `base` blocks the ground-contact row and lifts the rest to the overlay layer so
// the player walks behind a canopy, `decor` blocks nothing.
//
// Each building is collected as a door: `doorCellOf()` reads the cell below the centre of the
// stamp's ground-contact row, so the spur the router paints starts where a person would step out.
const doors = [];
const withDoor = (col, row, entry, label) =>
  doors.push(doorCellOf(map.stamp(col, row, entry, "solid", label)));

// --- the depot ----------------------------------------------------------------------------------
// Both assemblies are three rows deep and their bottom row IS track — see note 2 in the palette
// header. Anchoring at TRACK_ROW - 2 is what lines their rails up with the running line either
// side; anchoring anywhere else leaves a visible step in the permanent way.
withDoor(25, TRACK_ROW - 2, T.depot, "depot");
map.stamp(33, TRACK_ROW - 2, T.depotPlatform, "solid", "covered platform");
// The freight deck runs east from the platform, one row BELOW the rails and on `structures`, not
// on the ground. Its top four pixel rows are transparent — the sheet draws it as a deck seen from
// slightly above with the ballast showing past its edge — so on the ground layer that transparency
// is a hole through to the page, which is exactly the black bar the first pass rendered. Above the
// ground it composites over the packed earth, and `decor` leaves it walkable, which a loading
// platform should be.
map.stamp(38, TRACK_ROW + 1, T.freightDeck, "decor", "freight deck");
// The tank, which is the reason a division point is here rather than five miles on. Two rows tall,
// one wide, standing where the pipe from the creek would run.
map.stamp(16, TRACK_ROW - 3, T.waterTower, "solid", "water tank");
map.stamp(18, TRACK_ROW - 3, T.waterTowerAlt, "solid", "water tank");

// --- the town, north of the line ----------------------------------------------------------------
// Front Street runs at row 13 and every door on it faces south toward the track, which is the way a
// railhead town was actually laid out: the line came first and the street was surveyed against it.
// The three paper buildings stand together at the centre, because the land agent, the register and
// the promoter did their business within a hundred yards of each other and the map should not
// pretend they were separate concerns.
withDoor(18, 10, T.landOffice, "land office");
withDoor(22, 10, T.telegraphOffice, "telegraph office");
withDoor(27, 10, T.townsiteOffice, "town-site office");
withDoor(32, 10, T.store, "store");
withDoor(13, 10, T.frontageA, "boarding house");
withDoor(37, 10, T.frontageB, "eating house");
withDoor(42, 10, T.frontageC, "freight agent's office");
// The south side of the street, between the shopfronts and the rails. The two tanks stand where a
// pipe from the creek would run, and the section house is the crew that keeps this stretch of line.
withDoor(12, 15, T.stable, "livery stable");
withDoor(20, 15, T.sectionHouse, "section house");
// The notice board outside the land office, where the sale of the reserve is posted. On the street
// side of the office rather than beside its door, so a player reads it on the way in.
map.stamp(19, 13, T.noticeBoard, "solid", "notice board");
map.stamp(16, 13, T.trough, "decor", "water trough");
map.stamp(30, 13, T.hitchRail, "decor", "hitching rail");
map.stamp(40, 12, T.barrels, "solid", "barrels");
map.stamp(41, 13, T.crates, "decor", "crates");
map.stamp(39, 13, T.sacks, "decor", "sacks");
map.stamp(15, 13, T.oxWagon, "solid", "freight wagon");

// --- the claim, north-east ------------------------------------------------------------------
// A quarter section under fence: cabin, well, and split rail along the road edge of the wheat. The
// fence is the point of the whole corner — split rail is this map's way of saying a thing is owned,
// and it is the only fence here that encloses ground rather than animals.
withDoor(42, 5, T.claimCabin, "claim cabin");
map.stamp(42, 8, T.well, "solid", "well");
for (let col = 45; col + 1 <= 52; col += 2) {
  const gate = col === 49;
  const rail = (col / 2) % 2 === 0 ? T.fenceRail : T.fenceRailAlt;
  map.stamp(col, 10, gate ? T.fenceGate : rail, gate ? "decor" : "solid", "claim fence");
  // A gate with no track running up to it is the same defect as a house standing in open grass.
  if (gate) doors.push({ col, row: 11 });
}

// --- the stock yards, south-east ------------------------------------------------------------
// Empty pens; the pack has no cattle and that is recorded in the palette header rather than hidden.
// The chute is nearest the line because that is the only reason the pens are here at all — stock
// walked up it into a car.
map.stamp(38, 21, T.penChute, "solid", "loading chute");
map.stamp(42, 21, T.pen, "solid", "stock pen");
map.stamp(46, 21, T.pen, "solid", "stock pen");
map.stamp(38, 27, T.penWide, "solid", "stock pen");
map.stamp(44, 27, T.penWide, "solid", "stock pen");
withDoor(50, 21, T.stockBarn, "stock barn");
map.stamp(50, 27, T.stockTrough, "decor", "stock trough");
map.stamp(51, 25, T.hayStack, "decor", "hay");
map.stamp(37, 24, T.hayBales, "decor", "hay");

// --- the graders' camp, south-centre ---------------------------------------------------------
// Wall tents in a line, which is how a construction camp was pitched, plus the section house and
// the wagons that fed it. Army pattern is right rather than borrowed: the Kansas branches ran their
// camps out of Civil War surplus, and the graders on this map are the veterans and the immigrants
// who came with it.
map.stamp(26, 22, T.wallTent, "solid", "graders' tent");
map.stamp(30, 22, T.wallTent, "solid", "graders' tent");
map.stamp(34, 22, T.wallTent, "solid", "graders' tent");
map.stamp(27, 28, T.wallTent, "solid", "graders' tent");
map.stamp(32, 28, T.wallTent, "solid", "graders' tent");
map.stamp(35, 27, T.supplyWagon, "solid", "supply wagon");
map.stamp(26, 26, T.supplyWagon, "solid", "grading wagon");

// --- the hide yard ----------------------------------------------------------------------------
// The buffalo-hide trade came up the same line and is why the pens are not the only thing on this
// side. Set between the village and the camp, and downwind of the town by a good margin.
withDoor(20, 28, T.hideShed, "hide shed");
map.stamp(23, 30, T.railFence, "solid", "hide yard fence");
map.stamp(18, 31, T.railFence, "solid", "hide yard fence");

// --- the Kanza village, on the creek south of the line ----------------------------------------
// Four bark lodges, a drying rack, a staked hide and two of the agency stone huts, upstream of the
// ford with the corn ground north of them. Not an encampment beside a town: a village, with its own
// ground and people working in it. THE-MAP-PROGRAM.md §5 is explicit that the presence here is
// current and organised rather than residual, and that the people in it are in the middle of being
// removed rather than already gone.
//
// **None of these is added to `doors`.** A door here would run the town's dirt streets up to a
// lodge, and the road network is the town's — annexing the village onto it is the map making a
// claim the unit spends three missions complicating. The village has its own ground and no road
// reaches it.
map.stamp(9, 28, T.barkLodge, "solid", "lodge");
map.stamp(13, 28, T.barkLodge, "solid", "lodge");
map.stamp(9, 31, T.barkLodge, "solid", "lodge");
map.stamp(13, 31, T.barkLodge, "solid", "lodge");
map.stamp(16, 28, T.dryingRack, "solid", "drying rack");
map.stamp(16, 31, T.hideStretcher, "solid", "hide stretcher");
// The two agency huts, which the government built and nobody lives in. Set apart from the lodges,
// because they were built where the agency wanted them rather than where the village was.
map.stamp(17, 21, T.agencyStoneHut, "solid", "agency stone hut");
map.stamp(19, 22, T.agencyStoneHut, "solid", "agency stone hut");

// --- spurs: every door reaches the road network -------------------------------------------------
// Run after every solid, base and decor stamp above: the router treats anything already occupied as
// impassable, so routing earlier would thread a spur under a stamp whose collision rect then blocks
// the very path it painted.
const inPlot = (col, row) =>
  PLOT_RECTS.some((r) => col >= r.col1 && col <= r.col2 && row >= r.row1 && row <= r.row2);
const spurs = connectAll(roads, { doors, isLand: isRailheadLand, avoid: inPlot });

// --- trees: the creek line only -----------------------------------------------------------------
// Cottonwood grows on the plains where there is water and essentially nowhere else, which is why
// this map's trees are a ribbon along the creek rather than a scatter across it. Everything east of
// the bank is open tallgrass, and a treeline out there would be the same error as the cactus,
// inverted.
const CREEK_TREES = [T.treeOak, T.treeBirch];
const GRASS_GIDS = new Set([
  map.blockGidAt(0, 0, T.grass),
  map.blockGidAt(1, 0, T.grass),
  map.blockGidAt(0, 1, T.grass),
  map.blockGidAt(1, 1, T.grass),
]);
/**
 * Is every cell of this footprint free, and does the thing stand on grass?
 *
 * Both halves are load-bearing and the first pass had neither.
 *
 * `map.occupied(col, row)` alone tests one cell, so a three-row tree anchored one row above a
 * lodge reported clear and then drew itself over the roof — which is what the first render of the
 * village showed, twice. The whole footprint has to be free.
 *
 * The ground test is only on the **base row**, deliberately. It is what keeps a cottonwood out of
 * the middle of the corn, off the roadbed and out of the yards, without needing to know where any
 * of those are — but requiring the canopy rows to be grass as well is stricter than the world is,
 * and it deleted every tree on the lower creek, where a crown legitimately overhangs the sand.
 */
function freeGrassRect(col, row, entry) {
  const h = entry.h ?? 1;
  const w = entry.w ?? 1;
  for (let r = 0; r < h; r += 1) {
    for (let c = 0; c < w; c += 1) {
      if (!map.inBounds(col + c, row + r)) return false;
      if (map.occupied(col + c, row + r)) return false;
    }
  }
  for (let c = 0; c < w; c += 1) {
    if (!GRASS_GIDS.has(map.ground[map.index(col + c, row + h - 1)])) return false;
  }
  return true;
}
let treeIndex = 0;
for (let row = 2; row < 34; row += 3) {
  const east = Math.round(creekEastBank(row + 0.5)) + 1;
  const west = Math.round(creekWestBank(row + 0.5)) - 4;
  for (const col of [west, east]) {
    const entry = CREEK_TREES[treeIndex % CREEK_TREES.length];
    if (!freeGrassRect(col, row, entry)) continue;
    // `base` only inside the walkable rectangle. A framing tree on the margin gets `decor`:
    // its trunk is somewhere the player can never stand, so a collision rect there is unreachable
    // by construction — and tests/unit/field-map-coordinates.test.js reads an unreachable rect on
    // non-land as a tree standing in the creek, which is exactly what it would look like.
    const baseRow = row + (entry.h ?? 1) - 1;
    const standable = isRailheadLand(col + 0.5, baseRow + 0.5);
    map.stamp(col, row, entry, standable ? "base" : "decor", "creek cottonwood");
    treeIndex += 1;
  }
}

// --- scatter: low scrub in the creek bottom, and nothing on the prairie -------------------------
// Kept inside eight tiles of the water on purpose. Tallgrass is grass; the shrubs and forbs are
// down where the ground is wet, and scattering bushes evenly across the whole map would draw
// parkland. The east half of this map is meant to look like nothing is there, because from a
// surveyor's chain nothing was — which is exactly the claim the unit's records complicate.
const BUSHES = [T.bushBerry, T.bushFlowering];
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (col > creekEastBank(row + 0.5) + 8) continue;
    const bush = pick(BUSHES, col, row, 8);
    if (!freeGrassRect(col, row, bush)) continue;
    if (hash01(col, row, 7) >= 0.12) continue;
    map.stamp(col, row, bush, "decor", "creek scrub");
  }
}

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("RAILHEAD_FIELD_BLOCKS", "scripts/generate-railhead-tmj.js", {
    doors,
    roads: roads.cells,
  })
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
console.log(`  ${spurs.connected}/${doors.length} doors connected to the road network`);
if (spurs.unreachable.length > 0) {
  // Hard failure, not a warning. A building with no path to it is the exact defect this pipeline
  // exists to prevent, and a warning in a build nobody watches is how it would come back.
  throw new Error(
    `no route to the road network from: ${JSON.stringify(spurs.unreachable)} - either the door is ` +
      `walled in by neighbouring stamps, or the trunk does not reach that part of the map`
  );
}
