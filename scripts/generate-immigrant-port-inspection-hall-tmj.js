// Generates apps/web/src/content/maps/immigrant-port-inspection-hall.tmj and its collision module —
// the registry floor of the immigrant station at Ellis Island, New York Harbor, 17 April 1907.
//
// Run with: node scripts/generate-immigrant-port-inspection-hall-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/immigrant-port-inspection-hall.palette.js, and the reasoning
// behind the materials is in that file's header. Layering, terrain-block tiling and collision come
// from scripts/lib/map-builder.js. This script owns layout only.
//
// ## Entered from the south, because the building is
//
// The outdoor stamp is `withDoor(24, FRONT_ROW - 3, T.pavilion, "reception hall")` in
// generate-immigrant-port-tmj.js: the entrance pavilion at cols 24-27, fronting the forecourt, so
// doorCellOf() puts its door cell at (26, 4). The wharf is *south* and the hall's door is in its
// south wall, exactly as at Canal Crossroads, Richmond and Cottonwood Junction. Get this backwards
// and the player walks in through the back wall.
//
// ## The room is the queue, and the player walks it
//
//   rows 0-1    north wall. Sash windows — the real hall was glazed on three sides.
//   rows 2-3    THE DESKS. A press of filed manifests at the west end, two registry desks, the
//               clock, the money exchange counter and the station's safe at the east.
//   rows 4-6    OPEN. Where the inspector, the interpreter and the exchange clerk stand.
//   row  7      RAIL TWO, wall to wall, with its one gap at the WEST end (cols 1-2).
//   rows 8-10   THE SECOND PEN. The matron works here.
//   row  11     RAIL ONE, wall to wall, with its one gap at the EAST end (cols 19-20).
//   rows 12-15  THE HEAD OF THE LINE. Where the player comes in and where the surgeon stands.
//   rows 16-17  south wall. The wharf door at cols 10-11, sash windows either side.
//
// **The two gaps are at opposite ends, so the room is a switchback and crossing it is the mission.**
// A player who walks in has to go the length of the hall east, north through the first gap, the
// length of it west, north through the second, and only then reaches the desks — which is what a
// person did, between iron railings, in a line, for two to five hours. That is not friction for its
// own sake and it is the same device the Kansas land office argues for at length: a student who has
// walked the queue to reach the manifest has done in the legs what the mission is about.
//
// The cast is distributed along it rather than gathered at the end, so every leg of the walk is
// paid for: the surgeon is at the head of the line before the first rail, the matron is in the
// middle pen, and the inspector, the interpreter and the exchange clerk are past the second.
//
// **The rails are `base`, which is why the pens are three rows and not two.** A `base` stamp blocks
// only its ground-contact row, so a rail stamped at row 6 blocks row 7 and its ironwork lifts to
// the overlay on row 6 — walkable, and a body standing there draws behind it. That is deliberate:
// the row you can stand on while leaning on the rail is where a player talks across it, exactly as
// on the wharf outside.
//
// Same four-band alternation as every other interior in the game, for the reason set out at length
// in scripts/generate-institute-hall-tmj.js — but here the two open aisles are joined at *one* end
// each rather than across the whole width, so connectivity is a real claim rather than a
// consequence of the shape. The interior suite in tests/unit/field-map-coordinates.test.js
// flood-fills this room from its entry cell, and it is the assertion this map most needs.
//
// 22x18 is 1056x864 against a field viewport of roughly 970x596 at 1366x768 — bigger than the frame
// on both axes, which is the first interior in the game that is. It is meant to be: the real
// registry room was 200 feet by 100, the largest room any of these people had ever stood in, and a
// room you cannot see the end of is the one honest thing a 48px tileset can say about that.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/immigrant-port-inspection-hall.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(
  REPO_ROOT,
  "apps/web/src/content/maps/immigrant-port-inspection-hall.tmj"
);
const BLOCKS_OUT = path.join(
  REPO_ROOT,
  "apps/web/src/content/maps/immigrant-port-inspection-hall.blocks.js"
);

const WIDTH = 22;
const HEIGHT = 18;

const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 16-17
const SOUTH = HEIGHT - WALL_SOUTH;
// The wharf door, in the south wall. Two leaves, so the interior's exit marker stands at the pair's
// centre and FIELD_MAPS["unit-07"].interiors["immigrant-port-inspection-hall"].exit derives from it.
const DOOR_COLS = [10, 11];
// The two railings. Stamped at these rows, so each blocks the row below it.
const RAIL_ONE_ROW = 10; // blocks row 11
const RAIL_TWO_ROW = 6; // blocks row 7
// The one gap in each: the column whose rail stamp is simply not made. Rails are stamped on odd
// columns two at a time, so skipping col 19 opens cols 19-20 against the east wall and skipping
// col 1 opens cols 1-2 against the west.
const GATE_ONE_COL = 19;
const GATE_TWO_COL = 1;

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) => row < WALL_NORTH || row >= SOUTH || col === 0 || col === WIDTH - 1;

// --- ground -------------------------------------------------------------------------------------
// Floor wall to wall, *including* under the wall band. The wall blocks carry transparency along
// their own bottom edge and on the ground layer that is a hole through to the page; the walls go on
// `structures` below, over floor rather than over nothing.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    map.groundBlock(col, row, T.floorSlab);
  }
}

// --- walls --------------------------------------------------------------------------------------
// One material the whole way round. The first pass put brick reveals either side of the wharf door
// so the way out would read from the far end of a room whose far end you cannot see; rendered, a
// two-tile patch of red in a buff wall reads as damage rather than as a doorcase, and the door is
// perfectly legible on its own.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (isWall(col, row)) map.decorBlock(col, row, T.wallPlaster);
  }
}
// The wall art carries no collision of its own, so each band's rect is declared, flush with the
// painted edge.
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// --- the door ---------------------------------------------------------------------------------------
// `decor`: it sits inside the south wall band whose rect already blocks it, and a second overlapping
// rect would only make the generated collision module harder to read.
map.stamp(DOOR_COLS[0], SOUTH, T.door, "decor", "wharf door");

// --- rows 2-3: the desks -------------------------------------------------------------------------
// West to east, in the order a person met them: the sheets that have already been filed, the two
// desks where the questions are asked, the clock they are asked against, and the counter where a
// person who got through changed their money.
map.stamp(1, 2, T.manifestPress, "solid", "filed manifest sheets");
map.stamp(3, 2, T.registryDesk, "solid", "registry desk");
map.stamp(8, 2, T.registryDesk, "solid", "registry desk");
map.stamp(13, 2, T.tallClock, "solid", "the hall clock");
map.stamp(15, 2, T.exchangeCounter, "solid", "money exchange counter");
map.stamp(18, 3, T.safe, "solid", "the day's head tax");

// --- rows 4-6: open, behind the last rail ----------------------------------------------------------
// Nothing at all in this band. It is the only ground on the officers' side of the room and the
// flood fill has to be able to run its whole width — and it is where three of this map's five
// indoor characters stand.
//
// --- rows 6-7 and 10-11: THE RAILS -----------------------------------------------------------------
for (const [row, gate] of [
  [RAIL_TWO_ROW, GATE_TWO_COL],
  [RAIL_ONE_ROW, GATE_ONE_COL],
]) {
  for (let col = 1; col < WIDTH - 1; col += 2) {
    if (col === gate) continue;
    map.stamp(col, row, T.rail, "base", "registry floor rail");
  }
}

// --- rows 8-10: the second pen ------------------------------------------------------------------------
// **Nothing at all in this band, and that is measured rather than austere.** The pen is three rows
// deep, every object on these sheets is two rows tall, and a body's foot box spans 0.38 tiles — so
// one 2x2 bench in here leaves a single walkable lane 0.62 tiles wide as the only way across the
// middle of the room. The first draft had three of them and the e2e walk stuck on the second.
//
// A holding pen with nothing in it is also the truth: it is where people stood between two railings
// waiting to be called forward, and what fills it is people. Same argument the Kansas land office
// makes for its own empty band, and the same reason — the flood fill has to run its whole width.
//
// --- rows 12-15: the head of the line -------------------------------------------------------------
// Two benches down the west wall and one stack of luggage, leaving the whole east half of the band
// open — which is the lane a player walks the moment they come through the door, and the only route
// to the first gate.
map.stamp(1, 12, T.bench, "solid", "waiting bench");
map.stamp(1, 14, T.benchAlt, "solid", "waiting bench");
map.stamp(4, 14, T.luggage, "solid", "passengers' luggage");

// --- wall dressing ------------------------------------------------------------------------------------
// All `decor`, all inside a band whose rect already blocks — which is what lets both aisles stay open
// while the room still reads as a public hall.
for (const col of [5, 8, 14, 17]) map.stamp(col, SOUTH, T.window, "decor", "harbour window");
for (const col of [5, 10, 16]) map.stamp(col, 0, T.window, "decor", "north window");
for (const col of [3, 12, 19]) map.stamp(col, SOUTH, T.wallSconce, "decor", "wall sconce");

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule(
    "IMMIGRANT_PORT_INSPECTION_HALL_BLOCKS",
    "scripts/generate-immigrant-port-inspection-hall-tmj.js"
  )
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
