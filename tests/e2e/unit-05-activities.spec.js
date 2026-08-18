// Richmond's three missions (content/activities/unit-05-activities.js).
//
// The host contract is banked on Case 1.01 and the arc machinery on Case 2.01, so this file covers
// only what Unit 5 adds:
//
//   1. Its interview's answers are the evidence column of its audit, on a map four units away from
//      the one that pattern was built for — the third token-gated column in the game and the first
//      whose interview runs to seven speakers.
//   2. The assembly is a payroll, and its deepest correction is a distractor: that a factory running
//      on enslaved labour is something the war produced. It is not, and the board says why.
//   3. The map's one anomaly is a subtraction rather than an alteration — a name washed off a
//      desertion list — and it has to fire on the price board and nowhere else.
//
// tests/e2e/unit-05-missions.spec.js is a different file about Cases 5.02 and 5.03, which are
// non-map missions. This one is the field case.
import { expect, test } from "@playwright/test";
import { briefed, loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

const CASE_013 = {
  activeCaseId: "case-013",
  selectedCaseId: "case-013",
  unlocked: ["case-001", "case-013"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

// The requisition interview, finished: one useful account from each of the seven people.
const RICHMOND_ACCOUNTS = {
  "confederate-official": ["written"],
  "confederate-private": ["say"],
  "richmond-shopkeeper": ["kept"],
  "richmond-relief-society-woman": ["say"],
  "richmond-dock-laborer": ["after"],
  "richmond-seamstress": ["kept"],
  "richmond-free-black-barber": ["written"],
};

const finishedInterview = {
  "richmond-impressment-order": {
    state: { asked: RICHMOND_ACCOUNTS, logged: RICHMOND_ACCOUNTS, filed: "transaction" },
    completed: true,
    briefed: true,
    debriefed: true,
  },
};

test.describe("INTERVIEW, in a city that is writing everybody down", () => {
  test("sorts seven speakers into who writes and who is written about", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_013,
      currentScreen: "interview",
      activeActivitySourceId: "richmond-impressment-order",
      sourceActivities: briefed("richmond-impressment-order"),
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("What the Government Writes Down");
    // The two panels are the argument the closer asks about, so a flat table would say the opposite.
    await expect(page.locator(".interview-group")).toHaveCount(2);
    await expect(page.locator(".activity-progress")).toContainText("7");
    // The register rule: people are named, in the first person, not labelled by their condition.
    await expect(page.locator(".activity-board--interview")).toContainText("Peter Gowrie");
    await expect(page.locator(".activity-board--interview")).toContainText("Charlotte Vaughan");
  });
});

test.describe("DISCREPANCY, reading its column off the interview", () => {
  test("holds only what this player actually logged", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_013,
      currentScreen: "discrepancy",
      activeActivitySourceId: "richmond-price-board",
      sourceActivities: { ...finishedInterview, ...briefed("richmond-price-board") },
    });
    await loadSeededSave(page);

    await expect(page.locator("h1")).toHaveText("Two Hundred and Fifty Dollars");
    // Seven entries key off the seven useful answers the interview requires, so a player who came
    // by the normal route always has enough to audit with. Two more key off flat answers nobody has
    // to ask for, and this seed did not ask them.
    await expect(page.locator(".activity-observation")).toHaveCount(9);
    await expect(page.locator(".activity-observation.is-missing")).toHaveCount(2);
    await expect(page.locator(".activity-audit__observed")).toContainText("The money is.");
  });

  test("marks the coffee line supported, and the flour line not", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_013,
      currentScreen: "discrepancy",
      activeActivitySourceId: "richmond-price-board",
      sourceActivities: { ...finishedInterview, ...briefed("richmond-price-board") },
    });
    await loadSeededSave(page);

    const claims = page.locator(".activity-claim");
    await expect(claims).toHaveCount(5);

    // Coffee is the control: a supply fact with no currency in it, on the same board as a flour
    // line that has moved six times in a currency losing value all the way down. An audit that
    // found everything false would teach a student to distrust documents rather than read them.
    const coffee = claims.nth(1);
    await coffee.locator('[data-verdict="supported"]').click();
    await expect(coffee).toHaveClass(/is-settled/);
    await expect(coffee).toContainText("it is the control");

    const flour = claims.nth(0);
    await flour.locator('[data-verdict="supported"]').click();
    await expect(flour).not.toHaveClass(/is-settled/);
    await flour.locator('[data-verdict="contradicted"]').click();
    await flour.locator('[data-gap="incomplete"]').click();
    await expect(flour).toHaveClass(/is-settled/);
    await expect(flour).toContainText("His customers are not poorer than they were");
  });
});

test.describe("ASSEMBLY, on a payroll with three classes of men", () => {
  test("refuses the idea that the arrangement is something the war produced", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_013,
      currentScreen: "assembly",
      activeActivitySourceId: "richmond-tredegar-payroll",
      sourceActivities: briefed("richmond-tredegar-payroll"),
    });
    await loadSeededSave(page);

    await expect(page.locator("h1")).toHaveText("Three Sorts of Men");
    const columns = page.locator(".activity-assembly-board").first();
    for (const [fragment, slot] of [
      ["mechanic", "wages"],
      ["hired", "hire"],
      ["impressed", "nothing"],
    ]) {
      await columns.locator(`[data-activity-fragment="${fragment}"]`).click();
      await columns.locator(`[data-activity-slot="${slot}"]`).click();
    }
    await expect(columns).toHaveClass(/is-solved/);

    const equal = page.locator(".activity-assembly-board").nth(1);
    await expect(equal).not.toHaveClass(/is-locked/);
    // The board's deepest correction, and it is a piece that belongs nowhere: Anderson had been
    // hiring enslaved ironworkers since the 1840s and used them against his white mechanics when
    // they struck in 1847. The war added the third class, not the second.
    await equal.locator('[data-activity-fragment="wartime"]').click();
    await equal.locator('[data-activity-slot="same"]').click();
    await expect(page.locator(".activity-misread")).toContainText(
      "One of the three classes is new"
    );
  });
});

test.describe("the map's one anomaly", () => {
  test("flags the washed-out name, and only on the board it belongs to", async ({ page }) => {
    const settled = {
      flour: "contradicted",
      coffee: "supported",
      "free-market": "complicated",
      substitute: "cannot-tell",
      deserters: "complicated",
    };
    await seedProgress(page, {
      ...CASE_013,
      currentScreen: "discrepancy",
      activeActivitySourceId: "richmond-price-board",
      sourceActivities: {
        ...finishedInterview,
        "richmond-price-board": {
          state: {
            verdicts: settled,
            gaps: { flour: "incomplete", "free-market": "design", deserters: "perspective" },
            filed: "currency",
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
    await expect(anomaly.locator(".mission-debrief__noticed")).toContainText("twenty-one");
    await expect(anomaly).toContainText("the only place that name was ever written");
    // Last on the screen: it is the one thing the mission does not resolve, and it should be the
    // note the player leaves on.
    const sections = page.locator(".mission-brief__body > section");
    await expect(sections.last()).toHaveClass(/mission-debrief__anomaly/);
  });
});
