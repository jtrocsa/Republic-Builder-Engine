// Generates apps/web/src/content/maps/fairmeadow-model-house.tmj and its collision module — the
// furnished house the developer keeps open on Sundays at Fairmeadow, Pennsylvania, August 1957.
//
// Run with: node scripts/generate-fairmeadow-model-house-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/fairmeadow-model-house.palette.js, and the reasoning behind
// the materials is in that file's header. Layering, terrain-block tiling and collision come from
// scripts/lib/map-builder.js. This script owns layout only.
//
// ## Entered from the south, at the third house along Fairmeadow Drive
//
// The outdoor stamp is `withDoor(MODEL_HOUSE_COL, top, entry, "model house")` at col 20 in
// generate-fairmeadow-tmj.js, so doorCellOf() puts its door cell on the walk at row 6. Every house
// on that map faces south, because every building elevation in the art library is drawn facing
// south — see 0096 §3 — so the front door is in the south wall here, and the player arrives facing
// up the hall.
//
// ## The only interior in the game with interior walls
//
// Eight rooms have shipped before this one and every one of them is a single open space. This one
// is not, and the reason is on the document it exists to hand over: the terms sheet sells **three
// bedrooms, one bath, one thousand square feet**, and a plan is the thing being bought. A visitor
// walked the partitions. So there is a partition run across row 7 with three openings in it, and
// two stubs upstairs dividing the sleeping end into three.
//
//   rows 0-1    north wall. The back of the house, with a casement over each bedroom.
//   rows 2-6    THE SLEEPING END. Three bedrooms and the bath, off a cross-hall.
//               cols  1-6   the double bedroom: bed, two nightstands, a closet pair.
//               cols  8-11  the second bedroom: a single bed, a nightstand, a closet pair.
//               cols 13-15  the bath: pan, vanity, tub, on tiled wall and pale vinyl.
//               cols 17-18  the third bedroom: a single bed and a wardrobe, no built-in.
//   row  7      PARTITION, cols 1-18, with openings at cols 4, 9-10 and 16.
//   rows 8-9    THE HALL. Open the full width — the two aisles joined, which is the rule that
//               makes a sealed pocket impossible by construction rather than by patching.
//   rows 10-13  THE PUBLIC ROOMS, open to each other with no wall between them.
//               cols  1-7   the kitchen: mint range and refrigerator, sink, wall cabinets, on
//                           slate-and-cream vinyl. Two of the three appliances the sheet promises.
//               cols  9-18  the living room: the suite, the coffee table, the bookcase, the palm.
//   rows 14-15  south wall. Front door at cols 9-10, the picture window east of it.
//
// **The card table is at (11,12), two tiles inside the front door**, and the stack of terms sheets
// on it is `suburb-model-home-terms-sheet`. It is the first object a visitor meets and the last
// thing they take away, which is exactly where a sales office puts it. It is also the only piece of
// furniture in the house that is not for sale.
//
// ## Nobody lives here and the room has to say so
//
// No coats, no dishes in the sink, no post on the mat, no photographs, nothing on any wall. The two
// people in the room are the man selling it and a woman deciding whether to buy it, and neither of
// them lives here either. See the palette header for what was deliberately left out of the kit.
//
// 20x16 is 960x768 against a field viewport of roughly 970x596 at 1366x768 — a shade narrower than
// the frame and taller than it, so updateFieldPlayer() centres it horizontally and scrolls it
// vertically. Larger than the lending office two miles away (16x14) on purpose: this is the room
// with a floor plan and that is the room with a counter.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/fairmeadow-model-house.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/fairmeadow-model-house.tmj");
const BLOCKS_OUT = path.join(
  REPO_ROOT,
  "apps/web/src/content/maps/fairmeadow-model-house.blocks.js"
);

const WIDTH = 20;
const HEIGHT = 16;

const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 14-15
const SOUTH = HEIGHT - WALL_SOUTH;
// The front door, in the south wall. Two leaves, so the interior's exit marker stands at the pair's
// centre and FIELD_MAPS["unit-08"].interiors["fairmeadow-model-house"].exit derives from it.
const DOOR_COLS = [9, 10];
// The partition between the sleeping end and the public rooms. One row deep, with three openings —
// see the header; two would still leave the two aisles joined but three is what a centre-hall plan
// actually has, and the middle one is the hall itself.
const PARTITION_ROW = 7;
// One opening per alcove, and the two middle ones are the hall.
//
// **This took three passes and every one of them was found by the flood fill rather than by eye.**
// {4, 9, 10, 16} sealed the bath and the third bedroom outright: col 16 is a partition stub's own
// column, so an opening beneath it opens onto the stub rather than into a room. {4, 9, 10, 14, 17}
// looked right on the plan and was still sealed, because an opening also has to have an *open
// column above it* — the bath's tub occupies cols 13-14 down to the partition, and the third
// bedroom's shelving occupies col 17 down to the partition, so both openings met furniture. Cols 15
// and 18 are the two columns those alcoves actually leave clear.
//
// The general rule, which nothing else in this repo has needed until now: **a doorway is a column,
// not a gap.** Being the only interior in the game with interior walls is what buys that lesson, and
// the price of it is that this room must be flood-filled after every furniture move.
const PARTITION_OPENINGS = new Set([4, 9, 10, 15, 18]);
// Where the kitchen's vinyl stops and the living room's parquet starts. No wall here: the two rooms
// are open to each other, and the change of floor is the only thing that says they are two rooms.
const KITCHEN_EAST = 8;
// The bath, the one place the wall material changes.
const BATH_COLS = [13, 15];

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isOuterWall = (col, row) =>
  row < WALL_NORTH || row >= SOUTH || col === 0 || col === WIDTH - 1;
const inBath = (col, row) =>
  col >= BATH_COLS[0] && col <= BATH_COLS[1] && row >= WALL_NORTH && row < PARTITION_ROW;

// --- ground ---------------------------------------------------------------------------------------
// Three floors, laid wall to wall *including* under the wall band — the walls go on `structures`
// over floor rather than on the ground layer, which is what lets a wall block keep a transparent
// bottom pixel row without punching a hole in the room.
//
// The public rooms are the only place two floors meet on open ground, and they meet on a straight
// line at KITCHEN_EAST with no threshold strip. That is correct for the period and for the plan: a
// kitchen open to a living room with the vinyl simply stopping is what a 1957 ranch did, and it is
// also the only way a player reads two rooms where there is no wall.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (inBath(col, row)) map.groundBlock(col, row, T.floorVinylPale);
    else if (row > PARTITION_ROW + 2 && col < KITCHEN_EAST) map.groundBlock(col, row, T.floorVinyl);
    else map.groundBlock(col, row, T.floorParquet);
  }
}

// --- walls ------------------------------------------------------------------------------------------
// One material the whole way round, and a second one for the bath only. The bath is three tiles
// wide with a partition stub either side of it, and at that size the change of wall is what tells a
// player it is a room rather than a cupboard — which is the same job the counting room's brick door
// reveal does, in the same three tiles.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (isOuterWall(col, row)) {
      map.decorBlock(col, row, inBath(col, row) ? T.wallTiled : T.wall);
    }
  }
}
// The wall art carries no collision of its own, so each band's rect is declared, flush with the
// painted edge.
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// --- the partitions -----------------------------------------------------------------------------------
// The cross-partition, one row deep, and the two stubs that divide the sleeping end. Each stub runs
// from the north wall down to the partition, so every bedroom opens south into the hall and nothing
// opens into anything else. Declared as collision in runs rather than per tile, so the blocks module
// stays readable.
for (let col = 1; col < WIDTH - 1; col += 1) {
  if (PARTITION_OPENINGS.has(col)) continue;
  map.decorBlock(col, PARTITION_ROW, inBath(col, PARTITION_ROW - 1) ? T.wallTiled : T.wall);
}
{
  let runStart = null;
  for (let col = 1; col <= WIDTH - 1; col += 1) {
    const solid = col < WIDTH - 1 && !PARTITION_OPENINGS.has(col);
    if (solid && runStart === null) runStart = col;
    if (!solid && runStart !== null) {
      map.block({
        x1: runStart,
        y1: PARTITION_ROW,
        x2: col,
        y2: PARTITION_ROW + 1,
        kind: "partition",
      });
      runStart = null;
    }
  }
}
// The two stubs, at the bath's own columns. Between them and the outer walls they make four
// alcoves: bedroom, bedroom, bath, bedroom.
for (const col of [BATH_COLS[0] - 1, BATH_COLS[1] + 1]) {
  for (let row = WALL_NORTH; row < PARTITION_ROW; row += 1) map.decorBlock(col, row, T.wall);
  map.block({ x1: col, y1: WALL_NORTH, x2: col + 1, y2: PARTITION_ROW, kind: "partition" });
}
// One more stub between the two north bedrooms, and it runs the full depth like the other two.
//
// It was three rows deep first, so the two north bedrooms shared their back half. That looked
// generous and it broke `map-tile-integrity`'s cut-out rule, in a way worth writing down because
// the rule is not obviously about walls at all. That test groups everything above the ground into
// connected shapes and skips any shape containing a see-through cell — so every interior's wall
// ring passes only because a **door** is stamped into it. A partition that reaches no other wall is
// its own shape, fully opaque on all four sides, and reads to the test as a square of swapped
// material: the sand-patch-in-the-grass defect it exists to catch.
//
// The fix is the same thing that is true of a real partition: **it meets another wall.** At full
// depth this stub reaches the north band, the cross-partition reaches it back, and all of it is one
// shape with the front door in it. Nothing was weakened to get there.
for (let row = WALL_NORTH; row < PARTITION_ROW; row += 1) map.decorBlock(7, row, T.wall);
map.block({ x1: 7, y1: WALL_NORTH, x2: 8, y2: PARTITION_ROW, kind: "partition" });

// --- the front door and the windows ---------------------------------------------------------------------
map.stamp(DOOR_COLS[0], SOUTH, T.frontDoor, "decor", "front door");
map.stamp(DOOR_COLS[1], SOUTH, T.frontDoor, "decor", "front door");
// The picture window, east of the door, over the living room. The one thing on the sheet that is
// visible from the street and the reason the living room is on this side of the plan.
map.stamp(13, SOUTH, T.pictureWindow, "decor", "picture window");
// A casement over each bedroom and one over the kitchen sink.
for (const col of [3, 10, 17]) map.stamp(col, 0, T.window, "decor", "bedroom window");
map.stamp(2, SOUTH, T.window, "decor", "kitchen window");

// --- rows 2-6: the sleeping end -----------------------------------------------------------------------
// The double bedroom. Bed against the north wall between its two nightstands, closet pair on the
// west wall. Beds go flush with the wall band rather than a row down: dropped to row 3 the double
// bed left the cell at (1,2) reachable only round three sides of its own frame, which is the pocket
// the interior traversal test names on its first run.
map.stamp(1, WALL_NORTH, T.nightstand, "solid", "nightstand");
map.stamp(2, WALL_NORTH, T.bedDouble, "solid", "the double bed");
map.stamp(4, WALL_NORTH, T.nightstand, "solid", "nightstand");
map.stamp(5, WALL_NORTH, T.wardrobe, "solid", "wardrobe");
map.stamp(6, WALL_NORTH, T.wardrobe, "solid", "wardrobe");
map.stamp(1, WALL_NORTH + 3, T.sideTable, "solid", "a side table");

// The second bedroom. A single bed and one nightstand; the closet pair is on the stub.
map.stamp(8, WALL_NORTH, T.bedSingle, "solid", "a single bed");
map.stamp(9, WALL_NORTH, T.nightstand, "solid", "nightstand");
map.stamp(10, WALL_NORTH, T.wardrobe, "solid", "wardrobe");
map.stamp(11, WALL_NORTH, T.wardrobe, "solid", "wardrobe");

// The bath. Pan and vanity on the north wall, tub across the alcove's foot — the whole fitting-out
// of "one bath" in three tiles, which is what one thousand square feet bought.
map.stamp(BATH_COLS[0], WALL_NORTH, T.toilet, "solid", "the bathroom");
map.stamp(BATH_COLS[0] + 1, WALL_NORTH, T.vanity, "solid", "the bathroom");
map.stamp(BATH_COLS[0], PARTITION_ROW - 2, T.bath, "solid", "the bathroom");

// The third bedroom. The same single bed as the second — two children's rooms furnished out of one
// order, which is what a builder did and what the palette records the art forcing anyway.
map.stamp(17, WALL_NORTH, T.bedSingle, "solid", "a single bed");
map.stamp(18, WALL_NORTH, T.wardrobe, "solid", "a wardrobe");
map.stamp(17, WALL_NORTH + 3, T.shelf, "solid", "open shelving");

// --- rows 10-13: the kitchen -----------------------------------------------------------------------------
// The run along the west wall, and the range and refrigerator in the colour the advertising used.
// The hood hangs on the wall band over the range rather than on the floor, so it is `decor`.
map.stamp(1, 10, T.wallCabinets, "solid", "wall cabinets");
map.stamp(1, 12, T.rangeMint, "solid", "the electric range");
map.stamp(2, 12, T.sinkBase, "solid", "the sink");
map.stamp(3, 12, T.fridgeMint, "solid", "the refrigerator");
map.stamp(1, 11, T.rangeHood, "decor", "extractor hood");
// The dinette: a folding table with two chairs' worth of room round it, east of the appliances and
// clear of the hall.
// The dinette sits at col 6 rather than col 5, and the run of wall cabinets is why: the cabinets
// reach x5, the appliance run reaches x4, and a table starting at col 5 closed a three-cell slot at
// col 4 between the refrigerator, the cabinets above it and the table beside it. Col 5 is now the
// kitchen's own aisle, open from the hall to the south wall.
map.stamp(6, 11, T.dinetteTable, "solid", "the dinette table");
map.stamp(5, 10, T.toaster, "decor", "a toaster");
map.stamp(6, 13, T.bench, "solid", "a bench");

// --- rows 10-13: the living room --------------------------------------------------------------------------
// The suite, arranged round the coffee table facing the picture window, which is how a room gets
// staged for a photograph and therefore how a model house was arranged.
map.stamp(15, 10, T.sofa, "solid", "the sofa");
map.stamp(14, 11, T.armchair, "solid", "an armchair");
map.stamp(17, 11, T.armchairAlt, "solid", "an armchair");
// The coffee table sits one column west of centre, and that is a collision decision rather than a
// composition one: at (15,12) the suite closed a ring — sofa north, coffee table south, an armchair
// on each side — round two open cells nothing could reach. A furniture arrangement that reads
// perfectly well in a photograph can seal a pocket, and only the flood fill says so.
map.stamp(14, 12, T.coffeeTable, "solid", "the coffee table");
map.stamp(18, 10, T.bookcase, "solid", "a bookcase");
map.stamp(18, 12, T.plant, "solid", "a potted palm");
map.stamp(12, 13, T.plantSmall, "decor", "a potted plant");
map.stamp(17, 13, T.stool, "solid", "a stool");

// **The card table, two tiles inside the front door.** The terms sheets are on it; see the header.
map.stamp(11, 11, T.cardTable, "solid", "the card table");

// --- rows 8-9: the hall -------------------------------------------------------------------------------------
// One console against the west end and one against the east, so the band between the sleeping end
// and the public rooms is furnished rather than merely crossed — and the middle of it stays open the
// whole way, which is what keeps the two aisles joined.
map.stamp(1, 8, T.bench, "solid", "a hall bench");
// Clear of both east doorways: the bath's is col 15 and the third bedroom's is col 18, and a bench
// across either of them shuts the room it serves.
map.stamp(16, 8, T.bench, "solid", "a hall bench");

// --- wall dressing ------------------------------------------------------------------------------------------
// There is none, and that is the finding rather than an omission. Nothing hangs on any wall in this
// house: no picture, no mirror, no calendar, no clock. Eight rooms have shipped before this one and
// every one of them dresses its walls, because in every one of them somebody works or waits. Here a
// player walks a fully furnished three-bedroom house and finds not one object that belongs to a
// person — which is the thing to feel before reading a word of the sheet on the card table.

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule(
    "FAIRMEADOW_MODEL_HOUSE_BLOCKS",
    "scripts/generate-fairmeadow-model-house-tmj.js"
  )
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
