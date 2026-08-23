import { test, expect } from "@playwright/test";
import {
  walkTo,
  seedProgress,
  loadSeededSave,
  holdKey,
  walkToHubTarget,
} from "./helpers/progress-seed.js";

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

// hubCharacterStyle()'s inverse. HUB_GRID = { columns: 23, rows: 12, tile: 48 }.
//
// A plain divide since Phase 61: a hub character is now positioned at its collision anchor exactly,
// where this used to have to undo a half-tile x offset and a 0.54-tile y bias. Those offsets were
// the bug — they put the drawn character a tile down and half a tile right of where the game
// tested it — and this helper quietly encoded them, which is why the spec agreed with a render
// that had the Institute staff standing on the south wall.
const TILE = 48;
function hubTileFromStyle(left, top) {
  return { x: Number.parseFloat(left) / TILE, y: Number.parseFloat(top) / TILE };
}

async function readTileOf(page, selector) {
  const style = await page.locator(selector).evaluate((el) => ({
    left: el.style.left,
    top: el.style.top,
  }));
  return hubTileFromStyle(style.left, style.top);
}

async function readInstitutePlayerTile(page) {
  return readTileOf(page, "#institutePlayer");
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

    // Walk to the beacon before using it. Until Spine Review Part 6B this test clicked it from the
    // spawn, 6.3 tiles away, and the beacon obliged — it was the one world marker in the game with
    // no proximity gate, which is what 6B fixed. That reach is field-dialogue-lifecycle.spec.js's
    // subject; what *this* test is about is where the player is put down afterwards, so it just
    // walks there. walkTo() steers until the game's own `.is-near` appears, which the beacon
    // reports now.
    expect(await walkTo(page, ".recall-beacon", "caseFieldPlayer")).toBe(true);
    // dispatchEvent, not click(): the beacon lives inside the translated world div, so a real click
    // makes Playwright scroll it into view — and the field camera being a pure function of player
    // position, never of a scrolled element, is a standing invariant several past regressions came
    // from breaking. main.js delegates clicks off `#app`, so a dispatched bubbling event is the same
    // code path.
    await page.locator(".recall-beacon").dispatchEvent("click");
    // The beacon plays the recall warp (Phase 88A) and that warp waits for the player (Phase 88B),
    // so the walk back to the hall now runs through the arrival prompt. Where the player is put down
    // is what this test is about, and that is unchanged.
    const enter = page.getByRole("button", { name: "Enter the Archive →" });
    await expect(enter).toBeVisible({ timeout: 15_000 });
    await enter.click();
    await expect(page.locator("#instituteMap")).toBeVisible();
    await expect(page.locator("#hubInteractPrompt")).toContainText("Chronicle Navigation Table");
  });

  test("every interactable object is marked the same way, on its own footprint", async ({
    page,
  }) => {
    // Phase 59. The Institute had grown three unrelated treatments for one idea — a medallion for the
    // Navigation Table, the same class with a different glyph for the Archive Room door, and a
    // separate pill for the Preservation Case — so this asserts the shared class, the label, and the
    // property that made them shareable: the marker is sized from the object's painted tiles
    // (main.js hubMarkerStyle(), 48px tiles), not from a fixed hit rect.
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    await expect(page.locator(".hub-marker")).toHaveCount(3);
    for (const [target, label] of [
      ["table", "Navigation Table"],
      ["trophy", "Preservation Case"],
      ["archiveDoor", "Archive Room"],
    ]) {
      const marker = page.locator(`.hub-marker[data-hub-target="${target}"]`);
      await expect(marker.locator("b")).toHaveText(label);
      // No glyph child survives — a labelled, glowing object does not also need an icon.
      await expect(marker.locator("span")).toHaveCount(0);
    }

    // The Navigation Table's stamp is 3x2 tiles at (17,6); the plinth's is 2x2 at (3,2).
    const box = await page.locator('.hub-marker[data-hub-target="table"]').boundingBox();
    expect(box.width).toBeCloseTo(144, 0);
    expect(box.height).toBeCloseTo(96, 0);
  });

  // Phase 64. isHubBlocked() tested walls and furniture and deliberately not people, so the player
  // walked straight through Prof. Park while isHubNpcBlocked() had always refused to walk him
  // through the player. Banked end-to-end rather than as a unit test because the unit half
  // (isBlockedByBody, tests/unit/main-collision.test.js) can only assert the rect arithmetic — that
  // the movement loop actually consults it is a browser fact.
  test("a staff member is solid, and standing on one is not a trap", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#institutePlayer")).toBeVisible();

    // Spawn is (11.5, 9); the Director is stationed at (9.6, 8.6) and never moves. Walking west runs
    // the player into him, and the west wall is another eight tiles past that — so stopping short of
    // him at all is the assertion. hubFootBoxFor is 0.56 wide, so two bodies touch at a 0.56 gap.
    const director = await readTileOf(page, '[data-hub-npc="director"]');
    await holdKey(page, "ArrowLeft", 2500);
    const stopped = await readInstitutePlayerTile(page);
    expect(stopped.x - director.x).toBeGreaterThan(0.5);
    expect(stopped.x - director.x).toBeLessThan(1.0);

    // And the way out again. safeInstituteSpawn()'s default lands 0.4 tiles off one of Julian's
    // stops, so an overlap is a state the player really reaches — if a body the player is already
    // inside blocked them, every direction out of it would too and they would be stuck for good.
    await holdKey(page, "ArrowRight", 700);
    const escaped = await readInstitutePlayerTile(page);
    expect(escaped.x).toBeGreaterThan(stopped.x + 0.3);
  });

  // Phase 64: Dr. Soto was a station and read as furniture. She works the shelf run now — and stays
  // west of column 11, because cols 11-12 are the one lane from the foyer to the Archive Room door
  // and the first test in this file walks straight up it.
  test("Dr. Soto works her stacks and faces them while she reads", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator('[data-hub-npc="amani"]')).toBeVisible();

    const seen = [];
    for (let i = 0; i < 40; i += 1) {
      seen.push(
        await page.locator('[data-hub-npc="amani"]').evaluate((el) => ({
          x: Number.parseFloat(el.style.left) / 48,
          facing: el.dataset.facing,
          walking: el.classList.contains("is-walking-npc"),
        }))
      );
      await page.waitForTimeout(250);
    }

    const xs = seen.map((s) => s.x);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(1.5);
    expect(Math.max(...xs)).toBeLessThan(11);
    expect(seen.some((s) => s.walking)).toBe(true);
    // The whole point of the authored facing: stopped means reading the shelf in front of her, not
    // standing frozen facing whichever way she happened to arrive.
    const stoppedFacings = new Set(seen.filter((s) => !s.walking).map((s) => s.facing));
    expect([...stoppedFacings]).toEqual(["up"]);
  });
});
