// Measures sprite footprints against the pixels, so nobody has to guess a multi-tile object's
// size. This is the tool that replaced "declare 3x2 in a comment and hope".
//
// Usage:
//   npm run assets:measure -- "farm/6.png" 0 8            measure one sprite at (row, col)
//   npm run assets:measure -- "farm/6.png" 0 8 3 2        check a declared 3-row x 2-col rect
//   npm run assets:measure -- --audit                     audit every entry in every live palette
//   npm run assets:measure -- --alpha "farm/6.png"        alpha histogram (is this sheet keyed?)
//
// --audit is the important mode: it walks all five map palettes, classifies every declared
// footprint, and prints the exact fix list grouped by verdict. Nothing downstream should be
// hand-edited before that report is read.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  REPO_ROOT,
  TILE,
  classifyFootprint,
  loadSheet,
  tightFootprint,
} from "./lib/sprite-geometry.js";

const PALETTE_DIR = path.join(REPO_ROOT, "apps/web/src/content/tilesets/maps");

async function alphaHistogram(sheetPath) {
  const sheet = await loadSheet(sheetPath);
  let opaque = 0;
  let clear = 0;
  let partial = 0;
  for (let i = 3; i < sheet.data.length; i += 4) {
    const a = sheet.data[i];
    if (a === 255) opaque += 1;
    else if (a === 0) clear += 1;
    else partial += 1;
  }
  const total = opaque + clear + partial;
  const pct = (n) => ((100 * n) / total).toFixed(1).padStart(5);
  console.log(
    `${sheetPath}  ${sheet.width}x${sheet.height} (${sheet.cols}x${sheet.rows} tiles)  ` +
      `opaque ${pct(opaque)}%  transparent ${pct(clear)}%  partial ${pct(partial)}%`
  );
  if (clear === 0) {
    console.log(
      "  !! no fully transparent pixels anywhere. This sheet is background-keyed, not alpha-cut; " +
        "sprite-geometry.js's flood fill will treat the whole sheet as one blob."
    );
  }
}

// The generators call gidRect(entry, height, width) with literals. Until Phase 53 moves the
// footprint into the palette entry itself, the declared sizes have to be read back out of the
// generator source — which is exactly the duplication being removed.
function declaredFootprintsFromGenerators() {
  const declared = new Map(); // "paletteId::tileName" -> {height, width}
  const scriptsDir = path.join(REPO_ROOT, "scripts");
  for (const file of readdirSync(scriptsDir)) {
    if (!/^generate-.*-tmj\.js$/.test(file)) continue;
    const text = readFileSync(path.join(scriptsDir, file), "utf8");
    const mapId = file.replace(/^generate-/, "").replace(/-tmj\.js$/, "");
    for (const match of text.matchAll(/gidRect\(\s*T\.(\w+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g)) {
      declared.set(`${mapId}::${match[1]}`, {
        height: Number(match[2]),
        width: Number(match[3]),
      });
    }
    // gid(T.foo) with no rect means the generator draws it as a single cell.
    for (const match of text.matchAll(/\bgid\(\s*T\.(\w+)\s*\)/g)) {
      const key = `${mapId}::${match[1]}`;
      if (!declared.has(key)) declared.set(key, { height: 1, width: 1 });
    }
  }
  return declared;
}

async function audit() {
  const declared = declaredFootprintsFromGenerators();
  const buckets = new Map();
  const push = (verdict, line) => {
    if (!buckets.has(verdict)) buckets.set(verdict, []);
    buckets.get(verdict).push(line);
  };

  const paletteFiles = readdirSync(PALETTE_DIR)
    .filter((f) => f.endsWith(".palette.js"))
    .sort();

  for (const file of paletteFiles) {
    const mod = await import(pathToFileURL(path.join(PALETTE_DIR, file)).href);
    const palette = mod.default;
    const mapId = palette.id;
    // A palette id like "caribbean-field" maps to generate-caribbean-tmj.js -> "caribbean".
    const generatorKeys = [mapId, mapId.replace(/-field$/, ""), mapId.replace(/-room$/, "")];

    for (const [name, entry] of Object.entries(palette.tiles)) {
      if (!entry || typeof entry.row !== "number") continue;
      let size = null;
      for (const key of generatorKeys) {
        if (declared.has(`${key}::${name}`)) {
          size = declared.get(`${key}::${name}`);
          break;
        }
      }
      if (!size) {
        push("unused", `${mapId}  ${name}  (${entry.row},${entry.col})  ${entry.sheet}`);
        continue;
      }

      const result = await classifyFootprint(
        entry.sheet,
        entry.row,
        entry.col,
        size.height,
        size.width
      );
      if (result.verdict === "terrain") {
        push(
          "terrain",
          `${mapId.padEnd(19)} ${name.padEnd(22)} full-bleed at (${entry.row},${entry.col})` +
            `   ${entry.sheet}` +
            (size.height * size.width > 1 ? `   !! stamped as ${size.height}x${size.width}` : "")
        );
        continue;
      }

      const tight = await tightFootprint(entry.sheet, entry.row, entry.col);
      const measured = tight
        ? `art is ${tight.height}x${tight.width} at (${tight.row},${tight.col})`
        : "no art";
      const repack = tight?.needsRepack ? "  NEEDS-REPACK" : "";
      push(
        result.verdict,
        `${mapId.padEnd(19)} ${name.padEnd(22)} declared ${size.height}x${size.width}` +
          ` at (${entry.row},${entry.col})  ${measured}${repack}   ${entry.sheet}`
      );
    }
  }

  const order = [
    "clipped+contaminated",
    "contaminated",
    "clipped",
    "oversized",
    "empty",
    "terrain",
    "clean",
    "unused",
  ];
  for (const verdict of order) {
    const lines = buckets.get(verdict);
    if (!lines || lines.length === 0) continue;
    console.log(`\n=== ${verdict.toUpperCase()} (${lines.length}) ===`);
    for (const line of lines.sort()) console.log("  " + line);
  }
  const broken = order.slice(0, 3).reduce((sum, v) => sum + (buckets.get(v)?.length || 0), 0);
  console.log(`\n${broken} entries render cut-off or contaminated art.`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--audit") return audit();
  if (args[0] === "--alpha") {
    for (const sheet of args.slice(1)) await alphaHistogram(sheet);
    return;
  }
  const [sheet, row, col, height, width] = args;
  if (!sheet || row === undefined || col === undefined) {
    console.error(
      'usage: measure-sprite.js "<Pack>/<sheet>.png" <row> <col> [height width]\n' +
        "       measure-sprite.js --audit\n" +
        '       measure-sprite.js --alpha "<Pack>/<sheet>.png"'
    );
    process.exit(1);
  }
  const tight = await tightFootprint(sheet, Number(row), Number(col));
  if (!tight) {
    console.log(`(${row},${col}) on ${sheet} is empty.`);
    return;
  }
  if (tight.terrain) {
    console.log(
      `(${row},${col}) on ${sheet} is full-bleed terrain — every pixel opaque. It is a 1x1 ground ` +
        `tile; footprint does not apply. It must never be stamped on structures/overlay.`
    );
    return;
  }
  console.log(
    `art occupies ${tight.height} rows x ${tight.width} cols at (${tight.row},${tight.col})` +
      `  pixels ${tight.pixelBox.x1},${tight.pixelBox.y1}-${tight.pixelBox.x2},${tight.pixelBox.y2}` +
      `  (tile grid = ${TILE}px)`
  );
  if (tight.needsRepack) {
    console.log(
      "  NEEDS-REPACK: even its own tight rect catches a neighbouring sprite's pixels, so no " +
        "whole-tile rect can draw it cleanly. Repack it via scripts/assets/pack-objects.js."
    );
  }
  if (height !== undefined && width !== undefined) {
    const result = await classifyFootprint(
      sheet,
      Number(row),
      Number(col),
      Number(height),
      Number(width)
    );
    console.log(`declared ${height}x${width} -> ${result.verdict}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
