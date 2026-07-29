// Measures where a sprite's art actually is on a tilesheet, in pixels, so a map generator never
// has to guess a multi-tile object's footprint again.
//
// The problem this solves (Phase 53): a palette entry recorded an object's size in a JSDoc
// comment (`// 3x2`) and its generator repeated that size as literal `gidRect(entry, h, w)`
// arguments. Nothing checked either number against the pixels. In `farm/6.png` the trees are not
// tile-aligned at all — `treeBirch` was declared 3 rows x 2 cols at (0,8), but the apple tree's
// left edge falls inside that rect, so the birch stamp painted a sliver of apple tree (apples
// included) beside the birch, while the birch's own crown was clipped. Half-barrels, sliced
// driftwood and quarter-corals all had the same cause.
//
// Everything here works on one connected blob of non-transparent pixels: the sprite. A sprite is
// whatever you reach by flood-filling out from a seed cell. That is the only definition that does
// not require trusting a human-authored number.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(SCRIPT_DIR, "../../..");
export const TILESET_ROOT = path.join(REPO_ROOT, "apps/web/src/assets/tilesets");

export const TILE = 48;

// Below this, a pixel is background. Not 0: several packs feather their sprite outlines, leaving a
// halo of alpha 1-6 that would otherwise fuse every sprite on a sheet into one blob.
export const ALPHA_FLOOR = 8;

// How much of a neighbouring sprite has to land inside a stamp before it counts as a defect.
// See the note in classifyFootprint(): a few pixels of overlapping frond is how these packs are
// drawn, a visible slice of a different tree is the bug.
export const FOREIGN_INK_FLOOR = 200;
export const FOREIGN_INK_SHARE = 0.02;

const sheetCache = new Map();

/** Decodes a sheet once and keeps it as raw RGBA. Sheets are 768x768; re-decoding is the slow part. */
export function loadSheet(sheetPath) {
  const cached = sheetCache.get(sheetPath);
  if (cached) return cached;
  const absolute = path.isAbsolute(sheetPath) ? sheetPath : path.join(TILESET_ROOT, sheetPath);
  readFileSync(absolute); // fail loudly with the real path if it is missing
  const promise = sharp(absolute)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => ({
      data,
      width: info.width,
      height: info.height,
      cols: Math.floor(info.width / TILE),
      rows: Math.floor(info.height / TILE),
      path: sheetPath,
    }));
  sheetCache.set(sheetPath, promise);
  return promise;
}

export function alphaAt(sheet, x, y) {
  if (x < 0 || y < 0 || x >= sheet.width || y >= sheet.height) return 0;
  return sheet.data[(y * sheet.width + x) * 4 + 3];
}

const isInk = (sheet, x, y) => alphaAt(sheet, x, y) >= ALPHA_FLOOR;

/**
 * True if this cell has no see-through holes — every pixel carries some colour.
 *
 * Deliberately "alpha > 0", not "alpha === 255": several packs render water and foliage with
 * partial alpha for shimmer and soft edges, and those tiles still cover the cell completely. What
 * matters for a ground tile is that nothing behind it shows through.
 */
export function coversCell(sheet, row, col) {
  const x0 = col * TILE;
  const y0 = row * TILE;
  for (let y = y0; y < y0 + TILE; y += 1) {
    for (let x = x0; x < x0 + TILE; x += 1) {
      if (alphaAt(sheet, x, y) === 0) return false;
    }
  }
  return true;
}

/**
 * True if this cell is terrain — it covers itself AND sits inside a larger opaque field on the
 * sheet, meaning every neighbour that exists also covers itself.
 *
 * This is the mechanical form of "a scattered plant must be an object, not a swapped ground tile".
 * The Caribbean's tan squares in green grass were single quadrants of the *sand* block used as
 * decoration; its square of flat blue inside the shallows was a quarter of a coral block. Both are
 * cells deep inside an opaque terrain field. A hut's base row, by contrast, covers itself but has
 * transparent cells around it, so it is correctly not terrain.
 */
export function isTerrainCell(sheet, row, col) {
  if (!coversCell(sheet, row, col)) return false;
  const neighbours = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];
  for (const [r, c] of neighbours) {
    if (r < 0 || c < 0 || r >= sheet.rows || c >= sheet.cols) continue;
    if (!coversCell(sheet, r, c)) return false;
  }
  return true;
}

/** Kept for the measurement CLI, which asks the strict question about a single cell. */
export function isFullBleed(sheet, row, col) {
  return coversCell(sheet, row, col);
}

/** True if the cell has no art at all. */
export function isEmptyCell(sheet, row, col) {
  const x0 = col * TILE;
  const y0 = row * TILE;
  for (let y = y0; y < y0 + TILE; y += 1) {
    for (let x = x0; x < x0 + TILE; x += 1) {
      if (isInk(sheet, x, y)) return false;
    }
  }
  return true;
}

/** Which of a cell's four edges carry art in their outermost pixel row/column. */
export function edgeInk(sheet, row, col) {
  const x0 = col * TILE;
  const y0 = row * TILE;
  const out = { top: false, bottom: false, left: false, right: false };
  for (let i = 0; i < TILE; i += 1) {
    if (isInk(sheet, x0 + i, y0)) out.top = true;
    if (isInk(sheet, x0 + i, y0 + TILE - 1)) out.bottom = true;
    if (isInk(sheet, x0, y0 + i)) out.left = true;
    if (isInk(sheet, x0 + TILE - 1, y0 + i)) out.right = true;
  }
  return out;
}

/**
 * How many of the 48 pixels along one outer edge of a cell are see-through.
 *
 * This is what separates "a cut-out object" from "a square of material" when you only get to look
 * at the cells a map actually drew. A terrain quadrant stamped on top of the ground is opaque all
 * the way to its border on every side; a house has sky around its roofline, a barrel has sand
 * around its staves. Counting the transparent border pixels of a whole stamped shape answers the
 * question without needing to know which palette entry drew it.
 */
export function transparentEdgePixels(sheet, row, col, side) {
  const x0 = col * TILE;
  const y0 = row * TILE;
  let count = 0;
  for (let i = 0; i < TILE; i += 1) {
    const x = side === "left" ? x0 : side === "right" ? x0 + TILE - 1 : x0 + i;
    const y = side === "top" ? y0 : side === "bottom" ? y0 + TILE - 1 : y0 + i;
    if (alphaAt(sheet, x, y) < ALPHA_FLOOR) count += 1;
  }
  return count;
}

/**
 * Finds the connected ink blobs inside a bounded pixel region, 8-connected.
 *
 * Bounded, not whole-sheet, and that matters. A whole-sheet flood fill is meaningless on these
 * packs: terrain is one enormous opaque region, so every grass tile "measures" as 13x16, and a
 * run of fence rail that legitimately tiles edge-to-edge fuses with everything it touches. The
 * question worth asking is always local — "does this particular rect cut through art, and does it
 * catch a second sprite" — so the fill is scoped to the rect plus a one-tile margin.
 *
 * 8-connected because these sprites have diagonal outlines; a 4-connected fill walks off a palm
 * frond and stops halfway through the crown.
 */
function blobsInRegion(sheet, region) {
  const { x1, y1, x2, y2 } = region;
  const w = x2 - x1;
  const h = y2 - y1;
  const label = new Int32Array(w * h).fill(-1);
  const blobs = [];

  for (let sy = 0; sy < h; sy += 1) {
    for (let sx = 0; sx < w; sx += 1) {
      const start = sy * w + sx;
      if (label[start] !== -1 || !isInk(sheet, x1 + sx, y1 + sy)) continue;
      const id = blobs.length;
      const blob = {
        id,
        pixels: 0,
        box: { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity },
      };
      const stack = [start];
      label[start] = id;
      while (stack.length > 0) {
        const index = stack.pop();
        const lx = index % w;
        const ly = (index - lx) / w;
        const px = x1 + lx;
        const py = y1 + ly;
        blob.pixels += 1;
        if (px < blob.box.x1) blob.box.x1 = px;
        if (py < blob.box.y1) blob.box.y1 = py;
        if (px + 1 > blob.box.x2) blob.box.x2 = px + 1;
        if (py + 1 > blob.box.y2) blob.box.y2 = py + 1;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const nx = lx + dx;
            const ny = ly + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const n = ny * w + nx;
            if (label[n] !== -1 || !isInk(sheet, x1 + nx, y1 + ny)) continue;
            label[n] = id;
            stack.push(n);
          }
        }
      }
      blobs.push(blob);
    }
  }
  return { blobs, label, region };
}

const labelAt = (found, x, y) => {
  const { region, label } = found;
  if (x < region.x1 || y < region.y1 || x >= region.x2 || y >= region.y2) return -1;
  return label[(y - region.y1) * (region.x2 - region.x1) + (x - region.x1)];
};

function tileBoxOf(box) {
  return {
    row1: Math.floor(box.y1 / TILE),
    col1: Math.floor(box.x1 / TILE),
    row2: Math.ceil(box.y2 / TILE),
    col2: Math.ceil(box.x2 / TILE),
  };
}

/**
 * Checks a palette entry's declared footprint against the pixels.
 *
 * Verdicts:
 *   terrain      the anchor cell is full-bleed — a ground tile. Footprint is meaningless for it;
 *                what matters instead is that it is only ever drawn on a `ground` layer.
 *   clean        the declared rect is exactly the art's tile-aligned bounds
 *   oversized    the rect is bigger than the art (harmless, but wastes cells)
 *   clipped      the art continues past the rect — a cut-off tree, half a barrel, a sliced log
 *   contaminated the rect catches a *second* sprite — the apple-sliver-beside-the-birch defect
 *   empty        nothing is drawn at the anchor
 */
export async function classifyFootprint(sheetPath, row, col, height, width) {
  const sheet = await loadSheet(sheetPath);
  const base = { sheet: sheetPath, row, col, declared: { height, width } };

  if (isFullBleed(sheet, row, col)) return { ...base, verdict: "terrain" };
  // Deliberately no "is the anchor cell empty" short-circuit: pack-objects.js bottom-anchors every
  // sprite it repacks, so a tall footprint's top-left cell is often legitimately blank — the art
  // is down in the last rows where the ground-contact row has to be. Emptiness is decided below,
  // over the whole rect.

  const declared = { row1: row, col1: col, row2: row + height, col2: col + width };
  // One tile of margin so "the art continues outside the rect" is visible.
  const region = {
    x1: Math.max(0, (declared.col1 - 1) * TILE),
    y1: Math.max(0, (declared.row1 - 1) * TILE),
    x2: Math.min(sheet.width, (declared.col2 + 1) * TILE),
    y2: Math.min(sheet.height, (declared.row2 + 1) * TILE),
  };
  const found = blobsInRegion(sheet, region);

  // The sprite is whichever blob covers the most pixels inside the declared rect.
  const insideCount = new Map();
  for (let y = declared.row1 * TILE; y < declared.row2 * TILE; y += 1) {
    for (let x = declared.col1 * TILE; x < declared.col2 * TILE; x += 1) {
      const id = labelAt(found, x, y);
      if (id >= 0) insideCount.set(id, (insideCount.get(id) || 0) + 1);
    }
  }
  if (insideCount.size === 0) return { ...base, verdict: "empty" };

  let mainId = -1;
  let best = -1;
  for (const [id, count] of insideCount) {
    if (count > best) {
      best = count;
      mainId = id;
    }
  }
  const main = found.blobs[mainId];
  const tileBox = tileBoxOf(main.box);

  const clipped =
    tileBox.row1 < declared.row1 ||
    tileBox.col1 < declared.col1 ||
    tileBox.row2 > declared.row2 ||
    tileBox.col2 > declared.col2;

  // Foreign ink is ink from a blob that *continues outside* the rect. A second blob lying wholly
  // inside it is part of the same object — a detached chimney, a cast shadow, a spray of blossom
  // the outline doesn't quite connect — and counting those would flag half the library.
  //
  // It is also only a defect at a visible scale. These packs abut sprites tightly: four palms in a
  // row each bleed one to three pixels of frond into the next column, and flagging that would bury
  // the real finds. What the shipped maps actually showed was a 19px-wide slice of a fruiting apple
  // tree standing beside a birch — over a thousand pixels. Require both an absolute and a relative
  // floor so neither a large sprite nor a small one gets a free pass.
  const rect = {
    x1: declared.col1 * TILE,
    y1: declared.row1 * TILE,
    x2: declared.col2 * TILE,
    y2: declared.row2 * TILE,
  };
  const escapes = (blob) =>
    blob.box.x1 < rect.x1 ||
    blob.box.y1 < rect.y1 ||
    blob.box.x2 > rect.x2 ||
    blob.box.y2 > rect.y2;
  const foreign = [...insideCount].reduce(
    (sum, [id, count]) => (id === mainId || !escapes(found.blobs[id]) ? sum : sum + count),
    0
  );
  const contaminated = foreign > FOREIGN_INK_FLOOR && foreign > main.pixels * FOREIGN_INK_SHARE;
  const oversized =
    !clipped &&
    (tileBox.row1 > declared.row1 ||
      tileBox.col1 > declared.col1 ||
      tileBox.row2 < declared.row2 ||
      tileBox.col2 < declared.col2);

  let verdict = "clean";
  if (clipped && contaminated) verdict = "clipped+contaminated";
  else if (clipped) verdict = "clipped";
  else if (contaminated) verdict = "contaminated";
  else if (oversized) verdict = "oversized";

  return {
    ...base,
    verdict,
    measured: {
      row: tileBox.row1,
      col: tileBox.col1,
      height: tileBox.row2 - tileBox.row1,
      width: tileBox.col2 - tileBox.col1,
    },
    pixelBox: main.box,
    pixels: main.pixels,
    blobsInRect: insideCount.size,
    clipped,
    contaminated,
  };
}

/**
 * The tight tile rect for the sprite at (row, col), plus whether that rect can be stamped at all.
 *
 * Iterates: measure the blob, take its tile bounds, re-measure at those bounds (which may now
 * reach further, as growing the rect can expose more of the same sprite), and settle. Then asks
 * the question that decides whether the sprite is usable as-is — does even its own tight rect
 * catch a neighbouring sprite? If so, no whole-tile rect can ever draw it cleanly and it has to be
 * repacked onto its own grid by scripts/assets/pack-objects.js.
 */
export async function tightFootprint(sheetPath, row, col) {
  const sheet = await loadSheet(sheetPath);
  if (isFullBleed(sheet, row, col)) {
    return { row, col, height: 1, width: 1, terrain: true, needsRepack: false };
  }

  let rect = { row, col, height: 1, width: 1 };
  for (let pass = 0; pass < 6; pass += 1) {
    const result = await classifyFootprint(sheetPath, rect.row, rect.col, rect.height, rect.width);
    if (result.verdict === "empty") return null;
    // Growing the rect can move its anchor onto a full-bleed cell (an object drawn against a
    // painted background rather than transparency). There is nothing more to measure then.
    if (!result.measured) break;
    const next = {
      row: Math.min(rect.row, result.measured.row),
      col: Math.min(rect.col, result.measured.col),
    };
    next.height =
      Math.max(rect.row + rect.height, result.measured.row + result.measured.height) - next.row;
    next.width =
      Math.max(rect.col + rect.width, result.measured.col + result.measured.width) - next.col;
    if (
      next.row === rect.row &&
      next.col === rect.col &&
      next.height === rect.height &&
      next.width === rect.width
    ) {
      break;
    }
    rect = next;
  }

  const settled = await classifyFootprint(sheetPath, rect.row, rect.col, rect.height, rect.width);
  return {
    ...rect,
    terrain: false,
    pixelBox: settled.pixelBox || { x1: 0, y1: 0, x2: 0, y2: 0 },
    /** True when the tight rect also catches a neighbouring sprite — this sprite needs repacking. */
    needsRepack: Boolean(settled.contaminated),
  };
}
