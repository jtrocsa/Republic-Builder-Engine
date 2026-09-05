// A mission has exactly one name, and its number is never inside a heading.
//
// INVARIANTS.md §35 has said both halves since Phase 59. The second half held nowhere it could be
// seen: `resolvedCaseTitle()` returns `"Case 1.01 — The Atlantic Crossroads"` on Unit 1 and the bare
// name on every other unit, because only Unit 1's three titles carry the prefix it reads. So a
// heading built from it looks right on twenty-four cases out of twenty-seven, and four
// student-facing headings were built from it — the Navigation Table's route panel, the field
// screen, the mission card's kicker and the Practice Check's own prose.
//
// Unit 1 is therefore the only unit that can catch this, which is why nothing had. It is also the
// unit every student plays first.
//
// The other half of what is banked here is the gain, and it is not Unit 1's: the number now rides
// in the eyebrow on **every** unit's Navigation Table panel and field header, where before Phase 105
// `caseNumberLabel()` had nothing to give them. Phase 107, decision log `0106`.
import { expect, test } from "@playwright/test";
import { loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

const TUTORIAL_DONE = { step: "complete", completed: true, skipped: false };

test.describe("no heading names a mission with its number in it", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("the Navigation Table's route panel, on the one unit that can fail", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "archive",
      selectedUnitId: "unit-01",
      selectedCaseId: "case-001",
      unlocked: ["case-001"],
      tutorial: TUTORIAL_DONE,
    });
    await loadSeededSave(page);
    await expect(page.locator(".route-panel")).toBeVisible();

    // Not `toContainText`: the whole finding is an extra eleven characters at the front, and a
    // containment check passes on the string it exists to reject.
    await expect(page.locator(".route-panel h2")).toHaveText("The Atlantic Crossroads");
    await expect(page.locator(".route-panel .case-date")).toHaveText("Case 1.01 · 1493");
  });

  test("the Navigation Table's route panel, on a unit that never carried a number at all", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "archive",
      selectedUnitId: "unit-04",
      selectedCaseId: "case-010",
      unlocked: ["case-001", "case-010"],
      tutorial: TUTORIAL_DONE,
    });
    await loadSeededSave(page);
    await expect(page.locator(".route-panel")).toBeVisible();

    await expect(page.locator(".route-panel h2")).toHaveText("The Canal Crossroads");
    // The gain. Units 2–8's panels printed a bare year here, because the number was only ever
    // available to a case whose own title spelled it out.
    await expect(page.locator(".route-panel .case-date")).toContainText("Case 4.01");
  });

  test("the field screen's own header", async ({ page }) => {
    test.setTimeout(90_000);
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      selectedCaseId: "case-001",
      unlocked: ["case-001"],
      tutorial: TUTORIAL_DONE,
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    await expect(page.locator(".field-intro h1")).toHaveText("The Atlantic Crossroads");
    // Number, then where and when — the same eyebrow the mission screen has carried since Phase 105.
    await expect(page.locator(".field-intro .kicker")).toHaveText("Case 1.01 · Caribbean · 1493");
  });

  test("the mission card's kicker, under a page kicker that already said the number", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "mission",
      activeCaseId: "case-002",
      selectedCaseId: "case-002",
      unlocked: ["case-001", "case-002"],
      tutorial: TUTORIAL_DONE,
    });
    await loadSeededSave(page);
    await expect(page.locator(".mission-shell")).toBeVisible();

    await expect(page.locator(".activity-copy h1")).toHaveText("The Exchange Ledger");
    await expect(page.locator(".activity-copy .kicker")).toHaveText(
      "Case 1.02 · Period 1 · 1491–1607"
    );
    // Said twice on one screen until Phase 107, and the second one was the louder of the two.
    await expect(page.locator(".activity-board .kicker").first()).toHaveText("The Exchange Ledger");
  });
});
