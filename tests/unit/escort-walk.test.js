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

// The Director's post and the player standing in front of it.
//
// The follower sat 4.9 tiles back until the lead-in landed — HALLWAY_SPAWN's distance from the
// post, i.e. the player still at the door. They cannot be: `interactWithHubTarget()` refuses
// outside `targetReach`, so by the time this walk exists the player is within 1.1 tiles and
// usually closer. The old fixture only looked reasonable because the follower used to teleport
// onto the trail on its first engaged frame, which is the bug these tests now pin shut.
const REACH = 0.6;

function bodies(x = 10, y = 10.4) {
  return {
    leader: { x, y, facing: "down", walking: false },
    follower: { x, y: y + REACH, facing: "up", moving: false },
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

  it("never moves the follower faster than its own speed, however far off the path it starts (regression)", () => {
    // The defect this file exists to prevent from coming back. The trail used to be seeded from the
    // *leader's* feet, so the follower's real position was never on it: the first frame the target
    // went positive, the follower was assigned a point on the leader's path outright. In the
    // Entrance Hall that snapped the player up to a tile sideways onto the Director's line, and the
    // hub camera — a pure function of player position — cut with them.
    //
    // Stated as a speed bound rather than as "does not snap", because that is the property: no tick
    // may move a body further than it could have walked in the time the tick covers.
    const { leader, follower } = bodies();
    // Well off the leader's line, and off the axis of travel, so a snap shows up on both axes.
    follower.x = 12.4;
    follower.y = 13.1;
    const state = createEscortWalk({
      waypoints: [{ x: 10, y: 2.6 }],
      speed: SPEED,
      gap: GAP,
      leader,
      follower,
    });
    const tick = 16;
    const ceiling = (SPEED * tick) / 1000 + 1e-9;
    let previous = { x: state.follower.x, y: state.follower.y };
    for (let index = 0; index < 400; index += 1) {
      stepEscort(state, tick);
      const moved = Math.hypot(state.follower.x - previous.x, state.follower.y - previous.y);
      expect(moved).toBeLessThanOrEqual(ceiling);
      previous = { x: state.follower.x, y: state.follower.y };
    }
  });

  it("walks a far-off follower onto the trail instead of dropping them onto it (regression)", () => {
    const { leader, follower } = bodies();
    follower.y = 15.3; // the Entrance Hall spawn, four tiles further back than reach allows
    const state = createEscortWalk({
      waypoints: [{ x: 10, y: 2.6 }],
      speed: SPEED,
      gap: GAP,
      leader,
      follower,
    });
    // One tick: they have set off toward the leader, and gone no further than one tick's worth.
    stepEscort(state, 100);
    expect(state.follower.moving).toBe(true);
    expect(state.follower.y).toBeCloseTo(15.3 - (SPEED * 100) / 1000, 6);
    // Starting further back than the gap is the one case where the leader finishes first and the
    // follower is still closing — they walk at the same speed, so the deficit only comes in once he
    // stops.
    let sawLeaderDoneBeforeDone = false;
    for (let index = 0; index < 400; index += 1) {
      const result = stepEscort(state, 16);
      if (result.leaderDone && !result.done) sawLeaderDoneBeforeDone = true;
      if (result.done) break;
    }
    expect(sawLeaderDoneBeforeDone).toBe(true);
    // And it ends, with the follower closed up a gap behind, rather than hanging.
    expect(state.done).toBe(true);
    expect(state.follower.y).toBeCloseTo(2.6 + GAP, 6);
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

  // The follower finishes a gap behind the leader, not on top of them. It used to close that last
  // stride, which was written for this walk — it ends in a doorway with the screen already going
  // black, so two bodies on one point could not be seen. The Main Hall tour stops twice in a lit
  // room, and there it read as the player standing inside the Director. `done` moved with it, or an
  // escort that stops a gap short never reports finished and holds the scene open forever.
  it("reports leaderDone at the doors and done once the follower closes up behind (normal case)", () => {
    const state = straightWalk();
    // 7.8 tiles at 2.2 tiles/s is ~3.55s.
    let result = { leaderDone: false, done: false };
    for (let index = 0; index < 400; index += 1) {
      result = stepEscort(state, 16);
      if (result.done) break;
    }
    expect(result.leaderDone).toBe(true);
    expect(result.done).toBe(true);
    expect(state.leader.y).toBeCloseTo(2.6, 6);
    expect(state.follower.y).toBeCloseTo(2.6 + GAP, 6);
  });

  it("ends the frame the leader arrives, for a follower already walking in station (edge case)", () => {
    // Both flags land together now, and that is the honest answer rather than a shortcut: a
    // follower that has held its station the whole way is already at its final position when the
    // leader stops, so there is nothing left to wait for. It used to lag by the gap it then closed.
    // The far-off case below is where `leaderDone` still genuinely precedes `done`.
    const state = straightWalk();
    let result = { leaderDone: false, done: false };
    for (let index = 0; index < 400; index += 1) {
      result = stepEscort(state, 16);
      if (result.leaderDone) break;
    }
    expect(result).toEqual({ leaderDone: true, done: true });
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
