// Shared seeding helpers for the Playwright suite. Mirrors chronicle-progress-store.js's
// storage key/shape (apps/web/src/engine/chronicle-progress-store.js) rather than duplicating
// it — readProgress()'s deep-merge means a seed only needs to name the fields that differ
// from DEFAULT_PROGRESS.
export const PROGRESS_KEY = "republic-builder.chronicle.unit-01.v2";

// A seed object with at least one key makes readProgress() treat this as a returning player
// (hadPriorSave), which auto-resolves progress.tutorial to "complete" unless overridden —
// this is what lets seeded tests skip the post-onboarding guided-tour movement lock without
// naming `tutorial` explicitly every time.
//
// addInitScript re-runs before every navigation in this page, including page.reload() — so it
// only writes the seed if the key is still empty, otherwise a reload mid-test would clobber
// real gameplay writes back to the original seed (breaking save-persistence.spec.js, which
// reloads deliberately to check the app's own save survives).
export async function seedProgress(page, overrides = {}) {
  await page.addInitScript(
    ({ key, data }) => {
      if (window.localStorage.getItem(key) === null) {
        window.localStorage.setItem(key, JSON.stringify(data));
      }
    },
    { key: PROGRESS_KEY, data: overrides }
  );
}

// The cinematic title (titleScreen() in main.js) now sits in front of the Student/Teacher landing
// on every cold boot at "/". Enter (or a click) dismisses it into the landing, unchanged; a dev
// warp (?warp=…) skips it entirely. Any test path that boots at "/" and then reaches for the
// landing has to clear the title first — this is a no-op if the title isn't showing.
export async function beginFromTitle(page) {
  const title = page.locator("#titleStage");
  if (!(await title.isVisible().catch(() => false))) return;
  await page.keyboard.press("Enter");
  await title.waitFor({ state: "detached" }).catch(() => {});
}

// The Codex reveal (briefing 02/02, second line) opens a full-screen veil over .director-scene at
// z-index 20, so it covers the dialogue box. Any loop that walks the intro by clicking that box has
// to clear the veil first, or Playwright's actionability check retries against the intercepting
// element until the 30s timeout — a hang, not a clean failure. Returns true if it dismissed one.
export async function dismissCodexVeil(page) {
  const veil = page.locator("#directorCodexVeil");
  if (!(await veil.isVisible().catch(() => false))) return false;
  await veil.click();
  await veil.waitFor({ state: "detached" }).catch(() => {});
  return true;
}

// The walk from a freshly loaded page into the seeded save: past the title, then the two clicks.
async function enterSavedGame(page) {
  await beginFromTitle(page);
  await page.getByRole("button", { name: "Student" }).click();
  await page.getByRole("button", { name: "Load Save" }).click();
}

// showMainMenu is a runtime-only variable (always true on cold boot), so seeding localStorage
// alone does not skip the landing screen — this clears the title, then walks the two clicks that do.
export async function loadSeededSave(page) {
  await page.goto("/");
  await enterSavedGame(page);
}

// page.reload() re-runs module scope, so `showMainMenu` resets *and* the title re-arms — a reload
// lands back at the very top of the app, not in the game. Eight specs walked those steps by hand,
// and all eight missed the title the day it shipped. This is that walk, written once.
export async function reloadIntoSave(page) {
  await page.reload();
  await enterSavedGame(page);
}

/**
 * A `sourceActivities` entry for a record whose Mission Instructions screen has already been
 * cleared.
 *
 * Since Phase 71 an activity opens on that screen the first time, so any test that seeds its way
 * straight onto a board has to say it has been past it. `ensureSourceActivity()` fills in `state`
 * from the engine's own default, so the flag on its own is enough — merge extra keys in where a
 * test also needs seeded engine state.
 */
export const briefed = (...sourceIds) =>
  Object.fromEntries(sourceIds.map((id) => [id, { briefed: true }]));

/**
 * Clears the Mission Instructions screen, if this record is opening on it.
 *
 * Since Phase 71 a record shows its instructions once before its board, gated on a `briefed` flag
 * on that record's `progress.sourceActivities` entry. A spec seeding that entry can simply write
 * `briefed: true` and skip the screen; a spec that walks up to a record cold cannot, because the
 * entry does not exist until the activity starts. This is for the second kind, and it is a no-op
 * for the first — so it is safe to call on any path into an activity.
 */
export async function beginMission(page) {
  const begin = page.locator('[data-action="mission-briefed"]');
  if (await begin.isVisible().catch(() => false)) await begin.click();
}

export async function readProgress(page) {
  return page.evaluate(
    (key) => JSON.parse(window.localStorage.getItem(key) || "null"),
    PROGRESS_KEY
  );
}

// Holds a key down for a duration (keeping it in the app's held-key Set, which its
// requestAnimationFrame movement loops read every frame) rather than a single tap.
export async function holdKey(page, key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

/**
 * Walks the field player until a named NPC is within interaction reach, and returns whether it got
 * there.
 *
 * Why this exists rather than a timed hold. Movement advances per animation frame, so a fixed
 * `holdKey(page, "ArrowUp", 2900)` covers a different distance depending on how loaded the machine
 * is — which is why the two field specs that timed their walks were this suite's only intermittent
 * failures, passing serially and failing under six parallel workers. It also cannot survive the map
 * changing: the Taíno village walk broke outright once its records moved onto the people holding
 * them, because "roughly 11 tiles north" stopped being close enough to anyone.
 *
 * So this reads both positions out of the DOM each step and moves along whichever axis has the
 * larger gap, in short bursts, until the game's own `.is-near` class appears. When a burst produces
 * no movement the player is against something, so the next few commit to the other axis — enough to
 * get around a building without needing a real pathfinder in the test helper. See `walkTo` below for
 * why "the next few" and not "the next one".
 */
export async function walkToNpc(page, npcId, options = {}) {
  return walkTo(page, `[data-npc="${npcId}"]`, "caseFieldPlayer", options);
}

/**
 * The Main Hall / Archive Room equivalent, keyed on a HUB_TARGETS id.
 *
 * Same reason as walkToNpc: the two timed holds this replaced encoded one specific furniture layout
 * ("east until the record chest stops you at x=18.72, then north until the table stops you at
 * y=7.06"). Phase 58 opened the south aisle end to end so nothing stops the player at 18.72 any
 * more, and both assertions broke — while the thing they were checking, that the table is
 * proximity-gated and opens, was working fine. Walking until the game's own `.is-near` appears
 * survives the next re-lay too.
 */
export async function walkToHubTarget(page, targetId, options = {}) {
  return walkTo(page, `[data-hub-target="${targetId}"]`, "institutePlayer", options);
}

/**
 * The same walk, but toward a person rather than a piece of furniture.
 *
 * `[data-hub-npc]` and `[data-hub-target]` are deliberately different attributes — a person is not
 * furniture, and only the latter carries a sized marker rect — so they need separate selectors. Both
 * get `.is-near` from updateHubProximityUi(), which is what this waits for.
 */
export async function walkToHubNpc(page, npcId, options = {}) {
  return walkTo(page, `[data-hub-npc="${npcId}"]`, "institutePlayer", options);
}

// Both grids are 48px, and the walker only ever divides by it to talk in tiles.
const TILE_PX = 48;
// FIELD_SPEED and HUB_SPEED, which are the same number.
const TILES_PER_SECOND = 3.65;
// Close enough to a corner to turn at it. Under a third of a tile, well inside every reach radius.
const ARRIVE_TILES = 0.3;

/**
 * Shared body of the walkers above. It reads the room's walls out of the running game and walks a
 * breadth-first route through them.
 *
 * **This used to steer greedily, and that was the bug** rather than a tuning problem. The old rule
 * moved along whichever axis had the larger gap and, when a burst was blocked, committed to the
 * perpendicular axis for a few bursts — enough to get round a building, never enough to find a gate
 * on the far side of a barrier. Two spec files still carry their own `nudgeTo` because of it.
 *
 * Phase 93 measured what that cost. The clamp in `runFieldMovementLoop()` — `Math.min(48, …)`,
 * deliberate, so a stalled frame cannot teleport the player through a wall — makes in-game progress
 * frame-denominated while every deadline here is wall-clock-denominated, so under six parallel
 * workers a 320ms burst covered between a third and two thirds of its ground. That slowness was
 * *hiding* this: a player crawling into an obstacle drifts round it, and a player arriving at full
 * speed stops dead against it. The moment the suite got fast enough to be worth capping the workers
 * at two, the longest walk in it failed every attempt, deterministically, through four retries — and
 * the four repairs tried on the slide are recorded in decision log `0092` §5, including the one that
 * fixed that walk and broke five other specs by burning the clock instead of stalling out.
 *
 * So the walker is given the walls. `window.__chronicleNav` — dev-only in `main.js`, gated exactly as
 * `?warp=` is — samples the game's own `isFieldBlocked` / `isHubBlocked` across the active grid on a
 * half-tile lattice. This floods that breadth-first from the player, picks the reachable cell closest
 * to the target (the target's own cell is usually solid, because a body is solid), and walks the
 * corners of the route. **The route is only a snapshot**: it includes the other bodies, because both
 * predicates do, so a patrolling NPC can invalidate it by walking. A leg that stops making progress
 * therefore re-plans rather than shoves, up to `maxReplans`.
 *
 * What did not change: it still stops the moment the game's own `.is-near` appears, so it survives
 * the map moving underneath it, and it still returns whether it got there rather than asserting.
 *
 * The probe is required, not optional. If it goes missing every walking spec fails at once with the
 * same message naming the cause — far better than twenty specs each timing out somewhere different.
 * The e2e webServer is the Vite dev server, since nine spec files use `?warp=`, so it is there.
 */
export async function walkTo(
  page,
  selector,
  playerId,
  { burstMs = 700, timeoutMs = 20_000, maxReplans = 8 } = {}
) {
  const surface = playerId === "caseFieldPlayer" ? "field" : "hub";
  const target = page.locator(selector);
  const isNear = () => target.evaluate((el) => el.classList.contains("is-near"));
  const deadline = Date.now() + timeoutMs;

  // One round trip per burst rather than three: whether we have arrived and where we are are the
  // same question, asked of the same frame.
  const step = () =>
    page.evaluate(
      ([sel, id, tile]) => {
        const el = document.querySelector(sel);
        const player = document.getElementById(id);
        if (!el || !player) return null;
        // Sized or not, told apart per axis, and derived the same way planRoute() derives the goal
        // — a marker is a rect positioned by its top-left corner, a body is a point.
        const number = (value) => {
          const parsed = Number.parseFloat(value);
          return Number.isFinite(parsed) ? parsed : null;
        };
        const left = number(el.style.left) ?? el.offsetLeft;
        const top = number(el.style.top) ?? el.offsetTop;
        const width = number(el.style.width);
        const height = number(el.style.height);
        return {
          near: el.classList.contains("is-near"),
          x: (number(player.style.left) ?? 0) / tile,
          y: (number(player.style.top) ?? 0) / tile,
          // Where the target is *now*, which for a patrolling NPC is not where it was planned.
          tx: (width === null ? left : left + width / 2) / tile,
          ty: (height === null ? top : top + height / 2) / tile,
        };
      },
      [selector, playerId, TILE_PX]
    );

  for (let replan = 0; replan <= maxReplans; replan += 1) {
    if (Date.now() > deadline) return isNear();
    if (await isNear()) return true;
    const route = await planRoute(page, surface, selector);
    if (route.error === "no-probe") {
      throw new Error(
        "walkTo needs window.__chronicleNav, which main.js installs behind import.meta.env.DEV. " +
          "The e2e webServer must be the Vite dev server."
      );
    }
    // No target, no position, or the player sealed inside something: nothing to walk toward.
    if (route.error) return false;

    // Re-plan, rather than walk on, once the target has left the position the route was drawn
    // against. The old walker re-read the target every burst and so tracked a patrol for free; a
    // route is planned once, and `settlement-carpenter` walks half a map between plans. Generous,
    // because a route is not wrong until the target is properly elsewhere — and cheap either way,
    // since `.is-near` ends the walk the moment it fires.
    const drifted = (at) =>
      route.goal && Math.hypot(at.tx - route.goal.x, at.ty - route.goal.y) > 1.2;

    let stranded = false;
    for (const waypoint of route.waypoints) {
      let blocked = 0;
      for (;;) {
        if (Date.now() > deadline) return isNear();
        const at = await step();
        if (!at) return false;
        if (at.near) return true;
        if (drifted(at)) {
          stranded = true;
          break;
        }
        const dx = waypoint.x - at.x;
        const dy = waypoint.y - at.y;
        // Legs are axis-aligned by construction, so in practice this is one axis. It is written as a
        // choice anyway because the player starts mid-cell, off the lattice the route is drawn on.
        const horizontal = Math.abs(dx) >= Math.abs(dy);
        const delta = horizontal ? dx : dy;
        if (Math.abs(delta) <= ARRIVE_TILES) break;
        const key = horizontal
          ? delta > 0
            ? "ArrowRight"
            : "ArrowLeft"
          : delta > 0
            ? "ArrowDown"
            : "ArrowUp";
        // Sized to the distance left, then capped. A leg runs through cells the probe said were
        // free, so a long hold is safe here in a way it never was for the old slide, and it cannot
        // overshoot: FIELD_SPEED is a ceiling and the frame clamp only ever makes a burst cover less.
        await holdKey(
          page,
          key,
          Math.max(70, Math.min(burstMs, Math.round((Math.abs(delta) / TILES_PER_SECOND) * 1000)))
        );
        const after = await step();
        if (!after) return false;
        if (after.near) return true;
        const moved = Math.abs(after.x - at.x) + Math.abs(after.y - at.y) > 0.03;
        blocked = moved ? 0 : blocked + 1;
        // Something is standing where the snapshot said floor. Ask again rather than shove.
        if (blocked >= 2) {
          stranded = true;
          break;
        }
      }
      if (stranded) break;
    }
    // Walking the whole route without `.is-near` firing is not a failure either: the closest
    // reachable cell to a target standing behind a rail can be outside its reach, and by the time we
    // arrive the target may have moved. Ask again, until the replan budget or the clock says stop.
    if (await isNear()) return true;
  }
  return isNear();
}

/**
 * Breadth-first over the collision snapshot, run entirely inside the page so the 8,000-cell sample
 * never crosses the wire — what comes back is a handful of corners.
 *
 * The goal is derived exactly the way the old walker derived it, and for the same reason: most world
 * nodes are positioned by a centre point, so their inline `left`/`top` *is* the point, while a hub
 * object marker is a rect laid over the object's own tiles and positioned by its top-left corner, so
 * its centre has to be worked out. Steering at the corner walked the player off to the side of the
 * Archive Room's doorway and into the wall.
 */
async function planRoute(page, surface, selector) {
  return page.evaluate(
    ([surf, sel]) => {
      const probe = window.__chronicleNav;
      if (typeof probe !== "function") return { error: "no-probe" };
      const el = document.querySelector(sel);
      if (!el) return { error: "no-target" };
      const nav = probe(surf);
      const num = (value) => {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
      };
      const left = num(el.style.left) ?? el.offsetLeft;
      const top = num(el.style.top) ?? el.offsetTop;
      const width = num(el.style.width);
      const height = num(el.style.height);
      const goal = {
        x: (width === null ? left : left + width / 2) / nav.tile,
        y: (height === null ? top : top + height / 2) / nav.tile,
      };

      const { step, cols, rows, cells } = nav;
      const index = (col, row) => row * cols + col;
      const clampCol = (col) => Math.max(0, Math.min(cols - 1, col));
      const clampRow = (row) => Math.max(0, Math.min(rows - 1, row));
      let startCol = clampCol(Math.round(nav.at.x / step));
      let startRow = clampRow(Math.round(nav.at.y / step));
      // The player's own cell can read blocked: the lattice rounds, and both predicates ask about a
      // foot box rather than a point. Start from the nearest cell that does not, within two tiles.
      if (cells[index(startCol, startRow)]) {
        const span = Math.round(2 / step);
        let best = null;
        for (let dr = -span; dr <= span; dr += 1) {
          for (let dc = -span; dc <= span; dc += 1) {
            const col = clampCol(startCol + dc);
            const row = clampRow(startRow + dr);
            if (cells[index(col, row)]) continue;
            const distance = dc * dc + dr * dr;
            if (!best || distance < best.distance) best = { col, row, distance };
          }
        }
        if (!best) return { error: "boxed-in" };
        startCol = best.col;
        startRow = best.row;
      }

      const start = index(startCol, startRow);
      const previous = new Int32Array(cols * rows).fill(-1);
      const seen = new Uint8Array(cols * rows);
      const queue = [start];
      seen[start] = 1;
      const score = (col, row) => {
        const dx = col * step - goal.x;
        const dy = row * step - goal.y;
        return dx * dx + dy * dy;
      };
      let bestCell = start;
      let bestScore = score(startCol, startRow);
      for (let head = 0; head < queue.length; head += 1) {
        const cell = queue[head];
        const col = cell % cols;
        const row = (cell - col) / cols;
        const distance = score(col, row);
        if (distance < bestScore) {
          bestScore = distance;
          bestCell = cell;
        }
        const neighbours = [
          [col + 1, row],
          [col - 1, row],
          [col, row + 1],
          [col, row - 1],
        ];
        for (const [nextCol, nextRow] of neighbours) {
          if (nextCol < 0 || nextRow < 0 || nextCol >= cols || nextRow >= rows) continue;
          const next = index(nextCol, nextRow);
          if (seen[next] || cells[next]) continue;
          seen[next] = 1;
          previous[next] = cell;
          queue.push(next);
        }
      }

      const path = [];
      for (let cell = bestCell; cell !== -1; cell = previous[cell]) path.push(cell);
      path.reverse();
      const points = path.map((cell) => {
        const col = cell % cols;
        return { x: col * step, y: ((cell - col) / cols) * step };
      });
      // Only the corners are worth walking to; the cells between two of them are a straight line.
      const waypoints = [];
      for (let i = 1; i < points.length; i += 1) {
        const ahead = points[i + 1];
        if (!ahead) {
          waypoints.push(points[i]);
          break;
        }
        const turned =
          Math.sign(points[i].x - points[i - 1].x) !== Math.sign(ahead.x - points[i].x) ||
          Math.sign(points[i].y - points[i - 1].y) !== Math.sign(ahead.y - points[i].y);
        if (turned) waypoints.push(points[i]);
      }
      return { waypoints, goal };
    },
    [surface, selector]
  );
}
