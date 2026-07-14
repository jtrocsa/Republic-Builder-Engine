// Cargo Sorting — Caribbean/Unit 1 flavor mini-game. Timed sorting of goods
// into correct ship holds. Reuses the drag-into-slot interaction pattern
// already established for quest-types/generic/sequencing-quest.js and
// main.js's own map-jigsaw puzzle (draggable="true" pieces dropped onto
// data-attributed targets), with a different visual skin.
//
// This is a pacing/reward break, NOT a rubric-scored quest: it does not use
// the historical-thinking-skill schema, is not gated behind correct/incorrect
// content answers, and is intentionally kept out of apps/web/src/quest-types/
// for exactly that reason (see docs/architecture/session-reports/ for the
// explicit split this preserves). No currency, wallet, or persistent economy
// is tracked — `sortedCount` is ephemeral runtime feedback only, not saved.
//
// Content framing note (flagged explicitly for the project owner — see
// docs/architecture/session-reports/2026-07-11-overnight-quest-types-and-minigames.md):
// the default goods below are Columbian-Exchange-era Caribbean trade goods
// and specimens (maize, cassava, pineapple, cotton, gold ore, tobacco) —
// deliberately NOT the triangular-trade goods used by Unit 2's
// TRIANGLE_CARGO (apps/web/src/content/unit-02-campaign.js), since Case
// 1.01/Caribbean predates that later plantation-era system and this
// mini-game's framing is meant to stay on period-appropriate trade
// logistics, not risk trivializing forced labor by turning it into a
// sorting-puzzle skin.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const DEFAULT_CARGO_HOLDS = [
  { id: "foodstuffs", label: "Foodstuffs Hold" },
  { id: "materials-specimens", label: "Raw Materials & Specimens Hold" },
];

export const DEFAULT_CARGO_GOODS = [
  { id: "maize", label: "🌽 Maize", holdId: "foodstuffs" },
  { id: "cassava", label: "🍠 Cassava", holdId: "foodstuffs" },
  { id: "pineapple", label: "🍍 Pineapple", holdId: "foodstuffs" },
  { id: "cotton", label: "🧺 Raw cotton", holdId: "materials-specimens" },
  { id: "gold-ore", label: "⛏ Gold ore samples", holdId: "materials-specimens" },
  { id: "tobacco-leaf", label: "🌿 Tobacco leaf", holdId: "materials-specimens" },
];

/**
 * @param {{ goods?: object[], holds?: object[], durationMs?: number }} [options]
 */
export function createCargoSortingGame({
  goods = DEFAULT_CARGO_GOODS,
  holds = DEFAULT_CARGO_HOLDS,
  durationMs = 45000,
} = {}) {
  return {
    goods,
    holds,
    placements: {},
    remainingMs: durationMs,
    running: true,
    sortedCount: 0,
  };
}

/**
 * Pure timer advance — call each animation frame/tick with the elapsed ms.
 * @param {ReturnType<typeof createCargoSortingGame>} state
 * @param {number} deltaMs
 */
export function tickCargoSortingGame(state, deltaMs) {
  if (!state.running) return state;
  const remainingMs = Math.max(0, state.remainingMs - deltaMs);
  return { ...state, remainingMs, running: remainingMs > 0 };
}

/**
 * @param {ReturnType<typeof createCargoSortingGame>} state
 * @param {string} goodId
 * @param {string} holdId
 */
export function placeCargo(state, goodId, holdId) {
  if (!state.running) return state;
  const placements = { ...state.placements, [goodId]: holdId };
  const sortedCount = state.goods.filter((good) => placements[good.id] === good.holdId).length;
  return { ...state, placements, sortedCount };
}

/**
 * @param {ReturnType<typeof createCargoSortingGame>} state
 */
export function isCargoSortingComplete(state) {
  return state.goods.every((good) => state.placements[good.id] === good.holdId);
}

/**
 * @param {ReturnType<typeof createCargoSortingGame>} state
 */
export function renderCargoSortingGame(state) {
  const secondsLeft = Math.ceil(state.remainingMs / 1000);

  return `<section class="mini-game mini-game-cargo-sorting" data-mini-game="cargo-sorting">
  <p class="mini-game-timer">${state.running ? `Time remaining: ${secondsLeft}s` : "Time's up!"}</p>
  <div class="cargo-goods">
    ${state.goods
      .map((good) => {
        const placedHoldId = state.placements[good.id];
        return `<article class="cargo-good" draggable="true" data-cargo-good="${escapeHtml(good.id)}"${
          placedHoldId ? ` data-placed-in="${escapeHtml(placedHoldId)}"` : ""
        }>${escapeHtml(good.label)}</article>`;
      })
      .join("")}
  </div>
  <div class="cargo-holds">
    ${state.holds
      .map(
        (hold) =>
          `<div class="cargo-hold" data-cargo-hold="${escapeHtml(hold.id)}"><h4>${escapeHtml(hold.label)}</h4></div>`,
      )
      .join("")}
  </div>
  <p class="cargo-score">Sorted: ${state.sortedCount} / ${state.goods.length}</p>
</section>`;
}
