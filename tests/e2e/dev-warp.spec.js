// `?warp=<name>` — dev-only fast travel into a named save state (main.js's DEV_WARPS).
//
// Built in Part 0 of the playtest program (docs/playtest/PLAYTHROUGH-LEDGER.md) so a review pass can
// start where it starts. Guarded here because every later review script depends on it and a warp
// that silently stopped landing where it says would look like a defect in whatever part was being
// reviewed — the most expensive kind of broken tool.
//
// Not a check that the destinations are *correct* for review purposes; that is the part's own job.
// It checks that each name lands somewhere, and that an unknown one changes nothing.
import { expect, test } from "@playwright/test";
import { readProgress, beginFromTitle } from "./helpers/progress-seed.js";

test.describe("Dev warp", () => {
  test("drops straight onto the field, past the landing screen", async ({ page }) => {
    await page.goto("/?warp=field");
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();
    await expect(page.locator(".field-tracker")).toBeVisible();

    const saved = await readProgress(page);
    expect(saved.currentScreen).toBe("field");
    expect(saved.activeCaseId).toBe("case-001");
    // The tour is cleared, or the field would open with hub movement still locked.
    expect(saved.tutorial.completed).toBe(true);
  });

  test("opens a mission on its board rather than its instructions", async ({ page }) => {
    // `briefed: true` is the whole seed — ensureSourceActivity() fills in the engine's own default
    // state, which is what makes a warp a save state rather than a second copy of the content.
    await page.goto("/?warp=mission");
    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page.locator('[data-action="mission-briefed"]')).toHaveCount(0);
    expect((await readProgress(page)).activeActivitySourceId).toBe("taino-context");
  });

  test("lands in the Main Hall with the player able to move", async ({ page }) => {
    await page.goto("/?warp=hub");
    await expect(page.locator("#institutePlayer")).toBeVisible();
    const saved = await readProgress(page);
    expect(saved.currentHubRoom).toBe("main");
    expect(saved.tutorial.completed).toBe(true);
  });

  test("starts the Entrance Hall from the top of its scene", async ({ page }) => {
    await page.goto("/?warp=hall");
    await expect(page.locator("#institutePlayer")).toBeVisible();
    const saved = await readProgress(page);
    expect(saved.currentHubRoom).toBe("hallway");
    // enterHallwayRoom() winds the tutorial back, so the escort is still ahead of the player.
    expect(saved.tutorial.step).toBe("hallway");
  });

  test("ignores a name it does not have, without touching the save (edge case)", async ({
    page,
  }) => {
    // The failure that would matter: a typo'd warp resetting progress and looking like data loss.
    await page.goto("/?warp=field");
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // An unknown warp name falls through to a normal cold boot, which now opens on the title
    // sequence in front of the landing — clear it, then confirm the landing and an untouched save.
    await page.goto("/?warp=nonesuch");
    await beginFromTitle(page);
    await expect(page.getByRole("button", { name: "Student" })).toBeVisible();
    expect((await readProgress(page)).currentScreen).toBe("field");
  });
});
