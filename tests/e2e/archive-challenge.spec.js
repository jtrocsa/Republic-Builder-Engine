import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress } from "./helpers/progress-seed.js";

// Scenario 6: one Archive Challenge, Terminal -> challenge -> placement -> completion written
// to progress.completedCases.
//
// Unlike Investigation Challenges, archiveChallengesScreen() has no ephemeral-state dependency
// (it reads only progress.selectedUnitId/questResponses/completedCases/archiveChallenges) —
// directly seedable via currentScreen: "archive-challenges".
//
// case-006 "Charter & Compact" is the cleanest target: it has route: "archive-challenges"
// (no field screen — its entire mechanic is this Archive Challenge, reached by Chronotravel
// or directly from the Archive Terminal), so it's single-path. Real content
// (unit-02-quests.js): 6 sources map 2:1 onto 3 region slots.
const QUEST_ID = "case-006-archive-region-display";
const CORRECT_PLACEMENTS = {
  "town-covenant": "new-england",
  "school-law": "new-england",
  "toleration-writ": "middle",
  "grain-manifest": "middle",
  "headright-grant": "southern",
  "indenture-contract": "southern",
};

test.describe("Archive Challenge", () => {
  test("case-006: place all evidence via the select fallback, reflect, and complete", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "archive-challenges",
      selectedUnitId: "unit-02",
    });
    await loadSeededSave(page);

    const quest = page.locator(`.quest[data-quest-id="${QUEST_ID}"]`);
    await expect(quest).toBeVisible();

    for (const [sourceId, slotId] of Object.entries(CORRECT_PLACEMENTS)) {
      await quest.locator(`[data-evidence-select="${sourceId}"]`).selectOption(slotId);
    }

    const reflection = quest.locator(`[data-evidence-reflection="${QUEST_ID}"]`);
    await reflection.fill(
      "Both regions built very different labor systems, and the headright grant is the strongest evidence for that difference."
    );
    await reflection.blur();

    await expect(page.locator(".activity-feedback.success")).toContainText(
      "Archive Challenge complete"
    );

    const stored = await readProgress(page);
    expect(stored.archiveChallenges[QUEST_ID]?.status).toBe("complete");
    expect(stored.completedCases).toContain("case-006");
  });

  // case-005 "The Triangle Ledger" — migrated the same way as case-006 above (bespoke
  // triangleScreen() deleted, this Archive Challenge is now its entire mechanic).
  const TRIANGLE_QUEST_ID = "case-005-archive-triangle-cargo";
  const TRIANGLE_CORRECT_PLACEMENTS = {
    "cloth-tools": "outbound",
    firearms: "outbound",
    captives: "middle",
    "shackles-record": "middle",
    sugar: "homeward",
    tobacco: "homeward",
  };

  test("case-005: place all cargo via the select fallback, reflect, and complete", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "archive-challenges",
      selectedUnitId: "unit-02",
    });
    await loadSeededSave(page);

    const quest = page.locator(`.quest[data-quest-id="${TRIANGLE_QUEST_ID}"]`);
    await expect(quest).toBeVisible();

    for (const [sourceId, slotId] of Object.entries(TRIANGLE_CORRECT_PLACEMENTS)) {
      await quest.locator(`[data-evidence-select="${sourceId}"]`).selectOption(slotId);
    }

    const reflection = quest.locator(`[data-evidence-reflection="${TRIANGLE_QUEST_ID}"]`);
    await reflection.fill(
      "The outbound leg's cloth and firearms were traded for the captives carried on the Middle Passage, whose forced labor then produced the sugar and tobacco shipped home."
    );
    await reflection.blur();

    await expect(page.locator(".activity-feedback.success")).toContainText(
      "Archive Challenge complete"
    );

    const stored = await readProgress(page);
    expect(stored.archiveChallenges[TRIANGLE_QUEST_ID]?.status).toBe("complete");
    expect(stored.completedCases).toContain("case-005");
    expect(stored.unlocked).toContain("case-006");
  });

  // As of Phase 48A every case gets a Navigation Table marker, including Archive
  // Challenge missions like case-005 — locked (not yet teacher-unlocked) rather
  // than hidden, since the default seeded save only unlocks case-001.
  test("case-005 appears as a locked Navigation Table marker", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "archive",
      selectedUnitId: "unit-02",
    });
    await loadSeededSave(page);

    const marker = page.locator('[data-case="case-005"]');
    await expect(marker).toHaveCount(1);
    await expect(marker).toHaveClass(/route-marker--locked/);
  });

  // case-003 "Empire's Foundations" — migrated the same way as case-005/case-006 above (bespoke
  // empireScreen() deleted, this Archive Challenge is now its entire mechanic). Its sequencing
  // quest also gained a reflectionPrompt in this same migration (previously only
  // evidence-organizing had one), preserving empireScreen()'s original graded reflection field.
  const EMPIRE_QUEST_ID = "case-003-archive-empire-system";

  test("case-003: arrange the sequence via move buttons, reflect, and complete", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "archive-challenges",
      selectedUnitId: "unit-01",
    });
    await loadSeededSave(page);

    const quest = page.locator(`.quest[data-quest-id="${EMPIRE_QUEST_ID}"]`);
    await expect(quest).toBeVisible();

    // Authored order is deliberately NOT the correct order (see sequencing-quest.js's own doc
    // comment): hierarchy(3), claim(0), resistance(4), encomienda(1), exchange(5), slavery(2).
    // Target order by position: claim, encomienda, slavery, hierarchy, resistance, exchange.
    const moveUp = (itemId) =>
      quest
        .locator(`[data-action="sequence-move"][data-sequence-item="${itemId}"][data-direction="up"]`)
        .click();
    await moveUp("claim");
    await moveUp("encomienda");
    await moveUp("encomienda");
    await moveUp("slavery");
    await moveUp("slavery");
    await moveUp("slavery");

    const reflection = quest.locator(`[data-sequence-reflection="${EMPIRE_QUEST_ID}"]`);
    await reflection.fill(
      "The Requerimiento's claim of authority is what colonists used to justify the encomienda's labor demands."
    );
    await reflection.blur();

    await expect(page.locator(".activity-feedback.success")).toContainText(
      "Archive Challenge complete"
    );

    const stored = await readProgress(page);
    expect(stored.questResponses[EMPIRE_QUEST_ID].order).toEqual([
      "claim",
      "encomienda",
      "slavery",
      "hierarchy",
      "resistance",
      "exchange",
    ]);
    expect(stored.archiveChallenges[EMPIRE_QUEST_ID]?.status).toBe("complete");
    expect(stored.completedCases).toContain("case-003");
  });

  test("case-003 appears as a locked Navigation Table marker", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "archive",
      selectedUnitId: "unit-01",
    });
    await loadSeededSave(page);

    const marker = page.locator('[data-case="case-003"]');
    await expect(marker).toHaveCount(1);
    await expect(marker).toHaveClass(/route-marker--locked/);
  });

  // case-002 "The Exchange Ledger" — migrated the same way as case-003/1.05/1.06 above (bespoke
  // exchangeLedgerScreen() deleted, this Archive Challenge is now its entire mechanic). Also
  // retired the bespoke "ledger-record" Manage Content slot kind in the same migration.
  const EXCHANGE_QUEST_ID = "case-002-archive-exchange-claims";
  const EXCHANGE_CORRECT_PLACEMENTS = {
    "case-002-maize-claim": "agriculture-diet",
    "case-002-smallpox-claim": "demographic-catastrophe",
    "case-002-horses-claim": "mobility-warfare",
    "case-002-enslaved-africans-claim": "forced-labor",
  };

  test("case-002: place all records via the select fallback, reflect, and complete", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "archive-challenges",
      selectedUnitId: "unit-01",
    });
    await loadSeededSave(page);

    const quest = page.locator(`.quest[data-quest-id="${EXCHANGE_QUEST_ID}"]`);
    await expect(quest).toBeVisible();

    for (const [sourceId, slotId] of Object.entries(EXCHANGE_CORRECT_PLACEMENTS)) {
      await quest.locator(`[data-evidence-select="${sourceId}"]`).selectOption(slotId);
    }

    const reflection = quest.locator(`[data-evidence-reflection="${EXCHANGE_QUEST_ID}"]`);
    await reflection.fill(
      "The smallpox record is the strongest evidence for demographic catastrophe specifically, since it directly describes mass death from a new disease rather than just describing contact in general."
    );
    await reflection.blur();

    await expect(page.locator(".activity-feedback.success")).toContainText(
      "Archive Challenge complete"
    );

    const stored = await readProgress(page);
    expect(stored.archiveChallenges[EXCHANGE_QUEST_ID]?.status).toBe("complete");
    expect(stored.completedCases).toContain("case-002");
    expect(stored.unlocked).toContain("case-003");
  });

  test("case-002 appears as a locked Navigation Table marker", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "archive",
      selectedUnitId: "unit-01",
    });
    await loadSeededSave(page);

    const marker = page.locator('[data-case="case-002"]');
    await expect(marker).toHaveCount(1);
    await expect(marker).toHaveClass(/route-marker--locked/);
  });

  // case-008 "The Founding Debate" — migrated the same way as case-002/1.03/1.05/1.06 above
  // (bespoke foundingScreen() deleted, this Archive Challenge is now its entire mechanic).
  // Unlike the other three, case-008 had zero editable/previewable surface before this
  // migration — this content is freshly authored, not a duplicate of an existing quest.
  const FOUNDING_QUEST_ID = "case-008-archive-ratification-claims";
  const FOUNDING_CORRECT_PLACEMENTS = {
    "case-008-federalist-10-claim": "large-republic-defense",
    "case-008-brutus-1-claim": "large-republic-opposition",
    "case-008-connecticut-compromise-claim": "representation-compromise",
    "case-008-mason-bill-of-rights-claim": "bill-of-rights-origin",
  };

  test("case-008: place all records via the select fallback, reflect, and complete", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "archive-challenges",
      selectedUnitId: "unit-03",
    });
    await loadSeededSave(page);

    const quest = page.locator(`.quest[data-quest-id="${FOUNDING_QUEST_ID}"]`);
    await expect(quest).toBeVisible();

    for (const [sourceId, slotId] of Object.entries(FOUNDING_CORRECT_PLACEMENTS)) {
      await quest.locator(`[data-evidence-select="${sourceId}"]`).selectOption(slotId);
    }

    const reflection = quest.locator(`[data-evidence-reflection="${FOUNDING_QUEST_ID}"]`);
    await reflection.fill(
      "The Brutus No. I excerpt is the strongest evidence for opposition to a large republic specifically, since it directly warns that a republic spread over such a vast territory could not govern well or protect liberty."
    );
    await reflection.blur();

    await expect(page.locator(".activity-feedback.success")).toContainText(
      "Archive Challenge complete"
    );

    const stored = await readProgress(page);
    expect(stored.archiveChallenges[FOUNDING_QUEST_ID]?.status).toBe("complete");
    expect(stored.completedCases).toContain("case-008");
  });

  test("case-008 appears as a locked Navigation Table marker", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "archive",
      selectedUnitId: "unit-03",
    });
    await loadSeededSave(page);

    const marker = page.locator('[data-case="case-008"]');
    await expect(marker).toHaveCount(1);
    await expect(marker).toHaveClass(/route-marker--locked/);
  });

  // case-009 "Appeals to Liberty" (Phase 48D) — promoted from what used to be
  // this unit's only archiveChallenges[] bonus entry into a real third
  // mission with its own case-level framing. Same real quest content
  // ("unit-03-archive-appeal-form-comparison": Prince Hall's 1777 petition
  // vs. Abigail Adams's 1776 letter), now reached the same way as any other
  // Archive Challenge case rather than only from the Archive Terminal's
  // bonus section.
  const APPEAL_QUEST_ID = "unit-03-archive-appeal-form-comparison";
  const APPEAL_CORRECT_PLACEMENTS = {
    "hall-petition-appeal-form": "public-petition",
    "adams-letter-appeal-form": "private-appeal",
  };

  test("case-009: place both records via the select fallback, reflect, and complete", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "archive-challenges",
      selectedUnitId: "unit-03",
      activeCaseId: "case-009",
    });
    await loadSeededSave(page);

    const quest = page.locator(`.quest[data-quest-id="${APPEAL_QUEST_ID}"]`);
    await expect(quest).toBeVisible();

    for (const [sourceId, slotId] of Object.entries(APPEAL_CORRECT_PLACEMENTS)) {
      await quest.locator(`[data-evidence-select="${sourceId}"]`).selectOption(slotId);
    }

    const reflection = quest.locator(`[data-evidence-reflection="${APPEAL_QUEST_ID}"]`);
    await reflection.fill(
      "Hall's petition was a formal public appeal to a legislature, so it had to argue in the shared legal language of natural rights the assembly already used; Adams's letter was a private appeal to her husband, so it could speak more bluntly and personally, but had no formal standing to compel a response."
    );
    await reflection.blur();

    await expect(page.locator(".activity-feedback.success")).toContainText(
      "Archive Challenge complete"
    );

    const stored = await readProgress(page);
    expect(stored.archiveChallenges[APPEAL_QUEST_ID]?.status).toBe("complete");
    expect(stored.completedCases).toContain("case-009");
  });

  test("case-009 appears as a locked Navigation Table marker", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "archive",
      selectedUnitId: "unit-03",
    });
    await loadSeededSave(page);

    const marker = page.locator('[data-case="case-009"]');
    await expect(marker).toHaveCount(1);
    await expect(marker).toHaveClass(/route-marker--locked/);
  });

  // Unit 3's bonus Archive Challenge (Phase 49A) — the real "saq" quest type's
  // proving ground. Unlike case-005/006/008/009 above, this isn't tied to any
  // case (unit.archiveChallenges[], not cases[].archiveChallenge), so
  // completing it doesn't unlock a case or write to progress.completedCases —
  // only progress.archiveChallenges[questId].status. "Complete" here means
  // "submitted" (every part has a response), not AI-graded — the Archive
  // Evaluator button that then appears is a separate, optional feedback step.
  const SAQ_QUEST_ID = "unit-03-archive-common-cause-saq";

  test("unit-03 bonus SAQ: draft all three parts and complete", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "archive-challenges",
      selectedUnitId: "unit-03",
    });
    await loadSeededSave(page);

    const quest = page.locator(`.quest[data-quest-id="${SAQ_QUEST_ID}"]`);
    await expect(quest).toBeVisible();

    for (let index = 0; index < 3; index += 1) {
      const field = quest.locator(
        `[data-saq-quest="${SAQ_QUEST_ID}"][data-saq-index="${index}"]`
      );
      await field.fill(`Draft response for part ${index}.`);
      // handleAppChange persists on the "change" event (fires on blur), same
      // as every other reflection/response textarea in this suite — fill()
      // alone doesn't commit a change event, so each field needs its own
      // explicit blur before moving to the next one re-renders the DOM.
      await field.blur();
    }

    await expect(quest.locator("..").locator(".activity-feedback.success")).toContainText(
      "Archive Challenge complete"
    );
    await expect(
      quest.locator("..").getByRole("button", { name: "Get Archive Evaluator feedback →" })
    ).toBeVisible();

    const stored = await readProgress(page);
    expect(stored.questResponses[SAQ_QUEST_ID].responses).toEqual({
      0: "Draft response for part 0.",
      1: "Draft response for part 1.",
      2: "Draft response for part 2.",
    });
    expect(stored.archiveChallenges[SAQ_QUEST_ID]?.status).toBe("complete");
    // Bonus challenge, not tied to any case — doesn't unlock/complete a case.
    expect(stored.completedCases).not.toContain("case-009");
  });

  test("unit-03 bonus SAQ: incomplete until every part has a response", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "archive-challenges",
      selectedUnitId: "unit-03",
    });
    await loadSeededSave(page);

    const quest = page.locator(`.quest[data-quest-id="${SAQ_QUEST_ID}"]`);
    await quest
      .locator(`[data-saq-quest="${SAQ_QUEST_ID}"][data-saq-index="0"]`)
      .fill("Only part A answered.");
    await quest
      .locator(`[data-saq-quest="${SAQ_QUEST_ID}"][data-saq-index="0"]`)
      .blur();

    await expect(quest.locator("..").locator(".activity-feedback.success")).toHaveCount(0);
    await expect(
      quest.locator("..").getByRole("button", { name: "Get Archive Evaluator feedback →" })
    ).toHaveCount(0);

    const stored = await readProgress(page);
    expect(stored.archiveChallenges[SAQ_QUEST_ID]?.status).not.toBe("complete");
  });

  // Unit 3's second bonus Archive Challenge (Phase 49E) — the real "dbq"
  // quest type's proving ground, same pattern as the SAQ tests above:
  // "complete" means "submitted a substantial response," not AI-graded.
  const DBQ_QUEST_ID = "unit-03-archive-common-cause-dbq";
  const LONG_ESSAY_RESPONSE = "This essay discusses the Revolution's promise of liberty. ".repeat(
    10
  );

  test("unit-03 bonus DBQ: draft a response of sufficient length and complete", async ({
    page,
  }) => {
    await seedProgress(page, {
      currentScreen: "archive-challenges",
      selectedUnitId: "unit-03",
    });
    await loadSeededSave(page);

    const quest = page.locator(`.quest[data-quest-id="${DBQ_QUEST_ID}"]`);
    await expect(quest).toBeVisible();
    // All 7 real documents render.
    for (let n = 1; n <= 7; n += 1) {
      await expect(quest).toContainText(`Document ${n}`);
    }

    const field = quest.locator(`[data-dbq-response="${DBQ_QUEST_ID}"]`);
    await field.fill(LONG_ESSAY_RESPONSE);
    await field.blur();

    await expect(quest.locator("..").locator(".activity-feedback.success")).toContainText(
      "Archive Challenge complete"
    );
    await expect(
      quest.locator("..").getByRole("button", { name: "Get Archive Evaluator feedback →" })
    ).toBeVisible();

    const stored = await readProgress(page);
    expect(stored.questResponses[DBQ_QUEST_ID].response).toBe(LONG_ESSAY_RESPONSE);
    expect(stored.archiveChallenges[DBQ_QUEST_ID]?.status).toBe("complete");
    // Bonus challenge, not tied to any case — doesn't unlock/complete a case.
    expect(stored.completedCases).not.toContain("case-009");
  });

  test("unit-03 bonus DBQ: incomplete below the minimum response length", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "archive-challenges",
      selectedUnitId: "unit-03",
    });
    await loadSeededSave(page);

    const quest = page.locator(`.quest[data-quest-id="${DBQ_QUEST_ID}"]`);
    const field = quest.locator(`[data-dbq-response="${DBQ_QUEST_ID}"]`);
    await field.fill("Too short a response.");
    await field.blur();

    await expect(quest.locator("..").locator(".activity-feedback.success")).toHaveCount(0);
    await expect(
      quest.locator("..").getByRole("button", { name: "Get Archive Evaluator feedback →" })
    ).toHaveCount(0);

    const stored = await readProgress(page);
    expect(stored.archiveChallenges[DBQ_QUEST_ID]?.status).not.toBe("complete");
  });
});
