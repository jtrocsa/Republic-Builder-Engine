// Generates apps/web/src/content/maps/riverbend-field.tmj for case-004 ("Riverbend Settlement",
// Unit 2's 1620s New England river settlement).
//
// This map previously had no generator at all — it was the original .tmj proof of concept,
// hand-built in the Tiled desktop app, which made it the one live map whose layout could not be
// re-derived. Two defects came along with that: transparent crop tiles were stamped over cells
// with no ground tile beneath them (the field showed hard black gaps), and pier decking was
// tiled across the whole river, so the water read as a floor of loose planks.
//
// Which tile is grass, water or a dwelling comes from
// apps/web/src/content/tilesets/maps/riverbend-field.palette.js. This script owns layout and the
// land mask only.
//
// Run with: node scripts/generate-riverbend-tmj.js apps/web/src/content/maps/riverbend-field.tmj
import { writeFileSync } from "node:fs";

import palette from "../apps/web/src/content/tilesets/maps/riverbend-field.palette.js";
import { resolvePalette } from "./lib/palette-gids.js";

const WIDTH = 56;
const HEIGHT = 36;
const TILE = 48;

// --- must stay in lockstep with apps/web/src/main.js's isRiverbendLand() ---
// The river runs down the western edge and widens south-west into an estuary, so the shoreline
// is a meandering diagonal rather than the old straight north-south channel with a bridge. There
// is no far bank: everything west of the river is open water, so the settlement is one connected
// landmass and the player can never be stranded across the channel.
function riverEastBank(y) {
  return 8.0 + Math.max(0, y - 12.0) * 0.62 + Math.sin(y * 0.34) * 1.8;
}
function isRiver(x, y) {
  return x <= riverEastBank(y);
}
// The walkable rectangle stops short of the map edge on three sides so the framing tree line
// falls entirely OUTSIDE it. That is deliberate: a tree whose trunk is reachable needs its own
// collision rect in main.js, and hand-maintaining two dozen of those against this script's
// TREE_SITES list is precisely the kind of parallel bookkeeping that drifts. Only the three
// shade trees planted inside the settlement carry collision.
function isRiverbendLand(x, y) {
  if (x < 1.5 || x > 52.5 || y < 5.0 || y > 31.5) return false;
  return !isRiver(x, y);
}

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;

function hash01(col, row, salt) {
  let h = (col + 1) * 374761393 + (row + 1) * 668265263 + salt * 2246822519;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Authored 2x2 block order: [top-left, top-right, bottom-left, bottom-right].
const GRASS = [T.grass, T.grassB, T.grassC, T.grassD].map(gid);
const WATER = gid(T.water);
const WATER_ALT = gid(T.waterAlt);
const SHORE_EDGE = gid(T.shoreEdge);
const SHORE_SAND = gid(T.shoreSand);
const ROAD = gid(T.shoreSand); // packed-earth track; full-bleed, so it tiles in any direction
const TILLED = gid(T.tilled);
const TILLED_ALT = gid(T.tilledAlt);

// Ground layer. Grass is drawn across the whole out-of-bounds margin too, not just the walkable
// area — the margin is framed by a tree line rather than by a visible edge of nothing.
function groundTileAt(col, row) {
  const cx = col + 0.5;
  const cy = row + 0.5;
  if (isRiver(cx, cy)) {
    // The single row of water immediately west of the bank gets the surf/shore-edge tile so the
    // coastline reads as a beach rather than as a hard step from blue to green.
    if (!isRiver(cx + 1.0, cy)) return SHORE_EDGE;
    return hash01(col, row, 1) < 0.22 ? WATER_ALT : WATER;
  }
  if (isRiver(cx - 1.0, cy)) return SHORE_SAND; // first land cell east of the water
  // farm/6's four grass cells are one coherent 2x2 texture block, not four interchangeable
  // variants — picking among them at random produces a visible patchwork quilt. Tiling them in
  // their authored arrangement is what makes a large lawn read as continuous ground.
  return GRASS[(row % 2) * 2 + (col % 2)];
}

const groundData = [];
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    groundData.push(groundTileAt(col, row));
  }
}
function setGround(col, row, tileGid) {
  if (col < 0 || col >= WIDTH || row < 0 || row >= HEIGHT) return;
  groundData[row * WIDTH + col] = tileGid;
}

// --- roads: a packed-earth track from the wharf up through the village to the field gate ---
for (let col = 17; col <= 46; col += 1) setGround(col, 20, ROAD); // wharf -> fields, east-west
for (let row = 10; row <= 20; row += 1) setGround(26, row, ROAD); // village spur, north-south
for (let row = 20; row <= 27; row += 1) setGround(40, row, ROAD); // south spur to the barn yard

// --- structures ---
const structuresData = new Array(WIDTH * HEIGHT).fill(0);
const overlayData = new Array(WIDTH * HEIGHT).fill(0);
function stampInto(target, anchorCol, anchorRow, block) {
  block.forEach((rowGids, r) => {
    rowGids.forEach((tileGid, c) => {
      if (!tileGid) return;
      const col = anchorCol + c;
      const row = anchorRow + r;
      if (col < 0 || col >= WIDTH || row < 0 || row >= HEIGHT) return;
      target[row * WIDTH + col] = tileGid;
    });
  });
}
const stamp = (col, row, block) => stampInto(structuresData, col, row, block);

// --- crop plots ---
// The planted-row tiles are transparent *between* the plants — they are props meant to be laid
// over soil, not full-bleed ground. The old hand-authored map treated them as ground, so every
// field showed hard black gaps where the map background came through. Here the soil goes down as
// ground and the crop goes on structures above it, which is the only arrangement that fills the
// cell. Crops carry no collision rect: the player walks through the rows.
function fillPlot(col1, row1, col2, row2, cropEntry) {
  const cropGid = gid(cropEntry);
  for (let row = row1; row <= row2; row += 1) {
    for (let col = col1; col <= col2; col += 1) {
      if (!isRiverbendLand(col + 0.5, row + 0.5)) continue;
      const roll = hash01(col, row, 3);
      setGround(col, row, roll < 0.5 ? TILLED : TILLED_ALT);
      if (roll >= 0.08) stamp(col, row, [[cropGid]]); // ~8% left as bare worked soil
    }
  }
}
fillPlot(42, 7, 51, 13, T.cropCorn); // north plot — maize
fillPlot(42, 23, 51, 29, T.cropCabbage); // south plot — kitchen garden
fillPlot(31, 24, 38, 29, T.cropRoot); // river-side plot — roots

// Buildings. Anchors are each stamp's top-left cell, chosen so the building's ground-contact row
// lines up with the matching UNIT2_FIELD_BLOCKS rect in apps/web/src/main.js — cross-checked by
// tests/unit/field-map-coordinates.test.js.
stamp(24, 6, gidRect(T.meetinghouse, 4, 4)); // meetinghouse   (24.0,8.6-28.0,10.0)
stamp(20, 12, gidRect(T.houseRed, 2, 2)); // dwelling one   (20.0,12.6-22.0,14.0)
stamp(31, 6, gidRect(T.houseYellow, 2, 2)); // dwelling two   (31.0,6.6-33.0,8.0)
stamp(34, 11, gidRect(T.houseBlue, 2, 2)); // dwelling three (34.0,11.6-36.0,13.0)
stamp(21, 16, gidRect(T.houseCream, 2, 2)); // dwelling four  (21.0,16.6-23.0,18.0)
stamp(29, 15, gidRect(T.houseBrown, 2, 2)); // dwelling five  (29.0,15.6-31.0,17.0)
stamp(37, 15, gidRect(T.barn, 4, 3)); // barn           (37.0,17.6-40.0,19.0)
stamp(28, 12, gidRect(T.well, 2, 2)); // well           (28.0,12.6-30.0,14.0)
stamp(22, 22, gidRect(T.shed, 2, 2)); // storage shed   (22.0,22.6-24.0,24.0)
stamp(45, 9, gidRect(T.scarecrow, 2, 1)); // scarecrow      (45.0,9.6-46.0,11.0)

// Field fencing. Split-rail runs along each plot's north and south edges; the east and west ends
// are left open so the plots read as enclosures rather than as boxes, and so the player can walk
// in (crop tiles are ground, not obstacles).
const FENCE = [gid(T.fenceRail), gid(T.fenceRailAlt)];
function fenceRun(col1, col2, row) {
  for (let col = col1; col <= col2; col += 1) {
    stamp(col, row, [[FENCE[(col + row) % 2]]]);
  }
}
fenceRun(42, 51, 6);
fenceRun(42, 51, 14);
fenceRun(42, 51, 22);
fenceRun(42, 51, 30);
stamp(46, 6, [[gid(T.fenceGate)]]); // gate onto the north plot, on the road's line
stamp(46, 22, [[gid(T.fenceGate)]]);

// --- waterfront ---
// Pier decking laid over water only (rows 21-22), meeting the bank at col 17. The old map tiled
// this decking across the entire river, which is what made the water look like a plank floor.
const PIER_DECK = gid(T.pierDeck);
const PIER_POST = gid(T.pierPost);
// Runs to col 18 so the decking overlaps the bank instead of stopping a tile short of it and
// leaving the pier apparently floating.
for (let col = 11; col <= 18; col += 1) {
  stamp(col, 21, [[PIER_DECK]]);
  stamp(col, 22, [[PIER_POST]]);
}
stamp(12, 24, gidRect(T.rowboatWhite, 1, 2)); // moored boats, on open water
stamp(14, 26, gidRect(T.rowboatRed, 1, 2));
stamp(18, 19, gidRect(T.marketStall, 2, 2)); // wharf market  (18.0,20.6-20.0,21.0)

// Dockside clutter on the landward side of the wharf.
const DOCK_PROPS = [
  [17, 23, T.crate],
  [18, 23, T.barrel],
  [17, 24, T.barrelAlt],
  [19, 24, T.netPile],
  [18, 25, T.ropeCoil],
  [20, 23, T.anchorProp],
  [16, 18, T.shoreRocks],
  [43, 20, T.produceCrate],
  [44, 21, T.hayBale],
  [42, 21, T.grainSack],
];
for (const [col, row, entry] of DOCK_PROPS) stamp(col, row, [[gid(entry)]]);

// --- tree line: frames the playfield on the north, east and south margins, mostly outside the
// walkable bounds so it reads as forest closing in rather than as obstacles to path around ---
const TREES = [T.treeOak, T.treeAutumn, T.treePine, T.treeBirch, T.treeApple];
const TREE_WIDTH = new Map([
  [T.treeOak, 3],
  [T.treeAutumn, 3],
  [T.treePine, 2],
  [T.treeBirch, 2],
  [T.treeApple, 2],
]);
function plantTree(col, row, entry) {
  stamp(col, row, gidRect(entry, 3, TREE_WIDTH.get(entry)));
}
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
  // east margin
  [53, 6],
  [53, 11],
  [53, 16],
  [53, 21],
  [53, 26],
  [53, 31],
  // south margin
  [22, 32],
  [27, 32],
  [32, 32],
  [37, 32],
  [42, 32],
  [47, 32],
];
TREE_SITES.forEach(([col, row], index) => plantTree(col, row, TREES[index % TREES.length]));

// Three shade trees stand inside the settlement. Their canopies are lifted to the overlay layer
// so the player walks *behind* them; the trunk row stays on structures and has a collision rect
// in UNIT2_FIELD_BLOCKS. Each entry names its own width — an earlier revision assumed 2 for all
// three and left the third column of the 3-wide oak and maple stranded on the lower layer.
const SHADE_TREES = [
  [33, 19, T.treeApple, 2], // trunk row 21  (33.0,21.4-35.0,22.0)
  [24, 28, T.treeOak, 3], // trunk row 30  (24.0,30.4-27.0,31.0)
  [36, 7, T.treeAutumn, 3], // trunk row 9   (36.0,9.4-39.0,10.0)
];
for (const [col, row, entry, width] of SHADE_TREES) {
  stamp(col, row, gidRect(entry, 3, width));
  for (let c = 0; c < width; c += 1) {
    const index = row * WIDTH + col + c;
    if (!structuresData[index]) continue;
    overlayData[index] = structuresData[index];
    structuresData[index] = 0;
  }
}

// Bushes: small scatter across open grass, decorative only (no collision rects).
const BUSHES = [T.bushA, T.bushB, T.bushC].map(gid);
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (structuresData[row * WIDTH + col]) continue;
    const cx = col + 0.5;
    const cy = row + 0.5;
    if (!isRiverbendLand(cx, cy)) continue;
    if (!GRASS.includes(groundData[row * WIDTH + col])) continue; // roads/soil/shore stay clear
    if (hash01(col, row, 4) >= 0.05) continue;
    stamp(col, row, [[BUSHES[Math.floor(hash01(col, row, 5) * BUSHES.length)]]]);
  }
}

function tileLayer({ data, id, name, locked = false }) {
  return {
    data,
    height: HEIGHT,
    id,
    ...(locked ? { locked: true } : {}),
    name,
    opacity: 1,
    type: "tilelayer",
    visible: true,
    width: WIDTH,
    x: 0,
    y: 0,
  };
}

const tmj = {
  compressionlevel: -1,
  height: HEIGHT,
  infinite: false,
  layers: [
    tileLayer({ data: groundData, id: 1, name: "ground" }),
    tileLayer({ data: structuresData, id: 2, name: "structures", locked: true }),
    tileLayer({ data: overlayData, id: 3, name: "overlay", locked: true }),
  ],
  nextlayerid: 4,
  nextobjectid: 1,
  orientation: "orthogonal",
  renderorder: "right-down",
  tiledversion: "1.12.2",
  tileheight: TILE,
  tilesets,
  tilewidth: TILE,
  type: "map",
  version: "1.10",
  width: WIDTH,
};

const outPath = process.argv[2];
writeFileSync(outPath, JSON.stringify(tmj));
console.log("wrote", outPath);
