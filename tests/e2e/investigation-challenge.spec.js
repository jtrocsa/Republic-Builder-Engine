import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress } from "./helpers/progress-seed.js";

// Scenario 5: one Investigation Challenge, full walk -> proximity "E"/click interact ->
// challenge renders -> answer -> "Source Unlocked" -> continue.
//
// investigationScreen() reads the ephemeral openSourceId module variable, not anything in
// `progress` — seeding currentScreen: "investigation" directly would self-heal back to "field"
// on load (main.js's own recovery path for exactly this situation). So this one has to be
// driven for real rather than jumped to, unlike archive-challenge/practice-check below.
//
// case-001's taino-context is the simplest target: it's unlocked by default (no case-unlock
// seeding needed) and its Investigation Challenge is a plain mcq quest
// (case-001-investigation-mcq-taino-origins, answer index 0).
test.describe("Investigation Challenge", () => {
  test("case-001 taino-context: walk, interact, answer, unlock, continue", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // fieldMovement's default spawn (20, 12) is 3.16 tiles from taino-context's field point
    // (22.6, 10.2) — outside the 1.55-tile interaction reach. Walk closer first.
    await page.keyboard.down("ArrowRight");
    await page.keyboard.down("ArrowUp");
    await page.waitForTimeout(800);
    await page.keyboard.up("ArrowRight");
    await page.keyboard.up("ArrowUp");

    await page
      .locator('[data-action="start-source-activity"][data-source="taino-context"]')
      .click();

    const stored = await readProgress(page);
    expect(stored.currentScreen).toBe("investigation");

    const quest = page.locator('[data-quest-id="case-001-investigation-mcq-taino-origins"]');
    await expect(quest).toBeVisible();

    await quest.locator('input[type="radio"][value="0"]').check();

    const continueButton = page.locator('[data-action="investigation-continue"]');
    await expect(continueButton).toBeVisible();
    await expect(page.locator(".activity-feedback.success")).toContainText("ready to open");

    await continueButton.click();

    // taino-context has a bespoke activityRoute ("village-activity") — sourceEntryScreen()
    // re-resolves it rather than hardcoding "source", so completing the Investigation
    // Challenge here lands on that mini-game screen, not a plain sourceReader() worksheet.
    const afterContinue = await readProgress(page);
    expect(afterContinue.currentScreen).toBe("village-activity");
    expect(afterContinue.questResponses["case-001-investigation-mcq-taino-origins"]).toEqual({
      selected: "0",
    });
  });
});
