import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress, walkToNpc } from "./helpers/progress-seed.js";

// The Mission Instructions screen (Phase 71, decision log 0054).
//
// Phase 69 answered the owner's "have an instruction screen explaining the quest" with a panel in
// the activity's copy column — beside the board it was meant to explain, where a player already
// looking at the board does not read it. This is the same content given its own beat, framed as the
// hand-off it always was in fiction: whoever gave you the job, their portrait, and what they want.
//
// It is deliberately not a screen id. The four engine keys already double as VALID_SCREENS entries
// and as content's `activityRoute`, so a fifth would be a save-compatibility change to buy nothing —
// this is the activity screen's first state, gated on `briefed` beside `state` and `completed` on
// that record's own progress.sourceActivities entry. Which is why the assertions below check
// `progress.currentScreen` is already the engine key while the instructions are still showing.

const CASE_001 = {
  activeCaseId: "case-001",
  selectedCaseId: "case-001",
  unlocked: ["case-001"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

test.describe("Mission Instructions", () => {
  test("hands the mission over in the giver's own voice, then gets out of the way", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await seedProgress(page, { ...CASE_001, currentScreen: "field" });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // `taino-context` is carried by the community elder, so the record is reached through her
    // speech bubble rather than by clicking anything on the grass.
    expect(await walkToNpc(page, "taino-elder")).toBe(true);
    await page.locator('[data-npc="taino-elder"]').click();
    await page
      .locator(
        '.field-speech-bubble [data-action="start-source-activity"][data-source="taino-context"]'
      )
      .click();

    // The instructions, not the board. Both are the "interview" screen; only one is rendered.
    const brief = page.locator(".mission-brief");
    await expect(brief).toBeVisible();
    await expect(page.locator(".activity-board--interview")).toHaveCount(0);
    expect((await readProgress(page)).currentScreen).toBe("interview");

    // Tier 1 of the giver plate: the activity's `briefing` names an NPC, so this opens on that
    // person's committed portrait PNG, their name, their role and the line they hand it over with.
    // The child rather than the elder, because his is the line the whole mission turns on.
    await expect(brief.locator(".mission-brief__portrait")).toBeVisible();
    await expect(brief.locator(".mission-brief__giver figcaption b")).toHaveText("Taíno child");
    await expect(brief.locator(".mission-brief__giver blockquote")).toContainText(
      "Nobody asks me what grows here"
    );

    // Three steps, capped at four by the schema — this shipped at five and the owner stopped
    // reading them. The glossary comes across from the copy column too, because a word a player
    // does not have is worse on the screen that explains the mechanic than on the one that runs it.
    await expect(brief.locator(".mission-brief__steps li")).toHaveCount(3);
    await expect(brief.locator(".mission-brief__steps li").first()).toHaveText(
      "You may ask any question to any person. Consider their position."
    );
    await expect(brief.locator(".mission-brief__terms dt")).toHaveCount(2);

    await brief.locator('[data-action="mission-briefed"]').click();

    // Cleared: the board, and the same steps still available in the copy column beside it — which
    // is what makes clearing the screen safe rather than a one-shot.
    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page.locator(".mission-brief")).toHaveCount(0);
    await expect(page.locator(".activity-howto li")).toHaveCount(3);

    const stored = await readProgress(page);
    expect(stored.sourceActivities["taino-context"].briefed).toBe(true);
  });

  test("is shown once per record, and the record remembers across a reload", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
    });
    await loadSeededSave(page);

    await expect(page.locator(".mission-brief")).toBeVisible();
    await page.locator('[data-action="mission-briefed"]').click();
    await expect(page.locator(".activity-board--interview")).toBeVisible();

    // A reload lands back in the activity, not back in the briefing. `briefed` is persisted for the
    // same reason `activeActivitySourceId` is: a module-local flag dies with the page.
    await page.reload();
    await page.getByRole("button", { name: "Student" }).click();
    await page.getByRole("button", { name: "Load Save" }).click();
    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page.locator(".mission-brief")).toHaveCount(0);
  });

  test("a record nobody is holding opens on the engine's mark instead of a face", async ({
    page,
  }) => {
    // Tier 3. The Waldseemüller sheet is a world marker on the west shore — no `briefing`, and no
    // NPC anchor to fall back to — so the plate carries the ASSEMBLY mark and says as much, rather
    // than borrowing somebody who did not give you anything.
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "assembly",
      activeActivitySourceId: "waldseemuller-map",
      caseEvidence: { "case-001": ["taino-context", "columbus-letter"] },
    });
    await loadSeededSave(page);

    const brief = page.locator(".mission-brief");
    await expect(brief).toBeVisible();
    await expect(brief.locator(".mission-brief__portrait")).toHaveCount(0);
    await expect(brief.locator(".mission-brief__mark svg")).toBeVisible();
    await expect(brief.locator(".mission-brief__giver figcaption span")).toHaveText(
      "Nobody handed you this one"
    );
  });

  test("the tracker's way back in still passes through it", async ({ page }) => {
    // `open-activity-notebook` skips sourceEntryScreen() deliberately, so it is the one path that
    // could have routed around the gate. An un-cleared record has to get its instructions however
    // the player arrives at it.
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "field",
      sourceActivities: {
        "taino-context": {
          state: { asked: {}, logged: {}, filed: null },
          completed: false,
          briefed: false,
        },
      },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    await page.locator('.field-tracker [data-action="open-activity-notebook"]').click();
    await expect(page.locator(".mission-brief")).toBeVisible();
    await expect(page.locator(".activity-board--interview")).toHaveCount(0);
  });
});
