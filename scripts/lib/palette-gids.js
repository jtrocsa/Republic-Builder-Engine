// Turns a map palette's semantic tile names into the GIDs and `tilesets[]` array a .tmj needs.
//
// Before this existed, every generator script hand-maintained its own block of the form:
//
//     const B01 = 1;
//     const B03 = 257;
//     const gidB01 = (row, col) => B01 + row * 16 + col;
//     const SAND = gidB01(0, 0);
//
// ...plus a hand-written tilesets[] array repeating each sheet's pixel dimensions, column count
// and tile count as literals. Three things there are error-prone and were duplicated five times:
// the firstgid arithmetic, the hardcoded `* 16` (wrong for any sheet that isn't 16 columns —
// Common Cause's liberty pole is 1 column), and the image geometry literals, which silently go
// stale if a sheet is ever replaced.
//
// All three are now derived: firstgids by the standard Tiled rule, columns from the palette's
// declared sheet order, and geometry by reading the PNG header off disk at generation time.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../..");
const TILESET_ROOT = path.join(REPO_ROOT, "apps", "web", "src", "assets", "tilesets");

// Every .tmj in this repo lives at apps/web/src/content/maps/, so a tileset image is always
// exactly this far up and back down. Matches what Tiled itself writes.
const TMJ_IMAGE_PREFIX = "../../assets/tilesets/";

const TILE = 48;

/** Reads width/height straight from the PNG IHDR chunk — no image library needed. */
function pngDimensions(absolutePath) {
  const bytes = readFileSync(absolutePath);
  if (bytes.readUInt32BE(0) !== 0x89504e47) {
    throw new Error(`palette-gids: not a PNG: ${absolutePath}`);
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/**
 * Builds the `tilesets[]` array for a map, in the palette's declared sheet order.
 *
 * firstgid follows Tiled's own rule — each sheet starts where the previous one ended
 * (`previous.firstgid + previous.tilecount`) — which is what reproduces the existing maps
 * exactly. Do not "tidy" this into fixed 256-wide bands: that only coincidentally matches
 * today because every sheet but the liberty pole happens to hold 256 tiles.
 */
export function buildTilesets(sheets) {
  const tilesets = [];
  let firstgid = 1;
  for (const sheet of sheets) {
    const absolute = path.join(TILESET_ROOT, sheet.path);
    const { width, height } = pngDimensions(absolute);
    if (width % TILE !== 0 || height % TILE !== 0) {
      throw new Error(
        `palette-gids: "${sheet.path}" is ${width}x${height}, not a whole number of ${TILE}px ` +
          `tiles. tiled-map-loader.js addresses tiles by (localId % columns), so an off-grid ` +
          `sheet draws misaligned art rather than failing — see the off-grid list in ` +
          `docs/architecture/TILE-LIBRARY-CATALOG.md.`
      );
    }
    const columns = width / TILE;
    const tilecount = columns * (height / TILE);
    // Key order here is alphabetical to match what Tiled writes and what the committed .tmj
    // files already contain — JSON.stringify preserves insertion order, so changing it would
    // produce a spurious whole-file diff on every regeneration.
    tilesets.push({
      columns,
      firstgid,
      image: TMJ_IMAGE_PREFIX + sheet.path,
      imageheight: height,
      imagewidth: width,
      margin: 0,
      name: sheet.name,
      spacing: 0,
      tilecount,
      tileheight: TILE,
      tilewidth: TILE,
    });
    firstgid += tilecount;
  }
  return tilesets;
}

/**
 * Returns `gid(entry)`, resolving a palette entry (`{ sheet, row, col }`) to its GID in this
 * map. Throws rather than silently producing a wrong tile if the palette names a sheet the map
 * never declared, or a coordinate outside that sheet — both of which previously showed up only
 * as visibly wrong art after a manual browser pass.
 */
export function gidResolverFor(tilesets) {
  const byPath = new Map(
    tilesets.map((tileset) => [tileset.image.slice(TMJ_IMAGE_PREFIX.length), tileset])
  );
  return function gid(entry) {
    if (!entry || typeof entry.row !== "number") {
      throw new Error(`palette-gids: not a palette entry: ${JSON.stringify(entry)}`);
    }
    const tileset = byPath.get(entry.sheet);
    if (!tileset) {
      throw new Error(
        `palette-gids: this map declares no tileset for "${entry.sheet}". Add it to the ` +
          `palette's sheets[] (and to the map's import.meta.glob in main.js).`
      );
    }
    const rows = tileset.tilecount / tileset.columns;
    if (entry.row < 0 || entry.row >= rows || entry.col < 0 || entry.col >= tileset.columns) {
      throw new Error(
        `palette-gids: (${entry.row},${entry.col}) is outside "${entry.sheet}" ` +
          `(${rows} rows x ${tileset.columns} cols).`
      );
    }
    return tileset.firstgid + entry.row * tileset.columns + entry.col;
  };
}

/**
 * Convenience for a map generator: resolves a whole palette in one call.
 * Returns `{ tilesets, gid, gidRect }`.
 */
export function resolvePalette(palette) {
  const tilesets = buildTilesets(palette.sheets);
  const gid = gidResolverFor(tilesets);
  /**
   * A rectangular block of GIDs anchored at a palette entry — for multi-tile art (a building,
   * a hut, a wharf) that occupies `height` x `width` cells starting at that entry's coordinate.
   */
  function gidRect(entry, height, width) {
    const rows = [];
    for (let r = 0; r < height; r += 1) {
      const row = [];
      for (let c = 0; c < width; c += 1) {
        row.push(gid({ sheet: entry.sheet, row: entry.row + r, col: entry.col + c }));
      }
      rows.push(row);
    }
    return rows;
  }
  return { tilesets, gid, gidRect };
}
