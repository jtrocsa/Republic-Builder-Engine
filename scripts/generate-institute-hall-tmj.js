// Generates apps/web/src/content/maps/institute-hall.tmj and its collision module for the
// Chronicle Institute's Main Hall — the present-day hub the player returns to between Chronotravel
// runs. See docs/decision-log/0037-institute-hall-tiled-rebuild.md.
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
// them in place. A stamp may be restyled but not moved without re-checking those six coordinates
// and the player spawn.
//
// Size is deliberate, not arbitrary. 23x12 at 48px is 1104x576, against a rendered
// `.institute-map` frame of roughly 970x596 at 1366x768.
//
// The **height** is the load-bearing half: 576 < 596, so updateHubCamera() never scrolls
// vertically, and the north wall band — which carries the Institute's pennants — is always fully
// in frame. A first pass at 23x14 (672px tall) scrolled 76px and sliced every banner in half at the
// top of the viewport, which is exactly the cut-off-art defect Phase 53 was about.
//
// Horizontal scroll is fine and wanted: 1104 > 970, so the hall reads as wider than the window and
// the camera follows the player east and west. The three targets the guided tour highlights
// (Preservation Case, Archive Room door, Navigation Table) are all inside the spawn view, which
// matters because the tour locks movement while pulsing them.
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
const WALL_SOUTH = 2; // rows 12-13
const INTERIOR = { col1: 1, col2: WIDTH - 2, row1: WALL_NORTH, row2: HEIGHT - WALL_SOUTH - 1 };

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

const isWall = (col, row) =>
  row < WALL_NORTH || row >= HEIGHT - WALL_SOUTH || col === 0 || col === WIDTH - 1;

// Three floor zones, so the room reads as having places in it rather than as one grey box: the
// Preservation Case alcove in sandstone at the west end, plank flooring under the Navigation Table
// dais and down the foyer runner, grey flagstone through the reading hall between them.
const inAlcove = (col, row) => col <= 6 && row <= 5;
const inDais = (col, row) => col >= 15 && row >= 4;
const inFoyerRunner = (col, row) => col >= 10 && col <= 13 && row >= 8;

// --- ground -------------------------------------------------------------------------------------
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    let block = T.floorStone;
    if (isWall(col, row)) {
      // Masonry frames the two doorways; panelling everywhere else. The A4 corner/edge blob set is
      // untouched — a full-bleed material paves any wall run correctly without it.
      block = row < WALL_NORTH && col >= 10 && col <= 13 ? T.wallStone : T.wallPanel;
    } else if (inAlcove(col, row)) {
      block = T.floorSandstone;
    } else if (inDais(col, row) || inFoyerRunner(col, row)) {
      block = T.floorWood;
    }
    map.groundBlock(col, row, block);
  }
}

// The walls carry no art of their own on the structures layer, so their collision has to be
// declared. Each rect stops a little inside the painted band: the player's foot box is 0.44 tall
// below its anchor, and stopping flush with the wall face reads as standing against the wall
// rather than a tile short of it.
map.block({ x1: 0, y1: 0, x2: WIDTH, y2: WALL_NORTH, kind: "north wall" });
map.block({ x1: 0, y1: HEIGHT - WALL_SOUTH, x2: WIDTH, y2: HEIGHT, kind: "south wall" });
map.block({ x1: 0, y1: 0, x2: 1, y2: HEIGHT, kind: "west wall" });
map.block({ x1: WIDTH - 1, y1: 0, x2: WIDTH, y2: HEIGHT, kind: "east wall" });

// --- doorways -----------------------------------------------------------------------------------
// Both doors are stamped `decor`: they sit inside a wall band whose rect already blocks them, and a
// second overlapping rect would only make the generated collision module harder to read.
// Entrance from the onboarding hallway, in the south wall, centred on the foyer runner.
map.stamp(11, HEIGHT - WALL_SOUTH, T.door, "decor", "foyer entrance");
map.stamp(12, HEIGHT - WALL_SOUTH, T.door, "decor", "foyer entrance");
// Archive Room, in the north wall. HUB_TARGETS.archiveDoor stands at (11.5,1.9), immediately in
// front of these leaves; the masonry reveal painted above marks the opening in the panelling.
map.stamp(11, 0, T.door, "decor", "archive room door");
map.stamp(12, 0, T.door, "decor", "archive room door");

// The room is laid out in four horizontal bands, which is what keeps it from being either a maze or
// an empty floor with the furniture pushed to the margins:
//
//   rows 2-3   record stacks along the north wall, with cols 11-13 left clear as the approach to
//              the Archive Room door — the tutorial tour points the player at that door before
//              they have learned to walk around furniture.
//   rows 4-5   an open cross-aisle, so the hall reads as walkable end to end.
//   rows 6-7   the working middle: two transcription tables west of centre, Navigation Table east.
//   rows 8-9   the south band, with cols 10-13 left clear as the foyer runner from the entrance.

// --- rows 2-5: north wall, record stacks and the Preservation Case alcove -------------------------
// HUB_TARGETS.trophy sits at (4.0,5.0), on the plinth's south face, and opens the badge case.
map.stamp(1, 2, T.foundingStela, "solid", "founding stela");
map.stamp(3, 3, T.preservationPlinth, "solid", "preservation case plinth");
map.stamp(3, 5, T.rugRed, "decor", "alcove rug");
map.stamp(5, 2, T.cabinetC, "solid", "alcove record cabinet");
map.stamp(5, 4, T.sampleShelfC, "solid", "preserved sample shelf");
// Each shelf unit is 2x2 and sits in row band 2-3, leaving rows 4-5 as an open cross-aisle. Two
// fronts are alternated along the run so a long wall of shelving doesn't read as one tile repeated.
map.stamp(7, 2, T.recordShelf, "solid", "record shelf");
map.stamp(9, 2, T.recordShelfAlt, "solid", "record shelf");
map.stamp(14, 2, T.pigeonholeUpper, "solid", "pigeonhole rack");
map.stamp(16, 2, T.pigeonholeLower, "solid", "pigeonhole rack");
map.stamp(19, 2, T.sampleShelfA, "solid", "preserved sample shelf");
// A runner laid up to the Archive Room door, so the gap in the stacks reads as a route rather than
// as a patch of floor nobody furnished.
map.stamp(11, 4, T.rugBlue, "decor", "archive door runner");
// `base` solidity: only the pot blocks, and the foliage above it lifts to the overlay layer, so the
// player walks behind the leaves rather than in front of them.
map.stamp(1, 4, T.plantTall, "base", "hall greenery");
map.stamp(13, 2, T.plantTall, "base", "hall greenery");

// --- rows 6-7: the working middle -----------------------------------------------------------------
// Two transcription tables with a one-tile lane between them at col 10. That lane is the only way
// north from the foyer, which is what makes the hall read as a room with a route through it rather
// than an open floor — and it is wide enough that the player never has to thread a gap narrower
// than their own foot box (0.56 tiles).
map.stamp(6, 6, T.readingTable, "solid", "reading table");
map.stamp(11, 6, T.readingTable, "solid", "reading table");
map.stamp(2, 6, T.roundTable, "solid", "west reading nook");
for (const [col, row] of [
  [6, 5],
  [8, 5],
  [11, 5],
  [13, 5],
  [7, 8],
  [9, 8],
  [13, 8],
  [4, 6],
  [4, 7],
]) {
  map.stamp(col, row, (col + row) % 2 === 0 ? T.stool : T.stoolAlt, "decor", "reading stool");
}
// HUB_TARGETS.table sits at (18.5,7.0), on the Navigation Table's south face, and opens the
// Navigation Table screen. The whole south side of the dais (rows 8-9) is left clear so that
// approach is a straight walk east from the foyer and then one step north — an earlier revision put
// the compass in that corridor and turned reaching the hub's most important object into a detour.
map.stamp(17, 5, T.navigationTable, "solid", "navigation table");
map.stamp(15, 4, T.brassCompass, "solid", "mariner's compass");
map.stamp(20, 6, T.sampleShelfB, "solid", "preserved sample shelf");

// --- rows 8-9: the south band, either side of the foyer runner ------------------------------------
map.stamp(1, 8, T.cabinetA, "solid", "west record cabinet");
map.stamp(3, 8, T.cabinetB, "solid", "west record cabinet");
map.stamp(5, 8, T.chestA, "solid", "sealed record chest");
map.stamp(7, 9, T.lowBench, "decor", "foyer bench");
map.stamp(11, 8, T.rugGreen, "decor", "foyer runner rug");
map.stamp(13, 9, T.lowBench, "decor", "foyer bench");
map.stamp(19, 8, T.chestB, "solid", "sealed record chest");
map.stamp(21, 8, T.plantPotted, "base", "dais greenery");

// --- wall dressing -------------------------------------------------------------------------------
// All `decor`, all inside a wall band whose rect already blocks: torches on each wall's inner
// course so they read as mounted rather than free-standing, pennants in the Institute's own gold
// and navy flanking both doorways.
for (const col of [3, 8, 15, 20])
  map.stamp(col, WALL_NORTH - 1, T.wallTorch, "decor", "wall torch");
for (const col of [5, 9, 14, 18]) {
  map.stamp(col, HEIGHT - WALL_SOUTH, T.wallTorch, "decor", "wall torch");
}
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
