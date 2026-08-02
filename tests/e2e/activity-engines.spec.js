// The four activity engines (engine/activities/), hosted by activityScreen() in main.js.
//
// Banks the things the unit tests cannot reach, because they are about the wiring rather than the
// reducers:
//
//   1. INTERVIEW renders its question chips inside the *field dialogue bubble*, out on the map. It
//      is the only engine that runs anywhere but its own screen, and the only consumer of the
//      registry's optional renderInline slot.
//   2. Hearing an answer and keeping it are two moves. Only a logged answer reaches the notebook,
//      the coverage bar, and DISCREPANCY's evidence column.
//   3. An activity screen resolves its record from progress.activeActivitySourceId, so it survives a
//      reload. The three welded screens this replaced only managed that by hardcoding one source
//      apiece — mapJigsawScreen() opened with sourceById("waldseemuller-map").
//   4. DISCREPANCY's observation column is gated on what the player logged in the interview. That
//      cross-activity link is the whole cause-and-effect mechanism and lives entirely in main.js's
//      interviewTokens().
//   5. A filed interview stops the cast offering questions, and the Mission Tracker is what gets you
//      back to the notebook afterwards.
import { expect, test } from "@playwright/test";
import { loadSeededSave, readProgress, seedProgress, walkToNpc } from "./helpers/progress-seed.js";

const CASE_001 = {
  activeCaseId: "case-001",
  selectedCaseId: "case-001",
  unlocked: ["case-001"],
};

// The interview's state, as it stands after the player has put two questions to two people and
// written both down.
const LOGGED_TWO = {
  "taino-context": {
    state: {
      asked: { "taino-gardener": ["grows"], columbus: ["gold"] },
      logged: { "taino-gardener": ["grows"], columbus: ["gold"] },
      filed: null,
    },
    completed: false,
  },
};

// Every useful answer on the island, which is what the mission now requires before it can be filed —
// and, filed, what takes the question chips off the cast.
const FILED = {
  "taino-context": {
    state: {
      asked: {
        "taino-elder": ["decides"],
        "taino-gardener": ["grows"],
        "taino-fisher": ["trade"],
        "taino-child": ["grows"],
        columbus: ["gold"],
        "spanish-scribe": ["decides"],
        "spanish-sailor": ["trade"],
      },
      logged: {
        "taino-elder": ["decides"],
        "taino-gardener": ["grows"],
        "taino-fisher": ["trade"],
        "taino-child": ["grows"],
        columbus: ["gold"],
        "spanish-scribe": ["decides"],
        "spanish-sailor": ["trade"],
      },
      filed: "questions",
    },
    completed: true,
  },
};

test.describe("INTERVIEW, out on the map", () => {
  test("a question is asked, then kept, from inside the dialogue bubble", async ({ page }) => {
    test.setTimeout(90_000);
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "field",
      // An interview with state is a live one; before the elder's record is opened there is
      // nothing for the cast to be asked.
      sourceActivities: LOGGED_TWO,
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

    // Heard is not kept. Nothing is in the notebook until the button is pressed.
    let progress = await readProgress(page);
    expect(progress.sourceActivities["taino-context"].state.asked["taino-child"]).toEqual([
      "grows",
    ]);
    expect(progress.sourceActivities["taino-context"].state.logged["taino-child"]).toBeUndefined();

    await bubble.locator(".field-interview__log").click();
    await expect(bubble.locator(".field-interview__logged")).toContainText("In your notebook");
    await expect(bubble.locator(".field-interview__log")).toHaveCount(0);

    progress = await readProgress(page);
    expect(progress.sourceActivities["taino-context"].state.logged["taino-child"]).toEqual([
      "grows",
    ]);

    // The bubble grew by a log button in Phase 69, and it was already at the limit of what fits
    // above a speaker — an answer plus four chips is roughly double a standing line. What keeps it
    // on screen is placeFieldDialogueBubble()'s measured flip, and the only way to know that still
    // works is to measure the result. Clipping here reads as content that failed to render.
    const fits = await page.evaluate(() => {
      const box = document.querySelector(".field-speech-bubble").getBoundingClientRect();
      const frame = document.getElementById("caseFieldMap").getBoundingClientRect();
      return box.top >= frame.top - 1 && box.bottom <= frame.bottom + 1;
    });
    expect(fits).toBe(true);
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

  test("a filed interview takes the questions off the cast, and the tracker still opens it", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "field",
      sourceActivities: FILED,
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // The first playtest found Columbus still holding out four question chips long after the
    // record they belonged to had been closed.
    expect(await walkToNpc(page, "taino-child")).toBe(true);
    await page.locator('[data-npc="taino-child"]').click();
    await expect(page.locator(".field-speech-bubble")).toBeVisible();
    await expect(page.locator(".field-interview__q")).toHaveCount(0);

    // And the notebook is still reachable, which is the other half of the same change: the
    // answers do not become unreadable just because the record is filed.
    const tracker = page.locator(".field-tracker");
    await expect(tracker).toContainText("Mission Tracker");
    await expect(tracker).toContainText("The Question Nobody Asked");
    await tracker.locator('[data-action="open-activity-notebook"]').click();

    await expect(page.locator(".activity-board--interview")).toBeVisible();
    expect((await readProgress(page)).currentScreen).toBe("interview");
  });

  test("the tracker reports how far along the mission is", async ({ page }) => {
    test.setTimeout(90_000);
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "field",
      sourceActivities: LOGGED_TWO,
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // Two of the seven accounts logged. One number, not two — the whole point of making
    // `requires` one dimension.
    await expect(page.locator(".field-tracker__progress")).toContainText(
      "Islanders' accounts secured"
    );
    await expect(page.locator(".field-tracker__progress b")).toHaveText("2");
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

    // The cartouches wait on the sheet, so their controls are inert until it is rebuilt.
    const cartouches = page.locator(".activity-assembly-board--label");
    await expect(cartouches).toHaveClass(/is-locked/);
    await expect(cartouches).toContainText("Finish The printed sheet first.");
    await expect(page.locator('[data-activity-fragment="america"]')).toBeDisabled();

    // Select-then-place, no drag event — the path the ten-piece jigsaw never had.
    await page.locator('[data-activity-fragment="f1"]').click();
    await expect(page.locator('[data-activity-fragment="f1"]')).toHaveClass(/is-selected/);
    await page.locator('[data-board="sheet"][data-slot="p5"]').click();

    // Wrong slot, so the board says why it looked right rather than just refusing — and names the
    // slot, because an unlabelled image tile has no name on screen to be called by.
    const slot = page.locator('[data-board="sheet"][data-slot="p5"]');
    await expect(slot).toHaveClass(/is-wrong/);
    await expect(page.locator(".activity-misread")).toContainText("Upper far right");
    await expect(page.locator(".activity-misread")).toContainText(
      "can only be a corner of the sheet"
    );

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
    await page.locator('[data-activity-fragment="f1"]').click();
    await page.locator('[data-board="sheet"][data-slot="p1"]').click();
    await expect(page.locator('[data-board="sheet"][data-slot="p1"]')).toHaveClass(/is-right/);

    // A cold boot always lands on the main menu (showMainMenu is runtime-only), so the two landing
    // clicks are part of "reload" here — the point being tested is which screen Load Save resumes
    // into, not whether the menu is skipped.
    await page.reload();
    await loadSeededSave(page);
    await expect(page.locator(".activity-board--assembly")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("Universalis");
    await expect(page.locator('[data-board="sheet"][data-slot="p1"]')).toHaveClass(/is-right/);
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
    // The letter itself, and who it is for, before any of it is broken into claims.
    await expect(page.locator(".activity-transcript")).toContainText("Hispaniola is a marvel");
    await expect(page.locator(".activity-verdict-prompt")).toContainText(
      "support it, contradict it"
    );

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

  test("the evidence column holds only what this player actually logged", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "discrepancy",
      activeActivitySourceId: "columbus-letter",
      sourceActivities: LOGGED_TWO,
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
    // And the heading counts them, which is the nudge to go back for more.
    await expect(page.locator(".activity-audit__observed h3")).toContainText("3 of 11");
  });

  test("an answer heard but never logged is not evidence", async ({ page }) => {
    // The log button's whole reason for existing, seen from the far end of the chain:
    // interviewTokens() reads `logged`, so an unkept answer buys nothing here.
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "discrepancy",
      activeActivitySourceId: "columbus-letter",
      sourceActivities: {
        "taino-context": {
          state: { asked: { "taino-gardener": ["grows"] }, logged: {}, filed: null },
          completed: false,
        },
      },
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-observations")).not.toContainText(
      "Yuca heaped into mounds"
    );
    await expect(page.locator(".activity-audit__observed h3")).toContainText("1 of 11");
  });
});
