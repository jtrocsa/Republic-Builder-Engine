// Emery Voss, in the six places she stands.
//
// The Field Liaison debuted in Phase 80 with no new engine system — a HUB_TARGETS entry, a
// behaviour, two FIELD_NPCS rows and one `progress.story` object. That is exactly why it needs a
// spec: every piece of it is an addition to a table something else already iterates, so nothing
// here would fail loudly if a later re-lay dropped one. The trust half in particular is invisible
// to a unit test — liaisonLine() is pure and covered there, but whether the Institute dialogue
// actually reads `progress.story.liaisonTrust` is a wiring question.

import { expect, test } from "@playwright/test";

import {
  loadSeededSave,
  seedProgress,
  walkToHubNpc,
  walkToHubTarget,
  walkToNpc,
} from "./helpers/progress-seed.js";

const NEW_LINE = "First run is the one people overthink";
const SEASONED_LINE = "I can stop handing you procedure";

async function enterMainHall(page, overrides = {}) {
  await seedProgress(page, {
    currentScreen: "institute",
    currentHubRoom: "main",
    tutorial: { step: "complete", completed: true, skipped: false },
    ...overrides,
  });
  await loadSeededSave(page);
  await expect(page.locator("#institutePlayer")).toBeVisible();
}

test.describe("the Field Liaison at the Institute", () => {
  test("stands in the Main Hall and speaks the untrusted line on a fresh save", async ({
    page,
  }) => {
    await enterMainHall(page);

    const voss = page.locator('[data-hub-npc="liaison"]');
    await expect(voss).toBeVisible();
    await expect(voss).toContainText("Emery Voss");

    expect(await walkToHubNpc(page, "liaison")).toBe(true);
    await page.keyboard.press("e");

    const dialogue = page.locator(".hub-dialogue");
    await expect(dialogue).toBeVisible();
    await expect(dialogue).toContainText("Emery Voss");
    await expect(dialogue).toContainText(NEW_LINE);
    // Voss is named and not captioned — the only HUB_TARGET with no `role`, so the kicker the other
    // three staff get is absent rather than empty. Asserted because an empty <p class="kicker">
    // renders as a blank line above the name and looks like a layout bug rather than a decision.
    await expect(dialogue.locator(".kicker")).toHaveCount(0);
    await expect(dialogue).not.toContainText("Field Liaison");
  });

  test("speaks a different line once the player has filed a few missions", async ({ page }) => {
    await enterMainHall(page, { story: { liaisonTrust: 3, flags: {} } });

    expect(await walkToHubNpc(page, "liaison")).toBe(true);
    await page.keyboard.press("e");

    const dialogue = page.locator(".hub-dialogue");
    await expect(dialogue).toBeVisible();
    await expect(dialogue).toContainText(SEASONED_LINE);
    await expect(dialogue).not.toContainText(NEW_LINE);
  });

  // Voss stands in the north cross-aisle at (14.5,4.5), two and a half tiles east of the cols 11-12
  // lane. A station is a solid body to the player and is injected into the hub nav grid as occupied,
  // so the browser question is whether the room still works around her.
  test("leaves the Archive Room approach open from beside Voss", async ({ page }) => {
    await enterMainHall(page);

    expect(await walkToHubNpc(page, "liaison")).toBe(true);
    expect(await walkToHubTarget(page, "archiveDoor")).toBe(true);
  });

  // From the foyer, not from Voss. The route from the cross-aisle to the dais has to go back west
  // to the cols 9-12 lane, south, then east — two turns around the Navigation Table's own footprint,
  // which is more than the walk helper's slide heuristic is (or should be) able to do. The claim
  // worth making is that the table is still reachable at all with a fourth body in the room.
  test("leaves the Navigation Table reachable", async ({ page }) => {
    await enterMainHall(page);

    expect(await walkToHubTarget(page, "table")).toBe(true);
  });
});

test.describe("the Field Liaison in the field", () => {
  test("meets the Chronicler on the Caribbean shore", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      unlockedCaseIds: ["case-001"],
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    const voss = page.locator('[data-npc="liaison"]');
    await expect(voss).toBeVisible();

    expect(await walkToNpc(page, "liaison")).toBe(true);
    await page.keyboard.press("e");

    await expect(page.locator(".field-speech-bubble")).toContainText("Walk it before you write it");
  });

  test("is posted at Riverbend too", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-004",
      unlockedCaseIds: ["case-001", "case-004"],
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    await expect(page.locator('[data-npc="liaison"]')).toBeVisible();
  });

  // Phase 81E's three posts, and the browser half of what the coordinate test cannot see. A station
  // is a solid body to the player and goes into the nav grid as `occupied`, so the two questions a
  // spec can answer are whether she is walkable-to from the spawn and whether the map's own
  // signature motion still runs around her. `walkToNpc` answers the first by construction — it
  // walks until the game's own `.is-near` appears, so a post sealed behind a building fails here.
  const LATER_MAPS = [
    { unit: "Philadelphia", caseId: "case-007", says: "I came through ahead of the assignment" },
    { unit: "Canal Crossroads", caseId: "case-010", says: "Two rules on a towpath" },
    { unit: "Richmond", caseId: "case-013", says: "anchor glass out there that is not ours" },
    // Cottonwood Junction, added in Phase 88 — this file's own header has claimed six posts since
    // Unit 6's map shipped and covered five. The line asserted is the *pre-reveal* one: Voss
    // reports the woman in the good coat as a fact she cannot place, which is what the reveal is
    // written against. Her second line on this map is meridian-reveal.spec.js's.
    { unit: "Cottonwood Junction", caseId: "case-016", says: "somebody was here ahead of us" },
  ];

  for (const { unit, caseId, says } of LATER_MAPS) {
    test(`stands where the Chronicler can reach her at ${unit}`, async ({ page }) => {
      test.setTimeout(60_000);
      await seedProgress(page, {
        currentScreen: "field",
        activeCaseId: caseId,
        unlocked: ["case-001", caseId],
        tutorial: { step: "complete", completed: true, skipped: false },
      });
      await loadSeededSave(page);
      await expect(page.locator("#caseFieldPlayer")).toBeVisible();

      const voss = page.locator('[data-npc="liaison"]');
      await expect(voss).toBeVisible();
      // The name, not the job — the pill is the one surface where getting this wrong is invisible
      // to every other assertion in this file.
      await expect(voss).toContainText("Emery Voss");
      await expect(voss).not.toContainText("Liaison");

      expect(await walkToNpc(page, "liaison"), "Voss is unreachable from the spawn").toBe(true);
      await page.keyboard.press("e");
      await expect(page.locator(".field-speech-bubble")).toContainText(says);
    });
  }
});
