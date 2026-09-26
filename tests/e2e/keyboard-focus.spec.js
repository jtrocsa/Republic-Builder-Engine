// **A press does not lose the keyboard's place.**
//
// `render()` replaces `#app` wholesale, and until Phase 154 the focused control went with it: focus
// fell to <body>, and a keyboard player's next Tab began again at the chrome's brand button — and
// scrolled the page to the top to show it. On every screen that is not the map, on every press. The
// Practice Check's HIPP section sits 3,316px down; one arrow key on one of its options put the next
// Tab at the top of the page. An MCQ could not be answered by arrow keys at all, because each arrow
// fires `change` and the change re-rendered the radio group out from under the student before they
// could reach the third choice. The sequencing quest's ↑/↓ buttons exist *for* the keyboard and lost
// their place on every press.
//
// The fix is engine/focus-keeper.js, applied by render() when the view is unchanged — the focus half
// of `0124`'s rule that the screen you are on does not move under you. Two halves are asserted here
// as well as the fix, because each of them alone would pass a naive sweep: **a mouse press still
// leaves nothing focused** (the rule is for the keyboard, and a mouse player's screen is unchanged),
// and **on the field a keyboard press is still blurred**, because there Enter is the interaction key
// and a focused button would take it from the game. See
// `docs/decision-log/0153-a-press-does-not-lose-your-place.md`.

import { test, expect } from "@playwright/test";
import { openSeededSave, briefed, beginFromTitle } from "./helpers/progress-seed.js";

const DONE = { tutorial: { step: "complete", completed: true, skipped: false } };
const CASE_001 = {
  ...DONE,
  activeCaseId: "case-001",
  selectedCaseId: "case-001",
  unlocked: ["case-001"],
};
const CASE_004 = {
  ...DONE,
  activeCaseId: "case-004",
  selectedCaseId: "case-004",
  unlocked: ["case-001", "case-002", "case-003", "case-004"],
};
const SECURED = {
  caseEvidence: { "case-001": ["taino-context", "columbus-letter", "waldseemuller-map"] },
};

/** Where focus is, in words a failure message can use. */
const focusReport = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { where: "body" };
    const rect = el.getBoundingClientRect();
    return {
      where: el.closest("header.chrome")
        ? "chrome"
        : el.closest("#app main")
          ? "main"
          : "elsewhere",
      tag: el.tagName,
      data: { ...el.dataset },
      value: el.value,
      checked: el.checked,
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      viewport: window.innerHeight,
      scrollY: Math.round(window.scrollY),
    };
  });

// Every control a student works a board or a quest with. A press on any of them re-renders the
// screen it is on and must leave focus on the screen, on a control that is visible. The closer
// (`file`) is excluded because it leaves for the debrief, which is a new view and opens at its top.
const SWEEP = [
  ["the Practice Check", { ...CASE_001, currentScreen: "practice-check" }, ".quest", 25],
  [
    "the Archive Rotation",
    { ...CASE_001, currentScreen: "archive-rotation" },
    ".mastery-board",
    25,
  ],
  [
    "a discrepancy board",
    {
      ...CASE_001,
      currentScreen: "discrepancy",
      activeActivitySourceId: "columbus-letter",
      sourceActivities: briefed("columbus-letter"),
    },
    ".activity-board",
    15,
  ],
  [
    "an assembly board",
    {
      ...CASE_001,
      currentScreen: "assembly",
      activeActivitySourceId: "waldseemuller-map",
      sourceActivities: briefed("waldseemuller-map"),
    },
    ".activity-board",
    15,
  ],
  [
    "a trace board",
    {
      ...CASE_004,
      currentScreen: "trace",
      activeActivitySourceId: "riverbend-ledger",
      sourceActivities: briefed("riverbend-ledger"),
    },
    ".activity-board",
    15,
  ],
  [
    "the Navigation Table",
    {
      ...CASE_001,
      unlocked: ["case-001", "case-002", "case-004"],
      currentScreen: "archive",
    },
    ".archive-shell, main",
    5,
  ],
];

test.describe("a press does not lose the keyboard's place", () => {
  for (const [label, seed, scope, floor] of SWEEP) {
    test(`on ${label}, by every control on it`, async ({ page }) => {
      await page.setViewportSize({ width: 1366, height: 768 });
      await openSeededSave(page, seed);
      await expect(page.locator(scope).first()).toBeVisible();

      const pressed = new Set();
      let presses = 0;
      for (let n = 0; n < 40; n++) {
        // Tag the next control not yet pressed. Its name is read before the tag goes on.
        const next = await page.evaluate(
          ({ scopeSelector, done }) => {
            const nameOf = (el) =>
              `${el.tagName}|${[...el.attributes]
                .filter((a) => a.name.startsWith("data-") || a.name === "value")
                .map((a) => `${a.name}=${a.value}`)
                .sort()
                .join("&")}`;
            const scopes = [...document.querySelectorAll(scopeSelector)];
            const controls = [
              ...document.querySelectorAll("#app button, #app input, #app select"),
            ].filter(
              (el) =>
                scopes.some((s) => s.contains(el)) &&
                !el.closest("header.chrome") &&
                !el.disabled &&
                el.getClientRects().length &&
                el.type !== "text" &&
                el.tagName !== "TEXTAREA" &&
                el.dataset.activityAction !== "file" &&
                // Leaving the screen is a new view, and a new view opens with nothing focused.
                !["field", "home", "hub-return", "travel", "mini-games"].includes(el.dataset.action)
            );
            const el = controls.find((c) => !done.includes(nameOf(c)));
            if (!el) return null;
            const name = nameOf(el);
            el.setAttribute("data-kf-next", "");
            return { name, radioOrSelect: el.type === "radio" || el.tagName === "SELECT" };
          },
          { scopeSelector: scope, done: [...pressed] }
        );
        if (!next) break;
        pressed.add(next.name);
        const control = page.locator("[data-kf-next]");
        await control.focus();
        await control.evaluate((el) => el.removeAttribute("data-kf-next"));
        await page.keyboard.press(next.radioOrSelect ? "ArrowDown" : "Enter");
        presses += 1;
        // The press has been handled by the time the page answers this: every render is synchronous.
        const report = await focusReport(page);
        expect(report.where, `after pressing ${next.name}: ${JSON.stringify(report)}`).toBe("main");
        expect(
          report.top,
          `the focused control is above the window after ${next.name}`
        ).toBeGreaterThanOrEqual(0);
        expect(
          report.bottom,
          `the focused control is below the window after ${next.name}`
        ).toBeLessThanOrEqual(report.viewport);
      }
      // A sweep that pressed nothing proves nothing, so each row states how much it expects to find.
      expect(presses).toBeGreaterThanOrEqual(floor);
    });
  }
});

test.describe("what a keyboard player gets back", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
  });

  test("the next Tab carries on from the control you pressed, not from the top of the page", async ({
    page,
  }) => {
    await openSeededSave(page, {
      ...CASE_001,
      currentScreen: "discrepancy",
      activeActivitySourceId: "columbus-letter",
      sourceActivities: briefed("columbus-letter"),
    });
    const verdict = page.locator('[data-claim="mines"][data-verdict="supported"]');
    await verdict.focus();
    await page.keyboard.press("Enter");
    const pressedAt = await focusReport(page);
    expect(pressedAt.data).toMatchObject({ claim: "mines", verdict: "supported" });

    await page.keyboard.press("Tab");
    const next = await focusReport(page);
    // The player's own next control, and the page did not go back to its heading to find it. Before
    // Phase 154 this was the chrome's brand button, at scrollY 0.
    expect(next.data).toMatchObject({ claim: "mines", verdict: "complicated" });
    expect(next.scrollY).toBe(pressedAt.scrollY);
  });

  test("an MCQ can be answered with the arrow keys", async ({ page }) => {
    await openSeededSave(page, { ...CASE_001, currentScreen: "practice-check" });
    const quest = page.locator('.quest[data-quest-id="case-001-mcq-taino-sourcing"]');
    await quest.locator('input[type="radio"]').first().focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    // Each arrow fires `change`, and each change re-renders the quest. The group has to survive both.
    const report = await focusReport(page);
    expect(report.data.mcqQuest).toBe("case-001-mcq-taino-sourcing");
    expect(report.value).toBe("2");
    expect(report.checked).toBe(true);
  });

  test("a sequencing button stays with the row it moved", async ({ page }) => {
    await openSeededSave(page, { ...CASE_001, currentScreen: "practice-check" });
    const quest = page.locator('.quest[data-quest-id="case-001-sequencing-columbian-exchange"]');
    const rows = quest.locator(".sequence-item");
    const last = await rows.last().getAttribute("data-sequence-item");
    await quest.locator(`[data-sequence-item="${last}"][data-direction="up"]`).focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    const report = await focusReport(page);
    expect(report.data).toMatchObject({ sequenceItem: last, direction: "up" });
    const count = await rows.count();
    await expect(quest.locator(`.sequence-item[data-sequence-item="${last}"]`)).toHaveAttribute(
      "data-sequence-index",
      String(count - 3)
    );
  });

  test("a held key still does one thing", async ({ page }) => {
    // Chrome clicks a focused button on every auto-repeat of Enter. Before Phase 154 the first press
    // blurred the button, so a held key did exactly one thing; now the button keeps its focus, and
    // without a guard a held Enter would walk a row to the top — or, once its ↑ went disabled, press
    // whatever the focus had fallen back to.
    await openSeededSave(page, { ...CASE_001, currentScreen: "practice-check" });
    const quest = page.locator('.quest[data-quest-id="case-001-sequencing-columbian-exchange"]');
    const rows = quest.locator(".sequence-item");
    const count = await rows.count();
    const last = await rows.last().getAttribute("data-sequence-item");
    await quest.locator(`[data-sequence-item="${last}"][data-direction="up"]`).focus();
    // A second `down` on a key already held is sent with `repeat: true`.
    for (let i = 0; i < 4; i++) await page.keyboard.down("Enter");
    await page.keyboard.up("Enter");
    await expect(quest.locator(`.sequence-item[data-sequence-item="${last}"]`)).toHaveAttribute(
      "data-sequence-index",
      String(count - 2)
    );
    // And Space, which activates on release, still activates once after being held.
    for (let i = 0; i < 4; i++) await page.keyboard.down(" ");
    await page.keyboard.up(" ");
    await expect(quest.locator(`.sequence-item[data-sequence-item="${last}"]`)).toHaveAttribute(
      "data-sequence-index",
      String(count - 3)
    );
  });

  test("a Tab out of a reflection lands where it was going, on screen", async ({ page }) => {
    // Chrome commits a text field's `change` as focus leaves it, with activeElement already <body>,
    // and the render that change triggers replaced the control the Tab was heading for.
    await openSeededSave(page, { ...CASE_001, currentScreen: "practice-check" });
    const reflection = page.locator("[data-evidence-reflection]");
    await reflection.focus();
    await page.keyboard.type("Because the letter was written to win a patron.");
    await page.keyboard.press("Tab");
    const forward = await focusReport(page);
    expect(forward.where).toBe("main");
    expect(forward.data.hippOption).toBeTruthy();
    expect(forward.bottom).toBeLessThanOrEqual(forward.viewport);

    await reflection.focus();
    await page.keyboard.type(" And a crown.");
    await page.keyboard.press("Shift+Tab");
    const back = await focusReport(page);
    expect(back.data.evidenceSelect).toBeTruthy();
    expect(back.top).toBeGreaterThanOrEqual(0);
  });

  test("a press that only writes a status line keeps its control", async ({ page }) => {
    // handleAppClick blurred every press before its handler ran. Where the handler then re-rendered,
    // render() could not tell what had been pressed; where it only wrote a line, the player was left
    // on <body> with nothing re-rendered at all.
    await openSeededSave(page, { ...CASE_001, ...SECURED, currentScreen: "reconstruction" });
    await page.locator('[data-action="check-reconstruction"]').focus();
    await page.keyboard.press("Enter");
    expect((await focusReport(page)).data.action).toBe("check-reconstruction");
  });

  test("the Archive Rotation's Next goes to the next question, not to the chrome", async ({
    page,
  }) => {
    await openSeededSave(page, { ...CASE_001, currentScreen: "archive-rotation" });
    const first = page.locator(".quest").first();
    const firstId = await first.getAttribute("data-quest-id");
    await first.locator('input[type="radio"]').first().focus();
    await page.keyboard.press("ArrowDown");
    await page.locator('[data-action="rotation-next"]').focus();
    await page.keyboard.press("Enter");
    const report = await focusReport(page);
    expect(report.where).toBe("main");
    const questOfFocus = await page.evaluate(
      () => document.activeElement?.closest(".quest")?.getAttribute("data-quest-id") ?? null
    );
    expect(questOfFocus).toBeTruthy();
    expect(questOfFocus).not.toBe(firstId);
  });

  test("the landing's music toggle keeps its focus", async ({ page }) => {
    await page.goto("/");
    await beginFromTitle(page);
    const toggle = page.locator('[data-action="toggle-audio"]');
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(toggle).toBeFocused();
  });
});

test.describe("what is unchanged", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
  });

  test("a mouse press still leaves nothing focused", async ({ page }) => {
    // Without this, keeping focus for everyone would pass the whole file — and would draw
    // `.choice:focus-within`'s outline under every mouse player's answer.
    await openSeededSave(page, {
      ...CASE_001,
      currentScreen: "discrepancy",
      activeActivitySourceId: "columbus-letter",
      sourceActivities: briefed("columbus-letter"),
    });
    await page.locator('[data-claim="mines"][data-verdict="supported"]').click();
    expect((await focusReport(page)).where).toBe("body");
  });

  test("on the field a keyboard press is still blurred, because Enter belongs to the game", async ({
    page,
  }) => {
    await openSeededSave(page, { ...CASE_001, currentScreen: "field" });
    await expect(page.locator(".field-viewport")).toBeVisible();
    const toggle = page.locator('header.chrome [data-action="toggle-audio"]');
    await toggle.focus();
    // Space, not Enter: on the field Enter goes to nearestFieldInteraction() first and is consumed
    // if anything is in reach, so it might never reach the button at all.
    await page.keyboard.press("Space");
    await expect(toggle).toContainText("Music on");
    expect((await focusReport(page)).where).toBe("body");
  });
});
