// Nobody walks on the spot.
//
// "Ground speed drives the walk cycle, per body, per moment" is CLAUDE.md's rule, and this is its
// other half: a body covering no ground is standing. Three separate paths in the Institute left the
// walk cycle running under a body that had stopped, and all three were visible only while a
// scripted scene was up — because a scene is the one time in this game when nothing else repaints
// the room. `updateInstituteNpcs()` early-returns on `isHubSceneActive()`, the player's movement
// loop is stopped by `startHubScene()`, and `paintHubSceneFrame()` re-applies whatever flag was last
// written, sixty times a second, for as long as the scene runs.
//
// The claim below is one the interpreter makes exact rather than approximate. A scene holds on one
// command at a time: `say` is an `input` command and `moveActor` is a `signal` one, and the two
// cannot overlap. So **while a scene is holding for a line to be read, nothing in the room is
// moving** — every body in it is standing, by construction, and any walk cycle on screen is a lie.
//
// The continue indicator is that window. It is a state to ask the page about rather than a duration
// to wait out, which is the same reason hallway-onboarding.spec.js steps its beats by watching it.

import { test, expect } from "@playwright/test";

import { loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

const sceneBar = (page) => page.locator('[data-action="hub-scene-click"]');
const indicator = (page) => page.locator("#hubSceneIndicator");

/**
 * Every body in the room that is claiming to walk, by id.
 *
 * Both classes, because they drive different halves of the same lie: `.is-walking-npc` is the body
 * bob on the button, and `.character-sprite.is-walking` is the leg cycle inside it. A fix that
 * cleared one and not the other would still be a character marching in place.
 */
function bodiesWalking(page) {
  return page.evaluate(() => {
    const walking = (node) =>
      Boolean(
        node &&
        (node.classList.contains("is-walking-npc") ||
          node.querySelector(".character-sprite.is-walking"))
      );
    const found = [...document.querySelectorAll("[data-hub-npc]")]
      .filter(walking)
      .map((node) => node.dataset.hubNpc);
    const player = document.getElementById("institutePlayer");
    if (
      player?.classList.contains("is-walking-npc") ||
      document.getElementById("institutePlayerSprite")?.classList.contains("is-walking")
    ) {
      found.push("player");
    }
    return found;
  });
}

test.describe("a scene leaves nobody walking on the spot", () => {
  test.beforeEach(async ({ page }) => {
    // The typewriter goes instant, so a beat is one click rather than two and the indicator marks
    // the line rather than the end of typing it. It does not touch the escort, which walks in real
    // time either way — this test is about what the sprites say once it stops.
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("through the Director's tour, at both of its arrivals (normal case)", async ({ page }) => {
    // `tutorial.step: "tour"` is what the Entrance Hall leaves behind, and main.js's boot rewind
    // replays `director-tour` from the top when it finds a save in that state.
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "tour", completed: false, skipped: false },
      story: { liaisonTrust: 0, flags: {} },
    });
    await loadSeededSave(page);
    await expect(page.locator("#instituteMap")).toBeVisible();

    // **Two beats, and they are the two arrival shapes an escort has.** The tour's first line comes
    // after its first walk — the Director sets off for the Preservation Case before he says anything
    // about it — and on that leg the follower is still closing when the leader stops, so only the
    // follower's flag is left set. Its second line follows the two legs to the Archive Room door,
    // where the follower has held its gap the whole way and **both** bodies land on the same tick.
    // Between them that is every way `stepEscort()` can finish.
    //
    // It stops there rather than carrying on into Scene A, which this used to do. The extra eight
    // beats exercised the same completion again and cost twenty more seconds of continuous rAF on a
    // canvas — and measured against the two walk-heavy specs it shares its two workers with, that
    // made them fail two runs in three. The suite's walker still reads a slow frame as a stall
    // (`0118`, `0120` §7), so the cost of a long, busy test is paid by whatever is walking beside
    // it. See `0121` §7.
    for (let beat = 0; beat < 2; beat += 1) {
      await expect(indicator(page)).toBeVisible({ timeout: 20000 });
      // Anti-vacuity, and it pins the scene as well as the beat: a run that reached Voss, or a
      // silent bar, would be asserting about the wrong room.
      await expect(page.locator("#hubSceneName")).toHaveText("Director Rowan Hale");
      expect(
        await bodiesWalking(page),
        `beat ${beat}: the scene is holding for a line to be read, so nobody in the room is moving`
      ).toEqual([]);
      if (beat === 0) {
        await sceneBar(page).dispatchEvent("click");
        await page.waitForTimeout(80);
      }
    }
  });

  test("including the walkers it froze rather than only its own actors (regression)", async ({
    page,
  }) => {
    // The other half of the defect, and the half that needs a scene opened at a chosen moment.
    //
    // A scene suspends the NPC tick, so the room's two route walkers keep whatever `walking` they
    // were holding on the frame it started — and `paintHubSceneFrame()` re-applies it to them for
    // the entire scene. Both of the Main Hall's walkers are mid-stride roughly half the time, so a
    // test that simply opened a scene and looked would pass or fail on a coin toss.
    //
    // So the frame is chosen from inside the page: watch for the first frame somebody is actually
    // walking, and open the scene on that frame. The round trip out to the test and back is longer
    // than the stride, which is exactly the case CLAUDE.md says to ask the page about from inside it.
    //
    // `?warp=reveal` is the only state where walking up to Voss opens a scene rather than a dialogue
    // box, and it spawns the player already inside her reach — so the press is the whole trigger and
    // nothing has to be walked first.
    await page.goto("/?warp=reveal");
    await expect(page.locator("#institutePlayer")).toBeVisible();

    const caughtMidStride = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const deadline = performance.now() + 15000;
          const tick = () => {
            const walking = [...document.querySelectorAll("[data-hub-npc]")]
              .filter((node) => node.classList.contains("is-walking-npc"))
              .map((node) => node.dataset.hubNpc);
            if (walking.length) {
              // On this frame, not the next one. main.js listens on `window`.
              window.dispatchEvent(
                new window.KeyboardEvent("keydown", { key: "e", bubbles: true })
              );
              resolve(walking);
              return;
            }
            if (performance.now() > deadline) resolve([]);
            else requestAnimationFrame(tick);
          };
          tick();
        })
    );
    // Anti-vacuity again, and a real one: if nobody was ever mid-stride, the scene was opened on a
    // still room and the assertion below would hold whether the bug was fixed or not.
    expect(
      caughtMidStride.length,
      "nobody in the Main Hall walked in fifteen seconds — the route walkers have stopped walking"
    ).toBeGreaterThan(0);

    await expect(sceneBar(page)).toBeVisible();
    await expect(indicator(page)).toBeVisible({ timeout: 8000 });
    expect(
      await bodiesWalking(page),
      `the scene opened while ${caughtMidStride.join(", ")} was mid-stride, and froze the room around them`
    ).toEqual([]);
  });
});
