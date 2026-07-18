// Generates apps/web/src/content/maps/common-cause-field.tmj for case-007 ("The Common
// Cause", Unit 3's 1770s Revolutionary Philadelphia gathering ground), replacing the
// previous CSS-drawn fallback (see docs/decision-log/0032-common-cause-tiled-rebuild.md).
//
// Building art is drawn from the existing "Medieval Fantasy Town" and "Medieval Fishing
// Village" packs (already downloaded under apps/web/src/assets/tilesets/) rather than a
// newly generated custom sheet: per docs/architecture/art-and-map-style-guide.md, generic
// stone/timber-frame building silhouettes are an accepted stand-in for colonial framing
// (already used this way for Riverbend), and reusing them keeps this map visually
// cohesive with the rest of the repo's art instead of introducing a second, differently
// -rendered style. The one truly unique element with no existing-pack equivalent — the
// liberty pole — was generated via PixelLab and lives in its own small pack,
// "Common Cause Philadelphia/liberty-pole.png".
//
// Anchor convention matches scripts/generate-caribbean-tmj.js: each stamp's top-left
// cell is chosen to align with the matching FIELD_BLOCKS rect's (x1, y1) in
// apps/web/src/main.js (kept in sync manually), not derived from the .tmj.
//
// Run with: node scripts/generate-common-cause-tmj.js apps/web/src/content/maps/common-cause-field.tmj
import { writeFileSync } from "node:fs";

const WIDTH = 40;
const HEIGHT = 24;
const TILE = 48;

// --- must stay byte-identical in spirit to apps/web/src/main.js's isCommonCauseLand() ---
function isCommonCauseLand(x, y) {
  return x > 2.2 && x < 37.8 && y > 2.2 && y < 21.8;
}

// --- tileset helpers ---
// Each pack sheet below is a 768x768px, 16-column, 48px-tile grid (confirmed directly:
// System.Drawing dimension check during authoring). firstgid values are assigned in the
// same order the tilesets array lists them.
const MFT1 = 1; // Medieval Fantasy Town/1.png — cottages, half-timber buildings, stairs/arch
const MFT2 = 257; // Medieval Fantasy Town/2.png — ground fill, market stalls, well
const MFT5 = 513; // Medieval Fantasy Town/5.png — guild-hall-shaped civic building, church, watchtower
const MFV4 = 769; // Medieval Fishing Village/tile-B-04.png — dock/wharf
const POLE = 1025; // Common Cause Philadelphia/liberty-pole.png — 1 col x 3 rows, PixelLab-generated
const gidMFT1 = (row, col) => MFT1 + row * 16 + col;
const gidMFT2 = (row, col) => MFT2 + row * 16 + col;
const gidMFT5 = (row, col) => MFT5 + row * 16 + col;
const gidMFV4 = (row, col) => MFV4 + row * 16 + col;
const gidPole = (row) => POLE + row;

// Builds a row-major 2D GID block from a sheet's gid function, anchored at (r0, c0).
function rect(gidFn, r0, c0, h, w) {
  const block = [];
  for (let r = 0; r < h; r += 1) {
    const row = [];
    for (let c = 0; c < w; c += 1) row.push(gidFn(r0 + r, c0 + c));
    block.push(row);
  }
  return block;
}

// Ground fill (Medieval Fantasy Town/2.png): plain stone plaza inside the walkable
// gathering ground, grass outside it — confirmed by grid-labeled inspection of the sheet.
const GROUND_PLAZA_A = gidMFT2(0, 0);
const GROUND_PLAZA_B = gidMFT2(1, 0); // near-identical variant, alternated for light texture
const GROUND_EXTERIOR = gidMFT2(0, 6);

function groundTileAt(col, row) {
  const cx = col + 0.5;
  const cy = row + 0.5;
  if (!isCommonCauseLand(cx, cy)) return GROUND_EXTERIOR;
  return (col + row) % 5 === 0 ? GROUND_PLAZA_B : GROUND_PLAZA_A;
}

const groundData = [];
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    groundData.push(groundTileAt(col, row));
  }
}

// --- structures layer: multi-cell building/prop stamps ---
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

// Half-timber building, unlabeled — print shop (rows 0-3, cols 4-7 of MFT1).
const PRINT_SHOP = rect(gidMFT1, 0, 4, 4, 4);

// Second thatched cottage, unlabeled — family residence (rows 4-7, cols 0-3 of MFT1).
const FAMILY_RESIDENCE = rect(gidMFT1, 4, 0, 4, 4);

// Stone stairs + double arch — statehouse steps (row 8, cols 8-11 of MFT1).
const STATEHOUSE_STEPS = rect(gidMFT1, 8, 8, 1, 4);

// "Adventurer's Guild" civic building (rows 0-3, cols 8-11 of MFT5) — the baked-in sign
// band (row 2) is swapped for that same sheet's plain stone wall (row 2, cols 0-3) so no
// anachronistic fantasy text renders in a Revolutionary Philadelphia scene.
const ASSEMBLY_HALL = rect(gidMFT5, 0, 8, 4, 4);
ASSEMBLY_HALL[2] = [gidMFT5(2, 0), gidMFT5(2, 1), gidMFT5(2, 2), gidMFT5(2, 3)];

// Church with steeple, both variants side by side for a fuller footprint — chapel
// (rows 8-10, cols 4-7 of MFT5).
const CHAPEL = rect(gidMFT5, 8, 4, 3, 4);

// Wooden lookout watchtower — frontier dispatch post (rows 8-10, cols 12-13 of MFT5).
const FRONTIER_DISPATCH_POST = rect(gidMFT5, 8, 12, 3, 2);

// Two market stalls side by side — market stalls (rows 4-5, cols 0-3 of MFT2).
const MARKET_STALLS = rect(gidMFT2, 4, 0, 2, 4);

// Well with peaked roof — town well (rows 6-7, cols 8-9 of MFT2).
const TOWN_WELL = rect(gidMFT2, 6, 8, 2, 2);

// Dock planking (rows 8-9, cols 0-3 of MFV4) + a rowboat (row 10, cols 0-1) — wharf.
const WHARF = rect(gidMFV4, 8, 0, 2, 4);
WHARF.push([gidMFV4(10, 0), gidMFV4(10, 1), 0, 0]);

// Liberty pole (PixelLab-generated, single 1x3 column) — no existing pack has an
// equivalent; this is the one genuinely unique asset in this map.
const LIBERTY_POLE = [[gidPole(0)], [gidPole(1)], [gidPole(2)]];

// Anchors below are each stamp's top-left cell, chosen to align with the matching
// UNIT3_FIELD_BLOCKS rect in apps/web/src/main.js (kept in sync manually — see
// docs/decision-log/0032-common-cause-tiled-rebuild.md). The liberty pole is stamped
// before the well so the well's tiles win the one cell they share (col 19, row 11),
// since the well reads better as the "grounded" object at that shared corner.
stamp(5, 6, PRINT_SHOP); // print shop        (FIELD_BLOCKS 5.0,6.0-9.5,9.0)
stamp(16, 4, ASSEMBLY_HALL); // assembly hall     (16.0,3.5-23.0,7.0)
stamp(21, 8, STATEHOUSE_STEPS); // statehouse steps  (21.0,8.2-24.0,9.4)
stamp(27, 5, CHAPEL); // chapel            (27.0,5.0-31.0,8.0)
stamp(13, 13, MARKET_STALLS); // market stalls     (13.0,13.0-16.0,14.5)
stamp(19, 9, LIBERTY_POLE); // liberty pole      (19.3,9.0-20.7,10.0)
stamp(19, 11, TOWN_WELL); // town well         (18.7,11.0-20.3,12.0)
stamp(33, 15, WHARF); // wharf             (33.0,15.0-37.0,18.0)
stamp(3, 15, FRONTIER_DISPATCH_POST); // frontier dispatch (3.0,15.0-6.5,17.5)
stamp(9, 17, FAMILY_RESIDENCE); // family residence  (9.0,17.0-13.0,20.0)

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
      firstgid: MFT1,
      image: "../../assets/tilesets/Medieval Fantasy Town/1.png",
      imageheight: 768,
      imagewidth: 768,
      margin: 0,
      name: "medieval-fantasy-town-1",
      spacing: 0,
      tilecount: 256,
      tileheight: TILE,
      tilewidth: TILE,
    },
    {
      columns: 16,
      firstgid: MFT2,
      image: "../../assets/tilesets/Medieval Fantasy Town/2.png",
      imageheight: 768,
      imagewidth: 768,
      margin: 0,
      name: "medieval-fantasy-town-2",
      spacing: 0,
      tilecount: 256,
      tileheight: TILE,
      tilewidth: TILE,
    },
    {
      columns: 16,
      firstgid: MFT5,
      image: "../../assets/tilesets/Medieval Fantasy Town/5.png",
      imageheight: 768,
      imagewidth: 768,
      margin: 0,
      name: "medieval-fantasy-town-5",
      spacing: 0,
      tilecount: 256,
      tileheight: TILE,
      tilewidth: TILE,
    },
    {
      columns: 16,
      firstgid: MFV4,
      image: "../../assets/tilesets/Medieval Fishing Village/tile-B-04.png",
      imageheight: 768,
      imagewidth: 768,
      margin: 0,
      name: "medieval-fishing-village-b04",
      spacing: 0,
      tilecount: 256,
      tileheight: TILE,
      tilewidth: TILE,
    },
    {
      columns: 1,
      firstgid: POLE,
      image: "../../assets/tilesets/Common Cause Philadelphia/liberty-pole.png",
      imageheight: 144,
      imagewidth: 48,
      margin: 0,
      name: "common-cause-philadelphia-liberty-pole",
      spacing: 0,
      tilecount: 3,
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
