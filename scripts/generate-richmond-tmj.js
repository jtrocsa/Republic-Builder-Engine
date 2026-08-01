// Generates apps/web/src/content/maps/richmond-field.tmj and its collision module for Unit 5's
// field map ("The Fractured Republic") — Richmond, Virginia, 1864.
//
// Run with: node scripts/generate-richmond-tmj.js
//
// Which tile is which building comes from
// apps/web/src/content/tilesets/maps/richmond-field.palette.js. Layering, terrain-block tiling and
// collision come from scripts/lib/map-builder.js. This script owns layout, the bluff, the canal and
// the river.
//
// Building anchors are load-bearing: UNIT5_FIELD_NPCS and UNIT5_FIELD_SOURCE_POINTS in
// apps/web/src/main.js place people and readable sources relative to them — the ironworker at the
// mill's door, the price board's record on the board itself — so a building may be resized but not
// moved without checking those.
//
// The shape of the city, and why:
//
//   rows  0-3    the north margin: a tree line west, the City Edge works and the checkpoint east
//   rows  4-7    the upper city's first range of buildings
//   rows  8-9    BROAD STREET, cols 3-53
//   rows 10-11   the second range
//   rows 12-13   FRANKLIN STREET, cols 3-53
//   rows 14-15   the third range, backing onto the bluff
//   row  16      the bluff crest — a walk along the top of the drop
//   row  17      THE BLUFF, a run of retaining wall broken only at cols 22-23 and 40-41
//   rows 18-21   TREDEGAR (west) and SHOCKOE BOTTOM (east)
//   rows 22-23   LOWER STREET, cols 4-51
//   rows 24-26   the warehouse range and the yards behind it
//   row  27      the canal's north coping
//   rows 28-29   THE JAMES RIVER AND KANAWHA CANAL
//   rows 30-32   THE RICHMOND DOCK — quay, cranes, cargo
//   rows 33-35   THE JAMES, and the falls
//
// Richmond's own terrain does the design work, which is the reason this map is laid out by height
// rather than by district. The city stands on a bluff over a river at its fall line, and the two
// halves of it — the government on the hill, the industry and the trade in the bottom — are
// genuinely separated by a drop that people had to walk around. So the bluff is a **collision run,
// not a terrain feature**: a continuous line of solid retaining wall along row 17 with exactly two
// gaps in it, which is what turns a drawn cliff into a real constraint. Everything else follows.
// The only ways over the water are Mayo's Bridge on the 14th Street line and two canal footbridges,
// and all five crossings are spatial, not gated: nothing on this map checks progress.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/richmond-field.palette.js";
import { MapBuilder, hash01, pick } from "./lib/map-builder.js";
import { RoadNetwork, blockGids, connectAll, doorCellOf } from "./lib/paths.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/richmond-field.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/richmond-field.blocks.js");

const WIDTH = 56;
const HEIGHT = 36;

// --- must stay in lockstep with apps/web/src/main.js's isRichmondLand() ---
// Deliberately duplicated rather than imported (decision log 0036): main.js is a browser bundle
// entry, and the one thing that must never silently diverge is the bank the player collides with
// versus the bank that got painted.
//
// Two bodies of water, three ways over them. The canal is a cut channel and does not move; the
// James has a bank that does, so it is drawn from a single slow sine rather than a straight edge —
// the river bulges north into the middle of the map, which is where Mayo's Bridge crosses it and
// where the dock is narrowest.
const CANAL_TOP = 27.9;
const CANAL_BOTTOM = 29.9;
function jamesWaterline(x) {
  return 33.4 - Math.sin((x - 4) * 0.075) * 0.8;
}
function isRichmondLand(x, y) {
  if (x < 2.0 || x > 54.0 || y < 1.5 || y > 34.5) return false;
  // Mayo's Bridge, on the 14th Street line: the road south out of the city, and the only thing that
  // crosses the James. It carries the canal and the dock on its way there, so it is tested first.
  // 2.3 tiles of land against footBoxFor()'s 0.68-tile foot leaves a 1.62-tile lane, which is single
  // file and is meant to be — the same width Canal Crossroads settled on for its two crossings.
  const onMayosBridge = x > 30.85 && x < 33.15;
  if (y > jamesWaterline(x)) return onMayosBridge;
  if (y > CANAL_TOP && y < CANAL_BOTTOM) {
    return onMayosBridge || (x > 13.85 && x < 16.15) || (x > 35.85 && x < 38.15);
  }
  return true;
}

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

// The bluff. Row 17 is a solid line of retaining wall; rows 18 and below are the bottom. That single
// row is what makes the two halves of the city read as two halves rather than as one long street
// plan, and the two gaps in it are the whole traffic design of the map.
const BLUFF_ROW = 17;
const BLUFF_GAPS = [
  [22, 23],
  [40, 41],
];
const inBluffGap = (col) => BLUFF_GAPS.some(([a, b]) => col >= a && col <= b);

// The made surfaces, as inclusive [col1, row1, col2, row2] rectangles. Everything here is paved in
// the ground pass and folded into the road network below, so a door opening onto one of them needs
// no spur at all — which is why almost every building's stamp row was chosen against this list
// rather than against what looked right.
const STREET_RECTS = [
  [3, 8, 53, 9], // BROAD STREET — the upper city's spine
  [3, 12, 53, 13], // FRANKLIN STREET — the second range's frontage
  [4, 22, 51, 23], // LOWER STREET — the warehouse and works spine
  [22, 10, 23, 22], // the west bluff descent, Capitol to Tredegar
  [40, 10, 41, 22], // the east bluff descent, depot to Shockoe
  [4, 30, 50, 32], // the Richmond Dock's quay
  [31, 24, 32, 32], // Mayo's Bridge and its causeway across the dock
  [14, 24, 15, 30], // the west canal footbridge
  [36, 24, 37, 30], // the east canal footbridge
  [43, 3, 44, 8], // the checkpoint road, north off Broad Street to the works
  [30, 19, 31, 21], // the paved yard beside the counting room — see the note at its stamp
];
const onStreet = (col, row) =>
  STREET_RECTS.some(([c1, r1, c2, r2]) => col >= c1 && col <= c2 && row >= r1 && row <= r2);
/** The columns a crossing occupies. Nothing that lines a bank may run across one of these. */
const onCrossing = (col) =>
  (col >= 14 && col <= 15) || (col >= 31 && col <= 32) || (col >= 36 && col <= 37);

// --- ground ---------------------------------------------------------------------------------------
// Three surfaces above the bluff and below it, and the change at row 17 is deliberate: the upper
// city's open ground is grass (Capitol Square was a public park, and the churchyards and the
// hospital hill were green), the bottom's is a sandy working lot. Nothing below the wall is green,
// which is what makes the drop read at a glance without drawing a single cliff tile.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    const cx = col + 0.5;
    const cy = row + 0.5;
    let block;
    if (cy > jamesWaterline(cx)) {
      block = T.water;
    } else if (cy > CANAL_TOP && cy < CANAL_BOTTOM) {
      block = T.waterCanal;
    } else if (onStreet(col, row)) {
      block = T.cobble;
    } else if (row >= BLUFF_ROW) {
      block = T.lot;
    } else {
      block = T.grass;
    }
    map.groundBlock(col, row, block);
  }
}

// The falls of the James, painted onto the ground rather than stamped over it — see the palette's
// note on `fallsReach`. Three repeats of one 2x8 strip, laid end to end across the west of the
// river, because that is where the fall line is: the head of navigation is upstream and everything
// below it is the tidewater the ships came up. The seam at col 26 is the fall line itself.
// Twice over, at rows 33 and 35, so the reach runs off the bottom edge instead of leaving a band of
// smooth deep water under it. `groundRect` clips row 36 away on its own.
for (const col of [2, 10, 18]) {
  map.groundRect(col, 33, T.fallsReach);
  map.groundRect(col, 35, T.fallsReach);
}

// Ground the road network may cross but must never repaint. The paving is here so a packed-earth
// spur joins a street rather than punching a brown rectangle through the stone; the two waters are
// here because three of this map's trunk runs cross the canal or the river, and a road that paints
// itself over the channel lays a strip of earth across it before the bridge is even drawn.
const HARDER_GIDS = new Set([
  ...blockGids(map, T.cobble),
  ...blockGids(map, T.water),
  ...blockGids(map, T.waterCanal),
]);

// --- the road network's authored trunk --------------------------------------------------------------
// `palette.road` is a list on this map (packed earth, paving, plank decking); its first entry is what
// new road gets painted in, and the paving is `harder`, so a spur meeting a street joins it rather
// than punching a brown rectangle through the stone.
const [SPUR_MATERIAL] = palette.road;
const roads = new RoadNetwork(map, T[SPUR_MATERIAL], { harder: HARDER_GIDS });
for (const [c1, r1, c2, r2] of STREET_RECTS) roads.run(c1, r1, c2, r2);
// Mayo's Bridge continues over the river after the quay ends. Nothing down there has a door, but the
// deck is road material, and a bridge whose last two spans are not in the network would read to
// tests/unit/map-path-network.test.js as a second, unreachable road component.
for (const col of [31, 32]) {
  for (let row = 33; row < HEIGHT; row += 1) roads.cells.add(roads.key(col, row));
}

// --- the crossings ------------------------------------------------------------------------------------
// Stamped `decor` on the structures layer, NOT painted onto the ground, and that is the opposite of
// what Canal Crossroads does with its plank bridge. Its decking is opaque plank over that pack's own
// blue, so on the ground it replaces the water and the seam disappears. This pack's pier decking is
// 30% transparent — it is a platform on pilings drawn as a cut-out, with alpha above and below it —
// so on the ground it would punch thirty per cent of a hole straight through to the page along every
// crossing. tests/unit/map-tile-integrity.test.js caught it, which is the second time that
// assertion has paid for itself on this map.
//
// On structures the transparency shows the canal underneath, which is what you actually see at the
// edge of a bridge deck. `decor` because a bridge you cannot walk on is not a bridge; the land mask
// already says these columns are land.
map.stamp(14, 28, T.plankDeck, "decor", "canal footbridge"); // the west footbridge
map.stamp(36, 28, T.plankDeck, "decor", "canal footbridge"); // the east footbridge
map.stamp(31, 28, T.plankDeck, "decor", "Mayo's Bridge"); // over the canal
map.stamp(31, 33, T.plankDeck, "decor", "Mayo's Bridge"); // ...and over the James, in two spans
map.stamp(31, 35, T.plankDeck, "decor", "Mayo's Bridge");

// --- the banks: stone coping, and what grows out of it ------------------------------------------------
// A canal edge with nothing on it reads as a swimming pool, so a fifth of each bank cell is reeds
// instead of masonry. Both are `decorBlock`/`decor` and carry no collision: this is a drawn edge, not
// a wall, and the quay's north row has to stay walkable.
for (let col = 2; col <= WIDTH - 3; col += 1) {
  if (onCrossing(col)) continue;
  for (const row of [27, 30]) {
    if (map.occupied(col, row)) continue;
    if (hash01(col, row, 11) < 0.2) {
      map.stamp(col, row, pick([T.cattails, T.reeds], col, row, 12), "decor", "bank planting");
    } else {
      map.decorBlock(col, row, T.ashlarWall);
    }
  }
}

// --- the bluff ------------------------------------------------------------------------------------------
// The one thing on this map that is collision first and art second. Laid in 4-wide segments so the
// ashlar's own pilaster spacing carries along the run, and broken at exactly the two descents.
for (const start of [2, 6, 10, 14, 18, 24, 28, 32, 36, 42, 46, 50]) {
  if (inBluffGap(start) || inBluffGap(start + 3)) continue;
  map.stamp(start, BLUFF_ROW, T.ashlarWall, "solid", "bluff retaining wall");
}
// A flight of steps in each gap, `decor` so it is art rather than an obstacle: the descent has to
// stay walkable, and a solid stamp in a 2-tile gap would seal the only two ways down.
map.stamp(22, 18, T.stoneSteps, "decor", "bluff steps");
map.stamp(40, 18, T.stoneSteps, "decor", "bluff steps");

// --- buildings ---------------------------------------------------------------------------------------
// Every stamp declares what it is and its collision rect falls out of that. `solid` blocks the whole
// footprint. Each is collected as a door: `doorCellOf()` reads the cell below the centre of the
// stamp's ground-contact row, so the spur the router paints starts where a person would step out.
const doors = [];
const withDoor = (col, row, entry, label) =>
  doors.push(doorCellOf(map.stamp(col, row, entry, "solid", label)));

// A building whose ground-contact row sits one above a trunk street opens straight onto it and gets
// no spur at all, which is why every row below is 6-7, 10, 14, 18-20 or 24 rather than wherever
// looked good. The five ranges are the five bands between this map's five streets.

// --- the upper city, first range (doors on Broad Street) ---
// Market & Civilian, cols 3-19.
withDoor(3, 6, T.townhouseBrick, "dwelling");
withDoor(6, 4, T.church, "church");
withDoor(9, 6, T.terraceBrick, "boardinghouse terrace");
withDoor(14, 6, T.storeAwning, "provision dealer");
withDoor(17, 6, T.provisionStore, "grocer");
// Capitol & Government, cols 20-37.
withDoor(20, 6, T.officeStone, "War Department office");
withDoor(24, 4, T.capitol, "the Capitol");
withDoor(29, 6, T.officeBrick, "provost marshal's office");
withDoor(32, 6, T.mansionStone, "requisitioned house");
withDoor(35, 6, T.chapel, "chapel");
// Hospital and government stores, cols 38-53. The rail depot is NOT up here — see the palette's note
// on the locomotive; it is in the bottom, where Richmond's depots were.
withDoor(38, 4, T.hospitalWard, "a Chimborazo ward");
withDoor(46, 6, T.depotOffice, "surgeon's quarters");
withDoor(49, 5, T.warehouse, "commissary store");

// --- second range (doors on Franklin Street) ---
withDoor(3, 10, T.terraceLong, "terrace housing");
withDoor(8, 10, T.townhouseBrick, "dwelling");
withDoor(12, 10, T.commercialTerrace, "market row");
withDoor(18, 10, T.shopFront, "barber's shop");
withDoor(25, 10, T.officeBrick, "government office");
withDoor(28, 10, T.terraceBrick, "terrace housing");
withDoor(34, 10, T.townhouseBrickAlt, "dwelling");
withDoor(37, 10, T.chapel, "chapel");
withDoor(43, 10, T.terraceLong, "terrace housing");
withDoor(48, 10, T.townhouseBrick, "dwelling");
withDoor(51, 10, T.depotOffice, "railroad office");

// --- third range, backing onto the bluff (doors on the crest, row 16) ---
withDoor(4, 14, T.terraceLong, "terrace housing");
withDoor(9, 14, T.townhouseBrickAlt, "dwelling");
withDoor(13, 14, T.terraceBrick, "boardinghouse terrace");
withDoor(19, 14, T.provisionStore, "grocer");
withDoor(25, 14, T.officeStone, "clothing bureau");
withDoor(28, 14, T.commercialTerrace, "commercial row");
withDoor(34, 14, T.townhouseBrick, "dwelling");
withDoor(37, 14, T.shopFront, "shopfront");
withDoor(43, 14, T.terraceBrick, "terrace housing");
withDoor(49, 14, T.townhouseBrickAlt, "dwelling");

// --- the bottom, first range (doors on Lower Street) ---
// Tredegar Iron Works, cols 2-21. Three big sheds, a stack and an office at the gate — the largest
// roofs on the map, and the reason the Confederacy held this city: Tredegar was the only works in
// the South that could cast heavy ordnance.
withDoor(3, 19, T.warehouse, "Tredegar rolling mill");
withDoor(7, 19, T.grainStore, "Tredegar ordnance shop");
withDoor(14, 19, T.warehouse, "foundry shed");
withDoor(18, 20, T.officeBrick, "works office");
// The furnace is not entered, so it registers no door — a chimney with a spur painted to it would be
// a lane to nowhere.
map.stamp(11, 19, T.furnaceStack, "solid", "furnace and stack");
map.stamp(17, 18, T.plankStack, "solid", "bar iron");
// Shockoe Bottom, cols 24-53. Read the register note in the decision log before adding anything
// here: a slave-trading district looked exactly like a commercial one, because it was one, and
// nothing on this map is allowed to be theatrical about that.
withDoor(24, 20, T.warehouseArch, "tobacco warehouse");
withDoor(27, 19, T.grainStore, "commission merchant's store");
withDoor(32, 20, T.countingRoom, "trader's counting room");
withDoor(35, 19, T.warehouse, "grain warehouse");
withDoor(43, 19, T.grainStore, "government warehouse");
withDoor(47, 20, T.warehouseArch, "tobacco warehouse");
withDoor(50, 20, T.commercialTerrace, "Cary Street row");
// The Virginia Central's engine, standing at the foot of the east descent. See the palette's note
// on why the depot is down here and not up on the hospital hill.
map.stamp(38, 20, T.locomotive, "solid", "depot locomotive");

// --- the bottom, second range (doors on the yards, row 26) ---
withDoor(5, 24, T.warehouseArch, "iron shed");
withDoor(9, 24, T.commercialTerrace, "works offices");
withDoor(17, 24, T.warehouseArch, "canal warehouse");
withDoor(21, 24, T.commercialTerrace, "dock row");
withDoor(27, 24, T.warehouseArch, "canal warehouse");
withDoor(33, 24, T.townhouseBrickAlt, "toll house");
withDoor(39, 24, T.commercialTerrace, "dock row");
withDoor(44, 24, T.warehouseArch, "canal warehouse");
withDoor(48, 24, T.townhouseBrick, "basin office");

// --- the City Edge, and the checkpoint on the road out ---------------------------------------------
// An edge treatment, not a seventh quarter. Richmond's real defensive lines were miles out from the
// city; what a Chronicler would actually meet is the last picket on the road, which is this.
withDoor(43, 1, T.checkpointHut, "picket post");
// The abatis and the wagon are flush against row 1, which is the first row the land mask lets anyone
// stand on. That is deliberate: an earthwork with walkable ground behind it is not an earthwork, and
// the first run of this generator left two slivers of sealed grass back there for exactly that
// reason. Everything in front of the line stays reachable — you can walk up to the works, and that
// is the whole point of putting them where a Chronicler would meet them.
const CITY_EDGE = [
  [45, 1, T.abatis, "solid", "abatis"],
  [48, 1, T.supplyWagon, "solid", "army wagon"],
  [50, 1, T.abatis, "solid", "abatis"],
  [45, 3, T.rampart, "solid", "earthwork"],
  [50, 3, T.rampart, "solid", "earthwork"],
  [52, 5, T.fieldGun, "solid", "field gun"],
  // Across the road itself, and `decor` on purpose: the bar is a thing you are stopped at and talk
  // your way past, not a wall. A solid stamp here would make the checkpoint a dead end.
  [42, 3, T.chainPosts, "decor", "checkpoint bar"],
];
for (const [col, row, entry, solidity, label] of CITY_EDGE) {
  map.stamp(col, row, entry, solidity, label);
}

// --- source anchors: the object a record actually sits on ---------------------------------------------
// The market's price board carries this map's one object-anchored record. Its whole design is that
// no single person speaks for it: a price written over three times in a month, a ration notice, a
// call for substitutes and a list of deserters, all pasted up in the same week. Its x/y in
// UNIT5_FIELD_SOURCE_POINTS sits on this stamp's front edge — these two move together or not at all.
map.stamp(16, 6, T.noticeBoard, "solid", "market price board");
// The second board is Capitol Square's, and carries no record: it is what the government posts, so
// having it argue with the market board across half a mile of city is the point.
map.stamp(28, 6, T.noticeBoard, "solid", "Capitol Square notice board");

// --- the yards, the square, and the street ---------------------------------------------------------
// The paved yard beside the counting room is stamped as nothing at all, deliberately. It is a walled
// yard with a chain across it and no props in it, and it is more accurate and far more sober than
// any block or platform would be — what the trade looked like from the street was a locked gate.
const FURNITURE = [
  [30, 21, T.chainPosts, "decor", "yard chain"],
  [30, 19, T.chainPosts, "decor", "yard chain"],
  [27, 2, T.fountain, "solid", "Capitol Square fountain"],
  [10, 2, T.townWell, "solid", "public well"],
  // Refugee families in the churchyard. The government issued tents to people burnt out or driven in
  // from the counties, and the churches ran the relief; a tent in a churchyard in 1864 Richmond is
  // not an army camp, it is a housing shortage, and the two tents up at the hospital below are the
  // same object doing the other job.
  [2, 3, T.wallTent, "solid", "refugee tent"],
  [6, 2, T.wallTent, "solid", "refugee tent"],
  // The ward's overflow, up on the hill. Non-graphic by design: an empty cot outside a door.
  [33, 2, T.wallTent, "solid", "hospital tent"],
  [37, 2, T.wallTent, "solid", "hospital tent"],
  [36, 2, T.hospitalCot, "solid", "hospital cot"],
  [13, 3, T.marketBarrow, "decor", "market barrow"],
  [26, 2, T.bench, "decor", "bench"],
  [30, 2, T.benchAlt, "decor", "bench"],
  [19, 8, T.signpost, "decor", "signpost"],
  [45, 12, T.signpost, "decor", "signpost"],
  [24, 12, T.lampPost, "base", "lamp post"],
  [39, 12, T.lampPost, "base", "lamp post"],
  [24, 22, T.lampPost, "base", "lamp post"],
  [39, 22, T.lampPost, "base", "lamp post"],
];
for (const [col, row, entry, solidity, label] of FURNITURE) {
  map.stamp(col, row, entry, solidity, label);
}

// --- Tredegar's yard, and the dock's ------------------------------------------------------------------
// Bar iron out of the mill, guns out of the ordnance shop, and freight moving through both. This is
// where the map says what the works is for without a line of dialogue.
const YARD = [
  [2, 24, T.fieldGun, "solid", "finished gun"],
  [7, 25, T.plankStack, "solid", "bar iron"],
  [19, 24, T.crate, "solid", "ordnance crate"],
  [20, 25, T.crateAlt, "solid", "ordnance crate"],
  [25, 25, T.barrel, "solid", "barrel"],
  [30, 25, T.freightWagon, "decor", "freight wagon"],
  [42, 21, T.handCart, "decor", "hand cart"],
  [46, 26, T.sackPile, "solid", "commissary sacks"],
  [24, 26, T.crate, "solid", "crate"],
  [35, 26, T.barrelAlt, "solid", "barrel"],
  [50, 12, T.draughtHorse, "decor", "dray horse"],
  [10, 22, T.freightWagon, "decor", "freight wagon"],
];
for (const [col, row, entry, solidity, label] of YARD) {
  map.stamp(col, row, entry, solidity, label);
}

// The dock's two rows have a job each, and holding to that is what keeps the wharf legible: rows
// 30-31 are where people stand and walk, row 32 at the river's edge is where the cargo and the
// mooring gear sit. UNIT5_FIELD_NPCS routes the dock labourer along row 31 on exactly this
// understanding.
map.stamp(12, 31, T.dockCrane, "solid", "loading derrick");
map.stamp(40, 31, T.dockCrane, "solid", "loading derrick");
// Moored on the canal beyond the land mask, which already stops the player, so no collision.
map.stamp(18, 28, T.cargoBarge, "decor", "canal barge");
map.stamp(42, 28, T.cargoBarge, "decor", "canal barge");
map.stamp(26, 33, T.rowboat, "decor", "skiff");

const QUAY_EDGE = [
  [6, T.bollard],
  [8, T.crate],
  [10, T.barrel],
  [16, T.grainSack],
  [18, T.bollardRoped],
  [20, T.crateAlt],
  [22, T.sackPile],
  [24, T.barrelAlt],
  [27, T.ropeCoil],
  [29, T.bollard],
  [34, T.handCart],
  [36, T.crate],
  [38, T.bollardRoped],
  [44, T.barrel],
  [46, T.grainSack],
  [48, T.bollard],
];
for (const [col, entry] of QUAY_EDGE) map.stamp(col, 32, entry, "solid", "quayside cargo");

// --- trees ---------------------------------------------------------------------------------------------
// `base` solidity: the trunk row blocks and everything above it goes to the overlay layer, so the
// player walks behind the canopy. Capitol Square was a real public park with real trees in it, and
// so was the ground the hospital stood on; nothing below the bluff gets one.
// Hand-placed rather than seeded along the north edge, which is what the other four maps do. This
// margin is the busiest in the game — a churchyard of refugee tents, a well, a market barrow, the
// square's fountain and benches, two hospital tents and a whole fortification line share three rows
// — and a deterministic scatter guarded only on the cell it starts in kept dropping four-wide oaks
// across the top of them. Eight trees placed by hand is fewer coordinates than the bugs were worth.
//
// They are all above the bluff, and that is a rule rather than an oversight: Capitol Square was a
// real public park and the hospital stood on a green hill, while the bottom was cinder, brick and
// rail. Nothing below row 17 gets a tree.
const SHADE_TREES = [
  [2, 0, T.treeOak],
  [12, 0, T.treeMaple],
  [16, 1, T.treeCherry],
  [19, 1, T.treeMaple],
  [23, 1, T.treeBirch],
  [31, 1, T.treeBirch],
  [22, 4, T.treeBirch],
];
for (const [col, row, entry] of SHADE_TREES) map.stamp(col, row, entry, "base", "shade tree");

// --- low scatter on the grassy fringes only -------------------------------------------------------------
// Never on a street, a yard or the quay, where planting would read as litter. Grass only means the
// upper city only, which is the point.
const BUSHES = [T.bushRose, T.bushFlowering];
const GRASS_GIDS = blockGids(map, T.grass);
for (let row = 0; row < HEIGHT; row += 1) {
  // Nothing is planted on the bluff crest. It is one tile of walkable ground between the third
  // range's back walls and the retaining wall, and a bush there is two tiles of wall: the first run
  // of this generator dropped two of them either side of col 28 and sealed four doors' worth of
  // crest into a pocket the router could not leave. A corridor that narrow has no margin for
  // decoration, which is also true of it in play.
  if (row === BLUFF_ROW - 1) continue;
  for (let col = 0; col < WIDTH; col += 1) {
    if (map.occupied(col, row) || map.occupied(col + 1, row)) continue; // bushes are 2 wide
    if (!isRichmondLand(col + 0.5, row + 0.5)) continue;
    if (!GRASS_GIDS.has(map.ground[map.index(col, row)])) continue;
    if (hash01(col, row, 4) >= 0.05) continue;
    map.stamp(col, row, pick(BUSHES, col, row, 5), "decor", "planting");
  }
}

// --- spurs: every door reaches the street network ---------------------------------------------------------
// Run last of all the ground work, after every `solid`, `base` and `decor` stamp: the router treats
// anything already occupied as impassable, so routing earlier would thread a lane under a tree trunk
// whose collision rect then blocks the very lane it painted.
const spurs = connectAll(roads, { doors, isLand: isRichmondLand });

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("RICHMOND_FIELD_BLOCKS", "scripts/generate-richmond-tmj.js", {
    doors,
    roads: roads.cells,
  })
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
console.log(`  ${spurs.connected}/${doors.length} doors connected to the street network`);
if (spurs.unreachable.length > 0) {
  // Hard failure, not a warning. A building with no path to it is the exact defect this pipeline
  // exists to prevent, and a warning in a build nobody watches is how it would come back.
  throw new Error(
    `no route to the road network from: ${JSON.stringify(spurs.unreachable)} - either the door is ` +
      `walled in by neighbouring stamps, or the trunk does not reach that part of the map`
  );
}
