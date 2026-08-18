// Generates apps/web/src/content/maps/railhead-land-office.tmj and its collision module — the
// United States district land office at Cottonwood Junction, Kansas, June 1873.
//
// Run with: node scripts/generate-railhead-land-office-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/railhead-land-office.palette.js, and the reasoning behind the
// materials is in that file's header. Layering, terrain-block tiling and collision come from
// scripts/lib/map-builder.js. This script owns layout only.
//
// ## Entered from the south, because the building is
//
// The outdoor stamp is `withDoor(18, 10, T.landOffice, "land office")` in
// generate-railhead-tmj.js: cols 18-19, rows 10-11, fronting Front Street at row 13. So the street
// is *south* and the office door is in the south wall, exactly as at Canal Crossroads and Richmond.
// Get this backwards and the player walks in through the back wall.
//
// ## The counter is the layout, and the gate is where the argument is
//
// A land office is one room with a line drawn across it, and everything else follows:
//
//   rows 0-1    north wall. Two sash windows onto the alley, and nothing else — this is the back of
//               a frontage building.
//   rows 2-3    THE OFFICE SIDE: the register's desk, the plat table, the tract books with the
//               office safe beside them, and the press cupboard.
//   rows 4-5    OPEN. The clerks' walking room behind the counter, and where Elias Fenn stands.
//   rows 6-7    THE COUNTER, wall to wall, with one gap at cols 11-12.
//   rows 8-11   THE PUBLIC SIDE. Four rows of bare floor, two benches against the west wall, and
//               one writing desk against the east one.
//   rows 12-13  south wall. The Front Street door at cols 8-9, sash windows either side.
//
// **The gate is at the east end and the door is in the middle, deliberately.** A player who walks
// in meets the counter head-on: the first thing this building does is stop you. Reaching Fenn — and
// therefore the receipt, which is anchored to him — means walking the length of the counter to the
// clerks' gate and going round. That is not friction for its own sake. The receipt is the record
// this whole map leans on, and a student who has walked round a counter to get it has done in the
// legs what the mission is about.
//
// It is also forced by geometry, which is worth writing down so nobody "fixes" it later. The
// interaction reach is 1.45 tiles and a body's collision is its feet, so with the counter blocking
// row 7 the closest a player can stand is y = 7.6 and the closest a clerk behind it can stand is
// y = 6.22 — 1.38 tiles apart, inside the reach by seven hundredths of a tile. A counter with no
// gate would put every conversation in this room on the wrong side of a rounding error.
//
// Same four-band alternation as every other interior in the game, for the reason set out at length
// in scripts/generate-institute-hall-tmj.js: two full-width open aisles joined by the width of the
// room cannot produce a pocket of floor the player is unable to reach, so connectivity is a
// consequence of the shape rather than something patched afterwards. The interior suite in
// tests/unit/field-map-coordinates.test.js flood-fills this room from its entry cell — and here it
// is doing real work, because the gate is the only join between the two halves.
//
// 18x14 is 864x672 against a field viewport of roughly 970x596 at 1366x768 — narrower than the
// frame, so updateFieldPlayer() centres it horizontally and scrolls it a little vertically. The
// same size as Richmond's counting room, and for the same reason: a leased ground-floor office on a
// two-year-old street was not a large room.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/railhead-land-office.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/railhead-land-office.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/railhead-land-office.blocks.js");

const WIDTH = 18;
const HEIGHT = 14;

const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 12-13
const SOUTH = HEIGHT - WALL_SOUTH;
// The Front Street door, in the south wall. Two leaves, so the interior's exit marker stands at the
// pair's centre and FIELD_MAPS["unit-06"].interiors["railhead-land-office"].exit derives from it.
const DOOR_COLS = [8, 9];
// The counter's row. Stamped at COUNTER_ROW so its ground-contact row is COUNTER_ROW + 1.
const COUNTER_ROW = 6;
// The clerks' gate: the two columns of the counter's run that are simply not stamped. See above.
const GATE_COLS = [11, 12];

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) => row < WALL_NORTH || row >= SOUTH || col === 0 || col === WIDTH - 1;

// --- ground -------------------------------------------------------------------------------------
// Floor wall to wall, *including* under the wall band. The A4 wall blocks carry transparency along
// their own edges and on the ground layer that is a hole through to the page; the walls go on
// `structures` below, over floor rather than over nothing.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    map.groundBlock(col, row, T.floorBoard);
  }
}

// --- walls --------------------------------------------------------------------------------------
// White painted panelling over a plank base rail, the whole way round. One material, because a
// government office leased by the quarter had one.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (isWall(col, row)) map.decorBlock(col, row, T.wallPanel);
  }
}
// The wall art carries no collision of its own, so each band's rect is declared, flush with the
// painted edge.
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// --- the door -------------------------------------------------------------------------------------
// `decor`: it sits inside the south wall band whose rect already blocks it, and a second overlapping
// rect would only make the generated collision module harder to read.
map.stamp(DOOR_COLS[0], SOUTH, T.door, "decor", "Front Street door");

// --- rows 2-3: the office side ----------------------------------------------------------------------
// Four pieces on one row, west to east: the register writes here, the plat table stands in the
// middle where a tract is looked up, and the books and the money are at the far end under the same
// officer's eye.
//
// **Nothing is overlaid on any of these.** Richmond's counting room stamps a day book, a pen stand
// and a lamp onto its furniture, because `clerksTable` on that sheet is a bare writing table with
// nothing on it. Every desk on `tile-B-09` is the opposite: a complete composition with its own
// open ledger, inkwell, pen stand and chair already drawn. Overlaying more put a book and a lamp on
// the floorboards in front of the desks — the two-row art draws its writing surface in the upper
// row and its panelled front in the lower, so an overlay on the base row reads as an object dropped
// on the floor. Caught by rendering the map, which is the only way it could have been.
map.stamp(1, 2, T.registerDesk, "solid", "the register's desk");
map.stamp(7, 2, T.platTable, "solid", "the plat table");
map.stamp(11, 2, T.tractPress, "solid", "tract books and the office safe");
map.stamp(14, 2, T.pressCupboard, "solid", "press cupboard");

// --- rows 4-5: open behind the counter ----------------------------------------------------------------
// Nothing at all in this band. It is where the register stands and the only ground on the office
// side of the room, so the flood fill has to be able to run its whole width.
//
// --- rows 6-7: THE COUNTER ------------------------------------------------------------------------------
// `base`, not `solid`: the counter body blocks its ground-contact row and the rail above it lifts to
// the overlay layer, so a clerk standing behind the counter draws in front of the panelling and
// behind the rail, which is what a person behind a counter looks like.
for (let col = 1; col < WIDTH - 1; col += 2) {
  if (col === GATE_COLS[0]) continue;
  map.stamp(col, COUNTER_ROW, T.counterRail, "base", "the counter");
}

// --- rows 8-11: the public side ---------------------------------------------------------------------
// Two benches against the west wall and four rows of nothing else. An office that keeps people
// waiting in it is the whole of what needs saying, and the same sentence was made the same way in
// Richmond's counting room with three chairs.
map.stamp(1, 8, T.bench, "solid", "waiting bench");
map.stamp(1, 10, T.benchWorn, "solid", "waiting bench");
// The one thing on the public side that is not for sitting on: the desk an applicant fills in his
// own paper at, against the east wall where the light from the street reaches it.
map.stamp(14, 8, T.copyDesk, "solid", "the applicant's writing desk");

// --- wall dressing --------------------------------------------------------------------------------
// All `decor`, all inside a band whose rect already blocks — which is what lets both aisles stay open
// while the room still reads as furnished.
for (const col of [4, 6, 11, 13]) map.stamp(col, SOUTH, T.window, "decor", "Front Street window");
for (const col of [4, 13]) map.stamp(col, 0, T.window, "decor", "alley window");

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("RAILHEAD_LAND_OFFICE_BLOCKS", "scripts/generate-railhead-land-office-tmj.js")
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
