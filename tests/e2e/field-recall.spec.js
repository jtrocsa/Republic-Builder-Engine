// The one way out of the field.
//
// Spine Review Part 5 routed this here as its finding 8: the field screen carried **two** controls
// that both claimed to recall the player, and only one of them did it. The in-world beacon plays
// the return warp, sets the arrival notice and puts the player beside the Navigation Table. The
// back link in the top-left said "← Recall to Institute" and ran `home` — an instant cut with no
// warp, no notice, and a spawn at safeInstituteSpawn()'s default (11.5, 9), seven tiles west of
// the table the beacon lands you at.
//
// `warp-screens.spec.js` already proves the beacon plays the warp. What is new here is that the
// chrome control is now the same control: one action, one name, one arrival. That matters more
// than it looks, because the back link is the exit most players will use — it is where every other
// screen in the game puts its way out, and it sits still while the beacon scrolls with the map.
//
// The teacher-preview safety net moved with it. `handleChromeClick`'s "home" branch has carried an
// exitPreviewIfActive() guard since Phase 22 specifically for this button (two archived audits name
// it), so repointing the button without moving the guard would have stranded a previewing teacher
// on the real institute screen with the session still active.

import { test, expect } from "@playwright/test";

import { seedProgress, loadSeededSave } from "./helpers/progress-seed.js";

const recallWarp = (page) => page.locator('[data-warp="recall"]');

const FIELD_SEED = {
  currentScreen: "field",
  activeCaseId: "case-001",
  tutorial: { step: "complete", completed: true, skipped: false },
};

test.describe("Recall to Archive", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("the back link plays the warp, the same as the beacon (P6-2)", async ({ page }) => {
    await seedProgress(page, FIELD_SEED);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // A real click, unlike the beacon's dispatched one: the back link is in normal flow in the
    // left column, not inside the scrolling map transform.
    await page.getByRole("button", { name: "← Recall to Archive" }).click();
    await expect(recallWarp(page)).toBeVisible();

    const prompt = page.getByRole("button", { name: "Enter the Archive →" });
    await expect(prompt).toBeVisible({ timeout: 15_000 });
    await prompt.click();
    await expect(page.locator("#instituteMap")).toBeVisible();
  });

  test("lands the player at the Navigation Table, with the arrival said out loud (P6-2)", async ({
    page,
  }) => {
    // The three things `home` did not do. The spawn is the one a player notices: recalling used to
    // put them at the foyer entrance and leave them to walk the room again.
    await seedProgress(page, FIELD_SEED);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    await page.getByRole("button", { name: "← Recall to Archive" }).click();
    const prompt = page.getByRole("button", { name: "Enter the Archive →" });
    await expect(prompt).toBeVisible({ timeout: 15_000 });
    await prompt.click();

    await expect(page.locator("#instituteMap")).toBeVisible();
    await expect(page.getByText("Temporal recall complete")).toBeVisible();
    // instituteRecallSpawn() is the table's own cell plus 0.6, so the marker's proximity class is
    // on from the first frame — no walking required, which is the whole point of it.
    await expect(page.locator('[data-hub-target="table"]')).toHaveClass(/is-near/);
  });

  test("has exactly one name, and the chrome control carries it (P6-2)", async ({ page }) => {
    // CLAUDE.md's terminology section settles this: the control is "Recall to Archive", and it
    // lands the player beside the Navigation Table. The back link said "Institute" and the beacon
    // said "Archive", eighty pixels and one screen apart — the same class of two-names-for-one-
    // thing Part 5 found on the Archive Room's door.
    await seedProgress(page, FIELD_SEED);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    await expect(page.getByRole("button", { name: "Recall to Archive" })).toHaveCount(2);
    await expect(page.locator('[data-action="field-recall"]')).toHaveCount(2);
    await expect(page.locator('.case-field [data-action="home"]')).toHaveCount(0);
  });
});
