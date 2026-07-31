import { describe, it, expect } from "vitest";
import {
  ellipse,
  isCaribbeanLand,
  footBoxFor,
  hubFootBoxFor,
  isBlockedByBody,
  rectsOverlap,
} from "../../apps/web/src/main.js";

describe("ellipse", () => {
  it("is true for the center point (normal case)", () => {
    expect(ellipse(0, 0, 0, 0, 5, 5)).toBe(true);
  });

  it("is true exactly on the boundary (boundary case, inclusive <=)", () => {
    expect(ellipse(5, 0, 0, 0, 5, 5)).toBe(true);
  });

  it("is false just outside the boundary (boundary case)", () => {
    expect(ellipse(5.1, 0, 0, 0, 5, 5)).toBe(false);
  });
});

describe("isCaribbeanLand", () => {
  it("is true at the center of the main beach (normal case)", () => {
    expect(isCaribbeanLand(20, 12.5)).toBe(true);
  });

  it("is true inside the village sub-area, not just the main beach (normal case)", () => {
    expect(isCaribbeanLand(23.2, 8.6)).toBe(true);
  });

  it("is false in open water far from every land ellipse (boundary case)", () => {
    expect(isCaribbeanLand(0, 0)).toBe(false);
  });
});

describe("footBoxFor", () => {
  it("builds a foot rect offset below and centered on the given point (normal case)", () => {
    const box = footBoxFor(10, 5);
    expect(box.x1).toBeCloseTo(9.66);
    expect(box.x2).toBeCloseTo(10.34);
    expect(box.y1).toBeCloseTo(5.4);
    expect(box.y2).toBeCloseTo(5.78);
  });
});

describe("rectsOverlap", () => {
  it("is true for genuinely overlapping rects (normal case)", () => {
    const a = { x1: 0, x2: 2, y1: 0, y2: 2 };
    const b = { x1: 1, x2: 3, y1: 1, y2: 3 };
    expect(rectsOverlap(a, b)).toBe(true);
  });

  it("is false for rects nowhere near each other (normal case)", () => {
    const a = { x1: 0, x2: 1, y1: 0, y2: 1 };
    const b = { x1: 5, x2: 6, y1: 5, y2: 6 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it("is false for rects that only touch at an edge (boundary case)", () => {
    // Strict < / > in rectsOverlap means adjacent-but-not-overlapping foot boxes
    // (e.g. standing right next to a wall) must not register as blocked.
    const a = { x1: 0, x2: 1, y1: 0, y2: 1 };
    const b = { x1: 1, x2: 2, y1: 0, y2: 1 };
    expect(rectsOverlap(a, b)).toBe(false);
  });
});

// The Institute's staff became solid in Phase 64 — until then the player walked straight through
// Prof. Park, while isHubNpcBlocked() had always refused to walk him through the player.
describe("isBlockedByBody", () => {
  const staff = [hubFootBoxFor(10, 4.5)];

  it("stops a step into somebody standing there (normal case)", () => {
    const here = hubFootBoxFor(10, 6);
    expect(isBlockedByBody(hubFootBoxFor(10, 4.6), here, staff)).toBe(true);
  });

  it("lets a step past somebody a body's width away (normal case)", () => {
    const here = hubFootBoxFor(10, 6);
    expect(isBlockedByBody(hubFootBoxFor(10, 5.5), here, staff)).toBe(false);
  });

  // The escape hatch, and the reason this is a function rather than a `.some()` inline. Without it
  // an overlap is permanent: every direction out of somebody also overlaps them, so a player who
  // spawned on Julian's aisle line could never move again.
  it("lets the walker out of somebody they are already standing inside (edge case)", () => {
    const here = hubFootBoxFor(10, 4.5);
    expect(isBlockedByBody(hubFootBoxFor(10, 4.4), here, staff)).toBe(false);
    expect(isBlockedByBody(hubFootBoxFor(10.2, 4.5), here, staff)).toBe(false);
  });

  // Standing inside one person is not a licence to walk through the next one.
  it("still blocks a different body while overlapping one (edge case)", () => {
    const here = hubFootBoxFor(10, 4.5);
    const pair = [hubFootBoxFor(10, 4.5), hubFootBoxFor(10.9, 4.5)];
    expect(isBlockedByBody(hubFootBoxFor(10.5, 4.5), here, pair)).toBe(true);
  });

  it("is false in an empty room (edge case)", () => {
    expect(isBlockedByBody(hubFootBoxFor(10, 4.5), hubFootBoxFor(10, 6), [])).toBe(false);
  });
});
