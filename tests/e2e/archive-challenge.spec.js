import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress } from "./helpers/progress-seed.js";

// Scenario 6: one Archive Challenge, Terminal -> challenge -> placement -> completion written
// to progress.completedCases.
//
// Unlike Investigation Challenges, archiveChallengesScreen() has no ephemeral-state dependency
// (it reads only progress.selectedUnitId/questResponses/completedCases/archiveChallenges) —
// directly seedable via currentScreen: "archive-challenges".
//
// case-006 "Charter & Compact" is the cleanest target: its Navigation Table route was fully
// removed (route: null, navigationTableVisible: false) once its Archive Challenge shipped, so
// it's single-path. Real content (unit-02-quests.js): 6 sources map 2:1 onto 3 region slots.
const QUEST_ID = "case-006-archive-region-display";
const CORRECT_PLACEMENTS = {
  "town-covenant": "new-england",
  "school-law": "new-england",
  "toleration-writ": "middle",
  "grain-manifest": "middle",
  "headright-grant": "southern",
  "indenture-contract": "southern",
};

test.describe("Archive Challenge", () => {
  test("case-006: place all evidence via the select fallback, reflect, and complete", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "archive-challenges",
      selectedUnitId: "unit-02",
    });
    await loadSeededSave(page);

    const quest = page.locator(`.quest[data-quest-id="${QUEST_ID}"]`);
    await expect(quest).toBeVisible();

    for (const [sourceId, slotId] of Object.entries(CORRECT_PLACEMENTS)) {
      await quest.locator(`[data-evidence-select="${sourceId}"]`).selectOption(slotId);
    }

    const reflection = quest.locator(`[data-evidence-reflection="${QUEST_ID}"]`);
    await reflection.fill(
      "Both regions built very different labor systems, and the headright grant is the strongest evidence for that difference."
    );
    await reflection.blur();

    await expect(page.locator(".activity-feedback.success")).toContainText(
      "Archive Challenge complete"
    );

    const stored = await readProgress(page);
    expect(stored.archiveChallenges[QUEST_ID]?.status).toBe("complete");
    expect(stored.completedCases).toContain("case-006");
  });
});
