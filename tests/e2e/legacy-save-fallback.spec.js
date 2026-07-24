import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress } from "./helpers/progress-seed.js";

// Scenario 9 (originally numbered 11 in the adoption plan; renumbered after deferring the two
// Supabase-dependent scenarios): legacy-save route fallback. main.js's boot guard, run right
// after readProgress(), redirects any currentScreen value outside VALID_SCREENS (or the one
// VOLATILE_SCREENS entry, "source") back to institute/field rather than rendering blank —
// exact historical precedent: Phase 19 deleted the "regions" screen entirely and this guard
// alone caught stale saves that still pointed at it, with no per-screen migration code needed.
test.describe("Legacy-save route fallback", () => {
  test("an unknown/deleted screen name redirects to institute on load", async ({ page }) => {
    await seedProgress(page, { currentScreen: "regions" });
    await loadSeededSave(page);

    await expect(page.locator("#instituteMap")).toBeVisible();
    const stored = await readProgress(page);
    expect(stored.currentScreen).toBe("institute");
  });

  test("travel without an active case redirects to institute", async ({ page }) => {
    await seedProgress(page, { currentScreen: "travel", activeCaseId: null });
    await loadSeededSave(page);

    await expect(page.locator("#instituteMap")).toBeVisible();
    const stored = await readProgress(page);
    expect(stored.currentScreen).toBe("institute");
  });

  test("travel with an active case is left alone (guard does not fire)", async ({ page }) => {
    await seedProgress(page, { currentScreen: "travel", activeCaseId: "case-001" });
    await loadSeededSave(page);

    await expect(page.locator(".chronotravel-screen")).toBeVisible();
    const stored = await readProgress(page);
    expect(stored.currentScreen).toBe("travel");
  });
});
