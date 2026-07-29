// Composites a .tmj into a flat PNG so a map can be checked without starting the dev server.
//
// This is the cheap rung of the verification ladder for map work: `npm run test:e2e` will tell
// you a screenshot changed, and the browser will tell you how it feels to walk around, but
// neither answers "is the art laid out the way I intended" in a few seconds. Output goes to the
// gitignored reports/assets/maps/.
//
// Optionally overlays the collision rects and NPC/quest markers passed via --overlay=<json>,
// which is how a map's hand-written main.js coordinates get checked against its painted art by
// eye rather than only by tests/unit/field-map-coordinates.test.js.
//
// Usage:
//   node scripts/assets/preview-map.js apps/web/src/content/maps/caribbean-field.tmj
//   node scripts/assets/preview-map.js <map.tmj> --overlay=reports/caribbean-overlay.json
import { Buffer } from "node:buffer";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TILESET_ROOT = path.join(REPO_ROOT, "apps/web/src/assets/tilesets");
const OUT_DIR = path.join(REPO_ROOT, "reports/assets/maps");

function tilesetImagePath(tileset) {
  const normalized = String(tileset.image).replace(/\\/g, "/");
  const marker = "assets/tilesets/";
  const index = normalized.indexOf(marker);
  const tail = index === -1 ? normalized : normalized.slice(index + marker.length);
  return path.join(TILESET_ROOT, tail);
}

function tilesetForGid(tilesets, gid) {
  for (let i = tilesets.length - 1; i >= 0; i -= 1) {
    if (gid >= tilesets[i].firstgid) return tilesets[i];
  }
  return null;
}

async function main() {
  const mapArg = process.argv[2];
  if (!mapArg) {
    console.error("usage: node scripts/assets/preview-map.js <map.tmj> [--overlay=<json>]");
    process.exit(1);
  }
  const overlayArg = process.argv.find((a) => a.startsWith("--overlay="));
  const tmj = JSON.parse(readFileSync(path.resolve(REPO_ROOT, mapArg), "utf8"));

  const width = tmj.width * tmj.tilewidth;
  const height = tmj.height * tmj.tileheight;

  // Each source sheet is decoded once and kept as raw RGBA; per-tile sharp calls would be
  // thousands of image decodes for a 56x36 map.
  const sheets = new Map();
  for (const tileset of tmj.tilesets) {
    const file = tilesetImagePath(tileset);
    if (!existsSync(file)) throw new Error(`missing tileset image: ${file}`);
    const { data, info } = await sharp(file)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    sheets.set(tileset.name, { data, width: info.width, height: info.height });
  }

  const canvas = Buffer.alloc(width * height * 4, 0);
  function blit(sheet, sx, sy, dx, dy, w, h) {
    for (let row = 0; row < h; row += 1) {
      const srcY = sy + row;
      const dstY = dy + row;
      if (srcY < 0 || srcY >= sheet.height || dstY < 0 || dstY >= height) continue;
      for (let col = 0; col < w; col += 1) {
        const srcX = sx + col;
        const dstX = dx + col;
        if (srcX < 0 || srcX >= sheet.width || dstX < 0 || dstX >= width) continue;
        const s = (srcY * sheet.width + srcX) * 4;
        const alpha = sheet.data[s + 3];
        if (alpha === 0) continue; // preserve what is already painted underneath
        const d = (dstY * width + dstX) * 4;
        if (alpha === 255) {
          canvas[d] = sheet.data[s];
          canvas[d + 1] = sheet.data[s + 1];
          canvas[d + 2] = sheet.data[s + 2];
          canvas[d + 3] = 255;
        } else {
          const a = alpha / 255;
          canvas[d] = Math.round(sheet.data[s] * a + canvas[d] * (1 - a));
          canvas[d + 1] = Math.round(sheet.data[s + 1] * a + canvas[d + 1] * (1 - a));
          canvas[d + 2] = Math.round(sheet.data[s + 2] * a + canvas[d + 2] * (1 - a));
          canvas[d + 3] = Math.max(canvas[d + 3], alpha);
        }
      }
    }
  }

  for (const layer of tmj.layers) {
    if (layer.type !== "tilelayer" || layer.visible === false) continue;
    for (let row = 0; row < layer.height; row += 1) {
      for (let col = 0; col < layer.width; col += 1) {
        const gid = layer.data[row * layer.width + col];
        if (!gid) continue;
        const tileset = tilesetForGid(tmj.tilesets, gid);
        if (!tileset) continue;
        const sheet = sheets.get(tileset.name);
        const localId = gid - tileset.firstgid;
        const sx = (localId % tileset.columns) * tileset.tilewidth;
        const sy = Math.floor(localId / tileset.columns) * tileset.tileheight;
        const dx = col * tmj.tilewidth;
        // Matches tiled-map-loader.js: larger-than-grid tiles anchor by their bottom edge.
        const dy = (row + 1) * tmj.tileheight - tileset.tileheight;
        blit(sheet, sx, sy, dx, dy, tileset.tilewidth, tileset.tileheight);
      }
    }
  }

  let image = sharp(canvas, { raw: { width, height, channels: 4 } });

  if (overlayArg) {
    const overlay = JSON.parse(readFileSync(path.resolve(REPO_ROOT, overlayArg.slice(10)), "utf8"));
    const t = tmj.tilewidth;
    const parts = [];
    for (const b of overlay.blocks || []) {
      parts.push(
        `<rect x="${b.x1 * t}" y="${b.y1 * t}" width="${(b.x2 - b.x1) * t}" height="${(b.y2 - b.y1) * t}" fill="rgba(255,0,80,0.30)" stroke="#ff0050" stroke-width="2"/>`
      );
    }
    for (const n of overlay.npcs || []) {
      parts.push(
        `<circle cx="${n.x * t}" cy="${n.y * t}" r="14" fill="rgba(0,200,255,0.55)" stroke="#00ffff" stroke-width="3"/>` +
          `<text x="${n.x * t + 18}" y="${n.y * t + 5}" font-size="17" font-family="monospace" fill="#00ffff" stroke="#000" stroke-width="4" paint-order="stroke">${n.id}</text>`
      );
    }
    for (const p of overlay.points || []) {
      parts.push(
        `<rect x="${p.x * t - 11}" y="${p.y * t - 11}" width="22" height="22" fill="rgba(255,220,0,0.7)" stroke="#000" stroke-width="2"/>` +
          `<text x="${p.x * t + 16}" y="${p.y * t + 5}" font-size="17" font-family="monospace" fill="#ffdc00" stroke="#000" stroke-width="4" paint-order="stroke">${p.id}</text>`
      );
    }
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${parts.join("")}</svg>`;
    image = sharp(await image.png().toBuffer()).composite([
      { input: Buffer.from(svg), top: 0, left: 0 },
    ]);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const outName =
    path.basename(mapArg).replace(/\.tmj$/, "") + (overlayArg ? ".coords" : "") + ".png";
  const outPath = path.join(OUT_DIR, outName);
  await image.png().toFile(outPath);
  console.log(`wrote ${path.relative(REPO_ROOT, outPath)}  (${width}x${height})`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
