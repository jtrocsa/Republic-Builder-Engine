import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress } from "./helpers/progress-seed.js";

// The field's Records to Recover checklist (Phase 57). Before it, the only progress signal in the
// field was the number on the "Open Codex" button, so "how many records are there, which have I got,
// and where is the next one" was answerable only by walking the whole map.
//
// Three states per row, and the point of each is that it is readable without reading the words:
// gold + pulsing ✦ = go here, struck-through green ✓ = secured, grey · = not yet available.

test.describe("Field objective tracker", () => {
  test("lists every record with its destination, and counts what is secured", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-007",
      unlocked: ["case-001", "case-007"],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const tracker = page.locator(".field-tracker");
    await expect(tracker).toBeVisible();
    await expect(tracker.locator(".field-tracker__toggle em")).toHaveText("0/7");
    await expect(tracker.locator(".field-tracker__row")).toHaveCount(7);

    // Rows name *where to go*, not the source's historical title — the thing the player can spot
    // across the map. One of Unit 3's records is carried by a person, so its row is his name.
    await expect(tracker).toContainText("John Dickinson");
    await expect(tracker).toContainText("Statehouse petition table");

    // Pinned to the viewport frame, not inside the translated world div: it must not scroll with the
    // camera. Asserted structurally because a camera-following panel is the exact regression this
    // placement avoids.
    await expect(page.locator("#caribbeanWorld .field-tracker")).toHaveCount(0);
    await expect(page.locator("#caseFieldMap > .field-tracker")).toHaveCount(1);
  });

  test("strikes through a secured record and greys out one that is still locked", async ({
    page,
  }) => {
    // Case 1.01 is the one case with a within-case order: nothing but the village observation is
    // reachable until the village has been observed. That gate lives in the exported
    // sourceAvailability(), which the world markers read too, so the two cannot disagree.
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const rows = page.locator(".field-tracker__row");
    await expect(rows).toHaveCount(3);
    await expect(page.locator(".field-tracker__row.is-available")).toHaveCount(1);
    await expect(page.locator(".field-tracker__row.is-locked")).toHaveCount(2);
    await expect(page.locator(".field-tracker__row.is-locked").first()).toContainText(
      "Not yet available"
    );

    // With the village observed, the other two open and its own row is struck through.
    await page.evaluate(() => {
      const key = "republic-builder.chronicle.unit-01.v2";
      const saved = JSON.parse(window.localStorage.getItem(key));
      saved.caseEvidence = { "case-001": ["taino-context"] };
      window.localStorage.setItem(key, JSON.stringify(saved));
    });
    await page.reload();
    await page.getByRole("button", { name: "Student" }).click();
    await page.getByRole("button", { name: "Load Save" }).click();

    await expect(page.locator(".field-tracker__toggle em")).toHaveText("1/3");
    await expect(page.locator(".field-tracker__row.is-secured")).toHaveCount(1);
    await expect(page.locator(".field-tracker__row.is-locked")).toHaveCount(0);
    await expect(page.locator(".field-tracker__row.is-available")).toHaveCount(2);
  });

  test("collapses to its header, and the choice survives a reload", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const body = page.locator(".field-tracker__body");
    await expect(body).toBeVisible();
    await page.locator('[data-action="field-tracker-toggle"]').click();
    await expect(body).toBeHidden();
    expect((await readProgress(page)).settings.trackerCollapsed).toBe(true);

    await page.reload();
    await page.getByRole("button", { name: "Student" }).click();
    await page.getByRole("button", { name: "Load Save" }).click();
    await expect(page.locator(".field-tracker")).toHaveClass(/is-collapsed/);
    await expect(page.locator(".field-tracker__body")).toBeHidden();
  });
});
