// Generates apps/web/src/content/maps/fairmeadow-building-and-loan.tmj and its collision module —
// the office of a borough savings and loan association, two miles from Fairmeadow, August 1957.
//
// Run with: node scripts/generate-fairmeadow-building-and-loan-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/fairmeadow-building-and-loan.palette.js, and the reasoning
// behind the materials is in that file's header. Layering, terrain-block tiling and collision come
// from scripts/lib/map-builder.js. This script owns layout only.
//
// ## Entered from the south, off the borough's own sidewalk
//
// The outdoor stamp is `withDoor(35, BOROUGH_FRONT_ROW - 3, T.buildingAndLoan, ...)` in
// generate-fairmeadow-tmj.js, so doorCellOf() puts its door cell at (37, 25) — on Broad Street's
// north walk, four doors east of the shop. Same south-facing frontage rule as every other building
// on that map.
//
// ## A counter, and which side of it the paper is on
//
//   rows 0-1    north wall. The back of the office.
//   rows 2-3    THE OFFICERS' END. The mortgage officer's desk against the north wall on the rug,
//               the safe beside it, the bound mortgage ledgers west, the clock east.
//   rows 4-5    Behind the counter. Open floor to walk it.
//   row  6-7    THE COUNTER. Two four-column runs at cols 1-4 and 9-12 with the locked press
//               cupboard closing cols 13-14, and one gap at cols 5-8 that is the only way through.
//               Board floor south of it, parquet north.
//   rows 8-9    THE PUBLIC SIDE. The writing slope and two chairs, against the walls, middle open.
//   rows 10-11  OPEN.
//   rows 12-13  south wall. The street door at cols 7-8, sash windows either side.
//
// **The checklist is on the desk at (6,2), behind the counter**, and `suburb-underwriting-checklist`
// anchors to it. Its own `record` line is *kept on the mortgage officer's desk, not in any file* —
// so the room is built to put every file in plain sight on the way past it. A player crossing this
// floor walks the length of two ledger presses and a locked cupboard before reaching the one sheet
// of paper that decides, and that sheet is loose.
//
// The gap in the counter is at the room's centre line, on the door's own columns, so the walk from
// the street to the desk is straight. That is deliberate and it is the opposite of Ellis Island's
// inspection hall, where the rail's one gate is off the entry axis and the queue has to turn. Nobody
// is stopped here. Nothing on this map stops anybody — that is what 0096 built the outdoor map
// around, and the room keeps faith with it.
//
// Same four-band alternation as every other interior: two full-width open aisles joined by the
// width of the room, which is what makes a sealed pocket impossible by construction rather than by
// patching. The interior suite in tests/unit/field-map-coordinates.test.js flood-fills the room from
// its entry cell.
//
// 16x14 is 768x672 against a field viewport of roughly 970x596 at 1366x768 — narrower than the frame
// and a little taller, so updateFieldPlayer() centres it horizontally and scrolls it a little
// vertically. The same size as Ellis Island's hearing room and Kansas's telegraph office, and
// deliberately smaller than the model house on the other end of this map: that room is a plan, this
// one is a counter.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/fairmeadow-building-and-loan.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/fairmeadow-building-and-loan.tmj");
const BLOCKS_OUT = path.join(
  REPO_ROOT,
  "apps/web/src/content/maps/fairmeadow-building-and-loan.blocks.js"
);

const WIDTH = 16;
const HEIGHT = 14;

const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 12-13
const SOUTH = HEIGHT - WALL_SOUTH;
// The street door, in the south wall. Two leaves, so the interior's exit marker stands at the pair's
// centre and FIELD_MAPS["unit-08"].interiors["fairmeadow-building-and-loan"].exit derives from it.
const DOOR_COLS = [7, 8];
// The counter. Two runs of four columns with the way through between them, on the door's own axis.
const COUNTER_ROW = 6;
// Two runs, wall to wall with the press cupboard, and one gap. The first pass started the west run
// at col 2 and left a one-column slot at col 1 between the cupboard above it and the writing slope
// below — three lattice points nothing could reach. The counter now meets the west wall, and the
// cupboard was moved from behind it to the east end, where it closes the run.
const COUNTER_RUNS = [1, 9];
// Where the parquet stops and the board floor starts — the counter's own row.
const PUBLIC_FLOOR_FROM = COUNTER_ROW + 2;

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) => row < WALL_NORTH || row >= SOUTH || col === 0 || col === WIDTH - 1;

// --- ground ----------------------------------------------------------------------------------------
// Two floors, split at the counter: parquet on the officers' side, plain board on the public side.
// Richmond's counting room does exactly this and the note there is the one that applies here too —
// the material changes at the line, so the line is legible before anybody explains it. Laid wall to
// wall *including* under the wall band, because the walls go on `structures` over floor.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    map.groundBlock(col, row, row >= PUBLIC_FLOOR_FROM ? T.floorBoard : T.floorParquet);
  }
}
// The rug in front of the officer's desk, laid on the ground layer so it is under the furniture
// rather than stamped over it. Exactly one block, and **on an even row and an even column**.
//
// `groundBlock` tiles by *absolute* parity — cell (row, col) takes the block's (row % 2, col % 2)
// quadrant — so a bordered 2x2 object laid at an odd column is served its quadrants in the wrong
// order and renders with its own woven border running down the middle. The first pass put this rug
// at cols 5-6 and did exactly that. The inquiry room's generator warns about the neighbouring
// version of this bug (tiling a rug across more than one block); this is the same property biting
// one block wide, and the fix is a parity rule rather than a size rule: **a bordered ground block
// starts on an even row and an even column.**
for (let row = 4; row < 6; row += 1) {
  for (let col = 6; col < 8; col += 1) map.groundBlock(col, row, T.rug);
}

// --- walls -----------------------------------------------------------------------------------------
// One material the whole way round, with brick in the street door's reveal so masonry reads where
// masonry is. The figured run of the wainscot was stamped behind the officer's desk on the first
// pass and rejected for the same reason the inquiry room rejected it: it renders as an olive damask
// patch in a cream-and-brown room, which reads as a stain rather than as a better wall.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (!isWall(col, row)) continue;
    const inDoorReveal = row >= SOUTH && col >= DOOR_COLS[0] - 1 && col <= DOOR_COLS[1] + 1;
    map.decorBlock(col, row, inDoorReveal ? T.wallBrick : T.wallWainscot);
  }
}
// The wall art carries no collision of its own, so each band's rect is declared, flush with the
// painted edge.
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// --- the door --------------------------------------------------------------------------------------
map.stamp(DOOR_COLS[0], SOUTH, T.door, "decor", "street door");

// --- rows 2-5: the officers' end ------------------------------------------------------------------------
// The bound mortgage ledgers, one volume a year, along the west end of the north wall. Flush with
// the wall band rather than a row down: dropped to row 3 the cells behind them are reachable only
// round three sides, which is the pocket the interior traversal test names on its first run.
map.stamp(1, WALL_NORTH, T.ledgerPressWide, "solid", "bound mortgage ledgers");
// **The mortgage officer's desk.** The checklist is on it and the record anchors here.
map.stamp(6, WALL_NORTH, T.officersDesk, "solid", "the mortgage officer's desk");
map.stamp(8, WALL_NORTH, T.safe, "solid", "the association's safe");
map.stamp(9, WALL_NORTH, T.ledgerPress, "solid", "bound share ledgers");
map.stamp(14, WALL_NORTH, T.tallClock, "solid", "the office clock");
// The current month's applications, locked up — at the east end of the counter, which is also what
// closes the counter's run against the east wall.
map.stamp(13, COUNTER_ROW, T.pressCupboard, "solid", "the press cupboard");
// The officer's own chair, at the desk. The only chair pattern in the room; see the palette.
map.stamp(7, 4, T.chair, "solid", "the officer's chair");

// --- rows 6-7: the counter --------------------------------------------------------------------------------
// Two runs with the way through between them. Solid, so a player has to walk the gap — the room's
// one piece of structure and the only thing in it that decides where anybody may stand.
for (const col of COUNTER_RUNS) map.stamp(col, COUNTER_ROW, T.counter, "solid", "the counter");
// The current ledger, open on the counter's west run, where an application is signed.
map.stamp(4, COUNTER_ROW, T.openBook, "decor", "the current ledger");

// --- rows 8-11: the public side -------------------------------------------------------------------------------
// A writing slope against the west wall with a part-filled application on it, and two chairs against
// the east. The middle of the room is open the whole way across, which keeps the two aisles joined.
map.stamp(1, 8, T.writingTable, "solid", "the writing slope");
map.stamp(1, 8, T.papers, "decor", "a part-filled application");
map.stamp(1, 10, T.chair, "solid", "a chair");
map.stamp(14, 8, T.chair, "solid", "a chair");
map.stamp(14, 10, T.chair, "solid", "a chair");
// A second slope against the east wall. Two places to stand and fill a form in, and eight tiles of
// bare board between them — which is a Tuesday morning at a borough association, and is also the
// only way the room can be crossed in a straight line from the door to the gap in the counter.
map.stamp(12, 10, T.writingTable, "solid", "the writing slope");

// --- wall dressing ------------------------------------------------------------------------------------------
for (const col of [3, 12]) map.stamp(col, 0, T.window, "decor", "north window");
for (const col of [4, 11]) map.stamp(col, SOUTH, T.window, "decor", "Broad Street window");
for (const col of [2, 13]) map.stamp(col, SOUTH, T.wallSconce, "decor", "wall sconce");

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule(
    "FAIRMEADOW_BUILDING_AND_LOAN_BLOCKS",
    "scripts/generate-fairmeadow-building-and-loan-tmj.js"
  )
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
