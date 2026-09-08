import { test, expect } from "@playwright/test";
import { openSeededSave } from "./helpers/progress-seed.js";
import { UNIT_01_ACTIVITIES } from "../../apps/web/src/content/activities/unit-01-activities.js";
import { UNIT_02_ACTIVITIES } from "../../apps/web/src/content/activities/unit-02-activities.js";
import { UNIT_03_ACTIVITIES } from "../../apps/web/src/content/activities/unit-03-activities.js";
import { UNIT_04_ACTIVITIES } from "../../apps/web/src/content/activities/unit-04-activities.js";
import { UNIT_05_ACTIVITIES } from "../../apps/web/src/content/activities/unit-05-activities.js";
import { UNIT_06_ACTIVITIES } from "../../apps/web/src/content/activities/unit-06-activities.js";
import { UNIT_07_ACTIVITIES } from "../../apps/web/src/content/activities/unit-07-activities.js";
import { UNIT_08_ACTIVITIES } from "../../apps/web/src/content/activities/unit-08-activities.js";

// **Where a control sits does not depend on how long an author wrote.**
//
// Phase 117 wrote that rule for the Navigation Table and gave it one guard, on that one screen.
// Phase 121 found the same defect twice more, on the two screens a student spends the most time on,
// and this is the guard for both. See decision log `0120`.
//
// The rule is not "nothing below the fold" — a long record, a long quiz and a long board all scroll
// on purpose, and the survey behind this phase measured and accepted every one of them. It is that
// **the map, the status line and the button that starts the mission** may not be pushed under prose
// whose length is an authoring decision.
//
// Both viewports, because both are sizes a student actually gets: `playwright.config.js` sets none
// at all, so the suite default is 1280x720, while the 54 viewport baselines are recorded at the
// project's named Chromebook target of 1366x768. Only `archive-navigation.spec.js` tested both
// before this file.
//
// **And every unit, not a chosen one.** P5-5 was closed twice against the one state that could not
// show it, and `0114` §6 names that as the recurring mistake: a guard that picks its own example
// picks the flattering one. The field cases here are all eight. The missions are one per unit and
// **the choice is computed, not written down** — see the note above `WORST_PER_UNIT` — so the
// example is always the worst one the content currently holds rather than the one somebody picked.

const FIELD_CASES = [
  ["unit-01 Caribbean", "case-001"],
  ["unit-02 Riverbend", "case-004"],
  ["unit-03 Philadelphia", "case-007"],
  ["unit-04 Canal Crossroads", "case-010"],
  ["unit-05 Richmond", "case-013"],
  ["unit-06 Railhead", "case-016"],
  ["unit-07 Ellis Island", "case-019"],
  ["unit-08 Fairmeadow", "case-022"],
];

const MISSIONS = [
  UNIT_01_ACTIVITIES,
  UNIT_02_ACTIVITIES,
  UNIT_03_ACTIVITIES,
  UNIT_04_ACTIVITIES,
  UNIT_05_ACTIVITIES,
  UNIT_06_ACTIVITIES,
  UNIT_07_ACTIVITIES,
  UNIT_08_ACTIVITIES,
].flatMap((table, unit) =>
  Object.entries(table).map(([sourceId, activity]) => ({
    caseId: FIELD_CASES[unit][1],
    unit: FIELD_CASES[unit][0],
    sourceId,
    kind: activity.kind,
    // The exact string the plate renders — see the note above WORST_PER_UNIT.
    line: (activity.briefing?.line || "").length,
  }))
);

const SIZES = [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
];

const seedFor = (caseId, extra = {}) => ({
  currentScreen: "field",
  activeCaseId: caseId,
  selectedCaseId: caseId,
  unlocked: ["case-001", caseId],
  tutorial: { step: "complete", completed: true, skipped: false },
  ...extra,
});

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size });

    // The playing surface itself. `.case-field--living` was `align-items: center`, so the middle
    // column was centred against a row as tall as the left one — and the left one ends in
    // `copy.intro`, authored per unit. Measured before the fix at 1280x720, with the frame 517px
    // tall: Unit 1's top edge at 131 and all 517 visible, Unit 7's at 437 with **283** visible.
    // A 306px slide, and a map 45% below the fold on the unit with the most to walk.
    test("the field's map frame opens in the same place on every unit, whole", async ({ page }) => {
      test.setTimeout(120_000);
      const tops = new Map();
      for (const [label, caseId] of FIELD_CASES) {
        await openSeededSave(page, seedFor(caseId));
        await expect(page.locator("#caseFieldPlayer")).toBeVisible();
        // From the top of the document, or a rect read after any scroll is a rect read against the
        // wrong origin — the state in which this defect looks like a pass (Phase 117).
        await page.evaluate(() => window.scrollTo(0, 0));
        const frame = await page.locator(".field-viewport").evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { top: Math.round(r.top), bottom: Math.round(r.bottom) };
        });
        tops.set(label, frame.top);
        expect(
          frame.bottom,
          `${label}: the whole map frame has to be on screen, not the top of it`
        ).toBeLessThanOrEqual(size.height);
      }
      // One value, the way Phase 117's period strip takes one value across all eight units.
      expect(
        new Set(tops.values()).size,
        `the frame's top edge moves between units: ${JSON.stringify([...tops])}`
      ).toBe(1);
    });

    // The field's status line is the game's only answer to a refused interaction — "Move closer to
    // interact with X." It was the last child of the same authored column, so it landed **648px
    // below the fold on Ellis Island**, 555 on Fairmeadow and 445 on Richmond: a student clicked a
    // person, nothing appeared to happen, and the explanation was half a screen down.
    test("the field's status line is on screen when the game writes one", async ({ page }) => {
      test.setTimeout(120_000);
      for (const [label, caseId] of FIELD_CASES) {
        await openSeededSave(page, seedFor(caseId));
        await expect(page.locator("#caseFieldPlayer")).toBeVisible();
        // Provoke it the way a player does: click somebody out of reach. Interaction is
        // proximity-gated, so this refuses and writes the line rather than opening anybody.
        await page.locator("[data-npc]").last().dispatchEvent("click");
        await expect(page.locator("#fieldNotice")).toContainText("Move closer");
        await page.evaluate(() => window.scrollTo(0, 0));
        const bottom = await page
          .locator("#fieldNotice")
          .evaluate((el) => Math.round(el.getBoundingClientRect().bottom));
        expect(
          bottom,
          `${label}: the line the game just wrote is ${bottom - size.height}px below the fold`
        ).toBeLessThanOrEqual(size.height);
      }
    });
  });
}

// Mission Instructions. `0054` put this button in the giver's column *because* the instructions
// column runs past the fold — and then the giver's own line grew there instead, from nothing at all
// on Case 1.01 to 683 characters at Ellis Island. It was under the fold on Units 6 and 7 at both
// sizes, by up to 195px, and cleared it by 12px on Unit 5.
//
// **The worst mission in each unit, chosen by measurement rather than listed, at the binding size.**
//
// Each mission costs a full boot — `showMainMenu` is runtime state, so even a seeded save walks the
// title and two clicks — so all twenty-four at both sizes is about eight minutes of suite. Two cuts,
// and neither is a hand-picked example.
//
// **One size**, because it is the only one that binds. The button's distance from the top of the
// document measured **identical at 1280 and 1366** on every mission sampled (411px on five of six,
// 429 on the other, at both widths): nothing above it wraps differently between those two widths, so
// only the viewport height differs and 720 is the smaller. Walking 1366 as well tests a weaker claim.
//
// **The longest `briefing.line` per unit**, because on this screen that string is not a proxy for
// the quote — it *is* the quote. `missionInstructionsScreen()` calls `missionGiver()` with no
// overrides, and that returns `line: activity.briefing.line` when the briefing names a speaker and
// no line at all otherwise. So this walks the tallest plate each unit currently has, and a mission
// authored longer tomorrow becomes the one walked the day it ships, with nothing to update here.
const WORST_PER_UNIT = MISSIONS.reduce((worst, mission) => {
  const held = worst.get(mission.unit);
  if (!held || mission.line > held.line) worst.set(mission.unit, mission);
  return worst;
}, new Map());

test.describe("1280x720", () => {
  test.use({ viewport: { width: 1280, height: 720 } });
  test("the button that starts a mission is on screen, on the longest of each unit", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    expect(WORST_PER_UNIT.size, "one mission from every unit with a map").toBe(8);
    for (const { caseId, sourceId, kind } of WORST_PER_UNIT.values()) {
      await openSeededSave(
        page,
        seedFor(caseId, { currentScreen: kind, activeActivitySourceId: sourceId })
      );
      const begin = page.locator(".mission-brief__begin");
      await expect(begin).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      const bottom = await begin.evaluate((el) => Math.round(el.getBoundingClientRect().bottom));
      expect(
        bottom,
        `${sourceId}: "Begin the mission" is ${bottom - 720}px below the fold`
      ).toBeLessThanOrEqual(720);
    }
  });
});

// **And a screen the player cannot scroll past has to fit.**
//
// The two tables above are the field cases and their missions, which is the ground Phase 121
// measured. Everything else a student opens was uncovered, and one screen in it was wrong: the
// **identity screen** — the second screen of the game, where a new player picks an appearance and
// names their Chronicler — put both of its controls **31px below the fold at 1280x720**, including
// "Confirm identity →", the button that starts the game. It had been 69px under until Phase 126
// took the empty feedback bar out from between the help text and the buttons.
//
// It was the only one. The survey behind this table swept every other student screen at both
// sizes, and unit completion, the transmission, the Chronotravel plate, the Archive Challenges list
// and the Codex across all eight units — ninety-six screen states — and found nothing else. So this
// is a guard rather than a finding, and its job is to stay green. See decision log `0126`.
//
// **The rule is Phase 121's, unchanged: prose scrolls, controls do not.** It is not "the page
// fits". The Codex is 838px tall at 1280x720 and passes, because a record is prose and its one
// control is at the top. What is excluded is excluded because its *content* is unbounded, and each
// exclusion was measured rather than assumed:
//
//   - the Practice Check (4,159px), the Archive Review (2,824-3,275px) and every activity board —
//     a long quiz, a long essay and a long board all scroll on purpose, and the closer at the foot
//     of a board is the whole subject of `arrival-scroll.spec.js`;
//   - the Mission Debrief and the record reader, which are things to read;
//   - the **Archive Rotation**, whose card is one practice item of whatever height that item has.
//     Measured at 1280x720 on Case 1.01: "Next →" is **17px** under on each of the three MCQs,
//     **115px** under on the sequencing item and **610px** under on the HIPP — and it moves further
//     down when you answer, because the feedback line appears above it. No arrangement of that
//     screen's own copy puts a four-textarea HIPP's button above the fold, so the rotation is
//     recorded in `0126` §5 and deliberately not chased here.
//
// **`travel` and `return-warp` are excluded for the opposite reason**: the warp screen is
// full-bleed and its controls are positioned against the bottom of the viewport, so they cannot go
// under the fold by construction. A row for them would be a test that cannot fail.

const FIXED_SCREENS = [
  ["the identity screen", { currentScreen: "identity" }],
  ["intro · welcome", { currentScreen: "intro-welcome" }],
  ["intro · briefing", { currentScreen: "intro-briefing" }],
  ["intro · protocol", { currentScreen: "intro-protocol" }],
  ["intro · registration", { currentScreen: "intro-registration" }],
  ["the Codex", { currentScreen: "codex" }],
  ["the mini-games shelf", { currentScreen: "mini-games" }],
  ["the Skill Mastery record", { currentScreen: "mastery" }],
  ["the Archive Challenges list", { currentScreen: "archive-challenges" }],
];

// The two screens whose copy is authored per unit, so the thing Phase 117 named — a control's
// position depending on how long somebody wrote — is live on them. **One size**, for the reason
// the mission block above gives: only the height binds, and 720 is the smaller of the two.
const PER_UNIT_SCREENS = [
  [
    "unit completion",
    (unit, caseId) => ({
      currentScreen: "completion",
      selectedUnitId: unit,
      activeCaseId: caseId,
      selectedCaseId: caseId,
    }),
  ],
  [
    "the transmission",
    (unit, caseId) => ({
      currentScreen: "upload",
      pendingUploadCaseId: caseId,
      activeCaseId: caseId,
      selectedCaseId: caseId,
    }),
  ],
];

// Same order as FIELD_CASES, which is unit order — the completion screen is keyed by unit and
// the transmission by case, and both are needed to seed one row.
const UNIT_IDS = [
  "unit-01",
  "unit-02",
  "unit-03",
  "unit-04",
  "unit-05",
  "unit-06",
  "unit-07",
  "unit-08",
];

/**
 * Every control on the page that is under the fold, and how many there were to begin with.
 *
 * The count is the anti-vacuity half, and it is not decoration: "no control is below the fold" is
 * satisfied perfectly by a screen with no controls, and a seed that misses lands on this app's own
 * `.empty-state` recovery markup — a back link and a sentence. The lesson is fresh here: every loop
 * in this file spent six phases measuring case-001 eight times, and passed every run.
 */
async function controlsBelowFold(page, height) {
  await page.evaluate(() => window.scrollTo(0, 0));
  const under = await page.evaluate(
    (fold) =>
      [...document.querySelectorAll("main button, main a[href]")]
        .filter((el) => {
          const style = window.getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden") return false;
          return el.getBoundingClientRect().height > 4;
        })
        .map((el) => ({
          label: (el.textContent || el.getAttribute("aria-label") || "")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 40),
          under: Math.round(el.getBoundingClientRect().bottom - fold),
        }))
        .filter((row) => row.under > 0),
    height
  );
  return {
    under,
    total: await page.locator("main button, main a[href]").count(),
    recovered: await page.locator("main .empty-state").count(),
  };
}

for (const size of SIZES) {
  test.describe(`${size.width}x${size.height}`, () => {
    test.use({ viewport: size });

    test("every control on a screen with fixed content is on it", async ({ page }) => {
      test.setTimeout(180_000);
      for (const [label, seed] of FIXED_SCREENS) {
        await openSeededSave(page, seedFor("case-001", seed));
        await expect(page.locator("main")).toBeVisible();
        const { under, total, recovered } = await controlsBelowFold(page, size.height);
        expect(recovered, `${label} is the screen it seeded, not the empty state`).toBe(0);
        expect(total, `${label} rendered controls to measure`).toBeGreaterThan(0);
        expect(
          under,
          `${label}: ${under.map((row) => `"${row.label}" is ${row.under}px below the fold`).join("; ")}`
        ).toEqual([]);
      }
    });
  });
}

test.describe("1280x720", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  // One test per screen rather than one for both: eight boots is about eighty seconds here and
  // sixteen does not fit a single test's budget, which is the honest reason and not a taxonomy.
  for (const [label, build] of PER_UNIT_SCREENS) {
    test(`${label}: every control is on screen on all eight units`, async ({ page }) => {
      test.setTimeout(180_000);
      for (const [index, [unitLabel, caseId]] of FIELD_CASES.entries()) {
        await openSeededSave(page, seedFor(caseId, build(UNIT_IDS[index], caseId)));
        await expect(page.locator("main")).toBeVisible();
        const { under, total, recovered } = await controlsBelowFold(page, 720);
        expect(recovered, `${label}, ${unitLabel}: seeded the empty state`).toBe(0);
        expect(total, `${label}, ${unitLabel}: rendered controls to measure`).toBeGreaterThan(0);
        expect(
          under,
          `${label}, ${unitLabel}: ${under.map((row) => `"${row.label}" is ${row.under}px below the fold`).join("; ")}`
        ).toEqual([]);
      }
    });
  }
});
