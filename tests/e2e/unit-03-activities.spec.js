// Philadelphia's three missions (content/activities/unit-03-activities.js).
//
// activity-engines.spec.js banks the host contract on Case 1.01 and unit-02-activities.spec.js
// banks TRACE's ledger and `requiresSourceId`. This file covers only what Unit 3 adds:
//
//   1. ASSEMBLY's first all-label board chain. Unit 1's assembly is an image board that opens a
//      label board; here both are label boards, and `opensAfter` has never been exercised with no
//      picture underneath it.
//   2. Two fragments on one board that belong nowhere. Unit 1 ships a single distractor; this board
//      ships two, and the tray has to stay solvable with both of them in it.
//   3. A TRACE whose standing distractor is offered on all four legs and is the answer to none —
//      the same guard-rail shape as Riverbend's `labor-cost`, on a document rather than a cargo.
//   4. An INTERVIEW with six speakers in two panels, on a map whose cast is still placeholder art.
import { expect, test } from "@playwright/test";
import { briefed, loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

const CASE_007 = {
  activeCaseId: "case-007",
  selectedCaseId: "case-007",
  unlocked: ["case-001", "case-007"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

test.describe("ASSEMBLY, on two label boards", () => {
  test("keeps the second board shut until the first is rebuilt", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_007,
      currentScreen: "assembly",
      activeActivitySourceId: "commoncause-henry-speech",
      sourceActivities: briefed("commoncause-henry-speech"),
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--assembly")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("The Words as They Reached You");

    const boards = page.locator(".activity-assembly-board");
    await expect(boards).toHaveCount(2);
    // Both are label boards — there is no picture on this mission at all, because the evidence is
    // a chain of custody and inventing an image of one would be the error the mission is about.
    await expect(page.locator(".activity-assembly-board--image")).toHaveCount(0);
    await expect(page.locator(".activity-assembly-board--label")).toHaveCount(2);

    const second = boards.nth(1);
    await expect(second).toHaveClass(/is-locked/);
    await expect(second.locator(".activity-note--locked")).toBeVisible();
  });

  test("names two pieces that belong nowhere, and says why you expected them", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_007,
      currentScreen: "assembly",
      activeActivitySourceId: "commoncause-henry-speech",
      sourceActivities: briefed("commoncause-henry-speech"),
    });
    await loadSeededSave(page);

    const chain = page.locator(".activity-assembly-board").first();
    const misread = page.locator(".activity-misread");
    // The sharpest distractor in the mission: a shorthand transcript that every player reaches for
    // and that has never existed. Placing it has to fail, and the failure has to teach — but not
    // all at once. `hints` is a ladder (Phase 76, decision log 0059): a short nudge on the first
    // two wrong placements, the full paragraph from the third, so three misreads do not arrive
    // together at the moment a player is least able to read them.
    // A filled slot's button lifts rather than places, so each retry has to put the piece back in
    // the tray first. That is the real interaction, not a test artefact.
    const place = async (slot) => {
      const filled = chain.locator(".activity-slot.is-wrong");
      if (await filled.count()) await filled.first().click();
      await chain.locator('[data-activity-fragment="shorthand"]').click();
      await chain.locator(`[data-activity-slot="${slot}"]`).click();
    };
    await place("spoken");
    await expect(misread).toContainText("ask what it would look like if it existed");
    await place("remembered");
    await expect(misread).toContainText("piece everyone reaches for");
    await place("written");
    await expect(misread).toContainText("no such transcript");

    // The correct piece for that slot is the one thing about the occasion that is not in dispute.
    await chain.locator('[data-activity-fragment="convention"]').click();
    await chain.locator('[data-activity-slot="spoken"]').click();
    await expect(chain.locator('[data-activity-slot="spoken"]')).toContainText("Convention votes");
  });
});

test.describe("TRACE, following an order rather than a cargo", () => {
  test("offers an answer on every leg that is the answer to none of them", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_007,
      currentScreen: "trace",
      activeActivitySourceId: "commoncause-dunmore-proclamation",
      sourceActivities: briefed("commoncause-dunmore-proclamation"),
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--trace")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("Freedom on Conditions");
    const legs = page.locator(".activity-leg");
    await expect(legs).toHaveCount(4);

    // `emancipation-policy` is the intuitive misreading — Britain has decided to end slavery — and
    // the proclamation's own two conditions refuse it. It is offered on all four legs and is right
    // on none, so an edit that "fixes" a leg by handing it that answer deletes the point.
    for (let index = 0; index < 4; index += 1) {
      const leg = legs.nth(index);
      const distractor = leg.locator('[data-effect="emancipation-policy"]');
      await expect(distractor).toHaveCount(1);
      await distractor.click();
      await expect(distractor).toHaveClass(/is-wrong/);
      // And a wrong answer never opens the support question behind it.
      await expect(leg.locator(".activity-leg__support")).toHaveCount(0);
    }
  });

  test("asks the record question separately, and only after the world question lands", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_007,
      currentScreen: "trace",
      activeActivitySourceId: "commoncause-dunmore-proclamation",
      sourceActivities: briefed("commoncause-dunmore-proclamation"),
    });
    await loadSeededSave(page);

    // Leg three is this mission's version of Riverbend's first leg: the crossings are the largest
    // thing in the chain, they are heavily documented elsewhere, and this page contains none of
    // them. Both halves have to be sayable, and in that order.
    const crossing = page.locator(".activity-leg").nth(2);
    await expect(crossing.locator(".activity-leg__support")).toHaveCount(0);
    await crossing.locator('[data-effect="people-act"]').click();
    await expect(crossing.locator(".activity-leg__support")).toBeVisible();
    await crossing.locator('[data-support="established"]').click();
    await expect(crossing.locator('[data-support="established"]')).toHaveClass(/is-wrong/);
    await crossing.locator('[data-support="not-shown"]').click();
    await expect(crossing).toContainText("Chronicler who lets one document take credit");
  });
});

test.describe("INTERVIEW, in a square where two people were never asked", () => {
  test("sorts six speakers into the two panels the mission argues about", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_007,
      currentScreen: "interview",
      activeActivitySourceId: "commoncause-dickinson-letter",
      sourceActivities: briefed("commoncause-dickinson-letter"),
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("A Public Position");
    // The whole argument of the mission is which panel a person lands in, so the grouping is not
    // decoration — a cast rendered as one flat table says the opposite of what the closer asks.
    await expect(page.locator(".interview-group")).toHaveCount(2);
    await expect(page.locator(".activity-board--interview")).toContainText(
      "Positions nobody wrote down"
    );
  });
});
