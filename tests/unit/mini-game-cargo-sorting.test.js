import { describe, it, expect } from "vitest";
import {
  DEFAULT_CARGO_GOODS,
  DEFAULT_CARGO_HOLDS,
  createCargoSortingGame,
  tickCargoSortingGame,
  placeCargo,
  isCargoSortingComplete,
  renderCargoSortingGame,
} from "../../apps/web/src/mini-games/cargo-sorting.js";

describe("createCargoSortingGame", () => {
  it("produces a fresh running state with default goods/holds (normal case)", () => {
    const state = createCargoSortingGame();
    expect(state.running).toBe(true);
    expect(state.placements).toEqual({});
    expect(state.sortedCount).toBe(0);
    expect(state.remainingMs).toBe(45000);
    expect(state.goods).toBe(DEFAULT_CARGO_GOODS);
    expect(state.holds).toBe(DEFAULT_CARGO_HOLDS);
  });

  it("accepts custom durationMs/goods/holds overrides (boundary case)", () => {
    const customGoods = [{ id: "silver", label: "Silver bars", holdId: "vault" }];
    const customHolds = [{ id: "vault", label: "Vault Hold" }];
    const state = createCargoSortingGame({
      durationMs: 5000,
      goods: customGoods,
      holds: customHolds,
    });
    expect(state.remainingMs).toBe(5000);
    expect(state.goods).toBe(customGoods);
    expect(state.holds).toBe(customHolds);
  });
});

describe("tickCargoSortingGame", () => {
  it("decrements remainingMs by the elapsed ms (normal case)", () => {
    const state = createCargoSortingGame({ durationMs: 10000 });
    const ticked = tickCargoSortingGame(state, 1500);
    expect(ticked.remainingMs).toBe(8500);
    expect(ticked.running).toBe(true);
  });

  it("floors remainingMs at 0 and stops running once elapsed meets/exceeds remaining (boundary case)", () => {
    const state = createCargoSortingGame({ durationMs: 1000 });
    const exact = tickCargoSortingGame(state, 1000);
    expect(exact.remainingMs).toBe(0);
    expect(exact.running).toBe(false);

    const over = tickCargoSortingGame(state, 5000);
    expect(over.remainingMs).toBe(0);
    expect(over.running).toBe(false);
  });

  it("is a no-op when running is already false (boundary case)", () => {
    const state = { ...createCargoSortingGame({ durationMs: 1000 }), running: false };
    const ticked = tickCargoSortingGame(state, 500);
    expect(ticked).toBe(state);
    expect(ticked.remainingMs).toBe(1000);
    expect(ticked.running).toBe(false);
  });
});

describe("placeCargo", () => {
  it("increments sortedCount when a good is placed in its correct hold (normal case)", () => {
    const state = createCargoSortingGame();
    const placed = placeCargo(state, "maize", "foodstuffs");
    expect(placed.placements.maize).toBe("foodstuffs");
    expect(placed.sortedCount).toBe(1);
  });

  it("does not count a wrong placement, but counts it once corrected (normal case)", () => {
    const state = createCargoSortingGame();
    const wrong = placeCargo(state, "maize", "materials-specimens");
    expect(wrong.placements.maize).toBe("materials-specimens");
    expect(wrong.sortedCount).toBe(0);

    const corrected = placeCargo(wrong, "maize", "foodstuffs");
    expect(corrected.placements.maize).toBe("foodstuffs");
    expect(corrected.sortedCount).toBe(1);
  });

  it("is a no-op once running is false (boundary case)", () => {
    const state = { ...createCargoSortingGame(), running: false };
    const placed = placeCargo(state, "maize", "foodstuffs");
    expect(placed).toBe(state);
    expect(placed.placements).toEqual({});
    expect(placed.sortedCount).toBe(0);
  });
});

describe("isCargoSortingComplete", () => {
  it("is false until every good is placed in its correct hold (normal case)", () => {
    let state = createCargoSortingGame();
    for (const good of DEFAULT_CARGO_GOODS.slice(0, -1)) {
      state = placeCargo(state, good.id, good.holdId);
    }
    expect(isCargoSortingComplete(state)).toBe(false);
  });

  it("is true once all goods are placed in their correct holds (boundary case)", () => {
    let state = createCargoSortingGame();
    for (const good of DEFAULT_CARGO_GOODS) {
      state = placeCargo(state, good.id, good.holdId);
    }
    expect(isCargoSortingComplete(state)).toBe(true);
    expect(state.sortedCount).toBe(DEFAULT_CARGO_GOODS.length);
  });
});

describe("renderCargoSortingGame", () => {
  it("renders every good's label and every hold's label (normal case)", () => {
    const state = createCargoSortingGame();
    const html = renderCargoSortingGame(state);
    for (const good of DEFAULT_CARGO_GOODS) {
      expect(html).toContain(good.label);
    }
    expect(html).toContain("Foodstuffs Hold");
    expect(html).toContain("Raw Materials &amp; Specimens Hold");
  });

  it("shows the countdown while running and a time's-up message once stopped (boundary case)", () => {
    const running = createCargoSortingGame({ durationMs: 12000 });
    const runningHtml = renderCargoSortingGame(running);
    expect(runningHtml).toContain("Time remaining: 12s");
    expect(runningHtml).not.toContain("Time's up!");

    const stopped = { ...running, running: false };
    const stoppedHtml = renderCargoSortingGame(stopped);
    expect(stoppedHtml).toContain("Time's up!");
  });

  it("escapes HTML in a good/hold label containing a script tag (invalid/injection case)", () => {
    const maliciousGoods = [
      { id: "evil-good", label: '<script>alert("good")</script>', holdId: "evil-hold" },
    ];
    const maliciousHolds = [{ id: "evil-hold", label: "<script>alert(1)</script>" }];
    const state = createCargoSortingGame({ goods: maliciousGoods, holds: maliciousHolds });
    const html = renderCargoSortingGame(state);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
