import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, holdKey } from "./helpers/progress-seed.js";

// Scenario 2: Main Hall movement + HUB_BLOCK_RECTS collision. The Main Hall has no
// scroll/camera transform (institutePositionStyle() is plain percentage left/top inside a
// fixed-size map) — the "camera is a pure function of position" assertion belongs to the
// field instead (see field-movement-dialogue.spec.js), where a real camera transform exists.

// HUB_GRID = { columns: 18, rows: 12 } (main.js) — institutePositionStyle()'s inverse, so the
// test can read the player's tile-space position back out of its inline percentage style.
function hubTileFromStyle(left, top) {
  const leftPct = Number.parseFloat(left);
  const topPct = Number.parseFloat(top);
  return {
    x: (leftPct / 100) * 18 - 0.5,
    y: (topPct / 100) * 12 - 0.54,
  };
}

async function readInstitutePlayerTile(page) {
  const style = await page.locator("#institutePlayer").evaluate((el) => ({
    left: el.style.left,
    top: el.style.top,
  }));
  return hubTileFromStyle(style.left, style.top);
}

test.describe("Main Hall movement", () => {
  test("keyboard movement updates position and HUB_BLOCK_RECTS collision stops it", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#institutePlayer")).toBeVisible();

    // instituteMovement's module-level default is (7, 9) facing "up" — not part of `progress`,
    // so it's the same on every cold boot regardless of the seed.
    const initial = await readInstitutePlayerTile(page);
    expect(initial.x).toBeCloseTo(7, 0);
    expect(initial.y).toBeCloseTo(9, 0);

    await holdKey(page, "ArrowRight", 500);
    const afterRight = await readInstitutePlayerTile(page);
    expect(afterRight.x).toBeGreaterThan(initial.x + 0.3);

    // "research desk" (HUB_BLOCK_RECTS: x1:1.85, y1:6.95, x2:5.35, y2:9.45) sits directly left
    // of the default spawn at the same y — holding ArrowLeft long enough to cross it should
    // stop the player at its right edge rather than passing through to the far side.
    await holdKey(page, "ArrowLeft", 4000);
    const afterLeft = await readInstitutePlayerTile(page);
    expect(afterLeft.x).toBeLessThan(afterRight.x);
    expect(afterLeft.x).toBeGreaterThan(4.3);
  });
});
