import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, walkToHubTarget } from "./helpers/progress-seed.js";
import { stubSupabase, STUB_CLASSROOM_ID } from "./helpers/supabase-stub.js";
import { stubRosterApi } from "./helpers/roster-api-stub.js";
import { stubEvaluator } from "./helpers/evaluate-api-stub.js";

/**
 * **The other direction: a student writes, and their teacher reads it.**
 *
 * Phase 149 walked teacher → student and found the answer key being rewritten on the way. This is
 * the return leg, and it is the one the whole grading half of Teacher Mode rests on: a student's
 * written work becoming a row their teacher can open, with the student's name on it and the
 * evaluator's verdict beside it.
 *
 * It had never been walked, and it could not be, for two separate reasons that both had to go:
 *
 * 1. **`POST /api/evaluate` had no stub.** Nothing a student writes is recorded until the evaluator
 *    answers — `runEvaluation()` writes the `submissions` row only on success — so with the door
 *    shut there was no way to produce a submission at all. `helpers/evaluate-api-stub.js` is that
 *    door, the third after Supabase and `/api/roster/*`.
 * 2. **The Supabase stub resolved no embeds.** `listForClassroom()` reads
 *    `profiles!inner(display_name)` and `evaluations(...)`, and a spec could only fake those by
 *    writing the join into its own fixture — which a row the *application* inserts has nobody to do
 *    for it. A real student's submission arrived as "Unknown student" with no verdict.
 *
 * Both are honest infrastructure and neither is the finding. The finding is in `0149`: every rubric
 * row the evaluator returns reached the student as the schema writes it for the model, so the first
 * thing this walk showed was a student reading **"PART C — NOT_YET"** about their own writing.
 */

const JOIN_CODE = "STUB01";
const STUDENT_NAME = "Ada Fields";

/** Unit 1 finished, which is what `unitReadyForReview()` asks before the Archive Review is offered. */
const UNIT_ONE_DONE = {
  currentScreen: "login",
  currentHubRoom: "main",
  selectedUnitId: "unit-01",
  selectedCaseId: "case-001",
  completedCases: ["case-001", "case-002", "case-003"],
  unlocked: ["case-001", "case-002", "case-003"],
  archiveChallenges: { "unit-01-archive-atlantic-world-saq": { status: "complete" } },
  review: {
    answers: {},
    saq: {
      0: "Columbus wrote to the crown that funded him, so the letter advertises what it found.",
      1: "Maize moved east and fed growing populations; smallpox moved west and emptied villages.",
      2: "The encomienda tied forced labor to conquest and fixed a hierarchy by origin and birth.",
    },
  },
  tutorial: { step: "complete", completed: true, skipped: false },
};

function watchForRenderRecovery(page) {
  const recoveries = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Chronicle render recovery")) {
      recoveries.push(message.text());
    }
  });
  page.on("pageerror", (error) => recoveries.push(`uncaught: ${error.message}`));
  return recoveries;
}

async function signInAsTeacher(page) {
  await page.locator('[data-action="open-main-menu"]').first().click();
  await page.locator('[data-action="open-teacher-login"]').first().click();
  await page.locator('[data-action="dev-fake-teacher"]').first().click();
  await expect(page.locator("h1")).toHaveText("Teacher Dashboard");
}

async function claimSeat(page, { id, name, password }) {
  await page.locator('[data-action="open-main-menu"]').first().click();
  await page.locator('[data-action="landing-student"]').first().click();
  await page.locator('[data-action="open-join-screen"]').first().click();
  await page.locator('[data-action="student-tab-claim"]').first().click();
  await page.fill("#join-classroom-code", JOIN_CODE);
  await page.fill("#join-student-id", id);
  await page.fill("#join-display-name", name);
  await page.fill("#join-password", password);
  await page.locator('[data-action="submit-join-claim"]').first().click();
  await expect(page.locator("h1")).toHaveText("Institute Archive");
}

test.describe("A student's written work reaches their teacher", () => {
  test.use({ viewport: { width: 1366, height: 768 }, timezoneId: "UTC", locale: "en-US" });
  test.setTimeout(180_000);

  test("what a student submits is what their teacher opens and grades", async ({ page }) => {
    const recoveries = watchForRenderRecovery(page);
    const supabase = await stubSupabase(page);
    await stubRosterApi(page, supabase);
    const evaluator = await stubEvaluator(page, { readiness: "needs_fresh_attempt" });

    await seedProgress(page, UNIT_ONE_DONE);
    await loadSeededSave(page);

    // --- the teacher, opening a seat ------------------------------------------------------------
    await page.locator('[data-action="dev-fake-teacher"]').first().click();
    await expect(page.locator("h1")).toHaveText("Teacher Dashboard");
    await page.fill("#provision-count", "1");
    await page.locator('[data-action="provision-roster"]').first().click();
    await expect(page.locator("main")).toContainText("Added seats");
    await page.locator('[data-action="teacher-sign-out"]').first().click();

    // --- the student, taking it and writing something -------------------------------------------
    await claimSeat(page, { id: "01", name: STUDENT_NAME, password: "chronicle1" });

    expect(await walkToHubTarget(page, "table"), "could not reach the Navigation Table").toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator(".archive-layout")).toBeVisible({ timeout: 20_000 });
    await page.locator('[data-action="review"]').first().click();
    await page.locator('[data-action="evaluate-saq"]').first().click();
    await expect(page.locator(".archive-feedback")).toBeVisible({ timeout: 20_000 });

    expect(evaluator.requests.length, "the press never reached the evaluator").toBe(1);

    // The row is written after the evaluator answers, from a promise the click handler does not
    // wait on — so this polls rather than reads. Nothing on the student's screen says it happened.
    await expect
      .poll(() => (supabase.tables.submissions || []).length, {
        message:
          "the student's work never became a row. The student sees their feedback either way, so " +
          "this failing silently is a class whose teacher has nothing to grade",
      })
      .toBe(1);

    const submission = supabase.tables.submissions[0];
    expect(
      submission.classroom_id,
      "the submission was filed against no classroom, so it reaches no teacher"
    ).toBe(STUB_CLASSROOM_ID);
    expect(submission.student_user_id).toBe(supabase.tables.roster_slots[0].auth_user_id);
    expect(
      submission.student_response,
      "the third part of the student's answer is missing from what was filed"
    ).toContain("encomienda");
    await expect
      .poll(() => (supabase.tables.evaluations || []).length, {
        message: "the feedback the student was shown was not stored beside their submission",
      })
      .toBe(1);

    // --- the teacher again, reading it ----------------------------------------------------------
    await signInAsTeacher(page);
    await page.locator('[data-action="select-teacher-tab"]', { hasText: "Assignments" }).click();

    const main = page.locator("main");
    await expect(
      main,
      "the submission is in the table and the teacher's list does not show it — the list reads " +
        "`profiles!inner(display_name)`, so a student with no profile row is not shown as " +
        "anonymous, they are not shown"
    ).toContainText(STUDENT_NAME);
    await expect(main, "the Readiness column spoke in database").toContainText(
      "Try a fresh attempt"
    );

    await page.locator('[data-action="open-grading"]').first().click();
    await expect(page.locator("h1")).toHaveText(STUDENT_NAME);
    await expect(
      main,
      "the teacher is grading a submission without being shown what the student wrote"
    ).toContainText("The encomienda tied forced labor to conquest");
    // `archiveFeedbackMarkup()` is shared between the student's screen and this one on purpose, so
    // the teacher reads exactly what their student read — in words, on both.
    await expect(main).toContainText("Part A — Met");
    await expect(main).toContainText("Part C — Not yet");
    for (const raw of ["not_yet", "needs_fresh_attempt"]) {
      await expect(main, `the grading screen showed "${raw}" to a teacher`).not.toContainText(raw);
    }

    // --- and the grade the teacher enters ------------------------------------------------------
    await page.fill("#grade-label", "2/3");
    await page.fill("#grade-teacher-feedback", "Part C needs the link, not just the name.");
    await page.locator('[data-action="save-manual-grade"]').click();
    await expect(main, "the grade was not read back onto the screen that saved it").toContainText(
      "Part C needs the link, not just the name."
    );
    expect(
      (supabase.tables.manual_grades || []).map((row) => row.grade_label),
      "the grade did not reach the table, or reached it twice"
    ).toEqual(["2/3"]);

    expect(recoveries, `a screen threw: ${recoveries.join(" | ")}`).toEqual([]);
    expect(
      supabase.unsupportedFilters,
      "a query asked something the stub could not answer"
    ).toEqual([]);
    expect(
      supabase.unsupportedEmbeds,
      "a join was left unresolved, so a column the teacher reads was blank for a reason that has " +
        "nothing to do with the application"
    ).toEqual([]);
  });
});
