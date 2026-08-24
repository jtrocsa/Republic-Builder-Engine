// Unit close — the end of a unit, and the way into the next one.
//
// Spine Review Part 12. Banks the three things the unit tests next door cannot see, because all
// three are about which control the screen draws and what survives leaving it:
//
//   1. P12-1 — a unit with no authored Archive Review is not offered one. `UNIT_REVIEWS` has two
//      entries and every reader used to end `|| REVIEW`, so five of the seven units opened Unit 1's
//      Atlantic World checkpoint under their own heading. Submitting it was also the only thing
//      outside Teacher Mode that unlocked the next unit, which is why the fallback survived four
//      units — the fix had to keep the unit closable, not just stop the wrong screen.
//   2. P12-6 — closing a unit says so, and names the period it just opened. Finishing a *case* has
//      always written a hub notice; finishing a whole unit wrote nothing, and left the Navigation
//      Table on the unit just archived with the new one an undiscovered tab away.
//   3. P12-2 — the Archive Review keeps what you typed. It was the one written surface in the game
//      that lived only in the DOM until Submit was pressed.
import { expect, test } from "@playwright/test";
import { loadSeededSave, seedProgress, readProgress } from "./helpers/progress-seed.js";

// Units 1 to 3 finished: every case archived and every unit-level Archive Challenge filed, which is
// what `unitReadyForReview()` asks. The same state `?warp=unitclose` seeds for a human.
const THREE_UNITS_DONE = {
  currentScreen: "archive",
  selectedUnitId: "unit-03",
  selectedCaseId: "case-007",
  completedCases: [
    "case-001",
    "case-002",
    "case-003",
    "case-004",
    "case-005",
    "case-006",
    "case-007",
    "case-008",
    "case-009",
  ],
  unlocked: [
    "case-001",
    "case-002",
    "case-003",
    "case-004",
    "case-005",
    "case-006",
    "case-007",
    "case-008",
    "case-009",
  ],
  archiveChallenges: {
    "unit-01-archive-atlantic-world-saq": { status: "complete" },
    "unit-02-archive-colonial-crossroads-saq": { status: "complete" },
    "unit-03-archive-common-cause-saq": { status: "complete" },
    "unit-03-archive-common-cause-dbq": { status: "complete" },
  },
};

test.describe("a finished unit closes through what it actually has", () => {
  test.beforeEach(async ({ page }) => {
    await seedProgress(page, THREE_UNITS_DONE);
    await loadSeededSave(page);
  });

  test("Unit 3 offers its record, not another unit's Archive Review (P12-1)", async ({ page }) => {
    await expect(page.locator('[data-action="close-unit"]')).toBeVisible();
    await expect(page.locator('[data-action="review"]')).toHaveCount(0);
  });

  test("Unit 2, which has a review, still offers it (P12-1, the other side)", async ({ page }) => {
    await page.locator('[data-action="select-unit"][data-unit="unit-02"]').click();
    await expect(page.locator('[data-action="review"]')).toBeVisible();
    await expect(page.locator('[data-action="close-unit"]')).toHaveCount(0);
  });

  test("closing Unit 3 archives it, opens Unit 4, and says so (P12-1, P12-6)", async ({ page }) => {
    await page.locator('[data-action="close-unit"]').click();

    // The unit that was closed, named — not the one just unlocked.
    await expect(page.locator(".completion-shell h1")).toContainText("archived");
    // No MCQ/SAQ line, because there was no review to score. It used to print Unit 1's counts.
    await expect(page.locator(".completion-stats")).not.toContainText("MCQ checkpoint");
    await expect(page.locator('[data-action="review"]')).toHaveCount(0);

    // The next unit, from the screen that opened it.
    const onward = page.locator('[data-action="open-next-unit"]');
    await expect(onward).toBeVisible();
    await expect(onward).toContainText("Period 4");

    const saved = await readProgress(page);
    expect(saved.completedUnits).toContain("unit-03");
    expect(saved.unlocked).toContain("case-010");
    expect(saved.hubNotice).toContain("Period 4");

    // And it lands on the new unit's table rather than the archived one's.
    await onward.click();
    await expect(page.locator(".archive-unit-tabs .is-selected")).toHaveText("Period 4");
  });
});

test("the Archive Review keeps what you typed before it is submitted (P12-2)", async ({ page }) => {
  await seedProgress(page, {
    ...THREE_UNITS_DONE,
    currentScreen: "review",
    selectedUnitId: "unit-01",
    selectedCaseId: "case-001",
  });
  await loadSeededSave(page);

  const answer = "Both records were written to be filed, not to be read by the people in them.";
  const first = page.locator("[data-saq]").first();
  await first.fill(answer);
  await page.locator("[data-mcq]").first().check();

  // Leaving the screen the way a student would — the back link, not a submit.
  await page.locator('[data-action="archive"]').click();
  await expect(page.locator(".archive-layout")).toBeVisible();

  await page.locator('[data-action="review"]').click();
  await expect(page.locator("[data-saq]").first()).toHaveValue(answer);
  await expect(page.locator("[data-mcq]").first()).toBeChecked();
});
