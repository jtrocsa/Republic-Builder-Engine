// Two characters walking single file: one leads a route, the other follows in their footsteps.
//
// Pure and DOM-free, like npc-behaviour.js and geometry.js — this owns the arithmetic and the
// caller owns the DOM. That is what makes it testable without a browser, and the properties worth
// testing here are real ones: that the follower holds its distance, that it never leaves ground the
// leader has already covered, and that one long tick produces the same result as thirty short ones.
//
// ## Why this is not a fourth `kind` in npc-behaviour.js
//
// That module's contract is "a character decides where to go on its own, indefinitely": three
// non-terminating kinds, a seeded PRNG so the decisions are reproducible, and an `isBlocked` gate
// consulted on every step. An escort is the opposite of all four of those — it is one-shot,
// deterministic, two-bodied, and it *ends*. Folding it in would mean stepBehaviour() returning a
// completion signal that means nothing to the other three kinds, and BEHAVIOUR_DEFAULTS growing
// fields only this one reads.
//
// ## Why a breadcrumb trail rather than routing the follower separately
//
// The follower needs no collision test at all, because every point it walks is a point the leader
// already stood on. That is the whole argument: a trail cannot clip a corner the leader didn't, and
// it cannot pick a different way round an obstacle and end up beside the person it is supposed to be
// behind. It also produces the right *look* for free — the follower rounds corners where the leader
// rounded them, a step late, which is what "walking behind someone" looks like.
//
// The leader's progress is tracked as cumulative arc length, so the follower's position is just
// "sample the trail at (leaderDistance - gap)". Crumbs behind that point are dropped, so the trail
// stays a handful of entries regardless of how far the walk goes.

import { facingFor } from "./npc-behaviour.js";

/**
 * @param {object}   options
 * @param {{x:number,y:number}[]} options.waypoints  world coords, in order, excluding the start
 * @param {number}   options.speed     tiles per second, for both bodies
 * @param {number}   options.gap       how far behind the leader the follower walks, in tiles
 * @param {object}   options.leader    mutated in place: {x, y, facing, walking}
 * @param {object}   options.follower  mutated in place: {x, y, facing, moving}
 */
export function createEscortWalk({ waypoints, speed, gap, leader, follower }) {
  return {
    waypoints: waypoints || [],
    index: 0,
    speed,
    gap,
    leader,
    follower,
    // The leader's own starting point is the trail's first crumb, so a follower that has not set off
    // yet still has something to sample rather than a special case.
    trail: [{ x: leader.x, y: leader.y, s: 0 }],
    distance: 0,
    followerDistance: 0,
    leaderDone: false,
    done: false,
  };
}

/**
 * Advances both bodies by one tick.
 *
 * Time is *spent*, not applied once — the same idiom as npc-behaviour.js's walk — so a 33ms tick and
 * a 500ms tick cover the same ground per unit time and the walk does not change speed with the frame
 * rate.
 *
 * @returns {{leaderDone: boolean, done: boolean}} `leaderDone` the frame the leader arrives (and
 *   every frame after), `done` once the follower has closed up behind them.
 */
export function stepEscort(state, dtMs) {
  const { leader, follower } = state;
  const beforeLeader = { x: leader.x, y: leader.y };
  const beforeFollower = { x: follower.x, y: follower.y };

  let remaining = (state.speed * Math.max(0, dtMs)) / 1000;
  while (remaining > 1e-9 && state.index < state.waypoints.length) {
    const target = state.waypoints[state.index];
    const dx = target.x - leader.x;
    const dy = target.y - leader.y;
    const toTarget = Math.hypot(dx, dy);
    if (toTarget <= 1e-9) {
      state.index += 1;
      continue;
    }
    const step = Math.min(remaining, toTarget);
    leader.x += (dx / toTarget) * step;
    leader.y += (dy / toTarget) * step;
    state.distance += step;
    state.trail.push({ x: leader.x, y: leader.y, s: state.distance });
    remaining -= step;
    if (step >= toTarget - 1e-9) state.index += 1;
  }
  if (state.index >= state.waypoints.length) state.leaderDone = true;

  // While the leader is walking the follower is pinned exactly `gap` behind along the path he took.
  // A target below zero means he has not yet got far enough ahead to be worth following, so the
  // follower holds — which is what it should look like: he sets off, you take a beat, you fall in.
  //
  // Once he stops, the follower keeps covering the rest of the trail at its own speed rather than
  // freezing one stride short of where he ended up. That is what makes both of them go through the
  // door instead of the player stopping dead in the doorway.
  const advanced = (state.speed * Math.max(0, dtMs)) / 1000;
  state.followerDistance = state.leaderDone
    ? Math.min(state.distance, state.followerDistance + advanced)
    : Math.max(state.followerDistance, state.distance - state.gap);
  if (state.followerDistance > 0) {
    const point = sampleTrail(state.trail, state.followerDistance);
    follower.x = point.x;
    follower.y = point.y;
    pruneTrail(state.trail, state.followerDistance);
  }

  applyMotion(leader, beforeLeader, "walking");
  applyMotion(follower, beforeFollower, "moving");
  // Measured in distance along the trail, not `!follower.moving`: the follower is momentarily still
  // every time it starts, so a walk that ended on the first such frame would end before it began.
  state.done = state.leaderDone && state.followerDistance >= state.distance - 1e-9;
  return { leaderDone: state.leaderDone, done: state.done };
}

/** Position at `distance` along the trail, interpolated between the two crumbs bracketing it. */
export function sampleTrail(trail, distance) {
  if (distance <= trail[0].s) return { x: trail[0].x, y: trail[0].y };
  for (let index = 1; index < trail.length; index += 1) {
    const previous = trail[index - 1];
    const current = trail[index];
    if (current.s < distance) continue;
    const span = current.s - previous.s;
    const t = span <= 1e-9 ? 0 : (distance - previous.s) / span;
    return {
      x: previous.x + (current.x - previous.x) * t,
      y: previous.y + (current.y - previous.y) * t,
    };
  }
  const last = trail[trail.length - 1];
  return { x: last.x, y: last.y };
}

/** Drops crumbs the follower has already passed, keeping one behind it to interpolate from. */
function pruneTrail(trail, followerDistance) {
  let keep = 0;
  while (keep + 1 < trail.length && trail[keep + 1].s < followerDistance) keep += 1;
  if (keep > 0) trail.splice(0, keep);
}

/** Facing from this frame's own displacement, and whether there was any. */
function applyMotion(body, before, movingKey) {
  const dx = body.x - before.x;
  const dy = body.y - before.y;
  const moved = Math.hypot(dx, dy) > 1e-9;
  if (moved) body.facing = facingFor(dx, dy, body.facing);
  body[movingKey] = moved;
}
