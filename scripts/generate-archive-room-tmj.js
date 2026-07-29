// Generates apps/web/src/content/maps/archive-room.tmj for the Institute Archive Room,
// composited from the "Medieval Tavern" tileset — the same 48px/16-column/no-margin grid
// family already proven by scripts/generate-caribbean-tmj.js and the live Riverbend map
// (Medieval Fishing Village/Medieval Fantasy Town/farm), confirmed by direct pixel
// inspection (see docs/decision-log/0030-archive-room-tiled-interior.md). "Modern Interiors"
// (the other unused pack) was evaluated and rejected: its sheets are hand-packed with no
// uniform tile grid, and its blue-plastic/office-monitor furniture would clash with the
// project's gold/bronze/parchment visual language (see CLAUDE.md's visual design section).
// Run with: node scripts/generate-archive-room-tmj.js
//
// Which tile is floor or shelving is NOT decided here — it comes from
// apps/web/src/content/tilesets/maps/archive-room.palette.js. This script owns layout only.
import { writeFileSync } from "node:fs";

import palette from "../apps/web/src/content/tilesets/maps/archive-room.palette.js";
import { resolvePalette } from "./lib/palette-gids.js";

const WIDTH = 10;
const HEIGHT = 8;
const TILE = 48;

// firstgid assignment, sheet geometry and the tilesets[] array are all derived from the
// palette's sheet order by resolvePalette() — see scripts/lib/palette-gids.js.
const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;

const STONE_FLOOR = T.stoneFloor.map(gid); // slight variety
const WOOD_FLOOR = T.woodFloor.map(gid);

// Ground layer: stone floor everywhere, with a wood-floor "reading nook" patch under the
// table (cols 0-5, rows 4-7) for visual zoning — the same low-key variety approach
// generate-caribbean-tmj.js uses for its interior-land grass, deterministic (no randomness,
// reproducible), not a real terrain mask (this is an interior room, not outdoor land).
function groundTileAt(col, row) {
  const inNook = col <= 5 && row >= 4;
  const variants = inNook ? WOOD_FLOOR : STONE_FLOOR;
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

// Archive record shelf (bottle/jar shelf, 2x2) — the Terminal's "shelving," left half.
const RECORD_SHELF = gidRect(T.recordShelf, 2, 2);
// Diamond wine rack (2x2) — reads as an "archive record rack," right half.
const RECORD_RACK = gidRect(T.recordRack, 2, 2);
// Long reading table (4 wide x 2 tall, plain dark wood, no tavern mugs).
const READING_TABLE = gidRect(T.readingTable, 2, 4);
const WALL_TORCH = gid(T.wallTorch);
const STOOL = gid(T.stool);

// Anchors below are each stamp's top-left cell; the shelf+rack pair sits directly behind
// the Archive Terminal interaction point (ARCHIVE_ROOM_TARGETS.terminal, x5.0/y3.7 in
// apps/web/src/main.js), and ARCHIVE_ROOM_BLOCK_RECTS was re-measured to match these
// placements (see main.js) rather than the other way around.
stamp(3, 1, RECORD_SHELF); // x3.0-5.0, y1.0-3.0
stamp(5, 1, RECORD_RACK); // x5.0-7.0, y1.0-3.0
stamp(1, 5, READING_TABLE); // x1.0-5.0, y5.0-7.0
stamp(6, 5, [[STOOL]]); // small stool beside the reading table
stamp(0, 0, [[WALL_TORCH]]); // corner ambiance
stamp(9, 0, [[WALL_TORCH]]);

// --- emit Tiled JSON, matching the existing Caribbean/Riverbend .tmj shape/conventions ---
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
