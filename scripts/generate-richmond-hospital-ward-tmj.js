// Generates apps/web/src/content/maps/richmond-hospital-ward.tmj and its collision module — one ward
// of Chimborazo Hospital, on the hill east of Richmond.
//
// Run with: node scripts/generate-richmond-hospital-ward-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/richmond-hospital-ward.palette.js, and the non-graphic rule
// that governs both the art and this layout is in that file's header. Layering, terrain-block tiling
// and collision come from scripts/lib/map-builder.js. This script owns layout only.
//
// ## Entered from the south, because the building is
//
// The outdoor stamp is `withDoor(38, 4, T.hospitalWard, "a Chimborazo ward")` in
// generate-richmond-tmj.js: cols 38-41, rows 4-7, fronting Broad Street at rows 8-9. The street is
// south, so the ward door is in the south wall.
//
// ## The layout is the building
//
// Chimborazo's wards were long single-storey whitewashed frame sheds with windows down both long
// walls, because cross ventilation was the era's entire theory of why hospitals killed people and
// Chimborazo was built to it. That is the room, and it dictates the bands:
//
//   rows 0-1    north wall, sash windows the length of it
//   rows 2-3    THE NORTH ROW OF COTS, heads to the wall, a bedside table between each pair
//   rows 4-5    OPEN aisle, full width. No solid stamps at all.
//   rows 6-7    THE WARD'S MIDDLE: the matron's desk with the register open on it (east), the long
//               work table (centre), the medicine cabinet and the linen presses (west)
//   rows 8-9    OPEN aisle, full width. No solid stamps at all.
//   rows 10-11  THE SOUTH ROW OF COTS, broken at the door columns so the player walks in at the
//               foot of the ward rather than into a cot
//   rows 12-13  south wall. The ward door at cols 11-12, windows either side.
//
// Two full-width open aisles is the same connectivity guarantee every other interior uses; see
// scripts/generate-institute-hall-tmj.js. The interior suite in
// tests/unit/field-map-coordinates.test.js flood-fills this room from its entry cell.
//
// ## Why every cot is empty
//
// The palette header argues this at length and it is worth repeating where the stamps are, because
// this is the file where it would be easiest to quietly break: **there is no wounded figure in this
// room and there must not be one.** Chimborazo in 1864 was full, and a ward of empty cots is only
// honest because the room says the rest another way — through Jane Ferris and Delia Marsh standing
// in it, and through the register on the desk, which is where the ward's arithmetic is and which is
// what a Chronicler came here to read. A ledger column carries how many came in, how many went back
// to the ranks and how many did not, without drawing any of it.
//
// 24x14 is 1152x672 against a field viewport of roughly 970x596 at 1366x768, so this room scrolls on
// both axes — the only interior in the game that does. That is the point of it: it should feel like
// a building with a far end you cannot see from the door.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/richmond-hospital-ward.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/richmond-hospital-ward.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/richmond-hospital-ward.blocks.js");

const WIDTH = 24;
const HEIGHT = 14;

const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 12-13
const SOUTH = HEIGHT - WALL_SOUTH;
// The ward door, in the south wall. Two leaves, so the interior's exit marker stands at the pair's
// centre and FIELD_MAPS["unit-05"].interiors["richmond-hospital-ward"].exit derives from it.
const DOOR_COLS = [11, 12];

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) => row < WALL_NORTH || row >= SOUTH || col === 0 || col === WIDTH - 1;

// --- ground -------------------------------------------------------------------------------------
// Scrubbed board wall to wall, *including* under the wall band, for the transparency reason recorded
// in the palette: every wall block on this sheet has one fully clear bottom pixel row, and on the
// ground layer that is a hole through to the page.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    map.groundBlock(col, row, T.floorPlank);
  }
}

// --- walls --------------------------------------------------------------------------------------
// Whitewash throughout, brick only in the door reveals. A frame hospital building was limewashed
// inside and out — cheap, and believed to be sanitary.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (!isWall(col, row)) continue;
    const inDoorReveal = row >= SOUTH && col >= DOOR_COLS[0] - 1 && col <= DOOR_COLS[1] + 1;
    map.decorBlock(col, row, inDoorReveal ? T.wallBrick : T.wallWhitewash);
  }
}
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

map.stamp(DOOR_COLS[0], SOUTH, T.door, "decor", "ward door");

// --- the cots ---------------------------------------------------------------------------------------
// A cot is 1 col x 2 rows, so a row of them lines up on one stamp row. Two cots, then a bedside table
// between the pair, then a gap — which is how a ward was laid out, and it also leaves the row
// permeable so a player can cross between the cots instead of walking around the whole rank.
//
// `solid`, not `base`: a cot is low enough that lifting its upper row to the overlay would let a
// player stand inside it, which is both a collision bug and, in this room, an unpleasant one.
const COT_PITCH = 3;
function cotRow(row, label) {
  for (let col = 1; col + 2 < WIDTH - 1; col += COT_PITCH) {
    // The south rank breaks at the doorway. The player walks in at the foot of the ward, into floor.
    const atDoor = row >= 10 && col + 2 >= DOOR_COLS[0] - 1 && col <= DOOR_COLS[1] + 1;
    if (atDoor) continue;
    map.stamp(col, row, T.cot, "solid", label);
    map.stamp(col + 1, row, T.cot, "solid", label);
    map.stamp(col + 2, row, (col / COT_PITCH) % 2 ? T.bedsideTableAlt : T.bedsideTable, "solid", "bedside table");
  }
}
cotRow(2, "ward cot");
cotRow(10, "ward cot");

// --- rows 4-5 and 8-9: the open aisles ----------------------------------------------------------------
// Nothing solid in either band, the full width of the room. These are what a ward is: the beds are
// against the walls and everything that happens, happens in the middle.
//
// --- rows 6-7: the ward's middle -----------------------------------------------------------------------
map.stamp(1, 6, T.linenPress, "solid", "linen press");
map.stamp(3, 6, T.medicineCabinet, "solid", "medicine cabinet");
map.stamp(6, 6, T.storeCupboard, "solid", "ward stores");
map.stamp(9, 6, T.wardTable, "solid", "ward work table");
// overlayStamp, not stamp: writing to `structures` over a table replaces the table's own tile and
// punches a hole in it. Safe here because the table's cells are solid — no player can be under it.
map.overlayStamp(10, 7, T.papers, "requisitions");
map.stamp(14, 6, T.chair, "decor", "ward chair");
map.stamp(16, 6, T.matronDesk, "solid", "the matron's desk");
// The ward register, open. UNIT5_HOSPITAL_WARD_SOURCE_POINTS anchors this room's record to this
// exact stamp, so the two move together or not at all. See the header for why the register carries
// this room rather than anything painted in a cot.
map.overlayStamp(17, 7, T.openBook, "the ward register");
map.stamp(15, 6, T.chair, "decor", "the matron's chair");
map.stamp(19, 6, T.linenPressAlt, "solid", "linen press");
map.stamp(21, 6, T.lowShelf, "solid", "ward shelf");
map.overlayStamp(21, 7, T.oilLamp, "ward lamp");

// --- wall dressing ---------------------------------------------------------------------------------------
// Windows the length of both long walls — see the palette on why that is the building rather than
// decoration. All `decor`, all inside a band whose rect already blocks.
for (const col of [2, 5, 8, 11, 14, 17, 20]) map.stamp(col, 0, T.window, "decor", "ward window");
for (const col of [2, 5, 8, 15, 18, 21]) map.stamp(col, SOUTH, T.window, "decor", "ward window");
// No potted greenery in here, and the second reason is better than the first. The first is that the
// east one sealed fifty-one cells of floor in this room's south-east corner: `base` blocks a sprite's
// ground-contact row, that row was the only way past the last cot in the rank, and the interior
// traversal test named the pocket by coordinate. The second is that a Confederate military hospital
// ward was a scrubbed board room with cots and a stove in it. Ferns are a parlour.
for (const [col, row] of [
  [0, 4],
  [0, 9],
  [WIDTH - 1, 4],
  [WIDTH - 1, 9],
]) {
  map.stamp(col, row, T.wallSconce, "decor", "wall sconce");
}

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("RICHMOND_HOSPITAL_WARD_BLOCKS", "scripts/generate-richmond-hospital-ward-tmj.js")
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
