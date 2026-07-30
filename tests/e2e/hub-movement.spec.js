import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, holdKey, walkToHubTarget } from "./helpers/progress-seed.js";

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

    // Straight north up the hall's central spine, which Phase 58's re-lay left clear from the foyer
    // entrance to the Archive Room door — the storage band stops at cols 10 and 13, so nothing
    // stands in cols 11-12. So the thing that stops the player is the north wall rect (y2: 2.0), and
    // the foot box starts 0.06 above the anchor, making the limit y=2.06. Before the re-lay a
    // transcription table stopped this walk at y=8.06, one row out of the foyer.
    //
    // Bounds rather than an exact stop, deliberately. Movement advances by a fixed step per tick, so
    // the player halts at whatever fractional position the last legal step landed on — up to one
    // step short of the wall. Asserting the exact boundary makes the test a stopwatch reading; the
    // property that matters is "it moved, and it did not cross".
    await holdKey(page, "ArrowUp", 3000);
    const afterUp = await readInstitutePlayerTile(page);
    expect(afterUp.y).toBeGreaterThanOrEqual(2.06 - 0.001);
    expect(afterUp.y).toBeLessThan(2.6);

    // Back down to the "south wall" rect (y1: 10.0) — the foot box is 0.44 tall below the anchor, so
    // the limit is y=9.56. This is the collision assertion the percentage-era version of this test
    // made against a research desk that no longer exists.
    await holdKey(page, "ArrowDown", 3000);
    const afterDown = await readInstitutePlayerTile(page);
    expect(afterDown.y).toBeLessThanOrEqual(9.56 + 0.001);
    expect(afterDown.y).toBeGreaterThan(afterUp.y + 0.5);
  });

  test("the Navigation Table is proximity-gated and opens from the dais", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const prompt = page.locator("#hubInteractPrompt");
    // The spawn is 7 tiles from HUB_TARGETS.table at (18.5, 8.0), well outside its 1.65 reach.
    await expect(prompt).toBeHidden();

    // Walked rather than timed, and by reading the game's own proximity class rather than a
    // coordinate — see walkToHubTarget()'s comment for why the two timed holds this replaced could
    // not survive the room being re-laid.
    expect(await walkToHubTarget(page, "table")).toBe(true);
    const arrived = await readInstitutePlayerTile(page);
    expect(Math.hypot(arrived.x - 18.5, arrived.y - 8.0)).toBeLessThanOrEqual(1.65);
    await expect(prompt).toContainText("Chronicle Navigation Table");

    await page.keyboard.press("e");
    await expect(page.locator(".atlas-table")).toBeVisible();
  });

  test("the Preservation Case in the west alcove is reachable on foot", async ({ page }) => {
    // The bug this is banked from: Phase 54's layout sealed the hall's entire west end behind three
    // furniture runs, so the Preservation Case sat 3.3 tiles from the nearest cell a player could
    // stand on and simply could not be opened. field-map-coordinates.test.js now flood-fills the
    // generated collision and would catch the same defect in milliseconds — this is the end-to-end
    // half of that guard, walking the real movement loop across the whole room to the far target.
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    expect(await walkToHubTarget(page, "trophy")).toBe(true);
    await expect(page.locator("#hubInteractPrompt")).toContainText("Preservation Case");
    await page.keyboard.press("e");
    await expect(page.locator(".preservation-case")).toBeVisible();
  });

  test("recalling from the field lands the player at the Navigation Table", async ({ page }) => {
    // Phase 58: both recall paths used to arrive at the Archive Room door in the *north* wall, the
    // far corner of the hall from the object the player left through, so every return from
    // Chronotravel started with the same walk back across the room. Asserted through the prompt
    // rather than through coordinates, so it stays true if the dais moves.
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      unlocked: ["case-001"],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    // dispatchEvent, not click(): the beacon lives inside the translated world div, so a real click
    // makes Playwright scroll it into view — and the field camera being a pure function of player
    // position, never of a scrolled element, is a standing invariant several past regressions came
    // from breaking. main.js delegates clicks off `#app`, so a dispatched bubbling event is the same
    // code path.
    await page.locator(".recall-beacon").dispatchEvent("click");
    await expect(page.locator("#instituteMap")).toBeVisible();
    await expect(page.locator("#hubInteractPrompt")).toContainText("Chronicle Navigation Table");
  });
});
