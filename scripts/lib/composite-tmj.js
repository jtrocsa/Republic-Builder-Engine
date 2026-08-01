// Composites a .tmj's tile layers into a flat RGBA buffer.
//
// Extracted from scripts/assets/preview-map.js when the field guide generator needed the same
// thing. There is one blitter rather than two on purpose: the anchoring rule below is subtle, was
// derived from tiled-map-loader.js, and a second hand-written copy would drift the first time
// somebody fixed one and not the other.
//
// Nothing here knows about overlays, output files or sharp — callers own all three.

import { Buffer } from "node:buffer";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TILESET_ROOT = path.join(REPO_ROOT, "apps/web/src/assets/tilesets");

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

/**
 * Paints every visible tile layer of a `.tmj` into one RGBA buffer.
 *
 * @param {string} mapPath  path to the .tmj, absolute or relative to the repo root
 * @returns {Promise<{canvas: Buffer, width: number, height: number, tmj: object}>}
 */
export async function compositeTmj(mapPath) {
  const tmj = JSON.parse(readFileSync(path.resolve(REPO_ROOT, mapPath), "utf8"));

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

  return { canvas, width, height, tmj };
}
