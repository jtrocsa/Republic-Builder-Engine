import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, briefed } from "./helpers/progress-seed.js";

// **Nothing a student needs to read is cut off the side of the screen.**
//
// Phase 121 wrote the vertical half of this rule — controls and status above the fold, prose may
// scroll — and guarded it at both sizes in `fold-and-controls.spec.js`. This is the horizontal half,
// and it needs its own file because the failure mode is different in a way that matters: a page that
// is too tall gets a scrollbar and tells you there is more, and **a box that is too wide inside an
// `overflow: hidden` ancestor tells you nothing at all.** It is cut cleanly, with no scrollbar and no
// ellipsis, and it looks exactly like a panel that was designed that way.
//
// The defect it was written for: `.case-field--living` is a three-column grid whose own floors add
// up to 1268px — 240 + 760 + 220 and two 24px gaps — and `main.case-field` has 1209px to give at a
// 1280-wide viewport. `overflow: hidden` on the grid (added in Phase 121, so a wide map cannot push
// the page sideways) turned that 59px shortfall into a straight cut through the Evidence Channel:
// the last characters off every line, and **35px off the right edge of both of its buttons**, on
// every one of the eight maps, at 1280x720 and 1280x800. See `docs/decision-log/0123-cut-off-the-side-of-the-screen.md`.
//
// **1366 was clean and is the reason this is a measurement rather than a redesign.** The threshold is
// 1339px of viewport, so the fix is scoped under it and every number at 1366 and above is untouched
// — which is also why no visual baseline moved.

const SIZES = [
  [1280, 720],
  [1366, 768],
];

// The student's screens, seeded straight in. Teacher surfaces are out of scope here as they are in
// every other layout pass.
const SCREENS = [
  [
    "field · Caribbean",
    { currentScreen: "field", activeCaseId: "case-001", selectedCaseId: "case-001" },
  ],
  [
    "field · Ellis Island",
    { currentScreen: "field", activeCaseId: "case-019", selectedCaseId: "case-019" },
  ],
  [
    "field · Fairmeadow",
    { currentScreen: "field", activeCaseId: "case-022", selectedCaseId: "case-022" },
  ],
  ["archive · the Navigation Table", { currentScreen: "archive", selectedCaseId: "case-001" }],
  ["institute · Main Hall", { currentScreen: "institute", currentHubRoom: "main" }],
  ["institute · Archive Room", { currentScreen: "institute", currentHubRoom: "archive" }],
  [
    "activity · the interview board",
    {
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      activeCaseId: "case-001",
      selectedCaseId: "case-001",
      sourceActivities: briefed("taino-context"),
    },
  ],
  ["codex", { currentScreen: "codex", activeCaseId: "case-001", selectedCaseId: "case-001" }],
  [
    "practice check",
    { currentScreen: "practice-check", activeCaseId: "case-001", selectedCaseId: "case-001" },
  ],
];

/**
 * Everything in `main` whose right edge is past the right edge of the nearest ancestor that clips.
 *
 * Two exclusions, both deliberate and both named rather than filtered by shape. **A camera window is
 * meant to clip** — `.field-viewport`, `.institute-map` and the Archive Room's map are how a world
 * bigger than the frame is shown at all, and the world canvas inside one is always wider than it.
 * And **an SVG's inside is not layout**: a `<path>`'s client rect is its geometry inside a viewBox,
 * so an icon's strokes read as overflowing a box they are drawn correctly within.
 */
function clippedContent(page) {
  return page.evaluate(() => {
    const cut = [];
    for (const el of document.querySelectorAll("main *")) {
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (el.closest(".field-viewport, .institute-map, #archiveRoomMap, svg")) continue;
      for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        const overflowX = window.getComputedStyle(parent).overflowX;
        if (overflowX !== "hidden" && overflowX !== "clip") continue;
        const over = Math.round(box.right - parent.getBoundingClientRect().right);
        if (over > 1) {
          const name = (el.className || "").toString().split(" ")[0] || el.tagName.toLowerCase();
          const by =
            (parent.className || "").toString().split(" ")[0] || parent.tagName.toLowerCase();
          cut.push(`${name} loses ${over}px to .${by}`);
        }
        break; // the nearest clipping ancestor is the one doing the cutting.
      }
    }
    return [...new Set(cut)];
  });
}

/**
 * And the same silence one level in: **a box does not cut off its own contents either.**
 *
 * `clippedContent()` above asks whether a box is too wide for the nearest ancestor that clips. This
 * asks whether the *content* is too big for the box it is already in — an element that clips its own
 * overflow and whose `scrollWidth`/`scrollHeight` exceeds what it shows. The failure is the same one
 * this file was written about, with the same three properties: no scrollbar, no ellipsis, and a
 * result that looks exactly like a panel someone designed that way. A fixed-height box whose text
 * grew is the ordinary cause, which is why it is worth asking here rather than only about width —
 * Phase 129 moved every text metric in the game at once when the three faces began to load, and
 * `intro-sequence.spec.js` guards exactly one such box (the Director's) out of all of them.
 *
 * Two exclusions beyond this file's existing ones. **A deliberate truncation announces itself**:
 * `text-overflow: ellipsis` draws the ellipsis that says there is more, so it is a design decision
 * rather than a silent cut. And **the screen-reader pattern is a clipped box on purpose** — a
 * `.visually-hidden` span is a 1x1 box holding text nobody is meant to see, so it overflows itself
 * by definition; it is excluded by its size rather than by its class name, because what disqualifies
 * it is being too small to show a glyph at all, not what it happens to be called.
 */
function truncatedText(page) {
  return page.evaluate(() => {
    const cut = [];
    for (const el of document.querySelectorAll("main *")) {
      if (!(el.textContent || "").trim()) continue;
      if (el.closest(".field-viewport, .institute-map, #archiveRoomMap, svg")) continue;
      // Too small to show a glyph: the screen-reader pattern, whose whole job is to be clipped.
      if (el.clientWidth <= 4 || el.clientHeight <= 4) continue;

      const style = window.getComputedStyle(el);
      if (style.textOverflow === "ellipsis") continue;

      const clipsY = style.overflowY === "hidden" || style.overflowY === "clip";
      const clipsX = style.overflowX === "hidden" || style.overflowX === "clip";
      const overY = clipsY ? el.scrollHeight - el.clientHeight : 0;
      const overX = clipsX ? el.scrollWidth - el.clientWidth : 0;
      if (overY <= 1 && overX <= 1) continue;

      const name = (el.className || "").toString().split(" ")[0] || el.tagName.toLowerCase();
      cut.push(
        `${name} cuts its own text by ${[overY > 1 ? `${overY}px tall` : null, overX > 1 ? `${overX}px wide` : null].filter(Boolean).join(" and ")}`
      );
    }
    return [...new Set(cut)];
  });
}

test.describe("Nothing is cut off the side of the screen", () => {
  for (const [width, height] of SIZES) {
    for (const [name, seed] of SCREENS) {
      test(`${name} at ${width}x${height}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await seedProgress(page, {
          ...seed,
          tutorial: { step: "complete", completed: true, skipped: false },
        });
        await loadSeededSave(page);
        await page.waitForTimeout(700);

        // Anti-vacuity: a screen that rendered nothing, or a seed that landed somewhere else,
        // would have an empty `main` and satisfy the assertion below without asking anything.
        expect(
          await page.locator("main *").count(),
          `${name} rendered something to measure`
        ).toBeGreaterThan(10);

        expect(await clippedContent(page), `${name} at ${width}px`).toEqual([]);

        // The same cut, one level in: a box that clips its own contents.
        expect(await truncatedText(page), `${name} at ${width}px cuts no text`).toEqual([]);

        // And the page itself does not answer a too-wide layout with a sideways scrollbar, which is
        // the other way this can go and is no better on a screen a student plays on.
        const scroll = await page.evaluate(() => ({
          width: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(scroll.width, `${name} at ${width}px does not scroll sideways`).toBeLessThanOrEqual(
          scroll.client
        );
      });
    }
  }
});
