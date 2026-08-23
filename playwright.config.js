import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",

  // Scratch specs. `_measure-tmp.spec.js` was an untracked debug file that measured bounding boxes
  // and logged them; it sat inside testDir and so ran on every invocation, adding tests whose only
  // assertion was toBeVisible(). Anything prefixed `_` is a scratch file and does not run.
  testIgnore: "**/_*.spec.js",

  fullyParallel: true,
  reporter: "list",

  // Six workers (12 cores / 2, the default) share one Vite dev server, and under that load a
  // navigation can genuinely take longer than the 30s default without anything being wrong. A full
  // run measured 4 failures and 2 flakes out of 254, every one a timeout rather than a bad
  // assertion, and all of them passed on a targeted re-run. This repo's own notes record the same
  // shape once before: four unrelated specs red under parallel workers, green at --workers=1.
  //
  // The suite can only report slowness as a correctness failure, so give it room rather than
  // teaching people to ignore red.
  timeout: 60_000,

  // One retry locally, two on CI. This was unset — i.e. zero — which made the `trace` setting below
  // dead code, since there was never a first retry for it to fire on. It also meant the suite could
  // not tell a flake from a failure, in a repo whose own notes record four specs going red together
  // under parallel workers while staying green at --workers=1.
  retries: process.env.CI ? 2 : 1,

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },

  expect: {
    toHaveScreenshot: {
      // Sub-pixel antialiasing differences were rewriting ~700 KB baseline PNGs on commits that
      // changed nothing visible — 203 baseline blob writes across 30 commits, for 55 files. PNGs do
      // not delta-compress, so every one of those is a whole new object in the pack. This threshold
      // is small enough that a real visual change still fails and large enough that noise does not.
      maxDiffPixelRatio: 0.002,
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
