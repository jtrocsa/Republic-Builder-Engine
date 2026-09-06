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
//   3. **The queue is empty as of Phase 100.** Units 7-9's plates were painted ahead of their
//      units and each collected its table line when its unit became real. What is guarded now is
//      that the directory and the table agree exactly — an unwired painting is a decision
//      somebody has to make, not a file to be found later by a cleanup pass.

import { existsSync, readdirSync } from "node:fs";
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

  it("has emptied the queue — every painted plate is wired to a unit", () => {
    // This case used to name the plates painted ahead of their units and assert both halves: that
    // the file was still on disk, and that the table did not yet name it. Unit 7 collected its line
    // in Phase 89, Unit 8 in Phase 95 and Unit 9 in Phase 100, so the queue is empty and the guard
    // has nothing left to protect. It is kept, pointing the other way: the directory and the table
    // must now agree exactly, so a painting committed for a future unit shows up here as a decision
    // to make rather than as a file nobody notices.
    const painted = readdirSync(PLATES_DIR)
      .filter((file) => /^unit-\d\d-.+\.webp$/.test(file))
      .sort();
    const wired = unitPlateKeys
      .map((key) => CHRONOTRAVEL_PLATES[key].image.split("/").pop())
      .sort();
    expect(painted).toEqual(wired);
  });

  it("opens on exactly one case per unit — the one that walks the map", () => {
    // What makes "keyed by unit" a true statement rather than a convenient one. A plate is the
    // unit's map painted from outside, and since `0114` the warp it fronts is reached only by a
    // case whose route is `field`. Two field cases in a unit would put one painting in front of
    // two different arrivals; none would leave a painting nothing ever opens on, which is the
    // state the queue guard above used to describe.
    //
    // This is the check that was missing while the warp showed a Kansas railhead on the way to
    // Chicago: the guards here all read the *table*, and the table was never wrong.
    const offenders = units
      .map((unit) => [unit.id, unit.cases.filter((kase) => kase.route === "field").length])
      .filter(([, count]) => count !== 1);
    expect(
      offenders,
      `units whose field-case count is not 1: ${JSON.stringify(offenders)}`
    ).toEqual([]);
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
