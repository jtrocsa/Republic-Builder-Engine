#!/usr/bin/env node
// Renders a grid-labeled copy of a tileset sheet so tile coordinates can be READ rather than
// guessed, and prints an occupancy map of which cells actually contain art.
//
// This exists because the canonical-palette work needs exact (row, col) coordinates for every
// tile it names, and the only prior technique for getting them was ad hoc: see the comment in
// scripts/generate-caribbean-tmj.js ("Confirmed by direct grid-labeled inspection of the sheets
// (see /tmp/sheetB01-*.png, generated during authoring)") — a throwaway artifact in /tmp that no
// later session could reproduce. Committing the tool makes the catalog pass rerunnable.
//
// Read-only with respect to the asset tree: never modifies, moves, or deletes a source sheet.
// Output goes to reports/assets/labeled/, which is gitignored (same convention as audit.js).
//
// Usage:
//   node scripts/assets/label-tilesheet.js "Island survival/tile-B-01.png"
//   node scripts/assets/label-tilesheet.js --pack "Wild West"
//   node scripts/assets/label-tilesheet.js --all
//   ...optionally with --tile=48 --scale=2 --quiet

import { Buffer } from "node:buffer";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../..");
const TILESET_ROOT = path.join(REPO_ROOT, "apps", "web", "src", "assets", "tilesets");
const OUT_ROOT = path.join(REPO_ROOT, "reports", "assets", "labeled");

const DEFAULT_TILE = 48;
const DEFAULT_SCALE = 2; // 48px cells are too small to letter legibly at 1x.

function parseArgs(argv) {
  const options = {
    tile: DEFAULT_TILE,
    scale: DEFAULT_SCALE,
    quiet: false,
    pack: null,
    all: false,
  };
  const targets = [];
  for (const arg of argv) {
    if (arg === "--all") options.all = true;
    else if (arg === "--quiet") options.quiet = true;
    else if (arg.startsWith("--tile=")) options.tile = Number(arg.slice(7));
    else if (arg.startsWith("--scale=")) options.scale = Number(arg.slice(8));
    else if (arg.startsWith("--pack=")) options.pack = arg.slice(7);
    else if (arg === "--pack") options.pack = "__next__";
    else if (options.pack === "__next__") options.pack = arg;
    else targets.push(arg);
  }
  if (options.pack === "__next__") options.pack = null;
  return { options, targets };
}

// Sheets are named "<Pack>/<file>.png" everywhere else in this repo (.tmj tileset paths, main.js
// globs, the style guide), so that's the identifier this tool speaks too.
function resolveSheet(relPath) {
  const normalized = relPath.replace(/\\/g, "/").replace(/^.*assets\/tilesets\//, "");
  const absolute = path.join(TILESET_ROOT, normalized);
  if (!existsSync(absolute)) throw new Error(`No such sheet: ${normalized}`);
  return { relPath: normalized, absolute };
}

function listPackSheets(packName) {
  const dir = path.join(TILESET_ROOT, packName);
  if (!existsSync(dir) || !statSync(dir).isDirectory())
    throw new Error(`No such pack: ${packName}`);
  return readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .sort()
    .map((f) => `${packName}/${f}`);
}

function listAllSheets() {
  return readdirSync(TILESET_ROOT)
    .filter((entry) => statSync(path.join(TILESET_ROOT, entry)).isDirectory())
    .sort()
    .flatMap((pack) => listPackSheets(pack));
}

// A sheet is only addressable by tiled-map-loader.js if it divides evenly into the tile grid —
// the loader computes sx/sy as (localId % columns) * tilewidth, which silently produces
// misaligned source rects on an off-grid sheet rather than failing. Reporting it here is what
// lets the catalog mark such sheets UNUSABLE with a measured reason instead of a guess.
function gridFor(width, height, tile) {
  const cols = width / tile;
  const rows = height / tile;
  return { cols, rows, onGrid: Number.isInteger(cols) && Number.isInteger(rows) };
}

// Per-cell occupancy from the raw alpha channel. Fully transparent cells are padding in the
// source art, not tiles — excluding them keeps the catalog from listing empty coordinates.
async function occupancyMap(image, { cols, rows }, tile) {
  const { data, info } = await image
    .clone()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const grid = [];
  for (let row = 0; row < rows; row += 1) {
    const line = [];
    for (let col = 0; col < cols; col += 1) {
      let opaquePixels = 0;
      for (let y = 0; y < tile; y += 1) {
        const rowStart = ((row * tile + y) * info.width + col * tile) * channels;
        for (let x = 0; x < tile; x += 1) {
          if (data[rowStart + x * channels + (channels - 1)] > 8) opaquePixels += 1;
        }
      }
      line.push(opaquePixels / (tile * tile));
    }
    grid.push(line);
  }
  return grid;
}

// Density buckets, not raw numbers: what a human reading the printout needs is "is there art in
// this cell, and does it fill the cell" (a full-bleed terrain tile) versus "is it a sparse prop".
function densityGlyph(fraction) {
  if (fraction === 0) return ".";
  if (fraction < 0.25) return "-";
  if (fraction < 0.95) return "o";
  return "#";
}

function overlaySvg(width, height, { cols, rows }, tile, scale) {
  const step = tile * scale;
  const parts = [`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`];
  // Magenta reads clearly over every pack in this library (earth tones, greys, greens) and is
  // absent from all of them, so a grid line is never confused for art.
  for (let col = 0; col <= cols; col += 1) {
    const x = col * step;
    parts.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#ff00ff" stroke-width="1" opacity="0.55"/>`
    );
  }
  for (let row = 0; row <= rows; row += 1) {
    const y = row * step;
    parts.push(
      `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="#ff00ff" stroke-width="1" opacity="0.55"/>`
    );
  }
  const fontSize = Math.max(9, Math.round(step / 6));
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * step + 2;
      const y = row * step + fontSize;
      // Painted twice — black underlay then white — so the label stays readable on both the
      // light (sand, plaster) and dark (black-backed prop sheets) regions of the same sheet.
      parts.push(
        `<text x="${x}" y="${y}" font-family="monospace" font-size="${fontSize}" ` +
          `stroke="#000000" stroke-width="3" fill="#000000">${row},${col}</text>`,
        `<text x="${x}" y="${y}" font-family="monospace" font-size="${fontSize}" ` +
          `fill="#ffffff">${row},${col}</text>`
      );
    }
  }
  parts.push("</svg>");
  return Buffer.from(parts.join(""));
}

async function labelSheet(relPath, options) {
  const { absolute } = resolveSheet(relPath);
  const source = sharp(absolute);
  const { width, height } = await source.metadata();
  const grid = gridFor(width, height, options.tile);

  const result = {
    sheet: relPath,
    width,
    height,
    cols: grid.cols,
    rows: grid.rows,
    onGrid: grid.onGrid,
    outputPath: null,
    occupancy: null,
  };

  if (!grid.onGrid) {
    // Deliberately no labeled output: a grid overlay on an off-grid sheet would imply
    // coordinates that the loader cannot actually address, which is the exact mistake the
    // catalog needs to avoid recording.
    return result;
  }

  result.occupancy = await occupancyMap(source, grid, options.tile);

  const outWidth = width * options.scale;
  const outHeight = height * options.scale;
  const outputPath = path.join(OUT_ROOT, relPath.replace(/\.png$/i, `.grid.png`));
  mkdirSync(path.dirname(outputPath), { recursive: true });

  await source
    .clone()
    // Nearest-neighbour: this is pixel art, and any smoothing here would misrepresent the
    // source tile when it is being inspected for a palette decision.
    .resize(outWidth, outHeight, { kernel: "nearest" })
    .composite([{ input: overlaySvg(outWidth, outHeight, grid, options.tile, options.scale) }])
    .png()
    .toFile(outputPath);

  result.outputPath = path.relative(REPO_ROOT, outputPath);
  return result;
}

function printResult(result, options) {
  if (options.quiet) {
    console.log(result.outputPath ?? `${result.sheet}\tOFF-GRID`);
    return;
  }
  console.log(`\n=== ${result.sheet} ===`);
  console.log(`  ${result.width}x${result.height}px @${options.tile}px`);
  if (!result.onGrid) {
    console.log(
      `  OFF-GRID (${result.width / options.tile} x ${result.height / options.tile} tiles) — ` +
        `not addressable by tiled-map-loader.js; no labeled output written.`
    );
    return;
  }
  console.log(
    `  grid: ${result.cols} cols x ${result.rows} rows (${result.cols * result.rows} cells)`
  );
  console.log(`  labeled: ${result.outputPath}`);
  const used = result.occupancy.flat().filter((f) => f > 0).length;
  console.log(`  occupancy: ${used}/${result.cols * result.rows} cells contain art`);
  console.log("  legend: # full-bleed  o partial  - sparse  . empty");
  const header = Array.from({ length: result.cols }, (_, c) => (c % 10).toString()).join("");
  console.log(`      ${header}`);
  result.occupancy.forEach((line, row) => {
    console.log(`  ${String(row).padStart(3)} ${line.map(densityGlyph).join("")}`);
  });
}

async function main() {
  const { options, targets } = parseArgs(process.argv.slice(2));

  let sheets = targets;
  if (options.all) sheets = listAllSheets();
  else if (options.pack) sheets = listPackSheets(options.pack);

  if (sheets.length === 0) {
    console.error(
      'Usage: node scripts/assets/label-tilesheet.js "<Pack>/<sheet>.png" | --pack "<Pack>" | --all'
    );
    process.exitCode = 1;
    return;
  }

  for (const sheet of sheets) {
    try {
      printResult(await labelSheet(sheet, options), options);
    } catch (error) {
      console.error(`  ! ${sheet}: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

await main();
