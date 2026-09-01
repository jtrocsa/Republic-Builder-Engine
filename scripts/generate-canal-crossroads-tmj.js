// Generates apps/web/src/content/maps/canal-crossroads-field.tmj and its collision module for
// Unit 4's field map ("Canal Crossroads") — a fictional but grounded Erie Canal boomtown in
// upstate New York, 1845.
//
// Run with: node scripts/generate-canal-crossroads-tmj.js
//
// Which tile is which building comes from
// apps/web/src/content/tilesets/maps/canal-crossroads-field.palette.js. Layering, terrain-block
// tiling and collision come from scripts/lib/map-builder.js. This script owns layout, the canal,
// and the two crossings.
//
// Building anchors are load-bearing: UNIT4_FIELD_NPCS and UNIT4_FIELD_SOURCE_POINTS in
// apps/web/src/main.js place people and readable sources relative to them — the lock keeper at the
// lock's foot, the notice board's record on the board itself — so a building may be resized but not
// moved without checking those.
//
// The shape of the town, and why:
//
//   rows  2-7    the districts' buildings, fronting the street from the north
//   rows  8-9    MARKET STREET, cols 5-52
//   rows 10-16   the canal-front band: mill, workshops, warehouses, the basin quay
//   rows 15-18   THE CANAL — a two-row channel that opens into a four-row basin at cols 28-42
//   row  19      the south coping
//   rows 20-21   THE TOWPATH, cols 3-53
//   rows 22-33   the Immigrant Quarter (west) and the Farm & Turnpike edge (east)
//
// The canal is the spine every district touches, and the only two ways over it are the lock walk
// at cols 21-22 and the plank bridge at cols 46-47 — twenty-five columns apart, so each one serves
// a different pair of districts. (The brief's sketch put them six columns apart, which makes one of
// them redundant.) Both are spatial, not gated: nothing on this map checks progress.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/canal-crossroads-field.palette.js";
import { MapBuilder, hash01, pick } from "./lib/map-builder.js";
import { RoadNetwork, blockGids, connectAll, doorCellOf } from "./lib/paths.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/canal-crossroads-field.tmj");
const BLOCKS_OUT = path.join(
  REPO_ROOT,
  "apps/web/src/content/maps/canal-crossroads-field.blocks.js"
);

const WIDTH = 56;
const HEIGHT = 36;

// --- must stay in lockstep with apps/web/src/main.js's isCanalCrossroadsLand() ---
// Deliberately duplicated rather than imported (decision log 0036): main.js is a browser bundle
// entry, and the one thing that must never silently diverge is the bank the player collides with
// versus the bank that got painted.
//
// The south bank never moves. A towpath has to be a straight walk for a mule team, and the canal
// was dug back into the *north* side where boats tie up — so the basin widens northward only, over
// a two-column taper at each end so the opening is not a square corner.
const CHANNEL_TOP = 16.9;
const CHANNEL_BOTTOM = 18.9;
const BASIN_DEPTH = 2.0;
const clamp01 = (t) => Math.max(0, Math.min(1, t));
function canalNorthBank(x) {
  const opening = Math.min(clamp01((x - 26.0) / 2.0), clamp01((44.0 - x) / 2.0));
  return CHANNEL_TOP - opening * BASIN_DEPTH;
}
function isCanalCrossroadsLand(x, y) {
  if (x < 2.0 || x > 54.0 || y < 1.5 || y > 34.5) return false;
  // The two crossings, both diegetic and neither gated. The lock walk is the lock's own gates; the
  // bridge is plank decking on pilings. Their widths are chosen against footBoxFor()'s 0.68-tile
  // foot: 2.3 tiles of land leaves a 1.62-tile lane, which is single file and is meant to be.
  if (x > 20.85 && x < 23.15) return true;
  if (x > 45.85 && x < 48.15) return true;
  return y < canalNorthBank(x) || y > CHANNEL_BOTTOM;
}

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

// The basin quay: the one paved surface in town. Everything else is mud, which is the point — the
// money went into the canal, and the paving stops where the canal's business does.
const onQuay = (col, row) => col >= 26 && col <= 45 && row >= 13 && row <= 14;
// The two crossing bands, in columns. Nothing that lines the bank may run across one of these.
const onCrossing = (col) => (col >= 20 && col <= 23) || col === 46 || col === 47;
/** The row the water starts in on each bank — where the coping goes. */
const northBankRow = (col) => Math.floor(canalNorthBank(col + 0.5));
const SOUTH_BANK_ROW = Math.floor(CHANNEL_BOTTOM) + 1;

// --- ground -------------------------------------------------------------------------------------
// Paving under both bank rows, not the coping itself: the coping is a cut-out with clear pixel rows
// top and bottom and belongs on `structures`, laid over this. See the palette's note on it.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    const cy = row + 0.5;
    const top = canalNorthBank(col + 0.5);
    let block;
    if (cy > top && cy < CHANNEL_BOTTOM) {
      block = T.water;
    } else if (row === northBankRow(col) || row === SOUTH_BANK_ROW || onQuay(col, row)) {
      block = T.cobble;
    } else {
      block = T.grass;
    }
    map.groundBlock(col, row, block);
  }
}

// Every gid the quay's cobble can paint. Used twice: to fold the paved apron into the road network,
// and to keep a packed-earth spur from punching a brown rectangle through the stone.
const COBBLE_GIDS = blockGids(map, T.cobble);

// --- the road network's authored trunk ------------------------------------------------------------
// Five runs, each of which is a road because the town has a reason for it, not because a rectangle
// looked right. Everything else that leads to a door is a spur generated from the door itself, at
// the bottom of this file.
// `palette.road` is a list on this map (packed earth, paving, plank decking); its first entry is what
// new road gets painted in, and the paving is `harder`, so a spur meeting the quay joins it rather
// than punching a brown rectangle through the stone.
const [SPUR_MATERIAL] = palette.road;
const roads = new RoadNetwork(map, T[SPUR_MATERIAL], { harder: COBBLE_GIDS });
roads.run(5, 8, 52, 9); // MARKET STREET — the commercial spine, one block back from the water
roads.run(3, 20, 53, 21); // THE TOWPATH — the road the player walks most
roads.run(21, 14, 22, 16); // the lock walk, down to the lock's north sill...
roads.run(21, 19, 22, 20); // ...and up from its south one
roads.run(46, 9, 47, 22); // the bridge road (rows 17-18 overpainted by the plank deck)
roads.run(46, 22, 47, 30); // the turnpike, running south off the bridge
roads.run(47, 30, 53, 31); // ...and east, out of town past the tollgate
roads.run(3, 14, 22, 14); // the mill and workshop frontage, along the bank to the lock walk
roads.run(12, 9, 12, 13); // ...tied back to Market Street
roads.run(33, 9, 33, 12); // a second cross-lane, down to the basin quay
roads.run(3, 27, 24, 27); // the Immigrant Quarter's upper lane
roads.run(3, 32, 23, 32); // ...and its lower one
// Two cross streets tying both lanes back to the towpath. Without them the quarter's road is a pair
// of horizontal bars floating in grass: `connectAll` runs each house to the nearest *network* cell,
// which is its own lane, so it will happily leave a whole district's streets unconnected to the town
// and report every door as routed. tests/unit/map-path-network.test.js's one-component check is the
// guard that caught exactly that here.
roads.run(8, 21, 8, 32);
roads.run(22, 21, 22, 27);
roads.run(27, 27, 45, 27); // the farm lane
// The lock's own four cells are road without being painted: the lock art covers them, and painting
// packed earth under a piece whose top eight pixel rows are clear would put a dirt track in the
// canal above the gates.
for (const col of [21, 22]) for (const row of [17, 18]) roads.cells.add(roads.key(col, row));
// The paved apron and both bank rows are already road: without this a warehouse door on the quay's
// edge would route all the way to the nearest *street* rather than stopping at the stone two cells
// away.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (COBBLE_GIDS.has(map.ground[map.index(col, row)])) roads.cells.add(roads.key(col, row));
  }
}

// --- the canal's own works ------------------------------------------------------------------------
// The plank crossing is opaque plank-over-this-pack's-own-blue, so it goes on the ground and
// replaces the water. The lock is a cut-out and goes above it — see the palette's notes on both.
map.groundRect(46, 17, T.plankBridge); // cols 46-47, rows 17-18
map.stamp(20, 17, T.canalLock, "decor", "canal lock"); // cols 20-23, rows 17-18

// --- the banks: stone coping, and what grows out of it -------------------------------------------
// A canal edge with nothing on it reads as a swimming pool, so a fifth of each bank cell is reeds
// instead of masonry. Chosen before the coping is laid rather than stamped over it: `decorBlock`
// occupies the cell, so a planting pass that ran afterwards would find every bank cell taken.
for (let col = 2; col <= WIDTH - 3; col += 1) {
  if (onCrossing(col)) continue;
  for (const row of [northBankRow(col), SOUTH_BANK_ROW]) {
    if (map.occupied(col, row)) continue;
    if (!onQuay(col, row) && hash01(col, row, 11) < 0.2) {
      map.stamp(col, row, pick([T.cattails, T.reeds], col, row, 12), "decor", "bank planting");
    } else {
      map.decorBlock(col, row, T.quayCoping);
    }
  }
}

// --- buildings ------------------------------------------------------------------------------------
// Every stamp declares what it is and its collision rect falls out of that. `solid` blocks the whole
// footprint. Each is collected as a door: `doorCellOf()` reads the cell below the centre of the
// stamp's ground-contact row, so the spur the router paints starts where a person would step out.
const doors = [];
const withDoor = (col, row, entry, label) =>
  doors.push(doorCellOf(map.stamp(col, row, entry, "solid", label)));

// A building whose ground-contact row sits one above a trunk street opens straight onto it, and
// `connectAll` paints no spur at all. That is why almost every row below is 6, 10-12 or 25-26 rather
// than wherever looked good: the first pass of this map put its housing on rows that missed by one
// or two, and the router answered with sixty cells of packed-earth stub, which read from above as a
// brown ladder laid over the town rather than as streets.
//
// Workshop & Mill — the west end, where the water is put to work.
withDoor(3, 10, T.flourMill, "flour mill"); // on the bank, drawing off a mill race
withDoor(8, 11, T.textileWorkshop, "textile workshop");
withDoor(13, 11, T.blacksmith, "blacksmith");
withDoor(17, 12, T.lockHouse, "lock house");
withDoor(6, 6, T.provisionStore, "provision store");
withDoor(10, 6, T.cabinetmaker, "cabinetmaker");
withDoor(14, 6, T.officeBrick, "canal company office");

// Market Street — the commercial block, fronting the street from the north.
withDoor(18, 6, T.freeBank, "free bank");
withDoor(22, 6, T.commercialTerrace, "commercial block");
withDoor(28, 6, T.generalStore, "general store");
withDoor(31, 6, T.printOffice, "printing office");
withDoor(35, 6, T.tavern, "tavern");
withDoor(38, 6, T.provisionStore, "dry goods store");

// Reform Square — the east end, above the bridge.
withDoor(43, 3, T.church, "church");
withDoor(48, 3, T.meetingHall, "public meeting hall");
withDoor(52, 6, T.reformPress, "reform press");

// The basin: storehouses fronting the wharves, every door opening onto the paved quay.
withDoor(27, 10, T.warehouse, "canal warehouse");
withDoor(33, 10, T.grainStore, "grain storehouse");
withDoor(40, 10, T.warehouse, "canal warehouse");
withDoor(44, 11, T.forwardingHouse, "forwarding merchant");
withDoor(26, 11, T.officeBrick, "weigh-lock office");

// The Immigrant Quarter — two lanes of housing, brick terraces going up beside older clapboard.
withDoor(4, 25, T.terrace, "terrace housing");
withDoor(10, 25, T.terrace, "terrace housing");
withDoor(15, 25, T.boardinghouseYellow, "boardinghouse");
withDoor(19, 25, T.boardinghouseBlue, "boardinghouse");
withDoor(5, 30, T.cottageRed, "dwelling");
withDoor(9, 30, T.cottageBrown, "dwelling");
withDoor(14, 30, T.cottageRed, "dwelling");
withDoor(19, 30, T.cottageBrown, "dwelling");
withDoor(23, 22, T.canalTavern, "canal-side tavern");

// Farm & Turnpike — the edge where the country meets the town. Looser than the town by design: a
// farm track wandering to a barn is what this district is, so its spurs are the point.
withDoor(31, 24, T.barn, "barn");
withDoor(37, 23, T.farmhouse, "farmhouse");
withDoor(29, 30, T.hayShed, "hay shed");
withDoor(41, 30, T.outbuilding, "outbuilding");
withDoor(50, 27, T.tollgateHouse, "tollgate house");

// --- source anchors: the object a record actually sits on --------------------------------------
// The Reform Square notice board carries this map's one object-anchored record — conflicting
// notices posted over each other, which is the whole design: reform was contested. Its x/y in
// UNIT4_FIELD_SOURCE_POINTS sits on this stamp's front edge. These two move together or not at all.
map.stamp(49, 11, T.noticeBoard, "solid", "reform notice board");
map.stamp(45, 12, T.subscriptionBoard, "solid", "subscription board");

// --- market, street furniture, and the square --------------------------------------------------
// The market is on Market Street, not on the quay. An earlier pass put the stalls down among the
// storehouses, which read as a wharf with a butcher on it and left the street it is named for as a
// row of shopfronts with nothing happening in front of them.
const FURNITURE = [
  [20, 6, T.stallDryGoods, "solid", "market stall"],
  [26, 6, T.stallProduce, "solid", "market stall"],
  [33, 6, T.stallButcher, "solid", "market stall"],
  [24, 10, T.townWell, "solid", "town well"],
  [51, 13, T.bench, "decor", "bench"],
  [47, 13, T.bench, "decor", "bench"],
  [44, 8, T.signpost, "decor", "signpost"],
  [19, 20, T.signpost, "decor", "signpost"],
  [24, 13, T.lampPost, "base", "lamp post"],
  [43, 13, T.lampPost, "base", "lamp post"],
  [30, 20, T.lampPost, "base", "lamp post"],
];
for (const [col, row, entry, solidity, label] of FURNITURE) {
  map.stamp(col, row, entry, solidity, label);
}

// --- the basin's working plant ------------------------------------------------------------------
// The quay's two rows have a job each, and holding to that is what keeps the wharf legible: row 13,
// against the storehouse fronts, is where people stand and walk; row 14, at the water, is where the
// cargo and the mooring gear sit. UNIT4_FIELD_NPCS in main.js posts the captain and routes the
// labourer along row 13 on exactly this understanding.
map.stamp(32, 13, T.dockCrane, "solid", "loading derrick");
map.stamp(40, 13, T.dockCrane, "solid", "loading derrick");
// Moored on open water beyond the land mask, which already stops the player, so no collision. Two
// boats: one under the derrick with cargo out, one waiting its turn at the lock.
map.stamp(29, 15, T.cargoBarge, "decor", "cargo barge");
map.stamp(37, 16, T.cargoBarge, "decor", "cargo barge");

// Cargo and bollards along the water's edge, stamped straight onto the coping rather than snapped to
// the nearest free cell. Philadelphia needs `snapTo` because its bank is a sine curve; this quay is
// a rectangle, so a hand-picked column is exactly where it says it is — and the coping underneath is
// a `decorBlock` with no collision of its own, so overwriting it costs nothing.
const QUAY_EDGE = [
  [27, T.bollard],
  [28, T.crate],
  [29, T.barrel],
  [30, T.grainSack],
  [31, T.bollardRoped],
  [34, T.crateAlt],
  [35, T.sackPile],
  [36, T.barrelAlt],
  [37, T.handCart],
  [39, T.bollard],
  [41, T.crate],
  [42, T.ropeCoil],
  [43, T.bollardRoped],
  [44, T.barrel],
];
for (const [col, entry] of QUAY_EDGE) map.stamp(col, 14, entry, "solid", "quayside cargo");

// --- haulage: the town's visible motion, in objects as well as in routed people ------------------
const HAULAGE = [
  [24, 21, T.draughtHorse, "towpath horse"],
  [48, 25, T.coveredWagon, "turnpike wagon"],
  [51, 30, T.coveredWagon, "turnpike wagon"],
  [29, 8, T.marketBarrow, "market barrow"],
  [12, 14, T.handCart, "hand cart"],
];
for (const [col, row, entry, label] of HAULAGE) map.stamp(col, row, entry, "decor", label);

// --- the enlargement works -----------------------------------------------------------------------
// The Erie enlargement ran 1836-1862, so in 1845 this town is a building site as much as a port.
// Seeds rather than fixed positions here, because these land on ordinary ground among buildings and
// spurs whose exact edges move whenever the layout does.
const YARD_TIMBER = [
  [12, 15, T.plankStack],
  [15, 13, T.lumberPile],
  [16, 13, T.lumberPileAlt],
  [18, 16, T.sawhorse],
  [19, 13, T.timberStack],
  [7, 15, T.lumberPile],
  [25, 12, T.plankStack],
  [44, 16, T.lumberPileAlt],
  [46, 24, T.farmSacks],
  [33, 29, T.haystack],
  [39, 29, T.haystack],
];
for (const [col, row, entry] of YARD_TIMBER) {
  const [c, r] = map.snapTo(
    col,
    row,
    (cc, rr) => isCanalCrossroadsLand(cc + 0.5, rr + 0.5) && !map.occupied(cc, rr),
    3
  );
  map.stamp(c, r, entry, "solid", "timber yard");
}

// --- the farm's fencing ---------------------------------------------------------------------------
// Split-rail, two tiles per section, run along the field edges rather than around them: a closed
// rectangle of fence would seal the pasture off from the lane that serves it.
function fenceRun(col1, col2, row) {
  for (let col = col1; col + 1 <= col2; col += 2) {
    if (map.occupied(col, row) || map.occupied(col + 1, row)) continue;
    map.stamp(col, row, T.fenceRail, "solid", "split-rail fence");
  }
}
fenceRun(28, 39, 32);
fenceRun(42, 49, 32);

// --- trees -----------------------------------------------------------------------------------------
// `base` solidity: the trunk row blocks and everything above it goes to the overlay layer, so the
// player walks behind the canopy.
const SHADE_TREES = [
  [3, 3, T.treeOak],
  [45, 4, T.treeBirch],
  [41, 6, T.treeMaple],
  [52, 10, T.treeCherry],
  [3, 24, T.treeBirch],
  [24, 30, T.treeOak],
  [43, 25, T.treeMaple],
  [51, 21, T.treeBirch],
  // The south margin's tree line. A 3-tall tree stamped at row 33 puts its collision base on row 35,
  // which is past the land mask's y > 34.5 edge — a rect standing out of the world.
  [8, 31, T.treeOak],
  [17, 31, T.treeCherry],
  [35, 31, T.treeMaple],
  [50, 31, T.treeBirch],
  [2, 6, T.treeMaple],
];
for (const [col, row, entry] of SHADE_TREES) map.stamp(col, row, entry, "base", "shade tree");

// The framing tree line along the north edge, outside the walkable rectangle. Without it the top
// four rows are an empty green field and the town has no horizon — the same job Riverbend's tree
// line does. Deterministic, not authored: a hand-placed line of thirteen trees is thirteen
// coordinates to keep in step with a layout that is still moving.
for (let col = 2; col < WIDTH - 4; col += 1) {
  if (hash01(col, 0, 21) >= 0.34) continue;
  const entry = pick([T.treeOak, T.treeMaple, T.treeBirch, T.treeCherry], col, 0, 22);
  if (map.occupied(col, 2) || map.occupied(col + 1, 2)) continue;
  map.stamp(col, 0, entry, "base", "tree line");
}

// --- low scatter on the grassy fringes only ---------------------------------------------------
// Never on the street or the quay, where planting would read as litter.
const BUSHES = [T.bushRose, T.bushFlowering];
const GRASS_GIDS = blockGids(map, T.grass);
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (map.occupied(col, row) || map.occupied(col + 1, row)) continue; // bushes are 2 wide
    if (!isCanalCrossroadsLand(col + 0.5, row + 0.5)) continue;
    if (!GRASS_GIDS.has(map.ground[map.index(col, row)])) continue;
    if (hash01(col, row, 4) >= 0.05) continue;
    map.stamp(col, row, pick(BUSHES, col, row, 5), "decor", "planting");
  }
}

// --- spurs: every door reaches the street network ------------------------------------------------
// Run last of all the ground work, after every `solid`, `base` and `decor` stamp: the router treats
// anything already occupied as impassable, so routing earlier would thread a lane under a tree trunk
// whose collision rect then blocks the very lane it painted.
const spurs = connectAll(roads, { doors, isLand: isCanalCrossroadsLand });

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("CANAL_CROSSROADS_FIELD_BLOCKS", "scripts/generate-canal-crossroads-tmj.js", {
    isLand: isCanalCrossroadsLand,
    doors,
    roads: roads.cells,
  })
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
console.log(`  ${spurs.connected}/${doors.length} doors connected to the street network`);
if (spurs.unreachable.length > 0) {
  // Hard failure, not a warning. A building with no path to it is the exact defect this pipeline
  // exists to prevent, and a warning in a build nobody watches is how it would come back.
  throw new Error(
    `no route to the road network from: ${JSON.stringify(spurs.unreachable)} - either the door is ` +
      `walled in by neighbouring stamps, or the trunk does not reach that part of the map`
  );
}
