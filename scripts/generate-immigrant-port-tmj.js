// Generates apps/web/src/content/maps/immigrant-port-field.tmj and its collision module for
// case-019 ("Admitted, Detained, Excluded" — Ellis Island, New York Harbor, 17 April 1907).
//
// Run with: node scripts/generate-immigrant-port-tmj.js
//
// Which tile is water, paving or brick comes from
// apps/web/src/content/tilesets/maps/immigrant-port-field.palette.js. Layering, terrain-block
// tiling and collision come from scripts/lib/map-builder.js. This script owns layout and the land
// mask.
//
// Building anchors are load-bearing: UNIT7_FIELD_NPCS and UNIT7_FIELD_SOURCE_POINTS in
// apps/web/src/main.js place people and readable records relative to them, and
// FIELD_MAPS["unit-07"].interiors will place two doorsteps against the two door cells this file
// derives. A building may be resized but not moved without checking those.
// tests/unit/field-map-coordinates.test.js holds the two together.
//
// ── The layout argument ─────────────────────────────────────────────────────────────────────────
// THE-MAP-PROGRAM.md §5 asks for "a threshold place: dense, vertical, institutional, and organised
// entirely around sorting people." So the map is drawn as one movement with one obstruction in it:
//
//   THE BUILDING   the whole north edge, wall to wall. A red-brick frontage of repeating bays with
//                  a pale stone entrance pavilion in the middle of it, and two doors — the one
//                  everybody goes through, and one twelve bays east into the inquiry wing.
//   THE FORECOURT  paved, lamped, benched. The side of the rail the money was spent on.
//   THE RAIL       one line of wrought iron across the whole wharf, with one gate in it.
//   THE WHARF      gravel, working plant, baggage, and the people waiting to be let through.
//   THE WATER      the Upper Bay, and two timber finger piers: the barge landing on the west, the
//                  ferry slip on the east.
//
// **Cottonwood Junction's line was a division you could walk across and this one is not**, and the
// inversion is deliberate — a unit should no more repeat its neighbour's composition than its
// neighbour's engines. The track at the railhead was drawn walkable on purpose, because a map that
// fenced its own argument off would teach that the separation was natural. Here the separation
// *is* the argument: it was built, it is four feet of iron on a stone plinth, and it has exactly
// one opening.
//
// The rail costs the player nothing — the gate is in the middle of it, two tiles wide, on the
// pavilion's own columns — and it costs the people on the map everything. The man waiting for his
// cousin stands on the north side of it because he came off the ferry and is nobody's business;
// she is somewhere in the crowd on the south side and cannot leave the line. They can talk. That
// is all they can do, and it is what this map is for.
//
// ── What is not drawn ───────────────────────────────────────────────────────────────────────────
// **No vessel.** Eleven thousand seven hundred and forty-seven people came off the barges here in
// one day, which means the barges were shuttling continuously and the slip is empty between them.
// The library's only flat-decked harbour craft is Steampunk's cargo barge, at two tiles by four —
// about four people long, which is absurd for a boat that carried five hundred. An empty landing
// stage with its posts and its ropes is both truer and better: the thing that brought you has
// gone, and the only way off this island is through that door.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/immigrant-port-field.palette.js";
import { MapBuilder, hash01, pick } from "./lib/map-builder.js";
import { RoadNetwork, connectAll, doorCellOf } from "./lib/paths.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/immigrant-port-field.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/immigrant-port-field.blocks.js");

const WIDTH = 56;
const HEIGHT = 36;

// The three lines everything on this map is placed against, so they are constants rather than
// literals repeated down the file.
const FRONT_ROW = 3; // the building's ground-contact row; its doors open onto row 4
// The frontage's own north limit, and the mask's. The wings are two rows deep with their bases on
// FRONT_ROW, so the strip above their roofline is real ground with no collision on it and no way in:
// a 1266-cell pocket, which is what field-map-coordinates.test.js reported the first time it ran.
// Cutting the mask here closes it without moving a stamp — every rect on the frontage still has its
// centre on land, which is the other assertion in that file this has to satisfy.
const FRONTAGE_ROW = 1.8;
const RAIL_ROW = 15; // the rail's plinth; its ironwork is drawn on row 14
const QUAY_ROW = 28; // the water's edge, and the row the coping is laid along

// --- must stay in lockstep with apps/web/src/main.js's isImmigrantPortLand() ---
// Deliberately duplicated rather than imported (decision log 0036): main.js is a browser bundle
// entry, and the one thing that must never silently diverge is the water the player collides with
// versus the water that got painted.
//
// The island is a made rectangle behind a seawall, and the only shape in the mask is the two
// finger piers reaching south into the basin. Their columns are on the coping's own four-tile
// grid so that skipping two coping stamps leaves exactly the two openings the piers need.
const PIERS = [
  { col1: 12, col2: 15 }, // the barge landing — where the player arrives
  { col1: 36, col2: 39 }, // the ferry slip — the way to Manhattan, for the admitted
];
const PIER_END = 33.0;
function onPier(x, y) {
  if (y > PIER_END) return false;
  return PIERS.some((pier) => x >= pier.col1 && x <= pier.col2 + 1);
}
function isImmigrantPortLand(x, y) {
  if (x < 4.0 || x > 51.5 || y < FRONTAGE_ROW) return false;
  if (y > QUAY_ROW) return onPier(x, y);
  return true;
}

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

// --- ground -------------------------------------------------------------------------------------
// Two surfaces and a bay. Cobble is the island — fill dumped behind a seawall and paved the way
// any working quay was — and the cut-stone route is laid on top of it further down, by the road
// network. The out-of-bounds margin at either side is cobbled too, so the frame is the building
// and the water rather than a visible edge of nothing.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    const cy = row + 0.5;
    if (cy <= QUAY_ROW) {
      map.groundBlock(col, row, T.cobble);
    } else {
      // Inshore water for the first two rows and around the piers, open bay beyond it. The step is
      // what stops the basin reading as a flat blue rectangle pasted under the quay.
      const inshore = row <= QUAY_ROW + 2 || onPier(col + 0.5, cy);
      map.groundBlock(col, row, inshore ? T.waterShallow : T.water);
    }
  }
}

// The two landing stages, painted onto the GROUND in place of the water rather than stamped over
// it — see note 4 in the palette header for the two jetty sprites that look like the obvious
// answer and are not. Plank decking is a full-bleed floor texture, so a stage can be any size, and
// on the ground layer it is opaque, which is what stops the bay showing through the boards.
for (const pier of PIERS) {
  for (let row = QUAY_ROW; row <= PIER_END; row += 1) {
    for (let col = pier.col1; col <= pier.col2; col += 1) map.groundBlock(col, row, T.pierDeck);
  }
}

// --- the route ------------------------------------------------------------------------------------
// Eight deliberate runs, and together they are the procedure: off the landing stage, east across
// the wharf, north through the one gate, up the forecourt to the doors — with a branch east to the
// inquiry wing and a branch back down to the ferry slip, which are the two ways this ends. Every
// other paved cell on the map is a spur the router laid from a door, at the bottom of this file.
const roads = new RoadNetwork(map, T[palette.road[0]]);
roads.run(13, 22, 14, 27); // up from the barge landing
roads.run(13, 22, 27, 23); // east across the wharf to the gate lane
roads.run(26, 16, 27, 23); // the gate lane, north to the rail
roads.run(26, 14, 27, 15); // through the gate itself
roads.run(26, 5, 27, 13); // the forecourt walk, up to the pavilion door
roads.run(28, 7, 38, 8); // the branch east to the inquiry wing
roads.run(28, 22, 46, 23); // east across the wharf, past the line's booth
roads.run(37, 23, 38, 27); // down to the ferry slip

// --- structures ---------------------------------------------------------------------------------
// Every stamp declares what it is and its collision rect falls out of that. `solid` blocks the
// whole footprint, `base` blocks the ground-contact row and lifts the rest to the overlay layer so
// the player walks behind it, `decor` blocks nothing.
//
// Each building that people go into is collected as a door: `doorCellOf()` reads the cell below
// the centre of the stamp's ground-contact row, so the spur the router paints starts where a
// person would step out.
const doors = [];
const withDoor = (col, row, entry, label) =>
  doors.push(doorCellOf(map.stamp(col, row, entry, "solid", label)));

// --- the Main Building ----------------------------------------------------------------------------
// Wall to wall — edge to edge of the .tmj, not merely of the walkable rectangle, so the frontage
// runs off both sides of the frame and there is no visible end to it. The wings are
// two four-wide brick runs alternated along the frontage; the pavilion is pale ashlar and two rows
// taller, which is what makes it read as the centre. Brick either side of a stone entrance block is
// what the real building is, and it is a coincidence worth recording rather than a substitution
// being excused — see note 1 in the palette header.
//
// **The pavilion is stamped first and the wings are laid around it**, because the wings tile to a
// four-column grid from col 4 and the pavilion has to land on it: 4, 8, 12, 16, 20 | 24 | 28, 32,
// 36, 40, 44, 48. Its door cell falls at col 26, which is why the gate, the gate lane and the
// forecourt walk are all on cols 26-27.
withDoor(24, FRONT_ROW - 3, T.pavilion, "reception hall");
let bay = 0;
for (const col of [0, 4, 8, 12, 16, 20, 28, 32, 36, 40, 44, 48, 52]) {
  const wing = bay % 2 === 0 ? T.wingBrick : T.wingBrickAlt;
  bay += 1;
  // The one bay of the east wing that is a way in rather than a wall. A board of special inquiry
  // sat in a room off the registry floor rather than behind its own street door, and this map's
  // door graph is flat by design — an interior is never nested (CLAUDE.md). So the hearing rooms
  // are entered from the frontage, twelve bays east of the main doors, which is where the
  // detention wing was and is as close to the truth as a flat graph can get.
  if (col === 36) {
    withDoor(col, FRONT_ROW - 1, T.wingEntrance, "inquiry wing");
    continue;
  }
  // The two bays that overhang the walkable rectangle get `decor`, not `solid`. Their footprints
  // are entirely outside the mask, so a collision rect there is unreachable by construction — and
  // tests/unit/field-map-coordinates.test.js reads an unreachable rect on non-land as a building
  // standing in the sea, which at cols 0-3 and 52-55 is exactly what it would look like. Same rule
  // Cottonwood Junction's framing cottonwoods run under.
  const inside = isImmigrantPortLand(col + (wing.w ?? 1) / 2, FRONT_ROW - 0.5);
  map.stamp(col, FRONT_ROW - 1, wing, inside ? "solid" : "decor", "reception hall wing");
}

// --- the forecourt ---------------------------------------------------------------------------------
// The side of the rail the money was spent on: cut stone underfoot, ornate standards, iron benches,
// clipped bays in tubs. Nothing here is working plant. That contrast is the whole reason the wharf
// below is gravel and crates.
// A pair of tubs either side of each door. On the pavilion they are decoration; on the inquiry
// wing they are the only thing that says a door is there at all, which is why both doors get them.
map.stamp(23, 5, T.pottedBay, "solid", "bay tree");
map.stamp(29, 5, T.pottedBayAlt, "solid", "bay tree");
map.stamp(35, 5, T.pottedBayAlt, "solid", "bay tree");
map.stamp(41, 5, T.pottedBay, "solid", "bay tree");
map.stamp(14, 5, T.planter, "solid", "planter");
map.stamp(48, 5, T.planter, "solid", "planter");
for (const [col, row] of [
  [21, 6],
  [32, 6],
  [8, 6],
  [47, 6],
  [21, 11],
  [32, 11],
  [24, 12],
  [29, 12],
]) {
  map.stamp(col, row, T.lampOrnate, "solid", "forecourt lamp");
}
// Benches in two ranks facing the walk rather than a grid filling the yard: a row against the
// frontage on each side, and a pair turned in toward the gate lane where the admitted are met.
for (const [col, row, entry] of [
  [7, 7, T.bench],
  [12, 7, T.benchAlt],
  [17, 7, T.bench],
  [43, 7, T.benchAlt],
  [48, 7, T.bench],
  [22, 12, T.benchAlt],
  [31, 12, T.bench],
  [9, 12, T.bench],
  [45, 12, T.benchAlt],
]) {
  map.stamp(col, row, entry, "solid", "forecourt bench");
}

// --- the rail -------------------------------------------------------------------------------------
// One run, wall to wall, with one two-tile gate at cols 26-27 — the pavilion's own columns, so the
// gate, the walk beyond it and the door are on one axis and a player walking north never has to
// look for the way through.
//
// `base` rather than `solid`: the plinth blocks and the ironwork above it goes to the overlay
// layer, so a body is drawn behind the rail rather than in front of it. Stamped solid it would be
// two tiles thick, which is a wall, and this is a fence.
for (let col = 4; col + 1 < WIDTH - 4; col += 2) {
  if (col === 26) continue;
  map.stamp(col, RAIL_ROW - 1, T.rail, "base", "wharf rail");
}

// --- the wharf ---------------------------------------------------------------------------------------
// Working plant, west to east: the baggage shed and the derrick at the landing end, the line's own
// booth by the ferry slip, the stores shed at the far end.
withDoor(7, 20, T.baggageShed, "baggage shed");
withDoor(46, 19, T.storesShed, "stores shed");
withDoor(41, 20, T.lineBooth, "steamship line's booth");
map.stamp(9, 26, T.dockCrane, "solid", "baggage derrick");

// Baggage, and the cargo that is not baggage. The two are stacked in different places and never
// mixed: trunks and roped bundles belong to the people standing beside them and are on the ground
// they are waiting on; crates, barrels and sacks belong to the station and are against its sheds.
// Heaped where it was put down, which is at the head of the landing stage and thinning east
// toward the gate. Baggage is the one thing on this wharf that is arranged by nobody.
for (const [col, row, entry] of [
  [10, 24, T.trunk],
  [11, 25, T.trunkAlt],
  [10, 26, T.trunkRed],
  [11, 27, T.bundleStack],
  [16, 25, T.trunkAlt],
  [17, 26, T.trunk],
  [16, 27, T.bundleStack],
  [18, 24, T.bundleStack],
  [19, 26, T.trunkRed],
  [21, 25, T.trunk],
  [22, 27, T.bundleStack],
  [24, 26, T.trunkAlt],
  [20, 20, T.bundleStack],
  [29, 25, T.trunk],
  [31, 27, T.bundleStack],
]) {
  map.stamp(col, row, entry, "solid", "passengers' baggage");
}
for (const [col, row, entry] of [
  [6, 22, T.crate],
  [9, 22, T.crateAlt],
  [10, 19, T.barrel],
  [44, 21, T.crate],
  [45, 24, T.barrel],
  [48, 22, T.grainSack],
  [43, 26, T.ropeCoil],
  [33, 27, T.ropeCoil],
]) {
  map.stamp(col, row, entry, "solid", "station stores");
}
map.stamp(31, 21, T.handCart, "solid", "hand cart");
map.stamp(19, 19, T.handCart, "solid", "hand cart");

// The wharf's own lamps — plain iron standards, deliberately not the forecourt's.
for (const [col, row] of [
  [12, 19],
  [22, 19],
  [35, 19],
  [45, 26],
  [7, 26],
]) {
  map.stamp(col, row, T.lampPost, "solid", "wharf lamp");
}

// --- the water's edge -----------------------------------------------------------------------------
// Coping along the whole quay, in four-tile pieces, with the two pier openings left out. This is
// the piece that makes the edge read as cut stone rather than as the place the tiles stop.
//
// `decor` and on structures, never on the ground: it is a wall face drawn as a cut-out with four
// clear pixel rows along its top, and on the ground layer those are a hole through to the page.
for (let col = 4; col + 3 <= 51; col += 4) {
  if (PIERS.some((pier) => pier.col1 === col)) continue;
  map.stamp(col, QUAY_ROW, T.quayCoping, "decor", "quay coping");
}
for (const [col, entry] of [
  [6, T.bollard],
  [11, T.bollardRoped],
  [17, T.bollard],
  [22, T.bollardRoped],
  [27, T.bollard],
  [32, T.bollardRoped],
  [35, T.bollard],
  [41, T.bollardRoped],
  [47, T.bollard],
]) {
  map.stamp(col, QUAY_ROW - 1, entry, "solid", "mooring bollard");
}
// The only thing on this wharf drawn in red, and it is on the quay edge where it belongs.
map.stamp(25, QUAY_ROW - 1, T.lifeRing, "decor", "life ring");
// A heavy post at the head of each landing stage, where a barge's line went.
for (const pier of PIERS) {
  map.stamp(pier.col1, QUAY_ROW + 1, T.mooringPost, "solid", "mooring post");
  map.stamp(pier.col2, QUAY_ROW + 1, T.mooringPostAlt, "solid", "mooring post");
  map.stamp(pier.col1, PIER_END - 1, T.mooringPostAlt, "solid", "mooring post");
  map.stamp(pier.col2, PIER_END - 1, T.mooringPost, "solid", "mooring post");
}

// --- spurs: every door reaches the paved route ------------------------------------------------------
// Run after every solid, base and decor stamp above: the router treats anything already occupied as
// impassable, so routing earlier would thread a spur under a stamp whose collision rect then blocks
// the very path it painted.
const spurs = connectAll(roads, { doors, isLand: isImmigrantPortLand });

// --- scatter -------------------------------------------------------------------------------------
// Almost none, and that is the finding rather than an omission. The arrival side of the island in
// 1907 is seawall, fill and paving — the lawns and the plane trees came later — so the only
// planting anywhere on this map is in tubs in the forecourt, and the only texture out on the wharf
// is the ropes and sacks a working quay leaves lying about. A scatter pass across the gravel would
// draw a park, which is the same class of error as a cactus in Kansas.
const LOOSE = [T.ropeCoil, T.grainSack];
for (let row = 17; row < QUAY_ROW; row += 1) {
  for (let col = 5; col < 51; col += 1) {
    const entry = pick(LOOSE, col, row, 6);
    if (map.occupied(col, row) || roads.has(col, row)) continue;
    if (hash01(col, row, 9) >= 0.02) continue;
    map.stamp(col, row, entry, "solid", "loose stores");
  }
}

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("IMMIGRANT_PORT_FIELD_BLOCKS", "scripts/generate-immigrant-port-tmj.js", {
    doors,
    roads: roads.cells,
  })
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
console.log(`  ${spurs.connected}/${doors.length} doors connected to the paved route`);
if (spurs.unreachable.length > 0) {
  // Hard failure, not a warning. A building with no path to it is the exact defect this pipeline
  // exists to prevent, and a warning in a build nobody watches is how it would come back.
  throw new Error(
    `no route to the paved route from: ${JSON.stringify(spurs.unreachable)} - either the door is ` +
      `walled in by neighbouring stamps, or the trunk does not reach that part of the map`
  );
}
