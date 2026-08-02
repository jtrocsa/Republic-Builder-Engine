// Riverbend's three missions (content/activities/unit-02-activities.js), and the two pieces of
// wiring they are the first users of.
//
// activity-engines.spec.js already banks the engine-host contract on Case 1.01 — chips in the
// dialogue bubble, log-versus-hear, resume-after-reload, the token-gated evidence column. This file
// covers only what Unit 2 adds:
//
//   1. TRACE has never had content anywhere until now, so nothing has ever exercised its ledger,
//      its per-leg lock, or the `why` that only appears on a correct entry.
//   2. `requiresSourceId` replaced sourceAvailability()'s `caseId === "case-001"` literal, and
//      Riverbend is the second consumer. The unit test pins the function; this pins the world it
//      produces — a badge that is not lit, and a person who cannot hand over what they carry.
//   3. The INTERVIEW's bar is eight, and the Mission Tracker has to say so on a second map.
import { expect, test } from "@playwright/test";
import {
  briefed,
  loadSeededSave,
  readProgress,
  seedProgress,
  walkToNpc,
} from "./helpers/progress-seed.js";

const CASE_004 = {
  activeCaseId: "case-004",
  selectedCaseId: "case-004",
  unlocked: ["case-001", "case-004"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

// The charter interview after three of the eight accounts have been written down.
const LOGGED_THREE = {
  "riverbend-charter": {
    state: {
      asked: {
        "settlement-minister": ["land"],
        "indentured-servant": ["owed"],
        "angolan-laborer": ["owed"],
      },
      logged: {
        "settlement-minister": ["land"],
        "indentured-servant": ["owed"],
        "angolan-laborer": ["owed"],
      },
      filed: null,
    },
    completed: false,
    briefed: true,
  },
};

// The four legs of the wharf account, in order, with the answer each one grades against.
const LEGS = [
  ["curing", "not-established"],
  ["entering", "crown-revenue"],
  ["crossing", "planter-credit"],
  ["returning", "merchant-control"],
];

test.describe("TRACE, on its first mission", () => {
  test("logs a chain leg by leg, and pays out only on the right entry", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "trace",
      activeActivitySourceId: "riverbend-ledger",
      sourceActivities: briefed("riverbend-ledger"),
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--trace")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("One Hogshead");
    await expect(page.locator(".activity-subject")).toContainText("fourteen hogsheads");
    await expect(page.locator(".activity-leg")).toHaveCount(4);

    // The closer is shut until every leg is logged correctly — including the one the record cannot
    // establish, which is the leg most likely to be left blank.
    await expect(page.locator(".activity-closer")).toHaveClass(/is-locked/);
    await expect(page.locator(".activity-option").first()).toBeDisabled();

    // The first leg is the mission. `labor-cost` is true of the world and unsupported by this
    // record, and it is offered on every leg precisely so it can be turned down here.
    const first = page.locator(".activity-leg").first();
    await first.locator('[data-effect="labor-cost"]').click();
    await expect(first.locator('[data-effect="labor-cost"]')).toHaveClass(/is-wrong/);
    await expect(first.locator(".activity-why")).toHaveCount(0);

    await first.locator('[data-effect="not-established"]').click();
    await expect(first).toHaveClass(/is-logged/);
    await expect(first.locator(".activity-why")).toContainText("begins where the labor ends");

    for (const [leg, effect] of LEGS.slice(1)) {
      await page.locator(`[data-leg="${leg}"][data-effect="${effect}"]`).click();
    }

    await expect(page.locator(".activity-closer")).not.toHaveClass(/is-locked/);
    const stored = await readProgress(page);
    expect(stored.sourceActivities["riverbend-ledger"].state.ledger).toEqual(
      Object.fromEntries(LEGS)
    );
  });

  test("the tracker names a trace but reports no ratio for it", async ({ page }) => {
    // TRACE deliberately does not implement the registry's optional `summary` slot — a chain is not
    // a count — so the Mission Tracker shows the mission's name and its notebook button and no
    // progress line. Regression guard on activitySummary() returning null rather than throwing.
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "field",
      sourceActivities: {
        "riverbend-ledger": {
          state: { ledger: { curing: "not-established" } },
          completed: false,
          briefed: true,
        },
      },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    const tracker = page.locator(".field-tracker");
    await expect(tracker).toContainText("Mission Tracker");
    // The mission's name is on its own record row now, not in a heading below it — Phase 71 merged
    // the tracker's two blocks after the panel was found printing the same name twice.
    await expect(tracker.locator(".field-tracker__row.is-tracked")).toHaveText("✦One Hogshead");
    // And a TRACE reports no ratio, because a chain is not a count: no progress line, and therefore
    // no bar either.
    await expect(tracker.locator(".field-tracker__progress")).toHaveCount(0);
    await expect(tracker.locator(".field-tracker__bar")).toHaveCount(0);

    await tracker.locator('[data-action="open-activity-notebook"]').click();
    await expect(page.locator(".activity-board--trace")).toBeVisible();
    expect((await readProgress(page)).currentScreen).toBe("trace");
  });
});

test.describe("Riverbend's one gate", () => {
  // Read through the Mission Tracker rather than by walking to the servant. He works the east plot,
  // and the only way into it is east along the high street, around the barn at (37-40, 16-19), then
  // north between the farm stores and the row-14 fence — a path walkTo()'s slide heuristic does not
  // find, and the assertion here is about availability, not about pathfinding. The tracker and the
  // world markers read the same sourceAvailability(), which is the whole reason that function was
  // pulled out of fieldSourceSignal() in Phase 56.
  test("the letter stays locked until the charter is secured", async ({ page }) => {
    await seedProgress(page, { ...CASE_004, currentScreen: "field" });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // Unlike Case 1.01, Riverbend gates only the record that needs the evidence: two of three open.
    await expect(page.locator(".field-tracker__row")).toHaveCount(3);
    await expect(page.locator(".field-tracker__row.is-available")).toHaveCount(2);
    const locked = page.locator(".field-tracker__row.is-locked");
    await expect(locked).toHaveCount(1);
    // A locked row is deliberately anonymous — "· Not yet available" and no destination, because
    // naming where a record is would defeat the ordering the gate exists to impose.
    await expect(locked).toHaveText("·Not yet available");
    // The two open rows name the person carrying the record, since all three of Riverbend's are
    // NPC-anchored and a name is what the player can spot across the map.
    await expect(page.locator(".field-tracker__row")).toContainText([
      "Settlement minister",
      "Not yet available",
      "Wharf clerk",
    ]);
    // And nobody is carrying a badge for it.
    await expect(page.locator(".npc-source-badge")).toHaveCount(2);
  });

  test("securing the charter lights the letter up", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "field",
      caseEvidence: { "case-004": ["riverbend-charter"] },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    await expect(page.locator(".field-tracker__row.is-locked")).toHaveCount(0);
    await expect(page.locator(".field-tracker__row.is-secured")).toHaveCount(1);
    await expect(page.locator(".npc-source-badge")).toHaveCount(3);
  });

  test("the audit itself leads with the letter", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "discrepancy",
      activeActivitySourceId: "riverbend-letter",
      caseEvidence: { "case-004": ["riverbend-charter"] },
      sourceActivities: briefed("riverbend-letter"),
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--discrepancy")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("Nothing to be Gotten");
    // Who is writing, to whom and why; then the passage the claims are lifted from; then the
    // standing instruction. Decision log 0052 §8, on a second record.
    await expect(page.locator(".activity-record-context")).toContainText("redeem him");
    await expect(page.locator(".activity-transcript")).toContainText("loblollie");
    await expect(page.locator(".activity-verdict-prompt")).toContainText("gathered at Riverbend");

    // The gap kinds are Riverbend's own, not the Columbus audit's error/design — a truthful witness
    // to one position is the finding this mission exists to make available.
    const claim = page.locator(".activity-claim").filter({ hasText: "nothing to be gotten here" });
    await claim.locator('[data-verdict="contradicted"]').click();
    await expect(claim.locator('[data-gap="not-one-place"]')).toBeVisible();
    await claim.locator('[data-gap="not-one-place"]').click();
    await expect(claim).toHaveClass(/is-settled/);
    await expect(claim.locator(".activity-why")).toContainText("except that one had money");
  });
});

test.describe("INTERVIEW, at Riverbend", () => {
  test("puts the charter's questions to the people standing on the land", async ({ page }) => {
    test.setTimeout(90_000);
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "field",
      sourceActivities: LOGGED_THREE,
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // Three of eight, in one number — the Phase 69 rule, on a second map.
    await expect(page.locator(".field-tracker__progress")).toContainText("Accounts secured");
    await expect(page.locator(".field-tracker__progress b")).toHaveText("3/8");

    expect(await walkToNpc(page, "settlement-burgess")).toBe(true);
    await page.locator('[data-npc="settlement-burgess"]').click();

    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await expect(bubble.locator(".field-interview__q")).toHaveCount(4);

    await bubble.locator('[data-question="voice"]').click();
    await expect(bubble.locator(".field-interview__answer")).toContainText("eleven other men");
    await expect(bubble.locator(".field-interview__answer")).toHaveClass(/is-useful/);

    await bubble.locator(".field-interview__log").click();
    await expect(bubble.locator(".field-interview__logged")).toContainText("In your notebook");
    await expect(page.locator(".field-tracker__progress b")).toHaveText("4/8");
  });

  test("the audit's evidence column holds only what this player logged", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_004,
      currentScreen: "discrepancy",
      activeActivitySourceId: "riverbend-letter",
      caseEvidence: { "case-004": ["riverbend-charter"] },
      sourceActivities: { ...LOGGED_THREE, ...briefed("riverbend-letter") },
    });
    await loadSeededSave(page);

    const observed = page.locator(".activity-observations");
    await expect(observed).toContainText("Fifty acres to every person transported");
    await expect(observed).toContainText("Nobody has given this man a number");
    // Never asked the Powhatan woman who speaks, so that line of the audit is a hole.
    await expect(observed).not.toContainText("decided it could be spared");
    await expect(observed.locator(".activity-observation.is-missing").first()).toContainText(
      "You did not gather this."
    );
    // The one with no `requires` is always there, and the heading counts what is in hand.
    await expect(observed).toContainText("Everything at Riverbend moves by water");
    await expect(page.locator(".activity-audit__observed h3")).toContainText("4 of 12");
  });
});
