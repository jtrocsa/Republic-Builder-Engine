import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress, walkTo } from "./helpers/progress-seed.js";

// Scenario 5: one Investigation Challenge, full walk -> proximity click -> challenge renders ->
// answer -> "Source Unlocked" -> continue into the record's own activity.
//
// investigationScreen() reads the ephemeral openSourceId module variable, not anything in
// `progress` — seeding currentScreen: "investigation" directly would self-heal back to "field"
// on load (main.js's own recovery path for exactly this situation). So this one has to be
// driven for real rather than jumped to, unlike archive-challenge/practice-check below.
//
// The target moved in Phase 69. It used to be taino-context, whose gate asked a player to
// predict the sourcing of the worksheet they were about to open — and since Phase 68 that
// record opens an INTERVIEW put to seven people on the map, not a worksheet. The gate was
// removed and an in-activity "How this works" panel took its place (decision log 0052), so
// the only Investigation Challenge left in Case 1.01 is waldseemuller-map's sequencing one.
//
// That costs this spec two things and is worth both: the record sits behind the case's one
// availability gate (nothing but the village is reachable until the village is secured, per
// sourceAvailability()), so the evidence is seeded; and it is a world marker on the far west
// shore rather than a person a few tiles north, so the walk is long.
const SEQUENCE_QUEST = "case-001-investigation-sequencing-waldseemuller-naming";

// Causation, in the order the quest grades: voyages, then the account that argued they were a
// new world, then the map that took a name from it, then the retraction, then the map that made
// the name stick.
const CORRECT_ORDER = [
  "columbus-voyages-asia-belief",
  "vespucci-new-world-account",
  "waldseemuller-names-america-1507",
  "waldseemuller-drops-name-1513",
  "mercator-cements-name-1538",
];

/**
 * Solves the list through its own ↑ controls — a selection sort driven by the UI, so the moves
 * the student would make are the moves under test. Every click re-renders, so each position is
 * re-read from the DOM rather than tracked in the test.
 */
async function sortSequence(page) {
  for (let target = 0; target < CORRECT_ORDER.length; target += 1) {
    const item = page.locator(`li[data-sequence-item="${CORRECT_ORDER[target]}"]`);
    for (let guard = 0; guard < CORRECT_ORDER.length; guard += 1) {
      const at = Number(await item.getAttribute("data-sequence-index"));
      if (at <= target) break;
      await item.locator('[data-direction="up"]').click();
    }
  }
}

test.describe("Investigation Challenge", () => {
  test("case-001 waldseemuller-map: walk, interact, answer, unlock, continue", async ({ page }) => {
    test.setTimeout(120_000);
    await seedProgress(page, {
      currentScreen: "field",
      tutorial: { step: "complete", completed: true, skipped: false },
      // The village record secured, which is what unlocks the rest of the shoreline.
      caseEvidence: { "case-001": ["taino-context"] },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    const table = page.locator('.source-signal--world[data-source="waldseemuller-map"]');
    await expect(table).toBeVisible();
    expect(
      await walkTo(
        page,
        '.source-signal--world[data-source="waldseemuller-map"]',
        "caseFieldPlayer",
        {
          timeoutMs: 60_000,
        }
      )
    ).toBe(true);
    await table.click();

    const stored = await readProgress(page);
    expect(stored.currentScreen).toBe("investigation");

    const quest = page.locator(`[data-quest-id="${SEQUENCE_QUEST}"]`);
    await expect(quest).toBeVisible();
    // Unanswered, the gate does not offer a way past itself.
    await expect(page.locator('[data-action="investigation-continue"]')).toHaveCount(0);

    await sortSequence(page);

    const continueButton = page.locator('[data-action="investigation-continue"]');
    await expect(continueButton).toBeVisible();
    await expect(page.locator(".activity-feedback.success")).toContainText("ready to open");

    await continueButton.click();

    // waldseemuller-map has an activityRoute ("assembly") — sourceEntryScreen() re-resolves it
    // rather than hardcoding "source", so completing the Investigation Challenge here lands on
    // that activity, not a plain sourceReader() worksheet. The gate and the activity are two
    // separate things stacked on one record, and this is what proves the second still runs
    // after the first.
    const afterContinue = await readProgress(page);
    expect(afterContinue.currentScreen).toBe("assembly");
    expect(afterContinue.activeActivitySourceId).toBe("waldseemuller-map");
    expect(afterContinue.questResponses[SEQUENCE_QUEST].order).toEqual(CORRECT_ORDER);
  });
});
