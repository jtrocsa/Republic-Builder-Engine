// Generates apps/web/src/content/maps/sandy-island-demo.tmj — a small, hand-placed test
// scene (not a real game case) proving out the "Sandy Island" pack resized from a
// ChatGPT-generated sprite sheet (see scripts/resize-sandy-island-spritesheet.ps1).
// Unlike the production-case generators (e.g. generate-caribbean-tmj.js), this map's
// layout is just a handful of fixed rects/anchors — there's no FIELD_BLOCKS/land-mask to
// stay in sync with, since nothing in main.js reads this map.
//
// Run with: node scripts/generate-sandy-island-demo-tmj.js apps/web/src/content/maps/sandy-island-demo.tmj
import { writeFileSync } from "node:fs";

const WIDTH = 12;
const HEIGHT = 10;
const TILE = 48;

// Each "Sandy Island" asset is its own dedicated single-column tileset (same convention
// as Common Cause Philadelphia/liberty-pole.png) rather than one packed atlas — simplest
// to generate and to reason about for a 5-asset demo.
const SAND = 1; // sand.png, 48x48, 1 tile
const WATER = 2; // water.png, 48x48, 1 tile
const DIRT_PATH = 3; // dirt-path.png, 48x48, 1 tile
const PALM_TREE = 4; // palm-tree.png, 48x96, 2 tiles (firstgid=4 -> gids 4,5)
const FIRE = 6; // fire.png, 48x48, 1 tile

// --- ground layer: water border ring, sand island interior, a dirt path cut through it ---
const groundData = [];
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    const onBorder = row === 0 || row === HEIGHT - 1 || col === 0 || col === WIDTH - 1;
    const onPath = (row === 4 || row === 5) && col >= 1 && col <= 7;
    if (onBorder) groundData.push(WATER);
    else if (onPath) groundData.push(DIRT_PATH);
    else groundData.push(SAND);
  }
}

// --- structures layer: the palm tree and campfire objects ---
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

const PALM = [[PALM_TREE], [PALM_TREE + 1]]; // 1 col x 2 rows, crown then trunk
stamp(8, 2, PALM); // palm tree, north of the clearing
stamp(8, 6, [[FIRE]]); // campfire, south of the clearing

// --- emit Tiled JSON ---
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
      columns: 1,
      firstgid: SAND,
      image: "../../assets/tilesets/Sandy Island/sand.png",
      imageheight: 48,
      imagewidth: 48,
      margin: 0,
      name: "sandy-island-sand",
      spacing: 0,
      tilecount: 1,
      tileheight: TILE,
      tilewidth: TILE,
    },
    {
      columns: 1,
      firstgid: WATER,
      image: "../../assets/tilesets/Sandy Island/water.png",
      imageheight: 48,
      imagewidth: 48,
      margin: 0,
      name: "sandy-island-water",
      spacing: 0,
      tilecount: 1,
      tileheight: TILE,
      tilewidth: TILE,
    },
    {
      columns: 1,
      firstgid: DIRT_PATH,
      image: "../../assets/tilesets/Sandy Island/dirt-path.png",
      imageheight: 48,
      imagewidth: 48,
      margin: 0,
      name: "sandy-island-dirt-path",
      spacing: 0,
      tilecount: 1,
      tileheight: TILE,
      tilewidth: TILE,
    },
    {
      columns: 1,
      firstgid: PALM_TREE,
      image: "../../assets/tilesets/Sandy Island/palm-tree.png",
      imageheight: 96,
      imagewidth: 48,
      margin: 0,
      name: "sandy-island-palm-tree",
      spacing: 0,
      tilecount: 2,
      tileheight: TILE,
      tilewidth: TILE,
    },
    {
      columns: 1,
      firstgid: FIRE,
      image: "../../assets/tilesets/Sandy Island/fire.png",
      imageheight: 48,
      imagewidth: 48,
      margin: 0,
      name: "sandy-island-fire",
      spacing: 0,
      tilecount: 1,
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
