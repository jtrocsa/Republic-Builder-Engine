// Scene D — the Meridian reveal, and the parts of it that only a browser can answer.
//
// The scene's own sequencing, its lines and its trigger data are unit-tested
// (tests/unit/cutscene.test.js, tests/unit/field-liaison.test.js). What lives here is host
// behaviour:
//
//   1. **The gate.** The reveal opens instead of Voss's ordinary line, exactly once, and only after
//      all three railhead missions have been debriefed. Before that she is the same character she
//      has always been — a dialogue box, not a scene.
//   2. **The costume.** `sheetFor()` resolves `liaison` to `liaison-meridian` the moment the flag is
//      set, and the flag is set in the middle of the scene rather than at the end so the player is
//      looking at her when it happens. That resolution runs through the sprite's inline
//      `background-image`, which is only real in a rendered page.
//
// It also pins the after-state on both surfaces, because the reveal is the one event in the game
// that changes what an existing NPC says and looks like on a map the player has already finished.

import { test, expect } from "@playwright/test";

import {
  beginFromTitle,
  loadSeededSave,
  seedProgress,
  walkToHubNpc,
  walkToNpc,
} from "./helpers/progress-seed.js";

/** The railhead's three missions — the records on case-016 that carry an activity. */
const RAILHEAD_MISSIONS = [
  "railhead-land-office-receipt",
  "railhead-construction-payroll",
  "railhead-survey-field-book",
];

const debriefed = (...ids) =>
  Object.fromEntries(ids.map((id) => [id, { briefed: true, completed: true, debriefed: true }]));

const CHRONICLE_COAT = /field-liaison-emery-voss-(?!meridian)/;
const MERIDIAN_COAT = /field-liaison-emery-voss-meridian/;

const sceneBar = (page) => page.locator('[data-action="hub-scene-click"]');
const vossSprite = (page) => page.locator('[data-hub-npc="liaison"] .character-sprite');

/** The Main Hall from a seeded save, with the player walked into Voss's reach. */
async function standBesideVoss(page, overrides) {
  await seedProgress(page, {
    currentScreen: "institute",
    currentHubRoom: "main",
    activeCaseId: "case-016",
    selectedCaseId: "case-016",
    story: { liaisonTrust: 3, flags: {} },
    ...overrides,
  });
  await loadSeededSave(page);
  await expect(page.locator("#instituteMap")).toBeVisible();
  expect(await walkToHubNpc(page, "liaison"), "Voss is unreachable from the spawn").toBe(true);
}

/** Holds a key down long enough for the movement loop to cover ground (see liaison-intro.spec.js). */
async function hold(page, key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
  await page.waitForTimeout(60);
}

/** The row a world node is drawn on, in tiles. */
async function rowOf(locator) {
  const style = await locator.getAttribute("style");
  return Number.parseFloat(/top:\s*([\d.]+)px/.exec(style || "")?.[1] ?? "NaN") / 48;
}

/**
 * Advances the scene by a number of lines.
 *
 * Two presses each: the first completes the typewriter, the second releases the line — the same
 * rhythm liaison-intro.spec.js walks.
 */
async function advance(page, lines) {
  for (let i = 0; i < lines * 2; i += 1) {
    await page.keyboard.press("e");
    await page.waitForTimeout(70);
  }
}

/**
 * Back into the save from scratch.
 *
 * Not `reloadIntoSave`: these tests arrive by `?warp=reveal`, and a reload keeps the query string,
 * so the warp fires again and resets the very progress the test is checking survived.
 */
async function reenterFromLanding(page) {
  await page.goto("/");
  await beginFromTitle(page);
  await page.getByRole("button", { name: "Student" }).click();
  await page.getByRole("button", { name: "Load Save" }).click();
  await expect(page.locator("#instituteMap")).toBeVisible();
}

test.describe("Scene D — the Meridian reveal", () => {
  test("opens from Voss once the railhead's three missions are filed", async ({ page }) => {
    await page.goto("/?warp=reveal");
    await expect(page.locator("#institutePlayer")).toBeVisible();

    // The nudge. The scene is an interaction rather than an arrival, so the room has to say there
    // is something to walk over to — otherwise the game's largest beat is one a player can miss.
    await expect(page.locator(".hub-meta")).toContainText("Emery Voss is waiting");

    await page.keyboard.press("e");
    await expect(sceneBar(page)).toBeVisible();
    await expect(page.locator("#hubSceneName")).toHaveText("Emery Voss");
    // A scene, not the ordinary dialogue box — the two must not both be up.
    await expect(page.locator(".hub-dialogue")).toHaveCount(0);
  });

  test("stays shut until every one of them is debriefed (edge case)", async ({ page }) => {
    // Two of three. The gate is "every mission on the case", and an off-by-one would fire the
    // reveal before the player has the third desk of the transaction it is about.
    await standBesideVoss(page, {
      sourceActivities: debriefed(RAILHEAD_MISSIONS[0], RAILHEAD_MISSIONS[1]),
    });

    await expect(page.locator(".hub-meta")).not.toContainText("Emery Voss is waiting");
    await page.keyboard.press("e");
    await expect(page.locator(".hub-dialogue")).toBeVisible();
    await expect(sceneBar(page)).toHaveCount(0);
  });

  test("turns her coat mid-scene, in front of the player", async ({ page }) => {
    await page.goto("/?warp=reveal");
    await page.keyboard.press("e");
    await expect(sceneBar(page)).toBeVisible();

    // Three lines stand before the flag: the transaction, the question she was asked, the admission.
    await expect(vossSprite(page)).toHaveAttribute("style", CHRONICLE_COAT);
    await advance(page, 3);

    // `setFlag` is instant, so the next painted frame draws her from the other sheet — while the
    // scene is still running, which is the whole point of putting the flag in the middle.
    await expect(vossSprite(page)).toHaveAttribute("style", MERIDIAN_COAT);
    await expect(sceneBar(page)).toBeVisible();
  });

  test("skip leaves her revealed, unlocked and not replayable", async ({ page }) => {
    await page.goto("/?warp=reveal");
    await page.keyboard.press("e");
    await expect(sceneBar(page)).toBeVisible();

    await page.getByRole("button", { name: "Skip scene" }).click();
    await expect(sceneBar(page)).toHaveCount(0);

    // §4's teardown rule: skip and natural completion end in the same world. The flag is the half
    // that would silently not happen, and the costume is what makes that visible.
    await expect(vossSprite(page)).toHaveAttribute("style", MERIDIAN_COAT);
    await expect(page.locator(".hub-meta")).not.toContainText("Emery Voss is waiting");

    // And the player is left at the Navigation Table, which is where watching it through leaves
    // them — she walks home alone at the end, so the last thing in reach is the table she was
    // standing at, not her.
    //
    // This asserted "Emery Voss" until Phase 90, and it was passing on a defect: `snapActor` moved
    // only the actor a command named, so a skipped escort left the player standing wherever the
    // scene had *started*, which here happens to be beside her post. Skip and watch disagreed about
    // where the player ended up, which is precisely what this test exists to rule out.
    await expect(page.locator("#hubInteractPrompt")).toContainText("Chronicle Navigation Table");

    await reenterFromLanding(page);
    await expect(sceneBar(page)).toHaveCount(0);
    await expect(vossSprite(page)).toHaveAttribute("style", MERIDIAN_COAT);
  });

  test("watched to the end, it hands the room back", async ({ page }) => {
    // The counterpart to the skip test, and the path a player actually takes. Worth its own run
    // because this scene ends on a `moveActor` with nothing said over it — the walk home — which is
    // exactly the shape where a scene can look finished while the interpreter is still holding.
    test.setTimeout(120_000);
    await page.goto("/?warp=reveal");
    await page.keyboard.press("e");
    await expect(sceneBar(page)).toBeVisible();

    for (let i = 0; i < 200 && (await sceneBar(page).count()) > 0; i += 1) {
      await page.keyboard.press("e");
      await page.waitForTimeout(140);
    }
    await expect(sceneBar(page)).toHaveCount(0);

    // Control back, in the coat, and she is home. Checked as a row rather than by walking to her:
    // the route from the table back to the north aisle goes around the Navigation Table's own
    // footprint, which field-liaison.spec.js already records as more than the walk helper's slide
    // heuristic can do. The claim is that she went home, not that a test robot can follow.
    //
    // Row ~4.5, and note she lands a tile west of `HUB_TARGETS.liaison`'s column: `findRoute` snaps
    // a start or goal off an occupied cell, and her own stationed post is one. Scene A has always
    // done the same. Nothing reads the literal for an NPC's proximity — `targetDistance` goes
    // through the runtime body — so the drift is invisible in play.
    await expect(vossSprite(page)).toHaveAttribute("style", MERIDIAN_COAT);
    expect(await rowOf(page.locator('[data-hub-npc="liaison"]'))).toBeLessThan(6);

    const before = await page.locator("#institutePlayer").getAttribute("style");
    await hold(page, "ArrowLeft", 260);
    expect(
      await page.locator("#institutePlayer").getAttribute("style"),
      "the player is still locked after the scene finished"
    ).not.toBe(before);
  });

  test("changes what she says afterwards at the Institute", async ({ page }) => {
    await standBesideVoss(page, {
      sourceActivities: debriefed(...RAILHEAD_MISSIONS),
      story: { liaisonTrust: 3, flags: { sawMeridianMark: true } },
    });

    // The post-reveal line supersedes the trust bands — trust 3 would otherwise play the "settled
    // record is only a well-kept one" line, which reads as though nothing had happened.
    await page.keyboard.press("e");
    await expect(page.locator(".hub-dialogue")).toContainText("Nothing I said about the work");
    await expect(sceneBar(page), "a seen scene replayed").toHaveCount(0);
  });

  test("says the second line on the railhead, wearing the mark", async ({ page }) => {
    test.setTimeout(60_000);
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-016",
      unlocked: ["case-001", "case-016"],
      tutorial: { step: "complete", completed: true, skipped: false },
      sourceActivities: debriefed(...RAILHEAD_MISSIONS),
      story: { liaisonTrust: 3, flags: { sawMeridianMark: true } },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // `revealedText` is the only second ambient line in the game, and Unit 6 is the only map that
    // carries one — the five below it keep their deniable-beat lines exactly as authored.
    expect(await walkToNpc(page, "liaison"), "Voss is unreachable from the spawn").toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator(".field-speech-bubble")).toContainText("She is Meridian");
    await expect(page.locator('[data-npc="liaison"] .character-sprite')).toHaveAttribute(
      "style",
      MERIDIAN_COAT
    );
  });
});
