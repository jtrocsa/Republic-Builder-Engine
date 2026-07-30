// The wander state machine is seeded, so these are real assertions about behaviour over time
// rather than smoke tests: run an NPC for a simulated minute and check it stayed where it belongs,
// went somewhere while it was there, and never walked through the caller's collision test.
import { describe, expect, it } from "vitest";

import {
  createWanderState,
  facingFor,
  seedFrom,
  stepWander,
  WANDER_DEFAULTS,
} from "../../apps/web/src/engine/npc-wander.js";

const OPEN = () => false;

/** Run `ms` of simulated time at a fixed tick, collecting what the NPC did. */
function simulate(state, ms, isBlocked = OPEN, tick = 33) {
  const visited = [];
  let walkedMs = 0;
  for (let elapsed = 0; elapsed < ms; elapsed += tick) {
    stepWander(state, tick, isBlocked);
    visited.push({ x: state.x, y: state.y, facing: state.facing, walking: state.walking });
    if (state.walking) walkedMs += tick;
  }
  return { visited, walkedMs };
}

describe("facingFor", () => {
  it("picks the dominant axis and breaks ties vertically, as main.js does", () => {
    expect(facingFor(-2, 1)).toBe("left");
    expect(facingFor(2, 1)).toBe("right");
    expect(facingFor(1, -2)).toBe("up");
    expect(facingFor(1, 2)).toBe("down");
    // Equal magnitudes are not "greater than", so they fall through to the vertical branch.
    expect(facingFor(1, 1)).toBe("down");
  });

  it("keeps the last facing when there is no movement to read one from", () => {
    expect(facingFor(0, 0, "left")).toBe("left");
    expect(facingFor(0, 0)).toBe("down");
  });
});

describe("seedFrom", () => {
  it("is stable per id, so a character wanders the same way across reloads", () => {
    expect(seedFrom("settlement-carpenter")).toBe(seedFrom("settlement-carpenter"));
  });

  it("separates the ids that actually collide in this game", () => {
    const ids = ["director", "amani", "julian", "powhatan-man", "powhatan-woman", "taino-elder"];
    expect(new Set(ids.map(seedFrom)).size).toBe(ids.length);
  });
});

describe("stepWander", () => {
  it("stays inside its radius over a simulated minute", () => {
    const state = createWanderState({ home: { x: 20, y: 12 }, radius: 1.6, seed: "carpenter" });
    const { visited } = simulate(state, 60_000);
    const worst = Math.max(...visited.map((p) => Math.hypot(p.x - 20, p.y - 12)));
    // The NPC never overshoots its target, so the radius is a hard bound rather than an average.
    expect(worst).toBeLessThanOrEqual(1.6 + 1e-9);
  });

  it("actually covers ground rather than jittering on the spot", () => {
    const state = createWanderState({ home: { x: 20, y: 12 }, radius: 1.6, seed: "carpenter" });
    const { visited } = simulate(state, 60_000);
    const spanX = Math.max(...visited.map((p) => p.x)) - Math.min(...visited.map((p) => p.x));
    const spanY = Math.max(...visited.map((p) => p.y)) - Math.min(...visited.map((p) => p.y));
    // This is the assertion the old four-waypoint rectangle would have failed on character: it
    // spanned 0.9 x 0.65 tiles, forever, identically for all 21 NPCs.
    expect(spanX).toBeGreaterThan(1.0);
    expect(spanY).toBeGreaterThan(1.0);
  });

  it("spends real time standing still, so a settlement is not a treadmill", () => {
    const state = createWanderState({ home: { x: 20, y: 12 }, seed: "goodwife" });
    const { walkedMs } = simulate(state, 60_000);
    expect(walkedMs).toBeGreaterThan(6_000);
    expect(walkedMs).toBeLessThan(48_000);
  });

  it("looks around during some pauses instead of standing frozen", () => {
    const state = createWanderState({ home: { x: 20, y: 12 }, seed: "minister" });
    const facings = new Set();
    for (let i = 0; i < 3000; i += 1) {
      stepWander(state, 33, OPEN);
      if (!state.walking) facings.add(state.facing);
    }
    expect(facings.size).toBeGreaterThan(1);
  });

  it("never steps onto ground the caller rejects", () => {
    // A wall through the middle of the home disc: the NPC has somewhere to go but must not cross.
    const isBlocked = (x) => x > 20;
    const state = createWanderState({ home: { x: 19.4, y: 12 }, radius: 2.0, seed: "fisher" });
    const { visited } = simulate(state, 60_000, isBlocked);
    expect(visited.every((p) => p.x <= 20)).toBe(true);
  });

  it("recovers instead of stalling when the way is blocked mid-path", () => {
    // Open long enough to commit to a target, then closed — the player walking into the NPC.
    let open = true;
    const state = createWanderState({ home: { x: 20, y: 12 }, seed: "julian" });
    for (let i = 0; i < 200; i += 1) stepWander(state, 33, () => !open);
    open = false;
    for (let i = 0; i < 40; i += 1) stepWander(state, 33, () => !open);
    expect(state.walking).toBe(false);
    open = true;
    const { walkedMs } = simulate(state, 30_000);
    expect(walkedMs).toBeGreaterThan(0);
  });

  it("waits rather than forcing a step when it is boxed in entirely", () => {
    const state = createWanderState({ home: { x: 20, y: 12 }, seed: "amani" });
    const { visited, walkedMs } = simulate(state, 20_000, () => true);
    expect(walkedMs).toBe(0);
    expect(visited.every((p) => p.x === 20 && p.y === 12)).toBe(true);
  });

  it("covers the same ground whatever the tick rate", () => {
    // Time-based movement is the whole reason NPCs stopped depending on the interval they happen
    // to be polled at; two different tick rates must produce the same path from the same seed.
    const coarse = createWanderState({ home: { x: 20, y: 12 }, seed: "columbus" });
    const fine = createWanderState({ home: { x: 20, y: 12 }, seed: "columbus" });
    for (let i = 0; i < 100; i += 1) stepWander(coarse, 60, OPEN);
    for (let i = 0; i < 200; i += 1) stepWander(fine, 30, OPEN);
    expect(coarse.x).toBeCloseTo(fine.x, 6);
    expect(coarse.y).toBeCloseTo(fine.y, 6);
  });

  it("clamps a long frame so a backgrounded tab does not teleport anyone", () => {
    const state = createWanderState({ home: { x: 20, y: 12 }, radius: 8, seed: "hale" });
    for (let i = 0; i < 30; i += 1) stepWander(state, 33, OPEN);
    const before = { x: state.x, y: state.y };
    stepWander(state, 20_000, OPEN);
    const jump = Math.hypot(state.x - before.x, state.y - before.y);
    expect(jump).toBeLessThanOrEqual((state.speed * 120) / 1000 + 1e-9);
  });

  it("honours a per-NPC speed", () => {
    const slow = createWanderState({ home: { x: 20, y: 12 }, radius: 6, speed: 0.5, seed: "s" });
    const fast = createWanderState({ home: { x: 20, y: 12 }, radius: 6, speed: 2.0, seed: "s" });
    const travelled = (state) => {
      let total = 0;
      let prev = { x: state.x, y: state.y };
      for (let i = 0; i < 900; i += 1) {
        stepWander(state, 33, OPEN);
        total += Math.hypot(state.x - prev.x, state.y - prev.y);
        prev = { x: state.x, y: state.y };
      }
      return total;
    };
    expect(travelled(fast)).toBeGreaterThan(travelled(slow) * 2);
  });

  it("starts standing at its post, so an NPC is never drawn away from where it was placed", () => {
    const state = createWanderState({ home: { x: 41, y: 19 }, seed: "settlement-carpenter" });
    expect({ x: state.x, y: state.y }).toEqual({ x: 41, y: 19 });
    expect(state.walking).toBe(false);
  });

  it("defaults a radius and a speed so a placement only has to name a post", () => {
    const state = createWanderState({ home: { x: 1, y: 1 } });
    expect(state.radius).toBe(WANDER_DEFAULTS.radius);
    expect(state.speed).toBe(WANDER_DEFAULTS.speed);
  });
});
