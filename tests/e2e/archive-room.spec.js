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
    await expect(prompt).toContainText("Institute Foyer");

    // Walked rather than timed. The two fixed holds this replaced encoded the pre-Phase-58 furniture
    // layout ("north 1100ms, east 1350ms"), and the room's rebuild moved the Terminal from the
    // south-east records alcove to the north-east storage band.
    expect(await walkToHubTarget(page, "terminal")).toBe(true);
    await expect(prompt).toContainText("Archive Terminal");

    await page.keyboard.press("e");
    await expect(page.locator(".archive-challenges-shell")).toBeVisible();

    // The back-link deliberately does not reset currentHubRoom/position (main.js:6271-6274) —
    // it returns to whichever room the player was already standing in.
    await page.locator('[data-action="archive-room"]').click();
    await expect(page.locator("#archiveRoomMap")).toBeVisible();

    // Walk back to the doorway and leave.
    expect(await walkToHubTarget(page, "exitDoor")).toBe(true);
    await expect(prompt).toContainText("Institute Foyer");
    await page.keyboard.press("e");

    await expect(page.locator("#instituteMap")).toBeVisible();
    const stored = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem("republic-builder.chronicle.unit-01.v2") || "null")
    );
    expect(stored.currentHubRoom).toBe("main");
  });
});
