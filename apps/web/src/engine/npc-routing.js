// How an NPC gets from one place it has business being to the next.
//
// Pure and DOM-free, like geometry.js and npc-behaviour.js: this owns the search, the caller owns
// the map. A caller hands over a `isStandable(x, y)` predicate and the map's road cells, and gets
// back a list of waypoints. It never touches collision at walk time — npc-behaviour.js still gates
// every individual step through the live predicate, so a stale route degrades into "this person
// stopped and picked somewhere else", never into "this person walked into a wall".
//
// ## Why a search and not authored waypoints
//
// Phase 61 deleted 21 hand-written four-waypoint patrol rectangles because each waypoint had to be
// individually validated against the map and a unit test existed solely to catch the ones that
// were not. Bounded wander replaced them and needed no coordinates at all — but a random point in
// a disc is nobody doing anything, and the playtest note was exactly that: the goodwife should walk
// the road to market, the carpenter should go between the barn and the farm stores.
//
// So a route is authored as *destinations* — two or three places that mean something — and the way
// between them is found. That keeps the property that made wander safe (no hand-checked geometry)
// while giving each person a reason to be where they are.
//
// ## Why road cells cost less
//
// A straight search would send the goodwife diagonally across the crop beds, because nothing in
// collision says a field is a bad place to walk: crops carry no collision on purpose, so the player
// can walk the rows. Costing a road cell a quarter of open ground makes the road the cheap way
// round without making off-road impossible — a route still exists on the Institute's floors and on
// the Caribbean beach, neither of which has a road network at all.

/** Cost of entering a cell. The ratio is what matters: a road detour up to 4x longer still wins. */
export const ROUTE_COST = Object.freeze({ road: 1, ground: 4 });

/** The four orthogonal steps the search may take. Diagonals are handled by simplify(), below. */
const STEPS = [
  [0, -1],
  [-1, 0],
  [1, 0],
  [0, 1],
];

/**
 * A map's static walkability plus its road cells, in the form the search wants.
 *
 * Static is load-bearing: the player and the other NPCs are deliberately NOT baked in here. A route
 * is computed once when a map loads and reused for the rest of the visit, so folding in anything
 * that moves would freeze one frame's arrangement of people into a permanent obstacle.
 *
 * The one exception to "nothing that moves" is a person who doesn't. A stationed NPC stands on the
 * same cell all game, so to everyone else they are furniture, and leaving them out of the grid
 * produced a real defect: Riverbend's burgess was routed straight down the village spine through
 * the minister's post, spent half his time blocked against him, and never once reached the south
 * end of his own beat. Measured in the browser he covered 4 x 0.3 tiles of a 9.5-tile circuit.
 *
 * @param {object} options
 * @param {number} options.columns
 * @param {number} options.rows
 * @param {(x:number, y:number) => boolean} options.isStandable  world coords of a cell's centre
 * @param {Array<[number, number]>} [options.roads]  `[col, row]` pairs, as the generators emit them
 * @param {Array<{x:number, y:number}>} [options.occupied]  world points nobody may route through
 */
export function createNavGrid({ columns, rows, isStandable, roads = [], occupied = [] }) {
  const open = new Uint8Array(columns * rows);
  const road = new Uint8Array(columns * rows);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      open[row * columns + col] = isStandable(col + 0.5, row + 0.5) ? 1 : 0;
    }
  }
  // Closed after the sweep, not inside it, so a caller cannot accidentally make a post unstandable
  // for the person standing on it — `open` is only ever read by the router.
  for (const point of occupied) {
    const col = Math.floor(point.x);
    const row = Math.floor(point.y);
    if (col >= 0 && row >= 0 && col < columns && row < rows) open[row * columns + col] = 0;
  }
  for (const [col, row] of roads) {
    if (col >= 0 && row >= 0 && col < columns && row < rows) road[row * columns + col] = 1;
  }
  return { columns, rows, open, road };
}

const indexOf = (grid, col, row) => row * grid.columns + col;
const inBounds = (grid, col, row) => col >= 0 && row >= 0 && col < grid.columns && row < grid.rows;

/** Whether a cell is walkable. Exported for the coordinate tests, which assert stops land on one. */
export function isOpenCell(grid, col, row) {
  return inBounds(grid, col, row) && grid.open[indexOf(grid, col, row)] === 1;
}

export function isRoadCell(grid, col, row) {
  return inBounds(grid, col, row) && grid.road[indexOf(grid, col, row)] === 1;
}

/**
 * The nearest open cell to a world position, searched outward in rings.
 *
 * A post is authored as a place a person stands, not as a cell index, so it can land a few tenths
 * of a tile inside a stamp's footprint and still be a perfectly good description of where someone
 * is. Snapping beats failing: the alternative is a route that silently does not exist because a
 * destination was written as 41.0 rather than 41.5.
 */
export function snapToOpen(grid, x, y, maxRings = 4) {
  const col = Math.floor(x);
  const row = Math.floor(y);
  if (isOpenCell(grid, col, row)) return { col, row };
  for (let ring = 1; ring <= maxRings; ring += 1) {
    let best = null;
    let bestDistance = Infinity;
    for (let dRow = -ring; dRow <= ring; dRow += 1) {
      for (let dCol = -ring; dCol <= ring; dCol += 1) {
        if (Math.max(Math.abs(dRow), Math.abs(dCol)) !== ring) continue;
        if (!isOpenCell(grid, col + dCol, row + dRow)) continue;
        const distance = Math.hypot(col + dCol + 0.5 - x, row + dRow + 0.5 - y);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = { col: col + dCol, row: row + dRow };
        }
      }
    }
    if (best) return best;
  }
  return null;
}

/**
 * A minimal binary heap. Node's standard library has no priority queue, and the alternative —
 * re-sorting an array on every push — turns a 2,000-cell search into a measurable pause at map load
 * on the largest map.
 */
function createHeap() {
  const items = [];
  return {
    get size() {
      return items.length;
    },
    push(node, priority) {
      items.push({ node, priority });
      let index = items.length - 1;
      while (index > 0) {
        const parent = (index - 1) >> 1;
        if (items[parent].priority <= items[index].priority) break;
        [items[parent], items[index]] = [items[index], items[parent]];
        index = parent;
      }
    },
    pop() {
      const top = items[0];
      const last = items.pop();
      if (items.length > 0) {
        items[0] = last;
        let index = 0;
        for (;;) {
          const left = index * 2 + 1;
          const right = left + 1;
          let smallest = index;
          if (left < items.length && items[left].priority < items[smallest].priority)
            smallest = left;
          if (right < items.length && items[right].priority < items[smallest].priority)
            smallest = right;
          if (smallest === index) break;
          [items[smallest], items[index]] = [items[index], items[smallest]];
          index = smallest;
        }
      }
      return top.node;
    },
  };
}

/**
 * Every cell the straight line between two cell centres touches — a supercover, not a sample.
 *
 * The distinction is the bug this replaced. Sampling the line at one point per cell of its longer
 * axis skips cells a shallow diagonal only clips, so `simplify()` would collapse a staircase into a
 * leg that shaves a blocked corner. That degrades safely at runtime (the step is refused and the
 * NPC waits) but it is still a route through a wall, and the unit test that walks the waypoints at
 * eight samples per tile catches exactly what the four-sample version missed.
 *
 * Standard grid traversal, plus the supercover clause: where the line crosses a corner exactly, both
 * cells sharing that corner are included rather than one arbitrarily.
 */
function cellsOnLine(fromCol, fromRow, toCol, toRow) {
  if (fromCol === toCol && fromRow === toRow) return [[fromCol, fromRow]];
  const dCol = toCol - fromCol;
  const dRow = toRow - fromRow;
  const stepCol = Math.sign(dCol);
  const stepRow = Math.sign(dRow);
  const deltaCol = dCol === 0 ? Infinity : Math.abs(1 / dCol);
  const deltaRow = dRow === 0 ? Infinity : Math.abs(1 / dRow);
  let nextCol = deltaCol / 2;
  let nextRow = deltaRow / 2;
  let col = fromCol;
  let row = fromRow;
  const cells = [[col, row]];
  // The bound is a guard against a non-terminating traversal on a degenerate input, not a limit
  // anything real reaches: the largest map is 56x36, so the longest possible line is ~92 cells.
  for (let guard = 0; guard < 512 && (col !== toCol || row !== toRow); guard += 1) {
    if (Math.abs(nextCol - nextRow) < 1e-9 && stepCol !== 0 && stepRow !== 0) {
      cells.push([col + stepCol, row], [col, row + stepRow]);
      nextCol += deltaCol;
      nextRow += deltaRow;
      col += stepCol;
      row += stepRow;
    } else if (nextCol < nextRow) {
      nextCol += deltaCol;
      col += stepCol;
    } else {
      nextRow += deltaRow;
      row += stepRow;
    }
    cells.push([col, row]);
  }
  return cells;
}

/**
 * Collapses a cell-by-cell path into the fewest waypoints that walk the same ground.
 *
 * Without this, a 4-connected path is a staircase and an NPC walking it visibly zigzags one tile at
 * a time. With it, the same path becomes two or three long legs walked diagonally where the ground
 * is open, which is how a person crosses a yard.
 *
 * The road clause is the reason this is not the textbook string-pull: shortcutting off a road onto
 * the grass beside it is precisely the behaviour the road costing exists to prevent, and the search
 * having chosen the road is worth nothing if the simplifier then straightens it away.
 *
 * So the rule is asymmetric on purpose — a stretch that used any road may only be replaced by a
 * straight line that is *entirely* road. Testing the endpoints instead is not enough: the carpenter
 * starts a tile off the barn spur, so with an endpoint test his whole seven-tile walk down it
 * collapsed into one diagonal running alongside the road rather than on it.
 */
function simplify(grid, path) {
  if (path.length <= 2) return path;
  const kept = [path[0]];
  let anchor = 0;
  for (let index = 2; index < path.length; index += 1) {
    const [aCol, aRow] = path[anchor];
    const [cCol, cRow] = path[index];
    const usedRoad = path.slice(anchor, index + 1).some(([col, row]) => isRoadCell(grid, col, row));
    const clear = cellsOnLine(aCol, aRow, cCol, cRow).every(
      ([col, row]) => isOpenCell(grid, col, row) && (!usedRoad || isRoadCell(grid, col, row))
    );
    if (!clear) {
      kept.push(path[index - 1]);
      anchor = index - 1;
    }
  }
  kept.push(path[path.length - 1]);
  return kept;
}

/**
 * The cheapest walk from one world position to another, as waypoints in world coordinates.
 *
 * @returns {{x:number, y:number}[]|null} waypoints excluding the start, or null if there is no way
 */
export function findRoute(grid, from, to) {
  const start = snapToOpen(grid, from.x, from.y);
  const goal = snapToOpen(grid, to.x, to.y);
  if (!start || !goal) return null;
  if (start.col === goal.col && start.row === goal.row) return [];

  const size = grid.columns * grid.rows;
  const cost = new Float64Array(size).fill(Infinity);
  const cameFrom = new Int32Array(size).fill(-1);
  const settled = new Uint8Array(size);
  const startIndex = indexOf(grid, start.col, start.row);
  const goalIndex = indexOf(grid, goal.col, goal.row);
  cost[startIndex] = 0;

  const heap = createHeap();
  heap.push(startIndex, 0);
  while (heap.size > 0) {
    const current = heap.pop();
    if (settled[current]) continue;
    settled[current] = 1;
    if (current === goalIndex) break;
    const col = current % grid.columns;
    const row = (current - col) / grid.columns;
    for (const [dCol, dRow] of STEPS) {
      const nextCol = col + dCol;
      const nextRow = row + dRow;
      if (!isOpenCell(grid, nextCol, nextRow)) continue;
      const next = indexOf(grid, nextCol, nextRow);
      if (settled[next]) continue;
      const step = grid.road[next] ? ROUTE_COST.road : ROUTE_COST.ground;
      const candidate = cost[current] + step;
      if (candidate >= cost[next]) continue;
      cost[next] = candidate;
      cameFrom[next] = current;
      heap.push(next, candidate);
    }
  }
  if (!settled[goalIndex]) return null;

  const path = [];
  for (let index = goalIndex; index !== -1; index = cameFrom[index]) {
    const col = index % grid.columns;
    path.push([col, (index - col) / grid.columns]);
  }
  path.reverse();
  return simplify(grid, path)
    .slice(1)
    .map(([col, row]) => ({ x: col + 0.5, y: row + 0.5 }));
}

/**
 * A closed circuit through a list of stops: out along the chain and back down it.
 *
 * Waypoints carry `stop: true` where the person has actually arrived somewhere, which is what
 * npc-behaviour.js pauses at. Everything between two stops is just road being covered, and pausing
 * there is what made the settlement read as a crowd of people repeatedly changing their minds.
 *
 * A stop that cannot be reached is dropped rather than failing the whole circuit: losing one leg of
 * a carpenter's round trip is a smaller defect than a carpenter who never moves, and the coordinate
 * test asserts none of the authored stops is in that state anyway.
 *
 * @returns {{x:number, y:number, stop?:boolean}[]} may be empty if no leg is walkable
 */
export function buildCircuit(grid, stops) {
  const legs = [];
  const ordered = [...stops, ...stops.slice(1, -1).reverse()];
  for (let index = 0; index < ordered.length; index += 1) {
    const from = ordered[index];
    const to = ordered[(index + 1) % ordered.length];
    const route = findRoute(grid, from, to);
    if (!route || route.length === 0) continue;
    for (const point of route.slice(0, -1)) legs.push({ x: point.x, y: point.y });
    const arrival = route[route.length - 1];
    legs.push({ x: arrival.x, y: arrival.y, stop: true });
  }
  return legs;
}
