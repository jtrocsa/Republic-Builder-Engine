import { test, expect } from "@playwright/test";
import { PROGRESS_KEY } from "./helpers/progress-seed.js";

// Scenario 1: cold load -> identity creation -> lands on institute.
// No seed here (a fresh profile) — this is the one spec that exercises the real onboarding
// flow rather than jumping in via localStorage.
test.describe("Boot and onboarding", () => {
  test("cold load through identity creation lands on institute", async ({ page }) => {
    // Collapses the typewriter effect and the 5s hallway walk (main.js's prefersReducedMotion()
    // checks), so the whole flow completes in well under a second of animation time.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

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

    await expect(
      page.locator('[data-action="intro-advance"][data-next="intro-hallway"]')
    ).toBeVisible();
    await page.locator('[data-action="intro-advance"][data-next="intro-hallway"]').click();

    await expect(page.locator("#instituteMap")).toBeVisible({ timeout: 10000 });

    const stored = await page.evaluate(
      (key) => JSON.parse(window.localStorage.getItem(key) || "null"),
      PROGRESS_KEY
    );
    expect(stored.currentScreen).toBe("institute");
    expect(stored.profile.name).toBe("Test Player");
  });
});
