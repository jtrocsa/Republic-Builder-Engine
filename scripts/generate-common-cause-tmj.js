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
//
// Which tile is which building comes from
// apps/web/src/content/tilesets/maps/common-cause-field.palette.js — including the standing rule
// that only Medieval Fantasy Town's UNLABELLED building silhouettes may be used here.
import { writeFileSync } from "node:fs";

import palette from "../apps/web/src/content/tilesets/maps/common-cause-field.palette.js";
import { resolvePalette } from "./lib/palette-gids.js";

const WIDTH = 40;
const HEIGHT = 24;
const TILE = 48;

// --- must stay byte-identical in spirit to apps/web/src/main.js's isCommonCauseLand() ---
function isCommonCauseLand(x, y) {
  return x > 2.2 && x < 37.8 && y > 2.2 && y < 21.8;
}

// --- tileset helpers ---
// firstgid assignment, sheet geometry (including the liberty pole's 1-column grid, which the
// old hardcoded `* 16` arithmetic could not have expressed) and the tilesets[] array are all
// derived from the palette's sheet order by resolvePalette() — see scripts/lib/palette-gids.js.
const { tilesets, gid, gidRect } = resolvePalette(palette);
const T = palette.tiles;

// Ground fill: plain stone plaza inside the walkable gathering ground, grass outside it.
const GROUND_PLAZA_A = gid(T.groundPlazaA);
const GROUND_PLAZA_B = gid(T.groundPlazaB); // near-identical variant, for light texture
const GROUND_EXTERIOR = gid(T.groundExterior);

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
    rowGids.forEach((tileGid, c) => {
      if (!tileGid) return;
      const col = anchorCol + c;
      const row = anchorRow + r;
      if (col < 0 || col >= WIDTH || row < 0 || row >= HEIGHT) return;
      structuresData[row * WIDTH + col] = tileGid;
    });
  });
}

// Half-timber building, unlabeled — print shop.
const PRINT_SHOP = gidRect(T.printShop, 4, 4);

// Second thatched cottage, unlabeled — family residence.
const FAMILY_RESIDENCE = gidRect(T.familyResidence, 4, 4);

// Stone stairs + double arch — statehouse steps.
const STATEHOUSE_STEPS = gidRect(T.statehouseSteps, 1, 4);

// Civic building — the source sheet's baked-in "Adventurer's Guild" sign band (its row 2) is
// swapped for that same sheet's plain stone wall so no anachronistic fantasy text renders in a
// Revolutionary Philadelphia scene. See the palette's header for the standing rule.
const ASSEMBLY_HALL = gidRect(T.assemblyHall, 4, 4);
ASSEMBLY_HALL[2] = gidRect({ sheet: T.assemblyHall.sheet, row: 2, col: 0 }, 1, 4)[0];

// Church with steeple, both variants side by side for a fuller footprint — chapel.
const CHAPEL = gidRect(T.chapel, 3, 4);

// Wooden lookout watchtower — frontier dispatch post.
const FRONTIER_DISPATCH_POST = gidRect(T.frontierDispatchPost, 3, 2);

// Two market stalls side by side.
const MARKET_STALLS = gidRect(T.marketStalls, 2, 4);

// Well with peaked roof.
const TOWN_WELL = gidRect(T.townWell, 2, 2);

// Dock planking plus a rowboat on the row below — wharf.
const WHARF = gidRect(T.wharf, 2, 4);
WHARF.push([...gidRect({ sheet: T.wharf.sheet, row: 10, col: 0 }, 1, 2)[0], 0, 0]);

// Liberty pole (PixelLab-generated, single 1-column x 3-row sheet) — no existing pack has an
// equivalent; this is the one genuinely unique asset in this map.
const LIBERTY_POLE = gidRect(T.libertyPole, 3, 1);

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
  tilesets,
  tilewidth: TILE,
  type: "map",
  version: "1.10",
  width: WIDTH,
};

const outPath = process.argv[2];
writeFileSync(outPath, JSON.stringify(tmj));
console.log("wrote", outPath);
