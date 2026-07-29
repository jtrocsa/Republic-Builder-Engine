import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, holdKey } from "./helpers/progress-seed.js";

// Scenario 3: Archive Room entry/exit + Terminal proximity interaction.
//
// Seeding currentHubRoom: "archive" directly (rather than walking the Main Hall door) is
// deliberate: main.js's boot-time guard re-seeds the ephemeral instituteMovement variable to
// exitDoor.y - 0.6, i.e. (10.0, 9.6) — just inside the Archive Room doorway — whenever a save
// resumes with currentHubRoom === "archive" (mirrors what interactWithHubTarget() does
// mid-session). This gives a short, well-defined starting point to exercise the Terminal and
// exit door for real, without hand-walking the full Main Hall furniture layout first.
//
// The room is 20x12 and scrolls under the hub camera, so the Terminal is a genuine walk from
// the door rather than two steps: north up the open floor, then east into the records alcove.
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
    // Spawn (10.0, 9.6) is within reach (1.1) of exitDoor (10.0, 10.2) but 6.6 tiles from the
    // terminal (15.5, 6.0) — confirms the prompt is genuinely proximity-gated, not just always
    // showing the nearest target's label.
    await expect(prompt).toContainText("Institute Foyer");

    // Walk north up the hall, then east into the alcove toward the Terminal. Going east first
    // would clip the south chest run (14.0-20.0, 10.2-12.0).
    await holdKey(page, "ArrowUp", 1100);
    await holdKey(page, "ArrowRight", 1350);
    await expect(prompt).toContainText("Archive Terminal");

    await page.keyboard.press("e");
    await expect(page.locator(".archive-challenges-shell")).toBeVisible();

    // The back-link deliberately does not reset currentHubRoom/position (main.js:6271-6274) —
    // it returns to whichever room the player was already standing in.
    await page.locator('[data-action="archive-room"]').click();
    await expect(page.locator("#archiveRoomMap")).toBeVisible();

    // Walk back west and down to the exit door and leave.
    await holdKey(page, "ArrowLeft", 1350);
    await holdKey(page, "ArrowDown", 1100);
    await expect(prompt).toContainText("Institute Foyer");
    await page.keyboard.press("e");

    await expect(page.locator("#instituteMap")).toBeVisible();
    const stored = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem("republic-builder.chronicle.unit-01.v2") || "null")
    );
    expect(stored.currentHubRoom).toBe("main");
  });
});
