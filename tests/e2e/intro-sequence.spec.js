// The intro as a player meets it: the Director's briefing, the Entrance Hall escort, the Main Hall
// tour, and Voss walking over.
//
// Banked from the manual pass that produced Phase 90, and it covers ground the neighbouring specs
// deliberately do not. hallway-onboarding.spec.js owns the Entrance Hall's own room and
// liaison-intro.spec.js owns the scripted-scene contract; what neither could see is the *seam* —
// whether the walk between two rooms looks like one continuous movement, which is what every one of
// the owner's reports was actually about.
//
// It is also the first coverage of `?warp=intro`, which was the one dev warp no spec named.

import { test, expect } from "@playwright/test";

import {
  seedProgress,
  loadSeededSave,
  holdKey,
  dismissCodexVeil,
} from "./helpers/progress-seed.js";

const SCENE_WALK_SPEED = 2.2; // main.js
const TILE = 48; // HUB_GRID.tile

/**
 * Centre of a world node, in world px. Null when it is not on screen.
 *
 * A character is positioned by its centre point, so its inline left/top *is* the point. A hub object
 * marker is not: since Phase 59 it is a rect laid over the object's own tiles, positioned by its
 * top-left corner and sized in px — so measuring a distance to its `left`/`top` is a distance to the
 * corner of the Preservation Case, half a tile out. `walkTo()` in the seed helper derives it the
 * same way and for the same reason.
 */
function nodePoint(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const left = Number.parseFloat(el.style.left);
    const top = Number.parseFloat(el.style.top);
    const width = Number.parseFloat(el.style.width);
    const height = Number.parseFloat(el.style.height);
    return {
      x: Number.isFinite(width) ? left + width / 2 : left,
      y: Number.isFinite(height) ? top + height / 2 : top,
    };
  }, selector);
}

/**
 * Samples a node's position every animation frame for `ms`, and reports the largest single-frame
 * jump alongside the total ground covered.
 *
 * Polling from the test side cannot see this: Playwright round-trips take tens of milliseconds, so
 * a one-frame teleport lands *between* two samples and reads as ordinary walking. The sampler has
 * to run in the page.
 */
async function trackNode(page, selector, ms) {
  return page.evaluate(
    async ([sel, duration]) => {
      const read = () => {
        const el = document.querySelector(sel);
        if (!el) return null;
        return { x: Number.parseFloat(el.style.left), y: Number.parseFloat(el.style.top) };
      };
      const samples = [];
      const started = performance.now();
      await new Promise((resolve) => {
        const tick = (now) => {
          const point = read();
          if (point) samples.push({ ...point, t: now });
          if (now - started >= duration) return resolve();
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      let biggest = { px: 0, ms: 16 };
      let travelled = 0;
      for (let i = 1; i < samples.length; i += 1) {
        const a = samples[i - 1];
        const b = samples[i];
        const px = Math.hypot(b.x - a.x, b.y - a.y);
        travelled += px;
        if (px > biggest.px) biggest = { px, ms: Math.max(1, b.t - a.t) };
      }
      return { biggest, travelled, samples: samples.length };
    },
    [selector, ms]
  );
}

test.describe("The intro, end to end", () => {
  test("?warp=intro opens on the Director's briefing", async ({ page }) => {
    // The one dev warp with no coverage until now. It is also the entry point the Spine Review's
    // play scripts open on, so a silent break here costs a review session rather than a bug.
    await page.goto("/?warp=intro");
    await expect(page.locator(".director-scene")).toBeVisible();
    await expect(page.locator(".director-dialogue-box__name")).toHaveText("Director Rowan Hale");
    // The warp skips the title outright rather than racing its 4.5s of animation.
    await expect(page.locator("#titleStage")).toHaveCount(0);
  });

  test("the briefing is two screens, and each says one thing", async ({ page }) => {
    // Pinned deliberately. The Director spoke sixteen beats before the player could move anything,
    // and the briefing was half of them; the cut is only worth making if it stays made.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?warp=intro");

    const box = page.locator(".director-dialogue-box");
    await expect(box).toBeVisible();
    const eyebrows = new Set();
    for (let i = 0; i < 30; i += 1) {
      // Exit conditions first: past the last briefing screen there is no `.director-scene` at all,
      // and reading its eyebrow would hang on a locator that never resolves.
      if (
        await page
          .locator('input[data-profile="name"]')
          .isVisible()
          .catch(() => false)
      )
        break;
      if (await dismissCodexVeil(page)) continue;
      if (!(await box.isVisible().catch(() => false))) break;
      const eyebrow = await page
        .locator(".director-scene__head .kicker")
        .textContent()
        .catch(() => null);
      if (eyebrow?.includes("briefing")) eyebrows.add(eyebrow.trim());
      // The dialogue box is a fixed three lines with overflow: hidden as of Phase 91, so a body
      // that grows past its budget is truncated in silence rather than breaking anything visible.
      // Checked on every fully-typed line, which under reduced motion is every line: during typing
      // the partial text is always shorter, so only the settled frame can overflow.
      const overflow = await page.locator("#directorLineText").evaluate((el) => ({
        scroll: el.scrollHeight,
        client: el.clientHeight,
        text: el.textContent.slice(0, 40),
      }));
      expect(
        overflow.scroll,
        `dialogue line is taller than its box and is being clipped: "${overflow.text}…"`
      ).toBeLessThanOrEqual(overflow.client + 1);
      await box.click();
      await page.waitForTimeout(30);
    }
    expect([...eyebrows].sort()).toEqual([
      "Director’s briefing · 01 / 02",
      "Director’s briefing · 02 / 02",
    ]);
  });

  // The three loops that walk the intro all advance by CLICKING the dialogue box, and the veil's own
  // click-anywhere dismissal covers that path for free. The keyboard is the path none of them touch,
  // and it is the one that fails silently: handleWindowKeydown's intro branch maps Enter to
  // director-dialogue-click unconditionally, so without its veil guard the briefing walks forward
  // behind a full-screen overlay and the player never sees it move.
  test("the Codex veil takes the keyboard, and gives it back", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?warp=intro");

    const box = page.locator(".director-dialogue-box");
    const veil = page.locator("#directorCodexVeil");
    await expect(box).toBeVisible();

    // Walk to the Codex line. Reduced motion resolves each line in one frame, so every click is a
    // whole line and the veil opens synchronously with the one that mentions it.
    for (let i = 0; i < 12 && !(await veil.isVisible().catch(() => false)); i += 1) {
      await box.click();
      await page.waitForTimeout(30);
    }
    await expect(veil).toBeVisible();

    const eyebrowBefore = await page.locator(".director-scene__head .kicker").textContent();
    const lineBefore = await page.locator("#directorLineText").textContent();

    // Enter must land on the veil, not on the dialogue behind it.
    await page.keyboard.press("Enter");
    await expect(veil).toHaveCount(0);
    expect(await page.locator(".director-scene__head .kicker").textContent()).toBe(eyebrowBefore);
    expect(await page.locator("#directorLineText").textContent()).toBe(lineBefore);

    // And the bar is interactive again: inert is off, and the Continue button still advances.
    await expect(page.locator(".director-scene__bar")).not.toHaveAttribute("inert", /.*/);
    await page.locator(".director-continue-button").click();
    await expect(page.locator(".director-scene__head .kicker")).not.toHaveText(eyebrowBefore);
  });

  test("the Entrance Hall escort never teleports the player onto the Director", async ({
    page,
  }) => {
    // The defect behind "the screen jumps, and the player jumps to the director". The follower's
    // own start was not on the escort's breadcrumb trail, so the first frame it engaged the player
    // was assigned a point on the Director's path outright — and the hub camera, a pure function of
    // player position, cut with them. escort-walk.test.js pins the arithmetic; this pins that the
    // real scene, with a real player standing wherever they stopped, does not do it either.
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "hallway",
      tutorial: { step: "hallway" },
      profile: { name: "Test Player", appearance: "a" },
    });
    await loadSeededSave(page);
    await expect(page.locator(".institute-map--hallway")).toBeVisible();

    // Walk up to him off-axis, so a snap onto his line shows as sideways movement rather than
    // hiding inside the walk's own direction.
    await holdKey(page, "ArrowUp", 1500);
    await holdKey(page, "ArrowLeft", 200);
    await expect(page.locator("#hubInteractPrompt")).toBeVisible();
    await page.keyboard.press("e");

    const bar = page.locator(".hallway-dialogue");
    await expect(bar).toBeVisible();
    for (let i = 0; i < 6; i += 1) {
      if (!(await bar.isVisible().catch(() => false))) break;
      await bar.dispatchEvent("click");
      await page.waitForTimeout(80);
    }

    // Through the whole escort. A frame may never cover more ground than the walk speed allows;
    // 2.5x is slack for a stalled frame, and the bug moved the player over a tile in one.
    const tracked = await trackNode(page, "#institutePlayer", 2200);
    expect(tracked.travelled, "the escort never moved the player at all").toBeGreaterThan(TILE);
    const allowedPerFrame = (SCENE_WALK_SPEED * TILE * tracked.biggest.ms) / 1000;
    expect(
      tracked.biggest.px,
      `single-frame jump of ${tracked.biggest.px.toFixed(1)}px over ${tracked.biggest.ms.toFixed(0)}ms`
    ).toBeLessThan(allowedPerFrame * 2.5);
  });

  test("the Main Hall tour walks the player to both landmarks and lights each one", async ({
    page,
  }) => {
    // It was four caption panels with the player pinned at the spawn, narrating objects across the
    // room. What matters now is that the player is actually taken to them — so this measures the
    // distance from the player to each marker at the moment its line is on screen.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "tour", completed: false, skipped: false },
      story: { liaisonTrust: 0, flags: {} },
    });
    await loadSeededSave(page);
    await expect(page.locator("#instituteMap")).toBeVisible();
    await expect(page.locator("#hubSceneName")).toHaveText("Director Rowan Hale");

    const bar = page.locator(".hallway-dialogue");
    const lit = page.locator(".hub-marker.is-scene-lit");

    // Beat one: the Preservation Case, with the player standing at it.
    await expect(lit).toHaveAttribute("data-hub-target", "trophy", { timeout: 20_000 });
    const atTrophy = await nodePoint(page, "#institutePlayer");
    const trophy = await nodePoint(page, '[data-hub-target="trophy"]');
    expect(Math.hypot(atTrophy.x - trophy.x, atTrophy.y - trophy.y)).toBeLessThan(3 * TILE);

    await bar.dispatchEvent("click");
    await page.waitForTimeout(80);
    await bar.dispatchEvent("click");

    // Beat two: the Archive Room door, at the other end of the room, so the player has moved.
    await expect(lit).toHaveAttribute("data-hub-target", "archiveDoor", { timeout: 20_000 });
    const atDoor = await nodePoint(page, "#institutePlayer");
    const door = await nodePoint(page, '[data-hub-target="archiveDoor"]');
    expect(Math.hypot(atDoor.x - door.x, atDoor.y - door.y)).toBeLessThan(3 * TILE);
    expect(
      Math.hypot(atDoor.x - atTrophy.x, atDoor.y - atTrophy.y),
      "the player did not travel between the two landmarks"
    ).toBeGreaterThan(4 * TILE);

    // The Navigation Table is Voss's, not his — the duplication the pass removed.
    await expect(lit).not.toHaveAttribute("data-hub-target", "table");
  });

  test("Emery Voss crosses the room before she says anything", async ({ page }) => {
    // "emery voss is talking to us from across the room." She opened Scene A standing on her post
    // with three lines to say and the player five tiles away at the far end of the tour.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "tour", completed: false, skipped: false },
      story: { liaisonTrust: 0, flags: {} },
    });
    await loadSeededSave(page);
    await expect(page.locator("#hubSceneName")).toHaveText("Director Rowan Hale");
    await page.getByRole("button", { name: "Skip scene" }).click();

    // Her post, before she moves. Skipping the tour leaves the player at the Archive Room door.
    const post = await nodePoint(page, '[data-hub-npc="liaison"]');
    const player = await nodePoint(page, "#institutePlayer");
    const startedApart = Math.hypot(post.x - player.x, post.y - player.y);
    expect(
      startedApart,
      "she was already next to the player, so this proves nothing"
    ).toBeGreaterThan(2.5 * TILE);

    // The bar stays hidden while she walks — there is no speaker yet, so it would be an empty box.
    await expect(page.locator("#hubSceneName")).toHaveText("Emery Voss", { timeout: 20_000 });
    const arrived = await nodePoint(page, '[data-hub-npc="liaison"]');
    const stillThere = await nodePoint(page, "#institutePlayer");
    const endedApart = Math.hypot(arrived.x - stillThere.x, arrived.y - stillThere.y);

    expect(endedApart, "Voss spoke without closing the distance").toBeLessThan(startedApart);
    expect(endedApart, "Voss is still talking from across the room").toBeLessThan(2 * TILE);
  });
});
