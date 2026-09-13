import { defineConfig } from "vite";

export default defineConfig({
  root: "apps/web",

  build: {
    // **Vite's default inlines every asset under 4 KB as a base64 data: URI, and this project has 507
    // of them.** Almost all are the 9-column character walk strips. Left at the default they were
    // 1,467,010 bytes of base64 — 38.6% of a 3.8 MB entry chunk — welded into the one render-blocking
    // ES module, so a student downloaded, decompressed, parsed and evaluated every sprite in the game
    // before the title screen could draw. index.html is a bare <div id="app"> with no loading state,
    // so that time is spent looking at nothing.
    //
    // Measured A/B on the built output, served over gzip with a cold cache:
    //
    //                        entry chunk gzip   first interactive (4 Mbps / 100 ms RTT)
    //   default (4 KB)       1,710 KB           3,880 ms   34 requests   1,738 KB
    //   assetsInlineLimit 0    667 KB           1,788 ms    4 requests     691 KB
    //
    // **Fewer requests, not more**, which is the opposite of the usual objection to un-inlining: the
    // title screen needs no sprites at all, so they stop being fetched up front and start being
    // fetched when a map draws. 61% off the gzip, 54% off time-to-interactive.
    //
    // Verified in production form, because the e2e suite runs against the dev server and this option
    // only applies to a build: the Caribbean field map's two canvases hash **pixel-identical** between
    // the two builds, and every sprite the field draws resolves 200 with no failed request and no
    // page error. See decision log `0135`.
    assetsInlineLimit: 0,
  },

  server: {
    open: !process.env.E2E,
  },
});
