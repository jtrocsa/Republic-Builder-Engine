import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, holdKey } from "./helpers/progress-seed.js";

// **A per-frame path patches the DOM; it does not render.** This spec is that invariant, asserted
// directly, and it exists because until now the suite only ever asserted it *by accident*.
//
// Phase 90E (decision log `0083` §1) added `save()` and `render()` to `runFieldMovementLoop()` —
// the obvious fix, and the wrong one, because `render()` rebuilds the screen and repaints the map
// canvases, and spending that on every frame of a walk is far too much. The suite did catch it:
// four unrelated specs went red under parallel workers and green at `--workers=1`, because walks
// that used to reach somebody parked a fraction short. `0083` calls that "an e2e suite catching a
// performance regression as a correctness failure, which is the only way a suite ever can."
//
// It is not the only way, and the accidental version has a cost that had been paid every run since.
// **A walk that parks short is not a specific signal.** Measured on this machine (12 cores, one
// Vite dev server): at six workers the page renders at 4-13fps against 40-45 serial, and because
// `runFieldMovementLoop()` clamps its frame delta with `Math.min(48, …)` — deliberately, so a
// stalled frame cannot teleport the player through a wall — a walk covers as little as 39% of the
// ground per wall-clock second that it covers serially. So *machine load* and *a real per-frame
// regression* present identically, and the suite reported 2-8 red tests a run for the first reason
// while claiming to be watching for the second.
//
// This measures the thing itself instead. `render()` assigns `app.innerHTML` wholesale, which
// removes every existing direct child of `#app`; the per-frame path patches attributes and single
// nested nodes and never does that. A `childList` MutationObserver on `#app`, without `subtree`,
// therefore counts renders and nothing else — **and the count does not depend on how fast the
// machine is.** Verified at six workers and 4-9fps: zero during a walk, one for a deliberate exit.
//
// So the claim `0083` cared about now has a test that fails 100% of the time when it is violated
// and 0% of the time when the machine is merely busy, which is what let the walk helpers stop
// carrying it. See decision log `0092`.

// Counts renders, not repaints. `removedNodes.length` is the tell: only a wholesale
// `app.innerHTML = …` clears the existing children, and that is exactly what `render()` does.
async function watchRenders(page) {
  await page.evaluate(() => {
    window.__renderCount = 0;
    window.__renderWatch?.disconnect();
    window.__renderWatch = new MutationObserver((records) => {
      for (const record of records) if (record.removedNodes.length) window.__renderCount += 1;
    });
    window.__renderWatch.observe(document.getElementById("app"), { childList: true });
  });
}

const renderCount = (page) => page.evaluate(() => window.__renderCount);

test.describe("The per-frame path patches the DOM; it does not render", () => {
  test("walking the field costs no renders, and a deliberate exit costs one", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    const player = page.locator("#caseFieldPlayer");
    await expect(player).toBeVisible();

    const at = () => player.evaluate((el) => Number.parseFloat(el.style.top));
    const before = await at();
    await watchRenders(page);
    await holdKey(page, "ArrowDown", 600);

    // The walk has to have actually happened, or zero renders is trivially true. This is the one
    // load-sensitive assertion in the file and it is deliberately loose: any movement at all.
    expect(await at(), "the player did not move, so the count proves nothing").not.toBe(before);
    expect(await renderCount(page), "the movement loop rendered").toBe(0);

    // And the counter is live. Without this, a broken observer reads as a passing test — the
    // failure mode of every "assert something did not happen" check ever written.
    //
    // Polled on the count rather than on a destination: recall leaves through the return-warp,
    // which is chrome-less and waits for the player rather than landing anywhere on its own. What
    // is being checked is that the observer fires at all, so the screen it fires on does not matter.
    await page.locator('[data-action="field-recall"]').first().click();
    await expect
      .poll(() => renderCount(page), { message: "a deliberate screen change did not render" })
      .toBeGreaterThan(0);
  });

  // **There is deliberately no case here for walking away from an open conversation**, which is
  // `0083`'s own scenario. Reaching an NPC needs `walkToNpc()` across half a map, and a long walk
  // is the single most load-sensitive thing this suite does — the very fragility Phase 93
  // measured. It would make this spec's verdict depend on the machine, which is the one property
  // the spec exists to not have. The two cases above and below already fail 100% of the time if
  // `render()` re-enters either movement loop, which is the claim `0083` §1 cared about;
  // `field-dialogue-lifecycle.spec.js` covers the bubble closing on the move behaviourally.
  test("walking a hub room costs no renders either", async ({ page }) => {
    // Same loop, different room — `runHubMovementLoop()` carries the identical elapsed clamp and
    // the identical patch-don't-render rule, and nothing was asserting it there at all.
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "main",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    const player = page.locator("#institutePlayer");
    await expect(player).toBeVisible();

    const at = () => player.evaluate((el) => Number.parseFloat(el.style.left));
    const before = await at();
    await watchRenders(page);
    await holdKey(page, "ArrowRight", 600);

    expect(await at(), "the player did not move, so the count proves nothing").not.toBe(before);
    expect(await renderCount(page), "the hub movement loop rendered").toBe(0);
  });
});
