import { describe, it, expect } from "vitest";
import {
  createStormNavigationGame,
  tickStormNavigationGame,
  steerShip,
  renderStormNavigationGame,
  HAZARD_KINDS,
} from "../../apps/web/src/mini-games/storm-navigation.js";

const SPRITES = {
  ship: "/ship.svg",
  hazardKinds: { rock: "/rock.svg", wreckage: "/wreckage.svg", whirlpool: "/whirlpool.svg" },
  coastline: "/coastline.svg",
  clouds: "/clouds.svg",
};

// PLAYER_TRACK_HALF_PERCENT from the module (not exported — mirrored here so render
// assertions compute their expected percent the same way the module does, rather than
// hardcoding a value that could silently drift out of sync with the source).
const TRACK_HALF_PERCENT = 40;

describe("createStormNavigationGame", () => {
  it("produces a fresh running state with default values (normal case)", () => {
    const state = createStormNavigationGame();
    expect(state.running).toBe(true);
    expect(state.playerX).toBe(0);
    expect(state.playerVelocityX).toBe(0);
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

  it("spawns exactly one hazard once the tick reaches/exceeds the current hazard interval, at the continuous position/kind implied by the injected random (normal case)", () => {
    const stateLow = createStormNavigationGame();
    const tickedLow = tickStormNavigationGame(stateLow, 1200, () => 0);
    expect(tickedLow.hazards).toHaveLength(1);
    expect(tickedLow.hazards[0].x).toBeCloseTo(-1, 8); // random()=0 -> 0*2-1 = -1 (left rail)
    expect(tickedLow.hazards[0].kind).toBe(HAZARD_KINDS[0]);
    expect(tickedLow.hazards[0].progress).toBe(0);
    expect(tickedLow.msSinceLastHazard).toBe(0);

    const stateHigh = createStormNavigationGame();
    const tickedHigh = tickStormNavigationGame(stateHigh, 1200, () => 0.99);
    expect(tickedHigh.hazards).toHaveLength(1);
    expect(tickedHigh.hazards[0].x).toBeCloseTo(0.98, 8); // random()=0.99 -> 0.99*2-1 = 0.98
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

  it("counts a dodge and keeps running when a completed hazard's position is outside the player's hit radius (normal case)", () => {
    const state = {
      ...createStormNavigationGame(),
      playerX: 0,
      hazards: [{ id: 1, x: 0.9, progress: 0.9995 }],
      msSinceLastHazard: 0,
    };
    const resolved = tickStormNavigationGame(state, 5, () => 0.99);
    expect(resolved.hazards).toHaveLength(0);
    expect(resolved.hazardsDodged).toBe(1);
    expect(resolved.hazardsHit).toBe(0);
    expect(resolved.running).toBe(true);
  });

  it("counts a hit and ends the run when a completed hazard's position is within the player's hit radius (normal case)", () => {
    const state = {
      ...createStormNavigationGame(),
      playerX: 0,
      hazards: [{ id: 1, x: 0.02, progress: 0.9995 }],
      msSinceLastHazard: 0,
    };
    const resolved = tickStormNavigationGame(state, 5, () => 0.99);
    expect(resolved.hazards).toHaveLength(0);
    expect(resolved.hazardsHit).toBe(1);
    expect(resolved.hazardsDodged).toBe(0);
    expect(resolved.running).toBe(false);
  });

  it("only ends the run for the hazard within the player's hit radius when multiple hazards resolve in the same tick (boundary case)", () => {
    const state = {
      ...createStormNavigationGame(),
      playerX: 0,
      hazards: [
        { id: 1, x: 0.02, progress: 0.9995 },
        { id: 2, x: 0.9, progress: 0.9995 },
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
      hazards: [{ id: 1, x: 0.5, kind: "rock", progress: 0 }],
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

describe("steerShip", () => {
  it("accelerates playerVelocityX toward the max steer speed while a direction is held, capping once reached (normal + boundary case)", () => {
    let state = createStormNavigationGame();
    state = steerShip(state, 1, 100);
    expect(state.playerVelocityX).toBeCloseTo(0.55, 5); // 0 + 5.5 * 0.1
    expect(state.playerX).toBeCloseTo(0.055, 5); // 0 + 0.55 * 0.1
    state = steerShip(state, 1, 100);
    expect(state.playerVelocityX).toBeCloseTo(1.1, 5);
    state = steerShip(state, 1, 100);
    expect(state.playerVelocityX).toBeCloseTo(1.65, 5);
    state = steerShip(state, 1, 100);
    expect(state.playerVelocityX).toBeCloseTo(2.2, 5); // reaches the max steer speed
    state = steerShip(state, 1, 100); // one more tick must not exceed the cap
    expect(state.playerVelocityX).toBe(2.2);
  });

  it("decays playerVelocityX toward zero via friction when no direction is held (normal case)", () => {
    let state = { ...createStormNavigationGame(), playerVelocityX: 2.0 };
    state = steerShip(state, 0, 100);
    expect(state.playerVelocityX).toBeCloseTo(0.8, 5); // 2.0 * (1 - 6.0 * 0.1)
    state = steerShip(state, 0, 100);
    expect(state.playerVelocityX).toBeCloseTo(0.32, 5);
  });

  it("snaps playerVelocityX to exactly 0 once friction decays it below a tiny threshold (boundary case)", () => {
    const state = { ...createStormNavigationGame(), playerVelocityX: 0.0005 };
    const decayed = steerShip(state, 0, 100);
    expect(decayed.playerVelocityX).toBe(0);
  });

  it("integrates playerX using the post-friction/acceleration velocity for that same tick (normal case)", () => {
    const state = { ...createStormNavigationGame(), playerVelocityX: 1.0 };
    const moved = steerShip(state, 1, 100);
    expect(moved.playerVelocityX).toBeCloseTo(1.55, 5); // 1.0 + 5.5 * 0.1
    expect(moved.playerX).toBeCloseTo(0.155, 5); // 0 + 1.55 * 0.1
  });

  it("clamps playerX at the +1 rail and zeroes velocity on contact (boundary case)", () => {
    const state = { ...createStormNavigationGame(), playerX: 0.99, playerVelocityX: 2.2 };
    const moved = steerShip(state, 1, 100);
    expect(moved.playerX).toBe(1);
    expect(moved.playerVelocityX).toBe(0);
  });

  it("clamps playerX at the -1 rail and zeroes velocity on contact (boundary case)", () => {
    const state = { ...createStormNavigationGame(), playerX: -0.99, playerVelocityX: -2.2 };
    const moved = steerShip(state, -1, 100);
    expect(moved.playerX).toBe(-1);
    expect(moved.playerVelocityX).toBe(0);
  });

  it("is a no-op when running is already false (boundary case)", () => {
    const state = { ...createStormNavigationGame(), running: false, playerX: 0.4, playerVelocityX: 1 };
    const moved = steerShip(state, 1, 100);
    expect(moved).toBe(state);
  });
});

describe("renderStormNavigationGame", () => {
  it("renders a single storm-track containing parallax layers, a horizon, one hazard element per hazard with correct data/style/art attributes, and exactly one ship element positioned for the player's x (normal case)", () => {
    const state = {
      ...createStormNavigationGame(),
      hazards: [{ id: 1, x: 0.6, kind: "whirlpool", progress: 0.5 }],
    };
    const html = renderStormNavigationGame(state, 0, SPRITES);

    expect(html).toContain('<div class="storm-track">');
    expect(html).toContain('<img class="storm-clouds" src="/clouds.svg"');
    expect(html).toContain('<img class="storm-coastline" src="/coastline.svg"');
    expect(html).toContain('<div class="storm-horizon"></div>');

    const hazardMatches = html.match(/<div class="storm-hazard"[^>]*>/g);
    expect(hazardMatches).toHaveLength(1);
    expect(hazardMatches[0]).toContain('data-storm-hazard="1"');
    expect(hazardMatches[0]).toContain('data-storm-x="0.60"');
    expect(hazardMatches[0]).toContain('data-storm-kind="whirlpool"');
    expect(hazardMatches[0]).toContain("--p:0.5");
    expect(hazardMatches[0]).toContain(`--lane-offset:${0.6 * TRACK_HALF_PERCENT}%`);
    expect(html).toContain('<img class="storm-hazard-art" src="/whirlpool.svg"');

    const shipMatches = html.match(/data-storm-ship/g);
    expect(shipMatches).toHaveLength(1);
    expect(html).toContain('<div class="storm-ship" data-storm-ship style="--lane-offset:0%">');
    expect(html).toContain('<span class="storm-ship-wake"></span>');
    expect(html).toContain('<img class="storm-ship-art" src="/ship.svg"');
  });

  it("falls back to HAZARD_KINDS[0] and an empty art src when a hazard has no kind, and to broken/empty srcs when sprites are omitted (invalid/missing data case)", () => {
    const state = { ...createStormNavigationGame(), hazards: [{ id: 1, x: 0, progress: 0.2 }] };
    const html = renderStormNavigationGame(state);
    expect(html).toContain(`data-storm-kind="${HAZARD_KINDS[0]}"`);
    expect(html).toContain('<img class="storm-hazard-art" src=""');
    expect(html).toContain('<img class="storm-ship-art" src=""');
  });

  it("renders zero hazard elements when there are no active hazards, and positions the ship using the full track-width offset at either rail (boundary case)", () => {
    const noHazardsState = { ...createStormNavigationGame(), hazards: [] };
    const html = renderStormNavigationGame(noHazardsState, 0, SPRITES);
    expect(html.match(/<div class="storm-hazard"/g)).toBeNull();

    const leftRailHtml = renderStormNavigationGame(
      { ...createStormNavigationGame(), playerX: -1 },
      0,
      SPRITES
    );
    expect(leftRailHtml).toContain(`data-storm-ship style="--lane-offset:${-1 * TRACK_HALF_PERCENT}%"`);

    const rightRailHtml = renderStormNavigationGame(
      { ...createStormNavigationGame(), playerX: 1 },
      0,
      SPRITES
    );
    expect(rightRailHtml).toContain(`data-storm-ship style="--lane-offset:${1 * TRACK_HALF_PERCENT}%"`);
  });

  it("renders one hazard element per hazard in state.hazards, each carrying its own position/progress/kind-derived attributes (normal case)", () => {
    const state = {
      ...createStormNavigationGame(),
      hazards: [
        { id: 1, x: -0.6, kind: "rock", progress: 0.1 },
        { id: 2, x: 0, kind: "wreckage", progress: 0.75 },
      ],
    };
    const html = renderStormNavigationGame(state, 0, SPRITES);
    const hazardMatches = html.match(/<div class="storm-hazard"[^>]*>/g);
    expect(hazardMatches).toHaveLength(2);
    expect(hazardMatches[0]).toContain('data-storm-hazard="1"');
    expect(hazardMatches[0]).toContain('data-storm-x="-0.60"');
    expect(hazardMatches[0]).toContain('data-storm-kind="rock"');
    expect(hazardMatches[0]).toContain("--p:0.1");
    expect(hazardMatches[0]).toContain(`--lane-offset:${-0.6 * TRACK_HALF_PERCENT}%`);
    expect(hazardMatches[1]).toContain('data-storm-hazard="2"');
    expect(hazardMatches[1]).toContain('data-storm-x="0.00"');
    expect(hazardMatches[1]).toContain('data-storm-kind="wreckage"');
    expect(hazardMatches[1]).toContain("--p:0.75");
    expect(hazardMatches[1]).toContain("--lane-offset:0%");
    expect(html).toContain('<img class="storm-hazard-art" src="/rock.svg"');
    expect(html).toContain('<img class="storm-hazard-art" src="/wreckage.svg"');
  });

  it("computes the ship's banking tilt from playerVelocityX, clamped to the max bank angle (normal + boundary case)", () => {
    const atMaxSpeed = renderStormNavigationGame(
      { ...createStormNavigationGame(), playerVelocityX: 2.2 },
      0,
      SPRITES
    );
    expect(atMaxSpeed).toContain('style="--bank:18.0deg"');

    const atHalfSpeed = renderStormNavigationGame(
      { ...createStormNavigationGame(), playerVelocityX: 1.1 },
      0,
      SPRITES
    );
    expect(atHalfSpeed).toContain('style="--bank:9.0deg"');

    const steeringLeft = renderStormNavigationGame(
      { ...createStormNavigationGame(), playerVelocityX: -2.2 },
      0,
      SPRITES
    );
    expect(steeringLeft).toContain('style="--bank:-18.0deg"');

    const stationary = renderStormNavigationGame(createStormNavigationGame(), 0, SPRITES);
    expect(stationary).toContain('style="--bank:0.0deg"');
  });

  it("clamps the banking tilt at the max bank angle even if playerVelocityX somehow exceeds the max steer speed (invalid/missing data case)", () => {
    const html = renderStormNavigationGame(
      { ...createStormNavigationGame(), playerVelocityX: 999 },
      0,
      SPRITES
    );
    expect(html).toContain('style="--bank:18.0deg"');
  });

  it("shifts the background parallax layers opposite the ship's playerX, with clouds offset less than the coastline (normal case)", () => {
    const html = renderStormNavigationGame(
      { ...createStormNavigationGame(), playerX: 0.5 },
      0,
      SPRITES
    );
    expect(html).toContain('style="--parallax-px:-4.4px"'); // clouds: -(0.5*22) * 0.4
    expect(html).toContain('style="--parallax-px:-11.0px"'); // coastline: -(0.5*22)

    const mirrored = renderStormNavigationGame(
      { ...createStormNavigationGame(), playerX: -0.5 },
      0,
      SPRITES
    );
    expect(mirrored).toContain('style="--parallax-px:4.4px"');
    expect(mirrored).toContain('style="--parallax-px:11.0px"');
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
