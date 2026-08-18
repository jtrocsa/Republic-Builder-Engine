// Generates apps/web/src/content/maps/railhead-telegraph-office.tmj and its collision module — the
// Western Union office at Cottonwood Junction, Kansas, June 1873.
//
// Run with: node scripts/generate-railhead-telegraph-office-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/railhead-telegraph-office.palette.js. Layering, terrain-block
// tiling and collision come from scripts/lib/map-builder.js. This script owns layout only.
//
// **Read scripts/generate-railhead-land-office-tmj.js first.** These two rooms were built together
// and that file carries the reasoning both of them rest on — why the door is in the south wall, why
// the counter has a gate in it rather than being a clean wall, and why the four-band alternation is
// what makes the flood fill a consequence of the shape rather than a patch.
//
// ## The layout
//
//   rows 0-1    north wall. The wire comes in through it; nothing is drawn saying so, because
//               nothing on these sheets can.
//   rows 2-3    THE OPERATOR'S END: the key table, the operator's desk with the message book, the
//               file of messages sent, and the shelf of tariff and code books.
//   rows 4-5    OPEN. Where Rufus Ply stands, at his key.
//   rows 6-7    THE RAIL, with the message window let into it at cols 7-8 and the gate at 9-10.
//   rows 8-11   THE PUBLIC SIDE: two benches on the west wall and a writing desk on the east, which
//               is where a sender drafts a blank before handing it across.
//   rows 12-13  south wall. The Front Street door at cols 7-8, sash windows either side.
//
// **The door opens straight onto the message window and the gate is one step east of it.** The land
// office next door puts its gate at the far end on purpose, to make a player walk the length of a
// counter; this room does the opposite, because the two buildings are not doing the same thing to
// the people in them. A telegraph office wanted your business in and out in ninety seconds. The
// contrast is the point, and it is the cheapest way this map has of saying that a counter is a
// choice somebody made rather than a fact about buildings.
//
// 16x14 is 768x672 against a field viewport of roughly 970x596 at 1366x768 — the smallest interior
// in the game, narrower than the frame in both axes, so updateFieldPlayer() centres it horizontally
// and scrolls it a little vertically. A leased operating room on a division point was one room with
// a rail in it.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/railhead-telegraph-office.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/railhead-telegraph-office.tmj");
const BLOCKS_OUT = path.join(
  REPO_ROOT,
  "apps/web/src/content/maps/railhead-telegraph-office.blocks.js"
);

const WIDTH = 16;
const HEIGHT = 14;

const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 12-13
const SOUTH = HEIGHT - WALL_SOUTH;
// The Front Street door, in the south wall. Two leaves, so the interior's exit marker stands at the
// pair's centre and FIELD_MAPS["unit-06"].interiors["railhead-telegraph-office"].exit derives from it.
const DOOR_COLS = [7, 8];
const RAIL_ROW = 6;
// The message window is let into the rail on the door's own columns, and the gate is the two columns
// east of it. Both are expressed as the columns the rail run skips.
const WINDOW_COLS = [7, 8];
const GATE_COLS = [9, 10];

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) => row < WALL_NORTH || row >= SOUTH || col === 0 || col === WIDTH - 1;

// --- ground -------------------------------------------------------------------------------------
// Floor wall to wall, including under the wall band. Same reason as the land office: the A4 wall
// blocks carry transparency along their own edges, and on the ground layer that is a hole.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    map.groundBlock(col, row, T.floorBoard);
  }
}

// --- walls --------------------------------------------------------------------------------------
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (isWall(col, row)) map.decorBlock(col, row, T.wallWainscot);
  }
}
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// --- the door -------------------------------------------------------------------------------------
map.stamp(DOOR_COLS[0], SOUTH, T.door, "decor", "Front Street door");

// --- rows 2-3: the operator's end ---------------------------------------------------------------------
// Nothing is overlaid on any of these — see the note in the land office generator for why. The
// `tile-B-09` desks arrive with their own ledgers, inkwells and pens drawn on them.
map.stamp(2, 2, T.keyTable, "solid", "the key table");
map.stamp(6, 2, T.operatorDesk, "solid", "the operator's desk");
map.stamp(10, 2, T.fileCupboard, "solid", "file of messages sent");
map.stamp(13, 2, T.shelfLedgers, "solid", "tariff and code books");

// --- rows 4-5: open behind the rail --------------------------------------------------------------------
// Nothing at all in this band. It is where the operator stands, and the flood fill has to be able to
// run its whole width.
//
// --- rows 6-7: the rail, the message window and the gate ---------------------------------------------------
// `base` on both, for the reason the land office records: the counter body blocks its ground-contact
// row and everything above it lifts to the overlay, so the operator draws correctly behind it.
for (let col = 1; col < WIDTH - 1; col += 2) {
  if (col === WINDOW_COLS[0] || col === GATE_COLS[0]) continue;
  map.stamp(col, RAIL_ROW, T.counterRail, "base", "the rail");
}
map.stamp(WINDOW_COLS[0], RAIL_ROW, T.messageWindow, "base", "the message window");

// --- rows 8-11: the public side ---------------------------------------------------------------------
map.stamp(1, 8, T.bench, "solid", "waiting bench");
map.stamp(1, 10, T.benchWorn, "solid", "waiting bench");
map.stamp(12, 8, T.writingDesk, "solid", "the sender's writing desk");

// --- wall dressing --------------------------------------------------------------------------------
for (const col of [3, 5, 10, 12]) map.stamp(col, SOUTH, T.window, "decor", "Front Street window");

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule(
    "RAILHEAD_TELEGRAPH_OFFICE_BLOCKS",
    "scripts/generate-railhead-telegraph-office-tmj.js"
  )
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
