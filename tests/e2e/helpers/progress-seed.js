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

// showMainMenu is a runtime-only variable (always true on cold boot), so seeding localStorage
// alone does not skip the landing screen — this walks the two clicks that do.
export async function loadSeededSave(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Student" }).click();
  await page.getByRole("button", { name: "Load Save" }).click();
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
 * no movement the player is against something, so the next one tries the other axis — enough to get
 * around a building without needing a real pathfinder in the test helper.
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

/** Shared body of the two walkers above. See walkToNpc's comment for why it works this way. */
async function walkTo(page, selector, playerId, { steps = 44, burstMs = 320 } = {}) {
  const target = page.locator(selector);
  const isNear = () => target.evaluate((el) => el.classList.contains("is-near"));
  const gap = () =>
    page.evaluate(
      ([sel, id]) => {
        const to = document.querySelector(sel);
        const player = document.getElementById(id);
        if (!to || !player) return null;
        return {
          dx: Number.parseFloat(to.style.left) - Number.parseFloat(player.style.left),
          dy: Number.parseFloat(to.style.top) - Number.parseFloat(player.style.top),
          x: Number.parseFloat(player.style.left),
          y: Number.parseFloat(player.style.top),
        };
      },
      [selector, playerId]
    );

  // Which axis the next burst must use, when the last one was blocked. Both directions have to be
  // forcible: a single `preferVertical` flag only unsticks a blocked *horizontal* burst, because
  // clearing it hands the choice straight back to the "larger gap wins" rule, which picks the blocked
  // axis again whenever that axis is also the longer one. The Preservation Case walk deadlocked on
  // exactly that — pushing north into the west reading nook forever with 1.7 tiles left to go east.
  let forced = null;
  for (let i = 0; i < steps; i += 1) {
    if (await isNear()) return true;
    const before = await gap();
    if (!before) return false;
    const vertical = forced ? forced === "vertical" : Math.abs(before.dy) > Math.abs(before.dx);
    const key = vertical
      ? before.dy > 0
        ? "ArrowDown"
        : "ArrowUp"
      : before.dx > 0
        ? "ArrowRight"
        : "ArrowLeft";
    await holdKey(page, key, burstMs);
    const after = await gap();
    // Blocked: that burst moved the player less than a pixel. Commit to the other axis for one step
    // so the walk slides along the obstacle instead of pushing into it forever.
    const moved = Math.abs(after.x - before.x) + Math.abs(after.y - before.y) > 1;
    forced = moved ? null : vertical ? "horizontal" : "vertical";
  }
  return isNear();
}
