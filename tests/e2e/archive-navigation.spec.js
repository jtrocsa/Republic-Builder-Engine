// Spine Review Part 5 — the Archive Room and the Navigation Table.
//
// Banks the four defects the Part 5 static audit found, each test named for its finding. See
// docs/playtest/part-05-archive-and-navigation-table.md. Every one of these passed nothing before
// Phase 90C because nothing looked: archive-room.spec.js walks the room and the terminal, and no
// spec had ever opened the Navigation Table screen at all.
import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, walkToHubTarget } from "./helpers/progress-seed.js";

const COMPLETE_TUTORIAL = { step: "complete", completed: true, skipped: false };

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

    await expect(page.locator(".hub-meta")).toContainText("Unit 6 · A Continent on Paper");
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
  test("every unit tab is reachable without scrolling", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "archive",
      unlocked: ["case-001", "case-016"],
      tutorial: COMPLETE_TUTORIAL,
    });
    await loadSeededSave(page);
    await expect(page.locator(".archive-layout")).toBeVisible();

    const tabs = page.locator(".unit-tab");
    await expect(tabs).toHaveCount(7);

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
});
