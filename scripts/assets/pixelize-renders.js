// Turns a Blender job's renders into a Chronicle Commissions strip (decision log 0152).
//
// scripts/blender/lib/pixel_render.py renders every object twice at SUPERSAMPLE times its final
// size — a flat colour pass and a seam pass that gives each part one flat colour of its own. This
// reduces each pair to pixel art the way the office packs are drawn:
//
//   1. Majority vote per block. A block is ink if at least half of it is, and takes its most common
//      colour — never an average, which is what makes a downscale look like a shrunk photograph.
//   2. Seams. Where the seam pass changes between two inked pixels, the lower/right one is darkened,
//      so every part gets a one-pixel line where it meets another — the drawer-front lines the
//      packs draw. The pixel just inside each part's top and left line is lightened — the bevel
//      office/1 puts on every drawer — and each part darkens in three steps toward its foot.
//   3. Edge. Every inked pixel touching transparency is darkened further. The packs outline in the
//      object's own colour darkened, not in black: office/1's edge pixels have a median luminance of
//      74 against fills of 140-220, and they are brown on wood and blue-grey on metal.
//   4. Trim, bottom-align on one baseline with 8px gutters, and write the strip that
//      derived-objects.manifest.js cuts from — exactly where a PixelLab commission goes.
//
// It also writes a scale preview beside the renders: the new objects on a real interior floor next
// to real office/1 furniture and Director Hale, at 2x. That picture is the acceptance test. The
// library's scale lessons (manifest, suburban-tract) were all invisible until an object stood
// beside a person on real ground.
//
// Boxes are printed EXCLUSIVE at x2/y2 — `pack-objects.js` computes width as x2 - x1.
//
// Usage: node scripts/assets/pixelize-renders.js <job>

import { Buffer } from "node:buffer";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";

import { REPO_ROOT, TILESET_ROOT } from "./lib/sprite-geometry.js";

const GAP = 8;
const SEAM_VALUE = 0.55;
const EDGE_VALUE = 0.42;
const HIGHLIGHT_VALUE = 1.12;
const FALLOFF = [1.0, 0.96, 0.92];

async function rgba(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function mode(counts) {
  let best = null;
  let bestCount = -1;
  // Ties go to the smaller key so the output never depends on Map iteration order.
  for (const [key, count] of counts) {
    if (count > bestCount || (count === bestCount && key < best)) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}

async function pixelize(folder, entry) {
  const color = await rgba(path.join(folder, entry.color));
  const seams = await rgba(path.join(folder, entry.id));
  const S = entry.supersample;
  const W = entry.widthPx;
  const H = entry.heightPx;
  if (color.width !== W * S || color.height !== H * S) {
    throw new Error(
      `${entry.name}: render is ${color.width}x${color.height}, expected ${W * S}x${H * S}`
    );
  }

  const out = Buffer.alloc(W * H * 4, 0);
  const region = new Int32Array(W * H).fill(-1);
  for (let by = 0; by < H; by += 1) {
    for (let bx = 0; bx < W; bx += 1) {
      const colours = new Map();
      const ids = new Map();
      let ink = 0;
      for (let sy = 0; sy < S; sy += 1) {
        for (let sx = 0; sx < S; sx += 1) {
          const i = ((by * S + sy) * color.width + bx * S + sx) * 4;
          if (color.data[i + 3] < 128) continue;
          ink += 1;
          const c = (color.data[i] << 16) | (color.data[i + 1] << 8) | color.data[i + 2];
          colours.set(c, (colours.get(c) || 0) + 1);
          const s = (seams.data[i] << 16) | (seams.data[i + 1] << 8) | seams.data[i + 2];
          ids.set(s, (ids.get(s) || 0) + 1);
        }
      }
      if (ink * 2 < S * S) continue;
      const c = mode(colours);
      const o = (by * W + bx) * 4;
      out[o] = (c >> 16) & 255;
      out[o + 1] = (c >> 8) & 255;
      out[o + 2] = c & 255;
      out[o + 3] = 255;
      region[by * W + bx] = mode(ids);
    }
  }

  const inked = (x, y) => x >= 0 && y >= 0 && x < W && y < H && region[y * W + x] !== -1;

  // Each part's vertical extent, for the falloff below.
  const extent = new Map();
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (!inked(x, y)) continue;
      const id = region[y * W + x];
      const e = extent.get(id) || { top: y, bottom: y };
      e.bottom = y;
      extent.set(id, e);
    }
  }

  const shade = new Float32Array(W * H).fill(1);
  const line = new Uint8Array(W * H);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (!inked(x, y)) continue;
      const p = y * W + x;
      const id = region[p];
      if (!inked(x - 1, y) || !inked(x + 1, y) || !inked(x, y - 1) || !inked(x, y + 1)) {
        shade[p] = EDGE_VALUE;
        line[p] = 1;
      } else if (region[p - 1] !== id || region[p - W] !== id) {
        shade[p] = SEAM_VALUE;
        line[p] = 1;
      }
    }
  }
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const p = y * W + x;
      if (!inked(x, y) || line[p]) continue;
      // The bevel: the row and column just inside a part's top and left lines catch the light,
      // which is how office/1 draws every drawer front and door panel.
      if ((y > 0 && line[p - W]) || (x > 0 && line[p - 1])) {
        shade[p] = HIGHLIGHT_VALUE;
        continue;
      }
      // And a part darkens a little toward its foot, in three bands rather than a smooth ramp.
      const e = extent.get(region[p]);
      const t = e.bottom > e.top ? (y - e.top) / (e.bottom - e.top) : 0;
      shade[p] = FALLOFF[Math.min(FALLOFF.length - 1, Math.floor(t * FALLOFF.length))];
    }
  }
  for (let p = 0; p < W * H; p += 1) {
    if (shade[p] === 1 || region[p] === -1) continue;
    for (let k = 0; k < 3; k += 1)
      out[p * 4 + k] = Math.min(255, Math.round(out[p * 4 + k] * shade[p]));
  }

  // Trim to the ink.
  let x1 = W;
  let y1 = H;
  let x2 = -1;
  let y2 = -1;
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (!inked(x, y)) continue;
      x1 = Math.min(x1, x);
      y1 = Math.min(y1, y);
      x2 = Math.max(x2, x);
      y2 = Math.max(y2, y);
    }
  }
  const w = x2 - x1 + 1;
  const h = y2 - y1 + 1;
  const trimmed = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    out.copy(trimmed, y * w * 4, ((y + y1) * W + x1) * 4, ((y + y1) * W + x2 + 1) * 4);
  }
  return { name: entry.name, data: trimmed, width: w, height: h };
}

async function png(sprite) {
  return sharp(sprite.data, { raw: { width: sprite.width, height: sprite.height, channels: 4 } })
    .png()
    .toBuffer();
}

async function compose(sprites, outPath) {
  const H = Math.max(...sprites.map((s) => s.height));
  const W = sprites.reduce((sum, s) => sum + s.width + GAP, 0) - GAP;
  const composites = [];
  const boxes = [];
  let x = 0;
  for (const sprite of sprites) {
    const top = H - sprite.height;
    composites.push({ input: await png(sprite), left: x, top });
    boxes.push({
      name: sprite.name,
      box: [x, top, x + sprite.width, H],
      size: `${sprite.width}x${sprite.height}`,
    });
    x += sprite.width + GAP;
  }
  await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  return { W, H, boxes };
}

// The scale preview: real floor, real furniture, a real person, then the new objects, at 2x.
async function scene(sprites, outPath) {
  const T = 48;
  const floorSheet = path.join(TILESET_ROOT, "19th Century European City/tile-B-04.png");
  const office = path.join(TILESET_ROOT, "office/1.png");
  const hale = path.join(
    REPO_ROOT,
    "apps/web/src/assets/institute/director-rowan-hale-idle-down.png"
  );
  const cut = async (file, left, top, width, height) => ({
    width,
    height,
    input: await sharp(file).extract({ left, top, width, height }).png().toBuffer(),
  });
  const person = await cut(hale, 0, 0, 48, 56);
  const references = [
    person,
    await cut(office, 336, 414, 48, 67), // counter cabinet
    await cut(office, 240, 409, 48, 71), // copier
    await cut(office, 0, 14, 96, 82), // a workstation — the reader's nearest relative
  ];
  const items = [
    ...references,
    ...(await Promise.all(
      sprites.map(async (s) => ({ width: s.width, height: s.height, input: await png(s) }))
    )),
    person,
  ];

  const gapX = 16;
  const W = Math.ceil(items.reduce((sum, i) => sum + i.width + gapX, gapX) / T) * T;
  const H = 4 * T;
  const baseline = H - T;
  const floor = await sharp(floorSheet)
    .extract({ left: 6 * T, top: 2 * T, width: 2 * T, height: 2 * T })
    .png()
    .toBuffer();
  const composites = [];
  for (let y = 0; y < H; y += 2 * T)
    for (let x = 0; x < W; x += 2 * T) composites.push({ input: floor, left: x, top: y });
  let x = gapX;
  for (const item of items) {
    composites.push({ input: item.input, left: x, top: baseline - item.height });
    x += item.width + gapX;
  }
  const flat = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 255 } },
  })
    .composite(composites)
    .png()
    .toBuffer();
  await sharp(flat)
    .resize(W * 2, H * 2, { kernel: "nearest" })
    .png()
    .toFile(outPath);
}

const job = process.argv[2];
if (!job) {
  console.error("usage: node scripts/assets/pixelize-renders.js <job>");
  process.exit(1);
}
const folder = path.join(REPO_ROOT, "reports", "blender", job);
const manifest = JSON.parse(readFileSync(path.join(folder, "job.json"), "utf8"));
const sprites = [];
for (const entry of manifest.objects) sprites.push(await pixelize(folder, entry));

const strip = path.join(TILESET_ROOT, "Chronicle Commissions", `${job}.png`);
const { W, H, boxes } = await compose(sprites, strip);
const previewPath = path.join(folder, `${job}-scene.png`);
await scene(sprites, previewPath);

const measured = manifest.objects.map(
  (o) =>
    `${o.name}: ${o.pxPerM} px/m wide, ${o.frontPxPerM} front, ${o.topPxPerM} top, pitch ${o.pitchDeg}°`
);
writeFileSync(
  path.join(folder, "boxes.txt"),
  boxes.map((b) => JSON.stringify(b)).join("\n") + "\n"
);
console.log(`strip   ${W}x${H} -> ${path.relative(REPO_ROOT, strip)}`);
console.log(`preview ${path.relative(REPO_ROOT, previewPath)}\n`);
for (const line of measured) console.log(`  ${line}`);
console.log("\nmanifest boxes (exclusive x2/y2):");
for (const b of boxes)
  console.log(`  { name: "${b.name}", box: [${b.box.join(", ")}] }, // ${b.size}`);
