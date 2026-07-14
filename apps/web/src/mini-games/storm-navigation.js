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
// is the run's score. Difficulty ramps up gradually as hazardsDodged grows
// (hazards spawn more frequently, floor-clamped) so an endless run actually
// gets harder over time rather than staying flat.

const LANE_COUNT = 3;
const HAZARD_PROGRESS_PER_MS = 0.00035; // tuned so a hazard crosses lane in ~3s
const BASE_HAZARD_INTERVAL_MS = 1200;
const MIN_HAZARD_INTERVAL_MS = 500;
const DODGES_PER_RAMP_STEP = 5;
const HAZARD_INTERVAL_STEP_MS = 60;

function hazardIntervalForDodges(hazardsDodged) {
  const steps = Math.floor(hazardsDodged / DODGES_PER_RAMP_STEP);
  return Math.max(MIN_HAZARD_INTERVAL_MS, BASE_HAZARD_INTERVAL_MS - steps * HAZARD_INTERVAL_STEP_MS);
}

/**
 * @param {{ hazardIntervalMs?: number }} [options]
 */
export function createStormNavigationGame({ hazardIntervalMs = BASE_HAZARD_INTERVAL_MS } = {}) {
  return {
    hazardIntervalMs,
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

  const advancedHazards = state.hazards.map((hazard) => ({
    ...hazard,
    progress: hazard.progress + deltaMs * HAZARD_PROGRESS_PER_MS,
  }));

  if (msSinceLastHazard >= hazardIntervalMs) {
    msSinceLastHazard = 0;
    advancedHazards.push({
      id: nextHazardId++,
      lane: Math.floor(random() * LANE_COUNT),
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

/**
 * @param {ReturnType<typeof createStormNavigationGame>} state
 * @param {number} [bestScore] Best hazardsDodged from a prior run, for display only.
 */
export function renderStormNavigationGame(state, bestScore = 0) {
  const elapsedSeconds = Math.floor(state.elapsedMs / 1000);
  const lanes = Array.from({ length: LANE_COUNT }, (_, laneIndex) => {
    const hazardsInLane = state.hazards.filter((hazard) => hazard.lane === laneIndex);
    const isPlayerLane = laneIndex === state.playerLane;
    return `<div class="storm-lane${isPlayerLane ? " storm-lane--player" : ""}" data-storm-lane="${laneIndex}">
      ${isPlayerLane ? `<div class="storm-ship" data-storm-ship>⛵</div>` : ""}
      ${hazardsInLane
        .map(
          (hazard) =>
            `<div class="storm-hazard" data-storm-hazard="${hazard.id}" style="top:${Math.round(hazard.progress * 100)}%">🌊</div>`,
        )
        .join("")}
    </div>`;
  }).join("");

  const isNewBest = !state.running && state.hazardsDodged > bestScore;
  const displayedBest = Math.max(bestScore, state.hazardsDodged);

  return `<section class="mini-game mini-game-storm-navigation" data-mini-game="storm-navigation">
  <p class="mini-game-timer">${state.running ? `Time survived: ${elapsedSeconds}s` : "Shipwrecked!"}</p>
  <div class="storm-lanes">${lanes}</div>
  <p class="storm-tally">Dodged: ${state.hazardsDodged} · Best: ${displayedBest}</p>
  ${state.running ? "" : `<p class="storm-final-score">Final score: ${state.hazardsDodged}${isNewBest ? " — New best!" : ""}</p>`}
  <div class="storm-controls">
    ${
      state.running
        ? `<button type="button" data-storm-move="-1">◀ Port</button>
    <button type="button" data-storm-move="1">Starboard ▶</button>`
        : `<button type="button" data-storm-restart>Set Sail Again ⛵</button>`
    }
  </div>
</section>`;
}
