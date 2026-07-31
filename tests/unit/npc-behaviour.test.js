// The behaviour state machine is seeded, so these are real assertions about what an NPC does over
// time rather than smoke tests: run one for a simulated minute and check it stayed where it belongs,
// went somewhere while it was there, and never walked through the caller's collision test.
import { describe, expect, it } from "vitest";

import {
  BEHAVIOUR_DEFAULTS,
  createBehaviourState,
  facingFor,
  seedFrom,
  stepBehaviour,
} from "../../apps/web/src/engine/npc-behaviour.js";

const OPEN = () => false;

/** Run `ms` of simulated time at a fixed tick, collecting what the NPC did. */
function simulate(state, ms, isBlocked = OPEN, tick = 33) {
  const visited = [];
  let walkedMs = 0;
  for (let elapsed = 0; elapsed < ms; elapsed += tick) {
    stepBehaviour(state, tick, isBlocked);
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

describe("stepBehaviour: wander", () => {
  it("stays inside its radius over a simulated minute", () => {
    const state = createBehaviourState({ home: { x: 20, y: 12 }, radius: 1.6, seed: "carpenter" });
    const { visited } = simulate(state, 60_000);
    const worst = Math.max(...visited.map((p) => Math.hypot(p.x - 20, p.y - 12)));
    // The NPC never overshoots its target, so the radius is a hard bound rather than an average.
    expect(worst).toBeLessThanOrEqual(1.6 + 1e-9);
  });

  it("actually covers ground rather than jittering on the spot", () => {
    const state = createBehaviourState({ home: { x: 20, y: 12 }, radius: 1.6, seed: "carpenter" });
    const { visited } = simulate(state, 60_000);
    const spanX = Math.max(...visited.map((p) => p.x)) - Math.min(...visited.map((p) => p.x));
    const spanY = Math.max(...visited.map((p) => p.y)) - Math.min(...visited.map((p) => p.y));
    // This is the assertion the old four-waypoint rectangle would have failed on character: it
    // spanned 0.9 x 0.65 tiles, forever, identically for all 21 NPCs.
    expect(spanX).toBeGreaterThan(1.0);
    expect(spanY).toBeGreaterThan(1.0);
  });

  // The playtest note this tuning answers: "they move five, six steps, they stop for half a second,
  // they move for five, six steps". A wanderer used to walk about 40% of the time, which put most
  // of the cast standing still at any given moment. Both bounds matter — 100% would be a treadmill.
  it("walks most of the time, so a settlement is not a room full of people standing still", () => {
    const state = createBehaviourState({ home: { x: 20, y: 12 }, seed: "goodwife" });
    const { walkedMs } = simulate(state, 60_000);
    expect(walkedMs / 60_000).toBeGreaterThan(0.7);
    expect(walkedMs / 60_000).toBeLessThan(0.98);
  });

  // Seeds already gave two NPCs different phases. What they shared was a rhythm, and a street of
  // people on the same rhythm reads as one thing slightly out of sync with itself rather than as
  // several people.
  it("gives two people at the same post visibly different rhythms", () => {
    const a = createBehaviourState({ home: { x: 20, y: 12 }, seed: "powhatan-man" });
    const b = createBehaviourState({ home: { x: 20, y: 12 }, seed: "powhatan-woman" });
    expect(Math.abs(a.cadence - b.cadence)).toBeGreaterThan(0.05);
  });

  it("looks around during some pauses instead of standing frozen", () => {
    const state = createBehaviourState({ home: { x: 20, y: 12 }, seed: "minister" });
    const facings = new Set();
    for (let i = 0; i < 3000; i += 1) {
      stepBehaviour(state, 33, OPEN);
      if (!state.walking) facings.add(state.facing);
    }
    expect(facings.size).toBeGreaterThan(1);
  });

  it("never steps onto ground the caller rejects", () => {
    // A wall through the middle of the home disc: the NPC has somewhere to go but must not cross.
    const isBlocked = (x) => x > 20;
    const state = createBehaviourState({ home: { x: 19.4, y: 12 }, radius: 2.0, seed: "fisher" });
    const { visited } = simulate(state, 60_000, isBlocked);
    expect(visited.every((p) => p.x <= 20)).toBe(true);
  });

  it("recovers instead of stalling when the way is blocked mid-path", () => {
    // Open long enough to commit to a target, then closed — the player walking into the NPC.
    let open = true;
    const state = createBehaviourState({ home: { x: 20, y: 12 }, seed: "julian" });
    for (let i = 0; i < 200; i += 1) stepBehaviour(state, 33, () => !open);
    open = false;
    for (let i = 0; i < 40; i += 1) stepBehaviour(state, 33, () => !open);
    expect(state.walking).toBe(false);
    open = true;
    const { walkedMs } = simulate(state, 30_000);
    expect(walkedMs).toBeGreaterThan(0);
  });

  it("waits rather than forcing a step when it is boxed in entirely", () => {
    const state = createBehaviourState({ home: { x: 20, y: 12 }, seed: "amani" });
    const { visited, walkedMs } = simulate(state, 20_000, () => true);
    expect(walkedMs).toBe(0);
    expect(visited.every((p) => p.x === 20 && p.y === 12)).toBe(true);
  });

  it("covers the same ground whatever the tick rate", () => {
    // Time-based movement is the whole reason NPCs stopped depending on the interval they happen
    // to be polled at; two different tick rates must produce the same path from the same seed.
    const coarse = createBehaviourState({ home: { x: 20, y: 12 }, seed: "columbus" });
    const fine = createBehaviourState({ home: { x: 20, y: 12 }, seed: "columbus" });
    for (let i = 0; i < 100; i += 1) stepBehaviour(coarse, 60, OPEN);
    for (let i = 0; i < 200; i += 1) stepBehaviour(fine, 30, OPEN);
    expect(coarse.x).toBeCloseTo(fine.x, 6);
    expect(coarse.y).toBeCloseTo(fine.y, 6);
  });

  it("clamps a long frame so a backgrounded tab does not teleport anyone", () => {
    const state = createBehaviourState({ home: { x: 20, y: 12 }, radius: 8, seed: "hale" });
    for (let i = 0; i < 30; i += 1) stepBehaviour(state, 33, OPEN);
    const before = { x: state.x, y: state.y };
    stepBehaviour(state, 20_000, OPEN);
    const jump = Math.hypot(state.x - before.x, state.y - before.y);
    expect(jump).toBeLessThanOrEqual((state.speed * 120) / 1000 + 1e-9);
  });

  it("honours a per-NPC speed", () => {
    const slow = createBehaviourState({ home: { x: 20, y: 12 }, radius: 6, speed: 0.5, seed: "s" });
    const fast = createBehaviourState({ home: { x: 20, y: 12 }, radius: 6, speed: 2.0, seed: "s" });
    const travelled = (state) => {
      let total = 0;
      let prev = { x: state.x, y: state.y };
      for (let i = 0; i < 900; i += 1) {
        stepBehaviour(state, 33, OPEN);
        total += Math.hypot(state.x - prev.x, state.y - prev.y);
        prev = { x: state.x, y: state.y };
      }
      return total;
    };
    expect(travelled(fast)).toBeGreaterThan(travelled(slow) * 2);
  });

  it("starts standing at its post, so an NPC is never drawn away from where it was placed", () => {
    const state = createBehaviourState({ home: { x: 41, y: 19 }, seed: "settlement-carpenter" });
    expect({ x: state.x, y: state.y }).toEqual({ x: 41, y: 19 });
    expect(state.walking).toBe(false);
  });

  it("defaults a radius and a speed so a placement only has to name a post", () => {
    const state = createBehaviourState({ home: { x: 1, y: 1 } });
    expect(state.radius).toBe(BEHAVIOUR_DEFAULTS.radius);
    expect(state.speed).toBe(BEHAVIOUR_DEFAULTS.speed);
  });
});

describe("stepBehaviour: station", () => {
  const minister = () =>
    createBehaviourState({ kind: "station", at: { x: 26, y: 11.5 }, seed: "settlement-minister" });

  it("never leaves its post, however long it runs (normal case)", () => {
    const state = minister();
    const { visited, walkedMs } = simulate(state, 120_000);
    expect(walkedMs).toBe(0);
    expect(visited.every((p) => p.x === 26 && p.y === 11.5)).toBe(true);
  });

  // Standing still is not the same as being a statue. A stationed NPC that never changes facing
  // reads as scenery, which is the opposite of the point — the minister is *at* the meetinghouse,
  // not part of it.
  it("looks around while it stands there (normal case)", () => {
    const state = minister();
    const { visited } = simulate(state, 120_000);
    expect(new Set(visited.map((p) => p.facing)).size).toBeGreaterThan(1);
  });

  it("ignores the collision test entirely, having nowhere to go (edge case)", () => {
    const state = minister();
    const { walkedMs } = simulate(state, 30_000, () => true);
    expect(walkedMs).toBe(0);
    expect(state.x).toBe(26);
  });
});

describe("stepBehaviour: route", () => {
  // A there-and-back circuit as buildCircuit() emits one: a corner with no `stop`, then a stop.
  const CIRCUIT = [
    { x: 24, y: 12 },
    { x: 24, y: 16, stop: true },
    { x: 24, y: 12 },
    { x: 20, y: 12, stop: true },
  ];
  const carpenter = (waypoints = CIRCUIT) =>
    createBehaviourState({
      kind: "route",
      waypoints,
      speed: 1.35,
      seed: "settlement-carpenter",
    });

  it("visits its waypoints in order and comes back round (normal case)", () => {
    const state = carpenter();
    const reached = [];
    let lastIndex = state.waypointIndex;
    for (let i = 0; i < 3000; i += 1) {
      stepBehaviour(state, 33, OPEN);
      if (state.waypointIndex !== lastIndex) {
        reached.push(CIRCUIT[lastIndex]);
        lastIndex = state.waypointIndex;
      }
    }
    expect(reached.length).toBeGreaterThanOrEqual(5);
    expect(reached.slice(0, 5)).toEqual([
      CIRCUIT[0],
      CIRCUIT[1],
      CIRCUIT[2],
      CIRCUIT[3],
      CIRCUIT[0],
    ]);
  });

  // The difference between a route and a wander: a route only stops where somebody decided there
  // was a reason to. Pausing at every corner is what made the old cadence read as indecision.
  it("pauses at a stop and walks straight through a corner (normal case)", () => {
    const state = carpenter();
    const pausedAt = new Set();
    let lastIndex = state.waypointIndex;
    for (let i = 0; i < 3000; i += 1) {
      const before = lastIndex;
      stepBehaviour(state, 33, OPEN);
      if (state.waypointIndex !== lastIndex) {
        if (state.phase === "pause") pausedAt.add(before);
        lastIndex = state.waypointIndex;
      }
    }
    expect([...pausedAt].sort()).toEqual([1, 3]);
  });

  it("walks nearly all the time, pausing only at the two stops (normal case)", () => {
    const { walkedMs } = simulate(carpenter(), 60_000);
    expect(walkedMs / 60_000).toBeGreaterThan(0.7);
  });

  // Someone held up on a road is a person waiting. Re-planning on every contact is what would make
  // two NPCs meeting in a lane shuffle around each other indefinitely.
  it("waits in place when the way is blocked, then carries on (edge case)", () => {
    const state = carpenter();
    for (let i = 0; i < 60; i += 1) stepBehaviour(state, 33, OPEN);
    const held = { x: state.x, y: state.y };
    const target = state.waypointIndex;
    for (let i = 0; i < 60; i += 1) stepBehaviour(state, 33, () => true);
    expect(state.walking).toBe(false);
    expect(state.waypointIndex).toBe(target);
    expect({ x: state.x, y: state.y }).toEqual(held);
    const { walkedMs } = simulate(state, 10_000);
    expect(walkedMs).toBeGreaterThan(0);
  });

  it("gives up on a permanently blocked leg rather than freezing the circuit (edge case)", () => {
    const state = carpenter();
    const start = state.waypointIndex;
    // Well past blockedGiveUp: a leg nothing can clear costs one stop, not the whole round trip.
    for (let i = 0; i < BEHAVIOUR_DEFAULTS.blockedGiveUp + 20; i += 1)
      stepBehaviour(state, 33, () => true);
    expect(state.waypointIndex).not.toBe(start);
  });

  it("becomes a station when its circuit came back empty (edge case)", () => {
    // buildCircuit() drops legs it cannot path, so a route authored into a sealed yard arrives here
    // with nothing in it. Standing still is the honest end state; a crash is not.
    const state = createBehaviourState({
      kind: "route",
      waypoints: [],
      at: { x: 5, y: 5 },
      seed: "stranded",
    });
    expect(state.kind).toBe("station");
    const { walkedMs } = simulate(state, 20_000);
    expect(walkedMs).toBe(0);
  });

  it("covers the same ground whatever the tick rate (edge case)", () => {
    const coarse = carpenter();
    const fine = carpenter();
    for (let i = 0; i < 300; i += 1) stepBehaviour(coarse, 60, OPEN);
    for (let i = 0; i < 600; i += 1) stepBehaviour(fine, 30, OPEN);
    expect(coarse.x).toBeCloseTo(fine.x, 6);
    expect(coarse.y).toBeCloseTo(fine.y, 6);
  });
});
