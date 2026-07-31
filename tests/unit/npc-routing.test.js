// The router that gives an NPC a way to get where they are going.
//
// Two halves. The first builds small synthetic grids and asserts the search's properties directly —
// that it finds a path, that it refuses an impossible one, and above all that it prefers road, which
// is the whole reason Phase 62 exports road cells out of the map generators at all. The second runs
// the real settlement's real routes and checks that the people the playtest note named actually get
// where they were sent, over the ground they were meant to use.

import { describe, expect, it } from "vitest";

import {
  ROUTE_COST,
  buildCircuit,
  createNavGrid,
  findRoute,
  isOpenCell,
  isRoadCell,
  snapToOpen,
} from "../../apps/web/src/engine/npc-routing.js";
import { FIELD_MAPS, fieldNavGridFor } from "../../apps/web/src/main.js";

/**
 * A grid from an ASCII map. `#` is blocked, `=` is road, anything else is open ground — which makes
 * the road-preference cases below readable as pictures rather than as coordinate lists.
 */
function gridFrom(rows) {
  const blocked = new Set();
  const roads = [];
  rows.forEach((line, row) => {
    [...line].forEach((char, col) => {
      if (char === "#") blocked.add(`${col},${row}`);
      if (char === "=") roads.push([col, row]);
    });
  });
  return createNavGrid({
    columns: rows[0].length,
    rows: rows.length,
    roads,
    isStandable: (x, y) => !blocked.has(`${Math.floor(x)},${Math.floor(y)}`),
  });
}

/** Total ground covered by a waypoint list, in tiles. */
function routeLength(from, waypoints) {
  let total = 0;
  let previous = from;
  for (const point of waypoints) {
    total += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  return total;
}

/** Every cell a waypoint list passes through, sampled finely enough not to skip one. */
function cellsAlong(from, waypoints) {
  const cells = new Set();
  let previous = from;
  for (const point of waypoints) {
    const steps = Math.ceil(Math.hypot(point.x - previous.x, point.y - previous.y) * 8);
    for (let step = 0; step <= steps; step += 1) {
      const t = steps === 0 ? 0 : step / steps;
      cells.add(
        `${Math.floor(previous.x + (point.x - previous.x) * t)},` +
          `${Math.floor(previous.y + (point.y - previous.y) * t)}`
      );
    }
    previous = point;
  }
  return [...cells].map((key) => key.split(",").map(Number));
}

describe("createNavGrid", () => {
  const grid = gridFrom([".....", ".###.", "..=..", ".###.", "....."]);

  it("marks a cell open when the caller's predicate stands there (normal case)", () => {
    expect(isOpenCell(grid, 0, 0)).toBe(true);
    expect(isOpenCell(grid, 1, 1)).toBe(false);
  });

  it("records road membership separately from walkability (normal case)", () => {
    expect(isRoadCell(grid, 2, 2)).toBe(true);
    expect(isRoadCell(grid, 0, 0)).toBe(false);
    // A road cell is still a normal open cell — the two are independent facts about it.
    expect(isOpenCell(grid, 2, 2)).toBe(true);
  });

  it("treats everything outside the grid as blocked (edge case)", () => {
    expect(isOpenCell(grid, -1, 2)).toBe(false);
    expect(isOpenCell(grid, 5, 2)).toBe(false);
    expect(isOpenCell(grid, 2, 99)).toBe(false);
  });
});

describe("snapToOpen", () => {
  const grid = gridFrom(["....", ".##.", ".##.", "...."]);

  it("returns the cell itself when it is already open (normal case)", () => {
    expect(snapToOpen(grid, 0.5, 0.5)).toEqual({ col: 0, row: 0 });
  });

  // A post is authored as a place a person stands, not as a cell index, so it can land a few tenths
  // inside a stamp and still describe where somebody is. Snapping is what stops that being a route
  // that silently does not exist.
  it("finds the nearest open cell when the point is inside something (edge case)", () => {
    const snapped = snapToOpen(grid, 1.5, 1.5);
    expect(isOpenCell(grid, snapped.col, snapped.row)).toBe(true);
    expect(Math.hypot(snapped.col - 1, snapped.row - 1)).toBeLessThanOrEqual(2);
  });

  it("gives up rather than searching the whole map (edge case)", () => {
    const sealed = gridFrom(["###", "###", "###"]);
    expect(snapToOpen(sealed, 1.5, 1.5)).toBeNull();
  });
});

describe("findRoute", () => {
  it("walks a straight corridor as one leg, not one waypoint per tile (normal case)", () => {
    const grid = gridFrom(["##########", "..........", "##########"]);
    const route = findRoute(grid, { x: 0.5, y: 1.5 }, { x: 9.5, y: 1.5 });
    // The simplification pass is what makes this one leg. Without it an NPC walks a 4-connected
    // staircase and visibly steps tile by tile.
    expect(route).toHaveLength(1);
    expect(route[0]).toEqual({ x: 9.5, y: 1.5 });
  });

  it("goes round an obstacle (normal case)", () => {
    const grid = gridFrom(["......", "..##..", "..##..", "......"]);
    const route = findRoute(grid, { x: 0.5, y: 1.5 }, { x: 5.5, y: 1.5 });
    expect(route).not.toBeNull();
    const cells = cellsAlong({ x: 0.5, y: 1.5 }, route);
    expect(cells.every(([col, row]) => isOpenCell(grid, col, row))).toBe(true);
  });

  it("returns null when there is no way through (edge case)", () => {
    const grid = gridFrom(["...#...", "...#...", "...#..."]);
    expect(findRoute(grid, { x: 0.5, y: 1.5 }, { x: 6.5, y: 1.5 })).toBeNull();
  });

  it("returns an empty route when start and goal are the same cell (edge case)", () => {
    const grid = gridFrom(["...", "...", "..."]);
    expect(findRoute(grid, { x: 1.2, y: 1.2 }, { x: 1.8, y: 1.8 })).toEqual([]);
  });

  // The defect this exists for: crops carry no collision on purpose, so nothing in walkability says
  // a field is a bad place to walk, and a plain shortest-path search sent the goodwife diagonally
  // across the beds. The road detour here is genuinely longer and must still win.
  it("takes a longer road over a shorter walk across open ground (normal case)", () => {
    const grid = gridFrom(["=========", "=.......=", "=.......=", "=.......=", "========="]);
    const from = { x: 0.5, y: 0.5 };
    const to = { x: 8.5, y: 4.5 };
    const route = findRoute(grid, from, to);
    const cells = cellsAlong(from, route);
    const onRoad = cells.filter(([col, row]) => isRoadCell(grid, col, row)).length;
    expect(onRoad / cells.length).toBeGreaterThan(0.9);
    // And it really is the longer way: the diagonal across the middle is shorter in distance.
    expect(routeLength(from, route)).toBeGreaterThan(Math.hypot(8, 4));
  });

  it("still routes over open ground when the map has no roads at all (edge case)", () => {
    // Interiors declare no road network. Every cell costs the same and the search is a plain
    // shortest path, which is what the Institute's floors need.
    const grid = gridFrom(["....", "....", "...."]);
    const route = findRoute(grid, { x: 0.5, y: 0.5 }, { x: 3.5, y: 2.5 });
    expect(route).not.toBeNull();
    expect(route[route.length - 1]).toEqual({ x: 3.5, y: 2.5 });
  });

  it("costs road cells less than open ground, and by enough to matter (normal case)", () => {
    expect(ROUTE_COST.road).toBeLessThan(ROUTE_COST.ground);
    expect(ROUTE_COST.ground / ROUTE_COST.road).toBeGreaterThanOrEqual(2);
  });
});

describe("buildCircuit", () => {
  const grid = gridFrom(["==========", "==========", "=========="]);

  it("goes out along the stops and back down them (normal case)", () => {
    const circuit = buildCircuit(grid, [
      { x: 0.5, y: 1.5 },
      { x: 9.5, y: 1.5 },
    ]);
    const stops = circuit.filter((point) => point.stop);
    expect(stops).toHaveLength(2);
    expect(stops[0]).toMatchObject({ x: 9.5, y: 1.5 });
    expect(stops[1]).toMatchObject({ x: 0.5, y: 1.5 });
  });

  it("visits a middle stop twice on a three-stop round trip (normal case)", () => {
    const circuit = buildCircuit(grid, [
      { x: 0.5, y: 1.5 },
      { x: 4.5, y: 1.5 },
      { x: 9.5, y: 1.5 },
    ]);
    const stops = circuit.filter((point) => point.stop).map((point) => point.x);
    expect(stops).toEqual([4.5, 9.5, 4.5, 0.5]);
  });

  // Pausing at a corner is what a route would otherwise share with a wander, and it is exactly the
  // stop-start cadence the playtest note was about.
  it("marks only the stops, never the corners on the way (edge case)", () => {
    const corner = gridFrom(["....#####", "....#####", "........."]);
    const circuit = buildCircuit(corner, [
      { x: 0.5, y: 0.5 },
      { x: 8.5, y: 2.5 },
    ]);
    expect(circuit.length).toBeGreaterThan(circuit.filter((point) => point.stop).length);
  });

  // A stop can say what the person does on arriving, not just where they arrive. Without this the
  // archivist walks east along her shelves and then stands there facing east, staring down the
  // aisle rather than at the stacks she came to read.
  it("carries a stop's authored facing and pause onto its arrival waypoint (normal case)", () => {
    const circuit = buildCircuit(grid, [
      { x: 0.5, y: 1.5, facing: "up", pauseMs: [2600, 4600] },
      { x: 9.5, y: 1.5, facing: "down" },
    ]);
    const stops = circuit.filter((point) => point.stop);
    expect(stops[0]).toMatchObject({ x: 9.5, facing: "down" });
    expect(stops[0].pauseMs).toBeUndefined();
    expect(stops[1]).toMatchObject({ x: 0.5, facing: "up", pauseMs: [2600, 4600] });
  });

  // The destination's intent, not the origin's — an arrival describes where the person got to.
  it("leaves the corners on the way with no facing of their own (edge case)", () => {
    const corner = gridFrom(["....#####", "....#####", "........."]);
    const circuit = buildCircuit(corner, [
      { x: 0.5, y: 0.5, facing: "up" },
      { x: 8.5, y: 2.5, facing: "down" },
    ]);
    const corners = circuit.filter((point) => !point.stop);
    expect(corners.length).toBeGreaterThan(0);
    expect(corners.every((point) => point.facing === undefined)).toBe(true);
  });

  it("drops a leg it cannot path rather than failing the whole circuit (edge case)", () => {
    const split = gridFrom(["..#..", "..#..", "..#.."]);
    const circuit = buildCircuit(split, [
      { x: 0.5, y: 1.5 },
      { x: 4.5, y: 1.5 },
    ]);
    // A carpenter authored into a sealed yard becomes someone who stands still, not a crash — and
    // tests/unit/field-map-coordinates.test.js is what fails if a shipped route is in that state.
    expect(circuit).toEqual([]);
  });
});

// --- against the real maps -----------------------------------------------------------------------
// The synthetic cases above prove the search works. These prove it was pointed at the right thing:
// the specific people the playtest note named, walking the specific ground it asked for.
describe("the settlement's authored routes", () => {
  const riverbend = FIELD_MAPS["unit-02"];
  const grid = fieldNavGridFor(riverbend);

  it("walks the goodwife to the high street along the village spine (normal case)", () => {
    const behaviour = riverbend.behaviours["settlement-goodwife"];
    const route = findRoute(grid, behaviour.stops[0], behaviour.stops[1]);
    expect(route).not.toBeNull();
    const cells = cellsAlong(behaviour.stops[0], route);
    const onRoad = cells.filter(([col, row]) => isRoadCell(grid, col, row)).length;
    // Not 100%: she starts in her own dooryard, which is grass, and joins the road from there.
    // "Most of the walk is on the road" is the property — "she never touches grass" would fail the
    // moment anyone's post moved a tile off the spine.
    expect(onRoad / cells.length).toBeGreaterThan(0.6);
  });

  it("walks the carpenter down the barn spur (normal case)", () => {
    const behaviour = riverbend.behaviours["settlement-carpenter"];
    const route = findRoute(grid, behaviour.stops[0], behaviour.stops[1]);
    expect(route).not.toBeNull();
    const cells = cellsAlong(behaviour.stops[0], route);
    expect(
      cells.filter(([col, row]) => isRoadCell(grid, col, row)).length / cells.length
    ).toBeGreaterThan(0.6);
  });

  // The servant is the counter-example that keeps the road preference honest: there is no road
  // through a pumpkin bed and he should not go looking for one. He is working the rows.
  it("walks the servant up his field, where there is no road to prefer (edge case)", () => {
    const behaviour = riverbend.behaviours["indentured-servant"];
    const route = findRoute(grid, behaviour.stops[0], behaviour.stops[1]);
    expect(route).not.toBeNull();
    const cells = cellsAlong(behaviour.stops[0], route);
    expect(cells.filter(([col, row]) => isRoadCell(grid, col, row))).toHaveLength(0);
  });

  it("gives every routed NPC on every map a circuit it can actually walk (normal case)", () => {
    const stranded = [];
    for (const map of Object.values(FIELD_MAPS)) {
      const mapGrid = fieldNavGridFor(map);
      for (const [id, behaviour] of Object.entries(map.behaviours)) {
        if (behaviour.kind !== "route") continue;
        const circuit = buildCircuit(mapGrid, behaviour.stops);
        if (circuit.filter((point) => point.stop).length < behaviour.stops.length)
          stranded.push(`${map.id}/${id}`);
      }
    }
    expect(stranded).toEqual([]);
  });
});
