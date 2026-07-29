// Generates apps/web/src/content/maps/archive-room.tmj for the Institute Archive Room,
// composited from the "Medieval Tavern" tileset — the same 48px/16-column/no-margin grid
// family already proven by the field maps, confirmed by direct pixel inspection (see
// docs/decision-log/0030-archive-room-tiled-interior.md). "Modern Interiors" (the other unused
// pack) was evaluated and rejected: its sheets are hand-packed with no uniform tile grid, and
// its blue-plastic/office-monitor furniture would clash with the project's gold/bronze/parchment
// visual language (see CLAUDE.md's visual design section).
//
// The room is 20x12 (was 10x8). At the old size it stretched to fill its viewport, so the art
// rendered at roughly 1.7x with no camera; at 20x12 with the hub camera it draws 1:1 and reads
// as a hall rather than a closet.
//
// Run with: node scripts/generate-archive-room-tmj.js apps/web/src/content/maps/archive-room.tmj
//
// Which tile is floor or shelving is NOT decided here — it comes from
// apps/web/src/content/tilesets/maps/archive-room.palette.js. This script owns layout only.
import { writeFileSync } from "node:fs";

import palette from "../apps/web/src/content/tilesets/maps/archive-room.palette.js";
import { resolvePalette } from "./lib/palette-gids.js";

const WIDTH = 20;
const HEIGHT = 12;
const TILE = 48;

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;

const STONE_FLOOR = T.stoneFloor.map(gid); // slight variety
const WOOD_FLOOR = T.woodFloor.map(gid);

// Ground layer: grey flagstone through the main hall, warmer sandstone through the east alcove
// (cols 13-19) for visual zoning. Deterministic, not random, so the map is reproducible.
function groundTileAt(col, row) {
  const inAlcove = col >= 13;
  const variants = inAlcove ? WOOD_FLOOR : STONE_FLOOR;
  return variants[(col * 3 + row * 5) % variants.length];
}

const groundData = [];
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    groundData.push(groundTileAt(col, row));
  }
}

// --- structures layer: multi-cell object stamps ---
const structuresData = new Array(WIDTH * HEIGHT).fill(0);
function stamp(anchorCol, anchorRow, block) {
  block.forEach((rowGids, r) => {
    rowGids.forEach((tileGid, c) => {
      if (!tileGid) return;
      const col = anchorCol + c;
      const row = anchorRow + r;
      if (col < 0 || col >= WIDTH || row < 0 || row >= HEIGHT) return;
      structuresData[row * WIDTH + col] = tileGid;
    });
  });
}

// Wall runs of shelving. The cabinet fronts are cycled so a long run doesn't read as one tile
// repeated, and gaps are left at the entrance (north, cols 8-11) and the exit (south, cols 8-13).
const CABINETS = [T.cabinetA, T.cabinetB, T.cabinetC, T.cabinetD];
const CHESTS = [T.chestA, T.chestB];
function shelfRun(cols, row, set) {
  cols.forEach((col, index) => stamp(col, row, gidRect(set[index % set.length], 2, 2)));
}
shelfRun([0, 2, 4, 6], 0, CABINETS); //  north wall, west of the entrance
shelfRun([12, 14, 16, 18], 0, CABINETS); //  north wall, east of the entrance
shelfRun([0, 2, 4, 6], 10, CHESTS); //  south wall, west of the exit
shelfRun([14, 16, 18], 10, CHESTS); //  south wall, east of the exit

// Institute banners over the entrance.
stamp(9, 0, gidRect(T.bannerPair, 2, 2));

// Full-height record storage lining the alcove's east wall.
stamp(16, 3, gidRect(T.recordShelf, 4, 2)); //  (16.0,5.0-18.0,7.0)
stamp(18, 3, gidRect(T.recordRack, 4, 2)); //  (18.0,5.0-20.0,7.0)
stamp(16, 7, gidRect(T.recordCanisters, 4, 2)); //  (16.0,9.0-18.0,11.0)

// The reading hall: a long table with stools drawn up to it.
stamp(4, 5, gidRect(T.readingTable, 2, 4)); //  (4.1,5.1-7.9,6.9)
const STOOL = gid(T.stool);
for (const [col, row] of [
  [3, 5],
  [3, 6],
  [8, 5],
  [8, 6],
  [4, 4],
  [6, 4],
  [5, 7],
  [7, 7],
]) {
  stamp(col, row, [[STOOL]]);
}

// Hearth on the west wall, and the alcove's study furniture.
stamp(0, 4, gidRect(T.fireplace, 2, 2)); //  (0.0,4.6-2.0,6.0)
stamp(13, 7, gidRect(T.writingDesk, 2, 2)); //  (13.0,7.6-15.0,9.0)
stamp(13, 3, gidRect(T.roundTable, 2, 2)); //  (13.0,3.6-15.0,5.0)
stamp(13, 5, gidRect(T.rugRed, 1, 2));
stamp(9, 8, gidRect(T.rugGreen, 1, 2));

// Greenery and wall torches. The torches sit on row 2, immediately below the north shelving, so
// they read as wall-mounted rather than free-standing on the floor.
stamp(11, 3, gidRect(T.plantA, 2, 2));
stamp(11, 8, gidRect(T.plantB, 2, 2));
const WALL_TORCH = gid(T.wallTorch);
for (const col of [2, 8, 15, 19]) stamp(col, 2, [[WALL_TORCH]]);

// --- emit Tiled JSON, matching the existing field maps' shape/conventions ---
const tmj = {
  compressionlevel: -1,
  height: HEIGHT,
  infinite: false,
  layers: [
    {
      data: groundData,
      height: HEIGHT,
      id: 1,
      name: "ground",
      opacity: 1,
      type: "tilelayer",
      visible: true,
      width: WIDTH,
      x: 0,
      y: 0,
    },
    {
      data: structuresData,
      height: HEIGHT,
      id: 2,
      locked: true,
      name: "structures",
      opacity: 1,
      type: "tilelayer",
      visible: true,
      width: WIDTH,
      x: 0,
      y: 0,
    },
  ],
  nextlayerid: 3,
  nextobjectid: 1,
  orientation: "orthogonal",
  renderorder: "right-down",
  tiledversion: "1.12.2",
  tileheight: TILE,
  tilesets,
  tilewidth: TILE,
  type: "map",
  version: "1.10",
  width: WIDTH,
};

const outPath = process.argv[2];
writeFileSync(outPath, JSON.stringify(tmj));
console.log("wrote", outPath);
