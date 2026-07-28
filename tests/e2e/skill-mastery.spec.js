import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress } from "./helpers/progress-seed.js";

// Phase 49B: skill mastery surfaced to the student. recordSkillOutcomes() (main.js) upserts
// progress.skillMastery once a tagged quest item is graded — Practice Check is the most direct
// place to exercise this live, since case-001's own content now carries real skillCategory tags
// across all 4 quest types (mcq/sequencing added in this phase; hipp is hardcoded "Sourcing";
// evidence-organizing already tagged its sources before this phase).
test.describe("Skill mastery record", () => {
  test("Practice Check answers upsert progress.skillMastery, keyed per graded item", async ({
    page,
  }) => {
    await seedProgress(page, { currentScreen: "practice-check" });
    await loadSeededSave(page);

    // One correct mcq (Sourcing) and one incorrect mcq (also Sourcing) — both must still be
    // recorded, since a mastery record needs to reflect wrong answers too, not just right ones.
    const correctMcq = page.locator('.quest[data-quest-id="case-001-mcq-taino-sourcing"]');
    await correctMcq.locator('input[type="radio"][value="1"]').check();
    const incorrectMcq = page.locator('.quest[data-quest-id="case-001-mcq-columbus-audience"]');
    await incorrectMcq.locator('input[type="radio"][value="1"]').check();

    // Sequencing (Causation) — correct order via the keyboard move buttons.
    const seqQuest = page.locator('.quest[data-quest-id="case-001-sequencing-columbian-exchange"]');
    const moveUp = (itemId) =>
      seqQuest
        .locator(
          `[data-action="sequence-move"][data-sequence-item="${itemId}"][data-direction="up"]`
        )
        .click();
    await moveUp("taino-society-precontact");
    await moveUp("taino-society-precontact");
    await moveUp("columbus-first-contact-letter");
    await moveUp("columbus-first-contact-letter");
    await moveUp("waldseemuller-map-knowledge");
    await moveUp("waldseemuller-map-knowledge");

    // HIPP (hardcoded "Sourcing") — both prompts, so gradeSourceAnalysisQuest reports complete.
    const hippQuest = page.locator('.quest[data-quest-id="case-001-hipp-columbus-letter"]');
    await hippQuest
      .locator(
        '[data-hipp-prompt="columbus-audience"] input[data-hipp-option="audience-explained"]'
      )
      .check();
    await hippQuest
      .locator('[data-hipp-prompt="columbus-purpose"] input[data-hipp-option="purpose-explained"]')
      .check();

    // Evidence organizing — one correct, one incorrect placement (per-source outcomes).
    const evidenceQuest = page.locator('.quest[data-quest-id="case-001-evidence-record-sourcing"]');
    await evidenceQuest
      .locator('[data-evidence-select="taino-context"]')
      .selectOption("contextualization");
    await evidenceQuest
      .locator('[data-evidence-select="columbus-letter"]')
      .selectOption("continuity-and-change");

    const stored = await readProgress(page);
    const mastery = stored.skillMastery;

    expect(mastery["case-001-mcq-taino-sourcing"]).toMatchObject({
      skillCategory: "Sourcing",
      correct: true,
      questType: "mcq",
    });
    expect(mastery["case-001-mcq-columbus-audience"]).toMatchObject({
      skillCategory: "Sourcing",
      correct: false,
      questType: "mcq",
    });
    expect(mastery["case-001-sequencing-columbian-exchange"]).toMatchObject({
      skillCategory: "Causation",
      correct: true,
      questType: "sequencing",
    });
    expect(mastery["case-001-hipp-columbus-letter"]).toMatchObject({
      skillCategory: "Sourcing",
      correct: true,
      questType: "hipp",
    });
    expect(mastery["case-001-evidence-record-sourcing::taino-context"]).toMatchObject({
      skillCategory: "Contextualization",
      correct: true,
      questType: "evidence-organizing",
    });
    expect(mastery["case-001-evidence-record-sourcing::columbus-letter"]).toMatchObject({
      skillCategory: "Sourcing",
      correct: false,
      questType: "evidence-organizing",
    });
  });

  test("Skill Mastery Record screen aggregates per-category stats and returns to the Institute", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "mastery",
      skillMastery: {
        "case-001-mcq-taino-sourcing": {
          skillCategory: "Sourcing",
          correct: true,
          questType: "mcq",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        "case-001-mcq-columbus-audience": {
          skillCategory: "Sourcing",
          correct: false,
          questType: "mcq",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        "case-001-sequencing-columbian-exchange": {
          skillCategory: "Causation",
          correct: true,
          questType: "sequencing",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    });
    await loadSeededSave(page);

    await expect(page.getByRole("heading", { name: "Skill Mastery Record" })).toBeVisible();

    const sourcingRow = page.locator('[data-mastery-category="Sourcing"]');
    await expect(sourcingRow).toContainText("1/2 correct");
    const causationRow = page.locator('[data-mastery-category="Causation"]');
    await expect(causationRow).toContainText("1/1 correct");
    // Comparison has no recorded entries in this seed — must show the empty-per-category state,
    // not silently omit the row (every SKILL_CATEGORIES entry always renders).
    const comparisonRow = page.locator('[data-mastery-category="Comparison"]');
    await expect(comparisonRow).toContainText("Not yet practiced");

    await page.getByRole("button", { name: "← Return to Institute" }).click();
    const stored = await readProgress(page);
    expect(stored.currentScreen).toBe("institute");
    // Skill mastery itself must never be reset by simply viewing the record.
    expect(stored.skillMastery["case-001-mcq-taino-sourcing"].correct).toBe(true);
  });

  test("Skill Mastery Record screen shows an empty state with no graded records yet", async ({
    page,
  }) => {
    await seedProgress(page, { currentScreen: "mastery" });
    await loadSeededSave(page);

    await expect(page.locator(".mastery-board")).toContainText("No graded records yet");
  });
});
