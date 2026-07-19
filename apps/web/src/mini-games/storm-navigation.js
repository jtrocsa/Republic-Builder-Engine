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
// point is the run's score. Difficulty ramps up continuously with how long
// the run has survived (see stormIntensity()) — hazards spawn more often,
// approach faster, and draw from a wider variety of kinds the longer a run
// goes, with a calm grace period at the very start.
//
// Steering is continuous, CubeField-style, not 3 discrete lanes: the ship
// has a position (playerX) and velocity (playerVelocityX) across a single
// horizontal axis in [-1, 1], driven each frame by steerShip() with
// acceleration while a direction is held and friction decay when it isn't.
// Hazards spawn at a random continuous x (not one of a fixed set of
// columns) and never move laterally once spawned — only their forward
// `progress` changes — matching how CubeField's obstacles are static once
// placed and only appear to approach via perspective growth.
//
// The mini-game is redrawn via a full container.innerHTML replace every
// animation frame (see main.js's runMiniGameLoop), so every DOM node in the
// returned markup is destroyed and recreated ~60x/second. That makes CSS
// `@keyframes ... infinite` the wrong tool for any continuous motion here —
// a fresh node never gets more than ~16ms into its own animation timeline
// before being torn down, so it reads as frozen near its starting frame.
// Instead, every continuous-motion value (water flow, rain, lightning,
// hazard/ship bob) is computed explicitly from state.elapsedMs below and
// emitted as a literal inline style value — still a pure function of state,
// just computed in JS instead of delegated to a CSS clock.

const BASE_HAZARD_PROGRESS_PER_MS = 0.00022; // fresh-run hazard crosses in ~4.5s — a calm open
const MAX_HAZARD_PROGRESS_PER_MS = 0.0009; // top speed: crosses in ~1.11s
const BASE_HAZARD_INTERVAL_MS = 2200;
const MIN_HAZARD_INTERVAL_MS = 380;
// Visual variety only (see renderStormNavigationGame's `sprites.hazardKinds` lookup) — every
// kind is resolved identically for collision/timing, so this doesn't touch difficulty. Order
// matters: it's also the unlock order in eligibleHazardKinds() below (rock, then wreckage,
// then whirlpool, as a run's stormIntensity climbs).
export const HAZARD_KINDS = ["rock", "wreckage", "whirlpool"];

// stormIntensity() is the single time-based spine every other ramp (spawn interval, hazard
// speed, hazard-kind variety) and every atmosphere effect (water flow speed, rain, lightning)
// reads from, so pacing and visuals climb together instead of drifting out of sync.
const RAMP_GRACE_MS = 8000; // first 8s: zero ramp — the calm "slowly dodging rocks" open
const RAMP_CEILING_MS = 90000; // intensity reaches 1.0 (full storm) at 90s elapsed

/**
 * 0 through the grace period, then a quadratic ease-in up to 1 at RAMP_CEILING_MS. Quadratic
 * (not linear, not an asymptotic ease-out) so the *rate* of increase itself keeps growing —
 * "speeds up slowly, then faster" — rather than a flat rate or a front-loaded jump that then
 * plateaus.
 * @param {number} elapsedMs
 */
export function stormIntensity(elapsedMs) {
  if (elapsedMs <= RAMP_GRACE_MS) return 0;
  const t = Math.max(
    0,
    Math.min(1, (elapsedMs - RAMP_GRACE_MS) / (RAMP_CEILING_MS - RAMP_GRACE_MS))
  );
  return t * t;
}

function hazardIntervalForElapsed(elapsedMs) {
  const intensity = stormIntensity(elapsedMs);
  return BASE_HAZARD_INTERVAL_MS - intensity * (BASE_HAZARD_INTERVAL_MS - MIN_HAZARD_INTERVAL_MS);
}

function hazardSpeedForElapsed(elapsedMs) {
  const intensity = stormIntensity(elapsedMs);
  return (
    BASE_HAZARD_PROGRESS_PER_MS +
    intensity * (MAX_HAZARD_PROGRESS_PER_MS - BASE_HAZARD_PROGRESS_PER_MS)
  );
}

// Hazard-kind variety unlocks as the storm builds (elapsedMs) — a run opens with rocks only,
// wreckage joins partway through, whirlpools last — reinforcing "the storm getting worse"
// alongside the interval/speed ramp above. Thresholds are in intensity-space (not raw ms) so
// they track the same eased curve as everything else.
const WRECKAGE_UNLOCK_INTENSITY = 0.15; // ~elapsedMs 40s
const WHIRLPOOL_UNLOCK_INTENSITY = 0.45; // ~elapsedMs 63s

function eligibleHazardKinds(elapsedMs) {
  const intensity = stormIntensity(elapsedMs);
  if (intensity >= WHIRLPOOL_UNLOCK_INTENSITY) return HAZARD_KINDS;
  if (intensity >= WRECKAGE_UNLOCK_INTENSITY) return HAZARD_KINDS.slice(0, 2);
  return HAZARD_KINDS.slice(0, 1);
}

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
  const hazardIntervalMs = hazardIntervalForElapsed(elapsedMs);
  const hazardProgressPerMs = hazardSpeedForElapsed(elapsedMs);

  const advancedHazards = state.hazards.map((hazard) => ({
    ...hazard,
    progress: hazard.progress + deltaMs * hazardProgressPerMs,
  }));

  if (msSinceLastHazard >= hazardIntervalMs) {
    msSinceLastHazard = 0;
    const eligibleKinds = eligibleHazardKinds(elapsedMs);
    advancedHazards.push({
      id: nextHazardId++,
      x: random() * 2 - 1,
      kind: eligibleKinds[Math.floor(random() * eligibleKinds.length)],
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
// they all converge toward the same vanishing point at the horizon (see --lane-offset/
// --screen-t usage in the CSS: hazards multiply this by their eased screen position, so a
// hazard just spawned sits near center-horizon and spreads out to its full x position as it
// nears the player).
const PLAYER_TRACK_HALF_PERCENT = 40;

// True-perspective reveal: raw hazard.progress (p, 0-1) advances at a constant rate — that's
// the actual difficulty timing (spawn interval, closing speed) and is left untouched here. But
// a *linear* mapping from p to screen position/size/opacity makes a hazard's eventual lane and
// danger level obvious very early in its approach (easy to predict, easy to dodge with time to
// spare). Real perspective isn't linear: an object approaching at constant real-world speed
// barely grows for most of the distance, then rushes to full size right at the end — the same
// "pinprick, then sudden rush" read CubeField's obstacles have. perspectiveEase() reshapes p
// into that curve for rendering only; perspectiveEase(0)=0 and perspectiveEase(1)=1 always, so
// the visual "arrival" still coincides exactly with the progress>=1 collision trigger — no
// fairness mismatch between what's visible and what the game logic decides.
const HAZARD_PERSPECTIVE_POWER = 2.6; // >1 = compress apparent growth/movement into the final approach

function perspectiveEase(p) {
  return p ** HAZARD_PERSPECTIVE_POWER;
}

// Ship banking tilt (CSS --bank, degrees) scales with how fast the ship is currently
// steering, so it visibly leans into a turn and levels out as it glides to a stop.
const MAX_BANK_DEG = 18;

// Background parallax (CSS --parallax-px) shifts opposite the ship's position so the world
// reads as sliding past during a turn, reinforcing the first-person "flying through it" feel
// instead of the ship looking like it's the only thing moving.
const PARALLAX_MAX_PX = 22;
const CLOUDS_PARALLAX_FACTOR = 0.4; // clouds read as more distant than the coastline

// Ship idle bob — computed from elapsedMs (see the file-header note on why: CSS keyframes
// don't survive the per-frame full-innerHTML redraw) rather than a CSS animation.
const SHIP_BOB_PERIOD_MS = 1800;
const SHIP_BOB_AMPLITUDE_PX = 4;

function shipBobPx(elapsedMs) {
  return Math.sin((2 * Math.PI * elapsedMs) / SHIP_BOB_PERIOD_MS) * SHIP_BOB_AMPLITUDE_PX;
}

// Layered sea "current" — three repeating-gradient bands at different angles/tile sizes (see
// the matching CSS in global.css), each scrolled by an explicit elapsedMs-derived position so
// the water reads as continuously, believably moving rather than a static hash texture. Speed
// scales with stormIntensity but never drops to zero, so the sea is always gently alive even
// during the calm grace period.
const WAVE_LAYERS = [
  { speedPxPerMs: 0.045, tilePx: 200 }, // near: fastest, tightest bands
  { speedPxPerMs: 0.03, tilePx: 340 },
  { speedPxPerMs: 0.018, tilePx: 520 }, // far: slowest, broadest bands
];
const WAVE_SPEED_INTENSITY_MULT = 2.2; // top intensity moves water up to 3.2x the calm baseline

function waveBackgroundPosition(elapsedMs, intensity) {
  const flowMult = 1 + intensity * WAVE_SPEED_INTENSITY_MULT;
  const offsets = WAVE_LAYERS.map(
    (layer) => `${(-(elapsedMs * layer.speedPxPerMs * flowMult) % layer.tilePx).toFixed(1)}px 0`
  );
  return ["0 0", ...offsets, "0 0"].join(", ");
}

// Rain — a single scrolling repeating-gradient layer, opacity/speed scaled by stormIntensity.
// Invisible through the calm grace period, builds in gradually as the storm develops.
const RAIN_SPEED_PX_PER_MS = 0.5;
const RAIN_TILE_PX = 240;
const RAIN_MAX_OPACITY = 0.5;
const RAIN_MIN_INTENSITY = 0.05;

function rainStyle(elapsedMs, intensity) {
  const opacity =
    intensity <= RAIN_MIN_INTENSITY ? 0 : Number((RAIN_MAX_OPACITY * intensity).toFixed(2));
  const posPx = (-(elapsedMs * RAIN_SPEED_PX_PER_MS * (0.6 + intensity)) % RAIN_TILE_PX).toFixed(1);
  return `opacity:${opacity};background-position:0 ${posPx}px`;
}

// Lightning — an occasional full-scene flash, envelope computed deterministically from
// elapsedMs (no RNG involved, keeping the hazard-spawn RNG contract untouched). Flashes get
// more frequent as stormIntensity climbs and don't happen at all below a minimum intensity.
const LIGHTNING_MIN_CYCLE_MS = 4000;
const LIGHTNING_MAX_CYCLE_MS = 26000;
const LIGHTNING_FLASH_RISE_MS = 40;
const LIGHTNING_FLASH_DURATION_MS = 220;
const LIGHTNING_MIN_INTENSITY = 0.1;
const LIGHTNING_MAX_OPACITY = 0.5;

function lightningOpacity(elapsedMs, intensity) {
  if (intensity < LIGHTNING_MIN_INTENSITY) return 0;
  const cycleMs =
    LIGHTNING_MAX_CYCLE_MS - intensity * (LIGHTNING_MAX_CYCLE_MS - LIGHTNING_MIN_CYCLE_MS);
  const phase = elapsedMs % cycleMs;
  if (phase >= LIGHTNING_FLASH_DURATION_MS) return 0;
  const envelope =
    phase < LIGHTNING_FLASH_RISE_MS
      ? phase / LIGHTNING_FLASH_RISE_MS
      : 1 -
        (phase - LIGHTNING_FLASH_RISE_MS) / (LIGHTNING_FLASH_DURATION_MS - LIGHTNING_FLASH_RISE_MS);
  return Number((envelope * LIGHTNING_MAX_OPACITY * intensity).toFixed(2));
}

// Per-hazard idle bob/sway so hazards read as floating on real water instead of frozen in
// place. Phase is derived deterministically from hazard.id (not a new random draw, so the
// spawn RNG contract is untouched) with a non-divisor spacing so consecutive ids desync —
// same "don't march in lockstep" principle this codebase already applies to NPC patrols.
const HAZARD_BOB_PERIOD_MS = 2600;
const HAZARD_BOB_AMPLITUDE_PX = 5;
const HAZARD_SWAY_PERIOD_MS = 3400;
const HAZARD_SWAY_AMPLITUDE_DEG = 4;
const HAZARD_PHASE_SPACER_MS = 733;

function hazardBobSway(hazard, elapsedMs, screenT) {
  const phaseMs = (hazard.id * HAZARD_PHASE_SPACER_MS) % HAZARD_BOB_PERIOD_MS;
  const scale = 0.3 + screenT; // matches .storm-hazard's existing scale term, so bob shrinks with distance
  const bobPx =
    Math.sin((2 * Math.PI * (elapsedMs + phaseMs)) / HAZARD_BOB_PERIOD_MS) *
    HAZARD_BOB_AMPLITUDE_PX *
    scale;
  const swayDeg =
    Math.sin((2 * Math.PI * (elapsedMs + phaseMs * 1.3)) / HAZARD_SWAY_PERIOD_MS) *
    HAZARD_SWAY_AMPLITUDE_DEG;
  return { bobPx, swayDeg };
}

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
  const intensity = stormIntensity(state.elapsedMs);
  const shipOffset = state.playerX * PLAYER_TRACK_HALF_PERCENT;
  const hazards = state.hazards
    .map((hazard) => {
      const offset = hazard.x * PLAYER_TRACK_HALF_PERCENT;
      const p = Math.max(0, Math.min(1, hazard.progress));
      const screenT = perspectiveEase(p);
      const kind = hazard.kind || HAZARD_KINDS[0];
      const art = sprites.hazardKinds?.[kind] || "";
      const { bobPx, swayDeg } = hazardBobSway(hazard, state.elapsedMs, screenT);
      return `<div class="storm-hazard" data-storm-hazard="${hazard.id}" data-storm-x="${hazard.x.toFixed(2)}" data-storm-kind="${kind}" style="--p:${p};--screen-t:${screenT.toFixed(4)};--lane-offset:${offset}%;--bob-px:${bobPx.toFixed(1)}px;--sway-deg:${swayDeg.toFixed(1)}deg"><span class="storm-hazard-wake"></span><img class="storm-hazard-art" src="${art}" alt="" draggable="false"></div>`;
    })
    .join("");

  const isNewBest = !state.running && state.hazardsDodged > bestScore;
  const displayedBest = Math.max(bestScore, state.hazardsDodged);
  const bankDeg =
    Math.max(-1, Math.min(1, state.playerVelocityX / MAX_STEER_SPEED_PER_S)) * MAX_BANK_DEG;
  const coastlineParallaxPx = -state.playerX * PARALLAX_MAX_PX;
  const cloudsParallaxPx = coastlineParallaxPx * CLOUDS_PARALLAX_FACTOR;
  const shipBob = shipBobPx(state.elapsedMs);
  const waveBackgroundPos = waveBackgroundPosition(state.elapsedMs, intensity);
  const rainInlineStyle = rainStyle(state.elapsedMs, intensity);
  const lightningOpacityValue = lightningOpacity(state.elapsedMs, intensity);

  return `<section class="mini-game mini-game-storm-navigation" data-mini-game="storm-navigation">
  <p class="mini-game-timer">${state.running ? `Time survived: ${elapsedSeconds}s` : "Shipwrecked!"}</p>
  <div class="storm-track" style="background-position:${waveBackgroundPos}">
    <img class="storm-clouds" src="${sprites.clouds}" alt="" draggable="false" style="--parallax-px:${cloudsParallaxPx.toFixed(1)}px">
    <img class="storm-coastline" src="${sprites.coastline}" alt="" draggable="false" style="--parallax-px:${coastlineParallaxPx.toFixed(1)}px">
    <div class="storm-rain" style="${rainInlineStyle}"></div>
    <div class="storm-horizon"></div>
    ${hazards}
    <div class="storm-ship" data-storm-ship style="--lane-offset:${shipOffset}%;--bob-px:${shipBob.toFixed(1)}px">
      <span class="storm-ship-wake"></span>
      <img class="storm-ship-art" src="${sprites.ship}" alt="" draggable="false" style="--bank:${bankDeg.toFixed(1)}deg">
    </div>
    <div class="storm-lightning" style="opacity:${lightningOpacityValue}"></div>
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
