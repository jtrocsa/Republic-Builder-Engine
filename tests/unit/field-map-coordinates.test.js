// Cross-checks every hand-written field coordinate in main.js against the generated .tmj.
//
// Why this exists: a field map's *art* lives in a .tmj produced by scripts/generate-*-tmj.js, and
// as of Phase 53 so does its collision — each generator writes a `<map>.blocks.js` alongside the
// .tmj from the same stamps, so those two can no longer drift. What is still hand-written is the
// other half: NPC positions, patrol routes and quest/source points. Those are placed around the
// buildings by eye, and the failure mode when a map is rebuilt is silent — an NPC standing in the
// sea, a quest marker inside a wall, a source the player cannot reach because a wider building
// footprint now covers the ground they used to stand on.
//
// These assertions turn that silent drift into a failing test. The collision-versus-art checks at
// the bottom are kept as well: generation makes them pass by construction, which is exactly what
// makes them cheap insurance against a change to the generator itself.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ARCHIVE_ROOM_BLOCK_RECTS,
  ARCHIVE_ROOM_GRID,
  ARCHIVE_ROOM_TARGETS,
  FIELD_GRID,
  FIELD_MAPS,
  HALLWAY_BLOCK_RECTS,
  HALLWAY_DOOR_APPROACH,
  HALLWAY_GRID,
  HALLWAY_NAV_GRID,
  HALLWAY_NPC_BEHAVIOURS,
  HALLWAY_SPAWN,
  HALLWAY_TARGETS,
  HUB_BLOCK_RECTS,
  HUB_GRID,
  HUB_NAV_GRID,
  HUB_NPC_BEHAVIOURS,
  HUB_TARGETS,
  fieldNavGridFor,
  footBoxFor,
  hubFootBoxFor,
  isFieldGroundStandable,
  isHallwayGroundStandable,
  isHubGroundStandable,
  rectsOverlap,
} from "../../apps/web/src/main.js";
import { buildCircuit, findRoute } from "../../apps/web/src/engine/npc-routing.js";
import institutePalette from "../../apps/web/src/content/tilesets/maps/institute-hall.palette.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// --- hub-room traversal ---------------------------------------------------------------------------
// Whether a room can actually be walked, as opposed to whether its furniture happens to leave a
// clear cell somewhere near each target.
//
// The distinction is the whole reason this exists. Both hub rooms already asserted that every
// interaction target has *a* clear cell within reach and that every spawn cell is clear — and the
// Main Hall shipped with the Preservation Case sealed behind three furniture runs, 3.3 tiles from
// the nearest cell a player could ever stand on, with both assertions green. Clearance is a local
// property; reachability is not, and only the second one is what a player experiences.
//
// So: flood-fill the room from its spawn using the real hub foot box and the real edge test, and
// require that the reachable region is the room. A pocket of open floor the player cannot enter is
// a defect whether or not anything interactive is standing in it.
const STEP = 0.1;

// `footBox` and `margins` are parameters rather than hardcoded so a field interior can be flood
// filled by the same code as a hub room. The two surfaces differ only in which foot box collision
// uses and how close to the wall the edge test lets you stand — the reachability question, and the
// answer's shape, are identical. Defaults reproduce the hub exactly, so existing callers are
// unchanged.
const HUB_MARGINS = { left: 0.6, top: 0.8, right: 1.2, bottom: 1.2 };
const FIELD_MARGINS = { left: 1.2, top: 0.9, right: 1.2, bottom: 1.0 };

function hubTraversal({ grid, blocks, spawn, footBox = hubFootBoxFor, margins = HUB_MARGINS }) {
  // Mirrors isHubBlocked()/isFieldBlocked(): the edge test, then the foot box against every rect.
  const open = (x, y) =>
    x >= margins.left &&
    y >= margins.top &&
    x <= grid.columns - margins.right &&
    y <= grid.rows - margins.bottom &&
    !blocks.some((b) => rectsOverlap(footBox(x, y), b));

  const key = (i, j) => `${i},${j}`;
  const at = (i) => Number((i * STEP).toFixed(4));
  const start = [Math.round(spawn[0] / STEP), Math.round(spawn[1] / STEP)];

  const reached = new Set();
  if (open(at(start[0]), at(start[1]))) {
    reached.add(key(...start));
    const queue = [start];
    while (queue.length) {
      const [i, j] = queue.pop();
      for (const [di, dj] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const ni = i + di;
        const nj = j + dj;
        if (reached.has(key(ni, nj))) continue;
        if (!open(at(ni), at(nj))) continue;
        reached.add(key(ni, nj));
        queue.push([ni, nj]);
      }
    }
  }

  const stranded = [];
  for (let i = 0; i <= Math.round(grid.columns / STEP); i += 1) {
    for (let j = 0; j <= Math.round(grid.rows / STEP); j += 1) {
      if (reached.has(key(i, j))) continue;
      if (open(at(i), at(j))) stranded.push([at(i), at(j)]);
    }
  }

  return {
    open,
    /** Is `[x, y]` in the same walkable component as the spawn? */
    canStandAt: (x, y) => reached.has(key(Math.round(x / STEP), Math.round(y / STEP))),
    /** Can the player get within `reach` of this point without leaving the spawn's component? */
    canReach(x, y, reach) {
      for (let dx = -reach; dx <= reach + 1e-9; dx += STEP) {
        for (let dy = -reach; dy <= reach + 1e-9; dy += STEP) {
          if (Math.hypot(dx, dy) > reach) continue;
          if (this.canStandAt(x + dx, y + dy)) return true;
        }
      }
      return false;
    },
    reachedCount: reached.size,
    /** Open cells the spawn cannot get to — sealed pockets. */
    stranded,
  };
}

/** The bounding box of a pocket, so a failure says where to widen an aisle. */
function pocketSummary(stranded) {
  if (!stranded.length) return "none";
  const xs = stranded.map(([x]) => x);
  const ys = stranded.map(([, y]) => y);
  return `${stranded.length} cells in x ${Math.min(...xs).toFixed(1)}–${Math.max(...xs).toFixed(
    1
  )}, y ${Math.min(...ys).toFixed(1)}–${Math.max(...ys).toFixed(1)}`;
}

const TMJ_BY_UNIT = {
  "unit-01": "caribbean-field.tmj",
  "unit-02": "riverbend-field.tmj",
  "unit-03": "common-cause-field.tmj",
  "unit-04": "canal-crossroads-field.tmj",
};

function loadTmj(file) {
  return JSON.parse(readFileSync(path.join(REPO_ROOT, "apps/web/src/content/maps", file), "utf8"));
}

/** Cells a rect covers, clamped to the grid. Used to ask "is there actually art here?". */
function cellsUnder(rect) {
  const cells = [];
  for (
    let row = Math.floor(rect.y1);
    row <= Math.min(Math.ceil(rect.y2) - 1, FIELD_GRID.rows - 1);
    row += 1
  ) {
    for (
      let col = Math.floor(rect.x1);
      col <= Math.min(Math.ceil(rect.x2) - 1, FIELD_GRID.columns - 1);
      col += 1
    ) {
      if (row >= 0 && col >= 0) cells.push([col, row]);
    }
  }
  return cells;
}

function inBounds(x, y) {
  return x >= 0 && y >= 0 && x <= FIELD_GRID.columns && y <= FIELD_GRID.rows;
}

/** Mirrors isFieldBlocked()'s land test: all four foot corners plus the bottom-centre point. */
function footIsOnLand(map, x, y) {
  const foot = footBoxFor(x, y);
  return [
    [foot.x1, foot.y1],
    [foot.x2, foot.y1],
    [foot.x1, foot.y2],
    [foot.x2, foot.y2],
    [(foot.x1 + foot.x2) / 2, foot.y2],
  ].every(([px, py]) => map.isLand(px, py));
}

function blockingRect(map, x, y) {
  const foot = footBoxFor(x, y);
  return map.blocks.find((block) => rectsOverlap(foot, block));
}

// --- who can end up standing where -----------------------------------------------------------
// Every point a behaviour can put an NPC on. For a route that has to be the whole walked path, not
// just the stops: the burgess's stops were a comfortable 2.9 tiles from the minister's post and the
// road between them ran within 1.1 tiles of him, which is inside interaction reach.
function territoryOf(behaviour, grid) {
  if (behaviour.kind !== "route") {
    return { points: [behaviour.at || behaviour.home], radius: behaviour.radius || 0 };
  }
  const points = [];
  let previous = behaviour.stops[0];
  for (const waypoint of buildCircuit(grid, behaviour.stops)) {
    const steps = Math.max(
      1,
      Math.ceil(Math.hypot(waypoint.x - previous.x, waypoint.y - previous.y) * 4)
    );
    for (let step = 1; step <= steps; step += 1) {
      points.push({
        x: previous.x + (waypoint.x - previous.x) * (step / steps),
        y: previous.y + (waypoint.y - previous.y) * (step / steps),
      });
    }
    previous = waypoint;
  }
  return { points, radius: 0 };
}

/** Closest the two territories can bring their NPCs, in tiles. Negative means they overlap. */
function territoryGap(a, b) {
  let closest = Infinity;
  for (const p of a.points) {
    for (const q of b.points) {
      closest = Math.min(closest, Math.hypot(p.x - q.x, p.y - q.y) - a.radius - b.radius);
    }
  }
  return closest;
}

// Two NPCs who can be within interaction reach of each other are interchangeable to the player:
// nearestFieldInteraction() answers with whoever is closest and has no way to know which was meant.
// Both of this phase's ways of getting that wrong shipped in a working build and passed every other
// assertion:
//
//   - The Powhatan pair's posts were 2.5 tiles apart and both wandered a 2.4 radius, two discs
//     almost entirely on top of one another. Once they walked continually they swapped places, and
//     a player who walked to the woman was answered by the man.
//   - The burgess's *path* ran past the stationed minister, so a walk to the minister sometimes
//     opened the burgess instead. The stop-based version of this check passed it at 2.9 tiles.
//
// The bar is the interaction reach itself (1.45) plus a little. It is deliberately NOT "no player
// can ever be near two people at once", which would need 2.9 and would forbid two neighbours using
// the same street — the market square would be a morgue. It is "these two can never be standing on
// top of each other", which is what makes one of them reliably the nearer once you have walked up.
const MIN_TERRITORY_GAP = 1.5;

function crowdedPairs(behaviours, grid) {
  const entries = Object.entries(behaviours).map(([id, behaviour]) => [
    id,
    territoryOf(behaviour, grid),
  ]);
  const crowded = [];
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      const gap = territoryGap(entries[i][1], entries[j][1]);
      if (gap < MIN_TERRITORY_GAP) {
        crowded.push(`${entries[i][0]} / ${entries[j][0]} ${gap.toFixed(2)} tiles apart`);
      }
    }
  }
  return crowded;
}

/**
 * Every cell of a map's `structures` layer painted with a given palette tile.
 *
 * Resolved against the committed .tmj's own tileset ordering rather than recomputed from the
 * palette's sheet list, because a gid only means anything relative to one map's ordering — the same
 * reasoning as roadGidsFor() in tests/unit/map-path-network.test.js. This is how a `decor` stamp can
 * be located at all: decor carries no collision rect, so it leaves no trace in `<map>.blocks.js` and
 * the painted tile is the only record that it is there.
 */
function cellsPainted(tmj, entry) {
  const structures = tmj.layers.find((layer) => layer.name === "structures");
  const tileset = tmj.tilesets.find((set) =>
    String(set.image).replace(/\\/g, "/").endsWith(`assets/tilesets/${entry.sheet}`)
  );
  if (!tileset || !structures) return [];
  const gids = new Set();
  for (let row = 0; row < (entry.h ?? 1); row += 1) {
    for (let col = 0; col < (entry.w ?? 1); col += 1) {
      gids.add(tileset.firstgid + (entry.row + row) * tileset.columns + (entry.col + col));
    }
  }
  const cells = [];
  for (let row = 0; row < structures.height; row += 1) {
    for (let col = 0; col < structures.width; col += 1) {
      if (gids.has(structures.data[row * structures.width + col])) cells.push({ col, row });
    }
  }
  return cells;
}

describe.each(Object.entries(FIELD_MAPS))("%s field map coordinates", (unitId, map) => {
  const tmj = loadTmj(TMJ_BY_UNIT[unitId]);
  const structures = tmj.layers.find((layer) => layer.name === "structures");

  it("has a .tmj whose grid matches FIELD_GRID (normal case)", () => {
    // FIELD_GRID is the collision/camera world size; the .tmj is what gets painted. If these
    // disagree the art is silently stretched to fit and every coordinate below means something
    // different on screen than it does in the physics.
    expect(tmj.width).toBe(FIELD_GRID.columns);
    expect(tmj.height).toBe(FIELD_GRID.rows);
    expect(tmj.tilewidth).toBe(FIELD_GRID.tile);
    expect(tmj.tileheight).toBe(FIELD_GRID.tile);
  });

  it("spawns the player on land, in bounds, and not inside a collision rect (normal case)", () => {
    const { x, y } = map.spawn;
    expect(inBounds(x, y)).toBe(true);
    expect(footIsOnLand(map, x, y)).toBe(true);
    expect(blockingRect(map, x, y)).toBeUndefined();
  });

  it("places the recall beacon on land and in bounds (normal case)", () => {
    const { x, y } = map.recall;
    expect(inBounds(x, y)).toBe(true);
    expect(map.isLand(x, y)).toBe(true);
  });

  it("places every NPC on land, in bounds, and clear of collision rects (normal case)", () => {
    const stranded = map.npcs.filter((npc) => !footIsOnLand(map, npc.x, npc.y));
    expect(stranded.map((npc) => npc.id)).toEqual([]);

    const trapped = map.npcs
      .map((npc) => [npc.id, blockingRect(map, npc.x, npc.y)?.kind])
      .filter(([, kind]) => kind);
    expect(trapped).toEqual([]);
  });

  // Since Phase 61 an NPC's placement is not four waypoints, and since Phase 62 it is one of three
  // behaviours — see engine/npc-behaviour.js. An NPC's step is gated by isFieldNpcBlocked() at
  // runtime, so a wander radius overlapping the sea costs it some pacing room rather than
  // stranding it. What still has to hold is that the anchor is standable: a station inside a hut,
  // or a route stop the router cannot snap to, is someone who never moves again.
  const anchorsOf = (behaviour) =>
    behaviour.kind === "route" ? behaviour.stops : [behaviour.at || behaviour.home];

  it("stands every NPC on walkable ground at every place it is sent (edge case)", () => {
    const bad = [];
    for (const [id, behaviour] of Object.entries(map.behaviours)) {
      anchorsOf(behaviour).forEach((point, index) => {
        const where = behaviour.kind === "route" ? `stop ${index}` : "post";
        if (!footIsOnLand(map, point.x, point.y)) bad.push(`${id} ${where} off land`);
        const block = blockingRect(map, point.x, point.y);
        if (block) bad.push(`${id} ${where} inside "${block.kind}"`);
      });
    }
    expect(bad).toEqual([]);
  });

  // A radius the NPC can barely use is a placement mistake even though it cannot strand anyone:
  // it reads in play as someone shuffling on the spot. Sample the disc and require that a real
  // share of it is walkable, which is what actually distinguishes "works a tight corner" from
  // "was placed against a wall by accident". Only wanderers have a disc; a station is meant to
  // stand still and a route's freedom is checked by the routing test below.
  it("gives every wanderer enough walkable room to use (edge case)", () => {
    const cramped = [];
    for (const [id, behaviour] of Object.entries(map.behaviours)) {
      if (behaviour.kind !== "wander") continue;
      let open = 0;
      const samples = 64;
      for (let i = 0; i < samples; i += 1) {
        const angle = (i / samples) * Math.PI * 2;
        const distance = behaviour.radius * (0.35 + (i % 3) * 0.325);
        const x = behaviour.home.x + Math.cos(angle) * distance;
        const y = behaviour.home.y + Math.sin(angle) * distance;
        if (footIsOnLand(map, x, y) && !blockingRect(map, x, y)) open += 1;
      }
      if (open / samples < 0.3) cramped.push(`${id} ${Math.round((open / samples) * 100)}% open`);
    }
    expect(cramped).toEqual([]);
  });

  // Every route has to resolve to a walk, and every stop has to be somewhere the NPC actually
  // arrives. buildCircuit() drops a leg it cannot path rather than failing — the right behaviour at
  // runtime, and exactly the silent degradation that needs a test: a carpenter authored into a
  // sealed barn yard would simply stand still forever with nothing in the console.
  it("finds a real walk between every route's stops (edge case)", () => {
    const grid = fieldNavGridFor(map);
    const broken = [];
    for (const [id, behaviour] of Object.entries(map.behaviours)) {
      if (behaviour.kind !== "route") continue;
      const circuit = buildCircuit(grid, behaviour.stops);
      const stops = circuit.filter((point) => point.stop).length;
      if (stops < behaviour.stops.length) {
        broken.push(`${id} reached ${stops}/${behaviour.stops.length} stops`);
      }
      const offMap = circuit.filter((point) => !isFieldGroundStandable(map, point.x, point.y));
      if (offMap.length > 0) broken.push(`${id} routed over ${offMap.length} unwalkable cells`);
    }
    expect(broken).toEqual([]);
  });

  it("keeps any two NPCs' ground apart, so the wrong one cannot answer (edge case)", () => {
    expect(crowdedPairs(map.behaviours, fieldNavGridFor(map))).toEqual([]);
  });

  it("anchors every NPC's behaviour at the coordinates the NPC declares (edge case)", () => {
    // A route may start anywhere along its circuit, so only its FIRST stop is the person's own
    // post; a station's `at` is. Either way the content file and the behaviour table have to agree
    // about where somebody is, because the NPC's declared x/y is what a source anchor reads before
    // the first tick moves them.
    const mismatched = map.npcs
      .filter((npc) => map.behaviours[npc.id])
      .filter((npc) => {
        const [anchor] = anchorsOf(map.behaviours[npc.id]);
        return anchor.x !== npc.x || anchor.y !== npc.y;
      })
      .map((npc) => npc.id);
    expect(mismatched).toEqual([]);
  });

  // Object-anchored points only. An NPC-anchored point (Phase 56) has no x/y at all: its position is
  // read from the carrier's live patrol state every frame, and that carrier is already covered by the
  // NPC and patrol-waypoint assertions above — checking it here would be checking the same
  // coordinates twice while reading `undefined` as "off the map".
  const placedPoints = () =>
    Object.entries(map.sourcePoints).filter(([, point]) => !point.anchor?.npc);

  it("gives every source an anchor: a carrier NPC that exists, or explicit coordinates (normal case)", () => {
    // The failure this catches is a typo'd or renamed NPC id, which would strand a record nowhere:
    // no world marker (the NPC badge replaces it) and no badge either (no such NPC to draw it on).
    const bad = Object.entries(map.sourcePoints)
      .filter(([, point]) =>
        point.anchor?.npc
          ? !map.npcs.some((npc) => npc.id === point.anchor.npc)
          : typeof point.x !== "number" || typeof point.y !== "number"
      )
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  it("puts every quest/source point on land and in bounds (normal case)", () => {
    const bad = placedPoints()
      .filter(([, point]) => !inBounds(point.x, point.y) || !map.isLand(point.x, point.y))
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  it("keeps every quest/source point reachable from adjacent walkable ground (edge case)", () => {
    // A marker can sit on a table the player cannot enter, but there must be somewhere within
    // the 1.55-tile interaction reach they can actually stand.
    const unreachable = placedPoints()
      .filter(([, point]) => {
        for (let dx = -1.5; dx <= 1.5; dx += 0.5) {
          for (let dy = -1.5; dy <= 1.5; dy += 0.5) {
            const x = point.x + dx;
            const y = point.y + dy;
            if (Math.hypot(dx, dy) > 1.55) continue;
            if (footIsOnLand(map, x, y) && !blockingRect(map, x, y)) return false;
          }
        }
        return true;
      })
      .map(([id]) => id);
    expect(unreachable).toEqual([]);
  });

  it("keeps every collision rect in bounds and non-degenerate (edge case)", () => {
    const bad = map.blocks
      .filter(
        (b) =>
          b.x1 >= b.x2 ||
          b.y1 >= b.y2 ||
          b.x1 < 0 ||
          b.y1 < 0 ||
          b.x2 > FIELD_GRID.columns ||
          b.y2 > FIELD_GRID.rows
      )
      .map((b) => b.kind);
    expect(bad).toEqual([]);
  });

  it("backs every collision rect with drawn structure art (normal case)", () => {
    // The drift this catches: a rect left behind at its old coordinates after the map moved,
    // blocking a patch of empty grass the player can see straight through.
    if (!structures) return;
    const empty = map.blocks
      .filter((block) =>
        cellsUnder(block).every(([col, row]) => structures.data[row * tmj.width + col] === 0)
      )
      .map((block) => block.kind);
    expect(empty).toEqual([]);
  });

  it("stands every collision rect on land, not out at sea (edge case)", () => {
    const afloat = map.blocks
      .filter((block) => {
        const cx = (block.x1 + block.x2) / 2;
        const cy = (block.y1 + block.y2) / 2;
        return !map.isLand(cx, cy);
      })
      .map((block) => block.kind);
    expect(afloat).toEqual([]);
  });
});

// --- field interiors ------------------------------------------------------------------------------
// The rooms a field map opens into (Phase 65). Enrolled automatically: every interior declared on
// any FIELD_MAPS entry is picked up here, the same way describe.each above picks up a new map.
//
// An interior fails differently from an outdoor map, which is why it gets its own suite rather than
// joining the one above. There is no coastline to fall into and no route to strand — the failure is
// a room the player walks into and cannot walk out of, or a doorstep standing somewhere the outdoor
// map does not let them reach. Both are silent: the door renders, the entry works, and the player
// is simply stuck. So the assertions are traversal-shaped, reusing the flood fill written for the
// hub rooms, which exists because the Main Hall shipped with exactly this class of defect.
const FIELD_INTERIORS = Object.entries(FIELD_MAPS).flatMap(([unitId, map]) =>
  Object.values(map.interiors || {}).map((room) => [`${unitId} · ${room.id}`, map, room])
);

describe.runIf(FIELD_INTERIORS.length > 0).each(FIELD_INTERIORS)(
  "%s interior coordinates",
  (_label, outdoor, room) => {
    const grid = room.grid;
    const walk = () =>
      hubTraversal({
        grid,
        blocks: room.blocks,
        spawn: [room.entry.x, room.entry.y],
        footBox: footBoxFor,
        margins: FIELD_MARGINS,
      });

    it("declares a 48px grid, matching every other surface", () => {
      expect(grid.tile).toBe(FIELD_GRID.tile);
      expect(grid.columns).toBeGreaterThan(0);
      expect(grid.rows).toBeGreaterThan(0);
    });

    it("puts the player somewhere they can stand on entry", () => {
      const traversal = walk();
      expect(traversal.open(room.entry.x, room.entry.y)).toBe(true);
      // A zero-size reachable region means the flood fill never started — the entry itself is
      // inside a wall, and the room would open onto a frozen player.
      expect(traversal.reachedCount).toBeGreaterThan(0);
    });

    it("lets the player reach the way out from where they came in", () => {
      // The interaction reach the exit marker is gated on, so "the exit exists" and "the exit can
      // be used" cannot disagree.
      expect(walk().canReach(room.exit.x, room.exit.y, 1.45)).toBe(true);
    });

    it("has no sealed pocket of floor", () => {
      const { stranded } = walk();
      expect(pocketSummary(stranded)).toBe("none");
    });

    it("stands its doorstep somewhere the outdoor map can be walked to", () => {
      // The door lives on the outdoor map, so it is checked against the outdoor map's land mask and
      // collision — a doorstep stamped inside its own building's rect is reachable by nobody.
      const { x, y } = room.door;
      expect(x).toBeGreaterThan(0);
      expect(y).toBeGreaterThan(0);
      expect(x).toBeLessThan(FIELD_GRID.columns);
      expect(y).toBeLessThan(FIELD_GRID.rows);
      const nearby = [];
      for (let dx = -1.45; dx <= 1.45 + 1e-9; dx += 0.1) {
        for (let dy = -1.45; dy <= 1.45 + 1e-9; dy += 0.1) {
          if (Math.hypot(dx, dy) > 1.45) continue;
          if (isFieldGroundStandable(outdoor, x + dx, y + dy)) nearby.push([dx, dy]);
        }
      }
      expect(nearby.length).toBeGreaterThan(0);
    });

    it("keeps its people and records off the furniture", () => {
      const traversal = walk();
      for (const npc of room.npcs) {
        expect(traversal.open(npc.x, npc.y), `${npc.id} is inside a wall`).toBe(true);
      }
      for (const [id, point] of Object.entries(room.sourcePoints)) {
        if (point.anchor?.npc) {
          expect(
            room.npcs.some((npc) => npc.id === point.anchor.npc),
            `${id} anchors to an NPC not in this room`
          ).toBe(true);
          continue;
        }
        expect(traversal.canReach(point.x, point.y, 1.55), `${id} is unreachable`).toBe(true);
      }
    });
  }
);

// The Institute Main Hall. Same treatment as the field maps: a generated .tmj, generated collision,
// and hand-placed targets/spawns around the furniture — plus, as of Phase 58, the traversal check
// described above hubTraversal().
//
// Two shipped defects live behind these assertions. Phase 54's rebuild left six call sites passing
// `safeInstituteSpawn(7, 9)` or `(16, 9)` — the *painted* hall's spawn and its Navigation Table
// approach — after the retile had put (7,9) inside a "sealed record chest"; safeInstituteSpawn()
// does not validate, so every Recall to Institute would have landed the player unable to move.
// Phase 57 added the spawn assertion for that. What it did not add was reachability, and the same
// rebuild had also walled off the room's entire west end: the Preservation Case sat 3.3 tiles from
// the nearest cell a player could reach, on a screen every session passes through.
describe("institute main hall coordinates", () => {
  const tmj = JSON.parse(
    readFileSync(path.join(REPO_ROOT, "apps/web/src/content/maps/institute-hall.tmj"), "utf8")
  );

  // safeInstituteSpawn()'s own default — the foyer entrance in the south wall, and the cell every
  // flood fill below starts from, because it is where a player's first step in this room happens.
  const SPAWN = [11.5, 9];
  const hall = hubTraversal({ grid: HUB_GRID, blocks: HUB_BLOCK_RECTS, spawn: SPAWN });

  it("has a .tmj matching HUB_GRID (normal case)", () => {
    expect(tmj.width).toBe(HUB_GRID.columns);
    expect(tmj.height).toBe(HUB_GRID.rows);
    expect(tmj.tilewidth).toBe(HUB_GRID.tile);
  });

  it("lets the player walk from the spawn to every interaction target (normal case)", () => {
    const unreachable = Object.entries(HUB_TARGETS)
      .filter(([id, target]) => !hall.canReach(target.x, target.y, id === "table" ? 1.65 : 1.1))
      .map(([id]) => id);
    expect(unreachable).toEqual([]);
  });

  it("seals no pocket of open floor off from the rest of the hall (edge case)", () => {
    // A room the player can only walk half of is the defect this catches. Stated as "every open
    // cell is reachable" rather than as a coverage ratio: a pocket is a pocket at any size, and the
    // failure message names where it is so the fix is a furniture move, not a hunt.
    expect(pocketSummary(hall.stranded)).toBe("none");
  });

  it("spawns the player somewhere they can walk out of, at every entry point (edge case)", () => {
    // safeInstituteSpawn()'s default, plus the coordinates the other call sites derive from
    // HUB_TARGETS: through the Archive Room door, and beside the Navigation Table on recall.
    const entries = {
      "foyer entrance (safeInstituteSpawn default)": SPAWN,
      "leaving the Archive Room": [HUB_TARGETS.archiveDoor.x, HUB_TARGETS.archiveDoor.y + 0.6],
      "recall to the Institute": [HUB_TARGETS.table.x, HUB_TARGETS.table.y + 0.6],
    };
    const blocked = Object.entries(entries)
      .filter(([, [x, y]]) => !hall.canStandAt(x, y))
      .map(([name]) => name);
    expect(blocked).toEqual([]);
  });

  it("stands every NPC target clear of the furniture, so a patrol can start (edge case)", () => {
    const trapped = ["director", "amani", "julian"].filter(
      (id) => !hall.canStandAt(HUB_TARGETS[id].x, HUB_TARGETS[id].y)
    );
    expect(trapped).toEqual([]);
  });

  const hallAnchors = (behaviour) =>
    behaviour.kind === "route" ? behaviour.stops : [behaviour.at || behaviour.home];

  it("stands every staff member on open floor everywhere they go (edge case)", () => {
    // An anchor inside a rect means isHubNpcBlocked() refuses the very first step and the NPC never
    // leaves the spot. The field maps have had the equivalent assertion since Phase 52; the Main
    // Hall's three posts were re-derived by hand every time the room was re-laid.
    const bad = [];
    for (const [id, behaviour] of Object.entries(HUB_NPC_BEHAVIOURS)) {
      for (const point of hallAnchors(behaviour)) {
        if (!hall.canStandAt(point.x, point.y)) bad.push(`${id} at ${point.x},${point.y}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("finds a real walk between every staff route's stops (edge case)", () => {
    const broken = [];
    for (const [id, behaviour] of Object.entries(HUB_NPC_BEHAVIOURS)) {
      if (behaviour.kind !== "route") continue;
      const circuit = buildCircuit(HUB_NAV_GRID, behaviour.stops);
      const stops = circuit.filter((point) => point.stop).length;
      if (stops < behaviour.stops.length)
        broken.push(`${id} reached ${stops}/${behaviour.stops.length} stops`);
      const offFloor = circuit.filter((point) => !isHubGroundStandable(point.x, point.y));
      if (offFloor.length > 0) broken.push(`${id} routed over ${offFloor.length} blocked cells`);
    }
    expect(broken).toEqual([]);
  });

  it("keeps any two staff members' ground apart (edge case)", () => {
    expect(crowdedPairs(HUB_NPC_BEHAVIOURS, HUB_NAV_GRID)).toEqual([]);
  });

  // The reading stools are `decor` and carry no collision, on purpose — the south aisle has no
  // solid stamps in it, which is what keeps the room traversable end to end. That also means
  // nothing stops a staff member standing on one, and before Phase 62 Julian did: his post at
  // (15.2,8.9) put his foot box across the stool at column 14, which is the playtest screenshot.
  // Blocking the stools would pinch the aisle to 0.56 tiles against a 0.5-tile foot box, so the
  // people move instead — and this is the assertion that keeps them moved.
  it("keeps every staff member off the furniture they are not standing behind (edge case)", () => {
    const stools = cellsPainted(tmj, institutePalette.tiles.stool).concat(
      cellsPainted(tmj, institutePalette.tiles.stoolAlt)
    );
    expect(stools.length).toBeGreaterThan(0);
    const standing = [];
    for (const [id, behaviour] of Object.entries(HUB_NPC_BEHAVIOURS)) {
      for (const point of hallAnchors(behaviour)) {
        const foot = hubFootBoxFor(point.x, point.y);
        const hit = stools.find((cell) =>
          rectsOverlap(foot, { x1: cell.col, y1: cell.row, x2: cell.col + 1, y2: cell.row + 1 })
        );
        if (hit) standing.push(`${id} on the stool at ${hit.col},${hit.row}`);
      }
    }
    expect(standing).toEqual([]);
  });
});

// The Institute Archive Room is a hub room, not a field map: it has no land mask or NPCs, but it
// does have a generated .tmj, hand-written collision rects and interaction targets — the same
// three things that drift apart, so it gets the same treatment.
describe("archive room coordinates", () => {
  const tmj = JSON.parse(
    readFileSync(path.join(REPO_ROOT, "apps/web/src/content/maps/archive-room.tmj"), "utf8")
  );
  const structures = tmj.layers.find((layer) => layer.name === "structures");

  // Where main.js puts the player on entry: just inside the exit door in the south wall.
  const SPAWN = [ARCHIVE_ROOM_TARGETS.exitDoor.x, ARCHIVE_ROOM_TARGETS.exitDoor.y - 0.6];
  const room = hubTraversal({
    grid: ARCHIVE_ROOM_GRID,
    blocks: ARCHIVE_ROOM_BLOCK_RECTS,
    spawn: SPAWN,
  });

  function cells(rect) {
    const out = [];
    for (
      let row = Math.floor(rect.y1);
      row <= Math.min(Math.ceil(rect.y2) - 1, tmj.height - 1);
      row += 1
    ) {
      for (
        let col = Math.floor(rect.x1);
        col <= Math.min(Math.ceil(rect.x2) - 1, tmj.width - 1);
        col += 1
      ) {
        if (row >= 0 && col >= 0) out.push([col, row]);
      }
    }
    return out;
  }

  it("has a .tmj matching ARCHIVE_ROOM_GRID (normal case)", () => {
    expect(tmj.width).toBe(ARCHIVE_ROOM_GRID.columns);
    expect(tmj.height).toBe(ARCHIVE_ROOM_GRID.rows);
    expect(tmj.tilewidth).toBe(ARCHIVE_ROOM_GRID.tile);
  });

  it("backs every collision rect with drawn furniture (normal case)", () => {
    const empty = ARCHIVE_ROOM_BLOCK_RECTS.filter((block) =>
      cells(block).every(([col, row]) => structures.data[row * tmj.width + col] === 0)
    ).map((block) => block.kind);
    expect(empty).toEqual([]);
  });

  it("keeps every collision rect inside the room (edge case)", () => {
    const bad = ARCHIVE_ROOM_BLOCK_RECTS.filter(
      (b) =>
        b.x1 >= b.x2 ||
        b.y1 >= b.y2 ||
        b.x1 < 0 ||
        b.y1 < 0 ||
        b.x2 > ARCHIVE_ROOM_GRID.columns ||
        b.y2 > ARCHIVE_ROOM_GRID.rows
    ).map((b) => b.kind);
    expect(bad).toEqual([]);
  });

  it("lets the player walk from the entrance to every interaction target (normal case)", () => {
    const unreachable = Object.entries(ARCHIVE_ROOM_TARGETS)
      .filter(([id, target]) => !room.canReach(target.x, target.y, id === "table" ? 1.65 : 1.1))
      .map(([id]) => id);
    expect(unreachable).toEqual([]);
  });

  it("seals no pocket of open floor off from the rest of the room (edge case)", () => {
    expect(pocketSummary(room.stranded)).toBe("none");
  });

  it("spawns the player somewhere they can walk out of, entering through the exit door (edge case)", () => {
    // main.js drops the player at exitDoor.y - 0.6 on entry. A past regression froze all
    // movement because that very first foot-box already read as blocked.
    expect(room.canStandAt(ARCHIVE_ROOM_TARGETS.exitDoor.x, SPAWN[1])).toBe(true);
  });
});

// The Entrance Hall gets the same treatment as the Archive Room, plus one assertion neither other
// hub room needs: the escort walk is a *routed* walk, so the room has to guarantee not just that the
// player can reach the Director but that findRoute() can get the Director from his post to the door
// with the player following. Before Phase 62 none of this was checkable — the map had no collision
// at all, because the corridor was a scripted cutscene nobody could walk in.
describe("institute entrance hall coordinates", () => {
  const tmj = JSON.parse(
    readFileSync(path.join(REPO_ROOT, "apps/web/src/content/maps/hallway.tmj"), "utf8")
  );
  const structures = tmj.layers.find((layer) => layer.name === "structures");

  const hall = hubTraversal({
    grid: HALLWAY_GRID,
    blocks: HALLWAY_BLOCK_RECTS,
    spawn: HALLWAY_SPAWN,
  });

  function cells(rect) {
    const out = [];
    for (
      let row = Math.floor(rect.y1);
      row <= Math.min(Math.ceil(rect.y2) - 1, tmj.height - 1);
      row += 1
    ) {
      for (
        let col = Math.floor(rect.x1);
        col <= Math.min(Math.ceil(rect.x2) - 1, tmj.width - 1);
        col += 1
      ) {
        if (row >= 0 && col >= 0) out.push([col, row]);
      }
    }
    return out;
  }

  it("has a .tmj matching HALLWAY_GRID (normal case)", () => {
    expect(tmj.width).toBe(HALLWAY_GRID.columns);
    expect(tmj.height).toBe(HALLWAY_GRID.rows);
    expect(tmj.tilewidth).toBe(HALLWAY_GRID.tile);
  });

  it("draws its greenery on an overlay layer, so the player walks behind it (normal case)", () => {
    // The four `base` stamps flanking the spine are the reason this map gained a third layer. If a
    // future layout makes them all `solid` the layer disappears and walk-behind goes with it.
    const overlay = tmj.layers.find((layer) => layer.name === "overlay");
    expect(overlay?.data.some(Boolean)).toBe(true);
  });

  it("backs every collision rect with drawn furniture (normal case)", () => {
    const empty = HALLWAY_BLOCK_RECTS.filter((block) =>
      cells(block).every(([col, row]) => structures.data[row * tmj.width + col] === 0)
    ).map((block) => block.kind);
    expect(empty).toEqual([]);
  });

  it("keeps every collision rect inside the room (edge case)", () => {
    const bad = HALLWAY_BLOCK_RECTS.filter(
      (b) =>
        b.x1 >= b.x2 ||
        b.y1 >= b.y2 ||
        b.x1 < 0 ||
        b.y1 < 0 ||
        b.x2 > HALLWAY_GRID.columns ||
        b.y2 > HALLWAY_GRID.rows
    ).map((b) => b.kind);
    expect(bad).toEqual([]);
  });

  it("spawns the player somewhere they can walk out of (edge case)", () => {
    expect(hall.canStandAt(HALLWAY_SPAWN[0], HALLWAY_SPAWN[1])).toBe(true);
  });

  it("stands the Director somewhere the player can walk up to him (normal case)", () => {
    expect(isHallwayGroundStandable(...Object.values(HALLWAY_NPC_BEHAVIOURS.director.at))).toBe(
      true
    );
    const unreachable = Object.entries(HALLWAY_TARGETS)
      .filter(([, target]) => !hall.canReach(target.x, target.y, 1.1))
      .map(([id]) => id);
    expect(unreachable).toEqual([]);
  });

  it("seals no pocket of open floor off from the rest of the room (edge case)", () => {
    expect(pocketSummary(hall.stranded)).toBe("none");
  });

  it("routes the escort walk from the Director's post to the doorway (normal case)", () => {
    const route = findRoute(
      HALLWAY_NAV_GRID,
      HALLWAY_NPC_BEHAVIOURS.director.at,
      HALLWAY_DOOR_APPROACH
    );
    // Length, not just non-null: findRoute() returns [] when start and goal share a cell, and
    // startHallwayEscort() coerces its null to [] as well. Either would sail past a bare
    // not-null check and then finish the escort on its first frame, teleporting nobody anywhere.
    expect(route.length).toBeGreaterThan(0);
    const offFloor = route.filter((point) => !isHallwayGroundStandable(point.x, point.y));
    expect(offFloor).toEqual([]);
    // The player follows this same trail a fixed distance behind, so it also has to be walkable
    // from the spawn's component — a route through a pocket would strand the follower.
    const unwalkable = route.filter((point) => !hall.canStandAt(point.x, point.y));
    expect(unwalkable).toEqual([]);
  });
});
