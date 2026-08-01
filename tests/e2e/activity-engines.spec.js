// The four activity engines (engine/activities/), hosted by activityScreen() in main.js.
//
// Banks three things the unit tests cannot reach, because they are about the wiring rather than the
// reducers:
//
//   1. INTERVIEW renders its question chips inside the *field dialogue bubble*, out on the map. It
//      is the only engine that runs anywhere but its own screen, and the only consumer of the
//      registry's optional renderInline slot.
//   2. An activity screen resolves its record from progress.activeActivitySourceId, so it survives a
//      reload. The three welded screens this replaced only managed that by hardcoding one source
//      apiece — mapJigsawScreen() opened with sourceById("waldseemuller-map").
//   3. DISCREPANCY's observation column is gated on what the player asked in the interview. That
//      cross-activity link is the whole cause-and-effect mechanism and lives entirely in main.js's
//      interviewTokens().
import { expect, test } from "@playwright/test";
import { loadSeededSave, readProgress, seedProgress, walkToNpc } from "./helpers/progress-seed.js";

const CASE_001 = {
  activeCaseId: "case-001",
  selectedCaseId: "case-001",
  unlocked: ["case-001"],
};

// The interview's state, as it stands after the player has put two questions to two people.
const ASKED_TWO = {
  "taino-context": {
    state: {
      asked: { "taino-gardener": ["grows"], columbus: ["gold"] },
      filed: null,
    },
    completed: false,
  },
};

test.describe("INTERVIEW, out on the map", () => {
  test("question chips appear in the dialogue bubble once the interview is open", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "field",
      // An interview with state is a live one; before the elder's record is opened there is
      // nothing for the cast to be asked.
      sourceActivities: ASKED_TWO,
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    expect(await walkToNpc(page, "taino-child")).toBe(true);
    await page.locator('[data-npc="taino-child"]').click();

    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    // His own standing line stays above the chips — it is what tells a player he is worth asking.
    await expect(bubble).toContainText("Nobody asks me what grows here");
    await expect(bubble.locator(".field-interview__q")).toHaveCount(4);

    await bubble.locator('[data-question="grows"]').click();
    await expect(bubble.locator(".field-interview__answer")).toContainText("I just did.");
    // A useful answer is marked as such, which is what the notebook and the audit both key off.
    await expect(bubble.locator(".field-interview__answer")).toHaveClass(/is-useful/);

    const progress = await readProgress(page);
    expect(progress.sourceActivities["taino-context"].state.asked["taino-child"]).toEqual([
      "grows",
    ]);
  });

  test("someone outside the cast gets their line and no chips", async ({ page }) => {
    test.setTimeout(90_000);
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "field",
      // No interview state at all: nobody on the map has questions to be put to them yet.
      sourceActivities: {},
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    expect(await walkToNpc(page, "taino-child")).toBe(true);
    await page.locator('[data-npc="taino-child"]').click();
    await expect(page.locator(".field-speech-bubble")).toBeVisible();
    await expect(page.locator(".field-interview__q")).toHaveCount(0);
  });
});

test.describe("ASSEMBLY", () => {
  test("places a fragment from the keyboard and explains a wrong one", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "assembly",
      activeActivitySourceId: "waldseemuller-map",
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--assembly")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("Universalis");

    // Select-then-place, no drag event — the path the ten-piece jigsaw never had.
    await page.locator('[data-activity-fragment="america"]').click();
    await expect(page.locator('[data-activity-fragment="america"]')).toHaveClass(/is-selected/);
    await page.locator('[data-board="cartouches"][data-slot="north"]').click();

    // Wrong slot, so the board says why it looked right rather than just refusing.
    const slot = page.locator('[data-board="cartouches"][data-slot="north"]');
    await expect(slot).toHaveClass(/is-wrong/);
    await expect(page.locator(".activity-misread")).toContainText("he had named one southern");

    // And the closer stays locked while any board is unsolved.
    await expect(page.locator(".activity-closer")).toHaveClass(/is-locked/);
    await expect(page.locator(".activity-option").first()).toBeDisabled();
  });

  test("resumes in the same activity after a reload", async ({ page }) => {
    // progress.activeActivitySourceId is the only reason this works: openSourceId is module-local
    // and dies with the page.
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "assembly",
      activeActivitySourceId: "waldseemuller-map",
    });
    await loadSeededSave(page);
    await page.locator('[data-activity-fragment="india"]').click();
    await page.locator('[data-board="cartouches"][data-slot="east"]').click();
    await expect(page.locator('[data-board="cartouches"][data-slot="east"]')).toHaveClass(
      /is-right/
    );

    // A cold boot always lands on the main menu (showMainMenu is runtime-only), so the two landing
    // clicks are part of "reload" here — the point being tested is which screen Load Save resumes
    // into, not whether the menu is skipped.
    await page.reload();
    await loadSeededSave(page);
    await expect(page.locator(".activity-board--assembly")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("Universalis");
    await expect(page.locator('[data-board="cartouches"][data-slot="east"]')).toHaveClass(
      /is-right/
    );
  });
});

test.describe("DISCREPANCY", () => {
  test("opens the error-or-design question only once the verdict is landed", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "discrepancy",
      activeActivitySourceId: "columbus-letter",
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--discrepancy")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("What Will Be Useful");

    const claim = page.locator(".activity-claim").filter({ hasText: "great mines of gold" });
    await expect(claim.locator(".activity-gap")).toHaveCount(0);

    // A wrong verdict must not open it — being shown "error or design?" would give the answer away.
    await claim.locator('[data-verdict="supported"]').click();
    await expect(claim.locator(".activity-gap")).toHaveCount(0);

    await claim.locator('[data-verdict="contradicted"]').click();
    await expect(claim.locator(".activity-gap")).toHaveCount(1);
    await claim.locator('[data-gap="design"]').click();
    await expect(claim).toHaveClass(/is-settled/);
    await expect(claim.locator(".activity-why")).toContainText("funded on a promise");
  });

  test("the evidence column holds only what this player actually asked for", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "discrepancy",
      activeActivitySourceId: "columbus-letter",
      sourceActivities: ASKED_TWO,
    });
    await loadSeededSave(page);

    const observed = page.locator(".activity-observations");
    // Asked the gardener what grows, and Columbus about gold.
    await expect(observed).toContainText("Yuca heaped into mounds");
    await expect(observed).toContainText("funded on a promise");
    // Never asked the elder who decides, so that line of the audit is a hole.
    await expect(observed).not.toContainText("A cacique speaks for the village");
    await expect(observed.locator(".activity-observation.is-missing").first()).toContainText(
      "You did not gather this."
    );
    // The one with no `requires` is always there.
    await expect(observed).toContainText("The anchorage is deep");
  });
});
