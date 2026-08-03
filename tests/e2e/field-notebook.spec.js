// The Field Notebook, as the player actually meets it — beat 4 of the mission rhythm, rendered by
// all four engines immediately above the closer.
//
// Banks what the unit tests cannot reach, because it is wiring rather than reducer:
//
//   1. The panel is on screen at all. It renders below the fold at 1366x768, which is why the
//      visual-regression baselines did not move when it shipped — so nothing else in the suite
//      would have noticed if it silently rendered nothing.
//   2. It appears on more than one engine. Four engines call one shared renderer, and a mistake in
//      that call site is per-engine.
//   3. With no `notebook` declared in content — which is every activity as of Phase 72 — every
//      finding is kept and the panel offers no controls. That is what makes the whole phase
//      invisible to the six shipped missions, and it is the property most likely to be broken by
//      the first activity that *does* declare one.
//   4. `data-activity-action="keep"` reaches the reducer through main.js's action bag, which needed
//      a new `finding` key. A missing key there fails silently: the reducer refuses, the host sees
//      an unchanged state reference, and nothing happens.
import { expect, test } from "@playwright/test";
import { briefed, loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

const CASE_001 = {
  activeCaseId: "case-001",
  selectedCaseId: "case-001",
  unlocked: ["case-001"],
};

const CASE_004 = {
  selectedUnitId: "unit-02",
  activeCaseId: "case-004",
  selectedCaseId: "case-004",
  unlocked: ["case-001", "case-002", "case-003", "case-004"],
};

// Three of the island's accounts taken and written down. Deliberately not all seven: the notebook
// should list exactly what was logged, not what the mission is worth in total.
const THREE_LOGGED = {
  "taino-context": {
    state: {
      asked: {
        "taino-elder": ["decides"],
        "taino-gardener": ["grows"],
        "spanish-sailor": ["trade"],
      },
      logged: {
        "taino-elder": ["decides"],
        "taino-gardener": ["grows"],
        "spanish-sailor": ["trade"],
      },
      filed: null,
    },
    completed: false,
    briefed: true,
  },
};

test.describe("The Field Notebook", () => {
  test("lists what the player wrote down, and nothing they only heard", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: THREE_LOGGED,
    });
    await loadSeededSave(page);

    const notebook = page.locator(".evidence-notebook");
    await expect(notebook).toBeVisible();
    await expect(notebook.locator("h3")).toContainText("Field Notebook");

    // One entry per logged useful answer, attributed to whoever gave it.
    const entries = notebook.locator(".evidence-notebook__entry");
    await expect(entries).toHaveCount(3);
    await expect(notebook).toContainText("Taíno community elder");
    await expect(notebook).toContainText("Taíno gardener");
    await expect(notebook).toContainText("Spanish sailor");
    // The scribe was never asked, so nothing of his is being carried.
    await expect(notebook).not.toContainText("Spanish scribe");
  });

  test("is a read-only review while no mission declares a capacity", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: THREE_LOGGED,
    });
    await loadSeededSave(page);

    const notebook = page.locator(".evidence-notebook");
    // No selection step means no controls and no ratio — the panel is what you found, not a
    // decision. The moment content authors `notebook: { capacity }` this flips, which is the point.
    await expect(notebook.locator('[data-activity-action="keep"]')).toHaveCount(0);
    await expect(notebook.locator('[data-activity-action="release"]')).toHaveCount(0);
    await expect(notebook.locator("h3 em")).toHaveText("3");
  });

  test("renders on a second engine, from the same shared call", async ({ page }) => {
    // TRACE, whose findings are legs rather than testimony. If the shared renderer were wired into
    // only the engine it was written against, this is where that shows.
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "trace",
      activeActivitySourceId: "riverbend-ledger",
      sourceActivities: {
        "riverbend-ledger": {
          state: {
            // `curing` right, `entering` wrong: a leg only becomes a finding once it is entered
            // correctly, so this seeds exactly one.
            ledger: { curing: "not-established", entering: "planter-credit" },
            filed: null,
          },
          completed: false,
          briefed: true,
        },
      },
    });
    await loadSeededSave(page);

    const notebook = page.locator(".evidence-notebook");
    await expect(notebook).toBeVisible();
    // Only the legs entered correctly become findings. The seed has one right and one wrong.
    await expect(notebook.locator(".evidence-notebook__entry")).toHaveCount(1);
  });

  test("says so when nothing has been gathered yet (edge case)", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "discrepancy",
      activeActivitySourceId: "columbus-letter",
      sourceActivities: briefed("columbus-letter"),
    });
    await loadSeededSave(page);

    const notebook = page.locator(".evidence-notebook");
    await expect(notebook).toBeVisible();
    await expect(notebook.locator(".evidence-notebook__empty")).toContainText("Nothing yet");
    await expect(notebook.locator(".evidence-notebook__entry")).toHaveCount(0);
  });

  test("fills as the audit is settled, without a page change", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "discrepancy",
      activeActivitySourceId: "columbus-letter",
      sourceActivities: briefed("columbus-letter"),
    });
    await loadSeededSave(page);

    const notebook = page.locator(".evidence-notebook");
    await expect(notebook.locator(".evidence-notebook__entry")).toHaveCount(0);

    // "The lands are most fertile" is authored `supported` with no gap kind, so one click settles it.
    const claim = page.locator(".activity-claim").filter({ hasText: "most fertile beyond" });
    await claim.locator('[data-verdict="supported"]').click();

    await expect(claim).toHaveClass(/is-settled/);
    await expect(notebook.locator(".evidence-notebook__entry")).toHaveCount(1);
    await expect(notebook).toContainText("The conuco is the evidence for it");
  });
});
