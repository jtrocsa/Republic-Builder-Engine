import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, holdKey, walkToNpc } from "./helpers/progress-seed.js";

// Scenario 4: field movement/collision + dialogue open/close (Case 1.01 Caribbean). This is
// where the real "camera is a pure function of position" regression check belongs — the Main
// Hall (hub-movement.spec.js) has no scroll/camera transform at all.

// FIELD_GRID = { columns: 56, rows: 36, tile: 48 } (main.js) — mirrors updateFieldPlayer()'s
// own camera formula so the test can independently recompute the expected transform from the
// player's current pixel position and assert the app's live value matches exactly (both are
// Math.round'ed integers, so an exact match is the right bar, not a fuzzy tolerance).
const TILE = 48;
const WORLD_WIDTH = 56 * TILE;
const WORLD_HEIGHT = 36 * TILE;

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

    // fieldMovement's module-level default is (28, 22) facing "down" — matches case-001's
    // declared spawn, so no extra positioning is needed for this case specifically.
    const initial = await readFieldState(page);
    expect(initial.camera).toEqual(expectedCamera(initial));

    // Distant NPC interaction attempt: clicking a far-away NPC should show a "too far" notice,
    // not open dialogue — taino-fisher (37.5, 17.5) is well outside the 1.45-tile reach from
    // the (28, 22) spawn.
    await page.locator('[data-npc="taino-fisher"]').click();
    await expect(page.locator("#fieldNotice")).toContainText("Move closer");
    await expect(page.locator(".field-speech-bubble")).toHaveCount(0);

    // Walk to taino-elder (30.0, 13.5). walkToNpc() reads both positions each step and moves along
    // the larger axis until the game's own `.is-near` class appears, rather than holding each arrow
    // for a fixed time: movement advances per animation frame, so a timed hold covers a different
    // distance under parallel-worker CPU load, and this walk was one of two in the suite that failed
    // intermittently for exactly that reason.
    expect(await walkToNpc(page, "taino-elder")).toBe(true);

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

    // Collision boundary. First step clear of the elder: isFieldBlocked() collides the player with
    // NPCs as well as rects, and walkToNpc() deliberately parks the player right against her, so
    // holding north from there pushes into her and moves nothing.
    await holdKey(page, "ArrowLeft", 900);
    const beforeCollisionHold = await readFieldState(page);

    // Then hold north until something stops the player — the principal dwelling's footprint or, if
    // that step went wide of it, the north lobe's own land mask. The assertion is deliberately about
    // the *class* of outcome rather than one named rect: this used to name "garden (x1:17.6, y1:5.1,
    // x2:22.8, y2:7.8)", coordinates from two map rebuilds ago that no longer exist anywhere.
    await holdKey(page, "ArrowUp", 8000);
    const afterCollision = await readFieldState(page);
    expect(afterCollision.py).toBeLessThan(beforeCollisionHold.py - 15);
    expect(afterCollision.py).toBeGreaterThan(3.0 * TILE);
    expect(afterCollision.camera).toEqual(expectedCamera(afterCollision));
  });
});
