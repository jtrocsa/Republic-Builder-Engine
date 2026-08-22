// Generates apps/web/src/content/maps/richmond-counting-room.tmj and its collision module — the
// trader's counting room on Cary Street, Shockoe Bottom.
//
// Run with: node scripts/generate-richmond-counting-room-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/richmond-counting-room.palette.js, and the register decision
// governing both the art and this layout is in that file's header. Layering, terrain-block tiling
// and collision come from scripts/lib/map-builder.js. This script owns layout only.
//
// ## Entered from the south, because the building is
//
// The outdoor stamp is `withDoor(32, 20, T.countingRoom, "trader's counting room")` in
// generate-richmond-tmj.js: cols 32-33, rows 20-21, fronting Lower Street at rows 22-23. So the
// street is *south* and the office door is in the south wall, exactly as at Canal Crossroads. Get
// this backwards and the player walks in through the back wall.
//
// ## The layout is the argument
//
// A counting room is two rooms pretending to be one, and drawing that is the whole design:
//
//   rows 0-1    north wall. THE YARD DOOR at cols 8-9, in a carved frame, which does not open. The
//               walled yard behind it is the one the outdoor map stamps as nothing at all but a
//               chain across a gate — see that generator's note. What is in the yard is people.
//   rows 2-4    THE TRADER'S END, on herringbone: his desk under the window, the safe at his shoulder,
//               the ledger presses along the wall, the longcase clock. Respectable, and expensive.
//   rows 5-6    OPEN cross-aisle, cols 1-16. No solid stamps at all.
//   rows 7-8    THE CLERKS' ROOM: the long writing table with the day book open on it, a copying
//               desk, the press cupboard. This is where the paperwork is actually done and where
//               this room's record sits.
//   rows 9-11   OPEN south aisle, three rows deep. THREE CHAIRS in a row against the west wall of it.
//   rows 12-13  south wall. The Cary Street door at cols 8-9, sash windows either side.
//
// The floor changes under the player's feet at row 5: plain board in the outer office where anybody
// may stand, herringbone parquet past it where only the trade goes. Nothing enforces that — there is no rail and
// no locked door between the two halves, and there should not be, because there was not. It is a
// floor, and it is legible, and a player who notices it has noticed the room.
//
// Same four-band alternation as every other interior in the game, for the reason set out at length
// in scripts/generate-institute-hall-tmj.js: two full-width open aisles joined by the width of the
// room cannot produce a pocket of floor the player is unable to reach, so connectivity is a
// consequence of the shape rather than something patched afterwards. The interior suite in
// tests/unit/field-map-coordinates.test.js flood-fills this room from its entry cell.
//
// 18x14 is 864x672 against a field viewport of roughly 970x596 at 1366x768 — narrower than the
// frame, so updateFieldPlayer() centres it horizontally and scrolls it a little vertically. It is
// the smallest interior in the game on purpose: a ground-floor commercial office on a
// warehouse street was not a large room.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/richmond-counting-room.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/richmond-counting-room.tmj");
const BLOCKS_OUT = path.join(
  REPO_ROOT,
  "apps/web/src/content/maps/richmond-counting-room.blocks.js"
);

const WIDTH = 18;
const HEIGHT = 14;

const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 12-13
const SOUTH = HEIGHT - WALL_SOUTH;
// The Cary Street door, in the south wall. Two leaves, so the interior's exit marker stands at the
// pair's centre and FIELD_MAPS["unit-05"].interiors["richmond-counting-room"].exit derives from it.
const DOOR_COLS = [8, 9];
// The yard door, in the north wall, on the same columns. Deliberately opposite the street door: a
// person brought in through one and taken out through the other crosses the whole room, and the
// chairs they wait in are beside that line.
const YARD_DOOR_COLS = [8, 9];
// Where the plain board stops and the herringbone starts. See the header.
const TRADERS_END = 5;

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) => row < WALL_NORTH || row >= SOUTH || col === 0 || col === WIDTH - 1;

// --- ground -------------------------------------------------------------------------------------
// Floor wall to wall, *including* under the wall band. Every wall block on this sheet carries one
// fully transparent bottom pixel row, and on the ground layer that is a hole through to the page;
// the walls go on `structures` below, over floor rather than over nothing.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    map.groundBlock(col, row, row < TRADERS_END ? T.floorParquet : T.floorBoard);
  }
}

// --- walls --------------------------------------------------------------------------------------
// Panelled wainscot through the room, the figured run at the trader's end, brick in both door
// reveals. See the palette header for why this is the wall the printing office turned down.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (!isWall(col, row)) continue;
    const inStreetReveal = row >= SOUTH && col >= DOOR_COLS[0] - 1 && col <= DOOR_COLS[1] + 1;
    const inYardReveal =
      row < WALL_NORTH && col >= YARD_DOOR_COLS[0] - 1 && col <= YARD_DOOR_COLS[1] + 1;
    if (inStreetReveal || inYardReveal) map.decorBlock(col, row, T.wallBrick);
    else if (row < TRADERS_END) map.decorBlock(col, row, T.wallWainscotFigured);
    else map.decorBlock(col, row, T.wallWainscot);
  }
}
// The wall art carries no collision of its own, so each band's rect is declared, flush with the
// painted edge.
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// --- the two doors --------------------------------------------------------------------------------
// Both `decor`: each sits inside a wall band whose rect already blocks it, and a second overlapping
// rect would only make the generated collision module harder to read.
map.stamp(DOOR_COLS[0], SOUTH, T.door, "decor", "Cary Street door");
map.stamp(YARD_DOOR_COLS[0], 0, T.yardDoor, "decor", "the yard door");

// --- rows 2-4: the trader's end -------------------------------------------------------------------
// His desk stands square to the room rather than against a wall, which is what a desk you are called
// up to looks like. The safe is behind his shoulder and the ledgers run the east wall.
map.stamp(12, 2, T.tradersDesk, "solid", "the trader's desk");
map.stamp(12, 4, T.rug, "decor", "office carpet");
map.stamp(11, 2, T.chair, "decor", "the trader's chair");
map.stamp(16, 2, T.safe, "decor", "office safe");
map.stamp(16, 3, T.papers, "decor", "correspondence");
map.stamp(1, 2, T.ledgerPress, "solid", "bound ledgers");
map.stamp(3, 2, T.ledgerPressWide, "solid", "bound ledgers");
map.stamp(6, 2, T.tallClock, "solid", "longcase clock");
map.stamp(15, 4, T.chair, "decor", "side chair");

// --- rows 5-6: the open cross-aisle -----------------------------------------------------------------
// Nothing at all in this band, and the floor changes here. It is the room's only wide crossing and
// the flood fill has to be able to run the whole width of it.
//
// --- rows 7-8: the clerks' room ---------------------------------------------------------------------
map.stamp(2, 7, T.clerksTable, "solid", "the clerks' table");
// The day book, open, on the table's east end. UNIT5_COUNTING_ROOM_SOURCE_POINTS anchors this room's
// record to this exact stamp, so the two move together or not at all.
//
// overlayStamp, not stamp: writing to `structures` over a table replaces the table's own tile and
// punches a hole in it. The overlay canvas composites above instead — safe here precisely because
// the table's cells are solid, so no player can ever stand underneath the art.
map.overlayStamp(4, 8, T.openBook, "the day book");
map.overlayStamp(2, 8, T.penStand, "pen stand");
map.stamp(1, 9, T.chair, "decor", "clerk's chair");
map.stamp(4, 9, T.chair, "decor", "clerk's chair");
map.stamp(8, 7, T.sideTable, "solid", "copying desk");
map.overlayStamp(9, 8, T.papers, "copied sheets");
map.stamp(12, 7, T.pressCupboard, "solid", "press cupboard");
map.stamp(15, 7, T.sideTable, "solid", "side table");
map.overlayStamp(15, 8, T.oilLamp, "office lamp");

// --- rows 9-11: the open south aisle, and the chairs -------------------------------------------------
// Three chairs are the only things in three rows of floor, and they are against the west wall where
// a person waiting is out of the way of the door. Nathan Purcell stands beside them rather than on
// one: a man who has been on his feet since dawn is a different sentence from a man sitting down.
for (const col of [1, 2, 3]) map.stamp(col, 10, T.chair, "solid", "waiting chair");

// --- wall dressing --------------------------------------------------------------------------------
// All `decor`, all inside a band whose rect already blocks — which is what lets all three aisles stay
// open while the room still reads as furnished.
for (const col of [4, 6, 12, 14]) map.stamp(col, SOUTH, T.window, "decor", "Cary Street window");
for (const col of [3, 14]) map.stamp(col, 0, T.window, "decor", "yard window");
for (const [col, row] of [
  [0, 6],
  [0, 3],
  [WIDTH - 1, 6],
  [WIDTH - 1, 10],
]) {
  map.stamp(col, row, T.wallSconce, "decor", "wall sconce");
}

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule(
    "RICHMOND_COUNTING_ROOM_BLOCKS",
    "scripts/generate-richmond-counting-room-tmj.js"
  )
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
