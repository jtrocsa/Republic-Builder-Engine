// Generates apps/web/src/content/maps/furnace-bend-field.tmj and its collision module for case-025
// ("Permission of the Donor" — Furnace Bend State University, Ohio, October 1998).
//
// Run with: node scripts/generate-furnace-bend-tmj.js
//
// Which tile is lawn, paver or black-top comes from
// apps/web/src/content/tilesets/maps/furnace-bend-field.palette.js. Layering, terrain-block tiling
// and collision come from scripts/lib/map-builder.js. This script owns layout and the land mask.
//
// Building anchors are load-bearing: when UNIT9_FIELD_NPCS and UNIT9_FIELD_SOURCE_POINTS are
// written they will place people and readable records relative to them, and
// FIELD_MAPS["unit-09"].interiors will place two doorsteps against the two door cells this file
// derives. A building may be resized but not moved without checking those.
//
// ── The layout argument ─────────────────────────────────────────────────────────────────────────
// `unit-09-campaign.js`'s own case summary names the places: "a campus quadrangle, a reading room
// and the processing room beneath it, twenty years after the works at the bottom of the hill went
// cold." So the map is drawn as four bands, north to south:
//
//   THE BUILDING ROW  four blocks of 1960s and 70s brick and concrete, and the Whitmore Library in
//                     the middle of them with the portico. Two doors on its south face.
//   THE QUAD          lawn, a paved cross-axis, autumn trees, and the most public ground here.
//   THE ROAD          the campus road along the foot of the quad, and a grass verge below it.
//   THE SLOPE         below a stepped edge with one gap in it: rough grass, older trees, and then
//                     nothing at all, which is the point.
//
// **This map is not built around a line, because the last two were.** Ellis Island was one line the
// player cannot cross and Fairmeadow was one line they cross in four seconds that turns out to be
// nothing; `0096` §1 makes that inversion a rule, and obeying it a third time means not drawing a
// third line. What is drawn instead is **depth** — the quad anyone may walk on, the reading room
// you may enter but must ask in, and the processing room under it that is not announced anywhere.
//
// **The two doors are the argument.** The public entrance is on the axis at the head of the paved
// walk. The service door into the processing room is four tiles east on the same face, off a strip
// of concrete and a graded turning area, with planting either side of it and nothing pointing at
// it. The room where you ask and the room where it is decided have different doors.
//
// **And the ranking runs backwards against the walk.** `0099` §4 found the three locks rank in the
// order nobody expects — the FOIA response weakest because it is the only one obliged to explain
// itself, the deed of gift stronger because it needs no reason, and the bad scan strongest of all
// because nobody decided anything. So the scan is behind no threshold: it is on a screen in the
// open, first, and everything that is harder to reach does less damage.
//
// ── What is not drawn ───────────────────────────────────────────────────────────────────────────
// **The works.** The obvious move is a mill silhouette on the south horizon and `Factory/1` would
// supply one. But a works twenty years closed in this valley was scrapped and the ground cleared,
// and what is at the bottom of the hill is a flat green field. Drawing it would make the argument
// visible, and the argument is that it is not: what the player can see of the thing everybody here
// is fighting over is nothing whatever, and the only evidence it happened is indoors in boxes.
//
// **No cars, and therefore no car park at all.** The library has no automobile between about 1910
// and the present — Phase 96 commissioned a 1950s fleet for exactly this reason and `Highway Rest
// Area`'s forty vehicles are contemporary to the last one. A lot here could only have been a grey
// rectangle with nothing in it, which does not read as a Tuesday afternoon; it reads as unfinished
// ground. The campus road keeps a grass verge instead and every vehicle on this map is off-camera.
//
// **Nothing from tile-B-04's modern glass block or its sports track** — see the exclusion list in
// the palette header.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import palette from "../apps/web/src/content/tilesets/maps/furnace-bend-field.palette.js";
import { MapBuilder, hash01, pick } from "./lib/map-builder.js";
import { RoadNetwork, blockGids, connectAll, doorCellOf } from "./lib/paths.js";
import { resolvePalette } from "./lib/palette-gids.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAP_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/furnace-bend-field.tmj");
const BLOCKS_OUT = path.join(REPO_ROOT, "apps/web/src/content/maps/furnace-bend-field.blocks.js");

// **56x36, and this is not a free choice.** `FIELD_GRID` in main.js is a single constant —
// `{ columns: 56, rows: 36, tile: 48 }` — and it is the collision and camera world that every
// outdoor field map is played in; only an interior declares a size of its own. A map painted at
// any other size is silently stretched to fit it, and every coordinate placed on it then means
// something on screen that it does not mean in the physics.
//
// This map shipped at 52x34 in Phase 102 and nothing said so, because the check that catches it
// runs `describe.each(Object.entries(FIELD_MAPS))` and this unit is deliberately not in
// FIELD_MAPS until it has a cast. See decision log 0102.
const WIDTH = 56;
const HEIGHT = 36;

// The east end of every band. The map is framed by four columns of more-of-the-same either side,
// so the walks, the road and the forecourt all run 4 to 51 and the building ranges stop there too.
const EAST_END = WIDTH - 5;

// The rows everything is placed against, so they are constants rather than literals repeated down
// the file. Read the file top to bottom and this is the section through the map.
const BUILD_ROW = 2; // the building row, rows 2-3; ground contact on 3, doors open onto 4
const APRON_ROW = 4; // the poured forecourt along the whole building row, rows 4-5
const FRONT_WALK_ROW = 6; // the poured walk along the whole building row — trunk 1
const QUAD_ROW = 7; // the quad begins
const AXIS_ROW = 12; // the paved cross-axis, rows 12-13
const SOUTH_WALK_ROW = 18; // the quad's south walk — trunk 2
const ROAD_ROW = 19; // the campus road, rows 19-20; rows 21-22 are grass verge
const STEPS_ROW = 23; // the retaining wall at the head of the slope, rows 23-24
const SLOPE_ROW = 25; // rough grass below the steps
const TREELINE_ROW = 32; // the mask's south limit

// The main axis: the library's own door, straight down the quad to the south walk. Two tiles wide,
// because it is the one route on this map that was designed rather than worn.
const AXIS_COL = 20;

// The one gap in the retaining wall. Everything else along that row is a wall the player follows.
const STEPS_GAP_COL = 32;

// --- must stay in lockstep with apps/web/src/main.js's isFurnaceBendLand() ---
// Deliberately duplicated rather than imported (decision log 0036): main.js is a browser bundle
// entry, and the one thing that must never silently diverge is the ground the player collides with
// versus the ground that got painted.
//
// A rectangle, and what frames it is more of the same place: graded ground and the backs of other
// buildings going north, heavy old growth going south and then nothing.
//
// The south limit is TREELINE_ROW itself rather than half a tile short of it, which is collision
// arithmetic rather than design — a `base` stamp's rect runs from row + 0.4 to row + 1, so an
// object standing on the last walkable row is centred 0.2 of a tile past that row's own centre.
// Cutting the mask at 29.5 leaves the slope's last row walkable while every tree on it reads as
// afloat, which is what field-map-coordinates.test.js reported eighteen times on Fairmeadow.
function isFurnaceBendLand(x, y) {
  return x >= 3.5 && x <= 52.5 && y >= BUILD_ROW && y <= TREELINE_ROW;
}

const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;
const map = new MapBuilder({ width: WIDTH, height: HEIGHT, gid, gidRect, tilesets });

// --- ground -------------------------------------------------------------------------------------
// Three surfaces and the section decides which. The frame beyond the mask is painted too, so the
// edge of the world is more of the same place rather than the row the tiles stop on.
for (let row = 0; row < HEIGHT; row += 1) {
  for (let col = 0; col < WIDTH; col += 1) {
    let surface = T.lawn;
    // The frame above the mask is lawn too, not graded earth. The first render laid scraped ground
    // across the top three rows and it came up as a hard band of cracked brown behind the building
    // line — a desert, on a campus in Ohio. What is north of this row is more campus.
    if (row >= SLOPE_ROW) surface = T.grassRough;
    map.groundBlock(col, row, surface);
  }
}

// The forecourt, poured concrete, and it runs the whole building row rather than only the
// library's own front. It was red brick and twelve tiles wide until the first two renders. Brick
// went because `stone.paver.brick` laid as a terrain block carries an edge course and what arrived
// was a wall lying down (see the note in the palette where that entry used to be); twelve tiles
// went because with lawn running up to every other doorway the ranges read as **models standing on
// a field** rather than as buildings on a campus. A made surface at the foot of a building is what
// tells the eye the building is founded.
for (let row = APRON_ROW; row < FRONT_WALK_ROW; row += 1) {
  for (let col = 4; col <= EAST_END; col += 1) map.groundBlock(col, row, T.walk);
}

// The campus road. Painted before the footpath network so its gids can be handed over as
// `harder`: a poured walk meeting black-top joins it rather than punching a grey rectangle through
// it.
//
// **Two rows, and there is no car park.** The first render gave the road four rows and put an empty
// lot under it, and four rows of unbroken black-top across a fifty-six-tile map is an arterial
// highway — it read as Fairmeadow's expressway, which is the one composition this map exists not to
// repeat. The lot went with it for a simpler reason: there is no 1990s automobile in the library
// (`0100` §4), so a car park here could only ever have been a grey rectangle with nothing in it,
// and a grey rectangle with nothing in it is not a fact about 1998, it is a hole.
for (let row = ROAD_ROW; row <= ROAD_ROW + 1; row += 1) {
  for (let col = 4; col <= EAST_END; col += 1) map.groundBlock(col, row, T.asphalt);
}

// The service turning area east of the library, where a truck backs twice a week. **Black-top,
// and it took two renders to get there.** Crushed stone went first: `path.stone.crushed` is one
// tile wide, and a one-wide block laid in a four-tile pocket with two hashed cells of slack at each
// end came out as a single tan square in the middle of a concrete apron — Fairmeadow's raggedness
// trick needs a run to be ragged along and this yard has not got one. Graded earth replaced it and
// was worse: a hard-edged brown rectangle set into a poured forecourt reads as **a hole in the
// campus**, not as a yard. Asphalt is what a library actually backs a truck onto, it is one shade
// off the concrete either side of it rather than four, and it says "service" without shouting.
// **It fills the alley exactly** — the library's east wing ends at column 25 and the
// administration block begins at 32, so the yard is 26 to 31 and its ends are two buildings. The
// resize render found it four columns adrift of the door it serves, with lawn behind half of it,
// reading as a strip of road stopping in the middle of a quadrangle. A service yard is a gap
// between two buildings or it is nothing.
for (let row = APRON_ROW; row <= FRONT_WALK_ROW - 1; row += 1) {
  for (let col = 26; col <= 31; col += 1) map.groundBlock(col, row, T.asphalt);
}

// --- the footpath network's authored trunk ---------------------------------------------------------
// Two runs across the map and one down it, and between them they are every walk the estates office
// ever poured here. Everything else that reaches a door is a spur generated from the door itself,
// at the bottom of this file.
const HARDER = new Set([...blockGids(map, T.asphalt), ...blockGids(map, T.paver)]);
const [SPUR_MATERIAL] = palette.road;
const roads = new RoadNetwork(map, T[SPUR_MATERIAL], { harder: HARDER });
roads.run(4, FRONT_WALK_ROW, EAST_END, FRONT_WALK_ROW); // along the building row
roads.run(4, SOUTH_WALK_ROW, EAST_END, SOUTH_WALK_ROW); // the quad's south side

// The paved axis and the cross-axis, in `paver` rather than concrete: these two were designed at
// the same time as the quad and the rest of the walks were poured later, one at a time, wherever
// somebody had already worn a line in the grass. Painted into the network so `connectAll` treats
// them as somewhere a spur may end, and `harder` so the concrete does not overwrite them.
for (let row = FRONT_WALK_ROW; row <= SOUTH_WALK_ROW; row += 1) {
  for (let col = AXIS_COL; col <= AXIS_COL + 1; col += 1) {
    map.groundBlock(col, row, T.paver);
    roads.paint(col, row);
  }
}
for (let row = AXIS_ROW; row <= AXIS_ROW + 1; row += 1) {
  for (let col = 8; col <= EAST_END - 4; col += 1) {
    map.groundBlock(col, row, T.paver);
    roads.paint(col, row);
  }
}

// --- structures -----------------------------------------------------------------------------------
// Every stamp declares what it is and its collision rect falls out of that. `solid` blocks the whole
// footprint, `base` blocks the ground-contact row and lifts the rest to the overlay so the player
// walks behind it, `decor` blocks nothing.
//
// Each building people go into is collected as a door: `doorCellOf()` reads the cell below the
// centre of the stamp's ground-contact row, so the spur the router paints starts where a person
// would step out.
const doors = [];
const withDoor = (col, row, entry, label) =>
  doors.push(doorCellOf(map.stamp(col, row, entry, "solid", label)));

// The building row, west to east. Four academic blocks and the library, on 1960s and 70s brick and
// concrete — this campus grew while the works were running, which is the quiet joke underneath the
// map: the library was paid for by the company whose records it now cannot let you read.
// **Two continuous ranges rather than four models on a lawn.** The first render put four
// four-tile buildings on a fifty-six-tile row with the lawn showing between all of them, and a
// quadrangle whose sides are gaps is not a quadrangle — the enclosure is the whole reason the word
// exists. The blocks abut in ranges now, west and east, with the library standing clear between
// them, which is also what a campus that grew in one funded decade looks like.
map.stamp(4, BUILD_ROW, T.hallBrick, "solid", "science block");
map.stamp(8, BUILD_ROW, T.hallLong, "solid", "humanities block");
map.stamp(12, BUILD_ROW, T.hallBrick, "solid", "lecture block");
// **The Whitmore Library, and its east wing.** Two stamps, one continuous eight-tile frontage, and
// two doors on it four tiles apart. The main entrance at col 22 stands at the head of the axis; the
// service door at col 26 opens off a strip of concrete and the graded turning area, behind
// planting, with nothing pointing at it. See the layout argument above.
withDoor(18, BUILD_ROW, T.library, "whitmore library");
withDoor(22, BUILD_ROW, T.libraryWing, "whitmore library east wing");
map.stamp(32, BUILD_ROW, T.hallLong, "solid", "administration block");
map.stamp(36, BUILD_ROW, T.hallBrick, "solid", "registrar's block");
map.stamp(40, BUILD_ROW, T.hallLong, "solid", "engineering block");
map.stamp(44, BUILD_ROW, T.hallBrick, "solid", "student union");
// The fifth block is what 56x36 bought. Widening the map moved the east range four columns east
// instead, and the render came back with a ten-column hole in the building row and the service
// yard stranded in the middle of it — a quadrangle whose east side is a gap is not a quadrangle,
// which is the finding the very first render of this map already made once.
map.stamp(48, BUILD_ROW, T.hallLong, "solid", "field house");

// --- the quad's trees -------------------------------------------------------------------------------
// Autumn, and every crown here was already in the library — Phase 101 (`0100` §5) found five of them
// on Modern Park/tile-B-05, three carrying fallen leaves at the base. The quad's are the turned
// ones; the slope keeps its greens, the way trees under a hill do.
//
// Placed as two rows either side of the cross-axis and clear of both walks, so nothing stands in
// the one route between the library door and the south side. A tree across the only path is what
// Fairmeadow's first render did (`0096` §5) and nothing in the pipeline catches it, because the
// router runs before the scatter.
// **An avenue either side of the axis, and pairs at the corners.** The first render scattered ten
// crowns over eleven rows of unbroken lawn and the quad came up as a golf course: a quadrangle is
// an enclosure, and with the buildings four tiles deep at the top of it the only other thing that
// can hold an edge is planting. Two files of trees flanking the axis do the work an avenue does
// anywhere, which is to make a long walk read as a route rather than as a field.
const QUAD_CANOPY = [T.treeRed, T.treeGold, T.treeOrange, T.treeTan];
for (const [index, [col, row]] of [
  // the avenue: four pairs down the axis, set two tiles clear of the paving either side
  // **Every row here is chosen so the crown's ground-contact row misses the paving.** A 2-tile
  // stamp seeded at row R contacts at R + 1, and the first render seeded pairs at QUAD_ROW + 4 and
  // AXIS_ROW + 5 — which contact on AXIS_ROW and SOUTH_WALK_ROW exactly, putting four trees on the
  // two walks they flank. The south walk is one row deep, so a tree standing on it does not
  // decorate it, it severs it. Same defect as Fairmeadow's tree in the road (`0096` §5) and the
  // churchyard wall on the pavement; the assertion below the stamps is what makes it fail loudly
  // now instead of waiting for somebody to look at a picture.
  [AXIS_COL - 4, QUAD_ROW + 1],
  [AXIS_COL + 3, QUAD_ROW + 1],
  [AXIS_COL - 4, QUAD_ROW + 3],
  [AXIS_COL + 3, QUAD_ROW + 3],
  [AXIS_COL - 4, AXIS_ROW + 2],
  [AXIS_COL + 3, AXIS_ROW + 2],
  [AXIS_COL - 4, AXIS_ROW + 4],
  [AXIS_COL + 3, AXIS_ROW + 4],
  // the corners
  [7, QUAD_ROW + 1],
  [12, QUAD_ROW + 3],
  [30, QUAD_ROW + 3],
  [36, QUAD_ROW + 1],
  [42, QUAD_ROW + 3],
  [48, QUAD_ROW + 1],
  [7, AXIS_ROW + 4],
  [12, AXIS_ROW + 2],
  [29, AXIS_ROW + 2],
  [35, AXIS_ROW + 4],
  [42, AXIS_ROW + 2],
  [48, AXIS_ROW + 4],
].entries()) {
  map.stamp(col, row, QUAD_CANOPY[index % QUAD_CANOPY.length], "base", "quad tree");
}

// Foundation planting along the building row, and a screen either side of the service door. The
// screen is doing real work: it is why a player walking the axis does not read the second door as
// another entrance.
// Short clusters, not a continuous run. The first render laid eleven identical clipped box in a
// line down each range and it read as a row of lollipops rather than as planting — the same defect
// as a tract of one house plan stamped eight times (`0095` §3), in a smaller object.
for (const [col1, col2, row] of [
  [5, 7, APRON_ROW - 1],
  [12, 14, APRON_ROW - 1],
  [26, 27, APRON_ROW - 1],
  [34, 36, APRON_ROW - 1],
  [42, 44, APRON_ROW - 1],
  [49, 51, APRON_ROW - 1],
]) {
  for (let col = col1; col <= col2; col += 1) {
    map.stamp(col, row, col % 2 === 0 ? T.shrub : T.shrubAlt, "base", "foundation planting");
  }
}

// --- the stepped edge -----------------------------------------------------------------------------
// **This is the hill**, and the render is what decided what it is made of. There is no height in
// this engine and a valley city has to be said some other way; `Modern Park/tile-B-01`'s stepped
// edge was taken for a flight of steps and came up as a low concrete retaining wall with planting
// along the top, which is a better object for the head of a bank than the one that was asked for.
// It is kept under the name the render earned — the same call `0095` §5 records for the abatis.
// One gap, and the gap is the only way down.
for (let col = 5; col <= EAST_END - 1; col += 2) {
  if (col >= STEPS_GAP_COL - 1 && col <= STEPS_GAP_COL + 2) continue;
  map.stamp(col, STEPS_ROW, T.quadWall, "base", "quad retaining wall");
}

// --- the slope ------------------------------------------------------------------------------------
// Older, heavier, and half-turned rather than turned: these trees were here before the campus and
// nobody planted them in a row.
// The two rows the map gained at 56x36 went here rather than anywhere else, because depth is what
// this composition is made of: the slope is now seven rows deep against the quad's eleven, and the
// growth thickens going down it instead of stopping in a line four rows below the wall.
const SLOPE_CANOPY = [T.treeOlive, T.treeGreen, T.treeOlive, T.treeTan];
for (const [index, [col, row]] of [
  [7, SLOPE_ROW + 1],
  [12, SLOPE_ROW + 3],
  [18, SLOPE_ROW + 1],
  [24, SLOPE_ROW + 4],
  [29, SLOPE_ROW + 2],
  [37, SLOPE_ROW + 1],
  [42, SLOPE_ROW + 3],
  [46, SLOPE_ROW + 2],
  // the deep row: contact on SLOPE_ROW + 6, one clear row above the treeline's own stamp
  [9, SLOPE_ROW + 5],
  [20, SLOPE_ROW + 5],
  [33, SLOPE_ROW + 5],
  [49, SLOPE_ROW + 4],
].entries()) {
  map.stamp(col, row, SLOPE_CANOPY[index % SLOPE_CANOPY.length], "base", "slope tree");
}

// The frame below the mask: heavy growth, so the edge of the world going south is the hill
// continuing rather than the row the tiles stop on. `decor` — the whole footprint is outside the
// walkable rectangle, and field-map-coordinates.test.js reads an unreachable rect on non-land as a
// building standing in the sea.
for (let col = 2; col <= EAST_END + 2; col += 4) {
  map.stamp(col, TREELINE_ROW, SLOPE_CANOPY[col % SLOPE_CANOPY.length], "decor", "treeline");
}

// --- the trunk must still be walkable ---------------------------------------------------------------
// **Nothing else in this pipeline checks that a walk stays open.** The router runs after the stamps
// and treats occupied cells as impassable, so it will happily route a spur around a tree standing
// in the middle of the trunk and report every door connected — which is exactly what happened here:
// four crowns contacted on `AXIS_ROW` and `SOUTH_WALK_ROW`, the generator said 2/2, and the only
// thing that knew was a picture. Fairmeadow shipped the same defect twice (`0096` §5, the tree in
// the road and the churchyard wall across the pavement) and both times a human eye caught it.
//
// This is that eye, written down. It runs against the authored trunk only — the runs painted above,
// not the spurs, because a spur is generated to reach a door and is allowed to end at one.
const TRUNK = [];
for (let col = 4; col <= EAST_END; col += 1) {
  TRUNK.push([col, FRONT_WALK_ROW], [col, SOUTH_WALK_ROW]);
}
for (let row = FRONT_WALK_ROW; row <= SOUTH_WALK_ROW; row += 1) {
  TRUNK.push([AXIS_COL, row], [AXIS_COL + 1, row]);
}
for (let col = 8; col <= EAST_END - 4; col += 1) {
  TRUNK.push([col, AXIS_ROW], [col, AXIS_ROW + 1]);
}
const blocked = TRUNK.filter(([col, row]) =>
  map.blocks.some(
    (rect) =>
      col + 0.5 >= rect.x1 && col + 0.5 < rect.x2 && row + 0.5 >= rect.y1 && row + 0.5 < rect.y2
  )
).map(([col, row]) => `${col},${row}`);
if (blocked.length > 0) {
  throw new Error(
    `${blocked.length} authored trunk cells are blocked by a stamp: ${blocked.join(" ")} — a walk ` +
      "one row deep is severed by anything standing on it, and connectAll will route around it and " +
      "still report every door connected"
  );
}

// --- spurs: every door reaches the poured walk ----------------------------------------------------
// Run after every solid, base and decor stamp above: the router treats anything already occupied as
// impassable, so routing earlier would thread a spur under a stamp whose collision rect then blocks
// the very path it painted.
const spurs = connectAll(roads, { doors, isLand: isFurnaceBendLand });

// --- scatter --------------------------------------------------------------------------------------
// One pass, and only below the steps. The quad gets nothing: a mown quadrangle with volunteer
// growth on it is not a mown quadrangle, and the contrast between the two halves is the one thing
// on this map a student can read before anybody speaks.
for (let row = SLOPE_ROW; row < TREELINE_ROW; row += 1) {
  for (let col = 5; col < EAST_END; col += 1) {
    if (map.occupied(col, row) || roads.has(col, row)) continue;
    if (hash01(col, row, 11) >= 0.05) continue;
    map.stamp(col, row, pick([T.shrub, T.shrubAlt], col, row, 7), "solid", "slope scrub");
  }
}

writeFileSync(MAP_OUT, JSON.stringify(map.toTmj()));
writeFileSync(
  BLOCKS_OUT,
  map.toBlocksModule("FURNACE_BEND_FIELD_BLOCKS", "scripts/generate-furnace-bend-tmj.js", {
    doors,
    roads: roads.cells,
  })
);
console.log(`wrote ${path.relative(REPO_ROOT, MAP_OUT)} and its blocks module`);
console.log(`  ${map.blocks.length} collision rects`);
console.log(`  ${spurs.connected}/${doors.length} doors connected to the poured walk`);
if (spurs.unreachable.length > 0) {
  // Hard failure, not a warning. A building with no path to it is the exact defect this pipeline
  // exists to prevent, and a warning in a build nobody watches is how it would come back.
  throw new Error(
    `no route to the poured walk from: ${JSON.stringify(spurs.unreachable)} - either the door is ` +
      `walled in by neighbouring stamps, or the trunk does not reach that part of the map`
  );
}
