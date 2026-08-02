import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress, walkToNpc } from "./helpers/progress-seed.js";

// Records are attached to the person or the object that holds them (Phase 56), not floating on the
// grass. Two shapes, and this file covers both end to end:
//
//   NPC-anchored     no world marker at all. A ✦ badge rides on the carrier's own sprite, and the
//                    record is offered inside their speech bubble after they say their line.
//   object-anchored  a small ✦ marker on a real stamped prop, with the record's name appearing only
//                    once the player is close.
//
// Banked from a manual pass rather than left as one, per CLAUDE.md's verification ladder — the
// browser check that found the two defects this flow shipped with (`.field-npc em { display: none }`
// hiding every badge, and `fieldMovement` resuming at Unit 1's spawn on any map) is exactly the check
// that should not have to be re-derived by hand next time.

test.describe("Field source anchors", () => {
  test("Riverbend: every record rides on its carrier, and the carrier hands it over", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-004",
      unlocked: ["case-001", "case-004"],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // All three of this case's records are NPC-anchored, so the map carries badges and no world
    // markers whatsoever — but only two badges are lit on arrival. Since Phase 70 the servant's
    // letter carries `requiresSourceId: "riverbend-charter"`, because the DISCREPANCY it opens
    // builds its evidence column out of the charter interview's logged answers and would otherwise
    // open with nothing in it. A locked record shows no badge (fieldNpcButton reads the same
    // sourceAvailability() the world markers and the Mission Tracker do).
    await expect(page.locator(".npc-source-badge")).toHaveCount(2);
    await expect(page.locator(".source-signal--world")).toHaveCount(0);
    const carriers = await page.evaluate(() =>
      [...document.querySelectorAll(".npc-source-badge")]
        .map((el) => el.closest(".field-npc")?.dataset.npc)
        .sort()
    );
    expect(carriers).toEqual(["settlement-minister", "wharf-clerk"]);

    // Spawn is (26,18); the minister stands at (26,11.5) straight up the village spine.
    await walkToNpc(page, "settlement-minister");
    await expect(page.locator('[data-npc="settlement-minister"]')).toHaveClass(/is-near/);
    await page.keyboard.press("e");

    // He speaks first and offers the record second. Routing straight to the source on `E` would skip
    // the line, which is the whole reason the record is on a person at all.
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("read the charter");
    const offer = bubble.locator('[data-action="start-source-activity"]');
    await expect(offer).toContainText("Company charter");

    await offer.click();
    const stored = await readProgress(page);
    expect(stored.currentScreen).not.toBe("field");
  });

  test("Philadelphia: object-anchored records sit on props, keyed by data-source", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-007",
      unlocked: ["case-001", "case-007"],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // Six of this case's seven records are object-anchored; the seventh is John Dickinson, who was
    // actually in Philadelphia. See the long note on UNIT3_FIELD_SOURCE_POINTS for why the split
    // falls where it does.
    await expect(page.locator(".source-signal--world")).toHaveCount(6);
    await expect(
      page.locator('.field-npc[data-npc="john-dickinson"] .npc-source-badge')
    ).toHaveCount(1);

    // No positional `signal-N` classes any more: the proximity handle is the source id, which cannot
    // point at the wrong marker when a record is gated out of the render.
    const marked = await page.evaluate(() =>
      [...document.querySelectorAll(".source-signal--world")].map((el) => el.dataset.source).sort()
    );
    expect(marked).toContain("commoncause-henry-speech");
    expect(marked).not.toContain("commoncause-dickinson-letter");
    await expect(page.locator(".source-signal--world.signal-1")).toHaveCount(0);
  });

  test("a mid-field reload resumes on the right map's spawn, not Unit 1's", async ({ page }) => {
    // `fieldMovement` is ephemeral and its module-level default is Unit 1's spawn (28,22).
    // resetFieldPosition() ran on Chronotravel, recall and case reset but not on boot, so reloading
    // the page mid-investigation in Unit 2 or 3 resumed at another map's coordinates.
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-004",
      unlocked: ["case-001", "case-004"],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    const style = await page.locator("#caseFieldPlayer").evaluate((el) => ({
      left: el.style.left,
      top: el.style.top,
    }));
    // FIELD_MAPS["unit-02"].spawn is (26,18) at a 48px tile, positioned with no offset.
    expect(Number.parseFloat(style.left) / 48).toBeCloseTo(26, 1);
    expect(Number.parseFloat(style.top) / 48).toBeCloseTo(18, 1);
  });
});
