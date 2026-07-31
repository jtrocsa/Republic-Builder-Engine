import { expect, test } from "@playwright/test";

import { loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

// Banks what the visual-regression suite structurally cannot see.
//
// Playwright screenshots with `animations: "disabled"`, which freezes a CSS animation and leaves the
// element on its un-animated frame — column 0, the standing pose. An idle strip's column 0 is the
// same standing pose as the walk strip's (asserted pixel-for-pixel in
// tests/unit/character-sheet-geometry.test.js), so the twenty committed baselines are identical
// whether or not a character is breathing. That is the correct outcome for the baselines and it is
// also why they can never prove the idle runs.
//
// So this reads the live DOM instead: the right sheet, the right column count, and — the part that
// actually matters — the frame moving on its own with nobody touching the keyboard.

test.use({ viewport: { width: 1366, height: 768 } });

/** One sprite element's live animation state, as the browser has computed it. */
function spriteState(page, selector) {
  return page.locator(selector).evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      sheet: el.style.getPropertyValue("--sprite-sheet"),
      columns: el.style.getPropertyValue("--sprite-columns"),
      idling: el.classList.contains("is-idling"),
      walking: el.classList.contains("is-walking"),
      animationName: style.animationName,
      duration: style.animationDuration,
      frameOffset: style.backgroundPositionX,
    };
  });
}

const DIRECTOR = '[data-hub-npc="director"] .character-sprite';

test.describe("a stationed character breathes", () => {
  test("Director Hale plays his idle strip in the Institute, unprompted", async ({ page }) => {
    await seedProgress(page, { currentScreen: "institute", unlockedCaseIds: ["case-001"] });
    await loadSeededSave(page);
    await expect(page.locator(DIRECTOR)).toBeVisible();

    const state = await spriteState(page, DIRECTOR);
    // The idle strip, not the walk strip: five columns (a standing pose plus the 4-frame template)
    // against the walk's seven.
    expect(state.sheet).toContain("-idle-");
    expect(state.columns).toBe("5");
    expect(state.idling).toBe(true);
    // Standing still is not walking. The two are separate classes precisely so that a breathing
    // body does not pick up the footstep audio and walking bob that .is-walking drives elsewhere.
    expect(state.walking).toBe(false);
    expect(state.animationName).toBe("characterWalk");
    expect(state.duration).toBe("2.4s");
  });

  test("the frame advances on its own", async ({ page }) => {
    await seedProgress(page, { currentScreen: "institute", unlockedCaseIds: ["case-001"] });
    await loadSeededSave(page);
    await expect(page.locator(DIRECTOR)).toBeVisible();

    // Sampled across more than one 2.4s cycle step, with no input in between. If the strip were
    // static — the state before this landed — every sample would read identically.
    const samples = new Set();
    for (let i = 0; i < 6; i += 1) {
      samples.add((await spriteState(page, DIRECTOR)).frameOffset);
      await page.waitForTimeout(700);
    }
    expect(samples.size).toBeGreaterThan(1);
  });

  test("a character with no idle art still holds a single standing frame", async ({ page }) => {
    // The player has no breathing cycle, and must not silently fall back to one or lose its walk.
    // This is the guard on `idling` being driven by the art a character actually has.
    await seedProgress(page, { currentScreen: "institute", unlockedCaseIds: ["case-001"] });
    await loadSeededSave(page);
    const player = "#institutePlayerSprite";
    await expect(page.locator(player)).toBeVisible();

    const state = await spriteState(page, player);
    expect(state.sheet).not.toContain("-idle-");
    expect(state.idling).toBe(false);
    expect(state.animationName).toBe("none");
  });
});
