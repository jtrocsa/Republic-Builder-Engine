// The fourteen non-field missions — Spine Review Part 10, the program's last part.
//
// `route: "mission"` reaches `missionScreen()`, which frames one case's own quest and nothing else.
// Nothing walked all fourteen before this: the visual suite screenshots one of them, and the unit
// tests see the quest types but never the screen that frames them. What this banks:
//
//   1. P10-1 — a mission says **Mission**. `archiveChallengeQuestCard()` is the shared core for a
//      mission and for a real Archive Challenge, and it hard-coded the Archive Challenge's word into
//      both completion strings, so all fourteen announced themselves as the other thing. The
//      distinction is load-bearing (INVARIANTS.md §34), and there was a test for the content split
//      and none for what the screen then calls it.
//   2. P10-2 — a mission the player finished does not claim to have been restored for them. That
//      message exists for saves migrated at the Phase 58 split, whose quest was never answered;
//      `alreadyComplete` is passed `completedCases.includes(...)`, which is true of every finished
//      mission, so the migration affordance swallowed the ordinary case. Both sides are checked,
//      because keeping the migrated one working is the whole reason the branch survives.
//   3. P10-3 — the date appears once. Twelve of the fourteen carry it inside `location` already.
//   4. P10-6 — finishing one says what it just opened.
//   5. P10-4 — a finished mission shows the player's own answer back, and cannot be edited into
//      disagreeing with itself. Routed out of Part 10 to an ADR because it needed a read-only mode
//      across the quest types; shipped as `renderQuest(..., { readOnly: true })`.
import { expect, test } from "@playwright/test";
import {
  PROGRESS_KEY,
  loadSeededSave,
  reloadIntoSave,
  seedProgress,
} from "./helpers/progress-seed.js";

// Every case whose route is "mission". Sixteen, not the ten this part was named for — Units 6 and 7
// added four after the row was written and Unit 8 added two more in Phase 97.
const MISSIONS = [
  "case-002",
  "case-003",
  "case-005",
  "case-006",
  "case-008",
  "case-009",
  "case-011",
  "case-012",
  "case-014",
  "case-015",
  "case-017",
  "case-018",
  "case-020",
  "case-021",
  "case-023",
  "case-024",
];

// **A page stalls on its fourteenth navigation against the dev server, and this is measured.**
// Thirteen consecutive reloads of "/" run at 1.0-1.3s each and the fourteenth never fires `load`,
// with its module requests left outstanding — reproduced on a bare Playwright script with no test
// framework in it, on this commit and on the one before it. It is a property of one page, not of the
// context or the server: opening a fresh page every six navigations runs twenty of them at a
// constant 1.1s.
//
// So the loop below works in batches. This test was one navigation under the cliff at fourteen
// missions and went over it at sixteen — but it was already failing at fourteen when Phase 97 found
// it, which is worth knowing before anybody reads the batch size as a workaround for Unit 8.
const NAVIGATIONS_PER_PAGE = 6;

const BANK_WAR = "case-011-mission-bank-war-chronology";
const BANK_WAR_SOLVED = [
  "bank-chartered-1816",
  "jackson-elected-1828",
  "veto-1832",
  "deposits-removed-1833",
  "charter-expires-1836",
  "panic-1837",
];

async function openMission(page, caseId, extra = {}) {
  await page.evaluate(({ key, data }) => window.localStorage.setItem(key, JSON.stringify(data)), {
    key: PROGRESS_KEY,
    data: {
      currentScreen: "mission",
      activeCaseId: caseId,
      selectedCaseId: caseId,
      unlocked: MISSIONS,
      ...extra,
    },
  });
  await reloadIntoSave(page);
  await expect(page.locator(".mission-shell")).toBeVisible();
}

test.describe("every non-field mission", () => {
  test.beforeEach(async ({ page }) => {
    await seedProgress(page, { currentScreen: "archive" });
    await loadSeededSave(page);
  });

  test("renders a real quest, and says its place and date once (P10-3)", async ({ page }) => {
    test.setTimeout(180_000);
    // The fixture's own page is never closed — Playwright owns its teardown. Later batches get
    // pages of their own, seeded the way beforeEach seeds this one, and are closed at the end.
    const opened = [];
    let sheet = page;
    for (const [index, caseId] of MISSIONS.entries()) {
      if (index > 0 && index % NAVIGATIONS_PER_PAGE === 0) {
        sheet = await page.context().newPage();
        opened.push(sheet);
        await seedProgress(sheet, { currentScreen: "archive" });
        await loadSeededSave(sheet);
      }
      await openMission(sheet, caseId);
      // One card with something to answer on it. A mission whose quest failed to resolve renders an
      // empty board rather than throwing, which is the shape worth checking across all fourteen.
      await expect(sheet.locator(".archive-challenge-item"), caseId).toHaveCount(1);

      const meta = await sheet.locator(".mission-meta span").allTextContents();
      expect(meta.length, `${caseId} meta chips`).toBe(1);
      // The duplication this replaced: "Washington, D.C. · 1816–1837" and then "1816–1837" beside
      // it, on twelve of the fourteen.
      //
      // Counting **datelines**, not repeated years. Until Phase 108 this asked whether one year
      // appeared twice — the same proxy `caseWhereAndWhen()` itself was using, and it misses the
      // only shape that can still get through: a location carrying the day a document was
      // delivered against a `date` carrying the span the case covers. Case 8.02 rendered
      // "The United States Senate · 1 June 1950 · 1947–1954" and passed here on every run, because
      // 1950, 1947 and 1954 are three different years. See decision log `0107`.
      const dated = meta[0].split(" · ").filter((part) => /\d{4}/.test(part));
      expect(dated, `${caseId} names two dates in "${meta[0]}"`).toHaveLength(1);
    }
    for (const extraPage of opened) await extraPage.close();
  });

  test("calls itself a Mission on completion, and names what opened (P10-1, P10-6)", async ({
    page,
  }) => {
    // Graded complete from a real answer rather than seeded into `completedCases` — that is the
    // live path, and the one where the next case is named.
    await openMission(page, "case-011", {
      questResponses: { [BANK_WAR]: { order: BANK_WAR_SOLVED } },
    });
    const feedback = page.locator(".activity-feedback");
    await expect(feedback).toContainText("Mission complete");
    await expect(feedback).not.toContainText("Archive Challenge");
    await expect(feedback).toContainText("The Removal Message is now open.");
  });

  test("does not tell a player who finished it that it was restored for them (P10-2)", async ({
    page,
  }) => {
    // Finished, with the answer still in the save — the state every second visit is in.
    await openMission(page, "case-011", {
      completedCases: ["case-011"],
      questResponses: { [BANK_WAR]: { order: BANK_WAR_SOLVED } },
      archiveChallenges: { [BANK_WAR]: { status: "complete" } },
    });
    const feedback = page.locator(".activity-feedback");
    await expect(feedback).toContainText("Mission complete");
    await expect(feedback).not.toContainText("restored");
  });

  test("still says restored for a save that never answered it (P10-2, the other side)", async ({
    page,
  }) => {
    // What `alreadyComplete` was actually written for: completed before the Phase 58 split, so the
    // case is in `completedCases` with no response behind it.
    await openMission(page, "case-011", { completedCases: ["case-011"] });
    await expect(page.locator(".activity-feedback")).toContainText("restored from an earlier save");
  });

  test("a finished mission shows the work back, read-only (P10-4)", async ({ page }) => {
    // The state every second visit is in. Before this the card returned 403 characters with zero
    // quest controls: the order the player arranged was sitting in `questResponses` and appeared
    // on no screen in the game, the Codex included.
    await openMission(page, "case-011", {
      completedCases: ["case-011"],
      questResponses: { [BANK_WAR]: { order: BANK_WAR_SOLVED } },
      archiveChallenges: { [BANK_WAR]: { status: "complete" } },
    });

    const quest = page.locator(".archive-challenge-item .quest-sequencing");
    await expect(quest).toBeVisible();
    await expect(quest).toHaveAttribute("data-quest-readonly", "true");
    // Their arrangement, in their order — not the authored (scrambled) one.
    expect(
      await quest
        .locator("li.sequence-item")
        .evaluateAll((rows) => rows.map((row) => row.dataset.sequenceItem))
    ).toEqual(BANK_WAR_SOLVED);
    await expect(page.locator(".activity-feedback")).toContainText("Mission complete");
  });

  // Every mission is one of the four swappable types, so one mission per type is the whole surface.
  // Each is answered through the real UI rather than seeded, so the response shape is the app's own.
  const ONE_PER_TYPE = [
    { caseId: "case-011", type: "sequencing", answer: ".sequence-move-btn[data-direction='down']" },
    { caseId: "case-012", type: "hipp", answer: ".hipp-option input" },
    { caseId: "case-009", type: "mcq", answer: ".choice input" },
    { caseId: "case-020", type: "evidence-organizing", answer: "[data-evidence-select]" },
  ];

  for (const { caseId, type, answer } of ONE_PER_TYPE) {
    test(`nothing in a finished ${type} mission can still take input (P10-4)`, async ({ page }) => {
      await openMission(page, caseId);

      // Answer it for real, so questResponses is written by the app's own handler.
      const control = page.locator(`.archive-challenge-item ${answer}`).first();
      if (type === "evidence-organizing") {
        const slot = await control.locator("option:not([value=''])").first().getAttribute("value");
        await control.selectOption(slot);
      } else {
        await control.click();
      }
      const answered = await page.evaluate(
        (key) => JSON.parse(window.localStorage.getItem(key)).questResponses,
        PROGRESS_KEY
      );
      expect(Object.keys(answered).length, "the answer did not reach the save").toBeGreaterThan(0);

      // Now finish it, the way `completedCases` records a finished case.
      await page.evaluate(
        ({ key, id }) => {
          const data = JSON.parse(window.localStorage.getItem(key));
          data.completedCases = [id];
          window.localStorage.setItem(key, JSON.stringify(data));
        },
        { key: PROGRESS_KEY, id: caseId }
      );
      await reloadIntoSave(page);

      const quest = page.locator(".archive-challenge-item .quest");
      await expect(quest).toHaveAttribute("data-quest-readonly", "true");
      expect(
        await quest.evaluate((root) => ({
          live: Array.from(root.querySelectorAll("input, select, button")).filter(
            (el) => !el.disabled
          ).length,
          editable: Array.from(root.querySelectorAll("textarea")).filter((el) => !el.readOnly)
            .length,
          draggable: Array.from(root.querySelectorAll("[draggable]")).filter(
            (el) => el.getAttribute("draggable") !== "false"
          ).length,
        }))
      ).toEqual({ live: 0, editable: 0, draggable: 0 });

      // And the mutators refuse independently of the markup. A disabled control still dispatches a
      // synthetic event, which is exactly the shape a stale listener or a devtools poke takes — the
      // guard is `isSealedQuestTarget()` in main.js, derived from the render rather than kept in
      // step with it.
      const before = await page.evaluate((key) => window.localStorage.getItem(key), PROGRESS_KEY);
      // Whatever this type has. A sequencing record has no field at all — its rows are buttons, and
      // this block is hidden entirely — so both delegated entry points get poked and the type that
      // only has one is still covered.
      const fields = quest.locator("input, select, textarea");
      if (await fields.count()) await fields.first().dispatchEvent("change");
      const buttons = quest.locator("button");
      if (await buttons.count()) await buttons.first().dispatchEvent("click");
      await expect
        .poll(async () => page.evaluate((key) => window.localStorage.getItem(key), PROGRESS_KEY))
        .toBe(before);
    });
  }

  test("the Archive Terminal holds written work, and still calls it that", async ({ page }) => {
    // The other caller of the shared card, and the reason `kind` is a parameter rather than a
    // renamed constant.
    await page.evaluate(({ key, data }) => window.localStorage.setItem(key, JSON.stringify(data)), {
      key: PROGRESS_KEY,
      data: { currentScreen: "archive-challenges", selectedUnitId: "unit-03" },
    });
    await reloadIntoSave(page);
    const kickers = await page.locator(".archive-challenge-item .kicker").allTextContents();
    expect(kickers.length).toBeGreaterThan(0);
    kickers.forEach((kicker) => expect(kicker).toContain("Archive Challenge"));
  });
});
