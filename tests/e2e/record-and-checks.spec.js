import { expect, test } from "@playwright/test";
import { loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

// The record and the checks — Spine Review Part 9 (decision log 0086).
//
// Two screens and the panel that is the door to both: the source reader, the Practice Check, and
// the field's Evidence Channel. The headline is a navigation bug that needs three screens to see,
// which is why it is banked here rather than in a unit test: one module-global answered two
// different questions — where the *reader* goes back to, and where the *Codex* goes back to — so
// opening a record from the Codex destroyed the Codex's own memory of the Institute and sent the
// player out to the field.

const CASE_001 = {
  activeCaseId: "case-001",
  selectedCaseId: "case-001",
  unlocked: ["case-001"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

/** Standing in the Archive Room, with one record of Case 1.01 already read and filed. */
const IN_THE_ARCHIVE = {
  ...CASE_001,
  currentScreen: "institute",
  currentHubRoom: "archive",
  caseEvidence: { "case-001": ["columbus-letter"] },
  revealedContexts: ["columbus-letter"],
  responses: {
    "columbus-letter": "Columbus writes to his patrons, so the letter argues rather than reports.",
  },
};

/**
 * A finished reconstruction, which is the only route to the reader's multiple-choice variant that
 * does not involve walking to the far west shore — the same seed the visual baseline uses.
 */
const FILED_ASSEMBLY = {
  "waldseemuller-map": {
    state: {
      placed: {
        sheet: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`p${i + 1}`, `f${i + 1}`])),
        cartouches: { south: "america", north: "terra-incognita", east: "india" },
      },
      selected: null,
      filed: "knowledge",
    },
    completed: false,
    briefed: true,
    debriefed: true,
  },
};

async function openRecordFromCodex(page) {
  await seedProgress(page, IN_THE_ARCHIVE);
  await loadSeededSave(page);
  await page.locator('.hub-sidepanel [data-action="codex"]').click();
  await expect(page.locator(".codex-shell")).toBeVisible();
  await page.locator('[data-action="open-source"][data-source="columbus-letter"]').click();
  await expect(page.locator(".reader-shell")).toBeVisible();
}

test.describe("a record opened from the Codex", () => {
  // P9-1. Three screens deep, and every step of it is an ordinary thing to do: the Archive Room's
  // side panel opens the Codex, the Codex offers to reopen a record you filed, and the Codex's own
  // "← Return" is the way back. Before Part 9 that last press landed in the field.
  test("still knows the way back to the Institute", async ({ page }) => {
    await openRecordFromCodex(page);

    // Two controls, one destination: the back-link already says Codex, so the reader drops its own
    // Codex button in this state rather than offering the same screen twice.
    await expect(page.locator(".reader-nav .back-link")).toHaveText("← Back to Codex");
    await expect(page.locator(".reader-nav .codex-button")).toHaveCount(0);

    await page.locator('[data-action="return-source"]').click();
    await expect(page.locator(".codex-shell")).toBeVisible();

    await page.locator('[data-action="return-codex"]').click();
    await expect(page.locator("#institutePlayer")).toBeVisible();
  });

  // P9-1, the shorter way into the same wrong screen. "Filed in the Codex ✓" is a live button on an
  // already-filed record, and it hard-coded the field as its destination.
  test("files back to where it was opened from, not to the map", async ({ page }) => {
    await openRecordFromCodex(page);

    const file = page.locator('[data-action="secure-source"]');
    await expect(file).toContainText("Filed in the Codex");
    await file.click();
    await expect(page.locator(".codex-shell")).toBeVisible();
  });
});

test.describe("the reader's own questions", () => {
  // P9-2. Every card printed `questHint()`, which for mcq is a constant that ignores the result —
  // so a correct answer got a green box telling the student to choose the option that explains why.
  test("say whether the answer was right, and what the record says", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "assembly",
      activeActivitySourceId: "waldseemuller-map",
      caseEvidence: { "case-001": ["taino-context"] },
      sourceActivities: FILED_ASSEMBLY,
    });
    await loadSeededSave(page);
    await page.locator('[data-action="open-activity-source"]').click();
    await expect(page.locator(".reader-questions")).toBeVisible();

    const naming = page.locator('.quest[data-quest-id="case-001-reader-mcq-waldseemuller-naming"]');
    const card = naming.locator("xpath=ancestor::div[@data-quest-status]");

    await naming.locator('input[type="radio"][value="1"]').check();
    await expect(card).toHaveAttribute("data-quest-status", "in-progress");
    await expect(card.locator(".activity-feedback")).toContainText("Not quite.");
    // The reasoning stays behind a correct answer here, unlike the Practice Check's identical
    // cards: this set is the gate on Institute Context.
    await expect(card.locator(".activity-feedback")).not.toContainText("he died in 1506");

    await naming.locator('input[type="radio"][value="0"]').check();
    await expect(card).toHaveAttribute("data-quest-status", "correct");
    await expect(card.locator(".activity-feedback")).toContainText("Correct.");
    await expect(card.locator(".activity-feedback")).toContainText("he died in 1506");
  });

  // P9-6. The one `alert()` in the game, for a minimum nothing stated until it was tripped.
  test("refuse a too-short reading in the reader, not in a system modal", async ({ page }) => {
    let dialogs = 0;
    page.on("dialog", (dialog) => {
      dialogs += 1;
      dialog.dismiss().catch(() => {});
    });
    await openRecordFromCodex(page);

    await page.locator("#sourceResponse").fill("no");
    await page.locator('[data-action="submit-source"]').click();

    await expect(page.locator(".reader-prompt .activity-feedback.error")).toContainText(
      "at least a sentence"
    );
    expect(dialogs).toBe(0);
  });
});

test.describe("the Practice Check", () => {
  // P9-3, routed in from Part 6B as P6B-8. "Complete" meant *answered* for two of the four sections
  // and *correct* for the other two, under one label; and a second count sat under the multiple-
  // choice section alone, wearing the class every card's own feedback line uses.
  test("counts one thing, once", async ({ page }) => {
    await seedProgress(page, { ...CASE_001, currentScreen: "practice-check" });
    await loadSeededSave(page);

    await expect(page.locator(".quest-practice-summary")).toContainText("0/6");
    await expect(page.locator(".quest-practice-board > .activity-feedback")).toHaveCount(0);

    const mcq = page.locator('.quest[data-quest-id="case-001-mcq-taino-sourcing"]');
    await mcq.locator('input[type="radio"][value="0"]').check();
    await expect(mcq.locator("xpath=ancestor::div[@data-quest-status]")).toHaveAttribute(
      "data-quest-status",
      "incorrect"
    );
    await expect(page.locator(".quest-practice-summary")).toContainText("0/6");

    await mcq.locator('input[type="radio"][value="1"]').check();
    await expect(page.locator(".quest-practice-summary")).toContainText("1/6");
  });
});

test.describe("the Evidence Channel", () => {
  // P9-4, routed in from Part 6B as P6B-9. The line was a static per-map string that re-listed the
  // records the briefing paragraph above it had already named, and never moved as they came in.
  // Two pages rather than one, because seedProgress() writes only into an empty key — by design, so
  // that a reload mid-test cannot clobber the app's own saves.
  test("says how much of the case is left", async ({ page }) => {
    await seedProgress(page, { ...CASE_001, currentScreen: "field" });
    await loadSeededSave(page);
    await expect(page.locator(".channel-progress")).toContainText("3 records still to secure");
  });

  test("counts down as records are secured, and reads as one record at the end", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_001,
      currentScreen: "field",
      caseEvidence: { "case-001": ["taino-context", "columbus-letter"] },
    });
    await loadSeededSave(page);
    await expect(page.locator(".channel-progress")).toContainText("1 record still to secure");
  });
});
