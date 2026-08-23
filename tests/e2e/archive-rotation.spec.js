import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress } from "./helpers/progress-seed.js";

// Phase 49C: "The Archive Rotation" — a daily spaced-repetition loop over the existing
// mcq/sequencing/hipp pool (engine/spaced-repetition.js). With only case-001 unlocked (the
// default for a fresh save), the pool is exactly 5 items: 3 mcq + 1 sequencing + 1 hipp — all
// under DEFAULT_DAILY_ROTATION_TARGET (8), so the whole pool becomes today's queue.
test.describe("The Archive Rotation", () => {
  test("generates today's queue from the unlocked pool and gates Next on answering (normal case)", async ({
    page,
  }) => {
    await seedProgress(page, { currentScreen: "archive-rotation" });
    await loadSeededSave(page);

    await expect(page.getByRole("heading", { name: "The Archive Rotation" })).toBeVisible();
    await expect(page.locator(".quest-practice-summary").first()).toContainText("Item 1/5");

    const nextButton = page.getByRole("button", { name: "Next →" });
    await expect(nextButton).toBeDisabled();

    const stored = await readProgress(page);
    expect(stored.archiveRotation.queue).toHaveLength(5);
    expect(stored.archiveRotation.position).toBe(0);
  });

  test("answering the current item enables Next and records a Leitner review (normal case)", async ({
    page,
  }) => {
    await seedProgress(page, { currentScreen: "archive-rotation" });
    await loadSeededSave(page);

    const quest = page
      .locator(
        ".quest[data-quest-type='mcq'], .quest[data-quest-type='sequencing'], .quest[data-quest-type='hipp']"
      )
      .first();
    await expect(quest).toBeVisible();

    // Whatever item is first in the queue, answer it via whichever input it exposes.
    const mcqInput = quest.locator('input[type="radio"]').first();
    const hippInput = quest.locator("input[data-hipp-option]").first();
    if (await mcqInput.count()) {
      await mcqInput.check();
    } else if (await hippInput.count()) {
      await hippInput.check();
    } else {
      // Sequencing quest — a single move already counts as "answered".
      await quest.locator('[data-action="sequence-move"][data-direction="up"]').first().click();
    }

    const nextButton = page.getByRole("button", { name: "Next →" });
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    await expect(page.locator(".quest-practice-summary").first()).toContainText("Item 2/5");
    const stored = await readProgress(page);
    expect(stored.archiveRotation.position).toBe(1);
    const key = stored.archiveRotation.queue[0];
    expect(stored.archiveRotation.itemStates[key]).toBeTruthy();
    expect(stored.archiveRotation.itemStates[key].box).toBeGreaterThanOrEqual(1);
  });

  test("completing every item in the queue shows the complete state and starts a streak (normal case)", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "archive-rotation",
      archiveRotation: {
        itemStates: {},
        // Today, matching engine/spaced-repetition.js's rotationDateString(). A hardcoded date
        // here was a time bomb: the app rebuilds the queue whenever `queueDate` isn't today, so
        // this seeded one-item queue silently became a fresh five-item one the day after it was
        // written, and the test then failed every day thereafter.
        queueDate: new Date().toISOString().slice(0, 10),
        queue: ["mcq::case-001-mcq-taino-sourcing"],
        position: 0,
        streakDays: 0,
        lastCompletedDate: null,
      },
    });
    await loadSeededSave(page);

    await expect(page.locator(".quest-practice-summary").first()).toContainText("Item 1/1");
    await page
      .locator('.quest[data-quest-id="case-001-mcq-taino-sourcing"] input[value="1"]')
      .check();
    await page.getByRole("button", { name: "Finish rotation →" }).click();

    await expect(page.locator(".activity-copy")).toContainText("Today's rotation is complete");
    await expect(page.locator(".mastery-board")).toContainText("1/1 reviewed today.");
    const stored = await readProgress(page);
    expect(stored.archiveRotation.position).toBe(1);
    expect(stored.archiveRotation.streakDays).toBe(1);
    expect(stored.archiveRotation.lastCompletedDate).toBeTruthy();
  });

  test("shows the empty state when no unlocked case has any rotation items (boundary case)", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "archive-rotation",
      unlocked: [],
    });
    await loadSeededSave(page);

    // Renamed in Spine Review Part 11. The old copy called this "Nothing to review yet" and told
    // the player to go and do a Practice Check first, which is wrong in both of the states that
    // reach it: the pool is every unlocked case's items whether or not they have been seen, and
    // when everything is scheduled for a later day more practice is exactly what does not help.
    await expect(page.locator(".mastery-board")).toContainText("Nothing due today.");
  });
});
