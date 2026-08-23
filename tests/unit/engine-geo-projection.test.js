import { describe, it, expect } from "vitest";
import {
  projectPoint,
  projectRing,
  ringToPathD,
  landPathD,
} from "../../apps/web/src/engine/geo-projection.js";
import coastlines from "../../apps/web/src/content/maps/land-coastlines.json";

const bounds = { west: -90, east: -60, north: 48, south: 25 };
const viewport = { width: 1000, height: 620 };

describe("projectPoint", () => {
  it("projects the bounds' corners to the viewport's corners (normal case)", () => {
    expect(projectPoint([bounds.west, bounds.north], bounds, viewport)).toEqual({ x: 0, y: 0 });
    expect(projectPoint([bounds.east, bounds.south], bounds, viewport)).toEqual({
      x: viewport.width,
      y: viewport.height,
    });
  });

  it("maps north to a smaller y than south (normal case)", () => {
    const north = projectPoint([-75, bounds.north], bounds, viewport);
    const south = projectPoint([-75, bounds.south], bounds, viewport);
    expect(north.y).toBeLessThan(south.y);
  });
});

describe("projectRing", () => {
  it("projects every point in a ring (normal case)", () => {
    const ring = [
      [bounds.west, bounds.north],
      [bounds.east, bounds.north],
      [bounds.east, bounds.south],
    ];
    expect(projectRing(ring, bounds, viewport)).toEqual([
      { x: 0, y: 0 },
      { x: 1000, y: 0 },
      { x: 1000, y: 620 },
    ]);
  });
});

describe("ringToPathD", () => {
  it("builds an M...L...Z path with one L per interior point (normal case)", () => {
    const d = ringToPathD([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
    expect(d).toBe("M0,0 L10,0 L10,10 Z");
  });

  it("returns an empty string for an empty ring (edge case)", () => {
    expect(ringToPathD([])).toBe("");
  });
});

describe("ringToPathD seam splitting", () => {
  // Four of the 126 rings in land-coastlines.json cross ±180, and each carries one segment that
  // travels the full width of the map. `.atlas-land` is stroked, so on a world view each drew a 1px
  // line straight across the table — invisible on every box that stops short of the antimeridian,
  // which was every view the game had before Unit 7. Spine Review Part 11.
  //
  // The threshold is safe because the real data has a cliff in it: seven segments at 358–360° of
  // longitude, and the next largest is 9.0°. Half the viewport is nowhere near either.
  it("splits a ring at a segment that wraps, and does not close it (edge case)", () => {
    const d = ringToPathD(
      [
        { x: 900, y: 10 },
        { x: 980, y: 20 },
        { x: 20, y: 30 },
        { x: 100, y: 40 },
      ],
      500
    );
    expect(d).toBe("M900,10 L980,20 M20,30 L100,40");
  });

  it("leaves a ring that never wraps closed, exactly as before (normal case)", () => {
    const ring = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];
    expect(ringToPathD(ring, 500)).toBe(ringToPathD(ring));
  });

  // The wrap can be the closing segment rather than an interior one — two of the four rings are
  // shaped that way, running -180 to 180 and relying on Z to get home.
  it("drops the closing Z when it is the close itself that wraps (edge case)", () => {
    const d = ringToPathD(
      [
        { x: 20, y: 0 },
        { x: 500, y: 10 },
        { x: 980, y: 20 },
      ],
      500
    );
    expect(d).toBe("M20,0 L500,10 L980,20");
  });
});

describe("landPathD", () => {
  it("joins multiple rings into one d string, one M...Z subpath per ring (normal case)", () => {
    const rings = [
      [
        [bounds.west, bounds.north],
        [-75, bounds.north],
        [-75, bounds.south],
      ],
      [
        [-70, 40],
        [-65, 40],
        [-65, 30],
      ],
    ];
    const d = landPathD(rings, bounds, viewport);
    const subpaths = d.split(" Z").filter(Boolean);
    expect(subpaths).toHaveLength(2);
    expect(d.startsWith("M0,0")).toBe(true);
  });

  // The real thing, against the real coastlines, in the framing that exposed it. Seven segments
  // failed this before landPathD passed a seam down, spread across four rings — Eurasia,
  // Antarctica, Fiji and Wrangel Island. Three of the four sit above Unit 7's south bound and were
  // drawing visible lines; Antarctica's was clipped, which is luck rather than design.
  it("draws no segment across the seam of a full-globe view (regression case)", () => {
    const d = landPathD(
      coastlines.rings,
      { west: -180, east: 180, north: 78, south: -56 },
      viewport
    );
    const crossings = [];
    for (const subpath of d.split("M").filter(Boolean)) {
      const xs = subpath
        .trim()
        .split(/\s+/)
        .map((command) => Number.parseFloat(command.replace("L", "")))
        .filter((x) => Number.isFinite(x));
      for (let i = 1; i < xs.length; i += 1) {
        if (Math.abs(xs[i] - xs[i - 1]) > viewport.width / 2) crossings.push(xs[i - 1], xs[i]);
      }
    }
    expect(crossings, `segments drawn straight across the map: ${crossings.length / 2}`).toEqual(
      []
    );
  });
});
