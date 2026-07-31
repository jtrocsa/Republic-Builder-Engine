// What an NPC is doing, and where that takes them.
//
// Pure and DOM-free, in the same spirit as geometry.js: this owns the state machine and the
// arithmetic, and the caller owns the DOM and the collision test. That split is what makes the
// behaviour unit-testable without a browser — pass a fake `isBlocked` and you can walk an NPC into
// a wall on purpose and assert it recovers.
//
// ## Three behaviours, because people are doing three different things
//
// Phase 61 replaced 21 identical four-waypoint patrol rectangles with a bounded wander. That fixed
// the sameness but not the emptiness: a random point in a disc is more varied than a rectangle and
// it is still nobody doing anything, and the playtest note said so — the minister should be at the
// meetinghouse, the goodwife should be walking the road to market, the carpenter should be going
// between the barn and the farm stores.
//
//   station  Stands at a post. Turns to look around; never walks. Right for anyone whose whole
//            job is to be somewhere — a minister at his door, an archivist at the stacks.
//   route    Walks a circuit of stops, pausing at each. The way between them is pathfound by
//            npc-routing.js against the map's roads, so a route is authored as places, not as
//            coordinates that have to be hand-checked against collision.
//   wander   Phase 61's disc, retuned. For people with somewhere to be but no errand: two
//            Powhatan on open shore, a fisher on the beach.
//
// ## Why everyone was stopping at once
//
// They were not, literally — each NPC has its own seeded stream, so their *phases* differed from
// the first tick. What they shared was a cadence: roughly a second of walking against a 0.6-3.2s
// pause, which put over half the cast standing still at any moment and made the whole settlement
// read as one rhythm slightly out of sync with itself. Three things fix it, and all three are
// tuning rather than structure: pauses are now the exception (0-0.7s for a wanderer, and a routed
// NPC does not pause between waypoints at all), wander legs are sampled from an annulus so nobody
// takes a third-of-a-tile shuffle, and each NPC's pause range is scaled by a seeded factor so two
// people standing near each other have visibly different rhythms rather than the same one offset.
//
// Measured over a simulated minute across the cast's real seeds, that puts every wanderer between
// 72% and 84% of the time walking, against roughly 40% before.

/** Facing for a step, matching SPRITE_DIRECTIONS. Ties go to the vertical axis, as main.js does. */
export function facingFor(dx, dy, fallback = "down") {
  if (!dx && !dy) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "left" : "right";
  return dy < 0 ? "up" : "down";
}

/**
 * A tiny deterministic PRNG (mulberry32), seeded per NPC.
 *
 * Deliberately not Math.random(): a seeded stream is what lets the unit tests assert real
 * behaviour — that an NPC stays inside its radius over a thousand steps, that it eventually picks
 * a different target — instead of asserting nothing and hoping. Each NPC gets its own stream, so
 * they desynchronise without needing the staggered `nextTick` offsets the old patrol code carried.
 */
function rng(seed) {
  let a = seed >>> 0 || 0x9e3779b9;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable seed from an NPC id, so a given character behaves the same way across reloads. */
export function seedFrom(id) {
  let hash = 2166136261;
  for (let i = 0; i < String(id).length; i += 1) {
    hash ^= String(id).charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export const BEHAVIOUR_DEFAULTS = Object.freeze({
  radius: 1.6,
  speed: 1.35,
  // A wanderer's pause. Short on purpose: this is the difference between a settlement of people
  // moving about and a settlement of people standing still with occasional twitches. The old
  // 600-3200ms is what the playtest called "they move five, six steps, they stop, they move".
  pauseMs: [0, 700],
  // A routed NPC's pause, and only ever at a stop — never between waypoints. Longer than a
  // wanderer's because arriving somewhere is the point: the carpenter is at the barn for a reason.
  // Not much longer, though. At 900-2600ms this cost the short beats too much: measured in the
  // browser over a minute, the burgess and the Powhatan pair walked barely half the time, because a
  // three-tile leg takes about two seconds and they were standing still for nearly as long at each
  // end. Long enough to read as arriving somewhere, short enough that a short errand still reads as
  // an errand.
  stopPauseMs: [700, 1700],
  // How long a station holds a facing before considering looking somewhere else.
  stationPauseMs: [1400, 4200],
  // Distance below which a target counts as reached without walking. Deliberately a float epsilon
  // rather than a tolerance: this used to be 0.06 tiles, which made arrival a free teleport of up
  // to that far, and how often an NPC happened to end a tick inside the window depended on the tick
  // size. Two different tick rates then produced different paths from the same seed, which is the
  // one property the whole time-based rewrite exists to provide. Arrival is paid for in full now —
  // spendWalk() charges exactly the time the remaining distance costs — and this only guards the
  // divide.
  arriveAt: 1e-9,
  // Wander targets come from an annulus, not the whole disc: sampling the disc uniformly puts a
  // third of the targets within half a radius of where the NPC already is, and those legs are the
  // shuffles that read as indecision.
  annulus: [0.55, 1.0],
  // A quarter of pauses end with the NPC looking somewhere new rather than standing frozen facing
  // the way it happened to arrive.
  turnChance: 0.25,
  // How many consecutive ticks a routed NPC will wait on a blocked waypoint before giving up on it
  // and taking the next one. At 33ms this is about four seconds — long enough to outwait a player
  // standing in a doorway, short enough that a permanently blocked leg costs one stop rather than
  // the whole circuit.
  blockedGiveUp: 120,
});

const between = (random, [min, max]) => min + random() * (max - min);

function beginPause(state, milliseconds) {
  state.phase = "pause";
  state.phaseMs = milliseconds;
  state.walking = false;
  state.target = null;
  // Decided up front rather than rolled every tick, so the turn happens once at a natural-looking
  // moment inside the pause instead of the NPC's head snapping around several times.
  state.turnAt =
    state.phaseMs > 200 && state.random() < BEHAVIOUR_DEFAULTS.turnChance
      ? state.phaseMs * (0.3 + state.random() * 0.4)
      : null;
}

/**
 * @param {object} config
 * @param {"station"|"route"|"wander"} [config.kind]
 * @param {{x:number,y:number}} [config.at]        station: the post
 * @param {{x:number,y:number,stop?:boolean}[]} [config.waypoints]  route: from buildCircuit()
 * @param {{x:number,y:number}} [config.home]      wander: the centre of the disc
 * @param {number} [config.radius]                 wander
 * @param {number} [config.speed]                  tiles per second
 * @param {number|string} [config.seed]
 * @param {string} [config.facing]
 */
export function createBehaviourState(config) {
  const merged = { ...BEHAVIOUR_DEFAULTS, ...config };
  const { kind = "wander", at, waypoints, home, radius, speed, seed, facing } = merged;
  const anchor = at || home || waypoints?.[0] || { x: 0, y: 0 };
  const random = rng(typeof seed === "number" ? seed : seedFrom(seed ?? `${anchor.x},${anchor.y}`));
  const state = {
    // A route with nothing walkable in it is a station, not a crash. buildCircuit() drops legs it
    // cannot path, so this is the honest end state for someone authored into a sealed courtyard.
    kind: kind === "route" && !waypoints?.length ? "station" : kind,
    home: { x: anchor.x, y: anchor.y },
    radius,
    speed,
    // Drawn once, per NPC: two people at neighbouring posts should not merely be out of phase,
    // they should dawdle by different amounts. 0.6-1.4 is wide enough to read as two temperaments
    // and narrow enough that nobody looks broken.
    cadence: 0.6 + random() * 0.8,
    random,
    x: anchor.x,
    y: anchor.y,
    facing: facing || "down",
    walking: false,
    target: null,
    waypoints: kind === "route" ? waypoints || [] : null,
    waypointIndex: 0,
    blockedTicks: 0,
    phase: "pause",
    phaseMs: 0,
    turnAt: null,
  };
  // A short settling pause, so a room does not begin with everyone stepping off on the same tick.
  beginPause(state, random() * 900);
  return state;
}

/** A candidate point in the annulus around home. Uniform by area within the band. */
function sampleTarget(state) {
  const [inner, outer] = BEHAVIOUR_DEFAULTS.annulus;
  const angle = state.random() * Math.PI * 2;
  const t = state.random();
  // Interpolating between the squared radii keeps the sample uniform by area inside the band, so
  // it does not clump against the inner edge the way a linear pick would.
  const distance = state.radius * Math.sqrt(inner * inner + t * (outer * outer - inner * inner));
  return {
    x: state.home.x + Math.cos(angle) * distance,
    y: state.home.y + Math.sin(angle) * distance,
  };
}

/** Spends up to `ms` of a pause; returns the milliseconds left over when it runs out. */
function spendPause(state, ms) {
  const used = Math.min(ms, state.phaseMs);
  state.phaseMs -= used;
  if (state.turnAt !== null && state.phaseMs <= state.turnAt) {
    const options = ["down", "up", "left", "right"].filter((d) => d !== state.facing);
    state.facing = options[Math.floor(state.random() * options.length)];
    state.turnAt = null;
  }
  return ms - used;
}

/**
 * Walks toward `state.target` for up to `ms`.
 *
 * @returns {{left:number, result:"arrived"|"blocked"|"walking"}} `left` is the time not needed to
 *          get there, which the caller spends on whatever comes next
 */
function spendWalk(state, ms, isBlocked) {
  const dx = state.target.x - state.x;
  const dy = state.target.y - state.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= BEHAVIOUR_DEFAULTS.arriveAt) {
    state.x = state.target.x;
    state.y = state.target.y;
    return { left: ms, result: "arrived" };
  }
  state.facing = facingFor(dx, dy, state.facing);
  const needed = (distance / state.speed) * 1000;
  const spent = Math.min(ms, needed);
  const travel = state.speed * (spent / 1000);
  const nextX = state.x + (dx / distance) * travel;
  const nextY = state.y + (dy / distance) * travel;
  if (isBlocked(nextX, nextY)) return { left: 0, result: "blocked" };
  state.x = nextX;
  state.y = nextY;
  state.walking = true;
  return { left: ms - spent, result: spent >= needed ? "arrived" : "walking" };
}

/** One wander phase transition. Returns the milliseconds left for the next one. */
function spendWander(state, ms, isBlocked) {
  if (state.phase === "pause") {
    const left = spendPause(state, ms);
    if (state.phaseMs > 0) return 0;
    // Rejection-sample rather than walk at the first point picked: most blocked targets are caught
    // here, cheaply, and the ones that are not are handled by the mid-path check below.
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const candidate = sampleTarget(state);
      if (!isBlocked(candidate.x, candidate.y)) {
        state.target = candidate;
        state.phase = "walk";
        return left;
      }
    }
    // Boxed in — an NPC whose radius mostly overlaps furniture, or one the player has walked up
    // against. Wait and try again rather than forcing a step into something.
    beginPause(state, between(state.random, BEHAVIOUR_DEFAULTS.pauseMs) * state.cadence);
    return left;
  }
  // Blocked mid-path is usually the player, occasionally another NPC. Stopping and choosing
  // somewhere else reads as changing their mind; the pre-Phase-61 code juddered against the
  // obstacle until its timer expired.
  const { left, result } = spendWalk(state, ms, isBlocked);
  if (result === "walking") return 0;
  beginPause(state, between(state.random, BEHAVIOUR_DEFAULTS.pauseMs) * state.cadence);
  return left;
}

/** One route phase transition. Returns the milliseconds left for the next one. */
function spendRoute(state, ms, isBlocked) {
  if (state.phase === "pause") {
    const left = spendPause(state, ms);
    if (state.phaseMs > 0) return 0;
    state.phase = "walk";
    state.blockedTicks = 0;
    return left;
  }
  state.target = state.waypoints[state.waypointIndex];
  const { left, result } = spendWalk(state, ms, isBlocked);
  if (result === "walking") {
    state.blockedTicks = 0;
    return 0;
  }
  if (result === "blocked") {
    state.blockedTicks += 1;
    // Wait it out, in place and still facing the way they were going, rather than turning back:
    // someone held up on a road is a person waiting, and re-planning on every contact is what
    // would make two NPCs meeting in a lane shuffle around each other indefinitely.
    if (state.blockedTicks < BEHAVIOUR_DEFAULTS.blockedGiveUp) return 0;
    state.blockedTicks = 0;
    state.waypointIndex = (state.waypointIndex + 1) % state.waypoints.length;
    return 0;
  }
  // Arrived. A waypoint is only a place to pause if somebody authored it as a stop; the rest are
  // corners on the way, and pausing at those is what a route would otherwise share with a wander.
  const arrived = state.waypoints[state.waypointIndex];
  state.waypointIndex = (state.waypointIndex + 1) % state.waypoints.length;
  state.blockedTicks = 0;
  if (arrived.stop)
    beginPause(state, between(state.random, BEHAVIOUR_DEFAULTS.stopPauseMs) * state.cadence);
  return left;
}

function spendStation(state, ms) {
  const left = spendPause(state, ms);
  if (state.phaseMs > 0) return 0;
  // The pause never ends; it re-arms, which is what keeps the idle turns coming.
  beginPause(state, between(state.random, BEHAVIOUR_DEFAULTS.stationPauseMs) * state.cadence);
  return left;
}

/**
 * Advance one NPC by `dtMs`.
 *
 * The tick is spent rather than applied: a phase that finishes partway through hands the remainder
 * to the next one instead of dropping it. That is what keeps the machine frame-rate independent now
 * that a pause can be shorter than a single tick — with the old 600ms floor, discarding the
 * remainder was invisible, but at 0-900ms a 60ms frame and two 30ms frames produced measurably
 * different paths from the same seed.
 *
 * @param state      from createBehaviourState; mutated in place
 * @param dtMs       elapsed milliseconds — real elapsed time, not a fixed per-tick constant, so
 *                   the same NPC covers the same ground whatever the tick rate or the CPU load
 * @param isBlocked  (x, y) => boolean, the caller's collision test for THIS npc
 */
export function stepBehaviour(state, dtMs, isBlocked) {
  let remaining = Math.min(120, Math.max(0, dtMs));
  state.walking = false;
  // Bounded because a pathological state — a zero-length pause re-arming to zero — would otherwise
  // spin. Nothing real reaches it: the shortest pause any behaviour can draw still costs the loop
  // one iteration per phase change, and a tick holds at most a handful.
  for (let guard = 0; remaining > 0 && guard < 16; guard += 1) {
    if (state.kind === "station") remaining = spendStation(state, remaining);
    else if (state.kind === "route") remaining = spendRoute(state, remaining, isBlocked);
    else remaining = spendWander(state, remaining, isBlocked);
  }
  return state;
}
