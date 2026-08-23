import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, briefed } from "./helpers/progress-seed.js";
import { UNIT_01_ACTIVITIES } from "../../apps/web/src/content/activities/unit-01-activities.js";

// The activity board — Spine Review Part 7 (decision log 0084).
//
// Part 7 walks the two states of the activity screen a student meets on the way *in*: Mission
// Instructions, and the board itself. The debrief is Part 8's.
//
// The content module is imported directly, which no other spec does. It is pure data with no
// imports of its own, and the alternative — hand-copying the ten fragment/slot pairs of Unit 1's
// assembly into this file — is a second copy of content that goes stale silently the first time
// somebody re-cuts the plate.

const CASE_001 = {
  activeCaseId: "case-001",
  selectedCaseId: "case-001",
  unlocked: ["case-001"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

const MAP = UNIT_01_ACTIVITIES["waldseemuller-map"];

/** Every fragment in the slot it belongs to — the state of a rebuilt plate. */
function solvedPlacement() {
  const placed = {};
  for (const board of MAP.boards) {
    placed[board.id] = {};
    for (const fragment of board.fragments) placed[board.id][fragment.belongs] = fragment.id;
  }
  return placed;
}

test.describe("the activity board", () => {
  // P7-2. The INTERVIEW board is the only one in the game with nothing on it to press: the asking
  // happens out on the map, in the field dialogue bubble, and this screen is the notebook it fills.
  // A first visit is a blank grid, an empty notebook and a locked closer, and until Part 7 nothing
  // on it said where the work was.
  test("says where an interview is actually conducted, until somebody has been asked", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: briefed("taino-context"),
    });
    await loadSeededSave(page);
    await expect(page.locator(".activity-board--interview")).toBeVisible();

    // The state that made this necessary: not one control on the board is live.
    await expect(page.locator(".activity-board--interview button:not([disabled])")).toHaveCount(0);
    await expect(page.locator(".activity-board__where")).toContainText("out in the field");

    // And it goes as soon as the grid has anything in it to read.
    await page.evaluate(() => {
      const KEY = "republic-builder.chronicle.unit-01.v2";
      const save = JSON.parse(localStorage.getItem(KEY));
      save.sourceActivities["taino-context"].state = {
        asked: { "taino-elder": ["gold"] },
        logged: {},
      };
      localStorage.setItem(KEY, JSON.stringify(save));
    });
    await page.reload();
    await loadSeededSave(page);
    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page.locator(".activity-board__where")).toHaveCount(0);
  });

  // P7-1. Unit 1's counter said "Islanders' accounts secured — 0 of 7" on a board that lists four
  // islanders and a three-strong Spanish party under their own headings. The first mission in the
  // game named one set of accounts and counted another.
  test("counts everyone the mission asks for, and says so", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: briefed("taino-context"),
    });
    await loadSeededSave(page);
    await expect(page.locator(".activity-progress")).toContainText("of 7");
    await expect(page.locator(".activity-progress")).not.toContainText("Islanders");
    // The three the old label left out are on the same screen, under their own heading.
    await expect(page.locator(".interview-group h4")).toHaveText([
      "The islanders",
      "The Spanish party",
    ]);
  });

  // P7-4. The same three steps are the Mission Instructions screen on the way in and a reference
  // copy in the board's copy column. They were headed differently, so a student looking for what
  // they had just read found something with another name.
  test("keeps one name for the instructions on both screens", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "assembly",
      activeActivitySourceId: "waldseemuller-map",
    });
    await loadSeededSave(page);
    await expect(page.locator(".mission-brief__steps h2")).toHaveText("Mission Instructions");
    await page.locator('[data-action="mission-briefed"]').click();
    await expect(page.locator(".activity-board--assembly")).toBeVisible();
    await expect(page.locator(".activity-howto h2")).toHaveText("Mission Instructions");
  });

  // P7-3. A finished mission's closer stayed live. `file` overwrites `state.filed` unconditionally
  // once the board is settled, so one click on a wrong option un-finished a record the Codex had
  // already filed and deliberately never unfiles — the board said wrong, the archive said filed.
  test("stops taking conclusions once the record is filed", async ({ page }) => {
    const right = MAP.closer.options.find((option) => option.correct);
    const wrong = MAP.closer.options.find((option) => !option.correct);
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "assembly",
      activeActivitySourceId: "waldseemuller-map",
      sourceActivities: {
        "waldseemuller-map": {
          briefed: true,
          debriefed: true,
          completed: true,
          state: { placed: solvedPlacement(), attempts: {}, selected: null, filed: right.id },
        },
      },
    });
    await loadSeededSave(page);
    await expect(page.locator(".activity-board--assembly")).toBeVisible();

    // The filed conclusion still reads as the filed conclusion — this is a record, not a reset.
    await expect(page.locator(`.activity-option[data-option="${right.id}"]`)).toHaveClass(
      /is-correct/
    );
    await expect(page.locator(".activity-closer")).toHaveClass(/is-settled/);
    await expect(page.locator(".activity-option")).toHaveCount(MAP.closer.options.length);
    await expect(page.locator(".activity-option:not([disabled])")).toHaveCount(0);

    // And the host still agrees it is finished.
    await expect(page.locator(".activity-footer")).toContainText("Record stabilized");

    // Belt and braces: even dispatched straight at the handler, the wrong option cannot land.
    await page.locator(`.activity-option[data-option="${wrong.id}"]`).dispatchEvent("click");
    await expect(page.locator(".activity-footer")).toContainText("Record stabilized");
    await expect(page.locator(`.activity-option[data-option="${right.id}"]`)).toHaveClass(
      /is-correct/
    );
  });
});
