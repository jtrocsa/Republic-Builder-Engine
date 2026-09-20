import { test, expect } from "@playwright/test";
import { openSeededSave } from "./helpers/progress-seed.js";

/**
 * **The sky over Storm Navigation actually moves.**
 *
 * The defect this was written for: `global.css` carried
 * `.storm-clouds { animation: stormCloudsDrift 14s linear infinite }`, and the drift never
 * happened once. `runMiniGameLoop` redraws this mini-game by replacing its container's entire
 * `innerHTML` on every animation frame — **121 container rebuilds in 2 seconds, measured** — so
 * the `.storm-clouds` node was a brand new element about every 16ms and restarted its own
 * animation timeline each time. Measured in the browser rather than reasoned about: the
 * animation's `currentTime` read **0ms at t=0, 0ms at t=1.5s and 0ms at t=3.0s**.
 *
 * It failed silently, which is why it survived from the day the mini-game shipped. A frozen
 * animation is indistinguishable from a static decoration — the sky simply looked like a painted
 * backdrop, while the water, rain, lightning and the bobbing ship around it all moved, because
 * every one of those had been computed from `state.elapsedMs` and written inline instead. The
 * module's file header already prescribed exactly that; the clouds were never brought under it.
 *
 * **Why this spec measures the paint and not the stylesheet.** Asserting that `global.css` has no
 * `animation` on `.storm-clouds` is the static half, and it lives in
 * `tests/unit/storm-navigation-css-clock.test.js` where it is nearly free. It would also pass on
 * clouds that sit perfectly still — a `--drift-pct` that is emitted but never read, or read into
 * a property that does nothing, looks identical to the defect. So this one asks the player's
 * question instead: watch the sky for three seconds and see whether it went anywhere.
 *
 * **Every sample is taken from inside the page, and that is not a style preference.** A Playwright
 * locator resolves to an element handle and then evaluates on it, and in this stage the node it
 * resolved is very often gone by the time the evaluation runs — 60 rebuilds a second leaves no
 * stable handle to hold. Measured while writing this: the first `locator.evaluate()` read came
 * back with `transform: ""` and a client width of `0`, because it landed on a detached node.
 * Read that way, a moving sky reports as a still one, so the spec would fail on a working game
 * and — worse — a naive `?? 0` on that empty string would have made the defect and a stale read
 * indistinguishable. `page.evaluate` re-queries the document at the moment of use.
 *
 * See decision log `0140`.
 */

const SAMPLE_GAP_MS = 1500;

/** translateX in px out of a computed `matrix(...)`, or NaN if the element gave us nothing. */
const translateXOf = (transform) => {
  const parts = /matrix\(([^)]+)\)/.exec(transform || "");
  return parts ? Number(parts[1].split(",")[4]) : Number.NaN;
};

test.describe("Storm Navigation's clouds", () => {
  test("drift across the sky while a run is in progress", async ({ page }) => {
    test.setTimeout(120_000);
    await openSeededSave(page, { currentScreen: "mini-games" });
    await page.locator('[data-mini-game="storm-navigation"]').first().click();
    await expect(page.locator(".storm-track")).toBeVisible();

    const samples = await page.evaluate(async (gapMs) => {
      const read = () => {
        const el = document.querySelector(".storm-clouds");
        if (!el) return { transform: null, cssClocks: -1 };
        return {
          transform: window.getComputedStyle(el).transform,
          cssClocks: el.getAnimations().length,
        };
      };
      const out = [read()];
      for (let i = 0; i < 2; i++) {
        await new Promise((resolve) => setTimeout(resolve, gapMs));
        out.push(read());
      }
      return out;
    }, SAMPLE_GAP_MS);

    // The run must still be going, or elapsedMs stops advancing and nothing below means anything.
    await expect(page.locator(".mini-game-timer")).toContainText("Time survived");

    // Anti-vacuity: no CSS clock may be driving this. If one were, the movement below could be
    // passing on exactly the mechanism that failed before — and `getAnimations()` is how the
    // original defect was caught, so it is the right thing to pin.
    expect(
      samples.map((s) => s.cssClocks),
      "a CSS animation or transition is driving .storm-clouds again. It cannot work here: this " +
        "node is destroyed and recreated every animation frame, so the timeline restarts before " +
        "it can advance. Compute the value from state.elapsedMs and emit it inline."
    ).toEqual([0, 0, 0]);

    const xs = samples.map((s) => translateXOf(s.transform));
    expect(
      xs.every(Number.isFinite),
      `a sample came back without a usable transform (${JSON.stringify(samples)}). An empty ` +
        `string here means the element was detached when it was read, not that it sat still.`
    ).toBe(true);

    expect(
      xs[1],
      `the clouds have not moved in ${SAMPLE_GAP_MS}ms (translateX ${xs[0]}px then ${xs[1]}px). ` +
        `The sky is frozen, which is what a CSS keyframe on a node rebuilt every frame looks ` +
        `like, and also what an emitted --drift-pct the stylesheet never reads looks like.`
    ).not.toBeCloseTo(xs[0], 1);

    // Authored direction: 0% to -8% of the image's width, so it travels left, steadily.
    expect(xs[1], `expected leftward drift, got ${xs.join(" -> ")}`).toBeLessThan(xs[0]);
    expect(xs[2], `expected leftward drift, got ${xs.join(" -> ")}`).toBeLessThan(xs[1]);

    // Steady, not a one-off jump: two equal waits should cover comparable ground.
    const firstLeg = xs[0] - xs[1];
    const secondLeg = xs[1] - xs[2];
    expect(
      Math.abs(firstLeg - secondLeg),
      `drift is not steady: ${firstLeg.toFixed(1)}px then ${secondLeg.toFixed(1)}px`
    ).toBeLessThan(Math.max(firstLeg, secondLeg) * 0.5);
  });
});
