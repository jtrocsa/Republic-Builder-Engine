import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",

  // Scratch specs. `_measure-tmp.spec.js` was an untracked debug file that measured bounding boxes
  // and logged them; it sat inside testDir and so ran on every invocation, adding tests whose only
  // assertion was toBeVisible(). Anything prefixed `_` is a scratch file and does not run.
  testIgnore: "**/_*.spec.js",

  fullyParallel: true,
  reporter: "list",

  // **Left unset, and that is a decision with a measurement behind it.** Phase 93 set out to cap
  // this and found the cap is not the trade everyone assumed: two workers are *faster* than six
  // (67-70s against 90s on a fixed 26-test subset, a U-shaped curve with its minimum at two),
  // because the contended resource is **one single-threaded Vite dev server** rather than the twelve
  // cores. A cold `goto("/")` takes 2.2s at one worker and 11.6s at six — 5.3x latency for 6x the
  // demand, which is what a serialized resource looks like.
  //
  // It is still not shipped, because making the suite fast breaks specs that had been calibrated to
  // a slow one. At two workers the page runs at 40+fps instead of 4-13, the player reaches obstacles
  // at full speed rather than a third of it, and `powhatan-man is reachable on foot` and one
  // `field-movement-dialogue` case fail **every attempt** under full-suite load — deterministically,
  // through four retries. Two green tests turning permanently red is worse than the flakiness the
  // cap fixes.
  //
  // So the cap is blocked on hardening the long walks, not on the decision. See decision log `0092`
  // §5 for what was tried: teaching `walkTo` to reverse out of a blocked slide fixes those walks and
  // breaks five other specs, longer slides and shorter bursts are both worse, and per-call stall
  // budgets hold in isolation but not under load. The real fix is a walker that paths rather than
  // slides.

  // Kept at 60s after the cap above, deliberately, though most of what it was covering for is
  // gone. It was raised from the 30s default when six workers were queueing behind one dev server
  // and a navigation could take 11s through no fault of the app; at two workers that is 2-3s. The
  // headroom stays because the failure it prevents is a spec reporting a busy laptop as a bug, and
  // a generous ceiling costs nothing on a run where nothing is slow — a passing test never spends
  // it.
  timeout: 60_000,

  // One retry locally, two on CI. This was unset — i.e. zero — which made the `trace` setting below
  // dead code, since there was never a first retry for it to fire on. It also meant the suite could
  // not tell a flake from a failure, in a repo whose own notes record four specs going red together
  // under parallel workers while staying green at --workers=1.
  //
  // Left alone by Phase 93, on purpose. The quickref was right that a retry masks as well as helps,
  // but the mask was hiding the worker contention above, and that is now fixed at the cause rather
  // than compensated for. **The number to watch is `flaky`, not `passed`** — the local retry earns
  // its place only while that stays at 0, and if it does, this can go to zero locally too. Changing
  // it in the same commit as the concurrency would have moved two variables at once.
  retries: process.env.CI ? 2 : 1,

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },

  expect: {
    toHaveScreenshot: {
      // Sub-pixel antialiasing differences were rewriting ~700 KB baseline PNGs on commits that
      // changed nothing visible — 203 baseline blob writes across 30 commits, for 55 files. PNGs do
      // not delta-compress, so every one of those is a whole new object in the pack. Phase 90J
      // bought the end of that with `maxDiffPixelRatio: 0.002`, and the bill came due immediately:
      // at 1366x768 that allows **2,098 pixels**, and Phase 90L removed a visible chip from the
      // mission screen — measured at **211 pixels** — with all twenty baselines staying green. The
      // suite had no opinion about a real change.
      //
      // Re-measured with the tolerance turned off entirely: **every baseline that rendered was
      // pixel-identical**, 0 differing pixels, none. Whatever the churn was, it is not a noise floor
      // this suite has to sit above today. So the budget is an absolute count between the two
      // measurements — comfortably above nothing, well under the 211 that got through — and
      // absolute rather than a ratio because antialiasing noise lives on edges and does not scale
      // with the area of the shot.
      //
      // If churn ever returns, the lever is `threshold` (per-pixel colour distance, default 0.2),
      // not a bigger pixel budget. Raising the count is precisely what let a real change through.
      maxDiffPixels: 120,
    },
  },

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { E2E: "1" },
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
