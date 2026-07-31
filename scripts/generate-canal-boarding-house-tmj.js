// Generates apps/web/src/content/maps/canal-boarding-house.tmj and its collision module — the
// canal-side tavern and boardinghouse in Canal Crossroads' Immigrant Quarter.
//
// Run with: node scripts/generate-canal-boarding-house-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/canal-boarding-house.palette.js. Layering, terrain-block tiling
// and collision come from scripts/lib/map-builder.js. This script owns layout only.
//
// ## Entered from the south, like the printing office, and for the same reason
//
// The outdoor stamp is `withDoor(23, 22, T.canalTavern, "canal-side tavern")`: cols 23-24, rows
// 22-23, and doorCellOf() puts its doorstep at (24,24) on the south face. So the room's exit is in
// its south wall and the entry lands the player just inside it facing north.
//
// ## Layout: one room the player can stand in and see both halves of
//
// The four-band alternation the two Institute interiors and the printing office all use — two
// full-width open aisles joined by lanes, so a sealed pocket of floor is impossible by construction
// rather than by patch. The one addition here is the alcove partition, which is the only piece of
// interior wall on any Chronicle map:
//
//   rows 0-1     north wall.
//   rows 2-4     WEST, behind the partition: THE SLEEPING ALCOVE — three rope beds in a row, which
//                is the room's first and best piece of evidence about how these men lived.
//                EAST: the kitchen end — the stove, the wash tub, the dresser, the crockery shelf.
//   rows 5-6     OPEN cross-aisle, cols 1-20. Nothing solid, and the partition stops short of it,
//                so both halves of the north band open onto the same aisle.
//   rows 7-8     THE COMMON ROOM: the long boarding table down the middle, the keeper's counter
//                east with the house register on it, a settle and stores west.
//   rows 9-11    OPEN south aisle.
//   rows 12-13   south wall. The street door at cols 10-11.
//
// The partition runs at col 8, rows 2-4 only. It has to stop at row 4: carried down to the south
// wall it would cut the room in two and strand whichever half the player did not enter, which is
// exactly the failure the interior suite's flood fill in tests/unit/field-map-coordinates.test.js
// exists to catch.
//
// 22x14 is 1056x672 — the largest field interior, deliberately. A boardinghouse that sleeps a dozen
// men should not be the same size as a one-press shop, and updateFieldPlayer() scrolls or centres
// per axis, so the size costs nothing but tiles.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/canal-boarding-house.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/canal-boarding-house.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/canal-boarding-house.blocks.js");

const WIDTH = 22;
const HEIGHT = 14;

const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 12-13
const SOUTH = HEIGHT - WALL_SOUTH;
const DOOR_COLS = [10, 11];

// The alcove partition: one column of wall, north band only. See the header for why it stops.
const PARTITION_COL = 8;
const PARTITION_ROWS = [2, 3, 4];

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) => row < WALL_NORTH || row >= SOUTH || col === 0 || col === WIDTH - 1;
// Flagstone where water is carried and spilled; boards everywhere else. The change of floor falls on
// the partition column exactly, so the two halves of the north band read as two places even where
// the partition itself has stopped.
const inKitchen = (col, row) => col > PARTITION_COL && row >= WALL_NORTH && row <= 5;

// --- ground ---------------------------------------------------------------------------------------
// Painted wall to wall, including under the wall band — every wall block on this sheet has one fully
// transparent bottom pixel row, and on `ground` that is a hole through to the page.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    map.groundBlock(col, row, inKitchen(col, row) ? T.floorStone : T.floorPlank);
  }
}

// --- walls ------------------------------------------------------------------------------------------
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (!isWall(col, row)) continue;
    const inDoorReveal = row >= SOUTH && col >= DOOR_COLS[0] - 1 && col <= DOOR_COLS[1] + 1;
    const onKitchenWall = row < WALL_NORTH && col >= 13;
    map.decorBlock(col, row, inDoorReveal || onKitchenWall ? T.wallBrick : T.wallPlaster);
  }
}
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// The alcove partition. Painted like the rest of the plaster, with one rect of its own.
for (const row of PARTITION_ROWS) map.decorBlock(PARTITION_COL, row, T.wallPlaster);
map.block({
  x1: PARTITION_COL,
  y1: PARTITION_ROWS[0],
  x2: PARTITION_COL + 1,
  y2: PARTITION_ROWS[PARTITION_ROWS.length - 1] + 1,
  kind: "alcove partition",
});

// --- the doorway ---------------------------------------------------------------------------------
map.stamp(DOOR_COLS[0], SOUTH, T.door, "decor", "street door");

// --- rows 2-4 west: the sleeping alcove ---------------------------------------------------------------
// Three beds in a row, heads to the north wall. This is the room's first piece of evidence and it is
// made of furniture rather than of dialogue.
for (const col of [1, 3, 5]) map.stamp(col, 2, T.ropeBed, "solid", "boarder's bed");
map.stamp(7, 2, T.boarderChest, "solid", "boarder's chest");
map.stamp(1, 4, T.crate, "decor", "boarder's box");
map.stamp(5, 4, T.grainSack, "decor", "boarder's bundle");

// --- rows 2-4 east: the kitchen end ---------------------------------------------------------------------
map.stamp(10, 3, T.washTub, "solid", "wash tub");
map.stamp(13, 3, T.stove, "solid", "kitchen stove");
map.stamp(16, 3, T.dresser, "solid", "crockery dresser");
map.stamp(19, 3, T.cupboard, "solid", "store cupboard");
map.stamp(16, 0, T.shelfCrockery, "decor", "crockery shelf");
map.stamp(12, 4, T.barrel, "decor", "water barrel");
for (const col of [2, 5, 11, 20]) map.stamp(col, 0, T.window, "decor", "house window");

// --- rows 5-6: the open cross-aisle -----------------------------------------------------------------
// No solid stamps in this band. It is what makes the alcove and the kitchen one room.

// --- rows 7-8: the common room ---------------------------------------------------------------------------
// The long table down the middle of the floor, chairs already drawn down both sides. Two of them end
// to end is what a boardinghouse table is — everyone eats in one sitting because there is one
// sitting.
map.stamp(6, 7, T.boardingTable, "solid", "boarding table");
map.stamp(11, 7, T.boardingTable, "solid", "boarding table");
map.overlayStamp(7, 8, T.oilLamp, "table lamp");
// The keeper's counter, east, with the house register open on it. UNIT4_BOARDING_HOUSE_NPCS puts
// Bridget Cavanagh at its south face and anchors the rent-book record to her.
map.stamp(18, 7, T.counter, "solid", "keeper's counter");
map.overlayStamp(19, 8, T.openBook, "house register");
// The settle and the stores, west, where the room's fire used to be before the stove replaced it.
map.stamp(1, 7, T.settle, "solid", "settle bench");
map.stamp(3, 7, T.plainTable, "solid", "corner table");
map.stamp(1, 9, T.barrel, "decor", "barrel");
map.stamp(2, 9, T.barrelAlt, "decor", "barrel");

// --- rows 9-11: the open south aisle ------------------------------------------------------------------
map.stamp(20, 10, T.plantPotted, "base", "house greenery");
map.stamp(5, 10, T.chair, "decor", "loose chair");
map.stamp(16, 10, T.chair, "decor", "loose chair");

// --- wall dressing --------------------------------------------------------------------------------------
map.stamp(1, SOUTH, T.cupboard, "decor", "store cupboard");
map.stamp(4, SOUTH, T.dresser, "decor", "crockery dresser");
map.stamp(14, SOUTH, T.settle, "decor", "settle bench");
map.stamp(17, SOUTH, T.cupboard, "decor", "store cupboard");
for (const [col, row] of [
  [0, 4],
  [0, 10],
  [WIDTH - 1, 4],
  [WIDTH - 1, 11],
]) {
  map.stamp(col, row, T.wallSconce, "decor", "wall sconce");
}

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("CANAL_BOARDING_HOUSE_BLOCKS", "scripts/generate-canal-boarding-house-tmj.js")
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
