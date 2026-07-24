import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress } from "./helpers/progress-seed.js";

// Scenario 8: local save persistence — a full reload mid-Practice-Check should re-hydrate
// identical questResponses/currentScreen from localStorage rather than resetting.
//
// Note: page.reload() re-runs the app's module scope, which resets showMainMenu (a
// runtime-only variable, always true on load) — so, just like the very first load, the test
// has to click back through Student -> Load Save after reloading; only the underlying
// localStorage state (and therefore which screen/answers it resumes into) is expected to
// survive, not the "already past the landing screen" runtime state.
test.describe("Local save persistence", () => {
  test("questResponses and currentScreen survive a full page reload", async ({ page }) => {
    await seedProgress(page, { currentScreen: "practice-check" });
    await loadSeededSave(page);

    // Answer for real (not seeded) so this exercises the actual write path, not just a
    // read-back of data the test itself planted twice.
    const mcqQuest = page.locator('[data-quest-id="case-001-mcq-taino-sourcing"]');
    await mcqQuest.locator('input[type="radio"][value="1"]').check();
    await expect(mcqQuest.locator("xpath=ancestor::div[@data-quest-status]")).toHaveAttribute(
      "data-quest-status",
      "correct"
    );

    await page.reload();
    await page.getByRole("button", { name: "Student" }).click();
    await page.getByRole("button", { name: "Load Save" }).click();

    const mcqQuestAfterReload = page.locator('[data-quest-id="case-001-mcq-taino-sourcing"]');
    await expect(mcqQuestAfterReload.locator('input[type="radio"][value="1"]')).toBeChecked();
    await expect(
      mcqQuestAfterReload.locator("xpath=ancestor::div[@data-quest-status]")
    ).toHaveAttribute("data-quest-status", "correct");

    const stored = await readProgress(page);
    expect(stored.currentScreen).toBe("practice-check");
    expect(stored.questResponses["case-001-mcq-taino-sourcing"]).toEqual({ selected: "1" });
  });
});
