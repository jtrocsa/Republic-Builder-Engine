// The Codex — the archive that outlives a case.
//
// Until Phase 75 this screen was one case's secured sources, described in its own copy as
// "temporary records." It now also holds every mission filed with a defensible conclusion, kept
// permanently, plus the threads running between them. That is four pieces of wiring the unit tests
// cannot see, and this banks all four:
//
//   1. Filing happens on completion, through recordActivityOutcomes() — the one existing consumer
//      of activityOutcome(), which is why the blast radius is one function.
//   2. backfillCodex() at boot makes a save written before the key existed whole.
//   3. `progress.codex` survives a reload, which needs both a DEFAULT_PROGRESS entry *and* a line in
//      readProgress()'s merge list. Miss the second and it resets silently every load.
//   4. Cross-references only appear once two filed records share a tag, and a `seeAlso` pointer only
//      resolves against a record the player has actually filed.
import { expect, test } from "@playwright/test";
import { loadSeededSave, readProgress, seedProgress } from "./helpers/progress-seed.js";

const CASE_001 = {
  activeCaseId: "case-001",
  selectedCaseId: "case-001",
  unlocked: ["case-001"],
};

// Case 1.01's interview, finished: every account on the island logged, and the conclusion the
// record will bear filed.
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
    completed: true,
    briefed: true,
    debriefed: true,
  },
};

// Case 2.01's trace, finished — a second unit, which is what makes a thread cross-unit.
//
// Both axes since Phase 76 (what happens on the leg, and how far the page carries it), plus the
// notebook: the trace caps at three of four kept, and `dependence` names the two legs its argument
// actually rests on, so an entry-less seed is a mission that is not finished.
const FINISHED_TRACE = {
  "riverbend-ledger": {
    state: {
      ledger: {
        curing: "labor-cost",
        entering: "crown-revenue",
        crossing: "planter-credit",
        returning: "merchant-control",
      },
      support: {
        curing: "not-shown",
        entering: "established",
        crossing: "established",
        returning: "inferred",
      },
      notebook: { kept: ["entering", "crossing", "returning"] },
      filed: "dependence",
    },
    completed: true,
    briefed: true,
    debriefed: true,
  },
};

test.describe("the Codex", () => {
  test("is empty, and says what would fill it", async ({ page }) => {
    await seedProgress(page, { ...CASE_001, currentScreen: "codex" });
    await loadSeededSave(page);

    await expect(page.locator(".codex-shell")).toBeVisible();
    // Three sections, and the per-case satchel is only the first of them now.
    await expect(page.locator(".codex-section > h2")).toHaveText([
      "This case",
      "Filed records",
      "Cross-references",
    ]);
    await expect(page.locator(".codex-empty").first()).toContainText("Nothing filed yet");
    // No tally until there is something to tally.
    await expect(page.locator(".codex-tally")).toHaveCount(0);
  });

  test("files a finished mission on completion, and keeps it after a reload", async ({ page }) => {
    // Every account logged and *nothing filed*, so the closer is still open. The filing then runs
    // through the app's own recordActivityOutcomes() when the player clicks a conclusion — which is
    // the path this test exists for. Seeding a `filed` value instead would only prove that
    // backfillCodex() works, which the next test covers.
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: {
        "taino-context": {
          ...FINISHED_INTERVIEW["taino-context"],
          state: { ...FINISHED_INTERVIEW["taino-context"].state, filed: null },
          completed: false,
          debriefed: false,
        },
      },
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--interview")).toBeVisible();
    // Nothing filed, nothing in the archive. `readProgress` reads raw localStorage, which is still
    // the seed until the app writes — so the key is absent here rather than present and empty.
    expect(Object.keys((await readProgress(page)).codex || {})).toEqual([]);

    await page.locator('[data-activity-action="file"][data-option="questions"]').click();
    // The mission is now finished, so the debrief takes the board's place — and the record is filed.
    await expect(page.locator(".mission-debrief")).toBeVisible();

    const progress = await readProgress(page);
    const filed = progress.codex["case-001-interview-what-was-asked"];
    expect(filed.title).toBe("The Question Nobody Asked");
    expect(filed.unitId).toBe("unit-01");
    expect(filed.caseLabel).toBe("Case 1.01");
    expect(filed.tags).toContain("What the record leaves out");
    // The kept subset, snapshotted at filing time — the interview declares no capacity, so that is
    // everything it surfaced.
    expect(filed.evidence.length).toBeGreaterThan(0);

    // The merge-list entry, which is the half of a new progress key that fails silently.
    await page.reload();
    const afterReload = await readProgress(page);
    expect(afterReload.codex["case-001-interview-what-was-asked"].title).toBe(
      "The Question Nobody Asked"
    );
  });

  test("backfills a save written before the Codex existed", async ({ page }) => {
    // A finished mission and no `codex` key at all — which is every save in the wild before this
    // phase. backfillCodex() runs before the first render, so the archive is already whole.
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "codex",
      sourceActivities: FINISHED_INTERVIEW,
    });
    await loadSeededSave(page);

    const record = page.locator(".codex-record");
    await expect(record).toHaveCount(1);
    await expect(record.locator(".codex-record__title")).toHaveText("The Question Nobody Asked");
    await expect(record.locator(".codex-record__eyebrow")).toContainText(
      "Case 1.01 · The Interview"
    );
    await expect(record.locator(".codex-record__summary")).toContainText("because nobody asked");
    await expect(record.locator(".codex-record__conclusion")).toContainText("You filed");
    await expect(page.locator(".codex-tally")).toContainText("1 record");
    // One record cannot cross-reference itself, and the screen says so rather than showing nothing.
    await expect(page.locator(".codex-threads")).toHaveCount(0);
  });

  test("connects two filed records across units", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "codex",
      unlocked: ["case-001", "case-004"],
      sourceActivities: { ...FINISHED_INTERVIEW, ...FINISHED_TRACE },
    });
    await loadSeededSave(page);

    await expect(page.locator(".codex-record")).toHaveCount(2);
    // Grouped by unit, in the order the player filed them.
    await expect(page.locator(".codex-unit > h3")).toHaveCount(2);
    await expect(page.locator(".codex-tally")).toContainText("2 units");

    // The thread both records carry, and the reason the Codex exists: the same question turning up
    // on a Caribbean shore in 1492 and a Chesapeake landing in 1630.
    const thread = page.locator(".codex-thread.spans-units");
    await expect(thread).toHaveCount(1);
    await expect(thread.locator("h3")).toHaveText("What the record leaves out");
    await expect(thread.locator("li")).toHaveCount(2);
    await expect(thread.locator(".codex-thread__span")).toContainText("Across 2 units");
  });

  test("resolves a see-also only once both ends are filed", async ({ page }) => {
    // The trace points at the Riverbend interview — the record that can answer the question the
    // wharf account cannot. Filed alone, the pointer stays silent rather than naming a mission the
    // player has not reached.
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "codex",
      unlocked: ["case-001", "case-004"],
      sourceActivities: FINISHED_TRACE,
    });
    await loadSeededSave(page);

    await expect(page.locator(".codex-record")).toHaveCount(1);
    await expect(page.locator(".codex-record__see-also")).toHaveCount(0);
  });
});
