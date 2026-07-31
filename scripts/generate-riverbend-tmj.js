// Generates apps/web/src/content/maps/riverbend-field.tmj and its collision module for case-004
// ("Riverbend Settlement", Unit 2's 1620s New England river settlement).
//
// Run with: node scripts/generate-riverbend-tmj.js
//
// Which tile is grass, water or a dwelling comes from
// apps/web/src/content/tilesets/maps/riverbend-field.palette.js. Layering, terrain-block tiling
// and collision come from scripts/lib/map-builder.js. This script owns layout and the land mask.
//
// Building anchors are load-bearing: UNIT2_FIELD_NPCS and UNIT2_FIELD_SOURCE_POINTS in
// apps/web/src/main.js place people and readable sources relative to them, so a building may be
// resized but not moved without checking those. tests/unit/field-map-coordinates.test.js holds
// the two together.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/riverbend-field.palette.js";
import { MapBuilder, hash01, pick } from "./lib/map-builder.js";
import { RoadNetwork, connectAll, doorCellOf } from "./lib/paths.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/riverbend-field.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/riverbend-field.blocks.js");

const WIDTH = 56;
const HEIGHT = 36;

// --- must stay in lockstep with apps/web/src/main.js's isRiverbendLand() ---
// Deliberately duplicated rather than imported: main.js is a browser bundle entry, and the one
// thing that must never silently diverge is the coastline the player collides with versus the
// coastline that got painted.
//
// The river runs down the western edge and widens south-west into an estuary, so the shoreline is
// a meandering diagonal rather than a straight north-south channel with a bridge. There is no far
// bank: everything west of the river is open water, so the settlement is one connected landmass
// and the player can never be stranded across the channel.
function riverEastBank(y) {
  return 8.0 + Math.max(0, y - 12.0) * 0.62 + Math.sin(y * 0.34) * 1.8;
}
function isRiver(x, y) {
  return x <= riverEastBank(y);
}
// The walkable rectangle stops short of the map edge on three sides so the framing tree line falls
// entirely OUTSIDE it. That is deliberate: a reachable trunk needs collision, and the tree line is
// scenery, not an obstacle course.
function isRiverbendLand(x, y) {
  if (x < 1.5 || x > 52.5 || y < 5.0 || y > 31.5) return false;
  return !isRiver(x, y);
}

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

// --- ground -----------------------------------------------------------------------------------
// Grass covers the out-of-bounds margin too, not just the walkable area: the margin is framed by
// a tree line rather than by a visible edge of nothing.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    const cx = col + 0.5;
    const cy = row + 0.5;
    let block = T.grass;
    if (isRiver(cx, cy)) {
      // One row of surf immediately west of the bank, so the coastline reads as a beach rather
      // than as a hard step from blue to green.
      block = isRiver(cx + 1.0, cy) ? T.water : T.surf;
    } else if (isRiver(cx - 1.0, cy)) {
      block = T.shoreSand; // first land cell east of the water
    }
    map.groundBlock(col, row, block);
  }
}

// The trunk: the three deliberate runs. The high street east from the wharf to the field gate, a
// village spine north past the meetinghouse, and a south spur to the barn yard. Everything else that
// leads to a door is a spur generated from the door itself, at the bottom of this file — see
// scripts/lib/paths.js for why roads are no longer authored as coordinates.
//
// Sand reads as a worn track and, being full-bleed, tiles in any direction. farm/6's own path art
// carries a baked-in grass edge down one side and can only run vertically, which is the whole reason
// this map uses shore sand for its roads.
//
// The network records which cells it owns rather than looking at the tile, which matters here more
// than anywhere: the river shore is painted in this same shore sand, so a tile-based check would
// count the beach as road and connect the wharf-side buildings to the waterline instead of to the
// high street.
const roads = new RoadNetwork(map, T[palette.road]);
roads.run(17, 20, 46, 20); // the high street, wharf to the field gate
roads.run(26, 10, 26, 20); // the village spine, north past the meetinghouse
roads.run(40, 20, 40, 27); // south to the barn yard

// Crop plots. Worked soil on the ground, the planted rows above it: the pack draws a plot as a
// bed of plants with transparent gaps between the stems, so it needs real ground beneath it or
// every field shows the page background through in hard black specks. Both layers tile the
// authored 2x2 block by parity. Crops carry no collision — the player walks the rows.
// Recorded so the path router can route *around* the fields rather than through them. Their planted
// cells are `occupied` and therefore already excluded, but the ~8% left bare are not, and a spur
// threading between those would put a road through the middle of a crop bed.
const PLOT_RECTS = [];
function plot(col1, row1, col2, row2, block) {
  PLOT_RECTS.push({ col1, row1, col2, row2 });
  for (let row = row1; row <= row2; row += 1) {
    for (let col = col1; col <= col2; col += 1) {
      if (!isRiverbendLand(col + 0.5, row + 0.5)) continue;
      map.groundBlock(col, row, T.soil);
      // The odd bed is left bare so the fields don't read as printed wallpaper. Decided per 2x2
      // bed, not per cell: one bare cell inside a planted block reads as a hole punched in the
      // crop rather than as a bed waiting to be sown.
      if (hash01(Math.floor(col / 2), Math.floor(row / 2), 3) < 0.08) continue;
      map.decorBlock(col, row, block);
    }
  }
}
plot(42, 7, 51, 13, T.plotMaize); // north plot — maize
plot(42, 23, 51, 29, T.plotCabbage); // south plot — kitchen garden
plot(31, 24, 38, 29, T.plotRoot); // river-side plot — roots
plot(44, 16, 49, 18, T.plotPumpkin); // the field the indentured servant works

// --- waterfront floor: decking and moored boats, all on the ground layer ----------------------
// These are river tiles with planking or a hull painted into them, opaque edge to edge. Stamped
// above the ground they would lay a hard square of slightly different blue over the river; on the
// ground they replace it.
// The wharf's pier is placed against the bank rather than at a transcribed coordinate: the bank
// is a sine curve, and the previous fixed columns left the deck running three tiles up onto the
// beach with its planks buried in the sand.
const PIER_ROW = 21;
const pierEndCol = Math.floor(riverEastBank(PIER_ROW + 0.5) - 0.5); // last water column
map.groundRect(pierEndCol - 3, PIER_ROW, T.pierDeck);
map.groundRect(pierEndCol - 7, PIER_ROW, T.pierDeck);
map.groundRect(12, 24, T.rowboatWhite);
map.groundRect(14, 27, T.rowboatRed);
map.groundRect(6, 15, T.fishingBoat);

// --- structures -------------------------------------------------------------------------------
// Every stamp declares what it is and its collision rect falls out of that. `solid` blocks the
// whole footprint — before Phase 53 a dwelling's rect covered only its ground-contact row, so the
// player could walk up onto the roof and render pasted on the facade. `base` blocks the
// ground-contact row and lifts everything above it to the overlay layer, which is what puts the
// player behind a canopy. `decor` blocks nothing.

// Each of these is collected as a door: `doorCellOf()` reads the cell below the centre of the
// stamp's ground-contact row, so the spur the router paints starts where a person would step out.
const doors = [];
const withDoor = (col, row, entry, label) =>
  doors.push(doorCellOf(map.stamp(col, row, entry, "solid", label)));

withDoor(24, 6, T.meetinghouse, "meetinghouse");
withDoor(20, 12, T.houseRed, "dwelling one");
withDoor(31, 6, T.houseYellow, "dwelling two");
withDoor(34, 11, T.houseBlue, "dwelling three");
withDoor(21, 16, T.houseCream, "dwelling four");
withDoor(29, 15, T.houseBrown, "dwelling five");
withDoor(37, 16, T.barn, "barn");
withDoor(28, 12, T.well, "well");
withDoor(22, 22, T.shed, "storage shed");
withDoor(33, 15, T.coop, "hen house");
// Kept two columns west of the player's spawn at (26,18) — a 2-wide stamp anchored at 24 reaches
// x=26 and the spawn foot-box straddles it. No door: a cold frame is a garden bed, not a building
// anyone walks into, so a path running up to it would read as a path to nowhere.
map.stamp(23, 18, T.coldFrame, "solid", "cold frame");

// Field fencing. Split-rail runs along each plot's north and south edges; the east and west ends
// are left open so the plots read as enclosures rather than as boxes, and so the player can walk
// in — the crop rows are ground, not obstacles. Each section is two tiles wide.
function fenceRun(col1, col2, row, gateCol) {
  for (let col = col1; col + 1 <= col2; col += 2) {
    const entry =
      col === gateCol ? T.fenceGate : (col / 2) % 2 === 0 ? T.fenceRail : T.fenceRailAlt;
    map.stamp(col, row, entry, entry === T.fenceGate ? "decor" : "solid", "field fence");
    // A gate with no track running up to it is the same defect as a house standing in open grass.
    // The door is the cell *outside* the fence — both gated runs are their plot's north fence, and
    // the cell inside is the crop bed itself, which the router is told to route around.
    if (entry === T.fenceGate) doors.push({ col, row: row - 1 });
  }
}
fenceRun(42, 51, 6, 46);
fenceRun(42, 51, 14);
fenceRun(42, 51, 22, 46);
fenceRun(42, 51, 30);

// --- wharf ------------------------------------------------------------------------------------
withDoor(18, 19, T.marketStall, "wharf market stall");
// At the pier head rather than in the middle of the landing: the river fisher stands at (19,23)
// and paces east of that, and a stall on top of an NPC is how a patrol ends up walled in.
map.stamp(16, 21, T.fishStall, "solid", "fish stall");

// Dockside clutter belongs against the water, so it is placed by *row* and the column is read off
// the bank curve rather than transcribed. Seeding these by column is how they ended up scattered
// across the settlement green: the bank is a sine, so the same column is waterfront at one row and
// the middle of a lawn six rows down. `offset` steps them inland from the first land cell.
const shoreCol = (row) => Math.ceil(riverEastBank(row + 0.5) - 0.5) + 1;
const DOCK_PROPS = [
  [17, 0, T.shoreRocks],
  [19, 0, T.crate],
  [19, 1, T.barrel],
  [20, 1, T.barrelAlt],
  // Rows 22-24 are left clear: the river fisher stands at (19,23) and paces south-east of it.
  [25, 0, T.netPile],
  [25, 1, T.ropeCoil],
  [26, 0, T.lobsterPots],
  [27, 1, T.anchorProp],
  [28, 0, T.buoy],
];
for (const [row, offset, entry] of DOCK_PROPS) {
  const [c, r] = map.snapTo(
    shoreCol(row) + offset,
    row,
    (cc, rr) => isRiverbendLand(cc + 0.5, rr + 0.5) && !map.occupied(cc, rr),
    3
  );
  map.stamp(c, r, entry, "solid", "dockside stores");
}

// Farmyard stores, out by the plots and the barn.
const FARM_PROPS = [
  [43, 20, T.produceCrate],
  [44, 21, T.hayBale],
  [42, 21, T.grainSack],
  [39, 20, T.produceCrate],
];
for (const [col, row, entry] of FARM_PROPS) {
  const [c, r] = map.snapTo(
    col,
    row,
    (cc, rr) => isRiverbendLand(cc + 0.5, rr + 0.5) && !map.occupied(cc, rr),
    3
  );
  map.stamp(c, r, entry, "solid", "farm stores");
}

// --- tree line --------------------------------------------------------------------------------
// Frames the playfield on the north, east and south margins. Every site is outside the walkable
// rectangle, which is the whole point: `decor` solidity, no collision rects at all. A tree the
// player can never reach does not need one, and giving the line 24 rects would put two dozen
// collision boxes out in the unreachable margin — the land mask already stops the player at the
// boundary, and the map's own bounds check stops them at the edge.
const TREES = [T.treeOak, T.treeMaple, T.treePine, T.treeBirch, T.treeApple, T.treeCherry];
const TREE_SITES = [
  // north margin
  [12, 0],
  [17, 0],
  [22, 0],
  [27, 0],
  [32, 0],
  [37, 0],
  [42, 0],
  [47, 0],
  [52, 0],
  [15, 2],
  [30, 2],
  [45, 2],
  // East margin. Col 52, not 53: the widest tree in the set is 4 tiles, and anchoring at 53 runs
  // its last column off a 56-wide map.
  [52, 6],
  [52, 11],
  [52, 16],
  [52, 21],
  [52, 26],
  [52, 31],
  // south margin
  [22, 32],
  [27, 32],
  [32, 32],
  [37, 32],
  [42, 32],
  [47, 32],
];
TREE_SITES.forEach(([col, row], index) =>
  map.stamp(col, row, TREES[index % TREES.length], "decor", "tree line")
);

// Three shade trees stand inside the settlement, where the player can walk behind them.
map.stamp(33, 19, T.treeApple, "base", "shade tree");
map.stamp(24, 28, T.treeOak, "base", "shade tree");
map.stamp(36, 7, T.treeMaple, "base", "shade tree");

// --- spurs: every door reaches the road network ------------------------------------------------
// Run last of all the ground work, after every `solid`, `base` and `decor` stamp: the router treats
// anything already occupied as impassable, so routing earlier would thread a spur under a tree trunk
// whose collision rect then blocks the very path it painted.
const inPlot = (col, row) =>
  PLOT_RECTS.some((r) => col >= r.col1 && col <= r.col2 && row >= r.row1 && row <= r.row2);
const spurs = connectAll(roads, { doors, isLand: isRiverbendLand, avoid: inPlot });

// --- decor: transparent props, no collision ---------------------------------------------------
const BUSHES = [T.bushRose, T.bushBerry, T.bushFlowering];
const GRASS_GIDS = new Set([
  map.blockGidAt(0, 0, T.grass),
  map.blockGidAt(1, 0, T.grass),
  map.blockGidAt(0, 1, T.grass),
  map.blockGidAt(1, 1, T.grass),
]);
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (map.occupied(col, row) || map.occupied(col + 1, row)) continue; // bushes are 2 wide
    if (!isRiverbendLand(col + 0.5, row + 0.5)) continue;
    if (!GRASS_GIDS.has(map.ground[map.index(col, row)])) continue; // tracks, soil and shore stay clear
    if (hash01(col, row, 4) >= 0.05) continue;
    map.stamp(col, row, pick(BUSHES, col, row, 5), "decor", "bush");
  }
}

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("RIVERBEND_FIELD_BLOCKS", "scripts/generate-riverbend-tmj.js", {
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
