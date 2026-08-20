// The pure half of the warp tunnel — the speed curve and the streak seeder.
//
// The drawing itself is not tested here and should not be: it is canvas calls whose only real
// assertion is what a person sees, which is what the browser pass in decision log 0074 is for.
// What is worth pinning is the curve, because it is expressed as fractions of the run rather than
// the mockup's absolute milliseconds, and a retune of WARP_TUNNEL_MS is supposed to stretch it
// rather than truncate the decel.

import { describe, it, expect } from "vitest";
import {
  easeSmooth,
  speedAt,
  newStar,
  TUNNEL_PHASES,
  TUNNEL_REST_SPEED,
} from "../../apps/web/src/engine/warp-tunnel.js";

describe("easeSmooth", () => {
  it("clamps outside 0..1 rather than overshooting", () => {
    expect(easeSmooth(-3)).toBe(0);
    expect(easeSmooth(0)).toBe(0);
    expect(easeSmooth(1)).toBe(1);
    expect(easeSmooth(4)).toBe(1);
  });

  it("is symmetric about its midpoint", () => {
    expect(easeSmooth(0.5)).toBeCloseTo(0.5, 10);
    expect(easeSmooth(0.25) + easeSmooth(0.75)).toBeCloseTo(1, 10);
  });
});

describe("speedAt", () => {
  it("starts from rest and reaches full speed by the end of the accel", () => {
    expect(speedAt(0)).toBe(0);
    expect(speedAt(TUNNEL_PHASES.accel)).toBe(1);
  });

  it("holds full speed across the whole cruise band", () => {
    const accel = TUNNEL_PHASES.accel;
    const cruise = TUNNEL_PHASES.cruise;
    for (let t = accel; t < cruise; t += (cruise - accel) / 8) expect(speedAt(t)).toBe(1);
  });

  it("decelerates to the rest speed and stays there", () => {
    expect(speedAt(0.999)).toBeGreaterThan(TUNNEL_REST_SPEED);
    expect(speedAt(1)).toBeCloseTo(TUNNEL_REST_SPEED, 10);
    // Past the run's end the field drifts rather than freezing — the plate crossfades over it.
    expect(speedAt(3)).toBe(TUNNEL_REST_SPEED);
  });

  it("never decreases while accelerating and never increases while decelerating", () => {
    for (let t = 0; t < TUNNEL_PHASES.accel; t += 0.01)
      expect(speedAt(t + 0.01)).toBeGreaterThanOrEqual(speedAt(t) - 1e-12);
    for (let t = TUNNEL_PHASES.cruise; t < 0.99; t += 0.01)
      expect(speedAt(t + 0.01)).toBeLessThanOrEqual(speedAt(t) + 1e-12);
  });
});

describe("newStar", () => {
  // A star is recycled the moment its radius leaves 0..maxR, so a seed on or past the edge would
  // throw the whole field away on the first frame and the tunnel would open empty.
  it("seeds inside the field however extreme the random draw", () => {
    const maxR = 900;
    for (const value of [0, 0.5, 0.999999, 1]) {
      const star = newStar(maxR, () => value);
      expect(star.r).toBeGreaterThanOrEqual(0);
      expect(star.r).toBeLessThanOrEqual(maxR);
    }
  });

  it("gives every streak a positive speed, width and tail", () => {
    for (const value of [0, 0.5, 1]) {
      const star = newStar(500, () => value);
      expect(star.spd).toBeGreaterThan(0);
      expect(star.w).toBeGreaterThan(0);
      expect(star.len).toBeGreaterThan(0);
      expect(star.a).toBeGreaterThanOrEqual(0);
      expect(star.a).toBeLessThanOrEqual(Math.PI * 2);
    }
  });

  it("makes teal the rare accent and gold the field", () => {
    // 5% teal, 40% dust — the draw decides both, so a low roll takes both branches and a high one
    // takes neither. Pinned because a swapped comparison would tint the whole warp teal.
    expect(newStar(100, () => 0.01)).toMatchObject({ teal: true, dust: true });
    expect(newStar(100, () => 0.9)).toMatchObject({ teal: false, dust: false });
  });
});
