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
export async function walkToNpc(page, npcId, { steps = 44, burstMs = 320 } = {}) {
  const npc = page.locator(`[data-npc="${npcId}"]`);
  const isNear = () => npc.evaluate((el) => el.classList.contains("is-near"));
  const gap = () =>
    page.evaluate((id) => {
      const target = document.querySelector(`[data-npc="${id}"]`);
      const player = document.getElementById("caseFieldPlayer");
      if (!target || !player) return null;
      return {
        dx: Number.parseFloat(target.style.left) - Number.parseFloat(player.style.left),
        dy: Number.parseFloat(target.style.top) - Number.parseFloat(player.style.top),
        x: Number.parseFloat(player.style.left),
        y: Number.parseFloat(player.style.top),
      };
    }, npcId);

  let preferVertical = false;
  for (let i = 0; i < steps; i += 1) {
    if (await isNear()) return true;
    const before = await gap();
    if (!before) return false;
    const vertical = preferVertical || Math.abs(before.dy) > Math.abs(before.dx);
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
    preferVertical = moved ? false : !vertical;
  }
  return isNear();
}
