import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, walkToHubTarget } from "./helpers/progress-seed.js";

// Scenario 3: Archive Room entry/exit + Terminal proximity interaction.
//
// Seeding currentHubRoom: "archive" directly (rather than walking the Main Hall door) is
// deliberate: main.js's boot-time guard re-seeds the ephemeral instituteMovement variable to
// exitDoor.y - 0.6, i.e. (10.0, 9.5) — just inside the Archive Room doorway — whenever a save
// resumes with currentHubRoom === "archive" (mirrors what interactWithHubTarget() does
// mid-session). This gives a short, well-defined starting point to exercise the Terminal and
// exit door for real, without hand-walking the full Main Hall furniture layout first.
//
// The room is 20x12 and the Terminal is a genuine walk from the door: north up the runner, then east
// along the open cross-aisle to the writing desk at the room's east end.
test.describe("Archive Room", () => {
  test("Terminal is proximity-gated, interacting opens Archive Challenges, exit returns to Main Hall", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "archive",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const prompt = page.locator("#hubInteractPrompt");
    // Spawn (10.0, 9.5) is within reach (1.1) of exitDoor (10.0, 10.1) but 7.7 tiles from the
    // terminal (16.0, 4.0) — confirms the prompt is genuinely proximity-gated, not just always
    // showing the nearest target's label.
    await expect(prompt).toContainText("Main Hall");

    // Walked rather than timed. The two fixed holds this replaced encoded the pre-Phase-58 furniture
    // layout ("north 1100ms, east 1350ms"), and the room's rebuild moved the Terminal from the
    // south-east records alcove to the north-east storage band.
    expect(await walkToHubTarget(page, "terminal")).toBe(true);
    await expect(prompt).toContainText("Archive Terminal");

    await page.keyboard.press("e");
    await expect(page.locator(".archive-challenges-shell")).toBeVisible();

    // The back-link deliberately does not reset currentHubRoom/position (the "hub-return" branch in handleAppClick) —
    // it returns to whichever room the player was already standing in.
    await page.locator('[data-action="hub-return"]').click();
    await expect(page.locator("#archiveRoomMap")).toBeVisible();

    // Walk back to the doorway and leave.
    expect(await walkToHubTarget(page, "exitDoor")).toBe(true);
    await expect(prompt).toContainText("Main Hall");
    await page.keyboard.press("e");

    await expect(page.locator("#instituteMap")).toBeVisible();
    const stored = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem("republic-builder.chronicle.unit-01.v2") || "null")
    );
    expect(stored.currentHubRoom).toBe("main");
  });

  test("the Archive Room carries the same status column as the Main Hall", async ({ page }) => {
    // Phase 59. Two things at once: the room whose whole purpose is filing written work had no
    // readout of how much was filed, and its left column ran four lines against the Main Hall's
    // fifteen — enough of a page-height difference to toggle the scrollbar and slide the centred
    // layout sideways every time the player walked between the two rooms.
    await seedProgress(page, {
      currentScreen: "institute",
      currentHubRoom: "archive",
      selectedUnitId: "unit-01",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const panel = page.locator(".hub-sidepanel--left");
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Archive Challenges filed");
    await expect(panel).toContainText("evidence records secured");

    const archiveColumn = await page.locator(".hub-intro").boundingBox();
    const archiveMap = await page.locator(".institute-map").boundingBox();
    await page.evaluate(() => {
      const raw = window.localStorage.getItem("republic-builder.chronicle.unit-01.v2");
      const save = JSON.parse(raw);
      save.currentHubRoom = "main";
      window.localStorage.setItem("republic-builder.chronicle.unit-01.v2", JSON.stringify(save));
    });
    // Re-entered through the menu, not page.reload(): showMainMenu is a runtime-only variable, so a
    // bare reload lands on the landing screen rather than the seeded save.
    await loadSeededSave(page);
    await expect(page.locator("#instituteMap")).toBeVisible();
    const hallColumn = await page.locator(".hub-intro").boundingBox();
    const hallMap = await page.locator(".institute-map").boundingBox();

    // The reported symptom, asserted directly: the room changes, the furniture doesn't move.
    expect(archiveMap.x).toBeCloseTo(hallMap.x, 1);
    expect(archiveMap.width).toBeCloseTo(hallMap.width, 1);

    // And the cause. Not pixel-identical — the two rooms say different things — but close enough
    // that neither can add or remove a scrollbar the other doesn't have.
    expect(Math.abs(archiveColumn.height - hallColumn.height)).toBeLessThan(120);
  });
});
