// Storm Navigation — Atlantic-crossing flavor mini-game. A timing/reflex
// break: dodge storm hazards while crossing, with thematic dressing (a
// period-appropriate ship, not a fantasy setting). Purely an arcade break —
// it isn't meant to teach anything and shouldn't be forced to.
//
// Not rubric-scored, not tied to the historical-thinking-skill schema, and
// intentionally kept out of apps/web/src/quest-types/ for exactly that
// reason. No currency, wallet, leaderboard, or persistent economy —
// `hazardsDodged`/`hazardsHit` are ephemeral runtime tallies only, not saved
// between sessions. No multiplayer/opponent mechanic of any kind.

const LANE_COUNT = 3;
const HAZARD_PROGRESS_PER_MS = 0.00035; // tuned so a hazard crosses lane in ~3s

/**
 * @param {{ durationMs?: number, hazardIntervalMs?: number }} [options]
 */
export function createStormNavigationGame({ durationMs = 30000, hazardIntervalMs = 1200 } = {}) {
  return {
    durationMs,
    remainingMs: durationMs,
    hazardIntervalMs,
    msSinceLastHazard: 0,
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
 * tests; defaults to Math.random).
 * @param {ReturnType<typeof createStormNavigationGame>} state
 * @param {number} deltaMs
 * @param {() => number} [random]
 */
export function tickStormNavigationGame(state, deltaMs, random = Math.random) {
  if (!state.running) return state;

  const remainingMs = Math.max(0, state.remainingMs - deltaMs);
  let msSinceLastHazard = state.msSinceLastHazard + deltaMs;
  let nextHazardId = state.nextHazardId;

  const advancedHazards = state.hazards.map((hazard) => ({
    ...hazard,
    progress: hazard.progress + deltaMs * HAZARD_PROGRESS_PER_MS,
  }));

  if (msSinceLastHazard >= state.hazardIntervalMs) {
    msSinceLastHazard = 0;
    advancedHazards.push({
      id: nextHazardId++,
      lane: Math.floor(random() * LANE_COUNT),
      progress: 0,
    });
  }

  let hazardsDodged = state.hazardsDodged;
  let hazardsHit = state.hazardsHit;
  const survivors = [];
  advancedHazards.forEach((hazard) => {
    if (hazard.progress >= 1) {
      if (hazard.lane === state.playerLane) hazardsHit += 1;
      else hazardsDodged += 1;
    } else {
      survivors.push(hazard);
    }
  });

  return {
    ...state,
    remainingMs,
    msSinceLastHazard,
    hazards: survivors,
    nextHazardId,
    hazardsDodged,
    hazardsHit,
    running: remainingMs > 0,
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
 */
export function renderStormNavigationGame(state) {
  const secondsLeft = Math.ceil(state.remainingMs / 1000);
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

  return `<section class="mini-game mini-game-storm-navigation" data-mini-game="storm-navigation">
  <p class="mini-game-timer">${state.running ? `Time remaining: ${secondsLeft}s` : "Landfall!"}</p>
  <div class="storm-lanes">${lanes}</div>
  <p class="storm-tally">Dodged: ${state.hazardsDodged} · Hit: ${state.hazardsHit}</p>
  <div class="storm-controls">
    <button type="button" data-storm-move="-1">◀ Port</button>
    <button type="button" data-storm-move="1">Starboard ▶</button>
  </div>
</section>`;
}
