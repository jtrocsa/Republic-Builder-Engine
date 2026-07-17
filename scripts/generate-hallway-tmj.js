// Generates apps/web/src/content/maps/hallway.tmj for the Institute onboarding hallway —
// the scripted corridor the Director walks the newly-created Chronicler down before the Main
// Hall. Composited from the same "Medieval Tavern" tileset as the Institute Archive Room
// (scripts/generate-archive-room-tmj.js, docs/decision-log/0030-archive-room-tiled-interior.md)
// for visual continuity between the two Institute interiors — same 48px/16-column/no-margin
// tile family, same firstgid layout, only the grid dimensions and layout differ.
// Run with: node scripts/generate-hallway-tmj.js apps/web/src/content/maps/hallway.tmj
import { writeFileSync } from "node:fs";

const WIDTH = 6;
const HEIGHT = 10;
const TILE = 48;

// tile-B-01.png: firstgid 1   (tables/benches/chairs)
// tile-B-03.png: firstgid 257 (shelving/racks/lighting/decor)
// tile-B-05.png: firstgid 513 (floor tiles/crates/barrels/stools)
const B01 = 1;
const B03 = 257;
const B05 = 513;
const gidB03 = (row, col) => B03 + row * 16 + col;
const gidB05 = (row, col) => B05 + row * 16 + col;

// Same STONE_FLOOR gids as generate-archive-room-tmj.js, confirmed by the same labeled-overlay
// inspection method (see docs/decision-log/0030-archive-room-tiled-interior.md).
const STONE_FLOOR = [gidB05(13, 0), gidB05(13, 1), gidB05(14, 2), gidB05(15, 4)];

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
// No fabricated wall tiles — Medieval Tavern's wall sheets are an RPG-Maker-style autotile blob
// layout tiled-map-loader.js can't parse (see decision-log 0030); "walls" are still the existing
// .hallway-viewport CSS vignette frame, not tile art. These accents read as archive record
// storage lining the corridor, tying it visually to the Archive Room beyond it.
const structuresData = new Array(WIDTH * HEIGHT).fill(0);
function stamp(anchorCol, anchorRow, block) {
  block.forEach((rowGids, r) => {
    rowGids.forEach((gid, c) => {
      if (!gid) return;
      const col = anchorCol + c;
      const row = anchorRow + r;
      if (col < 0 || col >= WIDTH || row < 0 || row >= HEIGHT) return;
      structuresData[row * WIDTH + col] = gid;
    });
  });
}

const RECORD_SHELF_LEFT = [
  [gidB03(2, 8)],
  [gidB03(3, 8)],
];
const RECORD_RACK_RIGHT = [
  [gidB03(2, 10)],
  [gidB03(3, 10)],
];
const WALL_TORCH = gidB03(1, 9);

// Left edge: shelving at two points down the corridor. Right edge: wine-rack-style record racks,
// offset a few rows so the two edges don't read as a mirrored repeat. A torch pair near the door
// end (row 0) lights the corridor's far end, matching the Archive Room's corner torches.
stamp(0, 1, RECORD_SHELF_LEFT);
stamp(0, 6, RECORD_SHELF_LEFT);
stamp(5, 3, RECORD_RACK_RIGHT);
stamp(5, 7, RECORD_RACK_RIGHT);
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
  tilesets: [
    {
      columns: 16,
      firstgid: B01,
      image: "../../assets/tilesets/Medieval Tavern/tile-B-01.png",
      imageheight: 768,
      imagewidth: 768,
      margin: 0,
      name: "medieval-tavern-b01",
      spacing: 0,
      tilecount: 256,
      tileheight: TILE,
      tilewidth: TILE,
    },
    {
      columns: 16,
      firstgid: B03,
      image: "../../assets/tilesets/Medieval Tavern/tile-B-03.png",
      imageheight: 768,
      imagewidth: 768,
      margin: 0,
      name: "medieval-tavern-b03",
      spacing: 0,
      tilecount: 256,
      tileheight: TILE,
      tilewidth: TILE,
    },
    {
      columns: 16,
      firstgid: B05,
      image: "../../assets/tilesets/Medieval Tavern/tile-B-05.png",
      imageheight: 768,
      imagewidth: 768,
      margin: 0,
      name: "medieval-tavern-b05",
      spacing: 0,
      tilecount: 256,
      tileheight: TILE,
      tilewidth: TILE,
    },
  ],
  tilewidth: TILE,
  type: "map",
  version: "1.10",
  width: WIDTH,
};

const outPath = process.argv[2];
writeFileSync(outPath, JSON.stringify(tmj));
console.log("wrote", outPath);
