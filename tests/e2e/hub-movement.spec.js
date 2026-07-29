import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, holdKey } from "./helpers/progress-seed.js";

// Scenario 2: Main Hall movement + INSTITUTE_HALL_BLOCKS collision.
//
// The Main Hall became a camera room in Phase 54 (institute-hall.tmj replacing the stretched
// `chronicle-institute-hub.png`), so this file reads the player's tile position back out of pixel
// positioning inside #hubWorld — the same shape as archive-room.spec.js. It used to invert
// percentage positioning against HUB_GRID's column/row count, which the camera rebuild retired.
//
// The camera-is-a-pure-function-of-position assertion still belongs to the field
// (field-movement-dialogue.spec.js), where the world is much larger than its viewport; here the
// 1104x672 world barely exceeds its frame, so the transform is near-static by design.

// hubPointStyle()'s inverse. HUB_GRID = { columns: 23, rows: 12, tile: 48 }, and
// institutePositionStyle() passes a yBias of 0.54.
const TILE = 48;
function hubTileFromStyle(left, top) {
  return {
    x: Number.parseFloat(left) / TILE - 0.5,
    y: Number.parseFloat(top) / TILE - 0.54,
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
  test("keyboard movement updates position and generated wall collision stops it", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#institutePlayer")).toBeVisible();

    // instituteMovement's module-level default is (11.5, 9) facing "up" — just inside the foyer
    // entrance in the south wall. Not part of `progress`, so it is the same on every cold boot
    // regardless of the seed.
    const initial = await readInstitutePlayerTile(page);
    expect(initial.x).toBeCloseTo(11.5, 1);
    expect(initial.y).toBeCloseTo(9, 1);

    // North out of the foyer, until the east "reading table" rect (y1: 6, y2: 8) stops the player.
    // The foot box starts 0.06 above the anchor, so the closest they get is y=8.06.
    await holdKey(page, "ArrowUp", 3000);
    const afterUp = await readInstitutePlayerTile(page);
    expect(afterUp.y).toBeCloseTo(8.06, 1);

    // Back down to the "south wall" rect (y1: 10.0) — the foot box is 0.44 tall below the anchor,
    // so the furthest reachable y is 9.56. This is the collision assertion the percentage-era
    // version of this test made against a research desk that no longer exists.
    await holdKey(page, "ArrowDown", 3000);
    const afterDown = await readInstitutePlayerTile(page);
    expect(afterDown.y).toBeCloseTo(9.56, 1);
  });

  test("the Navigation Table is proximity-gated and opens from the dais", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const prompt = page.locator("#hubInteractPrompt");
    // The spawn is ~7 tiles from HUB_TARGETS.table at (18.5, 7.0), well outside its 1.65 reach.
    await expect(prompt).toBeHidden();

    // Two hold-until-blocked moves, so this doesn't depend on the movement speed: east along the
    // south band until the "sealed record chest" rect (x1: 19) stops the player at x=18.72, then
    // north until the "navigation table" rect (y1: 5, y2: 7) stops them at y=7.06 — 0.23 from the
    // target. The dais is laid out so this straight approach exists; see the note on the south side
    // of the dais in scripts/generate-institute-hall-tmj.js.
    await holdKey(page, "ArrowRight", 6000);
    await holdKey(page, "ArrowUp", 3000);
    const arrived = await readInstitutePlayerTile(page);
    expect(arrived.x).toBeCloseTo(18.72, 1);
    expect(arrived.y).toBeCloseTo(7.06, 1);
    await expect(prompt).toContainText("Chronicle Navigation Table");

    await page.keyboard.press("e");
    await expect(page.locator(".atlas-table")).toBeVisible();
  });
});
