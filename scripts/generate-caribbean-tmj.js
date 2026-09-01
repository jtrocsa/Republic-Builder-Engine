// Generates apps/web/src/content/maps/caribbean-field.tmj and its collision module from the
// Island survival tileset, using the exact same ellipse-union land mask as main.js's
// isCaribbeanLand() so the tile art's coastline and the game's walkable-land boundary can never
// drift out of sync.
//
// Run with: node scripts/generate-caribbean-tmj.js
//
// Which tile means "sand" or "grass" is NOT decided here — it comes from
// apps/web/src/content/tilesets/maps/caribbean-field.palette.js. Layering and collision come from
// scripts/lib/map-builder.js. This script owns layout and the land mask only.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/caribbean-field.palette.js";
import { MapBuilder, hash01, pick } from "./lib/map-builder.js";
import { RoadNetwork, blockGids, connectAll, doorCellOf } from "./lib/paths.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/caribbean-field.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/caribbean-field.blocks.js");

const WIDTH = 56;
const HEIGHT = 36;

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

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

// --- ground: concentric rings computed straight from the same land mask the game uses for
// collision, padded in/out by 1.2 grid units so the ring width reads clearly at 48px tiles.
//
// Each band paints a whole authored 2x2 terrain block by parity. Nothing decorative goes on this
// layer: the driftwood, shells and coral that used to be dropped here as single quadrants of a
// *different* block are transparent props on structures now, further down.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    const cx = col + 0.5;
    const cy = row + 0.5;
    let block = T.waterDeep;
    if (isCaribbeanLand(cx, cy, -1.2)) block = T.grass;
    else if (isCaribbeanLand(cx, cy, 0)) block = T.sand;
    else if (isCaribbeanLand(cx, cy, 1.2)) block = T.waterShallow;
    map.groundBlock(col, row, block);
  }
}

// The trunk: the island's one deliberate route. It leaves the Taíno village heading south, then runs
// west along the island's waist to the cove where Columbus's party landed. Everything else that leads
// to a door — every bohío, the work canopy, the drying rack, the conuco garden, the chart table, the
// Spanish camp — is a spur generated from the object itself, at the bottom of this file. See
// scripts/lib/paths.js.
//
// What this replaced was the clearest example of the defect this pass is about: a 2-wide strip down
// cols 28-29 from row 9 to row 26 that passed *near* the village and then continued through empty
// grass to nothing. Not one hut had a path to its door, and the southern two-thirds of it led
// nowhere at all.
//
// It could only ever be one vertical line, too. It was painted in `path.tropical.left`/`.right`, and
// each of those carries a baked-in grass edge down one side, so an east-west run with them is
// impossible — this generator's own comment recorded that a horizontal connector "has to be faked
// with plain sand." So the whole network is now that sand: full-bleed, tiles in any direction, and it
// reads as a worn track through grass, the same material and the same reasoning as Riverbend's.
// `path.tropical.left`/`.right` have no consumer left anywhere in the project.
const roads = new RoadNetwork(map, T[palette.road]);
roads.run(28, 9, 28, 16); // out of the village, south
roads.run(13, 16, 28, 16); // west along the waist toward the landing cove
roads.run(13, 16, 13, 18); // down to the cartographer's table on the cove

const snapTo = (col, row, wanted, maxRadius) => map.snapTo(col, row, wanted, maxRadius);

/** True where the ground layer painted the beach ring: land, but outside the grass interior. */
const isBeach = (col, row) =>
  isCaribbeanLand(col + 0.5, row + 0.5, 0) && !isCaribbeanLand(col + 0.5, row + 0.5, -1.2);

/** Beach with enough clear width to the east for a wider prop. */
const isClearBeach = (col, row, width = 1) => {
  for (let i = 0; i < width; i += 1) {
    if (!isBeach(col + i, row) || map.occupied(col + i, row)) return false;
  }
  return true;
};

// --- structures ------------------------------------------------------------------------------
// Every stamp declares what it is, and the collision rect falls out of that. `solid` blocks the
// whole footprint — a bohío is a building, and before Phase 53 its rect covered only the wall row,
// so the player could walk up onto the thatch. `base` blocks the ground-contact row and lifts
// everything above it to the overlay layer. `decor` blocks nothing.

// Each of these is collected as a door: `doorCellOf()` reads the cell below the centre of the
// stamp's ground-contact row, so the spur the router paints starts where a person would step out.
const doors = [];
const withDoor = (col, row, entry, label) =>
  doors.push(doorCellOf(map.stamp(col, row, entry, "solid", label)));

// Taíno village, north lobe.
withDoor(29, 6, T.hutLarge, "principal dwelling");
withDoor(25, 8, T.hutOpenDoor, "bohio one");
withDoor(34, 7, T.hutDoorWindow, "bohio two");
withDoor(37, 10, T.hutClosedDoorRound, "bohio three");
withDoor(24, 11, T.hutClosedDoorSquare, "bohio four");
withDoor(31, 10, T.workCanopy, "work canopy");
withDoor(35, 12, T.dryingRack, "drying rack");

// Conuco garden: a run of planted rows with bamboo posts baked into the art. The sheet draws this
// continuously across its own row, so each cell's neighbour is placed adjacently and the run reads
// as one hedge rather than as repeated cut-off segments.
for (let col = 20; col <= 23; col += 1) {
  const stamp = map.stamp(col, 12, T.gardenRow, "solid", "conuco garden");
  // One door for the run, not four — a track to each cell of a continuous hedge would read as a rake.
  if (col === 21) doors.push(doorCellOf(stamp));
}

// Taíno canoes drawn up on the shore, and the village fire. A canoe belongs on the sand — the
// previous revision's fixed coordinates left both of them beached in open grass.
const [canoeOneCol, canoeOneRow] = snapTo(33, 15, (c, r) => isClearBeach(c, r, 2));
map.stamp(canoeOneCol, canoeOneRow, T.canoe, "solid", "village canoe");
const [canoeTwoCol, canoeTwoRow] = snapTo(20, 17, (c, r) => isClearBeach(c, r, 2));
map.stamp(canoeTwoCol, canoeTwoRow, T.canoe, "solid", "second canoe");
map.stamp(31, 16, T.campfire, "solid", "village fire");

// Spanish landing camp on the southeast point.
withDoor(44, 21, T.tent, "command tent");
withDoor(47, 22, T.tent, "second tent");
map.stamp(45, 23, T.campfire, "solid", "camp fire");
map.stamp(42, 24, T.crateA, "solid", "supply crates");
map.stamp(43, 24, T.crateB, "solid", "supply crates");

// Columbus's landing on the northwest cove. The chart table stays where it is: the Waldseemüller
// puzzle's interaction point (FIELD_SOURCE_POINTS["waldseemuller-map"], 11.5,17.2) sits inside it,
// as does Columbus's own patrol, so this is a fixed coordinate, not a free one.
withDoor(10, 17, T.chartTable, "cartographer table");

// Everything the landing party carried ashore snaps to the sand beside it.
const [anchorCol, anchorRow] = snapTo(8, 20, (c, r) => isClearBeach(c, r, 2));
map.stamp(anchorCol, anchorRow, T.anchor, "solid", "beached anchor");
const [boatCol, boatRow] = snapTo(7, 14, (c, r) => isClearBeach(c, r, 1));
map.stamp(boatCol, boatRow, T.shipsBoat, "solid", "ship's boat");
const STORES = [
  [9, 15, T.barrel],
  [10, 15, T.seaCrate],
  [11, 16, T.barrelAlt],
];
for (const [col, row, entry] of STORES) {
  const [c, r] = snapTo(col, row, (cc, rr) => isClearBeach(cc, rr, 1), 5);
  map.stamp(c, r, entry, "solid", "landed stores");
}

// The Spanish flotilla, anchored offshore in open water. No collision: they sit beyond the land
// mask, which already stops the player. Kept one column clear of the map edge so no hull is cut
// off by the world boundary.
map.stamp(1, 15, T.shipFlagship, "decor", "flagship");
map.stamp(2, 20, T.shipCaravelA, "decor", "caravel");
map.stamp(3, 10, T.shipCaravelB, "decor", "caravel");

// Palms. `base` solidity: the trunk row blocks and the crown goes to the overlay layer, so walking
// north of a palm puts the player behind its fronds.
const PALMS = [
  [16, 14, T.palmA],
  [20, 22, T.palmB],
  [34, 15, T.palmC],
  [42, 16, T.palmD],
  [25, 26, T.palmA],
  [19, 29, T.palmB],
  [48, 18, T.palmC],
  [11, 21, T.palmD],
  [37, 6, T.palmA],
  [31, 24, T.palmB],
  [8, 17, T.palmC],
  [27, 30, T.palmD],
  [39, 27, T.palmA],
  [14, 25, T.palmB],
];
// Snapped inland: a palm's collision rect is its trunk, and a trunk standing in the sea is a rect
// the player collides with in open water. Two of these coordinates fell outside the land mask
// after the Phase 52 rescale.
for (const [col, row, variant] of PALMS) {
  const height = variant.h ?? 1;
  const [c, r] = snapTo(
    col,
    row,
    (cc, rr) =>
      // The trunk row is what carries the rect, so that is the row that has to be ashore — an
      // anchor on land with its trunk in the surf is exactly how two of these ended up as
      // collision boxes standing in open water.
      isCaribbeanLand(cc + 0.5, rr + height - 0.5, -0.4) && !map.occupied(cc, rr),
    4
  );
  map.stamp(c, r, variant, "base", "palm");
}

// One boulder pile as large natural cover on the south spit.
map.stamp(23, 30, T.boulderPile, "solid", "boulders");

// --- spurs: every door reaches the track network ------------------------------------------------
// Run after every `solid` and `base` stamp: the router treats anything already occupied as
// impassable, so routing earlier would thread a track under a palm trunk whose collision rect then
// blocks the very track it painted.
//
// `isLand` is padded inward by 1.2 — the same inset the ground loop uses to decide where grass ends
// and the beach ring begins — so a track stays inland rather than running a dirt lane out across the
// beach. Until Phase 58 the road material *was* the beach's own sand, and a track that strayed onto
// the ring simply vanished into it.
const spurs = connectAll(roads, { doors, isLand: (x, y) => isCaribbeanLand(x, y, -1.2) });

// --- decor: transparent props, no collision ----------------------------------------------------
// This is the replacement for the terrain-quadrant "accents" the previous revision scattered onto
// the ground layer. A prop sits on top of the sand or grass; a swapped ground tile replaces it,
// which is why the old map showed tan squares in green grass and logs cut off at a tile edge.

const ROAD_GIDS = blockGids(map, T[palette.road]);
const BEACH_DEBRIS = [T.shellConch, T.shellScallop, T.scatterPebble];
const REEF = [T.coralBranch, T.coralSoft, T.coralFan, T.seaweed];
const SCRUB = [
  T.scatterBoulder,
  T.scatterRock,
  T.scatterPebble,
  T.scatterFern,
  T.scatterBush,
  T.scatterShrub,
  T.scatterGrass,
  T.scatterPlant,
];

for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    if (map.occupied(col, row)) continue; // never bury a building or prop
    const cx = col + 0.5;
    const cy = row + 0.5;

    if (isCaribbeanLand(cx, cy, -1.6)) {
      // Keep scrub off the tracks. This was `col >= 27 && col <= 30` — a hardcoded band around the
      // one hand-written path, which no longer describes where the roads are now that they are
      // generated. Testing the painted gid instead can't go stale, and it now tests the *road*
      // material rather than sand: those were the same tile until Phase 58, which meant this line
      // also had to be read as "and don't put scrub on the beach".
      if (ROAD_GIDS.has(map.ground[map.index(col, row)])) continue;
      if (hash01(col, row, 11) >= 0.075) continue;
      map.stamp(col, row, pick(SCRUB, col, row, 12), "decor", "scrub");
    } else if (isCaribbeanLand(cx, cy, 0)) {
      // Beach ring: sparse shells and pebbles, plus the occasional driftwood log.
      const roll = hash01(col, row, 13);
      if (roll < 0.02 && !map.occupied(col + 1, row)) {
        map.stamp(col, row, T.driftwood, "decor", "driftwood");
      } else if (roll < 0.09) {
        map.stamp(col, row, pick(BEACH_DEBRIS, col, row, 14), "decor", "beach debris");
      }
    } else if (isCaribbeanLand(cx, cy, 1.2)) {
      // The reef sits in the shallow band. These are transparent cut-outs, so the turquoise water
      // reads through them — the old full-bleed coral tile showed as a flat square of a visibly
      // different blue sitting in the middle of the water.
      if (hash01(col, row, 15) < 0.22) {
        map.stamp(col, row, pick(REEF, col, row, 16), "decor", "reef");
      }
    }
  }
}

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("CARIBBEAN_FIELD_BLOCKS", "scripts/generate-caribbean-tmj.js", {
    isLand: isCaribbeanLand,
    doors,
    roads: roads.cells,
  })
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
console.log(`  ${spurs.connected}/${doors.length} doors connected to the track network`);
if (spurs.unreachable.length > 0) {
  // Hard failure, not a warning. A building with no path to it is the exact defect this pipeline
  // exists to prevent, and a warning in a build nobody watches is how it would come back.
  throw new Error(
    `no route to the road network from: ${JSON.stringify(spurs.unreachable)} - either the door is ` +
      `walled in by neighbouring stamps, or the trunk does not reach that part of the map`
  );
}
