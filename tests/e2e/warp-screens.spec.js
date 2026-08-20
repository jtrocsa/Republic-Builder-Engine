// The two warp screens — Chronotravel out, Archive recall back.
//
// Phase 88A replaced an abstract teal vortex on both with a painted plate of the place you are
// going to, and made the wait mean something: the screen now fetches the destination's plate and
// its map's tilesets while it is up, and hands over when the dwell and the art are both done.
//
// What only a browser can answer, and so lives here:
//
//   1. **The right painting.** The plate is chosen from the unit, which means the one screen that
//      says where you are going could say the wrong place and throw nothing.
//   2. **The picture actually arrives.** These are the only images in the game resolved out of a
//      content module, and a `new URL()` that misses is a 404 in the page and a clean build.
//   3. **Both warps hand over.** Two gates open a warp — a timer and a set of image loads — and a
//      loading screen that does not finish is the worst failure available to it. Both are checked
//      on the natural path, and both skip buttons are checked on the short one.
//
// Timings: the dwell is 2500ms (WARP_DWELL_MS), so anything waiting for the far side gives it
// room. Nothing here asserts on the dwell's exact length — that is a tuning number, not a
// contract.

import { test, expect } from "@playwright/test";

import { seedProgress, loadSeededSave } from "./helpers/progress-seed.js";

const travelWarp = (page) => page.locator('[data-warp="travel"]');
const recallWarp = (page) => page.locator('[data-warp="recall"]');
const plate = (page) => page.locator(".warp-plate");

/** True once the browser has actually decoded the plate, rather than merely been given its src. */
async function plateLoaded(page) {
  return plate(page).evaluate((img) => img.complete && img.naturalWidth > 0);
}

test.describe("Chronotravel", () => {
  test("opens on the destination's own plate and names the mission", async ({ page }) => {
    await seedProgress(page, { currentScreen: "travel", activeCaseId: "case-016" });
    await loadSeededSave(page);

    await expect(travelWarp(page)).toBeVisible();
    await expect(plate(page)).toHaveAttribute("src", /unit-06-cottonwood-junction/);
    await expect(page.locator(".warp-card h1")).toHaveText("The Line and the Title");
    await expect(page.locator(".warp-place")).toHaveText("Cottonwood Junction, Kansas · 1873");
    await expect(page.locator(".warp-card .kicker")).toContainText("Period 6");
    // Chrome-less: this screen is the picture, and the header would frame it.
    await expect(page.locator("header.chrome")).toHaveCount(0);
  });

  test("the painting is really there, not just referenced", async ({ page }) => {
    await seedProgress(page, { currentScreen: "travel", activeCaseId: "case-013" });
    await loadSeededSave(page);
    await expect(plate(page)).toHaveAttribute("src", /unit-05-richmond/);

    await expect.poll(() => plateLoaded(page), { message: "the plate never decoded" }).toBe(true);
  });

  test("gives each unit a different plate", async ({ page }) => {
    // The failure this catches is a table that resolves everything to the same fallback, which
    // would pass every single-case assertion above.
    await seedProgress(page, { currentScreen: "travel", activeCaseId: "case-004" });
    await loadSeededSave(page);
    await expect(plate(page)).toHaveAttribute("src", /unit-02-riverbend/);
  });

  test("hands over to the case's own route when it is done", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "travel",
      activeCaseId: "case-016",
      unlocked: ["case-001", "case-016"],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(travelWarp(page)).toBeVisible();

    await expect(page.locator("#caseFieldPlayer")).toBeVisible({ timeout: 15_000 });
    await expect(travelWarp(page)).toHaveCount(0);
  });

  test("carries a non-map mission too, and lands on its own screen", async ({ page }) => {
    // Every case travels, not only the six with maps — so the plate is the unit's era rather than
    // a picture of a map that this case does not have.
    await seedProgress(page, {
      currentScreen: "travel",
      activeCaseId: "case-002",
      unlocked: ["case-001", "case-002"],
    });
    await loadSeededSave(page);
    await expect(plate(page)).toHaveAttribute("src", /unit-01-caribbean/);

    await expect(page.locator(".activity-shell")).toBeVisible({ timeout: 15_000 });
  });

  test("skip goes straight through", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "travel",
      activeCaseId: "case-016",
      unlocked: ["case-001", "case-016"],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(travelWarp(page)).toBeVisible();

    await page.getByRole("button", { name: "Skip transition" }).click();
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();
  });
});

test.describe("Archive recall", () => {
  test("opens on the Institute plate and names the room", async ({ page }) => {
    await seedProgress(page, { currentScreen: "return-warp", activeCaseId: null });
    await loadSeededSave(page);

    await expect(recallWarp(page)).toBeVisible();
    await expect(plate(page)).toHaveAttribute("src", /institute-archive/);
    await expect(page.locator(".warp-card h1")).toHaveText("Chronicle Institute");
    await expect(page.locator(".warp-place")).toContainText("present day");
  });

  test("hands the player back to the Institute", async ({ page }) => {
    await seedProgress(page, { currentScreen: "return-warp", activeCaseId: null });
    await loadSeededSave(page);
    await expect(recallWarp(page)).toBeVisible();

    await expect(page.locator("#instituteMap")).toBeVisible({ timeout: 15_000 });
  });

  test("can be skipped, which the recall never used to allow", async ({ page }) => {
    await seedProgress(page, { currentScreen: "return-warp", activeCaseId: null });
    await loadSeededSave(page);
    await expect(recallWarp(page)).toBeVisible();

    await page.getByRole("button", { name: "Skip transition" }).click();
    await expect(page.locator("#instituteMap")).toBeVisible();
    await expect(recallWarp(page)).toHaveCount(0);
  });

  test("the field's recall beacon plays it, the same as an archived record does", async ({
    page,
  }) => {
    // The half of this that was missing: the beacon used to cut straight to the hall while the
    // archived-record path played a sequence, and instituteRecallSpawn()'s own comment has called
    // them "both recall paths" since Phase 57.
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-016",
      unlocked: ["case-001", "case-016"],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // Dispatched rather than clicked: the beacon is a world button inside the scrolling map
    // transform, and Playwright reads it as outside the viewport even when the camera has it.
    await page.locator('[data-action="field-recall"]').dispatchEvent("click");
    await expect(recallWarp(page)).toBeVisible();
    await expect(plate(page)).toHaveAttribute("src", /institute-archive/);

    await expect(page.locator("#instituteMap")).toBeVisible({ timeout: 15_000 });
  });
});
