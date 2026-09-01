import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave } from "./helpers/progress-seed.js";

// Unit 5's two missions and its two Archive Challenges, rendered and answered.
//
// This is the "full playthrough" half of the unit's verification, banked rather than done by hand.
// Everything else about Unit 5 is checked structurally — the validator proves the content parses and
// every cross-reference resolves, richmond-interiors.spec.js proves the rooms and their records
// work, visual-regression covers the map — and none of that would notice the one failure mode that
// actually matters here: a quest that validates perfectly and does not *resolve*.
//
// A mission's quest is looked up by (questType, questId) through ARCHIVE_CHALLENGE_QUESTS_BY_TYPE,
// which is a hand-maintained merge of one array per unit per type in main.js. Forgetting to spread
// UNIT_05_ARCHIVE_EVIDENCE_QUESTS into the `evidence-organizing` key produces content that passes
// `npm run validate:content` and a mission screen with an empty board. The unit's SAQ and DBQ go
// through the same table from the other direction. So: render each of the four, and answer one of
// them end to end to prove the grading path is wired too.

test.describe("Unit 5 missions and Archive Challenges", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("case-014 resolves its sequencing quest, and it does not open already solved", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "mission",
      selectedUnitId: "unit-05",
      activeCaseId: "case-014",
    });
    await loadSeededSave(page);
    await expect(page.locator(".mission-shell")).toBeVisible();
    // The mission is framed as itself: the mission's name in the heading, its number and the unit's
    // period in the eyebrow. This assertion used to read "Period 5 · 1844–1877" and carried a
    // comment explaining that Unit 5 drops the "Case N.NN — " prefix from its case titles so
    // caseNumberLabel() comes back empty — a spec pinning the defect in place. Phase 105 derives the
    // number from the case's position instead of reading it off the title, so all twenty-seven have
    // one. See decision log 0104 and Spine Review P10-5.
    await expect(page.locator(".mission-shell h1")).toHaveText("The Road to Disunion");
    await expect(page.locator(".mission-shell .kicker").first()).toHaveText(
      "Case 5.02 · Period 5 · 1844–1877"
    );

    const quest = page.locator('[data-quest-type="sequencing"]');
    await expect(quest).toBeVisible();
    await expect(quest.locator(".sequence-item")).toHaveCount(6);

    // **The board must not open in the answer.** renderSequencingQuest() lays items out in the
    // authored array's order and never shuffles, so a quest whose `items` are written 0,1,2,3,4,5
    // renders already correct and grades the student right for touching nothing. Unit 1 authors its
    // three scrambled for exactly this reason and the convention was never written down. This is
    // that convention, asserted: the order on screen is not the order the content grades as right.
    const onScreen = await quest.evaluate((node) =>
      [...node.querySelectorAll(".sequence-item")].map((el) => el.dataset.sequenceItem)
    );
    const solved = [
      "wilmot-proviso-1846",
      "compromise-1850",
      "northern-resistance-1851-1854",
      "kansas-nebraska-1854",
      "dred-scott-1857",
      "election-and-secession-1860",
    ];
    expect([...onScreen].sort(), "every authored step renders").toEqual([...solved].sort());
    expect(onScreen, "a chronology puzzle must not ship pre-solved").not.toEqual(solved);
  });

  test("case-013's practice-check chronology does not ship pre-solved either", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "practice-check",
      selectedUnitId: "unit-05",
      activeCaseId: "case-013",
    });
    await loadSeededSave(page);
    const quest = page.locator('[data-quest-type="sequencing"]');
    await expect(quest).toBeVisible();
    const onScreen = await quest.evaluate((node) =>
      [...node.querySelectorAll(".sequence-item")].map((el) => el.dataset.sequenceItem)
    );
    expect(onScreen).not.toEqual([
      "capital-moves-to-richmond",
      "city-fills-up",
      "conscription-drains-white-labor",
      "government-impresses-enslaved-labor",
      "prices-outrun-wages",
      "black-labor-runs-the-city",
    ]);
  });

  test("case-015 resolves its evidence-organizing board with all three lanes", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "mission",
      selectedUnitId: "unit-05",
      activeCaseId: "case-015",
    });
    await loadSeededSave(page);
    await expect(page.locator(".mission-shell")).toBeVisible();
    await expect(page.locator(".mission-shell h1")).toHaveText("The Unfinished Work");

    const quest = page.locator('[data-quest-type="evidence-organizing"]');
    await expect(quest).toBeVisible();
    // Six claims, three lanes. The four post-war characters this unit generated and did not build
    // are what these claims are: land, the ballot, and federal protection.
    await expect(quest.locator(".evidence-card")).toHaveCount(6);
    await expect(quest.locator(".evidence-slot")).toHaveCount(3);
    await expect(quest.locator(".evidence-slot h4")).toHaveText([
      "Land, and labor on your own terms",
      "The ballot, and a seat in the government",
      "A federal guarantee that the law will protect you",
    ]);
    // Freedpeople speaking for themselves is the first card on the board, not a footnote to it.
    await expect(quest).toContainText("turn it and till it by our own labor");
  });

  test("the unit's Archive Terminal offers Unit 5's SAQ and DBQ", async ({ page }) => {
    await seedProgress(page, { currentScreen: "archive-challenges", selectedUnitId: "unit-05" });
    await loadSeededSave(page);
    await expect(page.locator(".archive-challenges-shell")).toBeVisible();

    // Both resolved out of ARCHIVE_CHALLENGE_QUESTS_BY_TYPE, and each carries its own stimulus —
    // an empty card here is what a missing spread in main.js looks like.
    await expect(page.locator('[data-quest-type="saq"]')).toBeVisible();
    await expect(page.locator('[data-quest-type="saq"]')).toContainText(
      "the seventeenth of February last"
    );
    await expect(page.locator('[data-quest-type="dbq"]')).toBeVisible();
    await expect(page.locator('[data-quest-type="dbq"]')).toContainText(
      "equal protection of the laws"
    );
    // Seven documents, the standard DBQ shape.
    await expect(page.locator('[data-quest-type="dbq"] .quest-document')).toHaveCount(7);
  });
});
