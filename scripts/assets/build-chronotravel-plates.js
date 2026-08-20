#!/usr/bin/env node
// Builds the Chronotravel plates — the painted establishing shots the warp screens load on.
//
// One plate per destination: nine eras plus the Institute Archive. The paintings arrive as
// ~2.5 MB 1672x941 PNGs, which is the wrong thing to put on a loading screen by a factor of
// twelve, so the sources live OUTSIDE the bundle tree in art-source/plates/ (gitignored) and this
// script emits the committed WebP the game actually references.
//
//   art-source/plates/<slug>.png  ->  apps/web/src/assets/plates/<slug>.webp
//
// The slug is the contract. `unit-0N-*` names the unit whose Chronotravel opens on it and is the
// key CHRONOTRAVEL_PLATES looks it up by; `institute-archive` is the recall destination. Three
// slugs (units 7-9) are painted and committed ahead of their units — see the plates content
// module's header for why that is deliberate rather than dead weight.
//
// Non-destructive: sources are only ever read. Re-running overwrites the WebPs in place and is
// safe at any time — but only on a machine that still has art-source/, since a clone will not.
//
// Usage: npm run assets:build-plates

import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../..");

export const SOURCE_DIR = path.join(REPO_ROOT, "art-source", "plates");
export const OUTPUT_DIR = path.join(REPO_ROOT, "apps", "web", "src", "assets", "plates");

// 78 sits just under the knee of this art's size/quality curve (150 KB at 68, 162 at 74, 206 at
// 80, 284 at 86) and these are painterly skies behind a navy veil, not line art. Native size is
// kept: 1672x941 is already 16:9 and the plate renders full-bleed, so there is nothing to gain by
// resampling it to a rounder number.
const WEBP = { quality: 78, effort: 6 };

export async function buildPlates({ sourceDir = SOURCE_DIR, outputDir = OUTPUT_DIR } = {}) {
  if (!existsSync(sourceDir)) {
    throw new Error(
      `build-chronotravel-plates: no source directory at ${sourceDir}. The painted sources are ` +
        `gitignored (they are ~2.5 MB each), so a fresh clone has the committed .webp output but ` +
        `not the input. Nothing to do.`
    );
  }
  mkdirSync(outputDir, { recursive: true });

  const sources = readdirSync(sourceDir)
    .filter((name) => name.toLowerCase().endsWith(".png"))
    .sort();
  const built = [];
  for (const name of sources) {
    const slug = path.basename(name, path.extname(name));
    const from = path.join(sourceDir, name);
    const to = path.join(outputDir, `${slug}.webp`);
    const { width, height } = await sharp(from).metadata();
    await sharp(from).webp(WEBP).toFile(to);
    built.push({
      slug,
      width,
      height,
      sourceBytes: statSync(from).size,
      outputBytes: statSync(to).size,
    });
  }
  return built;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
) {
  const built = await buildPlates();
  const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
  for (const plate of built) {
    console.log(
      `${plate.slug.padEnd(30)} ${plate.width}x${plate.height}  ` +
        `${kb(plate.sourceBytes).padStart(8)} -> ${kb(plate.outputBytes).padStart(7)}`
    );
  }
  const from = built.reduce((sum, plate) => sum + plate.sourceBytes, 0);
  const to = built.reduce((sum, plate) => sum + plate.outputBytes, 0);
  console.log(`\n${built.length} plates: ${kb(from)} -> ${kb(to)}`);
}
