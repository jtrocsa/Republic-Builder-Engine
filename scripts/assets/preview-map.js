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
// The tile compositing itself lives in scripts/lib/composite-tmj.js, shared with the field guide
// generator. This file is the CLI and the overlay.
//
// Usage:
//   node scripts/assets/preview-map.js apps/web/src/content/maps/caribbean-field.tmj
//   node scripts/assets/preview-map.js <map.tmj> --overlay=reports/caribbean-overlay.json
import { Buffer } from "node:buffer";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";

import { compositeTmj, REPO_ROOT } from "../lib/composite-tmj.js";

const OUT_DIR = path.join(REPO_ROOT, "reports/assets/maps");

async function main() {
  const mapArg = process.argv[2];
  if (!mapArg) {
    console.error("usage: node scripts/assets/preview-map.js <map.tmj> [--overlay=<json>]");
    process.exit(1);
  }
  const overlayArg = process.argv.find((a) => a.startsWith("--overlay="));

  const { canvas, width, height, tmj } = await compositeTmj(mapArg);

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
