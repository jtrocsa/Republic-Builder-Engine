// Fairmeadow's three missions (content/activities/unit-08-activities.js).
//
// The host contract is banked on Case 1.01, the arc machinery on Case 2.01, the indoor-speaker case
// on Case 6.01 and the notebook cap on Case 7.01, so this file covers only what Unit 8 adds:
//
//   1. **The game's first three-link record chain.** `suburb-neighborhood-appraisal` requires
//      `suburb-covenant-deed`; `suburb-underwriting-checklist` requires the appraisal. Every gate
//      before this one was a pair. The third link is a *reader* record behind an interior door, so
//      the chain also crosses a surface and an engine boundary, and nothing else in the suite walks
//      a lock whose own precondition is locked.
//   2. **A `gapRequiredFor` list on a map that has an interview.** Canal Crossroads shipped the list
//      form first and has no interview to mint evidence with, so its audit runs `requires: null`
//      throughout. This is the first audit that both demands a reason for *two* verdicts and fills
//      its evidence column from logged answers — which means a player can settle a line as
//      complicated while holding the account that complicates it.
//   3. **A TRACE with two `not-shown` legs, one at each end of the chain.** Riverbend established
//      that a leg the record cannot carry is the scored move; this one puts the statute at the head
//      of the file and the absence of an appeal at the tail, so the honest answer is the first thing
//      asked and the last.
//   4. **An interview with a speaker in each of two interiors.** Unit 6 put two in one room and
//      Unit 7 put one in the second room of two; this puts one in each, which is the widest
//      `fieldNpcById()` resolution across `fieldSurfaces()` has been asked for.
//
// tests/e2e/suburb-interiors.spec.js is a different file about the two rooms as rooms. This one is
// about what is played on the map they open off.
import { expect, test } from "@playwright/test";
import { briefed, loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

const CASE_022 = {
  activeCaseId: "case-022",
  selectedCaseId: "case-022",
  unlocked: ["case-001", "case-022"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

// Every speaker's one useful answer, logged. `asked` and `logged` are different lists and everything
// downstream counts `logged`, so this is the state of a player who put the right question to all
// eight and wrote every one of them down. Two of the eight are standing behind doors.
const EIGHT_ACCOUNTS = {
  "suburb-householder": ["in-force"],
  "suburb-sales-agent": ["in-force"],
  "suburb-committee-man": ["on-the-record"],
  "suburb-veteran": ["on-the-record"],
  "suburb-appraiser": ["the-line"],
  "suburb-borough-woman": ["the-line"],
  "suburb-township-clerk": ["who-asked"],
  "suburb-counter-clerk": ["who-asked"],
};

const interviewState = (kept, logged = EIGHT_ACCOUNTS) => ({
  "suburb-covenant-deed": {
    state: { asked: logged, logged, filed: null, notebook: { kept } },
    completed: false,
    briefed: true,
    debriefed: false,
  },
});

test.describe("INTERVIEW: eight people, and two of them are indoors", () => {
  test("puts one question to a speaker in each of the two rooms", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_022,
      currentScreen: "interview",
      activeActivitySourceId: "suburb-covenant-deed",
      sourceActivities: interviewState([], {}),
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("The Sixth Item");
    // Three panels, and the grouping is load-bearing rather than layout: the closer asks who is
    // enforcing a clause nobody enforces, and the answer is spread across all three.
    await expect(page.locator(".activity-board--interview")).toContainText("Fairmeadow");
    await expect(page.locator(".activity-board--interview")).toContainText("The borough");
    await expect(page.locator(".activity-board--interview")).toContainText(
      "The people who handle the paper"
    );

    // The two indoor speakers. Neither stands on the outdoor map, and both have to be reachable
    // here or the interview is asking its question only of the people who were never consulted.
    await expect(page.locator(".activity-board--interview")).toContainText("Vince Kearsley");
    await expect(page.locator(".activity-board--interview")).toContainText("Arlene Petrofsky");

    await expect(page.locator(".activity-copy__objective")).toContainText("8");
  });
});

test.describe("DISCREPANCY: a list-gated audit with a full evidence column", () => {
  test("fills the column from the interview and demands a reason for two verdicts", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_022,
      currentScreen: "discrepancy",
      activeActivitySourceId: "suburb-neighborhood-appraisal",
      sourceActivities: {
        // The evidence column is minted from the interview's *logged* answers, so the audit is
        // seeded with the interview finished. That is not a convenience: `requiresSourceId` on this
        // record makes it the real state of any player who can open the valuation at all.
        ...interviewState([]),
        ...briefed("suburb-neighborhood-appraisal"),
      },
    });
    await loadSeededSave(page);

    await expect(page.locator("h1")).toHaveText("First Grade, Fourth Grade");
    await expect(page.locator(".activity-claim")).toHaveCount(5);
    // Eight observations, every one keyed to a useful answer the interview's `requires` makes
    // unavoidable — so the column is full rather than reading "You did not gather this" eight times.
    await expect(page.locator(".activity-observation")).toHaveCount(8);
    await expect(page.locator(".activity-observation.is-missing")).toHaveCount(0);

    const claims = page.locator(".activity-claim");

    // The control, and an audit needs one. Resale at or above original price in every instance
    // examined is the single line on this sheet anybody could check against the same deed books,
    // and nothing gathered anywhere on the map touches it. `supported` settles it with no reason
    // asked, because `gapRequiredFor` does not name it.
    const resale = claims.nth(3);
    await resale.locator('[data-verdict="supported"]').click();
    await expect(resale).toHaveClass(/is-settled/);
    await expect(resale).toContainText("an audit that finds everything wrong is not an audit");

    // **The list half of `gapRequiredFor`.** A line can be exactly true and still not be telling you
    // what it appears to, and on this record that is three of the five lines. Marking one
    // complicated leaves it unsettled until a reason is given — which is the behaviour Canal
    // Crossroads' audit introduced and the first time it has run on a map that mints its own
    // evidence.
    const homogeneous = claims.nth(2);
    await homogeneous.locator('[data-verdict="supported"]').click();
    await expect(homogeneous).not.toHaveClass(/is-settled/);
    await homogeneous.locator('[data-verdict="complicated"]').click();
    await expect(homogeneous).not.toHaveClass(/is-settled/);
    await homogeneous.locator('[data-gap="consequence"]').click();
    await expect(homogeneous).toHaveClass(/is-settled/);
    await expect(homogeneous).toContainText("the direction the causation runs");

    // The line the player has walked across. The old township road crosses the expressway at grade
    // and is on the ground today; the appraiser rates the property as it will be. Contradicted, and
    // the reason is that the barrier has not been built yet.
    const barrier = claims.nth(1);
    await barrier.locator('[data-verdict="contradicted"]').click();
    await expect(barrier).not.toHaveClass(/is-settled/);
    await barrier.locator('[data-gap="not-yet"]').click();
    await expect(barrier).toHaveClass(/is-settled/);
    await expect(barrier).toContainText("fourteen months before it becomes true");
  });
});

test.describe("TRACE: the two legs the jacket cannot carry", () => {
  test("scores the honest answer at both ends of the chain", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_022,
      currentScreen: "trace",
      activeActivitySourceId: "suburb-gi-bill-loan-file",
      sourceActivities: briefed("suburb-gi-bill-loan-file"),
    });
    await loadSeededSave(page);

    await expect(page.locator("h1")).toHaveText("Step Five");
    const legs = page.locator(".activity-leg");
    await expect(legs).toHaveCount(6);

    // **Leg one.** Title III guaranteed a portion of a loan a private lender chose to make and lent
    // nothing itself, so an entitlement was worth what some bank would write — the single most
    // important fact about the programme, and not on this page. The effect is right and the support
    // is `not-shown`, which is the pair Riverbend's first leg established.
    const taken = legs.nth(0);
    await taken.locator('[data-effect="entitlement-priced"]').click();
    await taken.locator('[data-support="stated"]').click();
    await expect(taken).not.toHaveClass(/is-logged/);
    await taken.locator('[data-support="not-shown"]').click();
    await expect(taken).toHaveClass(/is-logged/);
    await expect(taken).toContainText("You know this from the statute");

    // **Step five itself.** The routing instruction that changes what the file is about, and the
    // least deliberate line in the jacket. `subject-changes`, and the jacket states it outright.
    const computed = legs.nth(2);
    await computed.locator('[data-effect="location-substituted"]').click();
    await expect(computed).not.toHaveClass(/is-logged/);
    await computed.locator('[data-effect="subject-changes"]').click();
    await computed.locator('[data-support="stated"]').click();
    await expect(computed).toHaveClass(/is-logged/);
    await expect(computed).toContainText("appraisal ordered upon the property described");

    // **The distractor that is the answer to no leg.** It is also the reading the whole mission
    // exists to refuse, which is why it sits on the board rather than being left off it.
    const declined = legs.nth(4);
    await declined.locator('[data-effect="applicant-at-fault"]').click();
    await expect(declined).not.toHaveClass(/is-logged/);
    await declined.locator('[data-effect="reason-emptied"]').click();
    await declined.locator('[data-support="inferred"]').click();
    await expect(declined).toHaveClass(/is-logged/);

    // **Leg six**, the other end. An argument from what is absent, and the mission says so in the
    // same breath as accepting it.
    const filed = legs.nth(5);
    await filed.locator('[data-effect="record-closed"]').click();
    await filed.locator('[data-support="not-shown"]').click();
    await expect(filed).toHaveClass(/is-logged/);
    await expect(filed).toContainText("an argument from absence is weaker");
  });
});

test.describe("the three-link chain", () => {
  // Every gate before this one was a pair: one record locked behind one other. Fairmeadow's runs
  // deed → appraisal → checklist, and the third link is a reader record behind the lending office
  // door — so the chain crosses a surface and an engine boundary as well as two locks.
  test.use({ viewport: { width: 1366, height: 768 } });

  test("locks the audit behind the deed and the checklist behind the audit", async ({ page }) => {
    test.setTimeout(120_000);
    await seedProgress(page, {
      currentScreen: "field",
      ...CASE_022,
      currentFieldRoom: "fairmeadow-building-and-loan",
      fieldReturn: { x: 37.0, y: 26.6, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#fairmeadowBuildingAndLoanTiledCanvas")).toBeVisible();

    // Nothing secured: the checklist is two locks deep, so its marker is not drawn even though the
    // player is standing in the room with it. The tracker still lists all seven, which is what tells
    // a player there is anything behind a door at all.
    await expect(page.locator(".source-signal--world")).toHaveCount(0);
    await expect(page.locator(".field-tracker li")).toHaveCount(7);
    // Two greyed rows, not one: the appraisal is locked by the deed and the checklist by the
    // appraisal, and both read the same way from here.
    await expect(page.locator(".field-tracker li", { hasText: "Not yet available" })).toHaveCount(
      2
    );
  });

  test("opens the checklist once both links above it are secured", async ({ page }) => {
    test.setTimeout(120_000);
    await seedProgress(page, {
      currentScreen: "field",
      ...CASE_022,
      currentFieldRoom: "fairmeadow-building-and-loan",
      fieldReturn: { x: 37.0, y: 26.6, facing: "up" },
      caseEvidence: {
        "case-022": ["suburb-covenant-deed", "suburb-neighborhood-appraisal"],
      },
    });
    await loadSeededSave(page);
    await expect(page.locator("#fairmeadowBuildingAndLoanTiledCanvas")).toBeVisible();

    // The desk draws its marker now, and no row is greyed.
    await expect(page.locator(".source-signal--world")).toHaveCount(1);
    await expect(page.locator(".field-tracker li", { hasText: "Not yet available" })).toHaveCount(
      0
    );
  });
});
