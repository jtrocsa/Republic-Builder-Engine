// Repacks sprites off the purchased art packs onto a clean 48px grid, one sprite per whole number
// of tiles, and writes the derived sheet plus a generated coordinates module.
//
// Why this exists (Phase 53). The packs author objects wherever they fit, not on the tile grid.
// `farm/6.png`'s apple tree starts 19px inside the birch tree's second column; `farm/7.png` packs
// clapboard houses so tightly they overlap. `tiled-map-loader.js` can only address whole tiles, so
// stamping those sprites necessarily either clips the sprite or paints a slice of its neighbour —
// which is why the shipped maps showed trees cut down the middle and a sliver of apple tree
// floating beside a birch. No amount of re-declaring row/col fixes that; the art has to move.
//
// Precedent: apps/web/src/assets/tilesets/Common Cause Philadelphia/liberty-pole.png is already a
// single-object sheet cut to the grid. This generalises that.
//
// Output is deterministic — same input bytes produce the same output bytes — so the derived PNGs
// are committed and regenerating them is a no-op diff, the same property Phase 51 established for
// the .tmj files.
//
// Usage:
//   npm run assets:pack-objects              rebuild every derived sheet
//   npm run assets:pack-objects -- --check   rebuild into memory and fail if it differs from disk

import { Buffer } from "node:buffer";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";

import { DERIVED_OBJECTS } from "../../apps/web/src/content/tilesets/derived-objects.manifest.js";
import { REPO_ROOT, TILE, TILESET_ROOT, loadSheet } from "./lib/sprite-geometry.js";

const DERIVED_ROOT = path.join(TILESET_ROOT, "derived");
const COORDS_MODULE = path.join(
  REPO_ROOT,
  "apps/web/src/content/tilesets/derived-objects.coords.js"
);

const ALPHA_FLOOR = 8;
const PACK_COLUMNS = 16; // keeps derived sheets the same shape as the packs they come from

/**
 * Finds the sprite at a seed cell as a pixel box.
 *
 * Flood-fills the connected ink from the seed cell (8-connected — these outlines are diagonal).
 * `limit` caps how far that is allowed to run: on a tightly packed sheet two sprites touch, the
 * fill merges them, and the result is garbage. Blowing the cap is not a crash, it is a message
 * telling the manifest author to pin that sprite with an explicit `box` instead.
 */
function findSpriteBox(sheet, seedRow, seedCol, limitTiles) {
  const limitW = limitTiles.width * TILE;
  const limitH = limitTiles.height * TILE;
  const ink = (x, y) =>
    x >= 0 &&
    y >= 0 &&
    x < sheet.width &&
    y < sheet.height &&
    sheet.data[(y * sheet.width + x) * 4 + 3] >= ALPHA_FLOOR;

  const stack = [];
  const seen = new Set();
  for (let y = seedRow * TILE; y < (seedRow + 1) * TILE; y += 1) {
    for (let x = seedCol * TILE; x < (seedCol + 1) * TILE; x += 1) {
      if (ink(x, y)) {
        const key = y * sheet.width + x;
        if (!seen.has(key)) {
          seen.add(key);
          stack.push([x, y]);
        }
      }
    }
  }
  if (stack.length === 0) return null;

  let minX = sheet.width;
  let minY = sheet.height;
  let maxX = -1;
  let maxY = -1;
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (maxX - minX + 1 > limitW || maxY - minY + 1 > limitH) {
      return { overflow: true, box: { x1: minX, y1: minY, x2: maxX + 1, y2: maxY + 1 } };
    }
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (!ink(nx, ny)) continue;
        const key = ny * sheet.width + nx;
        if (seen.has(key)) continue;
        seen.add(key);
        stack.push([nx, ny]);
      }
    }
  }
  return { overflow: false, box: { x1: minX, y1: minY, x2: maxX + 1, y2: maxY + 1 }, mask: seen };
}

/**
 * Cuts a sprite out of its source sheet into a fresh RGBA buffer sized to a whole number of tiles.
 *
 * Horizontally centred and bottom-anchored, because tiled-map-loader.js anchors a tile's art to
 * the bottom edge of its grid cell (see its dy calculation) and because a map's collision rect is
 * always the object's ground-contact row. Bottom-anchoring is what keeps "the rect under the
 * trunk" true after repacking.
 *
 * When the sprite was isolated by flood fill, only that sprite's own pixels are copied — a
 * neighbour overlapping the crop box is dropped rather than carried along.
 */
function cutSprite(sheet, box, mask) {
  const artW = box.x2 - box.x1;
  const artH = box.y2 - box.y1;
  const cols = Math.ceil(artW / TILE);
  const rows = Math.ceil(artH / TILE);
  const outW = cols * TILE;
  const outH = rows * TILE;
  const out = Buffer.alloc(outW * outH * 4, 0);

  const offsetX = Math.floor((outW - artW) / 2);
  const offsetY = outH - artH;

  for (let y = 0; y < artH; y += 1) {
    for (let x = 0; x < artW; x += 1) {
      const sx = box.x1 + x;
      const sy = box.y1 + y;
      if (mask && !mask.has(sy * sheet.width + sx)) continue;
      const s = (sy * sheet.width + sx) * 4;
      if (sheet.data[s + 3] === 0) continue;
      const d = ((y + offsetY) * outW + x + offsetX) * 4;
      out[d] = sheet.data[s];
      out[d + 1] = sheet.data[s + 1];
      out[d + 2] = sheet.data[s + 2];
      out[d + 3] = sheet.data[s + 3];
    }
  }
  return { data: out, width: outW, height: outH, cols, rows };
}

/**
 * Resamples a cut sprite to a smaller whole-tile footprint.
 *
 * For art that is the right *object* at the wrong *scale*. The brass compass on `Island survival/5`
 * is drawn as a 2x2 hero prop — 96px of gold case, which is roughly the size of the player — and the
 * Main Hall wants it as a 1x1 instrument sitting on the Navigation Table. Rescaling here rather than
 * in CSS keeps it a real tile the map generator can stamp, and keeps the derived sheet the single
 * place a sprite's on-grid size is decided.
 *
 * `nearest`, not a smoothing kernel: at exactly 2:1 it drops every other pixel and the result stays
 * hard-edged pixel art, which is what the tile next to it will be. Mitchell and lanczos3 were both
 * rendered and compared at 6x — each produces a visibly soft, anti-aliased object that reads as a
 * photograph shrunk down and sits wrong beside the packs' 1px outlines.
 */
async function resizeSprite(sprite, { rows, cols }) {
  const width = cols * TILE;
  const height = rows * TILE;
  const data = await sharp(sprite.data, {
    raw: { width: sprite.width, height: sprite.height, channels: 4 },
  })
    .resize(width, height, { kernel: "nearest", fit: "fill" })
    .raw()
    .toBuffer();
  return { data, width, height, cols, rows };
}

/** Places cut sprites into a grid, left to right, wrapping at PACK_COLUMNS. */
function layout(sprites) {
  const placed = [];
  let cursorCol = 0;
  let cursorRow = 0;
  let shelfHeight = 0;
  for (const sprite of sprites) {
    if (cursorCol + sprite.cols > PACK_COLUMNS) {
      cursorRow += shelfHeight;
      cursorCol = 0;
      shelfHeight = 0;
    }
    placed.push({ ...sprite, row: cursorRow, col: cursorCol });
    cursorCol += sprite.cols;
    shelfHeight = Math.max(shelfHeight, sprite.rows);
  }
  return { placed, rows: cursorRow + shelfHeight, cols: PACK_COLUMNS };
}

async function buildSheet(spec) {
  const cut = [];
  const problems = [];

  for (const object of spec.objects) {
    const sheet = await loadSheet(object.from || spec.from);
    let box;
    let mask;

    if (object.box) {
      // Explicit pixel rect: the escape hatch for sheets where sprites physically touch, so a
      // flood fill cannot tell them apart. Read off `npm run assets:label`.
      const [x1, y1, x2, y2] = object.box;
      box = { x1, y1, x2, y2 };
    } else {
      const limit = object.limit || { height: 6, width: 6 };
      const found = findSpriteBox(sheet, object.seed[0], object.seed[1], limit);
      if (!found) {
        problems.push(`${object.name}: nothing drawn at seed (${object.seed})`);
        continue;
      }
      if (found.overflow) {
        const b = found.box;
        problems.push(
          `${object.name}: flood fill from (${object.seed}) ran past its ${limit.height}x${limit.width} ` +
            `tile limit — it is touching a neighbouring sprite. It had reached ` +
            `[${b.x1},${b.y1},${b.x2},${b.y2}] (${b.x2 - b.x1}x${b.y2 - b.y1}px) when it was cut off. ` +
            `Either raise the limit, or pin the sprite with an explicit box: [x1,y1,x2,y2] in the ` +
            `manifest (npm run assets:label -- "${object.from || spec.from}").`
        );
        continue;
      }
      box = found.box;
      mask = found.mask;
    }

    let sprite = cutSprite(sheet, box, mask);
    if (object.scale) sprite = await resizeSprite(sprite, object.scale);
    cut.push({ name: object.name, ...sprite, source: box });
  }

  if (problems.length > 0) {
    throw new Error(`pack-objects: ${spec.out}\n  - ` + problems.join("\n  - "));
  }

  const { placed, rows } = layout(cut);
  const width = PACK_COLUMNS * TILE;
  const height = Math.max(rows, 1) * TILE;
  const canvas = Buffer.alloc(width * height * 4, 0);

  for (const sprite of placed) {
    const dx = sprite.col * TILE;
    const dy = sprite.row * TILE;
    for (let y = 0; y < sprite.height; y += 1) {
      for (let x = 0; x < sprite.width; x += 1) {
        const s = (y * sprite.width + x) * 4;
        if (sprite.data[s + 3] === 0) continue;
        const d = ((dy + y) * width + dx + x) * 4;
        canvas[d] = sprite.data[s];
        canvas[d + 1] = sprite.data[s + 1];
        canvas[d + 2] = sprite.data[s + 2];
        canvas[d + 3] = sprite.data[s + 3];
      }
    }
  }

  const png = await sharp(canvas, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  return {
    out: spec.out,
    png,
    coords: placed.map((s) => ({
      name: s.name,
      row: s.row,
      col: s.col,
      height: s.rows,
      width: s.cols,
    })),
  };
}

function coordsModule(results) {
  const lines = [
    "// GENERATED by scripts/assets/pack-objects.js — do not edit by hand.",
    "//",
    "// Every entry here is a sprite that was repacked onto a clean 48px grid because its art in",
    "// the source pack crossed tile boundaries and could not be stamped without clipping it or",
    "// catching its neighbour. Coordinates are (row, col) into the derived sheet; width/height are",
    "// measured from the pixels, not declared by hand.",
    "//",
    "// Regenerate with: npm run assets:pack-objects",
    "",
    'import { tile } from "./canonical-palette.js";',
    "",
  ];
  for (const result of results) {
    const sheetPath = "derived/" + path.basename(result.out);
    const constName = path
      .basename(result.out, ".png")
      .replace(/[^a-z0-9]+(.)/gi, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (_, c) => c.toUpperCase());
    lines.push(`/** Repacked from the source pack — see the manifest for provenance. */`);
    lines.push(`export const ${constName} = {`);
    for (const entry of result.coords) {
      lines.push(
        `  ${entry.name}: tile("${sheetPath}", ${entry.row}, ${entry.col}, ` +
          `{ h: ${entry.height}, w: ${entry.width} }),`
      );
    }
    lines.push("};");
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  const check = process.argv.includes("--check");
  const results = [];
  for (const spec of DERIVED_OBJECTS) results.push(await buildSheet(spec));

  const module = coordsModule(results);
  let dirty = false;

  mkdirSync(DERIVED_ROOT, { recursive: true });
  for (const result of results) {
    const target = path.join(DERIVED_ROOT, path.basename(result.out));
    const existing = existsSync(target) ? readFileSync(target) : null;
    if (!existing || !existing.equals(result.png)) {
      dirty = true;
      if (!check) writeFileSync(target, result.png);
    }
    console.log(
      `${check ? "checked" : "wrote"} ${path.relative(REPO_ROOT, target)}  ` +
        `(${result.coords.length} sprites)`
    );
  }

  const existingModule = existsSync(COORDS_MODULE) ? readFileSync(COORDS_MODULE, "utf8") : null;
  if (existingModule !== module) {
    dirty = true;
    if (!check) writeFileSync(COORDS_MODULE, module);
  }
  console.log(`${check ? "checked" : "wrote"} ${path.relative(REPO_ROOT, COORDS_MODULE)}`);

  if (check && dirty) {
    console.error(
      "\npack-objects --check: derived art on disk does not match the manifest. " +
        "Run `npm run assets:pack-objects` and commit the result."
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
