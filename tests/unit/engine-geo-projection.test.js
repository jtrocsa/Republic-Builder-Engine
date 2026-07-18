import { describe, it, expect } from "vitest";
import {
  projectPoint,
  projectRing,
  ringToPathD,
  landPathD,
} from "../../apps/web/src/engine/geo-projection.js";

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

describe("landPathD", () => {
  it("joins multiple rings into one d string, one M...Z subpath per ring (normal case)", () => {
    const rings = [
      [
        [bounds.west, bounds.north],
        [bounds.east, bounds.north],
        [bounds.east, bounds.south],
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
});
