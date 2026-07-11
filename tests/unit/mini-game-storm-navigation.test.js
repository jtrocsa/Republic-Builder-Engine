import { describe, it, expect } from "vitest";
import {
  createStormNavigationGame,
  tickStormNavigationGame,
  moveShip,
  renderStormNavigationGame,
} from "../../apps/web/src/mini-games/storm-navigation.js";

describe("createStormNavigationGame", () => {
  it("produces a fresh running state with default values (normal case)", () => {
    const state = createStormNavigationGame();
    expect(state.running).toBe(true);
    expect(state.playerLane).toBe(1);
    expect(state.hazards).toEqual([]);
    expect(state.hazardsDodged).toBe(0);
    expect(state.hazardsHit).toBe(0);
    expect(state.remainingMs).toBe(30000);
    expect(state.hazardIntervalMs).toBe(1200);
  });

  it("accepts custom durationMs/hazardIntervalMs overrides (boundary case)", () => {
    const state = createStormNavigationGame({ durationMs: 8000, hazardIntervalMs: 2000 });
    expect(state.remainingMs).toBe(8000);
    expect(state.durationMs).toBe(8000);
    expect(state.hazardIntervalMs).toBe(2000);
  });
});

describe("tickStormNavigationGame", () => {
  it("does not spawn a hazard on a tick smaller than hazardIntervalMs (normal case)", () => {
    const state = createStormNavigationGame({ hazardIntervalMs: 1200 });
    const ticked = tickStormNavigationGame(state, 500, () => 0);
    expect(ticked.hazards).toHaveLength(0);
    expect(ticked.msSinceLastHazard).toBe(500);
  });

  it("spawns exactly one hazard once the tick reaches/exceeds hazardIntervalMs, in the lane implied by the injected random (normal case)", () => {
    const stateLow = createStormNavigationGame({ hazardIntervalMs: 1000 });
    const tickedLow = tickStormNavigationGame(stateLow, 1000, () => 0);
    expect(tickedLow.hazards).toHaveLength(1);
    expect(tickedLow.hazards[0].lane).toBe(0);
    expect(tickedLow.hazards[0].progress).toBe(0);
    expect(tickedLow.msSinceLastHazard).toBe(0);

    const stateHigh = createStormNavigationGame({ hazardIntervalMs: 1000 });
    const tickedHigh = tickStormNavigationGame(stateHigh, 1000, () => 0.99);
    expect(tickedHigh.hazards).toHaveLength(1);
    expect(tickedHigh.hazards[0].lane).toBe(2);
  });

  it("advances hazard progress and removes it once complete, counting a dodge when the lane differs from the player (normal case)", () => {
    const state = createStormNavigationGame({ hazardIntervalMs: 1000 });
    // Spawn a hazard in lane 0, while the player stays in the default middle lane (1).
    const spawned = tickStormNavigationGame(state, 1000, () => 0);
    expect(spawned.hazards).toHaveLength(1);
    expect(spawned.hazards[0].lane).toBe(0);
    expect(spawned.playerLane).toBe(1);

    // Prevent a second spawn from interfering while the hazard's progress advances.
    const midway = tickStormNavigationGame(
      { ...spawned, hazardIntervalMs: 999999 },
      1000,
      () => 0,
    );
    expect(midway.hazards).toHaveLength(1);
    expect(midway.hazards[0].progress).toBeCloseTo(0.35, 5);
    expect(midway.hazardsDodged).toBe(0);
    expect(midway.hazardsHit).toBe(0);

    const resolved = tickStormNavigationGame(
      { ...midway, hazardIntervalMs: 999999 },
      2000,
      () => 0,
    );
    expect(resolved.hazards).toHaveLength(0);
    expect(resolved.hazardsDodged).toBe(1);
    expect(resolved.hazardsHit).toBe(0);
  });

  it("advances hazard progress and removes it once complete, counting a hit when the lane matches the player (normal case)", () => {
    const state = createStormNavigationGame({ hazardIntervalMs: 1000 });
    // Spawn a hazard in lane 1, matching the default middle player lane.
    const spawned = tickStormNavigationGame(state, 1000, () => 0.5);
    expect(spawned.hazards).toHaveLength(1);
    expect(spawned.hazards[0].lane).toBe(1);
    expect(spawned.playerLane).toBe(1);

    const resolved = tickStormNavigationGame(
      { ...spawned, hazardIntervalMs: 999999 },
      3000,
      () => 0,
    );
    expect(resolved.hazards).toHaveLength(0);
    expect(resolved.hazardsHit).toBe(1);
    expect(resolved.hazardsDodged).toBe(0);
  });

  it("is a no-op when running is already false (boundary case)", () => {
    const state = { ...createStormNavigationGame(), running: false };
    const ticked = tickStormNavigationGame(state, 500, () => 0);
    expect(ticked).toBe(state);
    expect(ticked.hazards).toEqual([]);
    expect(ticked.running).toBe(false);
  });
});

describe("moveShip", () => {
  it("changes playerLane by 1 when moving right or left (normal case)", () => {
    const state = createStormNavigationGame();
    const right = moveShip(state, 1);
    expect(right.playerLane).toBe(2);
    const left = moveShip(state, -1);
    expect(left.playerLane).toBe(0);
  });

  it("clamps rather than going out of bounds at either edge (boundary case)", () => {
    const atLeftEdge = { ...createStormNavigationGame(), playerLane: 0 };
    expect(moveShip(atLeftEdge, -1).playerLane).toBe(0);

    const atRightEdge = { ...createStormNavigationGame(), playerLane: 2 };
    expect(moveShip(atRightEdge, 1).playerLane).toBe(2);
  });

  it("is a no-op when running is already false (boundary case)", () => {
    const state = { ...createStormNavigationGame(), running: false };
    const moved = moveShip(state, 1);
    expect(moved).toBe(state);
    expect(moved.playerLane).toBe(1);
  });
});

describe("renderStormNavigationGame", () => {
  it("renders 3 lanes, marks the player's lane, and renders a hazard in its lane (normal case)", () => {
    const state = {
      ...createStormNavigationGame(),
      hazards: [{ id: 1, lane: 2, progress: 0.5 }],
    };
    const html = renderStormNavigationGame(state);

    const laneMatches = html.match(/data-storm-lane="\d"/g);
    expect(laneMatches).toHaveLength(3);

    const laneChunks = html.split(/<div class="storm-lane(?!s)/).slice(1);
    expect(laneChunks).toHaveLength(3);

    const playerLaneChunk = laneChunks[1];
    expect(playerLaneChunk).toContain("storm-lane--player");
    expect(playerLaneChunk).toContain('data-storm-lane="1"');
    expect(playerLaneChunk).toContain("data-storm-ship");

    const hazardLaneChunk = laneChunks[2];
    expect(hazardLaneChunk).toContain('data-storm-lane="2"');
    expect(hazardLaneChunk).toContain('data-storm-hazard="1"');
  });

  it("shows the countdown while running, Landfall! when stopped, and the dodge/hit tally (boundary case)", () => {
    const running = { ...createStormNavigationGame(), remainingMs: 9000, hazardsDodged: 3, hazardsHit: 2 };
    const runningHtml = renderStormNavigationGame(running);
    expect(runningHtml).toContain("Time remaining: 9s");
    expect(runningHtml).not.toContain("Landfall!");
    expect(runningHtml).toContain("Dodged: 3");
    expect(runningHtml).toContain("Hit: 2");

    const stopped = { ...running, running: false };
    const stoppedHtml = renderStormNavigationGame(stopped);
    expect(stoppedHtml).toContain("Landfall!");
  });
});
