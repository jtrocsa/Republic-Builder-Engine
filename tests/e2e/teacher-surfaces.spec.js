import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave } from "./helpers/progress-seed.js";
import { stubSupabase } from "./helpers/supabase-stub.js";

/**
 * **Every teacher tab opens, and opens again after a sign-out.**
 *
 * Phase 144 built the door (`helpers/supabase-stub.js`) and walked one room through it — Manage
 * Content's authoring form. This is the sweep the door was for: all four Teacher Dashboard tabs,
 * then the sign-out/sign-in round trip, then the four tabs again.
 *
 * **The assertion is not "it looks right" — it is that nothing threw.** `render()` catches every
 * renderer exception, resets `progress.currentScreen` to `institute` and shows "The Archive display
 * recovered from a render issue", so a `TypeError` on a teacher screen is invisible by
 * construction: the teacher sees a generic Institute screen and no error reaches anyone. That catch
 * is a real safety net and stays. This spec is the other half — it watches the console for the
 * `Chronicle render recovery` line the catch logs, and watches the DOM for the screen it swaps in.
 *
 * The sign-out half is the reproduction of a bug that actually shipped: `teacherUiState` was
 * rebuilt from a hand-written literal on sign-out that had drifted from its declaration, dropping
 * three `Set` fields, so signing out and back in within one page session made the Sources tab throw
 * on its first `.has(...)`. Phase 133 fixed it with `initialTeacherUiState()` and asserted the key
 * sets match in `tests/unit/ui-state-shapes.test.js`. That guard compares shapes; this one opens
 * the screen.
 */

const TABS = ["Classrooms", "Assignments", "Sources", "Units"];

/** Every way the render catch announces itself, in one place. */
function watchForRenderRecovery(page) {
  const recoveries = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Chronicle render recovery")) {
      recoveries.push(message.text());
    }
  });
  page.on("pageerror", (error) => recoveries.push(`uncaught: ${error.message}`));
  return recoveries;
}

async function signInAsTeacher(page) {
  await page.locator('[data-action="dev-fake-teacher"]').first().click();
  await expect(page.locator("h1")).toHaveText("Teacher Dashboard");
}

async function openTab(page, label) {
  await page.locator('[data-action="select-teacher-tab"]', { hasText: label }).first().click();
  // The dashboard heading survives a tab change; the recovery screen replaces it. Asserting the
  // heading is therefore the cheapest way to say "this tab rendered rather than being caught".
  await expect(
    page.locator("h1"),
    `opening the ${label} tab left the Teacher Dashboard`
  ).toHaveText("Teacher Dashboard");
}

/**
 * Open a unit's pool and a source's preview inside it.
 *
 * **Opening the Sources tab is not enough to exercise it.** All three of `teacherUiState`'s `Set`
 * fields are read from `sourceRowMarkup()` / `sourcePoolPreviewMarkup()`, and neither runs until a
 * unit section is expanded and its pool has resolved — so a sweep that only clicks the tab walks
 * past the exact lines the sign-out bug broke. This goes in one level.
 */
async function openFirstUnitPool(page, recoveries) {
  await page.locator('[data-action="toggle-sources-unit"]').first().click();
  // The pool loads asynchronously and renders "Loading…" until it resolves — so the wait has three
  // outcomes, not two, and the third has to be asked about here rather than inferred later. When
  // the render throws, the catch swaps the whole screen out and the rows simply never appear; a
  // bare `toBeVisible()` then reports a missing button five seconds after the `TypeError` that
  // removed it, which names the symptom and hides the cause.
  const poolState = async () =>
    recoveries.length
      ? `render threw: ${recoveries.join(" | ")}`
      : (await page.locator('[data-action="toggle-source-preview"]').count()) > 0
        ? "rows"
        : "loading";
  await expect
    .poll(poolState, { message: "the unit's source pool never rendered its rows" })
    .toBe("rows");
  await page.locator('[data-action="toggle-source-preview"]').first().click();
  await expect(page.locator(".source-pool-preview").first()).toBeVisible();
  const fullText = page.locator('[data-action="toggle-source-fulltext"]').first();
  if ((await fullText.count()) > 0) await fullText.click();
}

test.describe("Teacher Dashboard — every tab, and again after signing out", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("all four tabs render, before and after a sign-out round trip", async ({ page }) => {
    test.setTimeout(180_000);
    const recoveries = watchForRenderRecovery(page);
    await stubSupabase(page);

    await seedProgress(page, { currentScreen: "login" });
    await loadSeededSave(page);
    await signInAsTeacher(page);

    for (const tab of TABS) await openTab(page, tab);
    await openTab(page, "Sources");
    await openFirstUnitPool(page, recoveries);

    expect(recoveries, `a tab threw on the first pass: ${recoveries.join(" | ")}`).toEqual([]);

    // --- out and back in, on the same page -----------------------------------------------------
    await page.locator('[data-action="teacher-sign-out"]').first().click();
    await expect(page.locator('[data-action="dev-fake-teacher"]')).toHaveCount(0);

    // Sign-out lands on the Institute. The login screen is reached the way a teacher reaches it —
    // chrome Menu → Teacher — and deliberately not by reloading, because a reload would rebuild the
    // module state this half of the test is entirely about.
    await page.locator('[data-action="open-main-menu"]').first().click();
    await page.locator('[data-action="open-teacher-login"]').first().click();
    await signInAsTeacher(page);

    for (const tab of TABS) await openTab(page, tab);
    await openTab(page, "Sources");
    await openFirstUnitPool(page, recoveries);

    expect(
      recoveries,
      "a teacher screen threw after signing out and back in within one page session — this is the " +
        "shape of the bug Phase 133 fixed, where a re-initialiser drifted from its declaration " +
        `and left a Set undefined: ${recoveries.join(" | ")}`
    ).toEqual([]);
  });
});
