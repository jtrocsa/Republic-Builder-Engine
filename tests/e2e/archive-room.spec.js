import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, holdKey } from "./helpers/progress-seed.js";

// Scenario 3: Archive Room entry/exit + Terminal proximity interaction.
//
// Seeding currentHubRoom: "archive" directly (rather than walking the Main Hall door) is
// deliberate: main.js's boot-time guard re-seeds the ephemeral instituteMovement variable to
// (5.0, 6.1) facing up — just inside the Archive Room doorway — whenever a save resumes with
// currentHubRoom === "archive" (mirrors what interactWithHubTarget() does mid-session). This
// gives a short, well-defined starting point to exercise the Terminal and exit door for real,
// without hand-walking the full Main Hall furniture layout first.
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
    // Spawn (5.0, 6.1) is within reach (1.1) of exitDoor (5.0, 6.7) but not of terminal
    // (5.0, 3.7, distance 2.4) — confirms the prompt is genuinely proximity-gated, not just
    // always showing the nearest target's label.
    await expect(prompt).toContainText("Institute Foyer");

    // Walk up from y=6.1 toward the Terminal at (5.0, 3.7).
    await holdKey(page, "ArrowUp", 1400);
    await expect(prompt).toContainText("Archive Terminal");

    await page.keyboard.press("e");
    await expect(page.locator(".archive-challenges-shell")).toBeVisible();

    // The back-link deliberately does not reset currentHubRoom/position (main.js:6271-6274) —
    // it returns to whichever room the player was already standing in.
    await page.locator('[data-action="archive-room"]').click();
    await expect(page.locator("#archiveRoomMap")).toBeVisible();

    // Walk back down to the exit door and leave.
    await holdKey(page, "ArrowDown", 1400);
    await expect(prompt).toContainText("Institute Foyer");
    await page.keyboard.press("e");

    await expect(page.locator("#instituteMap")).toBeVisible();
    const stored = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem("republic-builder.chronicle.unit-01.v2") || "null")
    );
    expect(stored.currentHubRoom).toBe("main");
  });
});
