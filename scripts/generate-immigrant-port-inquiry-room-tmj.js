// Generates apps/web/src/content/maps/immigrant-port-inquiry-room.tmj and its collision module —
// the room a board of special inquiry sat in at the immigrant station, Ellis Island, 17 April 1907.
//
// Run with: node scripts/generate-immigrant-port-inquiry-room-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/immigrant-port-inquiry-room.palette.js, and the reasoning
// behind the materials is in that file's header. Layering, terrain-block tiling and collision come
// from scripts/lib/map-builder.js. This script owns layout only.
//
// ## Entered from the south, twelve bays east of the main doors
//
// The outdoor stamp is `withDoor(col, FRONT_ROW - 1, T.wingEntrance, "inquiry wing")` at col 36 in
// generate-immigrant-port-tmj.js, so doorCellOf() puts its door cell at (38, 4). A hearing room in
// 1907 sat off the registry floor, upstairs and behind the hall — and CLAUDE.md is explicit that a
// field interior is never nested, so decision log 0076 §4 put this door on the frontage instead,
// in the bay where the detention wing was. The wing's own brick run is drawn differently from its
// neighbours for the same reason: a door that needs a label to be findable is a door drawn wrong.
//
// ## The room is a table with nobody at it
//
//   rows 0-1    north wall. Two sash windows, and the wall the board sits against.
//   rows 2-3    THE BOARD'S TABLE, with the minute press to its west and the clerk's table to its
//               east. The three chairs behind the table are drawn and are empty; see below.
//   rows 4-7    THE FLOOR OF THE HEARING. A carpet, one chair, and otherwise nothing at all.
//   rows 8-9    Two benches against the side walls — the waiting side, wide open down the middle.
//   rows 10-11  OPEN.
//   rows 12-13  south wall. The wing door at cols 7-8, sash windows either side.
//
// **The three inspectors are not drawn and that is the room's argument.** A board was three
// officers, sitting together, deciding by majority, in private, on the record — around four hundred
// cases a day across the station's boards. scripts/assets/character-manifest.js states the reason
// for leaving them out in one line: *a hearing that fits in a name pill is a hearing a player
// thinks they have met.* So the table is stamped with its chairs, the chairs are empty, and the two
// people in this room are the clerk who types the minute and the nineteen-year-old standing in
// front of it.
//
// The four rows between the table and the benches are deliberately almost bare. A hearing room is
// mostly floor, the distance across it is the whole experience of being in one, and the one loose
// chair in the middle of it is there to be noticed rather than used.
//
// Same four-band alternation as every other interior — two full-width open aisles joined by the
// width of the room, which is what makes a sealed pocket impossible by construction rather than by
// patching. The interior suite in tests/unit/field-map-coordinates.test.js flood-fills the room
// from its entry cell.
//
// 16x14 is 768x672 against a field viewport of roughly 970x596 at 1366x768 — narrower than the
// frame, so updateFieldPlayer() centres it horizontally and scrolls it a little vertically. The
// same size as the Kansas telegraph office, and deliberately the smallest room on this map: the
// hall next door is bigger than the viewport on both axes and this one is not, which is most of
// what the two rooms have to say to each other.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/immigrant-port-inquiry-room.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/immigrant-port-inquiry-room.tmj");
const BLOCKS_OUT = path.join(
  REPO_ROOT,
  "apps/web/src/content/maps/immigrant-port-inquiry-room.blocks.js"
);

const WIDTH = 16;
const HEIGHT = 14;

const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 12-13
const SOUTH = HEIGHT - WALL_SOUTH;
// The wing door, in the south wall. Two leaves, so the interior's exit marker stands at the pair's
// centre and FIELD_MAPS["unit-07"].interiors["immigrant-port-inquiry-room"].exit derives from it.
const DOOR_COLS = [7, 8];
// The board's table: four columns wide, centred on the room, against the north band.
const TABLE_COL = 5;

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) => row < WALL_NORTH || row >= SOUTH || col === 0 || col === WIDTH - 1;

// --- ground -------------------------------------------------------------------------------------
// Parquet wall to wall, *including* under the wall band — see the inspection hall's generator for
// why the walls go on `structures` over floor rather than on the ground layer.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    map.groundBlock(col, row, T.floorParquet);
  }
}
// The carpet the person appearing stands on, laid on the ground layer in front of the table so it
// is under the furniture rather than stamped over it.
//
// Exactly one block wide, centred on the table. The first pass ran it the table's full four columns
// and the block is a *rug* rather than a carpet material — it carries its own woven border on all
// four sides, so parity-tiling it laid two rugs side by side with a seam of border down the middle.
// Every patterned block on this sheet's rows 0-3 behaves the same way; treat them as objects that
// happen to live on the ground layer, not as terrain.
for (let row = 4; row < 6; row += 1) {
  for (let col = TABLE_COL + 1; col < TABLE_COL + 3; col += 1) {
    map.groundBlock(col, row, T.rug);
  }
}

// --- walls --------------------------------------------------------------------------------------
// One material the whole way round. The first pass put the sheet's *figured* panelling on the wall
// behind the board — the one wall in this room anybody is made to look at for an hour — and it
// rendered as an olive-green damask patch in a cream-and-brown room, which reads as a stain rather
// than as a better wall. The table and the carpet mark that end perfectly well on their own.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (isWall(col, row)) map.decorBlock(col, row, T.wallWainscot);
  }
}
// The wall art carries no collision of its own, so each band's rect is declared, flush with the
// painted edge.
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// --- the door ---------------------------------------------------------------------------------------
map.stamp(DOOR_COLS[0], SOUTH, T.door, "decor", "wing door");

// --- rows 2-3: the board -----------------------------------------------------------------------------
// The bound minutes of every hearing this board has held, the table itself, and the clerk's own
// table at the east end where the only surviving account of the next hour is typed.
map.stamp(1, 2, T.minutePress, "solid", "bound minute books");
map.stamp(TABLE_COL, 2, T.boardTable, "solid", "the board's table");
map.stamp(12, 2, T.clerkDesk, "solid", "the clerk's table");
// Flush with the north band rather than one row down. Dropped to row 3 it left the single cell at
// (14,2) walled in on all four sides by the desk, the east wall, the north band and its own case — a
// 21-cell pocket the interior traversal test named on its first run.
map.stamp(14, 2, T.tallClock, "solid", "the room's clock");

// --- rows 4-7: the floor of the hearing --------------------------------------------------------------
// One chair, offered and usually declined, on the west side of the carpet rather than on it. The
// rest of this band is empty on purpose: the walk from the door to the table is the room.
map.stamp(3, 6, T.chair, "solid", "a chair");

// --- rows 8-9: the waiting side -----------------------------------------------------------------------
// Benches against both side walls with the whole middle of the room open between them, which is what
// keeps the two aisles joined across the full width.
map.stamp(1, 8, T.bench, "solid", "waiting bench");
map.stamp(13, 8, T.benchAlt, "solid", "waiting bench");

// --- wall dressing --------------------------------------------------------------------------------------
for (const col of [3, 12]) map.stamp(col, 0, T.window, "decor", "north window");
for (const col of [4, 11]) map.stamp(col, SOUTH, T.window, "decor", "wing window");
for (const col of [2, 13]) map.stamp(col, SOUTH, T.wallSconce, "decor", "wall sconce");

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule(
    "IMMIGRANT_PORT_INQUIRY_ROOM_BLOCKS",
    "scripts/generate-immigrant-port-inquiry-room-tmj.js"
  )
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
