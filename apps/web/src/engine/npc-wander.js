// How an NPC decides where to stand next.
//
// Pure and DOM-free, in the same spirit as geometry.js: this owns the state machine and the
// arithmetic, and the caller owns the DOM and the collision test. That split is what makes the
// behaviour unit-testable without a browser — pass a fake `isBlocked` and you can walk an NPC into
// a wall on purpose and assert it recovers.
//
// What this replaced: every one of the game's 21 NPCs walked an identical four-waypoint rectangle
// roughly 0.9 tiles wide and 0.65 tall, hand-written into three tables. Watching any two of them
// for ten seconds gave the whole game away. Waypoints also had to be individually validated
// against each map's collision rects, so placing an NPC meant hand-checking four coordinates and a
// unit test existed solely to catch the ones that were wrong.
//
// A wander needs none of that. It is bounded by a home anchor and a radius rather than by authored
// geometry, and because every step is gated by the caller's collision predicate an NPC physically
// cannot enter a wall — so a bad radius makes an NPC pace a smaller area than intended, which is
// cosmetic, rather than stranding it inside a building, which is not.

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

/** Stable seed from an NPC id, so a given character wanders the same way across reloads. */
export function seedFrom(id) {
  let hash = 2166136261;
  for (let i = 0; i < String(id).length; i += 1) {
    hash ^= String(id).charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export const WANDER_DEFAULTS = Object.freeze({
  radius: 1.6,
  speed: 1.35,
  // A pause long enough to read as a person deciding something, short enough that a player
  // crossing the map still sees the settlement moving.
  pauseMs: [600, 3200],
  // Close enough to the target to call it arrived. Smaller than one step at any sane speed, so an
  // NPC cannot orbit its own destination.
  arriveAt: 0.06,
  // A quarter of pauses end with the NPC looking somewhere new rather than standing frozen facing
  // the way it happened to arrive.
  turnChance: 0.25,
});

/**
 * @param {{home:{x:number,y:number}, radius?:number, speed?:number, seed?:number|string,
 *          facing?:string}} config
 */
export function createWanderState(config) {
  const { home, radius, speed, seed, facing } = { ...WANDER_DEFAULTS, ...config };
  const random = rng(typeof seed === "number" ? seed : seedFrom(seed ?? `${home.x},${home.y}`));
  return {
    home: { x: home.x, y: home.y },
    radius,
    speed,
    random,
    x: home.x,
    y: home.y,
    facing: facing || "down",
    walking: false,
    target: null,
    // Staggered off the seed rather than off an array index: NPCs are no longer all created in
    // one pass, and an index-based stagger silently collapsed whenever one was added or removed.
    phase: "pause",
    phaseMs: WANDER_DEFAULTS.pauseMs[0] + random() * 1200,
    turnAt: null,
  };
}

/** A candidate point in the disc around home. Uniform by area, so it does not clump at the centre. */
function sampleTarget(state) {
  const angle = state.random() * Math.PI * 2;
  const distance = Math.sqrt(state.random()) * state.radius;
  return {
    x: state.home.x + Math.cos(angle) * distance,
    y: state.home.y + Math.sin(angle) * distance,
  };
}

function beginPause(state) {
  const [min, max] = WANDER_DEFAULTS.pauseMs;
  state.phase = "pause";
  state.phaseMs = min + state.random() * (max - min);
  state.walking = false;
  state.target = null;
  // Decided up front rather than rolled every tick, so the turn happens once at a natural-looking
  // moment inside the pause instead of the NPC's head snapping around several times.
  state.turnAt =
    state.random() < WANDER_DEFAULTS.turnChance
      ? state.phaseMs * (0.3 + state.random() * 0.4)
      : null;
}

/**
 * Advance one NPC by `dtMs`.
 *
 * @param state      from createWanderState; mutated in place
 * @param dtMs       elapsed milliseconds — real elapsed time, not a fixed per-tick constant, so
 *                   the same NPC covers the same ground whatever the tick rate or the CPU load
 * @param isBlocked  (x, y) => boolean, the caller's collision test for THIS npc
 */
export function stepWander(state, dtMs, isBlocked) {
  const dt = Math.min(120, Math.max(0, dtMs));
  if (state.phase === "pause") {
    state.walking = false;
    state.phaseMs -= dt;
    if (state.turnAt !== null && state.phaseMs <= state.turnAt) {
      const options = ["down", "up", "left", "right"].filter((d) => d !== state.facing);
      state.facing = options[Math.floor(state.random() * options.length)];
      state.turnAt = null;
    }
    if (state.phaseMs > 0) return state;
    // Rejection-sample rather than walk at the first point picked: most blocked targets are caught
    // here, cheaply, and the ones that are not are handled by the mid-path check below.
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const candidate = sampleTarget(state);
      if (!isBlocked(candidate.x, candidate.y)) {
        state.target = candidate;
        state.phase = "walk";
        return state;
      }
    }
    // Boxed in — an NPC whose radius mostly overlaps furniture, or one the player has walked up
    // against. Wait and try again rather than forcing a step into something.
    beginPause(state);
    return state;
  }

  const dx = state.target.x - state.x;
  const dy = state.target.y - state.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= WANDER_DEFAULTS.arriveAt) {
    state.x = state.target.x;
    state.y = state.target.y;
    beginPause(state);
    return state;
  }

  const travel = Math.min(state.speed * (dt / 1000), distance);
  const nextX = state.x + (dx / distance) * travel;
  const nextY = state.y + (dy / distance) * travel;
  if (isBlocked(nextX, nextY)) {
    // Something moved into the way — usually the player, occasionally another NPC. Stopping and
    // choosing somewhere else reads as changing their mind; the old code's response was to judder
    // against the obstacle until its timer expired.
    state.facing = facingFor(dx, dy, state.facing);
    beginPause(state);
    return state;
  }
  state.x = nextX;
  state.y = nextY;
  state.facing = facingFor(dx, dy, state.facing);
  state.walking = true;
  return state;
}
