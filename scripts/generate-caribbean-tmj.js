// Generates apps/web/src/content/maps/caribbean-field.tmj from the Island survival
// tileset, using the exact same ellipse-union land mask as main.js's isCaribbeanLand()
// so the tile art's coastline and the game's walkable-land boundary can never drift
// out of sync. Run with: node generate-caribbean-tmj.mjs
import { writeFileSync } from "node:fs";

const WIDTH = 40;
const HEIGHT = 24;
const TILE = 48;

// --- must stay byte-identical in spirit to apps/web/src/main.js's ellipse()/isCaribbeanLand() ---
function ellipse(x, y, cx, cy, rx, ry) {
  return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}
function isCaribbeanLand(x, y, pad = 0) {
  const mainBeach = ellipse(x, y, 20, 12.5, 17.5 + pad, 9.4 + pad);
  const westCove = ellipse(x, y, 8.2, 12.8, 6.2 + pad, 5.9 + pad);
  const eastPoint = ellipse(x, y, 31.7, 13.1, 7.4 + pad, 6.8 + pad);
  const northVillage = ellipse(x, y, 23.2, 8.6, 7.1 + pad, 5.8 + pad);
  return mainBeach || westCove || eastPoint || northVillage;
}

// --- tileset helpers ---
// tile-B-01.png: firstgid 1, 16 cols, 48px tiles (terrain + small props)
// tile-B-02.png: firstgid 257, 16 cols, 48px tiles (bohio huts + structures)
const B01 = 1;
const B02 = 257;
const gidB01 = (row, col) => B01 + row * 16 + col;
const gidB02 = (row, col) => B02 + row * 16 + col;

// Confirmed by direct grid-labeled inspection of the sheets (see /tmp/sheetB01-*.png,
// /tmp/sheetB02-*.png generated during authoring) — row,col are 0-indexed within each
// 16x16 sheet.
const SAND = gidB01(0, 0); // plain wavy sand, safe uniform texture
const GRASS_A = gidB01(8, 0); // plain grass
const GRASS_B = gidB01(9, 0); // grass variant, for light texture variety
const WATER_SHALLOW = gidB01(4, 0); // turquoise shallow water
const WATER_DEEP = gidB01(4, 6); // dark navy deep water
const PATH_LEFT = gidB01(9, 4); // dirt path, left half (grass border on the left)
const PATH_RIGHT = gidB01(9, 5); // dirt path, right half (grass border on the right)

// Enrichment pass (docs/architecture/art-and-map-style-guide.md, Caribbean row) — opaque
// full-bleed terrain variants only (confirmed via a grid-labeled crop of tile-B-01.png,
// same technique as the original authoring pass), never the rows 12-15 transparent-bg prop
// icons, which are structures-layer stamps that need their own FIELD_BLOCKS collision rect
// and are out of scope for a ground-only enrichment pass.
const GRASS_TUFT = gidB01(11, 2); // wispy tall-grass texture, reads like a Pokémon grass patch
const SAND_DRIFTWOOD = gidB01(0, 6); // driftwood log embedded in the sand texture
const SAND_SHELLS = gidB01(0, 8); // scattered shells embedded in the sand texture
const CORAL_PATCH = gidB01(4, 8); // full-bleed underwater coral cluster, for open water only

// Ground layer: concentric rings computed straight from the same land mask the game
// uses for collision, padded in/out by 1.2 grid units so the ring width reads clearly
// at 48px tiles without needing directional/rotated edge tiles.
function groundTileAt(col, row) {
  const cx = col + 0.5;
  const cy = row + 0.5;
  if (isCaribbeanLand(cx, cy, -1.2)) {
    // interior land — light deterministic variation, no randomness (reproducible)
    if ((col * 7 + row * 3) % 11 === 0) return GRASS_TUFT; // sparse tall-grass accent
    return (col + row) % 5 === 0 ? GRASS_B : GRASS_A;
  }
  if (isCaribbeanLand(cx, cy, 0)) {
    // coastal ring — mostly plain sand, sparse driftwood/shell debris for texture
    if ((col * 5 + row * 2) % 13 === 0) return SAND_DRIFTWOOD;
    if ((col * 3 + row * 7) % 17 === 0) return SAND_SHELLS;
    return SAND;
  }
  if (isCaribbeanLand(cx, cy, 1.2)) return WATER_SHALLOW; // just offshore
  return WATER_DEEP; // open water
}

const groundData = [];
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    groundData.push(groundTileAt(col, row));
  }
}

// One fixed coral-patch accent, placed at the first solidly-open-water cell found (padding
// 3 grid units beyond the land mask, i.e. nowhere near the shore/path/prop cluster) rather
// than a hand-picked coordinate, so it stays correct even if the land mask ellipses change.
outer: for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    const cx = col + 0.5;
    const cy = row + 0.5;
    if (!isCaribbeanLand(cx, cy, 3)) {
      groundData[row * WIDTH + col] = CORAL_PATCH;
      break outer;
    }
  }
}

// Village path: a 2-wide vertical dirt strip from the garden's south edge down through
// the bohío cluster, cols 23-24. Laid on the ground layer; hut/prop stamps in the
// structures layer draw on top of it wherever they overlap, which is what makes it read
// as "the path leads to the huts" rather than needing to dodge their footprints.
for (let row = 8; row <= 16; row += 1) {
  const idx = row * WIDTH + 23;
  groundData[idx] = PATH_LEFT;
  groundData[idx + 1] = PATH_RIGHT;
}

// --- structures layer: multi-cell object stamps ---
const structuresData = new Array(WIDTH * HEIGHT).fill(0);
function stamp(anchorCol, anchorRow, block) {
  // block: 2D array of gids (row-major), 0 = leave existing cell alone
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

// Bohío huts (tile-B-02), each a 2x2 stamp: roof row on top, walled base below.
const HUT_OPEN_DOOR = [
  [gidB02(0, 0), gidB02(0, 1)],
  [gidB02(1, 0), gidB02(1, 1)],
];
const HUT_CLOSED_DOOR_ROUND = [
  [gidB02(2, 12), gidB02(2, 13)],
  [gidB02(3, 12), gidB02(3, 13)],
];
const HUT_CLOSED_DOOR_SQUARE = [
  [gidB02(0, 2), gidB02(0, 3)],
  [gidB02(1, 2), gidB02(1, 3)],
];

// Anchors below are each stamp's top-left cell, chosen to center the stamp inside the
// matching FIELD_BLOCKS rectangle in apps/web/src/main.js (kept in sync manually — see
// docs/decision-log/0029-caribbean-tiled-rebuild.md).
stamp(23, 8, HUT_OPEN_DOOR); // bohio one   (FIELD_BLOCKS 22.6,8.0-26.3,10.8)
stamp(27, 9, HUT_CLOSED_DOOR_ROUND); // bohio two   (26.5,8.7-30.3,11.4)
stamp(25, 11, HUT_CLOSED_DOOR_SQUARE); // bohio three (24.1,11.3-27.9,14.2)

// Single-cell props (tile-B-01).
const CAMPFIRE = gidB01(13, 12);
const CANOE = gidB01(13, 13);
const CRATE_A = gidB01(15, 13);
const CRATE_B = gidB01(15, 14);
const TENT = gidB01(14, 11);

stamp(29, 13, [[CANOE]]); // canoe        (28.6,13.1-32.2,14.2)
stamp(31, 14, [[CAMPFIRE]]); // campfire     (31.2,14.4-32.8,15.8)
stamp(33, 15, [[CRATE_A, CRATE_B]]); // crate stack  (33.1,15.0-35.4,16.7)
stamp(32, 17, [[TENT]]); // Spanish tent (31.6,16.5-35.4,19.2)

// Palms: 1-wide x 2-tall crown-then-trunk stamps, several variants for visual variety.
const PALM_A = [[gidB01(12, 0)], [gidB01(13, 0)]];
const PALM_B = [[gidB01(12, 1)], [gidB01(13, 1)]];
const PALM_C = [[gidB01(14, 0)], [gidB01(15, 0)]];

stamp(13, 17, PALM_A); // southwest palm (12.7,16.4-15.4,20.3)
stamp(13, 7, PALM_B); // north palm     (13.2,6.5-15.3,9.9)
stamp(15, 7, PALM_C); // inland palm    (15.1,7.1-17.5,10.4)
stamp(34, 11, PALM_A); // east palm      (34.0,10.8-36.0,14.5)

// --- emit Tiled JSON, matching the existing prototype's shape/conventions ---
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
      image: "../../assets/tilesets/Island survival/tile-B-01.png",
      imageheight: 768,
      imagewidth: 768,
      margin: 0,
      name: "island-survival-b01",
      spacing: 0,
      tilecount: 256,
      tileheight: TILE,
      tilewidth: TILE,
    },
    {
      columns: 16,
      firstgid: B02,
      image: "../../assets/tilesets/Island survival/tile-B-02.png",
      imageheight: 768,
      imagewidth: 768,
      margin: 0,
      name: "island-survival-b02",
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
