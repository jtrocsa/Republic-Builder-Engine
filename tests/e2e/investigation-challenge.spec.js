import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress, walkToNpc } from "./helpers/progress-seed.js";

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

    // `taino-context` is anchored to the community elder as of Phase 56, so it is reached by talking
    // to her rather than by clicking a card on the grass: she speaks her line, and the bubble offers
    // the record. Clicking the NPC is proximity-gated exactly like pressing E.
    //
    // The spawn (28,22) is a real walk south of the Taíno village. walkToNpc() approaches and then
    // nudges until the game's own `.is-near` class appears, rather than timing the arrival — this
    // walk was the suite's most frequent intermittent failure when it was a fixed 2900ms hold.
    await walkToNpc(page, "taino-elder");
    await expect(page.locator('[data-npc="taino-elder"]')).toHaveClass(/is-near/);

    await page.locator('[data-npc="taino-elder"]').click();
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await bubble
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

    // taino-context has an activityRoute ("interview") — sourceEntryScreen() re-resolves it rather
    // than hardcoding "source", so completing the Investigation Challenge here lands on that
    // activity, not a plain sourceReader() worksheet. The gate and the activity are two separate
    // things stacked on one record, and this is what proves the second still runs after the first.
    const afterContinue = await readProgress(page);
    expect(afterContinue.currentScreen).toBe("interview");
    expect(afterContinue.activeActivitySourceId).toBe("taino-context");
    expect(afterContinue.questResponses["case-001-investigation-mcq-taino-origins"]).toEqual({
      selected: "0",
    });
  });
});
