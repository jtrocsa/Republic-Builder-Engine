// Generates apps/web/src/content/maps/common-cause-field.tmj and its collision module for
// case-007 ("The Common Cause", Unit 3's 1770s Revolutionary Philadelphia gathering ground) —
// see docs/decision-log/0032-common-cause-tiled-rebuild.md and 0036 for the Phase 53 rebuild.
//
// Run with: node scripts/generate-common-cause-tmj.js
//
// Which tile is which building comes from
// apps/web/src/content/tilesets/maps/common-cause-field.palette.js. Layering, terrain-block
// tiling and collision come from scripts/lib/map-builder.js. This script owns layout and the
// waterline only.
//
// Building anchors are load-bearing: UNIT3_FIELD_NPCS and UNIT3_FIELD_SOURCE_POINTS in
// apps/web/src/main.js place people and readable sources relative to them — the print-shop
// broadside sits outside the print shop's door, the chapel elegy inside the churchyard — so a
// building may be resized but not moved without checking those.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/common-cause-field.palette.js";
import { MapBuilder, hash01, pick } from "./lib/map-builder.js";
import { RoadNetwork, blockGids, connectAll, doorCellOf } from "./lib/paths.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/common-cause-field.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/common-cause-field.blocks.js");

const WIDTH = 56;
const HEIGHT = 36;

// --- must stay in lockstep with apps/web/src/main.js's isCommonCauseLand() ---
// Deliberately duplicated rather than imported: main.js is a browser bundle entry, and the one
// thing that must never silently diverge is the bank the player collides with versus the bank
// that got painted. A town on the north side of the Delaware, whose waterline meanders slightly
// so the quay isn't a ruler-straight edge across the full width of the map.
function commonCauseWaterline(x) {
  return 29.5 + Math.sin(x * 0.12) * 1.1;
}
function isCommonCauseLand(x, y) {
  if (x < 2.5 || x > 53.5 || y < 2.5) return false;
  return y < commonCauseWaterline(x);
}

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

// The paved civic square. Deliberately much smaller than the map: an earlier revision paved
// cols 13-43 x rows 7-25 and the result was a dead grey field with every building pushed out to
// the margins. A town square should be enclosed by its buildings, not the other way round.
const inPlaza = (col, row) => col >= 20 && col <= 36 && row >= 10 && row <= 22;

// --- ground -----------------------------------------------------------------------------------
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    const cx = col + 0.5;
    const cy = row + 0.5;
    let block;
    if (cy >= commonCauseWaterline(cx)) {
      // One row of surf below the quay so the bank isn't a hard edge from grey to blue.
      block = cy - 1.0 < commonCauseWaterline(cx) ? T.surf : T.water;
    } else if (cy + 3.0 >= commonCauseWaterline(cx)) {
      // The three rows of land above the waterline are the paved quay, in the square's own cobble.
      block = T.cobble;
    } else {
      block = inPlaza(col, row) ? T.cobble : T.grass;
    }
    map.groundBlock(col, row, block);
  }
}

// Every gid the square's cobble can paint. Used twice below: to keep the merchants' yard from
// punching a brown hole in the paving, and to fold the square and quay into the road network.
const COBBLE_GIDS = blockGids(map, T.cobble);

// The trunk: the paved streets running out of the square — south to the quay, west and east into the
// residential quarters, and north past the statehouse. Everything else that leads to a door is a
// spur generated from the door itself, at the bottom of this file. See scripts/lib/paths.js.
const roads = new RoadNetwork(map, T[palette.road]);
roads.run(26, 22, 29, 27); // south to the quay
roads.run(8, 15, 20, 16); // west into the residential quarter
roads.run(36, 15, 49, 16); // east into the residential quarter
roads.run(32, 6, 34, 10); // north past the statehouse
// The square and the quay are already paved by the ground loop above, so they are road too — without
// this, a spur from a house on the square's edge would route all the way to the nearest *street*
// rather than stopping at the paving two cells away.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (COBBLE_GIDS.has(map.ground[map.index(col, row)])) roads.cells.add(roads.key(col, row));
  }
}

// The merchants' yard: packed earth immediately north of the warehouse, where the town's paved
// streets stop and unloaded cargo is dragged across bare ground.
//
// This was a 3-wide lane running rows 16-28, stopped by a hand-tuned `row + 3.5 >= waterline`
// offset. Two things were wrong with it. The offset didn't work — the waterline is a sine, so the
// lane's south end punched a hard-edged brown rectangle into the grey paving at some columns and
// stopped three tiles short at others, which is the seam that prompted this pass. And at 3x13 it
// read as a brown field, not as a route: it was wider than the streets it joined and led nowhere
// the warehouse's own spur doesn't now reach. A compact bounded yard is what the art wants to be.
for (let row = 21; row <= 23; row += 1) {
  for (let col = 37; col <= 42; col += 1) {
    if (!isCommonCauseLand(col + 0.5, row + 0.5)) continue;
    // Never overwrite paving. Ending where the cobble begins, whatever shape that edge is, is the
    // general form of the fix — no offsets to keep in sync with the waterline curve.
    if (COBBLE_GIDS.has(map.ground[map.index(col, row)])) continue;
    map.groundBlock(col, row, T.dirt);
  }
}

// --- waterfront floor: piers, the wharf and a moored rowboat, all on the ground layer ----------
// River tiles with planking or a hull painted into them, opaque edge to edge. Stamped above the
// ground they lay a hard square of slightly different blue over the Delaware; on the ground they
// replace it. Each pier is anchored against the bank at its own column so the walkway visibly
// meets the quay rather than starting a tile offshore.
function buildPier(col) {
  const firstWaterRow = Math.ceil(commonCauseWaterline(col + 0.5) - 0.5);
  map.groundRect(col, firstWaterRow, T.pierVertical);
}
buildPier(26);
buildPier(41);
// The town wharf: east-west decking laid along the bank rather than out into the river, so it
// meets the quay along its whole length instead of floating a row offshore.
map.groundRect(17, Math.ceil(commonCauseWaterline(19) - 0.5) - 1, T.wharfDeck);
map.groundRect(31, 34, T.rowboat);

// --- civic buildings, ringing the square -------------------------------------------------------
// Every stamp declares what it is and its collision rect falls out of that. `solid` blocks the
// whole footprint: before Phase 53 a building's rect covered only its ground-contact row, so the
// player could walk up onto the roof and render pasted on the facade.
// Each of these is collected as a door: `doorCellOf()` reads the cell below the centre of the
// stamp's ground-contact row, so the spur the router paints starts where a person would step out.
const doors = [];
const withDoor = (col, row, entry, label) =>
  doors.push(doorCellOf(map.stamp(col, row, entry, "solid", label)));

withDoor(25, 5, T.assemblyHall, "assembly hall");
withDoor(31, 4, T.statehouse, "statehouse");
withDoor(14, 4, T.printShop, "print shop");
withDoor(45, 5, T.chapel, "chapel");
withDoor(9, 22, T.chapelSmall, "riverside meeting house");
withDoor(38, 5, T.townhouse, "merchant townhouse");
withDoor(38, 24, T.warehouse, "warehouse");
// UNIT3_FIELD_SOURCE_POINTS puts the frontier dispatch at (7.5,15.5); it needs a door to have
// come out of, on the west street.
withDoor(5, 13, T.dispatchPost, "frontier dispatch post");

// The square itself. The well is stamped after the liberty pole so its tiles win any shared cell —
// the well reads better as the grounded object at that junction.
map.stamp(27, 11, T.libertyPole, "base", "liberty pole");
map.stamp(26, 16, T.townWell, "solid", "town well");
// West of the square's south exit, not astride it: the player spawns at (28,22) and the free
// tradesman paces past (29,20), so the middle of that lane has to stay clear.
map.stamp(22, 21, T.fountain, "solid", "fountain");
map.stamp(23, 12, T.noticeBoard, "solid", "notice board");
map.stamp(31, 17, T.bench, "decor", "bench");
map.stamp(22, 17, T.bench, "decor", "bench");
map.stamp(30, 13, T.signpost, "decor", "signpost");

// --- source anchors: the object each record actually sits on --------------------------------------
// Six of this case's seven records are anchored to an object rather than to a person, because six of
// its seven creators were demonstrably not in Philadelphia — see the long note on
// UNIT3_FIELD_SOURCE_POINTS in apps/web/src/main.js. Each of these props exists so that its record
// has something real underneath it; before Phase 56 a source was a captioned card floating on the
// paving with nothing beneath it at all.
//
// The `x/y` in UNIT3_FIELD_SOURCE_POINTS sits on the front edge of the matching stamp here. These two
// lists move together or not at all.
map.stamp(24, 9, T.noticeBoard, "solid", "assembly hall notice board");
map.stamp(48, 7, T.noticeBoard, "solid", "churchyard notice board");
map.stamp(35, 8, T.documentTable, "solid", "statehouse petition table");
map.stamp(32, 25, T.documentTable, "solid", "wharf dispatch table");
map.stamp(13, 25, T.documentTable, "solid", "correspondence desk");

// Market: two rows of stalls along the square's south side.
const STALLS = [
  [30, 19, T.stallButcher],
  [32, 19, T.stallBaker],
  [34, 19, T.awningStall],
  [22, 19, T.stallProduce],
  [24, 19, T.stallGreengrocer],
  [20, 22, T.stallDryGoods],
  [33, 22, T.fishStall],
];
for (const [col, row, entry] of STALLS) map.stamp(col, row, entry, "solid", "market stall");

// --- residential quarter — clapboard housing filling the streets either side of the square -----
const HOUSES = [
  [9, 6, T.houseRed],
  [9, 17, T.houseYellow],
  [12, 12, T.houseCream],
  [17, 12, T.houseBlue],
  [17, 19, T.houseBrown],
  [15, 25, T.houseRed],
  [5, 22, T.houseYellow],
  [37, 11, T.houseCream],
  [43, 12, T.houseBrown],
  [43, 18, T.houseBlue],
  [48, 8, T.houseRed],
  [48, 20, T.houseYellow],
  [50, 13, T.houseCream],
  [44, 25, T.houseBrown],
];
for (const [col, row, entry] of HOUSES) withDoor(col, row, entry, "dwelling");

// --- moored shipping ---------------------------------------------------------------------------
// On open water beyond the land mask, which already stops the player, so no collision. Kept clear
// of the map edge so no hull is cut off by the world boundary.
map.stamp(8, 32, T.shipMerchant, "decor", "merchantman");
map.stamp(16, 33, T.shipSloop, "decor", "sloop");
map.stamp(34, 32, T.shipBarge, "decor", "cargo lighter");
map.stamp(47, 32, T.shipSloop, "decor", "sloop");
map.stamp(24, 33, T.shipsBoat, "decor", "ship's boat");

// --- quayside cargo — the Triangle-Trade goods this case is about -------------------------------
const QUAY_PROPS = [
  [19, 28, T.crate],
  [20, 28, T.barrel],
  [18, 28, T.barrelAlt],
  [31, 28, T.crate],
  [32, 28, T.grainSack],
  [33, 28, T.produceCrate],
  [30, 27, T.ropeCoil],
  [34, 27, T.barrel],
  [36, 28, T.hayBale],
  [35, 27, T.produceCrate],
  [44, 28, T.crate],
  [45, 28, T.barrel],
  [46, 27, T.netPile],
  [17, 27, T.anchorProp],
];
// Seeds, not fixed positions. The waterline is a sine curve, so a transcribed row that is quayside
// at one column is a foot underwater three columns along — the hay bale at (36,28) was floating in
// the Delaware. Each crate settles on the nearest unoccupied land cell instead.
for (const [col, row, entry] of QUAY_PROPS) {
  const [c, r] = map.snapTo(
    col,
    row,
    (cc, rr) => isCommonCauseLand(cc + 0.5, rr + 0.5) && !map.occupied(cc, rr),
    4
  );
  map.stamp(c, r, entry, "solid", "quayside cargo");
}

// --- churchyard: a railed enclosure around the chapel -------------------------------------------
function fenceRun(col1, col2, row, gateCol) {
  for (let col = col1; col + 1 <= col2; col += 2) {
    const entry =
      col === gateCol ? T.fenceGate : (col / 2) % 2 === 0 ? T.fenceRail : T.fenceRailAlt;
    map.stamp(col, row, entry, entry === T.fenceGate ? "decor" : "solid", "churchyard rail");
  }
}
fenceRun(44, 51, 3);
fenceRun(44, 51, 11, 46);

// --- trees --------------------------------------------------------------------------------------
// `base` solidity: the trunk row blocks and everything above it goes to the overlay layer, so the
// player walks behind the canopy.
const SHADE_TREES = [
  [11, 3, T.treeOak],
  [20, 3, T.treeBirch],
  [33, 1, T.treeMaple],
  [18, 24, T.treeOak],
  [46, 15, T.treeBirch],
  [7, 12, T.treeCherry],
  [52, 24, T.treeMaple],
  [3, 23, T.treeBirch],
];
for (const [col, row, entry] of SHADE_TREES) map.stamp(col, row, entry, "base", "shade tree");

// --- decor: low scatter on the grassy fringes only ----------------------------------------------
// Never on the paved square, where planting would read as litter.
const BUSHES = [T.bushRose, T.bushFlowering];
const GRASS_GIDS = new Set([
  map.blockGidAt(0, 0, T.grass),
  map.blockGidAt(1, 0, T.grass),
  map.blockGidAt(0, 1, T.grass),
  map.blockGidAt(1, 1, T.grass),
]);
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (map.occupied(col, row) || map.occupied(col + 1, row)) continue; // bushes are 2 wide
    if (!isCommonCauseLand(col + 0.5, row + 0.5)) continue;
    if (!GRASS_GIDS.has(map.ground[map.index(col, row)])) continue;
    if (hash01(col, row, 4) >= 0.06) continue;
    map.stamp(col, row, pick(BUSHES, col, row, 5), "decor", "planting");
  }
}

// --- spurs: every door reaches the street network ------------------------------------------------
// Run last of all the ground work, after every `solid`, `base` and `decor` stamp: the router treats
// anything already occupied as impassable, so routing earlier would thread a lane under a tree trunk
// whose collision rect then blocks the very lane it painted.
//
// Spurs are cobble, not dirt. This is a paved 1770s town, and a one-cell paved lane between two
// houses reads as a street; the same lane in packed earth reads as a scar. The dead-grey-field
// failure the plaza comment above warns about came from paving a 30x18 rectangle, not from paving
// lanes — the whole spur network here adds a few hundred cells, not five hundred.
const spurs = connectAll(roads, { doors, isLand: isCommonCauseLand });

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("COMMON_CAUSE_FIELD_BLOCKS", "scripts/generate-common-cause-tmj.js", {
    isLand: isCommonCauseLand,
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
