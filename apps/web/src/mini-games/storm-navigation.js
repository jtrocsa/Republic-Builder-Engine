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
// the player's lane (`running` flips to false); hazardsDodged at that point
// is the run's score. Difficulty ramps up gradually as hazardsDodged grows —
// hazards spawn more frequently AND approach faster (both floor/ceiling
// clamped) — so an endless run actually gets harder over time rather than
// staying flat.

const LANE_COUNT = 3;
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
 * @param {{ hazardIntervalMs?: number }} [options]
 */
export function createStormNavigationGame({ hazardIntervalMs = BASE_HAZARD_INTERVAL_MS } = {}) {
  return {
    hazardIntervalMs,
    hazardProgressPerMs: BASE_HAZARD_PROGRESS_PER_MS,
    msSinceLastHazard: 0,
    elapsedMs: 0,
    playerLane: Math.floor(LANE_COUNT / 2),
    hazards: [],
    hazardsDodged: 0,
    hazardsHit: 0,
    running: true,
    nextHazardId: 1,
  };
}

/**
 * Pure timer/hazard advance — call each animation frame/tick with the
 * elapsed ms and a random-source function (injectable for deterministic
 * tests; defaults to Math.random). Endless: keeps running until a hazard
 * hits the player's lane.
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
      lane: Math.floor(random() * LANE_COUNT),
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
      if (hazard.lane === state.playerLane) {
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

/**
 * @param {ReturnType<typeof createStormNavigationGame>} state
 * @param {-1 | 1} direction
 */
export function moveShip(state, direction) {
  if (!state.running) return state;
  const playerLane = Math.min(LANE_COUNT - 1, Math.max(0, state.playerLane + direction));
  return { ...state, playerLane };
}

// Lane 0/1/2 -> horizontal % offset from center, shared by the ship and every hazard so
// they all converge toward the same vanishing point at the horizon (see --lane-offset/--p
// usage in the CSS: hazards multiply this by their progress, so a hazard just spawned sits
// near center-horizon and spreads out to its full lane position as it nears the player).
const LANE_OFFSET_PERCENT = { 0: -24, 1: 0, 2: 24 };

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
  const shipOffset = LANE_OFFSET_PERCENT[state.playerLane] ?? 0;
  const hazards = state.hazards
    .map((hazard) => {
      const offset = LANE_OFFSET_PERCENT[hazard.lane] ?? 0;
      const p = Math.max(0, Math.min(1, hazard.progress));
      const kind = hazard.kind || HAZARD_KINDS[0];
      const art = sprites.hazardKinds?.[kind] || "";
      return `<div class="storm-hazard" data-storm-hazard="${hazard.id}" data-storm-lane="${hazard.lane}" data-storm-kind="${kind}" style="--p:${p};--lane-offset:${offset}%"><img class="storm-hazard-art" src="${art}" alt="" draggable="false"></div>`;
    })
    .join("");

  const isNewBest = !state.running && state.hazardsDodged > bestScore;
  const displayedBest = Math.max(bestScore, state.hazardsDodged);

  return `<section class="mini-game mini-game-storm-navigation" data-mini-game="storm-navigation">
  <p class="mini-game-timer">${state.running ? `Time survived: ${elapsedSeconds}s` : "Shipwrecked!"}</p>
  <div class="storm-track">
    <img class="storm-clouds" src="${sprites.clouds}" alt="" draggable="false">
    <img class="storm-coastline" src="${sprites.coastline}" alt="" draggable="false">
    <div class="storm-horizon"></div>
    ${hazards}
    <div class="storm-ship" data-storm-ship style="--lane-offset:${shipOffset}%">
      <span class="storm-ship-wake"></span>
      <img class="storm-ship-art" src="${sprites.ship}" alt="" draggable="false">
    </div>
  </div>
  <p class="storm-tally">Dodged: ${state.hazardsDodged} · Best: ${displayedBest}</p>
  ${state.running ? "" : `<p class="storm-final-score">Final score: ${state.hazardsDodged}${isNewBest ? " — New best!" : ""}</p>`}
  <div class="storm-controls">
    ${
      state.running
        ? `<button type="button" data-storm-move="-1">◀ Port</button>
    <button type="button" data-storm-move="1">Starboard ▶</button>
    <span class="storm-controls-hint">or use ◄ ► / A D</span>`
        : `<button type="button" data-storm-restart>Set Sail Again ⛵</button>
    <span class="storm-controls-hint">or press Enter</span>`
    }
  </div>
</section>`;
}
