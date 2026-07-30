// Generates apps/web/src/content/maps/institute-hall.tmj and its collision module for the
// Chronicle Institute's Main Hall — the present-day hub the player returns to between Chronotravel
// runs. See docs/decision-log/0037-institute-hall-tiled-rebuild.md and, for the Phase 58 re-lay,
// 0040-institute-traversal-and-mission-split.md.
//
// Run with: node scripts/generate-institute-hall-tmj.js   (or `npm run maps:build`)
//
// Which tile is which piece of furniture comes from
// apps/web/src/content/tilesets/maps/institute-hall.palette.js. Layering, terrain-block tiling and
// collision come from scripts/lib/map-builder.js. This script owns layout only.
//
// Target anchors are load-bearing: HUB_TARGETS in apps/web/src/main.js places the Director, the two
// researchers, the Preservation Case, the Navigation Table and the Archive Room door at coordinates
// chosen against the furniture stamped below, and the post-hallway guided tour highlights three of
// them in place. A stamp may be restyled but not moved without re-checking those six coordinates,
// the three patrol loops in HUB_NPC_PATROLS, and the player spawn.
//
// ## Size
//
// 23x12 at 48px is 1104x576, against a rendered `.institute-map` frame of roughly 970x596 at
// 1366x768.
//
// The **height** is the load-bearing half: 576 < 596, so updateHubCamera() never scrolls
// vertically, and the north wall band — which carries the Institute's pennants — is always fully
// in frame. A first pass at 23x14 (672px tall) scrolled 76px and sliced every banner in half at the
// top of the viewport, which is exactly the cut-off-art defect Phase 53 was about.
//
// Horizontal scroll is fine and wanted: 1104 > 970, so the hall reads as wider than the window and
// the camera follows the player east and west.
//
// ## Layout: two open corridors, two furnished bands
//
// The Phase 54 layout put furniture in all four row bands and left one-tile lanes between the
// pieces. Against a foot box 0.56 tiles wide that is technically passable and miserable in practice,
// and worse, three runs happened to line up: `sampleShelfC` plugged the cross-aisle, a reading table
// plugged the column beside it, and the west cabinets plugged the south band. The result was a room
// whose entire west end — including the Preservation Case — was sealed off from the spawn. It
// shipped, because the guard at the time asserted that each target had *a* clear cell near it, which
// is a local property and not the one a player experiences.
//
// So the bands now alternate, and the two walkable ones are unbroken end to end:
//
//   rows 0-1   north wall. Pennants, torches, the Archive Room doorway at cols 11-12.
//   rows 2-3   record storage, wall to wall, with one gap at cols 11-12 for the Archive Room
//              approach — the tour points the player at that door before they have learned to walk
//              around furniture.
//   rows 4-5   OPEN cross-aisle, cols 1-21, no solid stamps at all.
//   rows 6-7   the working middle: two transcription tables, the Navigation Table dais, and two
//              lanes north-south (cols 3-4 and the central opening at cols 9-12).
//   rows 8-9   OPEN south aisle, cols 1-21, no solid stamps at all.
//   rows 10-11 south wall. The foyer entrance at cols 11-12, benches and torches on its inner
//              course.
//
// Two full-width corridors joined by two lanes cannot produce a sealed pocket, which is the point:
// the property is a consequence of the shape rather than something to re-verify by eye each time.
// tests/unit/field-map-coordinates.test.js flood-fills the generated collision from the spawn and
// fails on any open cell it cannot reach.
//
// Everything that dresses the two corridors is `decor` or `base`, so the corridors read as furnished
// without narrowing: rugs lie flat where the player walks on them, stools sit against a table edge
// where they read as drawn up to it, greenery blocks only the bottom 0.6 of its base row and lifts
// the rest to the overlay layer so the player passes behind the foliage.
//
// ## Where `base` is and is not safe
//
// A `base` stamp blocks only `[baseRow + 0.4, baseRow + 1]`, which is what makes walk-behind work —
// and which also means it leaves the cells *above* it open. That is a feature in an open corridor
// (the player rounds a 1-tile planter without thinking about it) and a bug against a wall: a 1-tile
// `base` prop standing in a 2-tile nook seals that nook, because the only route into it is the strip
// the prop blocks. Both north-wall props hit exactly that case — the founding stela in the west
// corner and the tall planter in the east — so both are `solid` here. Nothing is lost: the cell they
// would have let the player stand in is a dead end against the wall, so there was never a walk-behind
// to see. The south-aisle planters stay `base`, because the aisle runs past both sides of them.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/institute-hall.palette.js";
import { MapBuilder } from "./lib/map-builder.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/institute-hall.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/institute-hall.blocks.js");

const WIDTH = 23;
const HEIGHT = 12;

// The wall bands. North and south are two rows so a door leaf (2 tiles tall) sits inside the wall
// rather than hanging into the room; east and west are one column, which is all a wall seen
// edge-on needs.
const WALL_NORTH = 2; // rows 0-1
const WALL_SOUTH = 2; // rows 10-11
const INTERIOR = { col1: 1, col2: WIDTH - 2, row1: WALL_NORTH, row2: HEIGHT - WALL_SOUTH - 1 };
// The doorways, both centred on the same two columns so the hall has one straight spine: in from
// the onboarding hallway at the south, out to the Archive Room at the north.
const DOOR_COLS = [11, 12];

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) =>
  row < WALL_NORTH || row >= HEIGHT - WALL_SOUTH || col === 0 || col === WIDTH - 1;

// Three floor zones, so the room reads as having places in it rather than as one grey box: the
// Preservation Case alcove in sandstone at the west end, plank flooring under the Navigation Table
// dais and down the central spine, grey flagstone through the reading hall between them.
const inAlcove = (col, row) => col <= 5 && row <= 5;
const inDais = (col, row) => col >= 16 && row >= 5;
const inSpine = (col, row) => col >= DOOR_COLS[0] && col <= DOOR_COLS[1] && row >= WALL_NORTH;

// --- ground -------------------------------------------------------------------------------------
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    let block = T.floorStone;
    if (isWall(col, row)) {
      // Masonry frames the two doorways; panelling everywhere else. The A4 corner/edge blob set is
      // untouched — a full-bleed material paves any wall run correctly without it.
      block =
        col >= DOOR_COLS[0] &&
        col <= DOOR_COLS[1] &&
        (row < WALL_NORTH || row >= HEIGHT - WALL_SOUTH)
          ? T.wallStone
          : T.wallPanel;
    } else if (inAlcove(col, row)) {
      block = T.floorSandstone;
    } else if (inDais(col, row) || inSpine(col, row)) {
      block = T.floorWood;
    }
    map.groundBlock(col, row, block);
  }
}

// The walls carry no art of their own on the structures layer, so their collision has to be
// declared. Each rect stops flush with the painted band: the player's foot box runs from 0.06 above
// their anchor to 0.44 below it, so stopping at the wall face reads as standing against the wall
// rather than a tile short of it.
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: HEIGHT - WALL_SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// --- doorways -----------------------------------------------------------------------------------
// Both doors are stamped `decor`: they sit inside a wall band whose rect already blocks them, and a
// second overlapping rect would only make the generated collision module harder to read.
for (const col of DOOR_COLS) {
  // Entrance from the onboarding hallway, in the south wall, on the spine.
  map.stamp(col, HEIGHT - WALL_SOUTH, T.door, "decor", "foyer entrance");
  // Archive Room, in the north wall. HUB_TARGETS.archiveDoor stands at (11.5,1.9), immediately in
  // front of these leaves; the masonry reveal painted above marks the opening in the panelling.
  map.stamp(col, 0, T.door, "decor", "archive room door");
}

// --- rows 2-3: record storage, wall to wall ------------------------------------------------------
// Every unit here is 2x2 and sits entirely inside the band, so the cross-aisle below stays clear.
// Two shelf fronts are alternated along the run so a long wall of shelving doesn't read as one tile
// repeated.
//
// The stela is anchored a row up into the wall so its carved head reads as mounted against the
// panelling; `solid` for the reason given in the header — a `base` stela seals the two cells behind
// it into a pocket, and those cells are a dead end nobody would walk into anyway.
map.stamp(1, 1, T.foundingStela, "solid", "founding stela");
// HUB_TARGETS.trophy sits at (4.0,4.0), on the plinth's south face, and opens the badge case. The
// rug below it is decor, so the approach is a normal walk onto it.
map.stamp(3, 2, T.preservationPlinth, "solid", "preservation case plinth");
map.stamp(5, 2, T.cabinetC, "solid", "alcove record cabinet");
map.stamp(7, 2, T.recordShelf, "solid", "record shelf");
map.stamp(9, 2, T.recordShelfAlt, "solid", "record shelf");
// cols 11-12: the Archive Room approach, left clear. A runner is laid up to the door so the gap in
// the stacks reads as a route rather than as floor nobody furnished.
map.stamp(DOOR_COLS[0], 2, T.rugBlue, "decor", "archive door runner");
map.stamp(13, 2, T.pigeonholeUpper, "solid", "pigeonhole rack");
map.stamp(15, 2, T.pigeonholeLower, "solid", "pigeonhole rack");
map.stamp(17, 2, T.sampleShelfA, "solid", "preserved sample shelf");
map.stamp(19, 2, T.cabinetD, "solid", "record cabinet");
map.stamp(21, 2, T.plantTall, "solid", "hall greenery");

// --- rows 4-5: the open cross-aisle -------------------------------------------------------------
// No solid stamps in this band, by design. Only a rug in front of the Preservation Case, and the
// stools drawn up to the north side of the two transcription tables below.
map.stamp(3, 4, T.rugRed, "decor", "preservation case rug");

// --- rows 6-7: the working middle ---------------------------------------------------------------
// Two lanes north-south: cols 3-4 at the west end, and the central opening at cols 9-12 in front of
// the foyer entrance where the Director greets the player. Two tiles is the narrowest lane in the
// room, against a 0.56-wide foot box.
map.stamp(1, 6, T.roundTable, "solid", "west reading nook");
map.stamp(5, 6, T.intakeTable, "solid", "west transcription table");
map.stamp(13, 6, T.readingTable, "solid", "east transcription table");
// HUB_TARGETS.table sits at (18.5,8.0), on the Navigation Table's south face, and opens the
// Navigation Table screen. targetReach() gives that one a wider 1.65 radius, and the whole south
// aisle below is clear, so the approach is a straight walk east from the foyer.
map.stamp(17, 6, T.navigationTable, "solid", "navigation table");
// The brass compass, repacked to 1x1, standing on the table's far edge. `overlayStamp` rather than
// `stamp`: structures holds one tile per cell, so stamping the compass here would replace the
// table's own top tile and show floor around it. The player can never stand on a solid object's
// footprint, so nothing is hidden by drawing above them at this cell.
map.overlayStamp(18, 6, T.compassSmall, "brass compass");
map.stamp(20, 6, T.chestB, "solid", "sealed record chest");

// Stools, all `decor`. Each one is in the row directly above or below one of the two long tables'
// footprints, so it reads as drawn up to that table. The retired layout had one standing by itself
// mid-floor with nothing to sit at, which is the stool circled in the playtest screenshot; a stool is
// only furniture if there is a table in front of it.
for (const [col, row] of [
  [5, 5],
  [7, 5],
  [14, 5],
  [16, 5],
  [6, 8],
  [8, 8],
  [14, 8],
  [16, 8],
]) {
  map.stamp(col, row, (col + row) % 2 === 0 ? T.stool : T.stoolAlt, "decor", "reading stool");
}

// --- rows 8-9: the open south aisle -------------------------------------------------------------
// No solid stamps in this band either. The foyer runner and the two corner planters dress it.
map.stamp(DOOR_COLS[0], 8, T.rugGreen, "decor", "foyer runner rug");
map.stamp(1, 8, T.plantPotted, "base", "foyer greenery");
map.stamp(21, 8, T.plantPotted, "base", "dais greenery");

// --- wall dressing -------------------------------------------------------------------------------
// All `decor`, and all inside a wall band whose rect already blocks — which is what lets the south
// aisle stay open while still reading as a furnished hall. Storage, seating and torches line the
// wall's inner course, so the player walks *past* them rather than through them; the same pieces
// standing out on the floor would be things the player walks through, which is the specific defect
// the retired free-standing bench and floor stool had.
const SOUTH = HEIGHT - WALL_SOUTH;
map.stamp(1, SOUTH, T.cabinetA, "decor", "south wall record cabinet");
map.stamp(4, SOUTH, T.chestA, "decor", "sealed record chest");
map.stamp(6, SOUTH, T.lowBench, "decor", "foyer bench");
map.stamp(14, SOUTH, T.lowBench, "decor", "foyer bench");
map.stamp(17, SOUTH, T.cabinetB, "decor", "south wall record cabinet");
map.stamp(20, SOUTH, T.sampleShelfC, "decor", "preserved sample shelf");
for (const col of [3, 8, 15, 20])
  map.stamp(col, WALL_NORTH - 1, T.wallTorch, "decor", "wall torch");
for (const col of [3, 9, 13, 19]) map.stamp(col, SOUTH, T.wallTorch, "decor", "wall torch");
map.stamp(9, 0, T.bannerGold, "decor", "institute pennant");
map.stamp(14, 0, T.bannerNavy, "decor", "institute pennant");
map.stamp(5, 0, T.bannerNavy, "decor", "institute pennant");
map.stamp(18, 0, T.bannerGold, "decor", "institute pennant");
map.stamp(WIDTH - 1, 4, T.wallSconce, "decor", "wall sconce");
map.stamp(0, 6, T.wallSconce, "decor", "wall sconce");

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("INSTITUTE_HALL_BLOCKS", "scripts/generate-institute-hall-tmj.js")
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects, interior ${JSON.stringify(INTERIOR)}`);
