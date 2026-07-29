// Generates apps/web/src/content/maps/common-cause-field.tmj for case-007 ("The Common Cause",
// Unit 3's 1770s Revolutionary Philadelphia gathering ground) — see
// docs/decision-log/0032-common-cause-tiled-rebuild.md.
//
// At 56x36 the map gains a real Delaware waterfront along its south edge (quay, pier, moored
// merchantmen) and a residential quarter of clapboard housing from farm/7, which reads far more
// like a colonial port than the Medieval Fantasy Town silhouettes it previously leaned on for
// everything. Those silhouettes are still used for the civic buildings, where no better fit
// exists — a Georgian/Federal columned statehouse remains a registered gap in the tile library.
//
// The one truly unique element with no existing-pack equivalent — the liberty pole — was
// generated via PixelLab and lives in its own small pack, "Common Cause Philadelphia".
//
// Which tile is which building comes from
// apps/web/src/content/tilesets/maps/common-cause-field.palette.js — including the standing rule
// that only Medieval Fantasy Town's UNLABELLED building silhouettes may be used here.
//
// Run with: node scripts/generate-common-cause-tmj.js apps/web/src/content/maps/common-cause-field.tmj
import { writeFileSync } from "node:fs";

import palette from "../apps/web/src/content/tilesets/maps/common-cause-field.palette.js";
import { resolvePalette } from "./lib/palette-gids.js";

const WIDTH = 56;
const HEIGHT = 36;
const TILE = 48;

// --- must stay in lockstep with apps/web/src/main.js's isCommonCauseLand() ---
// A rectangle bounded on the south by the river. The waterline meanders slightly so the quay
// isn't a ruler-straight edge across the full width of the map.
function commonCauseWaterline(x) {
  return 29.5 + Math.sin(x * 0.12) * 1.1;
}
function isCommonCauseLand(x, y) {
  if (x < 2.5 || x > 53.5 || y < 2.5) return false;
  return y < commonCauseWaterline(x);
}

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;

function hash01(col, row, salt) {
  let h = (col + 1) * 374761393 + (row + 1) * 668265263 + salt * 2246822519;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const GROUND_PLAZA_A = gid(T.groundPlazaA);
const GROUND_PLAZA_B = gid(T.groundPlazaB); // near-identical variant, for light texture
const GROUND_EXTERIOR = gid(T.groundExterior);
const WATER = gid(T.water);
const WATER_ALT = gid(T.waterAlt);
const SHORE_EDGE = gid(T.shoreEdge);

// The paved civic square. Deliberately much smaller than the map: an earlier revision paved
// cols 13-43 x rows 7-25 and the result was a dead grey field with every building pushed out to
// the margins. A town square should be enclosed by its buildings, not the other way round.
function inPlaza(col, row) {
  return col >= 20 && col <= 36 && row >= 10 && row <= 22;
}

function groundTileAt(col, row) {
  const cx = col + 0.5;
  const cy = row + 0.5;
  if (cy >= commonCauseWaterline(cx)) {
    // First row of water below the quay gets the surf tile so the bank isn't a hard edge.
    if (cy - 1.0 < commonCauseWaterline(cx)) return SHORE_EDGE;
    return hash01(col, row, 1) < 0.22 ? WATER_ALT : WATER;
  }
  // The three rows of land above the waterline are the paved quay. It uses the same cobble as
  // the square rather than the fishing-village pack's shoreline tiles, which are rounded
  // boulders and tiled into a repeating rock wall along the whole river frontage.
  if (cy + 3.0 >= commonCauseWaterline(cx)) return GROUND_PLAZA_A;
  if (!isCommonCauseLand(cx, cy)) return GROUND_EXTERIOR;
  if (inPlaza(col, row)) return (col + row) % 5 === 0 ? GROUND_PLAZA_B : GROUND_PLAZA_A;
  return GROUND_EXTERIOR;
}

const groundData = [];
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    groundData.push(groundTileAt(col, row));
  }
}
function setGround(col, row, tileGid) {
  if (col < 0 || col >= WIDTH || row < 0 || row >= HEIGHT) return;
  groundData[row * WIDTH + col] = tileGid;
}

// Paved streets running out of the square: south to the quay, west and east into the
// residential quarters, and north past the statehouse.
for (let row = 22; row <= 27; row += 1) {
  for (let col = 26; col <= 29; col += 1) setGround(col, row, GROUND_PLAZA_A);
}
for (let row = 15; row <= 16; row += 1) {
  for (let col = 8; col <= 20; col += 1) setGround(col, row, GROUND_PLAZA_A);
  for (let col = 36; col <= 49; col += 1) setGround(col, row, GROUND_PLAZA_A);
}
for (let row = 6; row <= 10; row += 1) {
  for (let col = 32; col <= 34; col += 1) setGround(col, row, GROUND_PLAZA_A);
}

// --- structures layer: multi-cell building/prop stamps ---
const structuresData = new Array(WIDTH * HEIGHT).fill(0);
const overlayData = new Array(WIDTH * HEIGHT).fill(0);
function stampInto(target, anchorCol, anchorRow, block) {
  block.forEach((rowGids, r) => {
    rowGids.forEach((tileGid, c) => {
      if (!tileGid) return;
      const col = anchorCol + c;
      const row = anchorRow + r;
      if (col < 0 || col >= WIDTH || row < 0 || row >= HEIGHT) return;
      target[row * WIDTH + col] = tileGid;
    });
  });
}
const stamp = (col, row, block) => stampInto(structuresData, col, row, block);

// Civic building — the source sheet's baked-in "Adventurer's Guild" sign band (its row 2) is
// swapped for that same sheet's plain stone wall so no anachronistic fantasy text renders in a
// Revolutionary Philadelphia scene. See the palette's header for the standing rule.
const ASSEMBLY_HALL = gidRect(T.assemblyHall, 4, 4);
ASSEMBLY_HALL[2] = gidRect({ sheet: T.assemblyHall.sheet, row: 2, col: 0 }, 1, 4)[0];

// Dock planking plus a rowboat on the row below — the old town wharf.
const WHARF = gidRect(T.wharf, 2, 4);
WHARF.push([...gidRect({ sheet: T.wharf.sheet, row: 10, col: 0 }, 1, 2)[0], 0, 0]);

// Anchors below are each stamp's top-left cell, chosen so the building's ground-contact row lines
// up with the matching UNIT3_FIELD_BLOCKS rect in apps/web/src/main.js (kept in sync manually —
// see docs/decision-log/0032-common-cause-tiled-rebuild.md). The comment after each line is that
// rect; tests/unit/field-map-coordinates.test.js checks the two agree.
// Civic buildings, ringing the square.
stamp(25, 4, ASSEMBLY_HALL); //  assembly hall     (25.0,6.6-29.0,8.0)
stamp(25, 8, gidRect(T.statehouseSteps, 1, 4)); //  statehouse steps  (25.0,8.2-29.0,9.0)
// 3 rows x 2 cols, not the source block's full 4 columns: that width spans two church variants
// side by side and renders as a pair of chapels rather than one parish church.
stamp(45, 6, gidRect(T.chapel, 3, 2)); //  chapel            (45.0,8.0-47.0,9.0)
stamp(14, 5, gidRect(T.printShop, 4, 4)); //  print shop        (14.0,7.6-18.0,9.0)
stamp(38, 5, gidRect(T.townhouse, 4, 4)); //  merchant townhouse (38.0,7.6-42.0,9.0)
stamp(5, 12, gidRect(T.frontierDispatchPost, 3, 2)); //  dispatch post     (5.0,14.0-7.0,15.0)
stamp(9, 22, gidRect(T.familyResidence, 4, 4)); //  family residence  (9.0,24.6-13.0,26.0)
stamp(38, 23, gidRect(T.warehouse, 4, 3)); //  warehouse         (38.0,25.6-41.0,27.0)

// The square itself: liberty pole, then the well stamped after it so the well's tiles win the
// cells they share — the well reads better as the grounded object at that junction.
stamp(27, 11, gidRect(T.libertyPole, 3, 1)); //  liberty pole      (27.0,13.0-28.0,14.0)
stamp(26, 16, gidRect(T.townWell, 2, 2)); //  town well         (26.0,16.6-28.0,18.0)

// Market: the Medieval Fantasy Town stall row plus awninged booths from the fishing village
// sheet, which read as cloth-canopy market stalls rather than shopfronts.
stamp(30, 19, gidRect(T.marketStalls, 2, 4)); //  market stalls     (30.0,20.0-34.0,21.0)
stamp(34, 19, gidRect(T.awningStall, 2, 2)); //  awning stall      (34.0,19.6-36.0,21.0)
stamp(22, 19, gidRect(T.awningStall, 2, 2)); //  awning stall two  (22.0,19.6-24.0,21.0)

// Residential quarter — clapboard housing filling the streets either side of the square.
const HOUSES = [
  [9, 6, T.houseRed],
  [9, 17, T.houseYellow],
  [12, 12, T.houseCream],
  [17, 12, T.houseBlue],
  [17, 19, T.houseBrown],
  [15, 25, T.houseRed],
  [5, 22, T.houseYellow],
  [37, 11, T.houseCream],
  [43, 12, T.houseBrown],
  [43, 18, T.houseBlue],
  [48, 8, T.houseRed],
  [48, 20, T.houseYellow],
  [50, 13, T.houseCream],
  [44, 25, T.houseBrown],
];
for (const [col, row, entry] of HOUSES) stamp(col, row, gidRect(entry, 2, 2));

// --- waterfront ---
stamp(21, 26, WHARF); //  wharf             (21.0,27.0-25.0,28.0)

// Two piers running south out of the quay into the river. Each is anchored one row *above* the
// waterline at its own column so the walkway visibly meets the bank rather than starting a tile
// offshore, and uses the sheet's north-south pier art.
function buildPier(col) {
  const firstWaterRow = Math.ceil(commonCauseWaterline(col + 0.5) - 0.5);
  stamp(col, firstWaterRow - 1, gidRect(T.pierVertical, 4, 2));
}
buildPier(26);
buildPier(41);

// Moored shipping. These sit on open water beyond the land mask, so they need no collision rect.
stamp(8, 32, gidRect(T.shipMerchant, 2, 3));
stamp(16, 34, gidRect(T.shipSloop, 2, 2));
stamp(33, 33, gidRect(T.shipBarge, 1, 4));
stamp(47, 32, gidRect(T.shipSloop, 2, 2));
stamp(24, 34, gidRect(T.rowboat, 1, 2));

// Quayside cargo — the Triangle-Trade goods this case is about.
const QUAY_PROPS = [
  [19, 28, T.crate],
  [20, 28, T.barrel],
  [18, 28, T.barrelAlt],
  [31, 28, T.crate],
  [32, 28, T.grainSack],
  [33, 28, T.produceCrate],
  [30, 27, T.ropeCoil],
  [34, 27, T.barrel],
  [36, 28, T.hayBale],
  [35, 27, T.produceCrate],
  [44, 28, T.crate],
  [45, 28, T.barrel],
];
for (const [col, row, entry] of QUAY_PROPS) stamp(col, row, [[gid(entry)]]);

// --- churchyard: railed enclosure east of the chapel, and the town's shade trees ---
const FENCE = [gid(T.fenceRail), gid(T.fenceRailAlt)];
for (let col = 44; col <= 50; col += 1) {
  stamp(col, 4, [[FENCE[(col + 4) % 2]]]);
  stamp(col, 10, [[FENCE[(col + 10) % 2]]]);
}
stamp(47, 10, [[gid(T.fenceGate)]]);

// Trees frame the north edge and line the square. Their canopies are lifted to the overlay layer
// so the player walks behind them; only the trunk row keeps a collision rect.
const SHADE_TREES = [
  [11, 3, T.treeOak, 3], //  trunk row 5   (11.0,5.4-14.0,6.0)
  [20, 3, T.treeBirch, 2], //  trunk row 5   (20.0,5.4-22.0,6.0)
  [33, 2, T.treeAutumn, 3], //  trunk row 4   (33.0,4.4-36.0,5.0)
  [18, 24, T.treeOak, 3], //  trunk row 26  (18.0,26.4-21.0,27.0)
  [46, 15, T.treeBirch, 2], //  trunk row 17  (46.0,17.4-48.0,18.0)
];
for (const [col, row, entry, width] of SHADE_TREES) {
  stamp(col, row, gidRect(entry, 3, width));
  for (let c = 0; c < width; c += 1) {
    const index = row * WIDTH + col + c;
    if (!structuresData[index]) continue;
    overlayData[index] = structuresData[index];
    structuresData[index] = 0;
  }
}

// Low scatter on the grassy fringes only — never on the paved square, where it would read as
// litter rather than planting.
const BUSHES = [T.bushA, T.bushB].map(gid);
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (structuresData[row * WIDTH + col]) continue;
    if (groundData[row * WIDTH + col] !== GROUND_EXTERIOR) continue;
    if (!isCommonCauseLand(col + 0.5, row + 0.5)) continue;
    if (hash01(col, row, 4) >= 0.06) continue;
    stamp(col, row, [[BUSHES[Math.floor(hash01(col, row, 5) * BUSHES.length)]]]);
  }
}

// --- emit Tiled JSON, matching the existing prototype's shape/conventions ---
function tileLayer({ data, id, name, locked = false }) {
  return {
    data,
    height: HEIGHT,
    id,
    ...(locked ? { locked: true } : {}),
    name,
    opacity: 1,
    type: "tilelayer",
    visible: true,
    width: WIDTH,
    x: 0,
    y: 0,
  };
}

const tmj = {
  compressionlevel: -1,
  height: HEIGHT,
  infinite: false,
  layers: [
    tileLayer({ data: groundData, id: 1, name: "ground" }),
    tileLayer({ data: structuresData, id: 2, name: "structures", locked: true }),
    tileLayer({ data: overlayData, id: 3, name: "overlay", locked: true }),
  ],
  nextlayerid: 4,
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
