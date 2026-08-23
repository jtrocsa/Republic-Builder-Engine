import { expect, test } from "@playwright/test";
import { loadSeededSave, seedProgress } from "./helpers/progress-seed.js";
import { UNIT_02_ACTIVITIES } from "../../apps/web/src/content/activities/unit-02-activities.js";

// A filed record, and what is still allowed to happen to it — Spine Review Part 8 (decision log
// 0085).
//
// Phase 90F stopped a finished mission's *closer* taking a second conclusion. Part 8's static audit
// found that was one door of five: `release` in the Field Notebook, ASSEMBLY's `lift`,
// DISCREPANCY's `verdict`, and TRACE's `log` and `support` each make isActivityComplete() false
// again on a record fileToCodex() has already written and deliberately never unfiles. The board
// then reads unfinished while the Archive reads filed.
//
// Riverbend's wharf ledger is the fixture for most of this because it is a TRACE with a real
// `notebook` capacity and a correct conclusion gated on two named entries — so it exercises the
// board verbs and the notebook verbs against the same completion predicate. Unit 1's assembly has
// no capacity, which is why the Part 7 spec could not have caught any of it.
//
// The content module is imported directly for the same reason activity-board.spec.js does it: the
// alternative is a second copy of four legs and their answers, going stale silently.

const LEDGER = UNIT_02_ACTIVITIES["riverbend-ledger"];
const RIGHT = LEDGER.closer.options.find((option) => option.correct);

const CASE_004 = {
  selectedUnitId: "unit-02",
  activeCaseId: "case-004",
  selectedCaseId: "case-004",
  unlocked: ["case-001", "case-002", "case-003", "case-004"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

/** Every leg answered on both axes, the two named entries kept, and the right conclusion filed. */
function filedLedger({ debriefed = true } = {}) {
  const ledger = {};
  const support = {};
  for (const leg of LEDGER.legs) {
    ledger[leg.id] = leg.effect;
    support[leg.id] = leg.support;
  }
  return {
    "riverbend-ledger": {
      briefed: true,
      debriefed,
      completed: true,
      state: { ledger, support, filed: RIGHT.id, notebook: { kept: [...RIGHT.requiresEvidence] } },
    },
  };
}

async function openFiledLedger(page, options = {}) {
  await seedProgress(page, {
    ...CASE_004,
    currentScreen: "trace",
    activeActivitySourceId: "riverbend-ledger",
    sourceActivities: filedLedger(options),
  });
  await loadSeededSave(page);
  await expect(page.locator(".activity-board--trace")).toBeVisible();
}

test.describe("a filed record", () => {
  // P8-1, and the door Part 8 owns. The Mission Tracker's own button exists to bring a player back
  // to a notebook they have already filled — so the Release control on a filed record's evidence is
  // about as reachable as a control gets.
  test("stops the Field Notebook being emptied out from under its conclusion", async ({ page }) => {
    await openFiledLedger(page);
    const notebook = page.locator(".evidence-notebook");

    await expect(notebook).toHaveClass(/is-settled/);
    await expect(notebook.locator(".evidence-notebook__settled")).toContainText(
      "This record is filed"
    );
    await expect(notebook.locator('[data-activity-action="release"]:not([disabled])')).toHaveCount(
      0
    );
    await expect(notebook.locator('[data-activity-action="keep"]:not([disabled])')).toHaveCount(0);

    // Belt and braces: even dispatched straight at the handler, the release cannot land. The
    // rendered `disabled` is a hint; the reducer is the lock.
    await notebook
      .locator(`[data-activity-action="release"][data-finding="${RIGHT.requiresEvidence[0]}"]`)
      .dispatchEvent("click");
    await expect(page.locator(".activity-footer")).toContainText("Record stabilized");
    await expect(notebook.locator(".evidence-notebook__entry.is-kept")).toHaveCount(
      RIGHT.requiresEvidence.length
    );
  });

  // P8-1, the other half. Re-logging one leg wrong un-does the chain the conclusion rests on, which
  // reaches the same broken state by a control the player is even more likely to press — the ledger
  // is the thing they came back to re-read.
  test("stops its own board being taken apart", async ({ page }) => {
    await openFiledLedger(page);
    const first = LEDGER.legs[0];
    const wrong = LEDGER.effects.find((effect) => effect.id !== first.effect);

    await expect(page.locator(".activity-effect:not([disabled])")).toHaveCount(0);
    await expect(page.locator(".activity-support:not([disabled])")).toHaveCount(0);

    await page
      .locator(`.activity-leg`)
      .filter({ has: page.locator(`[data-leg="${first.id}"]`) })
      .locator(`[data-effect="${wrong.id}"]`)
      .first()
      .dispatchEvent("click");

    await expect(page.locator(".activity-footer")).toContainText("Record stabilized");
    await expect(page.locator(".activity-closer")).toHaveClass(/is-settled/);
  });

  // P8-2. A capacity turns the notebook from a review panel into a decision, and the screen that
  // concluded the mission never mentioned the decision again. The Codex's own block is headed the
  // same way — one concept, one name.
  test("shows what the conclusion was filed on, in the debrief", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "trace",
      activeActivitySourceId: "riverbend-ledger",
      sourceActivities: filedLedger({ debriefed: false }),
    });
    await loadSeededSave(page);
    await expect(page.locator(".mission-debrief")).toBeVisible();

    const kept = page.locator(".mission-debrief__kept");
    await expect(kept.locator("h2")).toHaveText("What you kept");
    await expect(kept.locator("li")).toHaveCount(RIGHT.requiresEvidence.length);
  });

  // P8-4. A filed mission whose debrief is still waiting opens on the debrief — correctly. What was
  // wrong is the tracker promising the Field Notebook and delivering something else, in the one
  // state a player reaches by leaving the debrief through its back-link.
  test("has the Mission Tracker name what is actually behind its button", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "field",
      activeActivitySourceId: "riverbend-ledger",
      sourceActivities: filedLedger({ debriefed: false }),
    });
    await loadSeededSave(page);

    const tracker = page.locator(".field-tracker__mission");
    await expect(tracker.locator(".field-tracker__progress")).toContainText(
      "the debrief is waiting"
    );
    await expect(tracker.locator(".field-tracker__open")).toHaveText("Open the debrief →");

    await tracker.locator(".field-tracker__open").click();
    await expect(page.locator(".mission-debrief")).toBeVisible();
  });

  // P8-3, routed in from Part 7 as P7-7. The mission's question printed on the way in and on the way
  // out and nowhere in between — not on the screen the player has open for the whole mission.
  test("keeps the mission's question on the board, not only at both ends", async ({ page }) => {
    await openFiledLedger(page);
    await expect(page.locator(".activity-copy__question")).toContainText(
      "where does it stop being able to tell you"
    );
  });
});
