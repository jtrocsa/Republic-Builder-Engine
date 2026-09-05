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
    //
    // Waited for, not read straight away. The world mounts with `translate(0px, 0px)` and the
    // first `updateFieldPlayer()` writes the real camera a frame later; reading between the two
    // returns a camera of 0 against a player 964px into the map, which reads as the exact
    // regression this test exists to catch. Six workers held the page slow enough that the race
    // could not be lost. At two it can. See decision log `0092` §6.
    await expect
      .poll(async () => (await readFieldState(page)).camera.x, {
        message: "the first camera update never landed",
      })
      .not.toBe(0);
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

  test("a click that misses a control inside the bubble does not close it (regression)", async ({
    page,
  }) => {
    // Reported from a real playthrough as "the mission won't open — it just flickers and then goes
    // away," with the record button working from one part of its face and not another.
    //
    // The cause was click-away dismissal with no tolerance: handleAppClick() closed the dialogue
    // whenever `closest("[data-action]")` came back null, and that is null for everything in the
    // bubble that is not a control — the speaker's name, the line, the padding, and the few pixels
    // around the record button. So missing the button by a pixel did not do nothing, it destroyed
    // the bubble *and* the record offer together, which reads as a broken button rather than a miss.
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();
    expect(await walkToNpc(page, "taino-elder")).toBe(true);
    await page.locator('[data-npc="taino-elder"]').click();

    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await expect(page.locator('[data-action="start-source-activity"]')).toBeVisible();

    // Inside the bubble, on no control at all — the speaker's name. dispatchEvent for the same
    // reason the close button above uses it: where the bubble lands depends on where the walk parked
    // the player, and main.js delegates off #app so a bubbling event is the same code path.
    await bubble.locator("b").first().dispatchEvent("click");
    await expect(bubble).toBeVisible();
    await expect(page.locator('[data-action="start-source-activity"]')).toBeVisible();

    // Click-away itself still works — it just has to actually land away.
    await page.locator("#caribbeanWorld").dispatchEvent("click");
    await expect(bubble).toHaveCount(0);
  });

  // Phase 112. isHubBlocked() has excused a body the player is already standing inside since Phase
  // 64 — otherwise the overlap is permanent — and isFieldBlocked() never took the same clause. Two
  // ways to hit it. The narrow one is constant and about three pixels wide: an NPC checks itself
  // against the player with a 0.36-wide foot box and the player is blocked by a 0.42-wide one, so
  // between 0.70 and 0.76 tiles apart the NPC has legally stepped somewhere the player's own
  // collision calls occupied, and walking away was refused along with everything else.
  //
  // The wide one is this test, because it is reachable and it is a lock rather than a snag:
  // exitFieldInterior() restores `progress.fieldReturn` verbatim and never asks whether anybody has
  // since walked there. Canal Crossroads' lock keeper is stationed at (24.5, 20.2).
  test("a player put down on top of somebody can still walk away", async ({ page }) => {
    test.setTimeout(90_000);
    await seedProgress(page, {
      activeCaseId: "case-010",
      selectedCaseId: "case-010",
      unlocked: ["case-001", "case-010"],
      tutorial: { step: "complete", completed: true, skipped: false },
      currentScreen: "field",
      currentFieldRoom: "canal-print-shop",
      fieldReturn: { x: 24.5, y: 20.2, facing: "down" },
    });
    await loadSeededSave(page);
    await page.locator(".field-door--exit").click();
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // Standing inside the lock keeper's own foot box: his blocks x 24.08-24.92 by y 20.4-21.12, the
    // player's is x 24.16-24.84 by y 20.6-20.98. Confirmed against the running game rather than
    // asserted from the arithmetic alone.
    const overlapping = await page.evaluate(() => {
      const keeper = document.querySelector('[data-npc="canal-lock-keeper"]');
      const player = document.getElementById("caseFieldPlayer");
      if (!keeper || !player) return false;
      const at = (el) => [parseFloat(el.style.left), parseFloat(el.style.top)];
      const [kx, ky] = at(keeper);
      const [px, py] = at(player);
      return Math.abs(kx - px) < 24 && Math.abs(ky - py) < 24;
    });
    expect(overlapping).toBe(true);

    // The game's own predicate, read through the dev probe: the cell the player is standing in must
    // not report blocked, or every direction out of it is refused.
    const ownCellClear = await page.evaluate(() => {
      const nav = window.__chronicleNav("field");
      const col = Math.round(nav.at.x / nav.step);
      const row = Math.round(nav.at.y / nav.step);
      return nav.cells[row * nav.cols + col] === 0;
    });
    expect(ownCellClear).toBe(true);

    // And behaviourally: some way out exists. Every direction was refused before this fix, so any
    // one of them moving is the whole claim.
    const before = await readFieldState(page);
    let escaped = false;
    for (const key of ["ArrowUp", "ArrowLeft", "ArrowRight", "ArrowDown"]) {
      await holdKey(page, key, 320);
      const after = await readFieldState(page);
      if (Math.abs(after.px - before.px) > 4 || Math.abs(after.py - before.py) > 4) {
        escaped = true;
        break;
      }
    }
    expect(escaped).toBe(true);
  });

  // The other half of the same phase, and the same shape: updateInstitutePlayer() has taken a speed
  // since Phase 63 because a scripted walk moves at 2.2 rather than 3.65, and updateFieldPlayer()
  // passed the constant. The field's one non-constant case is the wall slide — a diagonal keeps both
  // normalised components only while both are free, so when one is blocked the body travels at 0.707
  // of full speed while the legs ran at full. That is the "skating" the ground-speed invariant
  // exists to prevent, in the one place nobody had instrumented.
  test("a diagonal held against a body runs the legs at the speed the body is actually moving", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    // One tile clear above Canal Crossroads' stationed lock keeper: the player's foot box is
    // y 19.4-19.78 against his 20.4-21.12, so down is blocked and the sideways component is not.
    await seedProgress(page, {
      activeCaseId: "case-010",
      selectedCaseId: "case-010",
      unlocked: ["case-001", "case-010"],
      tutorial: { step: "complete", completed: true, skipped: false },
      currentScreen: "field",
      currentFieldRoom: "canal-print-shop",
      fieldReturn: { x: 24.5, y: 19.0, facing: "down" },
    });
    await loadSeededSave(page);
    await page.locator(".field-door--exit").click();
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    const cycle = () =>
      page
        .locator("#caseFieldPlayerSprite")
        .evaluate((el) => Number.parseFloat(el.style.getPropertyValue("--sprite-cycle")));

    // Straight along a free axis: the full 3.65 tiles/s, so 1.1 / 3.65 = 0.301s.
    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(220);
    const free = await cycle();
    await page.keyboard.up("ArrowLeft");
    expect(free).toBeCloseTo(0.301, 2);

    // Now down-and-across, with down blocked by the keeper. The body slides at 0.707 x 3.65 = 2.58,
    // so the legs have to run at 1.1 / 2.58 = 0.426s and not at 0.301s.
    await page.keyboard.down("ArrowDown");
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(260);
    const slid = await cycle();
    await page.keyboard.up("ArrowRight");
    await page.keyboard.up("ArrowDown");
    expect(slid).toBeGreaterThan(free);
    expect(slid).toBeCloseTo(0.426, 1);
  });
});
