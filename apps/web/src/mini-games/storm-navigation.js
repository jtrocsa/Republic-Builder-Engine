// Storm Navigation — Atlantic-crossing flavor mini-game. A timing/reflex
// break: dodge storm hazards while crossing, with thematic dressing (a
// period-appropriate ship, not a fantasy setting). Purely an arcade break —
// it isn't meant to teach anything and shouldn't be forced to.
//
// Not rubric-scored, not tied to the historical-thinking-skill schema, and
// intentionally kept out of apps/web/src/quest-types/ for exactly that
// reason. No currency, wallet, or persistent economy — the only persisted
// value is a single best-score integer (hazards dodged in a run), saved via
// the normal `progress` save path by the caller in main.js. This module
// itself stays pure and has no localStorage/IO of its own: a best score is
// passed into renderStormNavigationGame() as an argument, not read here.
// No multiplayer/opponent mechanic of any kind.
//
// Endless mode: there is no run timer. A run ends the moment a hazard hits
// the player's position (`running` flips to false); hazardsDodged at that
// point is the run's score. Difficulty ramps up gradually as hazardsDodged
// grows — hazards spawn more frequently AND approach faster (both
// floor/ceiling clamped) — so an endless run actually gets harder over time
// rather than staying flat.
//
// Steering is continuous, CubeField-style, not 3 discrete lanes: the ship
// has a position (playerX) and velocity (playerVelocityX) across a single
// horizontal axis in [-1, 1], driven each frame by steerShip() with
// acceleration while a direction is held and friction decay when it isn't.
// Hazards spawn at a random continuous x (not one of a fixed set of
// columns) and never move laterally once spawned — only their forward
// `progress` changes — matching how CubeField's obstacles are static once
// placed and only appear to approach via perspective growth.

const BASE_HAZARD_PROGRESS_PER_MS = 0.00035; // tuned so a fresh-run hazard crosses lane in ~3s
const MAX_HAZARD_PROGRESS_PER_MS = 0.0007; // top speed: crosses in ~1.4s
const HAZARD_SPEED_STEP_PER_RAMP = 0.00002;
const BASE_HAZARD_INTERVAL_MS = 1200;
const MIN_HAZARD_INTERVAL_MS = 500;
const DODGES_PER_RAMP_STEP = 5;
const HAZARD_INTERVAL_STEP_MS = 60;
// Visual variety only (see renderStormNavigationGame's `sprites.hazardKinds` lookup) — every
// kind is resolved identically for collision/timing, so this doesn't touch difficulty.
export const HAZARD_KINDS = ["rock", "wreckage", "whirlpool"];

// Ship steering physics (steerShip below) — acceleration while a direction is held, capped
// speed, and friction decay on release, so movement has momentum/glide instead of snapping
// between fixed slots. Tuned for a ~0.4s ramp to top speed, ~0.35-0.5s glide-to-stop on
// release, and a ~0.9s rail-to-rail traverse at top speed.
const STEER_ACCEL_PER_S2 = 5.5;
const MAX_STEER_SPEED_PER_S = 2.2;
const STEER_FRICTION_PER_S = 6.0;

// Collision hit radius in the same continuous x-units as playerX/hazard.x. Derived from the
// rendered track/art dimensions (see PLAYER_TRACK_HALF_PERCENT below): at a 760px-wide track,
// 1 x-unit ≈ 304px; ship art (84px) and hazard art (58px) get ~70% effective hitboxes (~30px/
// ~20px, allowing for transparent padding around the sprites) → combined 50px → 50/304 ≈ 0.16.
const HIT_RADIUS_X = 0.16;

/**
 * @param {{ hazardIntervalMs?: number }} [options]
 */
export function createStormNavigationGame({ hazardIntervalMs = BASE_HAZARD_INTERVAL_MS } = {}) {
  return {
    hazardIntervalMs,
    hazardProgressPerMs: BASE_HAZARD_PROGRESS_PER_MS,
    msSinceLastHazard: 0,
    elapsedMs: 0,
    playerX: 0,
    playerVelocityX: 0,
    hazards: [],
    hazardsDodged: 0,
    hazardsHit: 0,
    running: true,
    nextHazardId: 1,
  };
}

function hazardIntervalForDodges(hazardsDodged) {
  const steps = Math.floor(hazardsDodged / DODGES_PER_RAMP_STEP);
  return Math.max(MIN_HAZARD_INTERVAL_MS, BASE_HAZARD_INTERVAL_MS - steps * HAZARD_INTERVAL_STEP_MS);
}

// Hazards not only spawn more often as a run goes on (hazardIntervalForDodges above) but also
// physically approach faster, so a long run keeps feeling like it's accelerating rather than
// just getting busier at a flat speed.
function hazardSpeedForDodges(hazardsDodged) {
  const steps = Math.floor(hazardsDodged / DODGES_PER_RAMP_STEP);
  return Math.min(MAX_HAZARD_PROGRESS_PER_MS, BASE_HAZARD_PROGRESS_PER_MS + steps * HAZARD_SPEED_STEP_PER_RAMP);
}

/**
 * Pure per-frame steering integrator — momentum + friction, CubeField-style. Call once per
 * animation frame with the currently held input direction (read from held keys/pointer by the
 * caller) and the frame's elapsed ms.
 * @param {ReturnType<typeof createStormNavigationGame>} state
 * @param {-1 | 0 | 1} inputDirection
 * @param {number} deltaMs
 */
export function steerShip(state, inputDirection, deltaMs) {
  if (!state.running) return state;
  const dt = deltaMs / 1000;
  let velocity = state.playerVelocityX;
  if (inputDirection !== 0) {
    velocity += inputDirection * STEER_ACCEL_PER_S2 * dt;
  } else {
    velocity *= Math.max(0, 1 - STEER_FRICTION_PER_S * dt);
    if (Math.abs(velocity) < 0.001) velocity = 0;
  }
  velocity = Math.max(-MAX_STEER_SPEED_PER_S, Math.min(MAX_STEER_SPEED_PER_S, velocity));

  let playerX = state.playerX + velocity * dt;
  if (playerX < -1 || playerX > 1) {
    playerX = Math.max(-1, Math.min(1, playerX));
    velocity = 0; // stop dead at the rail rather than bounce/overshoot-correct
  }

  return { ...state, playerX, playerVelocityX: velocity };
}

/**
 * Pure timer/hazard advance — call each animation frame/tick with the
 * elapsed ms and a random-source function (injectable for deterministic
 * tests; defaults to Math.random). Endless: keeps running until a hazard
 * hits the player's position.
 * @param {ReturnType<typeof createStormNavigationGame>} state
 * @param {number} deltaMs
 * @param {() => number} [random]
 */
export function tickStormNavigationGame(state, deltaMs, random = Math.random) {
  if (!state.running) return state;

  const elapsedMs = state.elapsedMs + deltaMs;
  let msSinceLastHazard = state.msSinceLastHazard + deltaMs;
  let nextHazardId = state.nextHazardId;
  const hazardIntervalMs = hazardIntervalForDodges(state.hazardsDodged);
  const hazardProgressPerMs = hazardSpeedForDodges(state.hazardsDodged);

  const advancedHazards = state.hazards.map((hazard) => ({
    ...hazard,
    progress: hazard.progress + deltaMs * hazardProgressPerMs,
  }));

  if (msSinceLastHazard >= hazardIntervalMs) {
    msSinceLastHazard = 0;
    advancedHazards.push({
      id: nextHazardId++,
      x: random() * 2 - 1,
      kind: HAZARD_KINDS[Math.floor(random() * HAZARD_KINDS.length)],
      progress: 0,
    });
  }

  let hazardsDodged = state.hazardsDodged;
  let hazardsHit = state.hazardsHit;
  let running = true;
  const survivors = [];
  advancedHazards.forEach((hazard) => {
    if (hazard.progress >= 1) {
      if (Math.abs(hazard.x - state.playerX) <= HIT_RADIUS_X) {
        hazardsHit += 1;
        running = false;
      } else {
        hazardsDodged += 1;
      }
    } else {
      survivors.push(hazard);
    }
  });

  return {
    ...state,
    hazardIntervalMs,
    hazardProgressPerMs,
    elapsedMs,
    msSinceLastHazard,
    hazards: survivors,
    nextHazardId,
    hazardsDodged,
    hazardsHit,
    running,
  };
}

// Continuous-x -> horizontal % offset from center, shared by the ship and every hazard so
// they all converge toward the same vanishing point at the horizon (see --lane-offset/--p
// usage in the CSS: hazards multiply this by their progress, so a hazard just spawned sits
// near center-horizon and spreads out to its full x position as it nears the player).
const PLAYER_TRACK_HALF_PERCENT = 40;

// Ship banking tilt (CSS --bank, degrees) scales with how fast the ship is currently
// steering, so it visibly leans into a turn and levels out as it glides to a stop.
const MAX_BANK_DEG = 18;

// Background parallax (CSS --parallax-px) shifts opposite the ship's position so the world
// reads as sliding past during a turn, reinforcing the first-person "flying through it" feel
// instead of the ship looking like it's the only thing moving.
const PARALLAX_MAX_PX = 22;
const CLOUDS_PARALLAX_FACTOR = 0.4; // clouds read as more distant than the coastline

// Falls back to empty (broken-image) src when a caller — e.g. unit tests — doesn't supply
// real sprite URLs. Asset resolution stays in main.js (this module has no Vite/import.meta.url
// concerns of its own, matching the "stays pure" intent above), so sprites are always passed in.
const DEFAULT_SPRITES = { ship: "", hazardKinds: {}, coastline: "", clouds: "" };

/**
 * @param {ReturnType<typeof createStormNavigationGame>} state
 * @param {number} [bestScore] Best hazardsDodged from a prior run, for display only.
 * @param {{ ship: string, hazardKinds: Record<string, string>, coastline: string, clouds: string }} [sprites]
 */
export function renderStormNavigationGame(state, bestScore = 0, sprites = DEFAULT_SPRITES) {
  const elapsedSeconds = Math.floor(state.elapsedMs / 1000);
  const shipOffset = state.playerX * PLAYER_TRACK_HALF_PERCENT;
  const hazards = state.hazards
    .map((hazard) => {
      const offset = hazard.x * PLAYER_TRACK_HALF_PERCENT;
      const p = Math.max(0, Math.min(1, hazard.progress));
      const kind = hazard.kind || HAZARD_KINDS[0];
      const art = sprites.hazardKinds?.[kind] || "";
      return `<div class="storm-hazard" data-storm-hazard="${hazard.id}" data-storm-x="${hazard.x.toFixed(2)}" data-storm-kind="${kind}" style="--p:${p};--lane-offset:${offset}%"><img class="storm-hazard-art" src="${art}" alt="" draggable="false"></div>`;
    })
    .join("");

  const isNewBest = !state.running && state.hazardsDodged > bestScore;
  const displayedBest = Math.max(bestScore, state.hazardsDodged);
  const bankDeg =
    Math.max(-1, Math.min(1, state.playerVelocityX / MAX_STEER_SPEED_PER_S)) * MAX_BANK_DEG;
  const coastlineParallaxPx = -state.playerX * PARALLAX_MAX_PX;
  const cloudsParallaxPx = coastlineParallaxPx * CLOUDS_PARALLAX_FACTOR;

  return `<section class="mini-game mini-game-storm-navigation" data-mini-game="storm-navigation">
  <p class="mini-game-timer">${state.running ? `Time survived: ${elapsedSeconds}s` : "Shipwrecked!"}</p>
  <div class="storm-track">
    <img class="storm-clouds" src="${sprites.clouds}" alt="" draggable="false" style="--parallax-px:${cloudsParallaxPx.toFixed(1)}px">
    <img class="storm-coastline" src="${sprites.coastline}" alt="" draggable="false" style="--parallax-px:${coastlineParallaxPx.toFixed(1)}px">
    <div class="storm-horizon"></div>
    ${hazards}
    <div class="storm-ship" data-storm-ship style="--lane-offset:${shipOffset}%">
      <span class="storm-ship-wake"></span>
      <img class="storm-ship-art" src="${sprites.ship}" alt="" draggable="false" style="--bank:${bankDeg.toFixed(1)}deg">
    </div>
  </div>
  <p class="storm-tally">Dodged: ${state.hazardsDodged} · Best: ${displayedBest}</p>
  ${state.running ? "" : `<p class="storm-final-score">Final score: ${state.hazardsDodged}${isNewBest ? " — New best!" : ""}</p>`}
  <div class="storm-controls">
    ${
      state.running
        ? `<button type="button" data-storm-move="-1">◀ Port</button>
    <button type="button" data-storm-move="1">Starboard ▶</button>
    <span class="storm-controls-hint">or hold ◄ ► / A D</span>`
        : `<button type="button" data-storm-restart>Set Sail Again ⛵</button>
    <span class="storm-controls-hint">or press Enter</span>`
    }
  </div>
</section>`;
}
