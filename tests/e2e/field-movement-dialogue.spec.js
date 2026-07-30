import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, holdKey, walkToNpc } from "./helpers/progress-seed.js";

// Scenario 4: field movement/collision + dialogue open/close (Case 1.01 Caribbean). This is
// where the real "camera is a pure function of position" regression check belongs — the Main
// Hall (hub-movement.spec.js) has no scroll/camera transform at all.

// FIELD_GRID = { columns: 56, rows: 36, tile: 48 } (main.js) — mirrors updateFieldPlayer()'s
// own camera formula so the test can independently recompute the expected transform from the
// player's current pixel position and check the app's live value against it. See
// expectCameraTracksPosition() below for why that check allows exactly one pixel.
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

// One pixel of slack, per axis, and it is not a fudge — it is the most this test can actually
// resolve. updateFieldPlayer() rounds the camera from `fieldMovement.x * tile` at full float
// precision, but the only position the DOM exposes is fieldPositionStyle()'s `.toFixed(1)` of that
// same product. When the true value sits within 0.05 of a .5 boundary the two Math.round() calls
// legitimately disagree by one, and no amount of retrying changes that.
//
// The invariant is unharmed. What this guards against — a camera that accumulates, drifts, or gets
// dragged around by scrollIntoView() or a focus jump, which is how several past regressions
// presented — moves it by tens or hundreds of pixels, never by one.
function expectCameraTracksPosition(state) {
  const want = expectedCamera(state);
  expect(
    Math.abs(state.camera.x - want.x),
    `camera x ${state.camera.x} vs ${want.x}`
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs(state.camera.y - want.y),
    `camera y ${state.camera.y} vs ${want.y}`
  ).toBeLessThanOrEqual(1);
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
    expectCameraTracksPosition(initial);

    // Distant NPC interaction attempt: clicking a far-away NPC should show a "too far" notice,
    // not open dialogue — the canoe worker is 13.7 tiles from the (28, 22) spawn, well outside the
    // 1.45-tile reach.
    //
    // dispatchEvent, not click(), for the same reason the elder's bubble uses it further down: he
    // moved to the north-lobe shore at (39.0, 14.2) to stand beside the village canoe he talks
    // about, which puts him outside the camera's view of the spawn. A real click would land on the
    // world clip instead of the button — even forced, since that only skips the actionability
    // check and still aims at the coordinates. Dispatching delivers the event to the NPC, so the
    // thing under test — the game's own proximity gate rejecting it — is exercised as before.
    await page.locator('[data-npc="taino-fisher"]').dispatchEvent("click");
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
    expectCameraTracksPosition(afterWalk);

    await page.locator('[data-npc="taino-elder"]').click();
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("Taíno community elder");

    // dispatchEvent, not click(): the bubble is anchored to the NPC *inside* the translated world
    // div, so where its close button lands in the viewport depends on exactly where walkToNpc()
    // parked the player. A real click makes Playwright scroll it into view and then check that
    // nothing intercepts the centre point, and under parallel-worker load the player sometimes stops
    // a fraction further along and the button's centre falls outside `main`'s box — a test-harness
    // hit test, not a defect. main.js delegates clicks off `#app`, so a dispatched bubbling event is
    // the same code path, and it also avoids the scroll that the "camera is a pure function of
    // position" invariant this very test asserts would rather not happen.
    await page.locator('[data-action="field-dialogue-close"]').dispatchEvent("click");
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
    //
    // Held in short bursts until the player stops moving, rather than for one flat 8000ms. Movement
    // advances per animation frame, so a fixed duration covers a different distance depending on
    // how loaded the machine is — the same reason this file replaced its timed walks with
    // walkToNpc(), left unfinished here. Under enough parallel workers the flat hold simply did not
    // reach the collision it was asserting about, and the test failed for want of CPU rather than
    // for want of a wall.
    let previousPy = beforeCollisionHold.py;
    for (let burst = 0; burst < 20; burst += 1) {
      await holdKey(page, "ArrowUp", 500);
      const { py } = await readFieldState(page);
      if (py === previousPy) break;
      previousPy = py;
    }
    const afterCollision = await readFieldState(page);
    expect(afterCollision.py).toBeLessThan(beforeCollisionHold.py - 15);
    expect(afterCollision.py).toBeGreaterThan(3.0 * TILE);
    expectCameraTracksPosition(afterCollision);
  });
});
