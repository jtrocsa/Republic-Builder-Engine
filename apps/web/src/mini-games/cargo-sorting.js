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
  { id: "foodstuffs", label: "Food and Crops" },
  { id: "materials-specimens", label: "Materials and Items" },
];

export const DEFAULT_CARGO_GOODS = [
  { id: "maize", label: "🌽 Maize", holdId: "foodstuffs" },
  { id: "cassava", label: "🍠 Cassava", holdId: "foodstuffs" },
  { id: "pineapple", label: "🍍 Pineapple", holdId: "foodstuffs" },
  { id: "peanuts", label: "🥜 Peanuts", holdId: "foodstuffs" },
  { id: "chili-peppers", label: "🌶️ Chili peppers", holdId: "foodstuffs" },
  { id: "cacao-beans", label: "🍫 Cacao beans", holdId: "foodstuffs" },
  { id: "squash", label: "🎃 Squash", holdId: "foodstuffs" },
  { id: "common-beans", label: "🫘 Common beans", holdId: "foodstuffs" },
  { id: "papaya", label: "🥭 Papaya", holdId: "foodstuffs" },
  { id: "guava", label: "🍈 Guava", holdId: "foodstuffs" },
  { id: "cotton", label: "🧺 Raw cotton", holdId: "materials-specimens" },
  { id: "gold-ore", label: "⛏ Gold ore samples", holdId: "materials-specimens" },
  { id: "tobacco-leaf", label: "🌿 Tobacco leaf", holdId: "materials-specimens" },
  { id: "cochineal-dye", label: "🔴 Cochineal dye", holdId: "materials-specimens" },
  { id: "henequen-fiber", label: "🧵 Henequen fiber", holdId: "materials-specimens" },
  { id: "mahogany-timber", label: "🪵 Mahogany timber", holdId: "materials-specimens" },
  { id: "tortoiseshell", label: "🐢 Tortoiseshell", holdId: "materials-specimens" },
  { id: "pearls", label: "🦪 Pearls", holdId: "materials-specimens" },
  { id: "copper-ore", label: "🔶 Copper ore", holdId: "materials-specimens" },
  { id: "woven-hammock", label: "🪢 Woven hammock", holdId: "materials-specimens" },
];

/**
 * @param {{ goods?: object[], holds?: object[], durationMs?: number }} [options]
 */
export function createCargoSortingGame({
  goods = DEFAULT_CARGO_GOODS,
  holds = DEFAULT_CARGO_HOLDS,
  durationMs = 90000,
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

function cargoGoodChip(good, { className, placedInHoldId } = {}) {
  const classes = ["cargo-good", className].filter(Boolean).join(" ");
  return `<article class="${classes}" draggable="true" data-cargo-good="${escapeHtml(good.id)}"${
    placedInHoldId ? ` data-placed-in="${escapeHtml(placedInHoldId)}"` : ""
  }>${escapeHtml(good.label)}</article>`;
}

/**
 * @param {ReturnType<typeof createCargoSortingGame>} state
 */
export function renderCargoSortingGame(state) {
  const secondsLeft = Math.ceil(state.remainingMs / 1000);
  const unplacedGoods = state.goods.filter((good) => !(good.id in state.placements));

  return `<section class="mini-game mini-game-cargo-sorting" data-mini-game="cargo-sorting">
  <p class="mini-game-timer">${state.running ? `Time remaining: ${secondsLeft}s` : "Time's up!"}</p>
  <div class="cargo-goods">
    ${unplacedGoods.map((good) => cargoGoodChip(good)).join("")}
  </div>
  <div class="cargo-holds">
    ${state.holds
      .map((hold) => {
        const goodsInHold = state.goods.filter((good) => state.placements[good.id] === hold.id);
        const items = goodsInHold
          .map((good) =>
            cargoGoodChip(good, {
              className: `cargo-hold-item ${good.holdId === hold.id ? "is-correct" : "is-incorrect"}`,
              placedInHoldId: hold.id,
            }),
          )
          .join("");
        return `<div class="cargo-hold" data-cargo-hold="${escapeHtml(hold.id)}"><h4>${escapeHtml(hold.label)}</h4><div class="cargo-hold-items">${items}</div></div>`;
      })
      .join("")}
  </div>
  <p class="cargo-score">Sorted: ${state.sortedCount} / ${state.goods.length}</p>
</section>`;
}
