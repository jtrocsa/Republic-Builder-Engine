// **A new screen opens at the top of itself, and the one you are on does not move under you.**
//
// render() replaces #app wholesale, and the browser keeps the document's scroll offset across that,
// clamped to what the new page can hold. Both halves of this rule follow from that one fact, and
// they pull in opposite directions — which is why they are one file rather than two.
//
// The defect it was written for is the closing screen of every mission in the game. A player works
// down a 3,320px interview board to the closer at its foot, standing at scroll 2,600. Picking the
// conclusion files it and opens the Mission Debrief, which is 1,462px — so the offset clamps to
// **742, the debrief's exact bottom.** The screen exists to reprint what they filed and the
// paragraph saying why it holds (a board's completion footer used to do that job, and the debrief
// took the job with the footer), and all of it opens above the top of the window. The one control
// in view is "Open <the record> →", so the natural next click carries them past the whole thing.
//
// The other half is the reason the fix is keyed to the view rather than to a call of render(): a
// board re-renders on every press, and throwing a student back to the heading each time they move a
// row would be a worse bug than the one being fixed. See `docs/decision-log/0124-a-new-screen-opens-at-its-top.md`.

import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave } from "./helpers/progress-seed.js";

const CASE_001 = {
  activeCaseId: "case-001",
  selectedCaseId: "case-001",
  unlocked: ["case-001"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

// Every account on the island taken and nothing filed — the state a player is in when they reach
// the closer at the foot of the board. Same shape as mission-debrief.spec.js's, one step earlier.
const ACCOUNTS = {
  "taino-elder": ["decides"],
  "taino-gardener": ["grows"],
  "taino-fisher": ["trade"],
  "taino-child": ["grows"],
  columbus: ["gold"],
  "spanish-scribe": ["decides"],
  "spanish-sailor": ["trade"],
};

const GATHERED_NOT_FILED = {
  "taino-context": {
    state: { asked: ACCOUNTS, logged: ACCOUNTS, filed: null },
    completed: false,
    briefed: true,
    debriefed: false,
  },
};

/** Where the player is standing on the page, and what that puts on their screen. */
const view = (page) =>
  page.evaluate(() => {
    const h1 = document.querySelector("main h1");
    const back = document.querySelector("main .back-link");
    return {
      scrollY: Math.round(window.scrollY),
      pageH: document.documentElement.scrollHeight,
      h1: h1 ? Math.round(h1.getBoundingClientRect().top) : null,
      back: back ? Math.round(back.getBoundingClientRect().top) : null,
    };
  });

test.describe("A new screen opens at the top of itself", () => {
  test("the Mission Debrief, opened from the closer at the foot of the board", async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: GATHERED_NOT_FILED,
    });
    await loadSeededSave(page);

    const closer = page
      .locator(".activity-option")
      .filter({ hasText: "That a record holds what its makers thought" })
      .first();
    await closer.scrollIntoViewIfNeeded();

    // Anti-vacuity, and the whole point of the test: a player who never had to scroll cannot show
    // this defect, and the assertion below would pass on any build. The closer is genuinely at the
    // foot of a board several screens tall.
    const board = await view(page);
    expect(board.pageH, "the interview board is several screens tall").toBeGreaterThan(3000);
    expect(board.scrollY, "reaching the closer means scrolling").toBeGreaterThan(1500);

    await closer.click();
    await expect(page.locator(".mission-debrief")).toBeVisible();

    const debrief = await view(page);
    expect(debrief.scrollY, "the debrief opens at its top").toBe(0);
    // Said again in the terms a player would use, so a failure names what is missing rather than a
    // number: the mission's name and the way back are both on the screen.
    expect(debrief.h1, "the mission's name is on screen").toBeGreaterThan(0);
    expect(debrief.back, "the way back is on screen").toBeGreaterThan(0);
    await expect(page.locator(".mission-debrief__conclusion")).toBeInViewport();
  });

  test("the record, opened from the debrief", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: {
        "taino-context": {
          ...GATHERED_NOT_FILED["taino-context"],
          state: { ...GATHERED_NOT_FILED["taino-context"].state, filed: "questions" },
        },
      },
    });
    await loadSeededSave(page);
    await expect(page.locator(".mission-debrief")).toBeVisible();

    // Down to the foot of the debrief first — the reader is 868px and the debrief 1,462, so an
    // offset carried across the change put the reader's back link 43px above the window.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    expect((await view(page)).scrollY, "the debrief is taller than the window").toBeGreaterThan(
      300
    );

    await page.locator('[data-action="mission-debriefed"]').click();
    await expect(page.locator(".reader-shell")).toBeVisible();

    const reader = await view(page);
    expect(reader.scrollY, "the record opens at its top").toBe(0);
    expect(reader.back, "the way back is on screen").toBeGreaterThan(0);
  });

  test("but a re-render of the screen you are on leaves you where you were", async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await seedProgress(page, { ...CASE_001, currentScreen: "practice-check" });
    await loadSeededSave(page);
    await expect(page.locator(".quest-practice-shell")).toBeVisible();

    // The counter-assertion, and the reason the fix is keyed to the view rather than to render():
    // every press on a board rebuilds #app, and a student ordering a sequencing quest four screens
    // down must not be thrown back to the heading between rows.
    const arrow = page.locator('[data-action="sequence-move"]').nth(6);
    await arrow.scrollIntoViewIfNeeded();
    const before = await view(page);
    expect(before.scrollY, "the row being ordered is well down the page").toBeGreaterThan(800);

    await arrow.click();
    await page.waitForTimeout(300);
    expect((await view(page)).scrollY, "answering does not move the page").toBe(before.scrollY);
  });
});
