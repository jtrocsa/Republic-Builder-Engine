import { describe, it, expect } from "vitest";
import {
  createStormNavigationGame,
  tickStormNavigationGame,
  moveShip,
  renderStormNavigationGame,
  HAZARD_KINDS,
} from "../../apps/web/src/mini-games/storm-navigation.js";

const SPRITES = {
  ship: "/ship.svg",
  hazardKinds: { rock: "/rock.svg", wreckage: "/wreckage.svg", whirlpool: "/whirlpool.svg" },
  coastline: "/coastline.svg",
  clouds: "/clouds.svg",
};

describe("createStormNavigationGame", () => {
  it("produces a fresh running state with default values (normal case)", () => {
    const state = createStormNavigationGame();
    expect(state.running).toBe(true);
    expect(state.playerLane).toBe(1);
    expect(state.hazards).toEqual([]);
    expect(state.hazardsDodged).toBe(0);
    expect(state.hazardsHit).toBe(0);
    expect(state.elapsedMs).toBe(0);
    expect(state.msSinceLastHazard).toBe(0);
    expect(state.hazardIntervalMs).toBe(1200);
    expect(state.hazardProgressPerMs).toBeCloseTo(0.00035, 8);
    expect(state.nextHazardId).toBe(1);
  });

  it("accepts a custom hazardIntervalMs override for the initial stored value (boundary case)", () => {
    const state = createStormNavigationGame({ hazardIntervalMs: 2000 });
    expect(state.hazardIntervalMs).toBe(2000);
  });
});

describe("tickStormNavigationGame", () => {
  it("does not spawn a hazard on a tick smaller than the current hazard interval (normal case)", () => {
    const state = createStormNavigationGame();
    const ticked = tickStormNavigationGame(state, 500, () => 0);
    expect(ticked.hazards).toHaveLength(0);
    expect(ticked.msSinceLastHazard).toBe(500);
  });

  it("spawns exactly one hazard once the tick reaches/exceeds the current hazard interval, in the lane/kind implied by the injected random (normal case)", () => {
    const stateLow = createStormNavigationGame();
    const tickedLow = tickStormNavigationGame(stateLow, 1200, () => 0);
    expect(tickedLow.hazards).toHaveLength(1);
    expect(tickedLow.hazards[0].lane).toBe(0);
    expect(tickedLow.hazards[0].kind).toBe(HAZARD_KINDS[0]);
    expect(tickedLow.hazards[0].progress).toBe(0);
    expect(tickedLow.msSinceLastHazard).toBe(0);

    const stateHigh = createStormNavigationGame();
    const tickedHigh = tickStormNavigationGame(stateHigh, 1200, () => 0.99);
    expect(tickedHigh.hazards).toHaveLength(1);
    expect(tickedHigh.hazards[0].lane).toBe(2);
    expect(tickedHigh.hazards[0].kind).toBe(HAZARD_KINDS[2]);
  });

  it("advances hazard progress without resolving it before progress reaches 1 (normal case)", () => {
    const spawned = tickStormNavigationGame(createStormNavigationGame(), 1200, () => 0);
    expect(spawned.hazards).toHaveLength(1);

    // Reset msSinceLastHazard so this small follow-up tick can't trigger another spawn.
    const midway = tickStormNavigationGame({ ...spawned, msSinceLastHazard: 0 }, 100, () => 0.99);
    const hazard = midway.hazards.find((h) => h.id === 1);
    expect(hazard).toBeDefined();
    expect(hazard.progress).toBeCloseTo(0.035, 5);
    expect(midway.running).toBe(true);
    expect(midway.hazardsDodged).toBe(0);
    expect(midway.hazardsHit).toBe(0);
  });

  it("counts a dodge and keeps running when a completed hazard's lane differs from the player's lane (normal case)", () => {
    const state = {
      ...createStormNavigationGame(),
      hazards: [{ id: 1, lane: 0, progress: 0.9995 }],
      msSinceLastHazard: 0,
    };
    const resolved = tickStormNavigationGame(state, 5, () => 0.99);
    expect(resolved.hazards).toHaveLength(0);
    expect(resolved.hazardsDodged).toBe(1);
    expect(resolved.hazardsHit).toBe(0);
    expect(resolved.running).toBe(true);
  });

  it("counts a hit and ends the run when a completed hazard's lane matches the player's lane (normal case)", () => {
    const state = {
      ...createStormNavigationGame(),
      hazards: [{ id: 1, lane: 1, progress: 0.9995 }],
      msSinceLastHazard: 0,
    };
    const resolved = tickStormNavigationGame(state, 5, () => 0.99);
    expect(resolved.hazards).toHaveLength(0);
    expect(resolved.hazardsHit).toBe(1);
    expect(resolved.hazardsDodged).toBe(0);
    expect(resolved.running).toBe(false);
  });

  it("only ends the run for the hazard in the player's lane when multiple hazards resolve in the same tick (boundary case)", () => {
    const state = {
      ...createStormNavigationGame(),
      hazards: [
        { id: 1, lane: 1, progress: 0.9995 },
        { id: 2, lane: 0, progress: 0.9995 },
      ],
      msSinceLastHazard: 0,
    };
    const resolved = tickStormNavigationGame(state, 5, () => 0.99);
    expect(resolved.hazards).toHaveLength(0);
    expect(resolved.hazardsHit).toBe(1);
    expect(resolved.hazardsDodged).toBe(1);
    expect(resolved.running).toBe(false);
  });

  it("is a no-op when running is already false (boundary case)", () => {
    const state = { ...createStormNavigationGame(), running: false };
    const ticked = tickStormNavigationGame(state, 500, () => 0);
    expect(ticked).toBe(state);
    expect(ticked.hazards).toEqual([]);
    expect(ticked.running).toBe(false);
  });

  it("increments elapsedMs by the elapsed ms each tick, counting up with no limit (normal case)", () => {
    const state = createStormNavigationGame();
    const ticked = tickStormNavigationGame(state, 700, () => 0.99);
    expect(ticked.elapsedMs).toBe(700);
    const tickedAgain = tickStormNavigationGame(ticked, 400, () => 0.99);
    expect(tickedAgain.elapsedMs).toBe(1100);
  });
});

describe("difficulty ramp (hazardIntervalForDodges, exercised indirectly through tick)", () => {
  it("uses the base 1200ms interval when hazardsDodged is 0 (normal case)", () => {
    const state = createStormNavigationGame();
    const tooSoon = tickStormNavigationGame(state, 1199, () => 0);
    expect(tooSoon.hazards).toHaveLength(0);
    expect(tooSoon.hazardIntervalMs).toBe(1200);

    const onTime = tickStormNavigationGame(state, 1200, () => 0);
    expect(onTime.hazards).toHaveLength(1);
    expect(onTime.hazardIntervalMs).toBe(1200);
  });

  it("drops the interval by 60ms for every 5 hazards dodged (normal case)", () => {
    const state = { ...createStormNavigationGame(), hazardsDodged: 5 };
    const tooSoon = tickStormNavigationGame(state, 1139, () => 0);
    expect(tooSoon.hazards).toHaveLength(0);
    expect(tooSoon.hazardIntervalMs).toBe(1140);

    const onTime = tickStormNavigationGame(state, 1140, () => 0);
    expect(onTime.hazards).toHaveLength(1);
    expect(onTime.hazardIntervalMs).toBe(1140);
  });

  it("floors the interval at 500ms no matter how high hazardsDodged climbs (boundary case)", () => {
    const state = { ...createStormNavigationGame(), hazardsDodged: 1000 };
    const tooSoon = tickStormNavigationGame(state, 499, () => 0);
    expect(tooSoon.hazards).toHaveLength(0);
    expect(tooSoon.hazardIntervalMs).toBe(500);

    const onTime = tickStormNavigationGame(state, 500, () => 0);
    expect(onTime.hazards).toHaveLength(1);
    expect(onTime.hazardIntervalMs).toBe(500);
  });

  it("ignores the hazardIntervalMs stored at creation for spawn cadence, since tick recomputes it from hazardsDodged (invalid/missing data case)", () => {
    const state = createStormNavigationGame({ hazardIntervalMs: 100 });
    expect(state.hazardIntervalMs).toBe(100);
    const ticked = tickStormNavigationGame(state, 100, () => 0);
    // Recomputed from hazardsDodged (0) => 1200ms, not the stale 100ms override, so no spawn yet.
    expect(ticked.hazards).toHaveLength(0);
    expect(ticked.hazardIntervalMs).toBe(1200);
  });
});

describe("speed ramp (hazardSpeedForDodges, exercised indirectly through tick)", () => {
  it("uses the base ~0.00035/ms hazard speed when hazardsDodged is 0 (normal case)", () => {
    const state = createStormNavigationGame();
    const ticked = tickStormNavigationGame(state, 100, () => 0);
    expect(ticked.hazardProgressPerMs).toBeCloseTo(0.00035, 8);
  });

  it("raises the hazard speed by 0.00002/ms for every 5 hazards dodged (normal case)", () => {
    const state = { ...createStormNavigationGame(), hazardsDodged: 5 };
    const ticked = tickStormNavigationGame(state, 100, () => 0);
    expect(ticked.hazardProgressPerMs).toBeCloseTo(0.00037, 8);
  });

  it("actually advances existing hazards faster once the speed ramp has kicked in (normal case)", () => {
    const state = {
      ...createStormNavigationGame(),
      hazardsDodged: 5,
      hazards: [{ id: 1, lane: 0, kind: "rock", progress: 0 }],
      msSinceLastHazard: 0,
    };
    const ticked = tickStormNavigationGame(state, 100, () => 0.99);
    // 0.00037/ms * 100ms = 0.037, faster than the 0.035 a fresh run would produce.
    expect(ticked.hazards.find((h) => h.id === 1).progress).toBeCloseTo(0.037, 5);
  });

  it("caps the hazard speed at 0.0007/ms no matter how high hazardsDodged climbs (boundary case)", () => {
    const state = { ...createStormNavigationGame(), hazardsDodged: 100000 };
    const ticked = tickStormNavigationGame(state, 100, () => 0);
    expect(ticked.hazardProgressPerMs).toBe(0.0007);
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
  it("renders a single storm-track containing parallax layers, a horizon, one hazard element per hazard with correct data/style/art attributes, and exactly one ship element positioned for the player's lane (normal case)", () => {
    const state = {
      ...createStormNavigationGame(),
      hazards: [{ id: 1, lane: 2, kind: "whirlpool", progress: 0.5 }],
    };
    const html = renderStormNavigationGame(state, 0, SPRITES);

    expect(html).toContain('<div class="storm-track">');
    expect(html).toContain('<img class="storm-clouds" src="/clouds.svg"');
    expect(html).toContain('<img class="storm-coastline" src="/coastline.svg"');
    expect(html).toContain('<div class="storm-horizon"></div>');

    const hazardMatches = html.match(/<div class="storm-hazard"[^>]*>/g);
    expect(hazardMatches).toHaveLength(1);
    expect(hazardMatches[0]).toContain('data-storm-hazard="1"');
    expect(hazardMatches[0]).toContain('data-storm-lane="2"');
    expect(hazardMatches[0]).toContain('data-storm-kind="whirlpool"');
    expect(hazardMatches[0]).toContain("--p:0.5");
    expect(hazardMatches[0]).toContain("--lane-offset:24%");
    expect(html).toContain('<img class="storm-hazard-art" src="/whirlpool.svg"');

    const shipMatches = html.match(/data-storm-ship/g);
    expect(shipMatches).toHaveLength(1);
    expect(html).toContain('<div class="storm-ship" data-storm-ship style="--lane-offset:0%">');
    expect(html).toContain('<span class="storm-ship-wake"></span>');
    expect(html).toContain('<img class="storm-ship-art" src="/ship.svg"');
  });

  it("falls back to HAZARD_KINDS[0] and an empty art src when a hazard has no kind, and to broken/empty srcs when sprites are omitted (invalid/missing data case)", () => {
    const state = { ...createStormNavigationGame(), hazards: [{ id: 1, lane: 0, progress: 0.2 }] };
    const html = renderStormNavigationGame(state);
    expect(html).toContain(`data-storm-kind="${HAZARD_KINDS[0]}"`);
    expect(html).toContain('<img class="storm-hazard-art" src=""');
    expect(html).toContain('<img class="storm-ship-art" src=""');
  });

  it("renders zero hazard elements when there are no active hazards, and positions the ship using the lane offset map for each edge lane (boundary case)", () => {
    const noHazardsState = { ...createStormNavigationGame(), hazards: [] };
    const html = renderStormNavigationGame(noHazardsState, 0, SPRITES);
    expect(html.match(/<div class="storm-hazard"/g)).toBeNull();

    const leftLaneHtml = renderStormNavigationGame(
      { ...createStormNavigationGame(), playerLane: 0 },
      0,
      SPRITES
    );
    expect(leftLaneHtml).toContain('data-storm-ship style="--lane-offset:-24%"');

    const rightLaneHtml = renderStormNavigationGame(
      { ...createStormNavigationGame(), playerLane: 2 },
      0,
      SPRITES
    );
    expect(rightLaneHtml).toContain('data-storm-ship style="--lane-offset:24%"');
  });

  it("renders one hazard element per hazard in state.hazards, each carrying its own lane/progress/kind-derived attributes (normal case)", () => {
    const state = {
      ...createStormNavigationGame(),
      hazards: [
        { id: 1, lane: 0, kind: "rock", progress: 0.1 },
        { id: 2, lane: 1, kind: "wreckage", progress: 0.75 },
      ],
    };
    const html = renderStormNavigationGame(state, 0, SPRITES);
    const hazardMatches = html.match(/<div class="storm-hazard"[^>]*>/g);
    expect(hazardMatches).toHaveLength(2);
    expect(hazardMatches[0]).toContain('data-storm-hazard="1"');
    expect(hazardMatches[0]).toContain('data-storm-lane="0"');
    expect(hazardMatches[0]).toContain('data-storm-kind="rock"');
    expect(hazardMatches[0]).toContain("--p:0.1");
    expect(hazardMatches[0]).toContain("--lane-offset:-24%");
    expect(hazardMatches[1]).toContain('data-storm-hazard="2"');
    expect(hazardMatches[1]).toContain('data-storm-lane="1"');
    expect(hazardMatches[1]).toContain('data-storm-kind="wreckage"');
    expect(hazardMatches[1]).toContain("--p:0.75");
    expect(hazardMatches[1]).toContain("--lane-offset:0%");
    expect(html).toContain('<img class="storm-hazard-art" src="/rock.svg"');
    expect(html).toContain('<img class="storm-hazard-art" src="/wreckage.svg"');
  });

  it("shows the elapsed time survived, the dodge tally, and Port/Starboard controls while running (normal case)", () => {
    const state = { ...createStormNavigationGame(), elapsedMs: 45500, hazardsDodged: 3 };
    const html = renderStormNavigationGame(state, 1);
    expect(html).toContain("Time survived: 45s");
    expect(html).not.toContain("Shipwrecked!");
    expect(html).toContain("Dodged: 3 · Best: 3");
    expect(html).not.toContain("Final score");
    expect(html).toContain('data-storm-move="-1"');
    expect(html).toContain('data-storm-move="1"');
    expect(html).not.toContain("data-storm-restart");
  });

  it("shows Shipwrecked!, the final score, and a restart button once stopped (boundary case)", () => {
    const state = {
      ...createStormNavigationGame(),
      running: false,
      elapsedMs: 12000,
      hazardsDodged: 4,
      hazardsHit: 1,
    };
    const html = renderStormNavigationGame(state, 10);
    expect(html).toContain("Shipwrecked!");
    expect(html).not.toContain("Time survived");
    expect(html).toContain("Dodged: 4 · Best: 10");
    expect(html).toContain("Final score: 4");
    expect(html).not.toContain("New best!");
    expect(html).toContain("data-storm-restart");
    expect(html).not.toContain('data-storm-move="-1"');
    expect(html).not.toContain('data-storm-move="1"');
  });

  it("appends the New best! suffix and uses hazardsDodged as the displayed best once the run beats the prior best (boundary case)", () => {
    const state = {
      ...createStormNavigationGame(),
      running: false,
      hazardsDodged: 9,
    };
    const html = renderStormNavigationGame(state, 5);
    expect(html).toContain("Dodged: 9 · Best: 9");
    expect(html).toContain("Final score: 9 — New best!");
  });

  it("does not append New best! when the run ties or falls short of the prior best (boundary case)", () => {
    const state = { ...createStormNavigationGame(), running: false, hazardsDodged: 5 };
    const html = renderStormNavigationGame(state, 5);
    expect(html).toContain("Dodged: 5 · Best: 5");
    expect(html).toContain("Final score: 5");
    expect(html).not.toContain("New best!");
  });

  it("defaults bestScore to 0 when omitted (boundary case)", () => {
    const state = { ...createStormNavigationGame(), running: false, hazardsDodged: 2 };
    const html = renderStormNavigationGame(state);
    expect(html).toContain("Dodged: 2 · Best: 2");
    expect(html).toContain("Final score: 2 — New best!");
  });
});
