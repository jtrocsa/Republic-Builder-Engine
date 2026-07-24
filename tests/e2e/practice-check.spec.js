import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress } from "./helpers/progress-seed.js";

// Scenario 7: one Practice Check covering all 4 quest types (mcq, sequencing,
// evidence-organizing, hipp), each graded live, questResponses persisted.
//
// practiceCheckScreen() derives everything from activeFieldCaseId() (defaults to "case-001"),
// which has real content for all 4 types — directly seedable with just currentScreen:
// "practice-check", no case-unlock seeding needed.
//
// This is the scenario that most directly guards the exact regression class the QUEST_TYPES
// consolidation (modernization roadmap item 1, commit fddf145) was built to prevent: status-
// derivation logic drifting apart between practiceCheckScreen() and the challenge screens.
test.describe("Practice Check (all 4 quest types)", () => {
  test("mcq, sequencing, evidence-organizing, and hipp each grade live and persist", async ({
    page,
  }) => {
    await seedProgress(page, { currentScreen: "practice-check" });
    await loadSeededSave(page);

    await expect(page.locator(".quest-practice-summary")).toContainText("0/6");

    // --- MCQ --- practiceCheckScreen()'s overall count treats every mcq item as "complete"
    // once answered (not once correct — see main.js's mcqCards map, `if (answered) overallComplete
    // += 1`), so all 3 of case-001's mcq questions need an answer to reach 6/6 overall, even
    // though each card's own data-quest-status still distinguishes correct from incorrect.
    const mcqAnswers = {
      "case-001-mcq-taino-sourcing": "1",
      "case-001-mcq-columbus-audience": "0",
      "case-001-mcq-waldseemuller-change": "1",
    };
    for (const [questId, answerIndex] of Object.entries(mcqAnswers)) {
      const mcqQuest = page.locator(`.quest[data-quest-id="${questId}"]`);
      await mcqQuest.locator(`input[type="radio"][value="${answerIndex}"]`).check();
      await expect(mcqQuest.locator("xpath=ancestor::div[@data-quest-status]")).toHaveAttribute(
        "data-quest-status",
        "correct"
      );
    }

    // --- Sequencing --- authored order is deliberately NOT the correct order (see
    // sequencing-quest.js's own doc comment). Correct order by `position`: taino-society(0),
    // columbus-letter(1), waldseemuller-map(2), smallpox(3), horses(4). Using the keyboard
    // move buttons (not drag) — more deterministic than simulating native HTML5 DnD.
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
    await expect(seqQuest.locator("xpath=ancestor::div[@data-quest-status]")).toHaveAttribute(
      "data-quest-status",
      "correct"
    );

    // --- Evidence organizing --- via the <select> fallback (deterministic, no native DnD).
    const evidenceQuest = page.locator('.quest[data-quest-id="case-001-evidence-record-sourcing"]');
    await evidenceQuest
      .locator('[data-evidence-select="taino-context"]')
      .selectOption("contextualization");
    await evidenceQuest
      .locator('[data-evidence-select="columbus-letter"]')
      .selectOption("sourcing-situation");
    await evidenceQuest
      .locator('[data-evidence-select="waldseemuller-map"]')
      .selectOption("continuity-and-change");
    const reflection = evidenceQuest.locator(
      '[data-evidence-reflection="case-001-evidence-record-sourcing"]'
    );
    await reflection.fill(
      "Using context, a letter, and a map together builds a stronger argument than any one record alone."
    );
    await reflection.blur();
    await expect(evidenceQuest.locator("xpath=ancestor::div[@data-quest-status]")).toHaveAttribute(
      "data-quest-status",
      "correct"
    );

    // --- HIPP source analysis ---
    const hippQuest = page.locator('.quest[data-quest-id="case-001-hipp-columbus-letter"]');
    await hippQuest
      .locator(
        '[data-hipp-prompt="columbus-audience"] input[data-hipp-option="audience-explained"]'
      )
      .check();
    await hippQuest
      .locator('[data-hipp-prompt="columbus-purpose"] input[data-hipp-option="purpose-explained"]')
      .check();
    await expect(hippQuest.locator("xpath=ancestor::div[@data-quest-status]")).toHaveAttribute(
      "data-quest-status",
      "correct"
    );

    await expect(page.locator(".quest-practice-summary")).toContainText("6/6");

    const stored = await readProgress(page);
    expect(stored.questResponses["case-001-mcq-taino-sourcing"]).toEqual({ selected: "1" });
    expect(stored.questResponses["case-001-sequencing-columbian-exchange"].order).toEqual([
      "taino-society-precontact",
      "columbus-first-contact-letter",
      "waldseemuller-map-knowledge",
      "smallpox-epidemic-1518",
      "horses-reshape-societies",
    ]);
  });
});
