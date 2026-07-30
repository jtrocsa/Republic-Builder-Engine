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
  HUB_BLOCK_RECTS,
  HUB_GRID,
  HUB_NPC_PATROLS,
  HUB_TARGETS,
  footBoxFor,
  hubFootBoxFor,
  rectsOverlap,
} from "../../apps/web/src/main.js";

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

function hubTraversal({ grid, blocks, spawn }) {
  // Mirrors isHubBlocked(): the edge test, then the foot box against every collision rect.
  const open = (x, y) =>
    x >= 0.6 &&
    y >= 0.8 &&
    x <= grid.columns - 1.2 &&
    y <= grid.rows - 1.2 &&
    !blocks.some((b) => rectsOverlap(hubFootBoxFor(x, y), b));

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

  // Since Phase 61 a post is a home anchor and a radius, not four waypoints — see
  // engine/npc-wander.js. That makes the old "every waypoint is walkable" assertion the wrong
  // shape: an NPC's step is gated by isFieldNpcBlocked() at runtime, so a radius overlapping the
  // sea costs it some pacing room rather than stranding it. What still has to hold is that the
  // post itself is standable — an NPC whose home is inside a hut never gets a first step.
  it("stands every NPC on walkable ground at its own post (edge case)", () => {
    const bad = [];
    for (const [id, post] of Object.entries(map.patrols)) {
      if (!footIsOnLand(map, post.home.x, post.home.y)) bad.push(`${id} home off land`);
      const block = blockingRect(map, post.home.x, post.home.y);
      if (block) bad.push(`${id} home inside "${block.kind}"`);
    }
    expect(bad).toEqual([]);
  });

  // A radius the NPC can barely use is a placement mistake even though it cannot strand anyone:
  // it reads in play as someone shuffling on the spot. Sample the disc and require that a real
  // share of it is walkable, which is what actually distinguishes "works a tight corner" from
  // "was placed against a wall by accident".
  it("gives every post enough walkable room to wander in (edge case)", () => {
    const cramped = [];
    for (const [id, post] of Object.entries(map.patrols)) {
      let open = 0;
      const samples = 64;
      for (let i = 0; i < samples; i += 1) {
        const angle = (i / samples) * Math.PI * 2;
        const distance = post.radius * (0.35 + (i % 3) * 0.325);
        const x = post.home.x + Math.cos(angle) * distance;
        const y = post.home.y + Math.sin(angle) * distance;
        if (footIsOnLand(map, x, y) && !blockingRect(map, x, y)) open += 1;
      }
      if (open / samples < 0.3) cramped.push(`${id} ${Math.round((open / samples) * 100)}% open`);
    }
    expect(cramped).toEqual([]);
  });

  it("gives every NPC a post at the coordinates the NPC declares (edge case)", () => {
    const mismatched = map.npcs
      .filter((npc) => map.patrols[npc.id])
      .filter((npc) => {
        const { home } = map.patrols[npc.id];
        return home.x !== npc.x || home.y !== npc.y;
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

  it("stands every staff member on open floor at their own post (edge case)", () => {
    // A post inside a rect means isHubNpcBlocked() refuses the very first step and the NPC never
    // leaves the spot. The field maps have had the equivalent assertion since Phase 52; the Main
    // Hall's three routes were re-derived by hand every time the room was re-laid.
    const bad = [];
    for (const [id, post] of Object.entries(HUB_NPC_PATROLS)) {
      if (!hall.canStandAt(post.home.x, post.home.y))
        bad.push(`${id} at ${post.home.x},${post.home.y}`);
    }
    expect(bad).toEqual([]);
  });

  // The hall is two narrow open bands between furniture, so a radius here uses much less of its
  // disc than a field post does. A lower bar than the field's 30%, but still a bar: below it the
  // staff member is pinned against a table rather than pacing an aisle.
  it("gives every staff post usable floor to pace (edge case)", () => {
    const cramped = [];
    for (const [id, post] of Object.entries(HUB_NPC_PATROLS)) {
      let open = 0;
      const samples = 64;
      for (let i = 0; i < samples; i += 1) {
        const angle = (i / samples) * Math.PI * 2;
        const distance = post.radius * (0.35 + (i % 3) * 0.325);
        if (
          hall.canStandAt(
            post.home.x + Math.cos(angle) * distance,
            post.home.y + Math.sin(angle) * distance
          )
        )
          open += 1;
      }
      if (open / samples < 0.2) cramped.push(`${id} ${Math.round((open / samples) * 100)}% open`);
    }
    expect(cramped).toEqual([]);
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
