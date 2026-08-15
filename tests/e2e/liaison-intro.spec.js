// Scene A — the Field Liaison introduction, and the scripted-scene runner underneath it.
//
// The interpreter's own sequencing is unit-tested in tests/unit/cutscene.test.js. What can only be
// checked in a browser is the half CUTSCENE-AND-DIALOGUE-CONVENTIONS.md §4 puts on the host: that
// the one input lock actually engages, that the "Press E" prompt goes with it, that skip and
// natural completion run the same teardown, and that a reload mid-scene does not resume into a
// locked player with no way out. §4 records that each of those has broken at least once.

import { test, expect } from "@playwright/test";

import { seedProgress, loadSeededSave, reloadIntoSave } from "./helpers/progress-seed.js";

/** One click short of the tour ending, which is the beat Scene A hands off from. */
async function seedAtLastTourStep(page) {
  await seedProgress(page, {
    currentScreen: "institute",
    currentHubRoom: "main",
    tutorial: { step: "tour-trophy", completed: false, skipped: false },
    story: { liaisonTrust: 0, flags: {} },
  });
  await loadSeededSave(page);
  await expect(page.locator("#instituteMap")).toBeVisible();
}

async function finishTour(page) {
  await page.getByRole("button", { name: /Got it/ }).click();
}

const sceneBar = (page) => page.locator('[data-action="hub-scene-click"]');
const sceneLine = (page) => page.locator("#hubSceneLine");
const playerStyle = (page) =>
  page.evaluate(() => document.getElementById("institutePlayer")?.style.cssText);

/**
 * Holds a direction long enough for the movement loop to cover ground.
 *
 * `keyboard.press()` is a down and an immediate up, which adds a key to `hubHeldKeys` and removes
 * it before a single frame runs — so it moves nobody, and a lock test written on it would pass
 * whether the lock worked or not.
 */
async function walk(page, key = "ArrowLeft", ms = 260) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
  await page.waitForTimeout(40);
}

/** A reload lands on the landing screen — `showMainMenu` is runtime-only — so it takes two clicks. */
async function reenterAfterReload(page) {
  await reloadIntoSave(page);
  await expect(page.locator("#instituteMap")).toBeVisible();
}

test.describe("Scene A — Emery Voss's introduction", () => {
  test("hands off the tour's last beat and opens on Voss speaking", async ({ page }) => {
    await seedAtLastTourStep(page);
    await finishTour(page);

    await expect(sceneBar(page)).toBeVisible();
    await expect(page.locator("#hubSceneName")).toHaveText("Emery Voss");
    // THE-FIELD-LIAISON.md §4: Voss debuts strictly after the Director has finished, so the tour
    // must be complete by the time this bar is up.
    await expect(page.locator(".tour-callout, .hub-dialogue")).toHaveCount(0);
  });

  test("owns the room while it runs — no movement, no interact prompt", async ({ page }) => {
    await seedAtLastTourStep(page);
    await finishTour(page);
    await expect(sceneBar(page)).toBeVisible();

    const before = await playerStyle(page);
    await walk(page);
    expect(await playerStyle(page), "the player moved during a scripted scene").toBe(before);

    // §4 teardown rule 2 in its live form: anything that locks movement must also suppress the
    // prompt, or it hangs there offering an interaction that is already happening.
    await expect(page.locator("#hubInteractPrompt")).toBeHidden();
  });

  test("skip runs the same teardown as watching it through", async ({ page }) => {
    await seedAtLastTourStep(page);
    await finishTour(page);
    await expect(sceneBar(page)).toBeVisible();

    await page.getByRole("button", { name: "Skip scene" }).click();

    // Gone, control back, flag written — the three things a half-torn-down scene gets wrong.
    await expect(sceneBar(page)).toHaveCount(0);
    await expect(page.locator("#instituteMap")).toBeVisible();
    const flags = await page.evaluate(() => {
      const raw = window.localStorage.getItem("republic-builder.chronicle.unit-01.v2");
      return JSON.parse(raw || "{}").story?.flags || {};
    });
    expect(flags.metLiaison, "the scene's flag was not persisted on skip").toBe(true);

    // And the player can actually move again, which is the thing the flag alone does not prove.
    const before = await playerStyle(page);
    await walk(page);
    expect(await playerStyle(page), "the player is still locked after a skipped scene").not.toBe(
      before
    );
  });

  test("Escape skips it too", async ({ page }) => {
    await seedAtLastTourStep(page);
    await finishTour(page);
    await expect(sceneBar(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sceneBar(page)).toHaveCount(0);
  });

  test("advances a line at a time, and does not replay once seen", async ({ page }) => {
    await seedAtLastTourStep(page);
    await finishTour(page);
    await expect(sceneBar(page)).toBeVisible();
    const first = await sceneLine(page).textContent();

    // Two presses per line: the first completes the typewriter, the second advances.
    for (let i = 0; i < 4; i += 1) {
      await page.keyboard.press("e");
      await page.waitForTimeout(60);
    }
    await expect(sceneLine(page)).not.toHaveText(first || "");

    await page.getByRole("button", { name: "Skip scene" }).click();
    await expect(sceneBar(page)).toHaveCount(0);

    // A one-shot scene stays shot. The flag is read before the scene starts, so a reload into the
    // same room must not open it again.
    await reenterAfterReload(page);
    await expect(sceneBar(page)).toHaveCount(0);
  });

  test("a reload mid-scene does not strand the player", async ({ page }) => {
    // The Entrance Hall's answer to this is to replay its scene from the top rather than resume
    // into a locked body; a scene that has already written its flag simply does not reopen. Either
    // is fine. What is not fine is a locked player with no scene on screen.
    await seedAtLastTourStep(page);
    await finishTour(page);
    await expect(sceneBar(page)).toBeVisible();

    await reenterAfterReload(page);

    if ((await sceneBar(page).count()) === 0) {
      const before = await playerStyle(page);
      await walk(page);
      expect(
        await playerStyle(page),
        "reload left the player locked with no scene running"
      ).not.toBe(before);
    }
  });
});
