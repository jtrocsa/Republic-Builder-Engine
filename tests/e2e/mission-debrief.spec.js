// Mission Debrief — the activity screen's third state, and the mirror of Mission Instructions.
//
// Banks the wiring the unit tests cannot see:
//
//   1. It opens the moment the closer lands, and only then. The gate is
//      `complete && activity.debrief && !entry.debriefed`, which is three conditions across two
//      files, and a mistake in any of them shows up as a screen that never appears or never leaves.
//   2. It reprints the filed conclusion's own `why`. That text is written on the board, and a player
//      moved straight off the board would otherwise never read it — the debrief takes the board's
//      completion footer's place, so it has to take the footer's job too.
//   3. Clearing it carries the player onward into the record, exactly as the footer's button did,
//      and marks the activity completed.
//   4. It is shown once per record and survives a reload, the same way `briefed` does.
import { expect, test } from "@playwright/test";
import { loadSeededSave, readProgress, seedProgress } from "./helpers/progress-seed.js";

const CASE_001 = {
  activeCaseId: "case-001",
  selectedCaseId: "case-001",
  unlocked: ["case-001"],
};

// Every account on the island taken, and the right conclusion filed — a finished interview, which
// is the only state the debrief opens on.
const FINISHED_INTERVIEW = {
  "taino-context": {
    state: {
      asked: {
        "taino-elder": ["decides"],
        "taino-gardener": ["grows"],
        "taino-fisher": ["trade"],
        "taino-child": ["grows"],
        columbus: ["gold"],
        "spanish-scribe": ["decides"],
        "spanish-sailor": ["trade"],
      },
      logged: {
        "taino-elder": ["decides"],
        "taino-gardener": ["grows"],
        "taino-fisher": ["trade"],
        "taino-child": ["grows"],
        columbus: ["gold"],
        "spanish-scribe": ["decides"],
        "spanish-sailor": ["trade"],
      },
      filed: "questions",
    },
    completed: false,
    briefed: true,
    debriefed: false,
  },
};

const finishedButDebriefed = () => ({
  "taino-context": {
    ...FINISHED_INTERVIEW["taino-context"],
    debriefed: true,
  },
});

test.describe("Mission Debrief", () => {
  test("closes a finished mission on what it did and did not establish", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: FINISHED_INTERVIEW,
    });
    await loadSeededSave(page);

    const debrief = page.locator(".mission-debrief");
    await expect(debrief).toBeVisible();
    // The board is gone — this is a state of the same screen, not a panel on it.
    await expect(page.locator(".activity-board")).toHaveCount(0);

    await expect(page.locator("h1")).toHaveText("The Question Nobody Asked");
    await expect(page.locator(".mission-brief__question")).toContainText(
      "What did the Spanish party fail to learn"
    );

    // The filed conclusion, and the `why` the board would never have got to show.
    const filed = page.locator(".mission-debrief__filed");
    await expect(filed).toContainText("what its makers thought to ask about");
    await expect(filed).toContainText(
      "What a record leaves out is usually a record of its own purpose"
    );

    // Both halves of an honest finding.
    await expect(page.locator(".mission-debrief__found")).toContainText(
      "answer what they are asked"
    );
    await expect(page.locator(".mission-debrief__open")).toContainText(
      "Whether the Spanish party could have understood"
    );
    // The open-questions array lands in the same list as `debrief.remains`.
    await expect(page.locator(".mission-debrief__open li")).toHaveCount(2);
  });

  test("separates documented history from Chronicle's own fiction", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: FINISHED_INTERVIEW,
    });
    await loadSeededSave(page);

    const record = page.locator(".mission-debrief__record");
    await expect(record.locator("dt.is-documented")).toHaveText("Documented");
    await expect(record.locator("dt.is-reconstructed")).toHaveText("Plausible reconstruction");
    await expect(record.locator("dt.is-fiction")).toHaveText("Chronicle fiction");
    await expect(record.locator("dt.is-debated")).toHaveText("Still debated");

    // The distinction that makes the policy worth having: the people are composites, the farming is
    // not, and the time travel is owned outright.
    await expect(record).toContainText("Taíno conuco agriculture");
    await expect(record).toContainText("They are composites");
    await expect(record).toContainText("Chronotravel");
  });

  test("hands the player on to the record, once, and stays cleared", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: FINISHED_INTERVIEW,
    });
    await loadSeededSave(page);

    await page.locator('[data-action="mission-debriefed"]').click();

    // Onward into the record itself — what the board's completion footer used to do.
    await expect(page.locator(".reader-shell")).toBeVisible();
    const progress = await readProgress(page);
    expect(progress.sourceActivities["taino-context"].debriefed).toBe(true);
    expect(progress.sourceActivities["taino-context"].completed).toBe(true);
    expect(progress.activeActivitySourceId).toBeNull();
  });

  test("does not reappear once cleared — the board and its footer come back instead", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: finishedButDebriefed(),
    });
    await loadSeededSave(page);

    await expect(page.locator(".mission-debrief")).toHaveCount(0);
    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page.locator(".activity-footer")).toContainText("Record stabilized");
  });

  test("waits for the mission to actually be finished", async ({ page }) => {
    // Coverage met but nothing filed: the closer is open and the debrief must not be.
    const unfiled = {
      "taino-context": {
        ...FINISHED_INTERVIEW["taino-context"],
        state: { ...FINISHED_INTERVIEW["taino-context"].state, filed: null },
      },
    };
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: unfiled,
    });
    await loadSeededSave(page);

    await expect(page.locator(".mission-debrief")).toHaveCount(0);
    await expect(page.locator(".activity-closer")).toBeVisible();
  });
});
