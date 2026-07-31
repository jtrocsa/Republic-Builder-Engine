import { test, expect } from "@playwright/test";
import {
  holdKey,
  loadSeededSave,
  readProgress,
  seedProgress,
  walkToHubNpc,
} from "./helpers/progress-seed.js";

// The Institute's Entrance Hall — the room the player arrives in, and the first thing they control.
//
// boot-onboarding.spec.js walks the whole flow into here from a cold start; this seeds straight into
// the room so it can spend its assertions on the scene itself rather than re-clicking four director
// briefing screens. What is worth checking is everything the retired scripted walk could not have:
// that it is a real room with real collision, that the interaction is proximity-gated like every
// other one, and that the escort genuinely locks input rather than merely looking like it does.
const IN_THE_HALLWAY = {
  currentScreen: "institute",
  currentHubRoom: "hallway",
  tutorial: { step: "hallway" },
  profile: { name: "Test Player", appearance: "a" },
};

/** Player position in world px, from the inline style updateInstitutePlayer() patches. */
function playerPoint(page) {
  return page.evaluate(() => {
    const el = document.getElementById("institutePlayer");
    return { x: Number.parseFloat(el.style.left), y: Number.parseFloat(el.style.top) };
  });
}

test.describe("Institute Entrance Hall", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedProgress(page, IN_THE_HALLWAY);
    await loadSeededSave(page);
    await expect(page.locator(".institute-map--hallway")).toBeVisible();
  });

  test("draws the room's tile art, including its walk-behind overlay layer", async ({ page }) => {
    // The failure mode this catches is specific and silent: a sheet named in hallway.palette.js but
    // missing from resolveHallwayTilesetImage()'s globs makes createTilesetImageResolver() throw,
    // renderTiledMap() reject, and the whole room draw as an empty frame. Nothing else in this suite
    // would notice.
    await expect(page.locator("#hallwayTiledCanvas")).toHaveAttribute("data-rendered", "true");
    await expect(page.locator("#hallwayTiledCanvasOverlay")).toHaveAttribute(
      "data-rendered",
      "true"
    );
  });

  test("walks to the Director and gates the conversation on being close (normal case)", async ({
    page,
  }) => {
    // Standing at the doors, well outside the 1.1-tile reach: E must do nothing at all.
    await expect(page.locator("#hubInteractPrompt")).toBeHidden();
    await page.keyboard.press("e");
    await expect(page.locator(".hallway-dialogue")).toHaveCount(0);

    expect(await walkToHubNpc(page, "director")).toBe(true);
    await expect(page.locator("#hubInteractPrompt")).toHaveText("Press E · Director Rowan Hale");
    await page.keyboard.press("e");
    await expect(page.locator(".hallway-dialogue")).toBeVisible();
    await expect(page.locator(".hallway-dialogue__name")).toHaveText("Director Rowan Hale");
    // The prompt is the player's own affordance; it must not hang around offering an interaction
    // that is already happening.
    await expect(page.locator("#hubInteractPrompt")).toBeHidden();
  });

  test("clears the interaction prompt when the player walks back out of reach (edge case)", async ({
    page,
  }) => {
    expect(await walkToHubNpc(page, "director")).toBe(true);
    await expect(page.locator("#hubInteractPrompt")).toBeVisible();
    // Back south down the spine, away from him.
    await holdKey(page, "ArrowDown", 700);
    await expect(page.locator("#hubInteractPrompt")).toBeHidden();
  });

  test("stops the room's south wall from being walked through (edge case)", async ({ page }) => {
    // The room had no collision at all before Phase 62. Spawn is at y=15.3 and the south wall rect
    // starts at y=16, so pushing into it must move the player a little and then nothing.
    const before = await playerPoint(page);
    await holdKey(page, "ArrowDown", 1200);
    const after = await playerPoint(page);
    expect(after.y).toBeGreaterThan(before.y);
    expect(after.y).toBeLessThan(16 * 48);
  });

  test("walks the player in behind the Director and hands off to the Main Hall", async ({
    page,
  }) => {
    expect(await walkToHubNpc(page, "director")).toBe(true);
    await page.keyboard.press("e");
    const dialogue = page.locator(".hallway-dialogue");
    await expect(dialogue).toBeVisible();

    // Advance every beat. The last one ends the conversation and starts the escort.
    for (let i = 0; i < 12; i += 1) {
      if (!(await dialogue.isVisible().catch(() => false))) break;
      await dialogue.click();
      await page.waitForTimeout(40);
    }
    await expect(dialogue).toHaveCount(0);

    // The player deliberately holds for a beat while the Director gets a gap ahead — sampling
    // inside that window would read a stationary player and prove nothing either way. Wait for the
    // walk to actually be under way first.
    const startedAt = await playerPoint(page);
    await expect
      .poll(async () => (await playerPoint(page)).y, { timeout: 5000 })
      .toBeLessThan(startedAt.y);

    // Input is locked for the whole escort: pushing south must not pull the player back down the
    // room. Holding a key across two samples is what distinguishes a real lock from a walk that
    // merely happens to be heading the other way.
    const midWalk = await playerPoint(page);
    await holdKey(page, "ArrowDown", 400);
    const afterPush = await playerPoint(page);
    expect(afterPush.y).toBeLessThan(midWalk.y);

    // Ends in the Main Hall, at its own spawn, with the guided tour queued.
    await expect(page.locator(".institute-map--main-hall")).toBeVisible({ timeout: 15000 });
    const progress = await readProgress(page);
    expect(progress.currentHubRoom).toBe("main");
    expect(progress.tutorial.step).toBe("tour-intro");
  });

  test("replays the scene from the top when a save resumes mid-conversation (edge case)", async ({
    page,
  }) => {
    expect(await walkToHubNpc(page, "director")).toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator(".hallway-dialogue")).toBeVisible();

    await page.reload();
    await page.getByRole("button", { name: "Student" }).click();
    await page.getByRole("button", { name: "Load Save" }).click();

    // Back at the doors with the Director waiting, not stranded mid-beat with a dead typewriter and
    // no way to advance it.
    await expect(page.locator(".institute-map--hallway")).toBeVisible();
    await expect(page.locator(".hallway-dialogue")).toHaveCount(0);
    const spawned = await playerPoint(page);
    expect(spawned.y).toBeCloseTo(15.3 * 48, 0);
    expect(await walkToHubNpc(page, "director")).toBe(true);
  });
});
