// Generates apps/web/src/content/maps/hallway.tmj for the Institute onboarding hallway —
// the scripted corridor the Director walks the newly-created Chronicler down before the Main
// Hall. Composited from the same "Medieval Tavern" tileset as the Institute Archive Room
// (scripts/generate-archive-room-tmj.js, docs/decision-log/0030-archive-room-tiled-interior.md)
// for visual continuity between the two Institute interiors — same 48px/16-column/no-margin
// tile family, same firstgid layout, only the grid dimensions and layout differ.
// Run with: node scripts/generate-hallway-tmj.js apps/web/src/content/maps/hallway.tmj
//
// Tile identity comes from apps/web/src/content/tilesets/maps/hallway.palette.js, which
// deliberately declares the same three sheets in the same order as archive-room.palette.js.
import { writeFileSync } from "node:fs";

import palette from "../apps/web/src/content/tilesets/maps/hallway.palette.js";
import { resolvePalette } from "./lib/palette-gids.js";

const WIDTH = 6;
const HEIGHT = 10;
const TILE = 48;

// firstgid assignment, sheet geometry and the tilesets[] array are all derived from the
// palette's sheet order by resolvePalette() — see scripts/lib/palette-gids.js.
const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;

// Same floor tiles as the Archive Room — both palettes point at the canonical entries.
const STONE_FLOOR = T.stoneFloor.map(gid);

// Ground layer: stone floor the full length of the corridor, deterministic low-key variety
// (same formula as the Archive Room generator) rather than a real terrain mask.
function groundTileAt(col, row) {
  return STONE_FLOOR[(col * 3 + row * 5) % STONE_FLOOR.length];
}
const groundData = [];
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    groundData.push(groundTileAt(col, row));
  }
}

// --- structures layer: shelving/rack/torch accents lining both long edges ---
// No wall tiles here: "walls" are still the .hallway-viewport CSS vignette frame. These accents read
// as archive record storage lining the corridor, tying it visually to the Archive Room beyond it.
//
// This used to be justified by the claim that Medieval Tavern's wall sheets are "an RPG-Maker-style
// autotile blob layout tiled-map-loader.js can't parse." That claim is wrong and Phase 54 disproved
// it: institute-hall.tmj draws real walls from Auto-tile-A4-walls-2. The loader parses the sheet
// fine; what it cannot do is *choose* a blob cell, and restricting a palette to the sheet's flat
// full-bleed surface rows sidesteps that entirely. Adding walls here is now a small, unblocked
// change — it just hasn't been done, because this corridor is a two-second scripted cutscene.
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

const RECORD_SHELF_LEFT = gidRect(T.recordShelfLeft, 2, 1);
const RECORD_RACK_RIGHT = gidRect(T.recordRackRight, 2, 1);
const WALL_TORCH = gid(T.wallTorch);

// Both edges are lined the whole length of the corridor rather than carrying two accents each.
// The cabinet fronts are cycled and the two sides are offset from one another so the walls don't
// read as a mirrored repeat, matching how the Archive Room's wall runs are laid.
const CABINETS = [T.cabinetA, T.cabinetB, T.cabinetC, T.cabinetD];
[0, 2, 4, 6, 8].forEach((row, index) => {
  stamp(0, row, gidRect(CABINETS[index % CABINETS.length], 2, 1));
});
[1, 3, 5, 7, 9].forEach((row, index) => {
  stamp(5, row, gidRect(CABINETS[(index + 2) % CABINETS.length], 2, 1));
});

// Record shelving and racks break up the cabinet runs at eye-catching points down the walk.
stamp(0, 4, RECORD_SHELF_LEFT);
stamp(5, 5, RECORD_RACK_RIGHT);

// Institute banners flank the door the player walks toward, and a torch pair lights it.
stamp(1, 0, gidRect(T.bannerPair, 2, 2));
stamp(0, 0, [[WALL_TORCH]]);
stamp(5, 0, [[WALL_TORCH]]);

// --- emit Tiled JSON, matching the existing Archive Room/Caribbean/Riverbend .tmj shape ---
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
