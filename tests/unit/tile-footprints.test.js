// Checks every palette entry's declared footprint against the pixels of the sheet it names.
//
// The defect this guards (Phase 53): `farm/6.png`'s trees are not drawn on the tile grid, and the
// birch was declared 3 rows x 2 cols at (0,8) while the apple tree's fruiting crown starts 19px
// inside that rect's second column. The shipped map therefore painted a slice of apple tree —
// apples and all — standing beside the birch, and clipped the apple tree's own left edge in turn.
// Nothing could fail on it, because the size lived in a JSDoc comment and a pair of literals at
// the generator's call site.
//
// What is and is not decidable from pixels alone matters here, so it is worth being explicit:
//
//   contaminated  DECIDABLE, and enforced below. A meaningful area of a *different* sprite lands
//                 inside the declared rect. There is no legitimate reason to draw part of one
//                 object inside another object's stamp.
//   clipped       NOT reliably decidable. Sprites in these packs abut with no transparent gutter —
//                 the bohío huts sit directly on top of one another on the sheet — so "ink
//                 continues past this rect" cannot distinguish one sprite spanning two cells from
//                 two complete sprites touching. Caught instead by reading the preview PNG that
//                 `node scripts/assets/preview-map.js <map>.tmj` writes; see the verification
//                 ladder in CLAUDE.md.

import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { classifyFootprint, loadSheet } from "../../scripts/assets/lib/sprite-geometry.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
const PALETTE_DIR = path.join(REPO_ROOT, "apps/web/src/content/tilesets/maps");

const PALETTE_FILES = readdirSync(PALETTE_DIR)
  .filter((file) => file.endsWith(".palette.js"))
  .sort();

const palettes = await Promise.all(
  PALETTE_FILES.map(async (file) => {
    const mod = await import(pathToFileURL(path.join(PALETTE_DIR, file)).href);
    return { file, palette: mod.default };
  })
);

describe.each(palettes)(
  "$file",
  ({ palette }) => {
    const entries = Object.entries(palette.tiles).filter(
      ([, entry]) => entry && typeof entry.row === "number"
    );

    it("declares a footprint that stays inside its sheet and draws something", async () => {
      const offenders = [];
      for (const [name, entry] of entries) {
        const height = entry.h ?? 1;
        const width = entry.w ?? 1;
        const sheet = await loadSheet(entry.sheet);
        if (entry.row + height > sheet.rows || entry.col + width > sheet.cols) {
          offenders.push(
            `${name}: ${height}x${width} at (${entry.row},${entry.col}) runs off ${entry.sheet}, ` +
              `which is only ${sheet.rows}x${sheet.cols} tiles`
          );
          continue;
        }
        const result = await classifyFootprint(entry.sheet, entry.row, entry.col, height, width);
        if (result.verdict === "empty") {
          offenders.push(
            `${name}: nothing is drawn at (${entry.row},${entry.col}) on ${entry.sheet}`
          );
        }
      }
      expect(offenders).toEqual([]);
    });

    it("never stamps part of a neighbouring sprite", async () => {
      const offenders = [];
      for (const [name, entry] of entries) {
        const result = await classifyFootprint(
          entry.sheet,
          entry.row,
          entry.col,
          entry.h ?? 1,
          entry.w ?? 1
        );
        if (!result.contaminated) continue;
        offenders.push(
          `${name}: ${entry.h ?? 1}x${entry.w ?? 1} at (${entry.row},${entry.col}) on ` +
            `${entry.sheet} also draws part of a different sprite. Either the footprint is wrong ` +
            `(npm run assets:measure -- "${entry.sheet}" ${entry.row} ${entry.col}) or the art is ` +
            `not on the tile grid and has to be repacked — see scripts/assets/pack-objects.js.`
        );
      }
      expect(offenders).toEqual([]);
    });
  },
  60_000
);
