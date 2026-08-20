// The Chronotravel plates — the paintings the two warp screens load on.
//
// Three things here are cheap to break and expensive to notice, because a wrong plate is not an
// error at runtime. It is a screen that shows the Caribbean on the way to Kansas.
//
//   1. **Every unit needs one.** `plateForUnit()` falls back to Unit 1's rather than rendering a
//      warp screen with no picture on it, which is the right runtime behaviour and exactly the
//      reason a missing entry would ship unnoticed. This is the thing that notices.
//   2. **Every plate needs its file.** The images resolve through `new URL(..., import.meta.url)`,
//      so a rename or a deletion is a 404 in the browser and nothing at all in the bundler.
//   3. **Units 7-9's plates are painted but unwired, deliberately.** Both halves matter: the files
//      have to still be there when Phase 89 wants them, and the table must not name a unit that
//      does not exist yet.

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect } from "vitest";

import {
  CHRONOTRAVEL_PLATES,
  INSTITUTE_PLATE,
  plateForUnit,
} from "../../apps/web/src/content/chronotravel-plates.js";
import { loadChronicleContent } from "../../apps/web/src/repositories/local-content-repository.js";

const units = Object.values(loadChronicleContent()).map((entry) => entry.unit);

const PLATES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../apps/web/src/assets/plates"
);

/** Every unit key in the table — everything but the one destination that is not a unit. */
const unitPlateKeys = Object.keys(CHRONOTRAVEL_PLATES).filter((key) => key !== "institute");

describe("Chronotravel plates", () => {
  it("gives every shipped unit its own plate", () => {
    const missing = units.map((unit) => unit.id).filter((id) => !CHRONOTRAVEL_PLATES[id]);
    expect(missing, `units with no plate: ${missing.join(", ")}`).toEqual([]);
  });

  it("names no unit that does not exist", () => {
    const real = new Set(units.map((unit) => unit.id));
    const orphans = unitPlateKeys.filter((id) => !real.has(id));
    expect(orphans, `plate keyed to a unit that is not shipped: ${orphans.join(", ")}`).toEqual([]);
  });

  it("points every plate at a file that is actually there", () => {
    for (const [key, entry] of Object.entries(CHRONOTRAVEL_PLATES)) {
      // By basename rather than by resolving the href: `new URL(..., import.meta.url)` comes back
      // as a file:// URL under plain Node, a root-relative path under Vite's test transform, and a
      // hashed /assets/ path in a build. The name is the part that is the same in all three, and
      // it is the part a rename breaks.
      const file = entry.image.split("/").pop();
      expect(file, `${key}: plate is not a .webp`).toMatch(/\.webp$/);
      expect(existsSync(path.join(PLATES_DIR, file)), `${key}: no such plate — ${file}`).toBe(true);
    }
  });

  it("keeps the three plates their units have not arrived for yet", () => {
    // Painted with the six that shipped, and the whole point of committing them early is that
    // Phase 89 adds a table line rather than a commission. Deleting one as "unused" is the
    // failure this guards.
    for (const queued of [
      "unit-07-immigrant-port.webp",
      "unit-08-postwar-suburb.webp",
      "unit-09-college-campus.webp",
    ]) {
      expect(existsSync(path.join(PLATES_DIR, queued)), `queued plate gone: ${queued}`).toBe(true);
    }
    expect(unitPlateKeys).not.toContain("unit-07");
  });

  it("writes alt text on every plate, because it is the whole screen", () => {
    for (const [key, entry] of Object.entries(CHRONOTRAVEL_PLATES)) {
      expect(entry.alt.length, `${key}: alt text too thin to describe a painting`).toBeGreaterThan(
        60
      );
    }
  });

  it("keeps every note short enough to read in the time the screen is up", () => {
    // The card holds it at ~44ch over two or three lines. Past this it is a paragraph on a screen
    // that lasts two and a half seconds, which nobody finishes.
    for (const [key, entry] of Object.entries(CHRONOTRAVEL_PLATES)) {
      expect(entry.note.length, `${key}: note is ${entry.note.length} chars`).toBeLessThanOrEqual(
        140
      );
      expect(entry.note.trim()).not.toBe("");
    }
  });

  it("falls back rather than returning nothing for an unknown unit", () => {
    expect(plateForUnit("unit-42")).toBe(CHRONOTRAVEL_PLATES["unit-01"]);
    expect(plateForUnit(undefined)).toBe(CHRONOTRAVEL_PLATES["unit-01"]);
    expect(INSTITUTE_PLATE).toBe(CHRONOTRAVEL_PLATES.institute);
  });
});
