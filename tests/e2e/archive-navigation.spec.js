// Spine Review Part 5 — the Archive Room and the Navigation Table.
//
// Banks the four defects the Part 5 static audit found, each test named for its finding. See
// docs/playtest/part-05-archive-and-navigation-table.md. Every one of these passed nothing before
// Phase 90C because nothing looked: archive-room.spec.js walks the room and the terminal, and no
// spec had ever opened the Navigation Table screen at all.
import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, walkToHubTarget } from "./helpers/progress-seed.js";

const COMPLETE_TUTORIAL = { step: "complete", completed: true, skipped: false };

// The whole course open at once — the state a student is in by the end of the year, and the one
// the fold cases below are measured against. Written out for the same reason the tab count is:
// derived from UNITS, neither could notice a unit arriving.
const EVERY_UNIT = [
  "unit-01",
  "unit-02",
  "unit-03",
  "unit-04",
  "unit-05",
  "unit-06",
  "unit-07",
  "unit-08",
];
const EVERY_CASE = Array.from({ length: 24 }, (_, i) => `case-${String(i + 1).padStart(3, "0")}`);

test.describe("Part 5 · the Archive Room and the Navigation Table", () => {
  // P5-1. The numerator counted every archived case in the game; the denominator was a literal 3.
  // Six cases archived across two units therefore read "6/3 Unit 1 cases archived" in a room whose
  // neighbour, one door north, computed the same thing correctly.
  test("the Main Hall reports the selected unit, not Unit 1", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      selectedUnitId: "unit-06",
      // Two units' worth of archived cases: four of them, none in Unit 6.
      completedCases: ["case-001", "case-002", "case-003", "case-004"],
      unlocked: ["case-001", "case-016"],
      tutorial: COMPLETE_TUTORIAL,
    });
    await loadSeededSave(page);

    const panel = page.locator(".hub-sidepanel");
    await expect(panel).toContainText("Active researcher · Unit 6");
    await expect(panel).toContainText("0 / 3 cases archived");
    await expect(panel).not.toContainText("Unit 1");
    // The number that could not be true. Four completed cases against a denominator of three.
    await expect(panel).not.toContainText("4 / 3");

    // The meta bar carries the unit's *name*; the panel's own role line above carries its number.
    // It used to print both, which is where Part 11 took the duplicate from — the number is one
    // element up and the unit title is the half that says what you are working on.
    await expect(page.locator(".hub-meta")).toContainText("A Continent on Paper");
  });

  // P5-3. Both labels render at once, about eighty pixels apart on the same two tiles.
  test("the Archive Room's exit door gives one name, matching the door on the other side", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "archive",
      tutorial: COMPLETE_TUTORIAL,
    });
    await loadSeededSave(page);

    // Spawn is already inside the exit door's reach, so both labels are on screen together.
    const pill = page.locator('.hub-marker[data-hub-target="exitDoor"]');
    await expect(pill).toContainText("Main Hall");
    await expect(page.locator("#hubInteractPrompt")).toContainText("Main Hall");
    await expect(pill).not.toContainText("Leave Archive");

    // P5-4, same walk: the two rooms no longer share a headline.
    await expect(page.locator(".hub-intro h1")).toHaveText("Archive Room");
    await page.keyboard.press("e");
    await expect(page.locator("#instituteMap")).toBeVisible();
    await expect(page.locator(".hub-intro h1")).toHaveText("Institute Archive");
  });

  // P5-2. The table is at (18.5, 8) and safeInstituteSpawn()'s default is (11.5, 9), so the
  // old back link ended every visit seven tiles west of the object it was opened from.
  test("closing the Navigation Table leaves the player at the table", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      unlocked: ["case-001"],
      tutorial: COMPLETE_TUTORIAL,
    });
    await loadSeededSave(page);

    expect(await walkToHubTarget(page, "table")).toBe(true);
    const at = await page.evaluate(() => {
      const el = document.getElementById("institutePlayer");
      return { left: el.style.left, top: el.style.top };
    });

    await page.keyboard.press("e");
    await expect(page.locator(".archive-layout")).toBeVisible();
    await page.locator('[data-action="hub-return"]').click();
    await expect(page.locator("#instituteMap")).toBeVisible();

    const after = await page.evaluate(() => {
      const el = document.getElementById("institutePlayer");
      return { left: el.style.left, top: el.style.top };
    });
    expect(after).toEqual(at);
    // Still in reach of the thing they walked to, so a second press re-opens it.
    await expect(page.locator("#hubInteractPrompt")).toContainText("Navigation Table");
  });

  // P5-5. Six of the seven tabs sat below the fold, and the page grew a scrollbar to hold them.
  // This is the state Phase 90C measured when it fixed that and Phase 107 measured when it
  // re-checked it at eight units: the default save, Unit 1 selected, two cases unlocked. It is
  // not the worst state, and for nine phases it was the only one anything looked at. See below.
  test("every unit tab is reachable without scrolling", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "archive",
      unlocked: ["case-001", "case-016"],
      tutorial: COMPLETE_TUTORIAL,
    });
    await loadSeededSave(page);
    await expect(page.locator(".archive-layout")).toBeVisible();

    const tabs = page.locator(".unit-tab");
    // One per unit in main.js’s UNITS. Written out rather than derived because the whole point of
    // this case is that the strip has to hold every tab without the page growing a scrollbar, and a
    // count read from the same source as the tabs could never notice a unit being added.
    await expect(tabs).toHaveCount(8);

    const report = await page.evaluate(() => ({
      vh: window.innerHeight,
      scrollH: document.documentElement.scrollHeight,
      offscreen: [...document.querySelectorAll(".unit-tab")]
        .filter((el) => el.getBoundingClientRect().bottom > window.innerHeight)
        .map((el) => el.textContent.trim()),
    }));
    expect(report.offscreen).toEqual([]);
    expect(report.scrollH).toBeLessThanOrEqual(report.vh);

    // The date range moved to `title` rather than out of the game.
    await expect(tabs.first()).toHaveAttribute("title", /1491/);
  });

  // P5-5 again — and both measurements that closed it read the state above, which is the one state
  // that cannot reproduce the defect. The strip used to render *under* the selected unit's guiding
  // question, so where this screen's only navigation landed was a function of how long an author
  // had written: with Unit 8 selected and the course fully open, Periods 5 through 8 sat below the
  // fold at 1280x720, and the mark legend sat below it at 1366x768 too. The case above asserts
  // precisely that this cannot happen, and passed every run for nine phases.
  //
  // The gold button that starts the mission was worse. It sat under the case summary, which runs
  // from 18 words in Unit 1 to 79 in Unit 8, so on Units 7 and 8 the one control this screen exists
  // to offer was entirely below the fold at 1280x720 and clipped at 1366x768.
  //
  // Phase 117 put every control above the prose it used to sit under, in both columns, and pinned
  // the copy column to the top of its grid row instead of centring it against the panel beside it.
  // This walks all eight periods at both sizes a student actually gets. The last assertion is the
  // one that states the rule rather than a symptom: the strip does not move at all.
  for (const [w, h] of [
    [1280, 720],
    [1366, 768],
  ]) {
    test(`the strip, the legend and the way in stay on screen for every unit at ${w}x${h}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: w, height: h });
      await seedProgress(page, {
        currentScreen: "archive",
        unlocked: EVERY_CASE,
        tutorial: COMPLETE_TUTORIAL,
      });
      await loadSeededSave(page);
      await expect(page.locator(".archive-layout")).toBeVisible();

      const stripTops = new Set();
      for (const unit of EVERY_UNIT) {
        await page.locator(`[data-unit="${unit}"]`).click();
        const seen = await page.evaluate(() => {
          // Measured from the top of the document, always. Clicking a tab that is below the fold
          // makes Playwright scroll it into view, and every rect after that would be read against a
          // scrolled viewport — which is exactly the state in which a defect looks like a pass.
          window.scrollTo(0, 0);
          const rect = (sel) => document.querySelector(sel)?.getBoundingClientRect() || null;
          // How far past the bottom of the window this element's own bottom edge sits. Negative is
          // clearance; anything above zero is a control the student has to scroll to find, on a
          // screen whose middle column is a full-bleed map with no scroll affordance of its own.
          const past = (sel) => {
            const r = rect(sel);
            return r ? Math.round(r.bottom - window.innerHeight) : -1;
          };
          return {
            caseName: document.querySelector(".route-panel h2").textContent,
            stripTop: Math.round(rect(".archive-unit-tabs").top),
            offscreen: [...document.querySelectorAll(".unit-tab")]
              .filter((el) => el.getBoundingClientRect().bottom > window.innerHeight)
              .map((el) => el.textContent.trim()),
            legendPast: past(".archive-legend:not(.archive-unit-tabs)"),
            travelPast: past('.route-panel [data-action="travel"]'),
            miniPast: past('.route-panel [data-action="mini-games"]'),
          };
        });
        expect(seen.offscreen, `${unit}: period tabs below the fold`).toEqual([]);
        expect(seen.legendPast, `${unit}: the ✦/✓/○ legend is below the fold`).toBeLessThanOrEqual(
          0
        );
        expect(
          seen.travelPast,
          `${unit}: "${seen.caseName}" is opened by a button below the fold`
        ).toBeLessThanOrEqual(0);
        expect(seen.miniPast, `${unit}: the mini-game route is below the fold`).toBeLessThanOrEqual(
          0
        );
        stripTops.add(seen.stripTop);
      }
      // One value across all eight. The strip is where it is because of the chrome and the heading
      // above it, and for no other reason — not because of the unit it happens to be selecting.
      expect([...stripTops]).toHaveLength(1);
    });
  }
});
