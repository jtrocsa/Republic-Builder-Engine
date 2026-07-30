// Generates apps/web/src/content/maps/archive-room.tmj and its collision module for the Institute
// Archive Room — the hub's second walkable interior, through the Main Hall's north door.
//
// Composited from the "Medieval Tavern" tileset: the same 48px/16-column/no-margin grid family as
// the field maps, and the same three sheets the Main Hall and the onboarding hallway already use.
// See docs/decision-log/0030-archive-room-tiled-interior.md for why a medieval-tavern pack dresses a
// present-day archive, and 0041-archive-room-mapbuilder-rebuild.md for this pass.
//
// Run with: node scripts/generate-archive-room-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/archive-room.palette.js. Layering, terrain-block tiling and
// collision come from scripts/lib/map-builder.js. This script owns layout only.
//
// Target anchors are load-bearing: ARCHIVE_ROOM_TARGETS in apps/web/src/main.js places the Archive
// Terminal and the doorway back to the Main Hall at coordinates chosen against the furniture stamped
// below, and the room's entry spawn is derived from the doorway's. A stamp may be restyled but not
// moved without re-checking both, and tests/unit/field-map-coordinates.test.js flood-fills the
// generated collision to prove the whole room is still walkable.
//
// ## What changed in Phase 58
//
// This was the last generator not built on MapBuilder, and it showed in four ways:
//
//   - **Collision was hand-written.** ARCHIVE_ROOM_BLOCK_RECTS was eleven rects transcribed by eye
//     in main.js, with the matching rect written in a trailing comment on each stamp here. It is now
//     generated from the stamps, like every other map since Phase 53.
//   - **No overlay layer**, so nothing in the room had walk-behind depth.
//   - **Floor was a quadrant shuffle**, `(col * 3 + row * 5) % 4`, scattering four cells that were
//     authored to sit together as one 2x2 block. `groundBlock()` tiles them by parity instead.
//   - **Three shelf runs drew twice their footprint** and both plants drew half of their neighbour,
//     because sizes were bare literals at the `gidRect(entry, 4, 2)` call sites and the palette
//     declared no footprints at all. See the palette header.
//
// ## Layout: the Main Hall's rhythm, one room over
//
// Same four-band alternation, for the reason given at length in
// scripts/generate-institute-hall-tmj.js: two full-width open corridors joined by two lanes cannot
// produce a pocket of floor the player can't reach, so connectivity is a consequence of the shape.
//
//   rows 0-1   north wall. Pennants and torches.
//   rows 2-3   record storage, wall to wall. The Archive Terminal — a writing desk — sits in it on
//              the doorway's own columns, at the head of the runner.
//   rows 4-5   OPEN cross-aisle, cols 1-18, no solid stamps at all.
//   rows 6-7   the working middle: the hearth, two long tables, and two lanes north-south (cols 3-4
//              and cols 9-10, the latter carrying the runner from the door to the Terminal).
//   rows 8-9   OPEN south aisle, cols 1-18, no solid stamps at all.
//   rows 10-11 south wall. The Main Hall doorway at cols 9-10, storage and benches on its inner
//              course.
//
// The room stays 20x12: 960x576 against a viewport of roughly 970x596 at 1366x768, so it sits still
// under the hub camera in both axes. It was 10x8 before Phase 51, where it stretched to ~1.7x and its
// 48px art never drew at its own resolution.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/archive-room.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/archive-room.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/archive-room.blocks.js");

const WIDTH = 20;
const HEIGHT = 12;

const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 10-11
const SOUTH = HEIGHT - WALL_SOUTH;
// The doorway back to the Main Hall, in the south wall. Two leaves, so ARCHIVE_ROOM_TARGETS.exitDoor
// stands at the pair's centre.
const DOOR_COLS = [9, 10];

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) => row < WALL_NORTH || row >= SOUTH || col === 0 || col === WIDTH - 1;

// Three floor zones, so the room reads as having places in it: the hearth nook in tan cut stone at
// the west end, plank flooring down the doorway runner and through the east records alcove, grey
// flagstone through the middle.
const inHearthNook = (col, row) => col <= 4 && row >= 5;
const inAlcove = (col, row) => col >= 13 && row >= 5;
const inRunner = (col, row) => col >= DOOR_COLS[0] && col <= DOOR_COLS[1] && row >= WALL_NORTH;

// --- ground -------------------------------------------------------------------------------------
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    let block = T.floorStone;
    if (isWall(col, row)) {
      block =
        col >= DOOR_COLS[0] && col <= DOOR_COLS[1] && row >= SOUTH ? T.wallStone : T.wallPanel;
    } else if (inHearthNook(col, row)) {
      block = T.floorSandstone;
    } else if (inAlcove(col, row) || inRunner(col, row)) {
      block = T.floorWood;
    }
    map.groundBlock(col, row, block);
  }
}

// The walls carry no art of their own on the structures layer, so their collision has to be
// declared. Each rect stops flush with the painted band.
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// --- doorway -------------------------------------------------------------------------------------
// `decor`: it sits inside the south wall band, whose rect already blocks it, and a second
// overlapping rect would only make the generated collision module harder to read.
for (const col of DOOR_COLS) map.stamp(col, SOUTH, T.door, "decor", "main hall doorway");

// --- rows 2-3: record storage, wall to wall ------------------------------------------------------
// Every unit is 2x2 and sits entirely inside the band, so the cross-aisle below stays clear. Fronts
// are alternated so a long run of shelving doesn't read as one tile repeated.
map.stamp(1, 2, T.sampleShelfA, "solid", "preserved sample shelf");
map.stamp(3, 2, T.recordShelf, "solid", "record shelf");
map.stamp(5, 2, T.recordShelfAlt, "solid", "record shelf");
map.stamp(7, 2, T.pigeonholeUpper, "solid", "pigeonhole rack");
// ARCHIVE_ROOM_TARGETS.terminal stands at (10.0,4.0), on this desk's south face, and opens the
// unit's Archive Challenges.
//
// On the doorway's own columns, deliberately: this is the one thing a player comes into this room to
// use, and they cross the room to reach it many times over a unit. Putting it at the far end of the
// north band instead — which an earlier draft of this layout did — means every visit is "up a lane,
// then turn and walk east", because the middle band's tables stand between the aisle and the desk.
// Straight up the runner from the door is both kinder and what the green-then-plank floor already
// draws.
map.stamp(DOOR_COLS[0], 2, T.writingDesk, "solid", "archive terminal desk");
map.stamp(11, 2, T.pigeonholeLower, "solid", "pigeonhole rack");
map.stamp(13, 2, T.recordCanisters, "solid", "sealed record canisters");
map.stamp(15, 2, T.cabinetA, "solid", "record cabinet");
map.stamp(17, 2, T.cabinetB, "solid", "record cabinet");

// --- rows 4-5: the open cross-aisle -------------------------------------------------------------
// No solid stamps in this band, by design.
map.stamp(DOOR_COLS[0], 4, T.rugRed, "decor", "archive terminal rug");

// --- rows 6-7: the working middle ---------------------------------------------------------------
// Two lanes north-south: cols 3-4 past the hearth, and cols 9-10 straight up from the doorway.
map.stamp(1, 6, T.fireplace, "solid", "hearth");
map.stamp(5, 6, T.intakeTable, "solid", "west transcription table");
map.stamp(11, 6, T.roundTable, "solid", "reading nook table");
map.stamp(13, 6, T.readingTable, "solid", "east reading table");
map.stamp(17, 6, T.chestB, "solid", "sealed record chest");

// Stools, all `decor`, each in the row directly above or below one of the two long tables so it
// reads as drawn up to it rather than standing alone on open floor.
for (const [col, row] of [
  [5, 5],
  [7, 5],
  [13, 5],
  [16, 5],
  [6, 8],
  [8, 8],
  [14, 8],
  [16, 8],
]) {
  map.stamp(col, row, (col + row) % 2 === 0 ? T.stool : T.stoolAlt, "decor", "reading stool");
}

// --- rows 8-9: the open south aisle -------------------------------------------------------------
map.stamp(DOOR_COLS[0], 8, T.rugGreen, "decor", "doorway runner rug");
// `base`, so the player passes behind the foliage — safe here, unlike against the north wall, because
// the aisle runs past both sides of a 1-tile planter. See the note in generate-institute-hall-tmj.js.
map.stamp(1, 8, T.plantPotted, "base", "archive greenery");
map.stamp(18, 8, T.plantTall, "base", "archive greenery");

// --- wall dressing -------------------------------------------------------------------------------
// All `decor`, and all inside a wall band whose rect already blocks — which is what lets both aisles
// stay open while the room still reads as furnished.
map.stamp(1, SOUTH, T.cabinetC, "decor", "south wall record cabinet");
map.stamp(4, SOUTH, T.chestA, "decor", "sealed record chest");
map.stamp(6, SOUTH, T.lowBench, "decor", "reading bench");
map.stamp(11, SOUTH, T.lowBench, "decor", "reading bench");
map.stamp(14, SOUTH, T.cabinetD, "decor", "south wall record cabinet");
map.stamp(17, SOUTH, T.sampleShelfC, "decor", "preserved sample shelf");
for (const col of [3, 8, 13, 17])
  map.stamp(col, WALL_NORTH - 1, T.wallTorch, "decor", "wall torch");
for (const col of [3, 8, 16]) map.stamp(col, SOUTH, T.wallTorch, "decor", "wall torch");
map.stamp(5, 0, T.bannerGold, "decor", "institute pennant");
map.stamp(10, 0, T.bannerNavy, "decor", "institute pennant");
map.stamp(15, 0, T.bannerGold, "decor", "institute pennant");
map.stamp(0, 5, T.wallSconce, "decor", "wall sconce");
map.stamp(WIDTH - 1, 5, T.wallSconce, "decor", "wall sconce");

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("ARCHIVE_ROOM_BLOCKS", "scripts/generate-archive-room-tmj.js")
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
