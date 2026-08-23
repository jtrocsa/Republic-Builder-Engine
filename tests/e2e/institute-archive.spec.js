import { expect, test } from "@playwright/test";
import { loadSeededSave, reloadIntoSave, seedProgress } from "./helpers/progress-seed.js";

// The Institute Archive — Spine Review Part 11 (decision log 0087).
//
// The Navigation Table's atlas, the Codex, and the status panel both hub rooms carry. The headline
// is an S1 that a unit test can prove and only a browser can prove *matters*: `.atlas-table` is
// `overflow: hidden`, so a marker projected outside its unit's map view is not merely misplaced —
// it cannot be clicked, and clicking a marker is the only way to select a case.

const EVERYTHING_OPEN = {
  unlocked: ["case-001", "case-016", "case-017", "case-018", "case-019", "case-020", "case-021"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

// One case per unit that used to project outside `atlantic-wide`: Unit 6's San Francisco at
// left -24.9%, Unit 7's Manila at 196.3%.
const UNREACHABLE = [
  ["unit-06", "case-018", "case-016"],
  ["unit-07", "case-020", "case-019"],
];

test.describe("the Navigation Table's atlas", () => {
  for (const [unitId, caseId, firstCaseId] of UNREACHABLE) {
    // P11-1. `select-unit` only ever selects a unit's *first* case and `unlockNext()` selects
    // nothing at all, so a marker off the map is a case with no way in.
    test(`can reach ${caseId}, which used to be clipped off ${unitId}'s map`, async ({ page }) => {
      await seedProgress(page, {
        ...EVERYTHING_OPEN,
        currentScreen: "archive",
        selectedUnitId: unitId,
        selectedCaseId: firstCaseId,
      });
      await loadSeededSave(page);

      const table = page.locator(".atlas-table");
      await expect(table).toBeVisible();

      const clipped = await page.evaluate(() => {
        const box = document.querySelector(".atlas-table").getBoundingClientRect();
        return [...document.querySelectorAll(".route-marker")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return (
              r.left < box.left || r.right > box.right || r.top < box.top || r.bottom > box.bottom
            );
          })
          .map((el) => el.dataset.case);
      });
      expect(clipped, "markers outside an overflow:hidden box are unclickable").toEqual([]);

      await page.locator(`.route-marker[data-case="${caseId}"]`).click();
      await expect(page.locator(`.route-marker[data-case="${caseId}"]`)).toHaveClass(/is-selected/);
      await expect(page.locator('.route-panel [data-action="travel"]')).toHaveAttribute(
        "data-case",
        caseId
      );
    });
  }
});

test.describe("a filed record in the Codex", () => {
  // P11-2, routed in from Part 8 as P8-5. Both of these were written for the debrief and read only
  // there — a screen behind a one-way `debriefed` flag, so a student met each of them once.
  const FILED = {
    ...EVERYTHING_OPEN,
    currentScreen: "codex",
    activeCaseId: "case-004",
    selectedCaseId: "case-004",
    codex: {
      "case-004-trace-one-hogshead": {
        activityId: "case-004-trace-one-hogshead",
        kind: "trace",
        title: "One Hogshead",
        summary: "A wharf book that stops being able to tell you where its own tobacco came from.",
        caseId: "case-004",
        caseLabel: "Case 2.01",
        unitId: "unit-02",
        unitLabel: "Colonial Crossroads",
        conclusion: "Dependence",
        supported: true,
        evidence: [],
        openQuestions: [],
        tags: [],
        seeAlso: [],
        anomaly: {
          noticed: "The entry reads fourteen hogsheads.",
          note: "Skimming, spoilage, a cask broken on the landing.",
        },
        historicalRecord: {
          documented: ["Virginia tobacco moved through consignment merchants."],
          reconstructed: ["The wharf book itself."],
          fiction: ["Chronotravel."],
        },
        filedAt: "2026-01-01T00:00:00.000Z",
      },
    },
  };

  test("carries the anomaly it flagged, and the liberties note", async ({ page }) => {
    await seedProgress(page, FILED);
    await loadSeededSave(page);

    const record = page.locator(".codex-record").first();
    await expect(record.locator(".codex-record__anomaly h4")).toHaveText(
      "Flagged for the Institute"
    );
    await expect(record.locator(".codex-record__noticed")).toContainText("fourteen hogsheads");

    // Collapsed by default — reference, not reading. Twenty-one of these open at once would bury
    // the archive they are filed in.
    const disclosure = record.locator(".codex-record__record");
    await expect(disclosure).not.toHaveAttribute("open", /.*/);
    await expect(disclosure.locator("summary")).toHaveText("The historical record");
    await disclosure.locator("summary").click();
    await expect(disclosure.locator("dd li").first()).toContainText("consignment merchants");
  });

  // P11-6, routed in from Part 9 as P9-7. The Codex's origin was a module-local, so a refresh reset
  // it and "← Return" walked the player out of the Institute and onto the map.
  test("returns to the Institute after a reload, not to the field", async ({ page }) => {
    await seedProgress(page, {
      ...EVERYTHING_OPEN,
      currentScreen: "institute",
      currentHubRoom: "archive",
      activeCaseId: "case-001",
      selectedCaseId: "case-001",
    });
    await loadSeededSave(page);
    await page.locator('.hub-sidepanel [data-action="codex"]').click();
    await expect(page.locator(".codex-shell")).toBeVisible();

    await reloadIntoSave(page);
    await expect(page.locator(".codex-shell")).toBeVisible();
    await page.locator('[data-action="return-codex"]').click();
    await expect(page.locator("#institutePlayer")).toBeVisible();
  });

  // P11-8. Ten of the twenty-one cases declare no `sources`, and on those this section was a
  // heading and a note over an empty grid.
  test("says why This case is empty rather than showing an empty grid", async ({ page }) => {
    await seedProgress(page, {
      ...EVERYTHING_OPEN,
      currentScreen: "codex",
      activeCaseId: "case-002",
      selectedCaseId: "case-002",
    });
    await loadSeededSave(page);
    await expect(page.locator(".codex-grid .codex-empty")).toContainText("no field records");
  });
});

test.describe("the Institute's status panel", () => {
  // P11-3, routed in from Part 5 as P5-10. Measured before the fix: the panel's own top edge sat at
  // y=593 of a 720px viewport in the Main Hall, so nothing in it was visible on arrival — the
  // Codex button, both progress counts and the controls legend were all below the fold.
  for (const room of ["main", "archive"]) {
    test(`is above the fold in the ${room} room`, async ({ page }) => {
      await seedProgress(page, {
        ...EVERYTHING_OPEN,
        currentScreen: "institute",
        currentHubRoom: room,
        activeCaseId: "case-001",
        selectedCaseId: "case-001",
      });
      await loadSeededSave(page);
      await expect(page.locator(".hub-sidepanel")).toBeVisible();

      const below = await page.evaluate(() => {
        const fold = window.innerHeight;
        return [
          ...document.querySelectorAll(
            ".hub-sidepanel button, .hub-controls, .hub-progress span, .hub-meta span"
          ),
        ]
          .filter((el) => el.getBoundingClientRect().bottom > fold)
          .map((el) => (el.className || el.tagName).toString());
      });
      expect(below, "hub status panel below the fold").toEqual([]);
    });
  }
});

test.describe("the Skill Mastery Record", () => {
  // P11-4. Phase 90H renamed the screen to "Practice Check" — the same three words as the button
  // that opens it — and left two screens naming the old one.
  test("names the Practice Check the way the Practice Check names itself", async ({ page }) => {
    await seedProgress(page, { ...EVERYTHING_OPEN, currentScreen: "mastery" });
    await loadSeededSave(page);
    const copy = page.locator(".mastery-shell .activity-copy");
    await expect(copy).toContainText("Practice Check");
    await expect(copy).not.toContainText("Sourcing Practice Check");
  });
});
