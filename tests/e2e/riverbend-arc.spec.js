// The Riverbend arc — three records that turn out to be one story.
//
// Phase 77 built it out of the three missions that already existed, with no fourth cited source.
// What it added is three things no unit test can see, because all three are host-side gates on
// state the engines have no view of:
//
//   1. A lead appears on an answer only once that answer is in the Field Notebook, out in the
//      field bubble — the engine renders it, but only the host puts the bubble on a map.
//   2. The arc close rides the debrief of whichever mission is finished *last*, gated on every
//      activity in the case being in the Codex. That gate reads `progress.codex`, which is Phase
//      75's key, so this is the first thing that depends on two phases at once.
//   3. The anomaly is the last band of the debrief and belongs to exactly one record.
import { expect, test } from "@playwright/test";
import { loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

const CASE_004 = {
  activeCaseId: "case-004",
  selectedCaseId: "case-004",
  selectedUnitId: "unit-02",
  unlocked: ["case-001", "case-002", "case-003", "case-004"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

// The charter interview, finished: one useful account from each of the eight people.
const RIVERBEND_ACCOUNTS = {
  "settlement-minister": ["land"],
  "settlement-burgess": ["voice"],
  "wharf-clerk": ["passage"],
  "indentured-servant": ["owed"],
  "angolan-laborer": ["owed"],
  "settlement-goodwife": ["voice"],
  "powhatan-man": ["land"],
  "powhatan-woman": ["voice"],
};

const finishedCharter = (debriefed = true) => ({
  "riverbend-charter": {
    state: { asked: RIVERBEND_ACCOUNTS, logged: RIVERBEND_ACCOUNTS, filed: "by-the-head" },
    completed: true,
    briefed: true,
    debriefed,
  },
});

const LEDGER_LEDGER = {
  curing: "labor-cost",
  entering: "crown-revenue",
  crossing: "planter-credit",
  returning: "merchant-control",
};
const LEDGER_SUPPORT = {
  curing: "not-shown",
  entering: "established",
  crossing: "established",
  returning: "inferred",
};

const finishedLedger = (debriefed = true) => ({
  "riverbend-ledger": {
    state: {
      ledger: LEDGER_LEDGER,
      support: LEDGER_SUPPORT,
      notebook: { kept: ["entering", "crossing", "returning"] },
      filed: "dependence",
    },
    completed: true,
    briefed: true,
    debriefed,
  },
});

// The audit, finished. Its evidence column reads the charter interview's logged answers, so the
// charter has to be seeded alongside it.
const AUDIT_VERDICTS = {
  "sickness-country": "contradicted",
  "nothing-gotten": "contradicted",
  gruel: "supported",
  limbs: "supported",
  "thirty-two": "cannot-tell",
};
// `gapRequiredFor: "contradicted"` — the two contradicted claims each owe a second answer.
const AUDIT_GAPS = { "sickness-country": "he-was-wrong", "nothing-gotten": "not-one-place" };

test.describe("the Riverbend arc", () => {
  test("hands a lead over only once the answer is written down", async ({ page }) => {
    // The wharf clerk's useful answer carries the lead into the wharf book. Seeded as *asked but
    // not logged* first: hearing and keeping are two moves in this engine, and a lead handed over
    // on the strength of a question the player walked away from would be the one place that did
    // not hold.
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "interview",
      activeActivitySourceId: "riverbend-charter",
      sourceActivities: {
        "riverbend-charter": {
          state: { asked: { "wharf-clerk": ["passage"] }, logged: {}, filed: null },
          completed: false,
          briefed: true,
        },
      },
    });
    await loadSeededSave(page);

    // Two tables, not one: Riverbend's cast is grouped (the settlement and Tsenacommacah), and the
    // notebook renders one panel per group.
    await expect(page.locator(".interview-notebook")).toHaveCount(2);
    // An answer not yet written down shows as heard-not-recorded, so no lead with it either.
    await expect(page.locator(".is-lead")).toHaveCount(0);

    await page.evaluate(() => {
      const key = "republic-builder.chronicle.unit-01.v2";
      const saved = JSON.parse(window.localStorage.getItem(key));
      saved.sourceActivities["riverbend-charter"].state.logged = { "wharf-clerk": ["passage"] };
      window.localStorage.setItem(key, JSON.stringify(saved));
    });
    await page.reload();
    await page.getByRole("button", { name: "Student" }).click();
    await page.getByRole("button", { name: "Load Save" }).click();

    const lead = page.locator(".interview-notebook .is-lead");
    await expect(lead).toHaveCount(1);
    await expect(lead).toContainText("Ask him for the casks");
  });

  test("says nothing about the arc while a record is still open", async ({ page }) => {
    // Two of three filed. The debrief renders in full and the arc band is simply absent — the gate
    // is every activity in the case, not "this is the third screen you have seen".
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "trace",
      activeActivitySourceId: "riverbend-ledger",
      sourceActivities: {
        ...finishedCharter(),
        ...finishedLedger(false),
      },
    });
    await loadSeededSave(page);

    await expect(page.locator(".mission-debrief")).toBeVisible();
    await expect(page.locator(".mission-debrief__found")).toBeVisible();
    await expect(page.locator(".mission-debrief__arc")).toHaveCount(0);
  });

  test("closes the arc on whichever record the player finishes last", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "trace",
      activeActivitySourceId: "riverbend-ledger",
      caseEvidence: { "case-004": ["riverbend-charter"] },
      sourceActivities: {
        ...finishedCharter(),
        "riverbend-letter": {
          state: { verdicts: AUDIT_VERDICTS, gaps: AUDIT_GAPS, filed: "position" },
          completed: true,
          briefed: true,
          debriefed: true,
        },
        ...finishedLedger(false),
      },
    });
    await loadSeededSave(page);

    const arc = page.locator(".mission-debrief__arc");
    await expect(arc).toBeVisible();
    await expect(arc.locator("h2")).toHaveText("What the three records make together");
    await expect(arc).toContainText("not one of us sat down to write about the labor");
    await expect(arc).toContainText("three people who each thought they were recording something");
    // Spoken by whoever is standing there — the ledger's arc close is the clerk's.
    await expect(arc.locator("cite")).toHaveText("Wharf clerk");
  });

  test("flags the altered page, last, and only on the record it belongs to", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "trace",
      activeActivitySourceId: "riverbend-ledger",
      sourceActivities: finishedLedger(false),
    });
    await loadSeededSave(page);

    const anomaly = page.locator(".mission-debrief__anomaly");
    await expect(anomaly).toBeVisible();
    await expect(anomaly.locator("h2")).toHaveText("Flagged for the Institute");
    await expect(anomaly.locator(".mission-debrief__noticed")).toContainText("the figure was");
    await expect(anomaly).toContainText("Somebody else has been in it");
    // Last on the screen: it is the one thing the mission does not resolve, and it should be the
    // note the player leaves on.
    const sections = page.locator(".mission-brief__body > section");
    await expect(sections.last()).toHaveClass(/mission-debrief__anomaly/);
  });

  test("leaves the charter's debrief unflagged", async ({ page }) => {
    // One anomaly per map. The interview finishes with no band at all, which is what makes the
    // ledger's mean anything.
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "interview",
      activeActivitySourceId: "riverbend-charter",
      sourceActivities: finishedCharter(false),
    });
    await loadSeededSave(page);

    await expect(page.locator(".mission-debrief")).toBeVisible();
    await expect(page.locator(".mission-debrief__anomaly")).toHaveCount(0);
    await expect(page.locator(".mission-debrief__arc")).toHaveCount(0);
  });
});
