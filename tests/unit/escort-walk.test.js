// The Entrance Hall's escort walk: the Director leads, the player follows in his footsteps.
//
// Worth real assertions because it is pure arithmetic driving two bodies through a scene the player
// cannot interrupt — if the follower drifts, clips a corner the leader rounded, or the walk never
// reports itself finished, the onboarding hangs with no input to recover it. The frame-rate case is
// here for the same reason npc-behaviour.js has one: a walk whose speed depends on how often it is
// ticked looks fine on the machine it was written on.

import { describe, it, expect } from "vitest";

import {
  createEscortWalk,
  stepEscort,
  sampleTrail,
} from "../../apps/web/src/engine/escort-walk.js";

const SPEED = 2.2;
const GAP = 1.15;

function bodies(x = 10, y = 10.4) {
  return {
    leader: { x, y, facing: "down", walking: false },
    follower: { x, y: y + 4.9, facing: "up", moving: false },
  };
}

/** The Entrance Hall's real shape: straight north up the spine. */
function straightWalk(overrides = {}) {
  const { leader, follower } = bodies();
  return createEscortWalk({
    waypoints: [{ x: 10, y: 2.6 }],
    speed: SPEED,
    gap: GAP,
    leader,
    follower,
    ...overrides,
  });
}

/** Runs `ms` of walking in `steps` equal ticks. */
function run(state, ms, steps) {
  let last = { leaderDone: false, done: false };
  for (let index = 0; index < steps; index += 1) last = stepEscort(state, ms / steps);
  return last;
}

describe("escort walk", () => {
  it("holds the follower exactly one gap behind along the path (normal case)", () => {
    const state = straightWalk();
    run(state, 1200, 36);
    // Straight north, so "one gap behind along the trail" is one gap further down the map.
    expect(state.leader.y).toBeLessThan(10.4);
    expect(state.follower.y - state.leader.y).toBeCloseTo(GAP, 6);
    expect(state.follower.x).toBeCloseTo(state.leader.x, 6);
  });

  it("leaves the follower standing until the leader is a gap ahead (edge case)", () => {
    const state = straightWalk();
    const startedAt = state.follower.y;
    // 200ms at 2.2 tiles/s is 0.44 tiles — well short of the 1.15 gap.
    stepEscort(state, 200);
    expect(state.leader.walking).toBe(true);
    expect(state.follower.moving).toBe(false);
    expect(state.follower.y).toBe(startedAt);
  });

  it("keeps the follower on ground the leader has already covered (normal case)", () => {
    // An L: north up the spine, then east. A follower routed independently could cut the corner;
    // one walking the trail cannot, which is the whole reason it is a trail.
    const { leader, follower } = bodies();
    const state = createEscortWalk({
      waypoints: [
        { x: 10, y: 6 },
        { x: 16, y: 6 },
      ],
      speed: SPEED,
      gap: GAP,
      leader,
      follower,
    });
    const onPath = (x, y) =>
      (Math.abs(x - 10) < 1e-6 && y >= 6 - 1e-6 && y <= 10.4 + 1e-6) ||
      (Math.abs(y - 6) < 1e-6 && x >= 10 - 1e-6 && x <= 16 + 1e-6);
    for (let index = 0; index < 200; index += 1) {
      stepEscort(state, 16);
      if (state.followerDistance > 0) {
        expect(onPath(state.follower.x, state.follower.y)).toBe(true);
      }
    }
  });

  it("faces each body by its own movement, so the follower turns the corner late (normal case)", () => {
    const { leader, follower } = bodies();
    const state = createEscortWalk({
      waypoints: [
        { x: 10, y: 6 },
        { x: 16, y: 6 },
      ],
      speed: SPEED,
      gap: GAP,
      leader,
      follower,
    });
    // Far enough for the leader to have turned east while the follower is still on the north leg.
    run(state, 2400, 72);
    expect(state.leader.facing).toBe("right");
    expect(state.follower.facing).toBe("up");
    run(state, 1200, 36);
    expect(state.follower.facing).toBe("right");
  });

  it("covers the same ground per unit time however often it is ticked (edge case)", () => {
    const coarse = straightWalk();
    const fine = straightWalk();
    run(coarse, 1000, 1);
    run(fine, 1000, 30);
    expect(coarse.leader.y).toBeCloseTo(fine.leader.y, 9);
    expect(coarse.follower.y).toBeCloseTo(fine.follower.y, 9);
    expect(coarse.distance).toBeCloseTo(fine.distance, 9);
  });

  it("reports leaderDone at the doors and done once the follower catches up (normal case)", () => {
    const state = straightWalk();
    // 7.8 tiles at 2.2 tiles/s is ~3.55s; the follower then has the gap left to cover.
    let sawLeaderDoneBeforeDone = false;
    let result = { leaderDone: false, done: false };
    for (let index = 0; index < 400; index += 1) {
      result = stepEscort(state, 16);
      if (result.leaderDone && !result.done) sawLeaderDoneBeforeDone = true;
      if (result.done) break;
    }
    expect(result.leaderDone).toBe(true);
    expect(result.done).toBe(true);
    expect(sawLeaderDoneBeforeDone).toBe(true);
    expect(state.leader.y).toBeCloseTo(2.6, 6);
    expect(state.follower.y).toBeCloseTo(2.6, 6);
  });

  it("latches both flags rather than flickering once the walk is over (edge case)", () => {
    const state = straightWalk();
    run(state, 8000, 240);
    const after = stepEscort(state, 16);
    expect(after).toEqual({ leaderDone: true, done: true });
    expect(state.leader.walking).toBe(false);
    expect(state.follower.moving).toBe(false);
  });

  it("terminates immediately when there is nowhere to walk (edge case)", () => {
    // findRoute() returns [] when start and goal share a cell, and null when there is no way at
    // all — the hub scene runner's `moveActor` passes `|| []` for the second, so both arrive here
    // as an empty list. Neither may hang the scene: `isMoveDone()` is what releases the command,
    // and a walk that never finishes is a player locked in a room forever.
    const { leader, follower } = bodies();
    const state = createEscortWalk({ waypoints: [], speed: SPEED, gap: GAP, leader, follower });
    expect(stepEscort(state, 16)).toEqual({ leaderDone: true, done: true });
  });

  it("walks a single-waypoint route to its end (edge case)", () => {
    const { leader, follower } = bodies(10, 4);
    const state = createEscortWalk({
      waypoints: [{ x: 10, y: 3 }],
      speed: SPEED,
      gap: GAP,
      leader,
      follower,
    });
    run(state, 4000, 120);
    expect(state.leader.y).toBeCloseTo(3, 6);
    expect(state.done).toBe(true);
  });

  it("clamps trail sampling to both ends rather than reading off the array (edge case)", () => {
    const trail = [
      { x: 0, y: 0, s: 0 },
      { x: 0, y: 2, s: 2 },
    ];
    expect(sampleTrail(trail, -5)).toEqual({ x: 0, y: 0 });
    expect(sampleTrail(trail, 1)).toEqual({ x: 0, y: 1 });
    expect(sampleTrail(trail, 99)).toEqual({ x: 0, y: 2 });
  });

  it("keeps the trail bounded however far the walk goes (edge case)", () => {
    // Pruning holds the trail to the crumbs between the follower and the leader — about
    // gap / (speed * tick) of them — so its size is a function of the tick rate and never of how
    // far anyone has walked. Ten times the distance, same trail.
    const walk = (tiles, ticks) => {
      const { leader, follower } = bodies(10, 0);
      const state = createEscortWalk({
        waypoints: [{ x: 10, y: tiles }],
        speed: SPEED,
        gap: GAP,
        leader,
        follower,
      });
      run(state, (tiles / SPEED) * 1000, ticks);
      return state.trail.length;
    };
    const short = walk(22, 300);
    const long = walk(220, 3000);
    expect(long).toBe(short);
    expect(long).toBeLessThan(24);
  });
});
