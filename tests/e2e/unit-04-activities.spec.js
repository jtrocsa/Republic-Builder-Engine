// Canal Crossroads' three missions (content/activities/unit-04-activities.js), and the two pieces
// of wiring they are the first users of.
//
// Only what Unit 4 adds is here — the host contract is banked on Case 1.01 and TRACE's ledger on
// Case 2.01:
//
//   1. `gapRequiredFor` has taken a **list** since the field was widened, and no content has ever
//      passed one. This audit does: both "contradicted" and "complicated" open the why-question, so
//      a claim the record does not simply support gets asked about either way.
//   2. Every observation is `requires: null`, because this is the map with no interview. The column
//      has to be full from the first frame — there is nothing to earn it with.
//   3. `requiresSourceId` gates the audit behind the trace, which is that field's third use and the
//      first outside Unit 2.
//   4. The assembly's second board is where the historiography is, and its sharpest distractor is
//      the one every student reaches for: a mob of the poor.
import { expect, test } from "@playwright/test";
import { briefed, loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

const CASE_010 = {
  activeCaseId: "case-010",
  selectedCaseId: "case-010",
  unlocked: ["case-001", "case-010"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

test.describe("DISCREPANCY, with two verdicts that both want a reason", () => {
  test("opens the why-question on complicated as well as on contradicted", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_010,
      currentScreen: "discrepancy",
      activeActivitySourceId: "canal-time-book",
      sourceActivities: briefed("canal-time-book"),
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--discrepancy")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("The Bell and the Book");
    const claims = page.locator(".activity-claim");
    await expect(claims).toHaveCount(5);

    // Claim 1 is supported, and a supported line asks for no reason at all.
    const hours = claims.nth(0);
    await hours.locator('[data-verdict="supported"]').click();
    await expect(hours).toHaveClass(/is-settled/);
    await expect(hours.locator(".activity-gap")).toHaveCount(0);

    // Claim 2 is complicated, which under a single-id `gapRequiredFor` would have settled on the
    // spot. It has to ask why instead — the line is accurate and is still not telling you what it
    // appears to, which is the case this whole engine was built for.
    const gate = claims.nth(1);
    await gate.locator('[data-verdict="complicated"]').click();
    await expect(gate.locator(".activity-gap")).toBeVisible();
    await expect(gate).not.toHaveClass(/is-settled/);
    await gate.locator('[data-gap="mistake"]').click();
    await expect(gate).not.toHaveClass(/is-settled/);
    await gate.locator('[data-gap="design"]').click();
    await expect(gate).toHaveClass(/is-settled/);
    await expect(gate).toContainText("converts four minutes into a lost day's pay");
  });

  test("opens with a full evidence column, because there was nothing to earn it with", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_010,
      currentScreen: "discrepancy",
      activeActivitySourceId: "canal-time-book",
      sourceActivities: briefed("canal-time-book"),
    });
    await loadSeededSave(page);

    // On every other map this column is gated by `asked:<npc>:<question>` tokens and a hurried
    // player sees "You did not gather this." Canal Crossroads has no interview to mint one, so the
    // column is the record, the town and the previous mission — and none of it can be missing.
    await expect(page.locator(".activity-observation")).toHaveCount(8);
    await expect(page.locator(".activity-observation.is-missing")).toHaveCount(0);
  });
});

test.describe("the audit is gated behind the trace", () => {
  test("will not hand over the time book until the clearance is secured", async ({ page }) => {
    await seedProgress(page, { ...CASE_010, currentScreen: "field" });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // The Mission Tracker lists every record on every surface of the unit's map, so it is where a
    // locked one shows — and the time book is the only record in this case that is gated, so one
    // locked row is the whole assertion.
    const tracker = page.locator(".field-tracker");
    await expect(tracker).toBeVisible();
    await expect(tracker.locator(".field-tracker__row.is-locked")).toHaveCount(1);
    await expect(tracker.locator(".field-tracker__row.is-locked")).toContainText(
      "Not yet available"
    );
  });
});

test.describe("ASSEMBLY, on a board where the opposition is respectable", () => {
  test("refuses the mob of the poor, and says who actually turned up", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_010,
      currentScreen: "assembly",
      activeActivitySourceId: "canal-reform-notices",
      sourceActivities: briefed("canal-reform-notices"),
      // The second board is where the finding is, so the first one is seeded solved rather than
      // played through here — `argument` has its own coverage in the misread ladder below.
    });
    await loadSeededSave(page);

    await expect(page.locator("h1")).toHaveText("Posted the Same Week");
    const argument = page.locator(".activity-assembly-board").first();

    // Rebuild board one, which is the gate on board two.
    for (const [fragment, slot] of [
      ["pledge", "drink-demand"],
      ["keeper", "drink-answer"],
      ["antislavery", "slavery-demand"],
      ["citizens", "slavery-answer"],
    ]) {
      await argument.locator(`[data-activity-fragment="${fragment}"]`).click();
      await argument.locator(`[data-activity-slot="${slot}"]`).click();
    }
    await expect(argument).toHaveClass(/is-solved/);

    const interest = page.locator(".activity-assembly-board").nth(1);
    await expect(interest).not.toHaveClass(/is-locked/);
    // The error the whole mission exists to correct. It has hints, so the paragraph is the third
    // rung — what matters here is that it is refused at all and that the nudge is about the
    // notice's own wording.
    await interest.locator('[data-activity-fragment="rabble"]').click();
    await interest.locator('[data-activity-slot="property"]').click();
    await expect(page.locator(".activity-misread")).toContainText("who it wants in the room");
  });
});
