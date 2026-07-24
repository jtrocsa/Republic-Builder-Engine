import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, holdKey } from "./helpers/progress-seed.js";

// Scenario 4: field movement/collision + dialogue open/close (Case 1.01 Caribbean). This is
// where the real "camera is a pure function of position" regression check belongs — the Main
// Hall (hub-movement.spec.js) has no scroll/camera transform at all.

// FIELD_GRID = { columns: 40, rows: 24, tile: 40 } (main.js) — mirrors updateFieldPlayer()'s
// own camera formula so the test can independently recompute the expected transform from the
// player's current pixel position and assert the app's live value matches exactly (both are
// Math.round'ed integers, so an exact match is the right bar, not a fuzzy tolerance).
const TILE = 40;
const WORLD_WIDTH = 40 * TILE;
const WORLD_HEIGHT = 24 * TILE;

function parsePx(value) {
  return Number.parseFloat(value.replace("px", ""));
}

function parseTranslate(transform) {
  const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
  return { x: Number(match[1]), y: Number(match[2]) };
}

async function readFieldState(page) {
  const [playerStyle, worldTransform, viewportBox] = await Promise.all([
    page.locator("#caseFieldPlayer").evaluate((el) => ({ left: el.style.left, top: el.style.top })),
    page.locator("#caribbeanWorld").evaluate((el) => el.style.transform),
    page.locator("#caseFieldMap").boundingBox(),
  ]);
  return {
    px: parsePx(playerStyle.left),
    py: parsePx(playerStyle.top),
    camera: parseTranslate(worldTransform),
    viewport: viewportBox,
  };
}

function expectedCamera({ px, py, viewport }) {
  const minX = Math.min(0, viewport.width - WORLD_WIDTH);
  const minY = Math.min(0, viewport.height - WORLD_HEIGHT);
  return {
    x: Math.round(Math.max(minX, Math.min(0, viewport.width / 2 - px))),
    y: Math.round(Math.max(minY, Math.min(0, viewport.height / 2 - py))),
  };
}

test.describe("Field movement, collision, and dialogue", () => {
  test("movement updates position, camera stays a pure function of it, and NPC dialogue is proximity-gated", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // fieldMovement's module-level default is (20, 12) facing "down" — matches case-001's
    // declared spawn, so no extra positioning is needed for this case specifically.
    const initial = await readFieldState(page);
    expect(initial.camera).toEqual(expectedCamera(initial));

    // Distant NPC interaction attempt: clicking a far-away NPC should show a "too far" notice,
    // not open dialogue — taino-fisher (30.4, 15.1) is well outside the 1.45-tile reach from
    // the (20, 12) spawn.
    await page.locator('[data-npc="taino-fisher"]').click();
    await expect(page.locator("#fieldNotice")).toContainText("Move closer");
    await expect(page.locator(".field-speech-bubble")).toHaveCount(0);

    // Walk toward taino-elder (22.0, 10.9) — hold right+up together (diagonal).
    await page.keyboard.down("ArrowRight");
    await page.keyboard.down("ArrowUp");
    await page.waitForTimeout(700);
    await page.keyboard.up("ArrowRight");
    await page.keyboard.up("ArrowUp");

    const afterWalk = await readFieldState(page);
    expect(afterWalk.px).toBeGreaterThan(initial.px);
    expect(afterWalk.py).toBeLessThan(initial.py);
    // Camera purity: recomputed fresh from the new position, not carried over/accumulated.
    expect(afterWalk.camera).toEqual(expectedCamera(afterWalk));

    await page.locator('[data-npc="taino-elder"]').click();
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("Taíno community elder");

    await page.locator('[data-action="field-dialogue-close"]').click();
    await expect(bubble).toHaveCount(0);

    // Collision: "garden" (FIELD_BLOCKS: x1:17.6, y1:5.1, x2:22.8, y2:7.8) sits directly above
    // the player's current column (~x22) — holding ArrowUp long enough to cross it should stop
    // the player at its lower edge rather than passing through to y < 5.1.
    const beforeCollisionHold = afterWalk;
    await holdKey(page, "ArrowUp", 8000);
    const afterCollision = await readFieldState(page);
    // A generous "did move" margin (not tied tightly to exact frame timing, which varies under
    // parallel test-worker CPU load) — the meaningful check is the boundary bound below.
    expect(afterCollision.py).toBeLessThan(beforeCollisionHold.py - 15);
    expect(afterCollision.py).toBeGreaterThan(7.0 * TILE);
    expect(afterCollision.camera).toEqual(expectedCamera(afterCollision));
  });
});
