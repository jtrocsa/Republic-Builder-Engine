// Integrity checks for the canonical tile palette and the per-map palettes that extend it.
//
// These guard the class of mistake that previously only surfaced as visibly wrong art after a
// manual browser pass: a coordinate outside its sheet, a sheet that was moved or renamed on
// disk, an off-grid sheet the loader silently mis-renders, or a benched pack quietly creeping
// back into a map.

import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CANONICAL,
  GAPS,
  SHARED_SHEETS,
  sheetsReferencedBy,
} from "../../apps/web/src/content/tilesets/canonical-palette.js";
import {
  BENCHED_PACKS,
  PLANNED_MAPS,
} from "../../apps/web/src/content/tilesets/maps/planned-maps.js";
import caribbean from "../../apps/web/src/content/tilesets/maps/caribbean-field.palette.js";
import riverbend from "../../apps/web/src/content/tilesets/maps/riverbend-field.palette.js";
import commonCause from "../../apps/web/src/content/tilesets/maps/common-cause-field.palette.js";
import canalCrossroads from "../../apps/web/src/content/tilesets/maps/canal-crossroads-field.palette.js";
import archiveRoom from "../../apps/web/src/content/tilesets/maps/archive-room.palette.js";
import hallway from "../../apps/web/src/content/tilesets/maps/hallway.palette.js";
import instituteHall from "../../apps/web/src/content/tilesets/maps/institute-hall.palette.js";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TEST_DIR, "../..");
const TILESET_ROOT = path.join(REPO_ROOT, "apps", "web", "src", "assets", "tilesets");
const TILE = 48;

const MAP_PALETTES = [
  caribbean,
  riverbend,
  commonCause,
  canalCrossroads,
  archiveRoom,
  hallway,
  instituteHall,
];

/** Reads width/height straight from the PNG IHDR chunk. */
function pngDimensions(relativeSheetPath) {
  const bytes = readFileSync(path.join(TILESET_ROOT, relativeSheetPath));
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

/** Flattens a map palette's `tiles` — values may be a single entry or an array of them. */
function entriesOf(palette) {
  return Object.values(palette.tiles ?? {}).flat();
}

describe("canonical palette", () => {
  it("references only sheets that exist on disk (normal case)", () => {
    for (const sheet of sheetsReferencedBy(CANONICAL)) {
      expect(existsSync(path.join(TILESET_ROOT, sheet)), `missing sheet: ${sheet}`).toBe(true);
    }
  });

  it("references only sheets on a whole 48px grid", () => {
    // tiled-map-loader.js computes sx as (localId % columns) * tilewidth, so an off-grid sheet
    // draws misaligned art instead of failing. This is the guard for that whole failure mode.
    for (const sheet of sheetsReferencedBy(CANONICAL)) {
      const { width, height } = pngDimensions(sheet);
      expect(width % TILE, `${sheet} is ${width}px wide`).toBe(0);
      expect(height % TILE, `${sheet} is ${height}px tall`).toBe(0);
    }
  });

  it("puts every coordinate inside its own sheet (boundary case)", () => {
    for (const [name, entry] of Object.entries(CANONICAL)) {
      const { width, height } = pngDimensions(entry.sheet);
      expect(entry.row, `${name} row`).toBeGreaterThanOrEqual(0);
      expect(entry.col, `${name} col`).toBeGreaterThanOrEqual(0);
      expect(entry.row, `${name} row past end of ${entry.sheet}`).toBeLessThan(height / TILE);
      expect(entry.col, `${name} col past end of ${entry.sheet}`).toBeLessThan(width / TILE);
    }
  });

  it("names no benched pack (regression guard for the art-style rule)", () => {
    for (const sheet of sheetsReferencedBy(CANONICAL)) {
      const pack = sheet.split("/")[0];
      expect(BENCHED_PACKS, `${sheet} is from a benched pack`).not.toContain(pack);
    }
  });

  it("pins exactly one path per shared A4 sheet", () => {
    // The three Auto-tile-A4 sheets are byte-identical across 13 pack folders. Referencing two
    // different paths to the same bytes makes Vite bundle the image twice.
    const paths = Object.values(SHARED_SHEETS);
    expect(new Set(paths).size).toBe(paths.length);
    for (const sheet of paths) {
      expect(existsSync(path.join(TILESET_ROOT, sheet)), `missing: ${sheet}`).toBe(true);
    }
  });

  it("records gaps as plain identifiers, not empty tile entries (normal case)", () => {
    expect(GAPS.length).toBeGreaterThan(0);
    for (const gap of GAPS) expect(typeof gap).toBe("string");
  });
});

describe("per-map palettes", () => {
  it.each(MAP_PALETTES.map((p) => [p.id, p]))(
    "%s declares every sheet its tiles use",
    (_id, palette) => {
      const declared = new Set(palette.sheets.map((sheet) => sheet.path));
      for (const entry of entriesOf(palette)) {
        expect(declared, `${entry.sheet} used but not in sheets[]`).toContain(entry.sheet);
      }
    }
  );

  it.each(MAP_PALETTES.map((p) => [p.id, p]))(
    "%s keeps every coordinate inside its sheet (boundary case)",
    (_id, palette) => {
      for (const entry of entriesOf(palette)) {
        const { width, height } = pngDimensions(entry.sheet);
        expect(entry.row).toBeGreaterThanOrEqual(0);
        expect(entry.col).toBeGreaterThanOrEqual(0);
        expect(entry.row, `row past end of ${entry.sheet}`).toBeLessThan(height / TILE);
        expect(entry.col, `col past end of ${entry.sheet}`).toBeLessThan(width / TILE);
      }
    }
  );

  it.each(MAP_PALETTES.map((p) => [p.id, p]))("%s points at a .tmj that exists", (_id, palette) => {
    expect(existsSync(path.join(REPO_ROOT, palette.map)), `missing map: ${palette.map}`).toBe(true);
  });

  it("uses a unique id per map", () => {
    const ids = MAP_PALETTES.map((palette) => palette.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has one palette file per live map, and no orphan palette files", () => {
    const dir = path.join(REPO_ROOT, "apps/web/src/content/tilesets/maps");
    const onDisk = readdirSync(dir)
      .filter((file) => file.endsWith(".palette.js"))
      .map((file) => file.replace(/\.palette\.js$/, ""))
      .sort();
    expect(onDisk).toEqual(MAP_PALETTES.map((palette) => palette.id).sort());
  });
});

describe("planned map slate", () => {
  it("names only sheets that exist, for every non-blocked map (normal case)", () => {
    for (const map of PLANNED_MAPS) {
      for (const sheet of map.sheets) {
        expect(existsSync(path.join(TILESET_ROOT, sheet)), `${map.id}: missing ${sheet}`).toBe(
          true
        );
      }
    }
  });

  it("names no benched pack", () => {
    for (const map of PLANNED_MAPS) {
      for (const sheet of map.sheets) {
        const pack = sheet.split("/")[0];
        expect(BENCHED_PACKS, `${map.id} draws on benched pack ${pack}`).not.toContain(pack);
      }
    }
  });

  it("gives every blocked map a gap and no sheets (boundary case)", () => {
    // A blocked map is blocked precisely because nothing fits. If one ever acquires sheets
    // without losing its `blocked` status, that is a contradiction worth failing on.
    for (const map of PLANNED_MAPS.filter((m) => m.status === "blocked")) {
      expect(map.gap, `${map.id} is blocked but names no gap`).toBeTruthy();
      expect(map.sheets, `${map.id} is blocked but names sheets`).toHaveLength(0);
    }
  });

  it("ties every declared gap to the canonical GAPS list", () => {
    for (const map of PLANNED_MAPS.filter((m) => m.gap)) {
      expect(GAPS, `${map.id} names an unregistered gap: ${map.gap}`).toContain(map.gap);
    }
  });

  it("covers all nine APUSH periods", () => {
    const covered = new Set(PLANNED_MAPS.map((m) => m.period).filter(Boolean));
    for (const period of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      expect(covered, `no planned map for period ${period}`).toContain(period);
    }
  });

  it("uses a unique id per planned map, distinct from the live ones", () => {
    const ids = [...PLANNED_MAPS.map((m) => m.id), ...MAP_PALETTES.map((p) => p.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });
});
