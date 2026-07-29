// Roads, and the routing that connects every building to one.
//
// The problem this solves. Before Phase 55 each generator painted its roads as hand-written
// rectangle runs — `for (let col = 17; col <= 46; col += 1) trackAt(col, 20)` — chosen by eye and
// with no relationship to where the buildings actually were. The result, visible in play on all
// three maps:
//
//   * Caribbean had a 2-wide dirt strip down cols 28-29 that passed *near* the Taíno village and
//     then ran on through empty grass to nothing. Not one hut had a path to its door.
//   * Riverbend's three tracks touched the meetinghouse and the barn; the five dwellings, the shed,
//     the hen house and the market stall sat in open grass.
//   * Philadelphia's fourteen dwellings were all off the paved streets, and the one packed-earth
//     lane that did meet the cobble punched a hard brown rectangle into the paving.
//
// A building standing in untouched grass reads as scenery dropped on a texture, not as somewhere
// people go. So roads are no longer authored as coordinates. A generator declares a **trunk** (the
// few runs that are genuinely deliberate: a high street, a quay, a village spine) on a
// `RoadNetwork`, then hands `connectAll()` the door cell of every building it stamped. Each door is
// routed to the nearest cell already in the network — trunk or an earlier spur — so the spurs braid
// together rather than each running the full distance back to the trunk.
//
// Four properties are worth stating because each one was a defect first:
//
// 1. **The network is a set of cells, not a tile lookup.** An earlier revision asked "is the tile
//    here the road material?" That silently broke on two of the three maps, because Caribbean's
//    tracks are the same sand as its beach and Riverbend's are the same sand as its river shore: a
//    door two cells from the water "reached the network" by touching the beach, so its spur was a
//    stub to the shoreline instead of a lane to the village. Membership is now recorded, not
//    inferred.
// 2. **Road material must be full-bleed and tiled by parity, never edge-baked.** `groundBlock()`
//    paints one quadrant of an authored 2x2 block, which tiles correctly in any direction. The
//    tropical `path.tropical.left`/`.right` pair does not: each carries a grass edge down one side,
//    so it can only ever run north-south. That is exactly why Caribbean's road *was* one vertical
//    strip, and why its own generator recorded that an east-west connector "has to be faked with
//    plain sand."
// 3. **A softer material yields to a harder one at a seam.** A dirt spur stops at the first cell
//    already painted cobble instead of overwriting it. Without this, a packed-earth lane crossing a
//    paved square leaves a hard-edged brown rectangle in the middle of the stone.
// 4. **Routes bend around buildings, not through them.** BFS over cells that are in bounds, on
//    land, and not occupied by a stamp. A straight L-shaped run would drive a road through the
//    neighbour's wall.

/**
 * One map's road network: the material it is painted in, and which cells belong to it.
 *
 * Membership is tracked explicitly rather than read back off the ground layer. See note 1 above —
 * inferring it from the tile is what made two of the three maps connect their buildings to the
 * beach.
 */
export class RoadNetwork {
  /**
   * @param {import("./map-builder.js").MapBuilder} map
   * @param {object} material palette entry for the road's terrain block (any footprint; tiled by parity)
   * @param {object} [options]
   * @param {Set<number>} [options.harder] gids this material must never overwrite
   */
  constructor(map, material, { harder } = {}) {
    this.map = map;
    this.material = material;
    this.harder = harder;
    this.cells = new Set();
  }

  key(col, row) {
    return `${col},${row}`;
  }

  has(col, row) {
    return this.cells.has(this.key(col, row));
  }

  /**
   * Paints one cell and records it. A cell already owned by a harder material joins the network
   * without being repainted: the road continues *through* the paving rather than stopping dead at it
   * or punching a hole in it.
   */
  paint(col, row) {
    if (!this.map.inBounds(col, row)) return false;
    const alreadyHarder = this.harder?.has(this.map.ground[this.map.index(col, row)]);
    if (!alreadyHarder) this.map.groundBlock(col, row, this.material);
    this.cells.add(this.key(col, row));
    return true;
  }

  /** Paints an inclusive rectangular run — the shape a hand-authored trunk street is written in. */
  run(col1, row1, col2, row2) {
    for (let row = row1; row <= row2; row += 1) {
      for (let col = col1; col <= col2; col += 1) this.paint(col, row);
    }
    return this;
  }
}

/** The gids a terrain block can paint. Use to build a `harder` set from a palette entry. */
export function blockGids(map, block) {
  const h = block.h ?? 1;
  const w = block.w ?? 1;
  const gids = new Set();
  for (let row = 0; row < h; row += 1) {
    for (let col = 0; col < w; col += 1) gids.add(map.blockGidAt(col, row, block));
  }
  return gids;
}

/**
 * The cell a building is entered from: directly below the centre of its front (ground-contact) row.
 *
 * `MapBuilder.stamp()` already returns `{ col, row, width, height, baseRow }`, so generators only
 * have to stop discarding it. Deriving the door instead of transcribing it is the whole point — a
 * hand-written door coordinate is one more thing that silently stops matching when a building moves
 * or is resized.
 */
export function doorCellOf(stamp) {
  return { col: stamp.col + Math.floor(stamp.width / 2), row: stamp.baseRow + 1 };
}

/**
 * Breadth-first route from `start` to the nearest cell satisfying `isTarget`, over walkable ground.
 *
 * BFS rather than A*: these maps are at most 56x36, so the whole grid is a couple of thousand cells,
 * and BFS's guarantee — fewest steps, and it finds the *nearest* member of a target set for free —
 * is exactly what "run this door to whichever road is closest" wants.
 *
 * @returns {{col:number,row:number}[]|null} the path including `start`, excluding the target cell
 */
export function routeTo(map, start, walkable, isTarget, maxSteps = 80) {
  if (isTarget(start.col, start.row)) return [];
  const key = (c, r) => r * map.width + c;
  const cameFrom = new Map([[key(start.col, start.row), null]]);
  let frontier = [start];
  for (let step = 0; step < maxSteps && frontier.length > 0; step += 1) {
    const next = [];
    for (const cell of frontier) {
      for (const [dc, dr] of [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ]) {
        const col = cell.col + dc;
        const row = cell.row + dr;
        if (!map.inBounds(col, row)) continue;
        const k = key(col, row);
        if (cameFrom.has(k)) continue;
        if (isTarget(col, row)) {
          // Chain back to the start, then reverse. The target cell itself is excluded: it is already
          // road, so re-painting it could overwrite a harder material for no gain.
          const path = [];
          for (let at = cell; at; at = cameFrom.get(key(at.col, at.row))) path.push(at);
          return path.reverse();
        }
        if (!walkable(col, row)) continue;
        cameFrom.set(k, cell);
        next.push({ col, row });
      }
    }
    frontier = next;
  }
  return null;
}

/**
 * Connects every door to the road network, painting a spur for each.
 *
 * Doors are routed nearest-first. That ordering matters: a cluster of houses at the far end of a map
 * grows one shared lane out toward the trunk rather than four parallel ones, because by the time the
 * far houses are routed the near ones have already laid road they can join.
 *
 * @param {RoadNetwork} network
 * @param {object} options
 * @param {{col:number,row:number}[]} options.doors
 * @param {(x:number,y:number)=>boolean} options.isLand  the map's own land mask, in world units
 * @param {(col:number,row:number)=>boolean} [options.avoid] ground a route must not cross at all
 * @returns {{connected:number, unreachable:{col:number,row:number}[]}}
 */
export function connectAll(network, { doors, isLand, avoid, maxSteps = 80 }) {
  const map = network.map;
  // A spur may cross ankle-height scatter (it is simply repainted over) but never a building.
  // `occupied()` covers structures and overlay alike, so a `solid` stamp and a tree canopy both stop
  // a route — which is right for the canopy too: the canopy would draw over the road anyway, and a
  // `base` stamp's trunk carries a collision rect that would block the lane it sat on.
  //
  // `avoid` is for ground a route must not enter even though it is empty and on land. A crop plot's
  // bare beds are the case that needs it: their planted neighbours are `occupied` and so already
  // excluded, but the ~8% left unsown are not, and a spur threading between those would run a road
  // through the middle of somebody's field.
  const walkable = (col, row) =>
    isLand(col + 0.5, row + 0.5) && !map.occupied(col, row) && !avoid?.(col, row);
  const isRoad = (col, row) => network.has(col, row);

  const remaining = doors.filter((door) => map.inBounds(door.col, door.row));
  const unreachable = [];
  let connected = 0;

  while (remaining.length > 0) {
    let best = null;
    for (let i = 0; i < remaining.length; i += 1) {
      const door = remaining[i];
      // A door cell can be unusable: a quayside warehouse whose front row is decking, or a field
      // gate whose inside is the crop bed itself. Nudge to the nearest usable neighbour rather than
      // dropping the building from the network.
      const [col, row] = walkable(door.col, door.row)
        ? [door.col, door.row]
        : map.snapTo(door.col, door.row, walkable, 2);
      if (!walkable(col, row)) continue;
      const path = routeTo(map, { col, row }, walkable, isRoad, maxSteps);
      if (!path) continue;
      if (!best || path.length < best.path.length) best = { index: i, path };
      if (path.length === 0) break; // already on the network; nothing shorter exists
    }
    if (!best) {
      unreachable.push(...remaining);
      break;
    }
    for (const cell of best.path) network.paint(cell.col, cell.row);
    remaining.splice(best.index, 1);
    connected += 1;
  }
  return { connected, unreachable };
}
