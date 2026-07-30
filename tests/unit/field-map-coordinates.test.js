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
  footBoxFor,
  rectsOverlap,
} from "../../apps/web/src/main.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const TMJ_BY_UNIT = {
  "unit-01": "caribbean-field.tmj",
  "unit-02": "riverbend-field.tmj",
  "unit-03": "common-cause-field.tmj",
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

  it("keeps every patrol waypoint walkable, so no NPC paces into the sea (edge case)", () => {
    const bad = [];
    for (const [id, waypoints] of Object.entries(map.patrols)) {
      waypoints.forEach((point, index) => {
        if (!footIsOnLand(map, point.x, point.y)) bad.push(`${id}[${index}] off land`);
        const block = blockingRect(map, point.x, point.y);
        if (block) bad.push(`${id}[${index}] inside "${block.kind}"`);
      });
    }
    expect(bad).toEqual([]);
  });

  it("gives every NPC a patrol route that starts where the NPC stands (edge case)", () => {
    const mismatched = map.npcs
      .filter((npc) => map.patrols[npc.id])
      .filter((npc) => {
        const first = map.patrols[npc.id][0];
        return first.x !== npc.x || first.y !== npc.y;
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

// The Institute Archive Room is a hub room, not a field map: it has no land mask or NPCs, but it
// does have a generated .tmj, hand-written collision rects and interaction targets — the same
// three things that drift apart, so it gets the same treatment.
describe("archive room coordinates", () => {
  const tmj = JSON.parse(
    readFileSync(path.join(REPO_ROOT, "apps/web/src/content/maps/archive-room.tmj"), "utf8")
  );
  const structures = tmj.layers.find((layer) => layer.name === "structures");

  // Mirrors isHubBlocked()'s edge test in main.js.
  const walkable = (x, y) =>
    x >= 0.6 &&
    y >= 0.8 &&
    x <= ARCHIVE_ROOM_GRID.columns - 1.2 &&
    y <= ARCHIVE_ROOM_GRID.rows - 1.2;

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

  it("leaves somewhere walkable within reach of each interaction target (normal case)", () => {
    const unreachable = Object.entries(ARCHIVE_ROOM_TARGETS)
      .filter(([id, target]) => {
        const reach = id === "table" ? 1.65 : 1.1;
        for (let dx = -reach; dx <= reach; dx += 0.25) {
          for (let dy = -reach; dy <= reach; dy += 0.25) {
            if (Math.hypot(dx, dy) > reach) continue;
            const x = target.x + dx;
            const y = target.y + dy;
            if (!walkable(x, y)) continue;
            const foot = footBoxFor(x, y);
            if (!ARCHIVE_ROOM_BLOCK_RECTS.some((b) => rectsOverlap(foot, b))) return false;
          }
        }
        return true;
      })
      .map(([id]) => id);
    expect(unreachable).toEqual([]);
  });

  it("spawns the player clear of geometry when they enter through the exit door (edge case)", () => {
    // main.js drops the player at exitDoor.y - 0.6 on entry. A past regression froze all
    // movement because that very first foot-box already read as blocked.
    const x = ARCHIVE_ROOM_TARGETS.exitDoor.x;
    const y = ARCHIVE_ROOM_TARGETS.exitDoor.y - 0.6;
    expect(walkable(x, y)).toBe(true);
    const foot = footBoxFor(x, y);
    const blocking = ARCHIVE_ROOM_BLOCK_RECTS.find((b) => rectsOverlap(foot, b));
    expect(blocking?.kind).toBeUndefined();
  });
});
