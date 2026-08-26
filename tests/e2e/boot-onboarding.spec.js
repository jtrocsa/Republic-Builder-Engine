import { test, expect } from "@playwright/test";
import {
  PROGRESS_KEY,
  walkToHubNpc,
  beginFromTitle,
  dismissCodexVeil,
} from "./helpers/progress-seed.js";

// Scenario 1: cold load -> identity creation -> Entrance Hall -> Main Hall.
// No seed here (a fresh profile) — this is the one spec that exercises the real onboarding
// flow rather than jumping in via localStorage.
test.describe("Boot and onboarding", () => {
  test("cold load through identity creation lands on institute", async ({ page }) => {
    // Collapses the typewriter effect and the Entrance Hall's doorway flicker (main.js's
    // prefersReducedMotion() checks), so the whole flow completes in well under a second of
    // animation time. The walk to the Director is real either way — it is player movement, not an
    // animation, and walkToHubNpc() steers by position rather than by a fixed hold.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await beginFromTitle(page);

    await page.getByRole("button", { name: "Student" }).click();
    await page.getByRole("button", { name: "Start New Game" }).click();

    // The 3 director-dialogue intro screens (welcome/briefing/protocol) share one
    // data-action="director-dialogue-click" box: clicking it advances one typewriter line at a
    // time, then (once a step's last line is revealed) delegates to that screen's own Continue
    // button. Clicking it repeatedly walks all the way to the identity screen.
    const dialogueBox = page.locator(".director-dialogue-box");
    const nameInput = page.locator('input[data-profile="name"]');
    for (let i = 0; i < 40; i += 1) {
      if (await nameInput.isVisible().catch(() => false)) break;
      if (await dismissCodexVeil(page)) continue;
      if (!(await dialogueBox.isVisible().catch(() => false))) break;
      await dialogueBox.click();
      await page.waitForTimeout(30);
    }
    await expect(nameInput).toBeVisible();

    // Negative path: confirming with an empty name should show an error and not advance.
    // The default profile name ("Chronicler") is pre-filled, so it has to be cleared first —
    // an untouched fresh profile is not actually the empty-name state this checks.
    await nameInput.fill("");
    await page.locator('[data-action="confirm-identity"]').click();
    await expect(page.locator("#identityFeedback")).not.toBeEmpty();
    await expect(nameInput).toBeVisible();

    // The identity name input has maxlength="14" — stay within it.
    await nameInput.fill("Test Player");
    await page.locator('[data-action="set-appearance"][data-value="a"]').click();
    await page.locator('[data-action="confirm-identity"]').click();

    await expect(page.locator('[data-action="intro-advance"][data-next="hallway"]')).toBeVisible();
    await page.locator('[data-action="intro-advance"][data-next="hallway"]').click();

    // The Entrance Hall. Phase 62 replaced a five-second scripted float with a walkable room, so
    // this is where the player first controls anything: walk to Director Hale, then talk.
    await expect(page.locator(".institute-map--hallway")).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-hub-npc="director"]')).toBeVisible();
    expect(await walkToHubNpc(page, "director")).toBe(true);
    await expect(page.locator("#hubInteractPrompt")).toHaveText("Press E · Director Rowan Hale");

    await page.keyboard.press("e");
    const hallwayDialogue = page.locator(".hallway-dialogue");
    await expect(hallwayDialogue).toBeVisible();

    // Two beats — it was four until Phase 90 — then the last press sets the Director walking and
    // the player following. Clicking the bar is the same path as pressing E (see the
    // hallway-dialogue-click handler), so this drives it the way the other intro screens are driven
    // above. The loop stops on its own when the bar goes `is-silent`, which is what the Main Hall's
    // tour opens on: the Director walking, before he has said anything.
    for (let i = 0; i < 12; i += 1) {
      if (!(await hallwayDialogue.isVisible().catch(() => false))) break;
      await hallwayDialogue.click();
      await page.waitForTimeout(40);
    }

    // The escort walk, then the doorway cut, then the Main Hall with the tour under way.
    await expect(page.locator(".institute-map--main-hall")).toBeVisible({ timeout: 15000 });

    const stored = await page.evaluate(
      (key) => JSON.parse(window.localStorage.getItem(key) || "null"),
      PROGRESS_KEY
    );
    expect(stored.currentScreen).toBe("institute");
    expect(stored.currentHubRoom).toBe("main");
    expect(stored.tutorial.step).toBe("tour");
    expect(stored.profile.name).toBe("Test Player");
  });

  // The wordmark's glow used to be switched on by a `.lit` class that JS added 2.7s in — which is
  // after every letter had already arrived, so the word assembled unlit and then brightened as a
  // block. The glow now travels with each letter (tsLetterIn ignites and settles it), and `.lit`
  // is only the slow ambient breathe that joins once the word is whole.
  //
  // Removing the class rather than racing that timer is deliberate: the assertion is that the
  // letters do not depend on it, and a test that raced the 2.7s would be a flake on a slow machine
  // and would still pass if the glow moved back.
  test("the wordmark's letters carry their own glow, not a class added later", async ({ page }) => {
    await page.goto("/");
    const wordmark = page.locator(".title-wordmark");
    await expect(wordmark).toBeVisible();
    await wordmark.evaluate((el) => el.classList.remove("lit"));

    const shadow = await wordmark
      .locator("span")
      .first()
      .evaluate((el) => window.getComputedStyle(el).textShadow);
    expect(shadow).not.toBe("none");
    expect(shadow).toContain("rgba(225, 182, 93");
  });
});
