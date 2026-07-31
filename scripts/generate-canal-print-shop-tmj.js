// Generates apps/web/src/content/maps/canal-print-shop.tmj and its collision module — the printing
// office on Canal Crossroads' Market Street, and the first room any field map opens into.
//
// Run with: node scripts/generate-canal-print-shop-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/canal-print-shop.palette.js, and the three decisions taken
// against pixels are recorded in that file's header. Layering, terrain-block tiling and collision
// come from scripts/lib/map-builder.js. This script owns layout only.
//
// ## The room has to be entered from the south, because the building is
//
// The outdoor stamp is `withDoor(31, 6, T.printOffice, "printing office")` in
// generate-canal-crossroads-tmj.js: cols 31-32, rows 6-7, fronting Market Street at rows 8-9. So the
// street is *south* of the building and the shop's door is in its south wall. FIELD_MAPS's
// interior entry lands the player just inside that door facing north, and the exit marker sits on
// it — get this backwards and the player walks in through the back wall.
//
// ## Layout: the Archive Room's rhythm, in a working shop
//
// Same four-band alternation as the two Institute interiors, for the reason set out at length in
// scripts/generate-institute-hall-tmj.js: two full-width open aisles joined by north-south lanes
// cannot produce a pocket of floor the player is unable to reach, so connectivity is a consequence
// of the shape rather than something to patch afterwards. The interior suite in
// tests/unit/field-map-coordinates.test.js flood-fills this room from its entry cell and fails on a
// sealed pocket.
//
//   rows 0-1    north wall. Windows over the press floor — north light is what a press floor is
//               arranged around, and printers complained about its absence constantly.
//   rows 2-4    THE PRESS FLOOR: the hand press against the west wall, two compositor's cases,
//               the proof cupboard, and the paper bales in the north-east corner.
//   rows 5-6    OPEN cross-aisle, cols 1-18. No solid stamps at all.
//   rows 7-8    the working middle: the stove west, the imposing table centre, and Pike's own desk
//               east on its parquet with the safe behind him.
//   rows 9-11   OPEN south aisle, three rows deep, with storage against the wall band only.
//   rows 12-13  south wall. The street door at cols 9-10.
//
// 20x14 is 960x672 against a field viewport of roughly 970x596 at 1366x768, so the room fits
// horizontally and scrolls a little vertically. That is deliberate and it is the difference between
// this and the Archive Room, which is sized never to scroll: a shop the player walks *into* off a
// street should feel like a place with a far end, and updateFieldPlayer() centres a surface smaller
// than its frame on either axis independently.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/canal-print-shop.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/canal-print-shop.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/canal-print-shop.blocks.js");

const WIDTH = 20;
const HEIGHT = 14;

const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 12-13
const SOUTH = HEIGHT - WALL_SOUTH;
// The street door, in the south wall. Two leaves, so the interior's exit marker stands at the pair's
// centre and FIELD_MAPS["unit-04"].interiors["canal-print-shop"].exit is derived from it.
const DOOR_COLS = [9, 10];

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) => row < WALL_NORTH || row >= SOUTH || col === 0 || col === WIDTH - 1;
// Pike's corner: parquet under the desk and its approach, boards everywhere else. One room, two
// halves, at the cost of a predicate — see the palette header.
const inEditorCorner = (col, row) => col >= 14 && row >= 6 && row < SOUTH;

// --- ground ---------------------------------------------------------------------------------------
// Floor is painted wall to wall, *including* under the wall band. Every wall block on this sheet
// carries one fully transparent bottom pixel row, and on the ground layer that is a hole through to
// the page; the walls go on `structures` below, over floor rather than over nothing.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    map.groundBlock(col, row, inEditorCorner(col, row) ? T.floorParquet : T.floorPlank);
  }
}

// --- walls ------------------------------------------------------------------------------------------
// Buff plaster through the room; brick on the stove's own wall and in the doorway reveals, so the
// two places that need to read as masonry do. See the palette header for why this is not the
// panelled wainscot the first pass used.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (!isWall(col, row)) continue;
    const inDoorReveal = row >= SOUTH && col >= DOOR_COLS[0] - 1 && col <= DOOR_COLS[1] + 1;
    const onStoveWall = col === 0 && row >= 6 && row <= 9;
    map.decorBlock(col, row, inDoorReveal || onStoveWall ? T.wallBrick : T.wallPlaster);
  }
}
// The wall art carries no collision of its own, so each band's rect is declared. Flush with the
// painted edge in every case.
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// --- the doorway ---------------------------------------------------------------------------------
// `decor`: it sits inside the south wall band, whose rect already blocks it, and a second
// overlapping rect would only make the generated collision module harder to read.
map.stamp(DOOR_COLS[0], SOUTH, T.door, "decor", "market street door");

// --- rows 2-4: the press floor ----------------------------------------------------------------------
// The press is three rows tall and stands against the north wall, its top row inside the wall band.
// `solid`, not `base`: there is no walkable ground behind it to walk *into*, and lifting its upper
// rows to the overlay would only let a player stand inside the frame.
map.stamp(2, 2, T.press, "solid", "hand press");
map.stamp(4, 3, T.paperStack, "solid", "printing paper");
// The two compositor's cases, standing out into the room rather than flat against the wall, with a
// lane between them — a compositor works standing at a case, so each needs a cell in front of it.
map.stamp(7, 3, T.typeCase, "solid", "compositor's case");
map.stamp(10, 3, T.typeCase, "solid", "compositor's case");
map.stamp(13, 3, T.proofCupboard, "solid", "proof cupboard");
map.stamp(16, 3, T.paperStack, "solid", "printing paper");
// North light over the press floor and over the cases. A press floor is arranged around it.
for (const col of [3, 6, 9, 12, 15]) map.stamp(col, 0, T.window, "decor", "shop window");

// --- rows 5-6: the open cross-aisle -----------------------------------------------------------------
// Nothing at all in this band. Both small props that were here in the first pass — a lamp and a
// sheaf of paper — sat on bare floor in the middle of the room, which reads as dropped rather than
// as put down; they are on the tables below now.
//
// --- rows 7-8: the working middle ---------------------------------------------------------------------
map.stamp(1, 7, T.stove, "solid", "shop stove");
map.stamp(1, 9, T.chair, "decor", "stove chair");
map.stamp(3, 9, T.chair, "decor", "stove chair");
// The imposing surfaces, out on the floor where a forme is carried to them from either case.
map.stamp(7, 7, T.imposingTable, "solid", "imposing table");
map.stamp(10, 7, T.imposingTable, "solid", "imposing table");
// overlayStamp, not stamp: writing to `structures` over a table replaces the table's own tile and
// punches a hole in it. The overlay canvas composites above instead — and it is safe here precisely
// because these cells are solid, so no player can ever be underneath the art.
map.overlayStamp(7, 8, T.oilLamp, "shop lamp");
map.overlayStamp(11, 8, T.papers, "loose sheets");
// Pike's corner. The desk faces the room, the safe stands behind his shoulder against the east wall,
// and the rug is under his feet. UNIT4_PRINT_SHOP_NPCS puts him at the desk's south face.
map.stamp(15, 7, T.editorDesk, "solid", "editor's desk");
map.stamp(15, 9, T.rug, "decor", "editor's rug");
map.stamp(14, 7, T.chair, "decor", "editor's chair");
map.stamp(18, 7, T.safe, "decor", "office safe");
map.stamp(18, 8, T.openBook, "decor", "subscription book");

// --- rows 9-11: the open south aisle ------------------------------------------------------------------
// Nothing solid in any of the three rows. This is the room's breathing space and the run the player
// walks in on, and it is what the traversal flood fill has to be able to cross.
map.stamp(2, 10, T.plantPotted, "base", "shop greenery");

// --- wall dressing --------------------------------------------------------------------------------------
// All `decor`, all inside a band whose rect already blocks — which is what lets both aisles stay
// open while the room still reads as furnished. No framed art: see the palette header.
map.stamp(1, SOUTH, T.bookcase, "decor", "bound back numbers");
map.stamp(4, SOUTH, T.bookcaseWide, "decor", "bound back numbers");
map.stamp(13, SOUTH, T.bookcase, "decor", "bound back numbers");
map.stamp(16, SOUTH, T.bookcaseWide, "decor", "bound back numbers");
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
  map.toBlocksModule("CANAL_PRINT_SHOP_BLOCKS", "scripts/generate-canal-print-shop-tmj.js")
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
