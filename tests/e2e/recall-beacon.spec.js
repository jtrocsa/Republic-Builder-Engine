import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, walkTo } from "./helpers/progress-seed.js";

/**
 * **The beacon is where the game says it is, and a player can reach it and press it.**
 *
 * The defect this was written for: `global.css` carried
 * `.recall-beacon { left: 410px !important; top: 545px !important }`, a fixed world position left
 * over from before the beacon was placed from data. `recallBeacon()` writes each map's authored
 * `FIELD_MAPS[unit].recall` coordinate as an **inline style**, and an `!important` declaration in a
 * stylesheet beats a non-important inline one — so on every one of the eight maps the beacon was
 * *drawn* at one fixed point while `isNearRecallBeacon()` went on measuring to the authored tile,
 * **16.0 to 23.5 tiles away** against a reach of 1.55.
 *
 * What that looked like to a player: walk to the beacon you can see, click it, and get "Move closer
 * to interact with the recall beacon." The place it does work has no marker on it at all, and the
 * beacon lights up — `is-near` is computed from the authored position too — while you are standing
 * twenty tiles from the thing that is glowing. Nobody was stranded, because the chrome back link
 * carries the same action ungated and always worked; the world object was simply decorative.
 *
 * **Why this spec walks rather than measuring.** Comparing the computed `left`/`top` against
 * `FIELD_MAPS[unit].recall` would restate the rule in the test, which is what `0093` forbids. The
 * question a player asks is "can I get to it and use it", so that is what this asks: walk to the
 * beacon **as drawn**, and let the game's own `is-near` say whether the walk arrived. With the
 * override restored this fails on every map at "the walker never got inside the beacon's reach",
 * because the walker is routing to a place the game does not consider near anything.
 *
 * Note the ordering that makes it two-sided: `walkTo` targets `.recall-beacon` itself, so it plans
 * to where the beacon is **painted**. If painted and authored ever diverge again, the walk arrives
 * at the paint and `is-near` — which reads the authored coordinate — stays false.
 */

const FIELD_CASE = {
  "unit-01": "case-001",
  "unit-02": "case-004",
  "unit-03": "case-007",
  "unit-04": "case-010",
  "unit-05": "case-013",
  "unit-06": "case-016",
  "unit-07": "case-019",
  "unit-08": "case-022",
};

test.describe("Recall to Archive", () => {
  for (const [unit, caseId] of Object.entries(FIELD_CASE)) {
    test(`${unit}: the beacon can be walked to and pressed`, async ({ page }) => {
      test.setTimeout(180_000);
      await seedProgress(page, {
        currentScreen: "field",
        activeCaseId: caseId,
        tutorial: { step: "complete", completed: true, skipped: false },
      });
      await loadSeededSave(page);

      const beacon = page.locator(".recall-beacon");
      await expect(beacon).toBeVisible();

      // Anti-vacuity: a beacon at (0,0), or one the stylesheet had collapsed, would be trivially
      // reachable from the spawn. Every authored recall tile is well away from the map's origin.
      const at = await beacon.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { x: parseFloat(cs.left) / 48, y: parseFloat(cs.top) / 48 };
      });
      expect(at.x, `${unit}'s beacon sits at x=${at.x}`).toBeGreaterThan(4);
      expect(at.y, `${unit}'s beacon sits at y=${at.y}`).toBeGreaterThan(4);

      const reached = await walkTo(page, ".recall-beacon", "caseFieldPlayer");
      expect(
        reached,
        `the walker never got inside the beacon's reach on ${unit}. It routes to where the beacon ` +
          `is painted, and isNearRecallBeacon() measures to FIELD_MAPS["${unit}"].recall — so this ` +
          `fails when those two are not the same place, which is what a stylesheet rule setting ` +
          `left/top on .recall-beacon does.`
      ).toBe(true);

      // The game's own answer, not the spec's arithmetic.
      await expect(beacon).toHaveClass(/is-near/);

      // And it actually recalls: both recall paths play the warp screen.
      await beacon.click();
      await expect(page.locator(".warp-screen")).toBeVisible({ timeout: 20_000 });
    });
  }
});
