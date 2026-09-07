// **Nothing is drawn as a box with nothing in it.**
//
// The defect this was written for: `.feedback` paints a full-width bar in rgba(91, 150, 101, 0.2)
// — the same green `.feedback.success` uses — and three of them ship empty in the markup, waiting
// for `showFeedback()` to fill them. So Record Reconstruction, the Archive Review, and the screen
// where a new player names their Chronicler each opened with a filled bar under their main button,
// in the colour this interface uses to say a thing went right, before the player had done anything.
// It reads as a second disabled button, or an input that failed to load.
//
// The rule has two halves, and the second is why this is not one assertion: **a status line with
// something to say must still be drawn.** `display: none` on `.feedback` outright would satisfy the
// sweep below and break every message in the game, so the sweep alone cannot say the fix is right.
// See `docs/decision-log/0125-a-box-with-nothing-in-it.md`.

import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, briefed } from "./helpers/progress-seed.js";

const DONE = { tutorial: { step: "complete", completed: true, skipped: false } };
const CASE_001 = { activeCaseId: "case-001", selectedCaseId: "case-001", unlocked: ["case-001"] };
const SECURED = {
  caseEvidence: { "case-001": ["taino-context", "columbus-letter", "waldseemuller-map"] },
};

// Every account on the island taken and the right conclusion filed, so the debrief is up.
const ACCOUNTS = {
  "taino-elder": ["decides"],
  "taino-gardener": ["grows"],
  "taino-fisher": ["trade"],
  "taino-child": ["grows"],
  columbus: ["gold"],
  "spanish-scribe": ["decides"],
  "spanish-sailor": ["trade"],
};

// The student's screens. Teacher surfaces are out of scope here as in every other layout pass.
const SCREENS = [
  ["identity", { currentScreen: "identity" }],
  ["intro · welcome", { currentScreen: "intro-welcome" }],
  ["intro · briefing", { currentScreen: "intro-briefing" }],
  ["intro · protocol", { currentScreen: "intro-protocol" }],
  ["intro · registration", { currentScreen: "intro-registration" }],
  ["institute · Main Hall", { ...CASE_001, currentScreen: "institute", currentHubRoom: "main" }],
  [
    "institute · Archive Room",
    { ...CASE_001, currentScreen: "institute", currentHubRoom: "archive" },
  ],
  [
    "institute · Entrance Hall",
    { ...CASE_001, currentScreen: "institute", currentHubRoom: "hallway" },
  ],
  ["archive · the Navigation Table", { ...CASE_001, currentScreen: "archive" }],
  ["field", { ...CASE_001, currentScreen: "field" }],
  [
    "field · an interior",
    {
      activeCaseId: "case-022",
      selectedCaseId: "case-022",
      unlocked: ["case-001", "case-022"],
      currentScreen: "field",
      currentFieldRoom: "fairmeadow-model-house",
      fieldReturn: { x: 27, y: 20 },
    },
  ],
  ["codex", { ...CASE_001, currentScreen: "codex" }],
  ["practice check", { ...CASE_001, currentScreen: "practice-check" }],
  ["mini-games", { ...CASE_001, currentScreen: "mini-games" }],
  ["skill mastery", { ...CASE_001, currentScreen: "mastery" }],
  ["archive rotation", { ...CASE_001, currentScreen: "archive-rotation" }],
  ["archive challenges", { ...CASE_001, currentScreen: "archive-challenges" }],
  ["archive review", { ...CASE_001, currentScreen: "review", selectedUnitId: "unit-01" }],
  ["unit completion", { ...CASE_001, currentScreen: "completion", selectedUnitId: "unit-01" }],
  ["record reconstruction", { ...CASE_001, ...SECURED, currentScreen: "reconstruction" }],
  ["upload", { ...CASE_001, currentScreen: "upload", pendingUploadCaseId: "case-001" }],
  // The Investigation Challenge is deliberately absent. `investigationScreen()` resolves from the
  // module-local `openSourceId`, so a seed cannot reach it — it recovers to an empty state instead,
  // which is correct behaviour and is why `visual-regression.spec.js` walks to the chart table to
  // photograph it. Adding a 40-second walk to a sweep of static screens would buy one more screen
  // at ten times the cost of any other row here.
  [
    "activity · mission instructions",
    { ...CASE_001, currentScreen: "interview", activeActivitySourceId: "taino-context" },
  ],
  [
    "activity · the interview board",
    {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: briefed("taino-context"),
    },
  ],
  [
    "activity · the mission debrief",
    {
      ...CASE_001,
      currentScreen: "interview",
      activeActivitySourceId: "taino-context",
      sourceActivities: {
        "taino-context": {
          state: { asked: ACCOUNTS, logged: ACCOUNTS, filed: "questions" },
          completed: false,
          briefed: true,
          debriefed: false,
        },
      },
    },
  ],
  [
    "activity · the assembly board",
    {
      ...CASE_001,
      currentScreen: "assembly",
      activeActivitySourceId: "waldseemuller-map",
      sourceActivities: briefed("waldseemuller-map"),
    },
  ],
  [
    "activity · the audit board",
    {
      ...CASE_001,
      currentScreen: "discrepancy",
      activeActivitySourceId: "columbus-letter",
      sourceActivities: briefed("columbus-letter"),
    },
  ],
];

/**
 * Every element on screen that is drawn as a panel and holds nothing.
 *
 * **A panel is a filled box or a box with four edges. One edge is a line.** That distinction is
 * doing real work rather than excusing a hit: the Navigation Table draws `.route-thread` between
 * its route markers as a 2px gold `border-top` and nothing else, and a connector between two things
 * is *supposed* to have nothing in it — it is the line, not a container for one. A box with a fill,
 * or with a border all the way round, is announcing itself as something that holds content.
 *
 * Form controls are excluded because an empty one is the point of it; a background *image* is
 * excluded because a decorative gradient or texture panel is drawn for its own sake; and anything
 * under 40x8 is a rule, a divider or a pip rather than a panel.
 */
function emptyPanels(page) {
  return page.evaluate(() => {
    const found = [];
    for (const el of document.querySelectorAll("main *")) {
      if (el.children.length) continue;
      if ((el.textContent || "").trim()) continue;
      if (["CANVAS", "IMG", "INPUT", "TEXTAREA", "SELECT", "HR", "BR", "SVG"].includes(el.tagName))
        continue;
      if (el.closest("svg")) continue;
      const box = el.getBoundingClientRect();
      if (box.width < 40 || box.height < 8) continue;
      const style = window.getComputedStyle(el);
      if (style.backgroundImage !== "none") continue;
      const filled = style.backgroundColor !== "rgba(0, 0, 0, 0)";
      const boxed = ["Top", "Right", "Bottom", "Left"].every(
        (side) => style[`border${side}Width`] !== "0px"
      );
      if (!filled && !boxed) continue;
      const name = (el.className || "").toString().split(" ")[0] || el.tagName.toLowerCase();
      found.push(
        `${name}${el.id ? `#${el.id}` : ""} — ${Math.round(box.width)}x${Math.round(box.height)}, ${filled ? style.backgroundColor : "bordered"}`
      );
    }
    return found;
  });
}

test.describe("Nothing is drawn as a box with nothing in it", () => {
  for (const [name, seed] of SCREENS) {
    test(name, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await seedProgress(page, { ...DONE, ...seed });
      await loadSeededSave(page);
      await page.waitForTimeout(500);

      // Anti-vacuity, and it is the assertion that earns its keep here: a seed that lands somewhere
      // else satisfies "nothing is drawn empty" by having nothing drawn. `.empty-state` is this
      // app's own recovery markup — the screen it shows when a save outlives the module-local it
      // needed — and it is exactly what a seed that missed lands on. The count is deliberately low
      // because a real screen here can be genuinely sparse: Skill Mastery is five elements and a
      // paragraph, and demanding more of it would be inventing a rule to protect this test.
      expect(
        await page.locator("main .empty-state").count(),
        `${name} is the screen it seeded`
      ).toBe(0);
      expect(
        await page.locator("main *").count(),
        `${name} rendered something to measure`
      ).toBeGreaterThan(4);

      expect(await emptyPanels(page), name).toEqual([]);
    });
  }

  test("but a status line with something to say is still drawn", async ({ page }) => {
    // The counter-assertion, and the reason the sweep above is not the whole rule: hiding
    // `.feedback` outright would pass every test above and silence every message in the game.
    await page.setViewportSize({ width: 1280, height: 720 });
    await seedProgress(page, { ...DONE, ...CASE_001, ...SECURED, currentScreen: "reconstruction" });
    await loadSeededSave(page);

    const line = page.locator("#reconstructionFeedback");
    await expect(line, "nothing to say, nothing drawn").toBeHidden();

    // Every record into one lane, which cannot be right for three different kinds of evidence.
    const records = page.locator("[data-reconstruction]");
    const lanes = await records
      .nth(0)
      .locator("option")
      .evaluateAll((options) => options.map((o) => o.value).filter(Boolean));
    for (let i = 0; i < (await records.count()); i += 1)
      await records.nth(i).selectOption(lanes[0]);
    await page.locator('[data-action="check-reconstruction"]').click();

    await expect(line).toBeVisible();
    await expect(line).toContainText("in the right lane");
    // And it is still a panel, not bare text on the page.
    const painted = await line.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)"
    );
    expect(painted, "the line that has something to say is still drawn as a panel").toBe(true);
  });
});
