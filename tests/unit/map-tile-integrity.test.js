// Checks the committed .tmj files against the pixels of the sheets they draw from.
//
// This is the guard for the defect class that shipped in Phase 52 and that Phase 53 removed:
// objects stamped into fewer cells than their art occupies (trees cut down the middle, barrels
// sliced at the waist, driftwood logs halved, a quarter of a coral cluster sitting in open water),
// and full-bleed terrain quadrants dropped onto the structures layer as "decoration" (hard tan
// squares of sand in the middle of green grass).
//
// Both are mechanical properties of the map plus the art, so neither needs a human to notice them
// in a screenshot ever again.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it, beforeAll } from "vitest";

import {
  TILE,
  coversCell,
  loadSheet,
  transparentEdgePixels,
} from "../../scripts/assets/lib/sprite-geometry.js";

// A stamped shape has to read as a cut-out: some see-through border, somewhere. Terrain scores a
// flat 0% and every real object clears this by a wide margin — the tightest shapes on the five
// live maps (a run of split-rail fence, a pier walkway) sit around 20%.
const MIN_CUTOUT_BORDER = 0.05;

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
const MAP_DIR = path.join(REPO_ROOT, "apps/web/src/content/maps");

const MAP_FILES = readdirSync(MAP_DIR)
  .filter((file) => file.endsWith(".tmj"))
  .sort();

/** Strips the `../../assets/tilesets/` prefix a .tmj writes, leaving the sheet's pack-relative path. */
function sheetPathOf(tileset) {
  const normalized = String(tileset.image).replace(/\\/g, "/");
  const marker = "assets/tilesets/";
  const index = normalized.indexOf(marker);
  return index === -1 ? normalized : normalized.slice(index + marker.length);
}

function tilesetForGid(tilesets, gid) {
  for (let i = tilesets.length - 1; i >= 0; i -= 1) {
    if (gid >= tilesets[i].firstgid) return tilesets[i];
  }
  return null;
}

/** Everything a test needs about one drawn cell. */
function cellsOf(tmj, layer) {
  const cells = [];
  for (let row = 0; row < layer.height; row += 1) {
    for (let col = 0; col < layer.width; col += 1) {
      const gid = layer.data[row * layer.width + col];
      if (!gid) continue;
      const tileset = tilesetForGid(tmj.tilesets, gid);
      const localId = gid - tileset.firstgid;
      cells.push({
        col,
        row,
        gid,
        tileset,
        sheet: sheetPathOf(tileset),
        sheetRow: Math.floor(localId / tileset.columns),
        sheetCol: localId % tileset.columns,
      });
    }
  }
  return cells;
}

const maps = new Map();
const sheets = new Map();

beforeAll(async () => {
  for (const file of MAP_FILES) {
    const tmj = JSON.parse(readFileSync(path.join(MAP_DIR, file), "utf8"));
    maps.set(file, tmj);
    for (const tileset of tmj.tilesets) {
      const sheetPath = sheetPathOf(tileset);
      if (!sheets.has(sheetPath)) sheets.set(sheetPath, await loadSheet(sheetPath));
    }
  }
}, 60_000);

describe.each(MAP_FILES)("%s", (file) => {
  const tileLayers = () =>
    (maps.get(file).layers || []).filter((layer) => layer.type === "tilelayer");
  const isGround = (layer) => String(layer.name).toLowerCase() === "ground";

  it("draws only tiles that cover their cell on the ground layer", () => {
    const tmj = maps.get(file);
    const offenders = [];
    for (const layer of tileLayers().filter(isGround)) {
      for (const cell of cellsOf(tmj, layer)) {
        const sheet = sheets.get(cell.sheet);
        if (coversCell(sheet, cell.sheetRow, cell.sheetCol)) continue;
        offenders.push(
          `(${cell.col},${cell.row}) draws ${cell.sheet} (${cell.sheetRow},${cell.sheetCol}), ` +
            `which has see-through holes`
        );
      }
    }
    // A transparent tile on the ground layer shows the page background through the world. This is
    // exactly the bug the Riverbend rebuild found: planted-row crop props were used as ground, so
    // every field showed hard black gaps between the plants.
    expect(offenders.slice(0, 8)).toEqual([]);
  });

  it("draws only cut-out objects on the structures and overlay layers", () => {
    const tmj = maps.get(file);

    // Everything drawn above the ground, keyed by map cell. Layers are merged because a single
    // object spans both: a tree's trunk row stays on structures while its canopy is lifted to
    // overlay, and judging the two halves separately would ask the wrong question about each.
    const drawn = new Map();
    for (const layer of tileLayers().filter((l) => !isGround(l))) {
      for (const cell of cellsOf(tmj, layer)) drawn.set(`${cell.col},${cell.row}`, cell);
    }

    // Group them into stamped shapes. Adjacent drawn cells are one shape: that is exactly what a
    // multi-tile stamp looks like once it is in the .tmj, which no longer records the stamp.
    const seen = new Set();
    const shapes = [];
    for (const key of drawn.keys()) {
      if (seen.has(key)) continue;
      const shape = [];
      const queue = [key];
      seen.add(key);
      while (queue.length > 0) {
        const current = queue.pop();
        const cell = drawn.get(current);
        shape.push(cell);
        for (const [dc, dr] of [
          [0, -1],
          [0, 1],
          [-1, 0],
          [1, 0],
        ]) {
          const neighbour = `${cell.col + dc},${cell.row + dr}`;
          if (!drawn.has(neighbour) || seen.has(neighbour)) continue;
          seen.add(neighbour);
          queue.push(neighbour);
        }
      }
      shapes.push(shape);
    }

    const offenders = [];
    for (const shape of shapes) {
      // A shape with see-through gaps anywhere in it is doing the one thing this layer is for:
      // letting the ground show through. Planted crop rows are the honest case — a bed of plants
      // with soil painted under them on the ground layer. Only a shape that is solid in every
      // cell can be a square of swapped material.
      if (shape.some((cell) => !coversCell(sheets.get(cell.sheet), cell.sheetRow, cell.sheetCol))) {
        continue;
      }
      const members = new Set(shape.map((cell) => `${cell.col},${cell.row}`));
      let border = 0;
      let clear = 0;
      for (const cell of shape) {
        const sheet = sheets.get(cell.sheet);
        for (const [side, dc, dr] of [
          ["top", 0, -1],
          ["bottom", 0, 1],
          ["left", -1, 0],
          ["right", 1, 0],
        ]) {
          if (members.has(`${cell.col + dc},${cell.row + dr}`)) continue; // interior seam
          border += TILE;
          clear += transparentEdgePixels(sheet, cell.sheetRow, cell.sheetCol, side);
        }
      }
      if (border === 0 || clear / border >= MIN_CUTOUT_BORDER) continue;
      const anchor = shape.reduce((a, b) => (a.row < b.row || a.col < b.col ? a : b));
      offenders.push(
        `the ${shape.length}-cell shape at (${anchor.col},${anchor.row}) drawing ${anchor.sheet} ` +
          `(${anchor.sheetRow},${anchor.sheetCol}) is opaque to its own border ` +
          `(${((clear / border) * 100).toFixed(1)}% see-through) — it is a square of material, ` +
          `not a cut-out object`
      );
    }

    // A full-bleed tile stamped on top of the ground replaces a square of the world with a
    // different material, hard-edged. That is what put sand-with-dry-grass squares in the middle
    // of the Caribbean's green interior and a square of flat blue coral inside the shallows.
    // Scatter has to be a cut-out prop with alpha around it; anything that genuinely is a floor —
    // a pier deck, a paved quay — belongs on the ground layer instead.
    expect(offenders.slice(0, 8)).toEqual([]);
  });

  it("uses 48px tiles on a whole-tile grid", () => {
    const tmj = maps.get(file);
    expect(tmj.tilewidth).toBe(TILE);
    expect(tmj.tileheight).toBe(TILE);
    for (const tileset of tmj.tilesets) {
      expect(tileset.imagewidth % TILE, `${tileset.name} width`).toBe(0);
      expect(tileset.imageheight % TILE, `${tileset.name} height`).toBe(0);
    }
  });
});
