// Cottonwood Junction's three missions (content/activities/unit-06-activities.js).
//
// The host contract is banked on Case 1.01 and the arc machinery on Case 2.01, so this file covers
// only what Unit 6 adds:
//
//   1. **Its interview names people standing indoors.** Every speaker in the three shipped
//      interviews is on an outdoor roster; two of these eight are behind the land office's counter,
//      and one of them is carrying the record the mission opens from. That works because
//      `fieldNpcById()` resolves across `fieldSurfaces()` — this is the assertion that says so, and
//      the unit test it pairs with is the `castOf()` widening in activity-content.test.js.
//   2. **The assembly's first board is five kinds of charge**, not three buckets, because an
//      ASSEMBLY slot takes exactly one fragment. The first draft of this mission put six charges in
//      one column and returned six schema errors; a later edit that quietly reintroduced a bucket
//      would be caught by `validate:content`, but a board that no longer *solves* would not.
//   3. **The trace turns on a leg the record cannot carry.** The office selling from the plat is the
//      largest thing in the chain and the field book contains none of it — the player only knows it
//      because `requiresSourceId` made them recover the receipt first. `fraud` is offered on every
//      leg and is the answer to none.
//   4. The map's one anomaly is a *confirmation* rather than an alteration, and it has to fire on the
//      survey and nowhere else.
//
// tests/e2e/railhead-interiors.spec.js is a different file about the two rooms as rooms. This one is
// about what is played in and around them.
import { expect, test } from "@playwright/test";
import { briefed, loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

const CASE_016 = {
  activeCaseId: "case-016",
  selectedCaseId: "case-016",
  unlocked: ["case-001", "case-016"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

// The four legs of the survey trace, answered correctly on both axes.
const SURVEY_LEDGER = {
  running: "description-becomes-line",
  platting: "line-becomes-authority",
  selling: "authority-becomes-title",
  reporting: "discrepancy-reported-not-resolved",
};
const SURVEY_SUPPORT = {
  running: "inferred",
  platting: "established",
  selling: "not-shown",
  reporting: "established",
};

test.describe("INTERVIEW, and the first speakers who are indoors", () => {
  test("puts four questions to eight people, three of them behind a counter or a plough", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_016,
      currentScreen: "interview",
      activeActivitySourceId: "railhead-land-office-receipt",
      sourceActivities: briefed("railhead-land-office-receipt"),
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("On Whose Paper");
    // Two panels, because the closer asks about the difference between them: people whose business
    // is the paper, and people standing on the ground it describes.
    await expect(page.locator(".interview-group")).toHaveCount(2);
    await expect(page.locator(".activity-copy__objective")).toContainText("8");

    const board = page.locator(".activity-board--interview");
    // The two in the land office. Nothing else in the suite would notice if a future edit narrowed
    // the speaker set back to the outdoor roster — the mission would simply have six people in it.
    await expect(board).toContainText("Elias Fenn");
    await expect(board).toContainText("Ezra Holt");
    // The register rule, which is stricter on this map than anywhere: the two Kanza characters are
    // named, in the first person, and are not labelled by what is being done to them.
    await expect(board).toContainText("Joseph Kahegah");
    await expect(board).toContainText("Willow Pahonka");
  });
});

test.describe("ASSEMBLY, on one man's month", () => {
  test("sorts six charges into five kinds, then opens the refusal board", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_016,
      currentScreen: "assembly",
      activeActivitySourceId: "railhead-construction-payroll",
      sourceActivities: briefed("railhead-construction-payroll"),
    });
    await loadSeededSave(page);

    await expect(page.locator("h1")).toHaveText("Whistle to Whistle");
    const charges = page.locator(".activity-assembly-board").first();
    for (const [fragment, slot] of [
      ["board", "service"],
      ["outfit", "sale"],
      ["tools", "deposit"],
      ["store", "credit"],
      ["levies", "levy"],
    ]) {
      await charges.locator(`[data-activity-fragment="${fragment}"]`).click();
      await charges.locator(`[data-activity-slot="${slot}"]`).click();
    }
    await expect(charges).toHaveClass(/is-solved/);

    const refusal = page.locator(".activity-assembly-board").nth(1);
    await expect(refusal).not.toHaveClass(/is-locked/);
    // The board's live distractor, and the one worth protecting: combining with the rest of the
    // section is real, is historical, and is not a line on a pay sheet. The clause that makes it
    // expensive is, and it has a column of its own two slots to the left.
    await refusal.locator('[data-activity-fragment="union"]').click();
    await refusal.locator('[data-activity-slot="outright"]').click();
    await expect(page.locator(".activity-misread")).toContainText(
      "This is a real thing men on this grade did"
    );
  });
});

test.describe("TRACE, on a boundary that is in two places", () => {
  test("refuses fraud on every leg, and marks the sale as something the book cannot show", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_016,
      currentScreen: "trace",
      activeActivitySourceId: "railhead-survey-field-book",
      sourceActivities: briefed("railhead-survey-field-book"),
    });
    await loadSeededSave(page);

    await expect(page.locator("h1")).toHaveText("Where the Line Is");
    await expect(page.locator(".activity-leg")).toHaveCount(4);

    // `fraud` is offered on every leg and is the answer to none. Without it the chain solves by
    // elimination, and it is exactly what a reader reaches for when a boundary turns out to have
    // moved — the deputy reported both lines in a signed book, which is what rules it out.
    const selling = page.locator(".activity-leg").nth(2);
    await selling.locator('[data-effect="fraud"]').click();
    await expect(selling).not.toHaveClass(/is-logged/);

    // Both axes, and the second is the mission. The page is excellent evidence for the platting and
    // for the deputy's own report, and contains not one word about what the office sold — which the
    // player knows anyway, because `requiresSourceId` made them recover the receipt first.
    await selling.locator('[data-effect="authority-becomes-title"]').click();
    await expect(selling).not.toHaveClass(/is-logged/);
    await selling.locator('[data-support="established"]').click();
    await expect(selling).not.toHaveClass(/is-logged/);
    await selling.locator('[data-support="not-shown"]').click();
    await expect(selling).toHaveClass(/is-logged/);
    await expect(selling).toContainText("a different document from a different desk");
  });
});

test.describe("the map's one anomaly", () => {
  test("flags a margin note that agrees with the deputy, from a year that has not happened", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_016,
      currentScreen: "trace",
      activeActivitySourceId: "railhead-survey-field-book",
      sourceActivities: {
        "railhead-survey-field-book": {
          state: {
            ledger: SURVEY_LEDGER,
            support: SURVEY_SUPPORT,
            filed: "two-forms",
            // The closer's correct option names the two legs the field book itself accounts for, so
            // a notebook without them files an unsupported conclusion and the mission does not end.
            notebook: { kept: ["platting", "reporting", "running"] },
          },
          completed: true,
          briefed: true,
          debriefed: false,
        },
      },
    });
    await loadSeededSave(page);

    const anomaly = page.locator(".mission-debrief__anomaly");
    await expect(anomaly).toBeVisible();
    await expect(anomaly.locator(".mission-debrief__noticed")).toContainText("1934");
    await expect(anomaly).toContainText("It corrects nothing");
    // Last on the screen: the one thing the mission does not resolve should be the note the player
    // leaves on. The arc close sits above it, because this record can be the last one filed.
    const sections = page.locator(".mission-brief__body > section");
    await expect(sections.last()).toHaveClass(/mission-debrief__anomaly/);
  });
});
