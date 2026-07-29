// Generates apps/web/src/content/maps/caribbean-field.tmj from the Island survival
// tileset, using the exact same ellipse-union land mask as main.js's isCaribbeanLand()
// so the tile art's coastline and the game's walkable-land boundary can never drift
// out of sync. Run with: node scripts/generate-caribbean-tmj.js <outPath>
//
// Which tile means "sand" or "grass" is NOT decided here — it comes from
// apps/web/src/content/tilesets/maps/caribbean-field.palette.js, so the same answer is reused
// everywhere and can be checked by a test. This script owns layout and the land mask only.
//
// The map is 56x36 (was 40x24). The land mask is a union of five ellipses rather than four,
// which gives the island an irregular, lobed coastline — a northwest cove, a north village
// lobe, a southeast point and a south spit — instead of the single smooth oval the old
// four-ellipse mask produced once its sub-ellipses were swallowed by the main one.
import { writeFileSync } from "node:fs";

import palette from "../apps/web/src/content/tilesets/maps/caribbean-field.palette.js";
import { resolvePalette } from "./lib/palette-gids.js";

const WIDTH = 56;
const HEIGHT = 36;
const TILE = 48;

// --- must stay byte-identical in spirit to apps/web/src/main.js's ellipse()/isCaribbeanLand() ---
// Deliberately duplicated rather than imported: main.js is a browser bundle entry, and the one
// thing that must never silently diverge is the coastline the player collides with versus the
// coastline that got painted. Keeping both copies visible makes a mismatch a code-review catch.
function ellipse(x, y, cx, cy, rx, ry) {
  return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}
function isCaribbeanLand(x, y, pad = 0) {
  const mainBeach = ellipse(x, y, 28.0, 19.5, 17.0 + pad, 10.0 + pad);
  const westCove = ellipse(x, y, 12.5, 17.0, 8.0 + pad, 6.6 + pad);
  const eastPoint = ellipse(x, y, 45.0, 21.5, 8.6 + pad, 7.4 + pad);
  const northVillage = ellipse(x, y, 31.5, 10.0, 10.0 + pad, 6.2 + pad);
  const southSpit = ellipse(x, y, 22.0, 29.0, 7.0 + pad, 4.4 + pad);
  return mainBeach || westCove || eastPoint || northVillage || southSpit;
}

// --- tileset helpers ---
// firstgid assignment, sheet geometry and the tilesets[] array are all derived from the
// palette's sheet order by resolvePalette() — see scripts/lib/palette-gids.js.
const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;

const SAND = gid(T.sand);
const GRASS_A = gid(T.grassA);
const GRASS_B = gid(T.grassB);
const WATER_SHALLOW = gid(T.waterShallow);
const WATER_DEEP = gid(T.waterDeep);
const PATH_LEFT = gid(T.pathLeft); // dirt path, left half (grass border on the left)
const PATH_RIGHT = gid(T.pathRight); // dirt path, right half (grass border on the right)
const GRASS_TUFT = gid(T.grassTuft); // wispy tall-grass texture, reads like a Pokémon grass patch
const SAND_DRIFTWOOD = gid(T.sandDriftwood); // driftwood log embedded in the sand texture
const SAND_SHELLS = gid(T.sandShells); // scattered shells embedded in the sand texture
const CORAL_PATCH = gid(T.coralPatch); // full-bleed underwater coral cluster, open water only
const GARDEN_TOP = gid(T.gardenRowTop);
const GARDEN_BOTTOM = gid(T.gardenRowBottom);

// Deterministic per-cell hash in [0,1). The obvious `(col * a + row * b) % m` scatter that this
// replaces produces visible diagonal banding once a map is large enough — at 56x36 the old
// tall-grass rule laid down a regular lattice across the whole island rather than reading as
// natural scrub. Mixing the coordinates before taking the remainder breaks the alignment while
// staying fully reproducible (no RNG, same output every run).
function hash01(col, row, salt) {
  let h = (col + 1) * 374761393 + (row + 1) * 668265263 + salt * 2246822519;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Ground layer: concentric rings computed straight from the same land mask the game
// uses for collision, padded in/out by 1.2 grid units so the ring width reads clearly
// at 48px tiles without needing directional/rotated edge tiles.
function groundTileAt(col, row) {
  const cx = col + 0.5;
  const cy = row + 0.5;
  if (isCaribbeanLand(cx, cy, -1.2)) {
    // Interior land. Tall-grass scrub is a sparse accent (~6%), not a texture.
    if (hash01(col, row, 1) < 0.06) return GRASS_TUFT;
    return hash01(col, row, 2) < 0.18 ? GRASS_B : GRASS_A;
  }
  if (isCaribbeanLand(cx, cy, 0)) {
    // coastal ring — mostly plain sand, sparse driftwood/shell debris for texture
    if (hash01(col, row, 3) < 0.07) return SAND_DRIFTWOOD;
    if (hash01(col, row, 4) < 0.07) return SAND_SHELLS;
    return SAND;
  }
  if (isCaribbeanLand(cx, cy, 1.2)) {
    // Just offshore. Reef sits in the shallow band, where the coral tile's teal base blends
    // into the turquoise; on the deep-navy tile it reads as a floating blue square instead.
    if (hash01(col, row, 5) < 0.22) return CORAL_PATCH;
    return WATER_SHALLOW;
  }
  return WATER_DEEP; // open water
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

// Village path: a 2-wide vertical dirt strip running from the Taíno village down through the
// island's middle, cols 28-29. Laid on the ground layer; structures-layer stamps draw on top of
// it wherever they overlap, which is what makes it read as "the path leads to the huts" rather
// than needing to dodge their footprints.
//
// There are no east-west connectors. The tileset only has *vertical* path art — every path tile
// carries a baked-in grass edge down one side — so a horizontal run has to be faked with plain
// sand, and at this map size that read as a beige airstrip cutting across the island rather than
// as a track. The island is open grass and walkable everywhere, so the single north-south path
// is enough wayfinding.
for (let row = 9; row <= 26; row += 1) {
  setGround(28, row, PATH_LEFT);
  setGround(29, row, PATH_RIGHT);
}

// --- structures layer: multi-cell object stamps ---
const structuresData = new Array(WIDTH * HEIGHT).fill(0);
const overlayData = new Array(WIDTH * HEIGHT).fill(0);

function stampInto(target, anchorCol, anchorRow, block) {
  // block: 2D array of gids (row-major), 0 = leave existing cell alone
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
const stampOverlay = (col, row, block) => stampInto(overlayData, col, row, block);

// Bohío huts (tile-B-02), each a 2x2 stamp: roof row on top, walled base below.
const HUT_OPEN_DOOR = gidRect(T.hutOpenDoor, 2, 2);
const HUT_CLOSED_DOOR_ROUND = gidRect(T.hutClosedDoorRound, 2, 2);
const HUT_CLOSED_DOOR_SQUARE = gidRect(T.hutClosedDoorSquare, 2, 2);
const HUT_DOOR_WINDOW = gidRect(T.hutDoorWindow, 2, 2);
const HUT_LARGE = gidRect(T.hutLarge, 2, 2);
const WORK_CANOPY = gidRect(T.workCanopy, 2, 2);
const DRYING_RACK = gidRect(T.dryingRack, 2, 2);

// Anchors below are each stamp's top-left cell, chosen so the object's *base* row lines up with
// the matching FIELD_BLOCKS rectangle in apps/web/src/main.js (kept in sync manually — see
// docs/decision-log/0029-caribbean-tiled-rebuild.md). tests/unit/field-map-coordinates.test.js
// checks that every block rect actually covers a drawn structure cell.
stamp(29, 6, HUT_LARGE); // principal dwelling  (FIELD_BLOCKS 29.0,6.6-31.0,8.0)
stamp(25, 8, HUT_OPEN_DOOR); // bohio one            (25.0,8.6-27.0,10.0)
stamp(34, 7, HUT_DOOR_WINDOW); // bohio two            (34.0,7.6-36.0,9.0)
stamp(37, 10, HUT_CLOSED_DOOR_ROUND); // bohio three          (37.0,10.6-39.0,12.0)
stamp(24, 11, HUT_CLOSED_DOOR_SQUARE); // bohio four           (24.0,11.6-26.0,13.0)
stamp(31, 10, WORK_CANOPY); // open work canopy     (31.0,10.6-33.0,12.0)
stamp(35, 12, DRYING_RACK); // fish-drying rack     (35.0,12.6-37.0,14.0)

// Taíno conuco garden: a two-row leafy planted patch with fence posts baked into the art. On the
// structures layer, not the ground layer, because it is a collision obstacle — a rect in
// FIELD_BLOCKS with nothing drawn on structures underneath it is exactly the drift
// tests/unit/field-map-coordinates.test.js exists to catch.  (20.0,12.0-24.0,14.0)
for (let col = 20; col <= 23; col += 1) {
  stamp(col, 12, [[GARDEN_TOP], [GARDEN_BOTTOM]]);
}

// Single-cell props (tile-B-01).
const CAMPFIRE = gid(T.campfire);
const CANOE = gid(T.canoe);
const CRATE_A = gid(T.crateA);
const CRATE_B = gid(T.crateB);
const TENT = gid(T.tent);

// Taíno canoes drawn up on the north-lobe shore.
stamp(33, 15, [[CANOE]]); // village canoe        (33.0,15.3-34.0,16.0)
stamp(20, 16, [[CANOE]]); // second canoe         (20.0,16.3-21.0,17.0)
stamp(31, 16, [[CAMPFIRE]]); // village fire         (31.0,16.3-32.0,17.0)

// Spanish landing camp on the southeast point.
stamp(44, 21, [[TENT]]); // command tent         (44.0,21.3-45.0,22.0)
stamp(47, 22, [[TENT]]); // second tent          (47.0,22.3-48.0,23.0)
stamp(45, 23, [[CAMPFIRE]]); // camp fire            (45.0,23.3-46.0,24.0)
stamp(42, 24, [[CRATE_A, CRATE_B]]); // supply crates        (42.0,24.3-44.0,25.0)

// Columbus's landing on the northwest cove: the chart table the Waldseemüller puzzle hangs off,
// plus the boat that brought the party ashore. Both were previously CSS-drawn <div>s positioned
// in absolute pixels, which silently desynced from their collision rects the moment the field's
// tile size changed.
const CHART_TABLE = gidRect(T.chartTable, 2, 3);
const MAP_SCROLLS = gidRect(T.mapScrolls, 2, 2);
const ANCHOR = gidRect(T.anchor, 2, 2);
const SHIPS_BOAT = gidRect(T.shipsBoat, 2, 1);
const BARREL = gid(T.barrel);
const SEA_CRATE = gid(T.seaCrate);

stamp(10, 17, CHART_TABLE); // cartographer's table (10.0,17.6-13.0,19.0)
stamp(14, 16, MAP_SCROLLS); // chart scrolls        (14.0,16.6-16.0,18.0)
stamp(8, 20, ANCHOR); // beached anchor       (8.0,20.6-10.0,22.0)
stamp(6, 13, SHIPS_BOAT); // ship's boat ashore   (6.0,13.6-7.0,15.0)
stamp(9, 15, [[BARREL, SEA_CRATE]]); // landed stores        (9.0,15.3-11.0,16.0)

// The Spanish flotilla, anchored offshore in open water. No FIELD_BLOCKS entries: they sit
// beyond the land mask, which already stops the player.
const SHIP_FLAGSHIP = gidRect(T.shipFlagship, 2, 3);
const SHIP_CARAVEL_A = gidRect(T.shipCaravelA, 2, 2);
const SHIP_CARAVEL_B = gidRect(T.shipCaravelB, 2, 2);

stamp(0, 15, SHIP_FLAGSHIP);
stamp(1, 19, SHIP_CARAVEL_A);
stamp(2, 11, SHIP_CARAVEL_B);

// Palms: 1-wide x 2-tall crown-then-trunk stamps, several variants for visual variety.
const PALM_A = gidRect(T.palmA, 2, 1);
const PALM_B = gidRect(T.palmB, 2, 1);
const PALM_C = gidRect(T.palmC, 2, 1);

// [col, row, variant] — each palm's trunk base sits at row+1, which is the row its
// FIELD_BLOCKS rect covers.
const PALMS = [
  [16, 14, PALM_A],
  [20, 22, PALM_B],
  [34, 15, PALM_C],
  [42, 16, PALM_A],
  [25, 26, PALM_B],
  [19, 29, PALM_C],
  [48, 18, PALM_A],
  [11, 21, PALM_B],
  [37, 6, PALM_C],
  [31, 24, PALM_A],
  [8, 17, PALM_B],
];
for (const [col, row, variant] of PALMS) stamp(col, row, variant);

// Scatter decor: small rocks, ferns and bushes sprinkled across interior grass so the island
// reads as overgrown rather than as a lawn. No FIELD_BLOCKS entries — these are ankle-height
// and the player walks straight over them, which is why they can be placed procedurally without
// hand-maintaining a matching collision rect for each one.
const SCATTER = [
  T.scatterBoulder,
  T.scatterRock,
  T.scatterPebble,
  T.scatterFern,
  T.scatterBush,
  T.scatterShrub,
  T.scatterReed,
  T.scatterPlant,
].map(gid);

for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (structuresData[row * WIDTH + col]) continue; // never bury a building or prop
    const cx = col + 0.5;
    const cy = row + 0.5;
    if (!isCaribbeanLand(cx, cy, -1.6)) continue; // interior only, keep the beach ring clean
    if (col >= 27 && col <= 30) continue; // leave the village path clear
    const roll = hash01(col, row, 11);
    if (roll >= 0.075) continue;
    stamp(col, row, [[SCATTER[Math.floor(hash01(col, row, 12) * SCATTER.length)]]]);
  }
}

// --- overlay layer: drawn ABOVE the player, so walking into the grove partially hides them ---
// Deliberately a single-tile-deep fringe rather than a solid block: the canopy tile is fully
// opaque, so a deep patch would hide the player completely instead of reading as tree cover.
const JUNGLE_CANOPY = gid(T.jungleCanopy);
for (let col = 18; col <= 25; col += 1) stampOverlay(col, 28, [[JUNGLE_CANOPY]]);
for (let col = 20; col <= 23; col += 1) stampOverlay(col, 27, [[JUNGLE_CANOPY]]);

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
    // The name matters: tiled-map-loader.js routes any layer named "overlay*" to a second
    // canvas stacked above the player and NPC sprites.
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
