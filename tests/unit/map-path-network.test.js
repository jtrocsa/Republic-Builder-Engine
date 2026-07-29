// Every building on a field map has a road running to its door.
//
// This is the guard for the defect Phase 55 fixed. Before it, roads were hand-written rectangle runs
// chosen by eye with no relationship to where the buildings were, and it showed: the Caribbean's only
// path ran *near* the Taíno village and then on through empty grass to nothing, so not one hut had a
// path to its door; most of Riverbend's dwellings and all fourteen of Philadelphia's stood in
// untouched ground. A building in untouched ground reads as scenery dropped on a texture rather than
// as somewhere people go.
//
// The property is checked against exactly the cells the generator used, not against a guess. Each
// generator emits the door cell of every building it stamped into `<map>.blocks.js` as a
// `*_DOORS` export (see `MapBuilder.toBlocksModule`), and each palette names its own road material in
// a `road` field. So nothing here has to know which collision rects happen to be buildings, or which
// tile happens to be a road on which map — both facts live next to the thing that owns them.
//
// Only the three field maps are in scope. Interiors (institute-hall, archive-room, hallway) have
// floors, not roads, and declare no `road`.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
const PALETTE_DIR = path.join(REPO_ROOT, "apps/web/src/content/tilesets/maps");

// How far a door may be from the nearest road cell. 1 means orthogonally adjacent — the spur the
// router paints starts *at* the door cell itself, so 1 leaves room only for the case where the door
// was unusable (a quayside front row, a field gate opening onto the crop bed) and `connectAll`
// snapped to a neighbour before routing.
const MAX_DOOR_TO_ROAD = 2;

const load = async (file) =>
  (await import(pathToFileURL(path.join(PALETTE_DIR, file)).href)).default;

const palettes = (
  await Promise.all(
    readdirSync(PALETTE_DIR)
      .filter((file) => file.endsWith(".palette.js"))
      .sort()
      .map(load)
  )
).filter((palette) => palette.road);

/** Strips the `../../assets/tilesets/` prefix a .tmj writes. */
function sheetPathOf(tileset) {
  const normalized = String(tileset.image).replace(/\\/g, "/");
  const marker = "assets/tilesets/";
  const index = normalized.indexOf(marker);
  return index === -1 ? normalized : normalized.slice(index + marker.length);
}

/**
 * Every gid the road material's terrain block can paint, resolved against the committed .tmj's own
 * tileset ordering rather than recomputed from the palette's sheet list — a gid only means anything
 * relative to one map's ordering.
 */
function roadGidsFor(tmj, entry) {
  const bySheet = new Map(tmj.tilesets.map((tileset) => [sheetPathOf(tileset), tileset]));
  const tileset = bySheet.get(entry.sheet);
  if (!tileset) return null;
  const gids = new Set();
  for (let row = 0; row < (entry.h ?? 1); row += 1) {
    for (let col = 0; col < (entry.w ?? 1); col += 1) {
      gids.add(tileset.firstgid + (entry.row + row) * tileset.columns + (entry.col + col));
    }
  }
  return gids;
}

describe.each(palettes.map((palette) => [path.basename(palette.map), palette]))(
  "%s road network",
  (_name, palette) => {
    const tmj = JSON.parse(readFileSync(path.join(REPO_ROOT, palette.map), "utf8"));
    const ground = tmj.layers.find((layer) => String(layer.name).toLowerCase() === "ground");

    it("declares a road material that exists in its own tiles and in the committed map", () => {
      expect(
        palette.tiles[palette.road],
        `${palette.road} is not a tile in this palette`
      ).toBeTruthy();
      expect(roadGidsFor(tmj, palette.tiles[palette.road])).not.toBeNull();
    });

    it("runs a road to every building's door", async () => {
      const blocksFile = palette.map.replace(/\.tmj$/, ".blocks.js");
      const blocks = await import(pathToFileURL(path.join(REPO_ROOT, blocksFile)).href);
      const doors = Object.entries(blocks).find(([name]) => name.endsWith("_DOORS"))?.[1];
      // A field map with no doors export means a generator stopped passing them, which would make
      // this whole file silently vacuous — the failure mode a test like this most needs to avoid.
      expect(doors, `${blocksFile} exports no *_DOORS`).toBeTruthy();
      expect(doors.length).toBeGreaterThan(0);

      const roadGids = roadGidsFor(tmj, palette.tiles[palette.road]);
      const isRoad = (col, row) =>
        col >= 0 &&
        row >= 0 &&
        col < ground.width &&
        row < ground.height &&
        roadGids.has(ground.data[row * ground.width + col]);

      const stranded = doors.filter((door) => {
        for (let dr = -MAX_DOOR_TO_ROAD; dr <= MAX_DOOR_TO_ROAD; dr += 1) {
          for (let dc = -MAX_DOOR_TO_ROAD; dc <= MAX_DOOR_TO_ROAD; dc += 1) {
            if (Math.abs(dr) + Math.abs(dc) > MAX_DOOR_TO_ROAD) continue;
            if (isRoad(door.col + dc, door.row + dr)) return false;
          }
        }
        return true;
      });

      expect(
        stranded.map(
          (door) => `(${door.col},${door.row}) has no ${palette.road} within ${MAX_DOOR_TO_ROAD}`
        )
      ).toEqual([]);
    });

    it("puts every building on one shared network, not each on its own private puddle", async () => {
      const blocksFile = palette.map.replace(/\.tmj$/, ".blocks.js");
      const blocks = await import(pathToFileURL(path.join(REPO_ROOT, blocksFile)).href);
      const doors = Object.entries(blocks).find(([name]) => name.endsWith("_DOORS"))[1];
      const roadGids = roadGidsFor(tmj, palette.tiles[palette.road]);
      const cells = new Set();
      for (let row = 0; row < ground.height; row += 1) {
        for (let col = 0; col < ground.width; col += 1) {
          if (roadGids.has(ground.data[row * ground.width + col])) cells.add(`${col},${row}`);
        }
      }

      // Flood-fill the road cells into components, then check every door touches the same one. This
      // is deliberately not "the road network has exactly one component": Caribbean's tracks and its
      // beach ring are painted in the same sand, so the shoreline counts as road here and the
      // island's five lobes give it several genuinely separate arcs. What matters is the walkable
      // claim — that a player can get from any building to any other along road — and that is what
      // this measures.
      const componentOf = new Map();
      let next = 0;
      for (const start of cells) {
        if (componentOf.has(start)) continue;
        const id = next++;
        const queue = [start];
        componentOf.set(start, id);
        while (queue.length > 0) {
          const [col, row] = queue.pop().split(",").map(Number);
          for (const [dc, dr] of [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
          ]) {
            const key = `${col + dc},${row + dr}`;
            if (!cells.has(key) || componentOf.has(key)) continue;
            componentOf.set(key, id);
            queue.push(key);
          }
        }
      }

      const componentsReached = new Set();
      for (const door of doors) {
        for (let dr = -MAX_DOOR_TO_ROAD; dr <= MAX_DOOR_TO_ROAD; dr += 1) {
          for (let dc = -MAX_DOOR_TO_ROAD; dc <= MAX_DOOR_TO_ROAD; dc += 1) {
            if (Math.abs(dr) + Math.abs(dc) > MAX_DOOR_TO_ROAD) continue;
            const id = componentOf.get(`${door.col + dc},${door.row + dr}`);
            if (id !== undefined) componentsReached.add(id);
          }
        }
      }
      expect([...componentsReached]).toHaveLength(1);
    });
  }
);
