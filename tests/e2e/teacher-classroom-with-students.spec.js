import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave } from "./helpers/progress-seed.js";
import { stubSupabase, STUB_USER_ID, STUB_CLASSROOM_ID } from "./helpers/supabase-stub.js";

/**
 * **A classroom with students in it.**
 *
 * Phase 144's stub defaults to the emptiest fixtures that get through the door — one teacher, one
 * classroom, `[]` for everything else — deliberately, because that is a teacher's first day. This
 * spec is the other end of the same screens: a roster in all four of its states, a student who has
 * made progress, an overdue assignment, a submission carrying a real AI evaluation, and a grade
 * already entered against it.
 *
 * **None of those rows had ever rendered in a test**, and none of them can be produced by hand
 * without a live classroom of real students submitting real work. Every roster row, every
 * assignment report cell, the Readiness column and the whole Archive Evaluator feedback block on
 * the grading screen were reachable only in production.
 *
 * It found one on its first run, which is the defect Phase 145 fixes: the Readiness column rendered
 * `sub.readiness` raw, so a teacher scanning the class saw `needs_fresh_attempt` in the list and
 * "Try a fresh attempt" on the screen that list opens — the same verdict, two clicks apart, one of
 * them in database. See `readinessLabel()` in `main.js` and
 * `tests/unit/readiness-label.test.js`, which guards the other direction.
 *
 * The same silent-failure mode as `teacher-surfaces.spec.js` applies and is watched the same way:
 * `render()` catches, so a `TypeError` reading one of these blobs shows a teacher a generic
 * Institute screen rather than an error.
 */

const STUDENT_A = "00000000-0000-4000-8000-000000000100";
const STUDENT_B = "00000000-0000-4000-8000-000000000110";
const EVALUATION_ID = "00000000-0000-4000-8000-000000000200";

/**
 * The clock is pinned to UTC for this spec, and both figures below are instants rather than dates.
 *
 * A due date is not stored as a date: `create-assignment` reads `<input type="date">`, appends
 * `T23:59:59` and calls `.toISOString()`, so what lands in the table is an end-of-day-*local*
 * instant. Rendering it back with `toLocaleDateString()` in the same zone round-trips correctly,
 * which is why this spec asserts the report's counts and its overdue chip rather than a date
 * string — a fixture written as UTC midnight would read a day early in every zone behind
 * Greenwich, and that would be the fixture's defect and not the app's.
 */
const DUE_AT = "2026-03-05T23:59:59.000Z";

/** Four slots: the three `roster_slots.status` values, and two claimed students, which the report needs. */
const ROSTER = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    classroom_id: STUB_CLASSROOM_ID,
    student_id_code: "S-001",
    display_name: "Ada Fields",
    status: "claimed",
    claimed_at: "2026-02-01T00:00:00.000Z",
    auth_user_id: STUDENT_A,
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    classroom_id: STUB_CLASSROOM_ID,
    student_id_code: "S-002",
    display_name: "Bede Marsh",
    status: "claimed",
    claimed_at: "2026-02-01T00:00:00.000Z",
    auth_user_id: STUDENT_B,
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    classroom_id: STUB_CLASSROOM_ID,
    student_id_code: "S-003",
    display_name: "Cleo Vance",
    status: "unclaimed",
    claimed_at: null,
    auth_user_id: null,
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    classroom_id: STUB_CLASSROOM_ID,
    student_id_code: "S-004",
    display_name: "Dara Quill",
    status: "disabled",
    claimed_at: "2026-02-01T00:00:00.000Z",
    auth_user_id: null,
  },
];

/**
 * The evaluator's own output shape for an SAQ, as `api/_lib/rubrics.js` declares it: `rows`, one per
 * rubric row, each with a `met` verdict, a `mirror` and a `gap` that is empty when the row is met —
 * plus a top-level `forward` and `readiness`.
 *
 * **This was written in the wrong shape until Phase 150** — as `elements`, which is the *HIPP*
 * schema, with `element` values in neither schema's enum, under a comment saying it was the SAQ's.
 * Nothing could tell, because no other fixture in the repository held a rubric row and no test had
 * ever produced a real evaluator reply. What that hid was that `archiveFeedbackMarkup()`'s `rows`
 * branch printed `met` exactly as the model is told to write it, so a student read **"PART A —
 * NOT_YET"** about their own work. See decision log `0149`.
 *
 * The verdicts are deliberately one of each, and the readiness deliberately the ugliest of its
 * three enum values.
 */
const SAQ_FEEDBACK = {
  rows: [
    {
      row: "part-a",
      met: "yes",
      mirror: "You name Columbus's audience as the crown that funded the voyage.",
      gap: "",
    },
    {
      row: "part-b",
      met: "partial",
      mirror: "Maize is named as a crop that moved east.",
      gap: "The effect on population is asserted rather than explained.",
    },
    {
      row: "part-c",
      met: "not_yet",
      mirror: "The encomienda is named.",
      gap: "No link yet between the labor system and the hierarchy it produced.",
    },
  ],
  forward: "Add one sentence naming the Dutch carrying trade the Acts were written against.",
  readiness: "needs_fresh_attempt",
};

const TABLES = {
  // The stub's default `profiles` holds the teacher alone, and `options.tables` **replaces** a
  // table rather than appending to it — so the teacher's own row has to be restated here, or
  // `getProfile()` finds nobody and the dashboard never opens. The two students are here because
  // the submissions read embeds `profiles!inner(display_name)`: without a row, PostgREST's inner
  // join drops the submission entirely and the teacher is shown an empty list rather than an
  // anonymous one.
  profiles: [
    { id: STUB_USER_ID, role: "teacher", display_name: "Stub Teacher" },
    { id: STUDENT_A, role: "student", display_name: "Ada Fields" },
    { id: STUDENT_B, role: "student", display_name: "Bede Marsh" },
  ],
  evaluations: [
    {
      id: EVALUATION_ID,
      submission_id: "00000000-0000-4000-8000-000000000300",
      feedback: SAQ_FEEDBACK,
      model: "claude-haiku-4-5",
      created_at: "2026-03-01T00:01:00.000Z",
    },
  ],
  roster_slots: ROSTER,
  student_world_profiles: [
    {
      student_user_id: STUDENT_A,
      classroom_id: STUB_CLASSROOM_ID,
      pack_id: "chronicle",
      progress: { completedCases: ["case-001", "case-002"], currentScreen: "field" },
    },
  ],
  submissions: [
    {
      id: "00000000-0000-4000-8000-000000000300",
      classroom_id: STUB_CLASSROOM_ID,
      task_type: "saq",
      task_id: "unit-01-archive-saq",
      prompt: "Briefly explain ONE cause of the Navigation Acts.",
      stimulus: "A 1663 bill of lading from Bridgetown.",
      student_response: "One cause was England's attempt to cut Dutch shippers out of the trade.",
      created_at: "2026-03-01T00:00:00.000Z",
      student_user_id: STUDENT_A,
      // No `profiles` or `evaluations` written here: the stub resolves both embeds off the tables
      // above, the way PostgREST does. A fixture that carries its own join answers a question the
      // application never asks it.
    },
  ],
  manual_grades: [
    {
      id: "00000000-0000-4000-8000-000000000400",
      evaluation_id: EVALUATION_ID,
      grade_label: "2/3",
      teacher_feedback: "Good use of the bill of lading. Name the excluded party.",
      created_at: "2026-03-02T00:00:00.000Z",
    },
  ],
  assignments: [
    {
      id: "00000000-0000-4000-8000-000000000500",
      classroom_id: STUB_CLASSROOM_ID,
      teacher_user_id: STUB_USER_ID,
      title: "Unit 1 Archive SAQ",
      task_type: "saq",
      task_id: "unit-01-archive-saq",
      due_at: DUE_AT,
      created_at: "2026-02-20T00:00:00.000Z",
    },
  ],
};

/** Every value the evaluator's schema permits, as it is written for the model rather than a reader. */
const RAW_READINESS_VALUES = ["ready_to_revise", "on_track", "needs_fresh_attempt"];

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

test.describe("Teacher Dashboard — a classroom with students in it", () => {
  test.use({ viewport: { width: 1366, height: 768 }, timezoneId: "UTC", locale: "en-US" });

  test("roster, assignment report and a graded submission all render", async ({ page }) => {
    test.setTimeout(180_000);
    const recoveries = watchForRenderRecovery(page);
    const supabase = await stubSupabase(page, { tables: TABLES });

    await seedProgress(page, { currentScreen: "login" });
    await loadSeededSave(page);
    await page.locator('[data-action="dev-fake-teacher"]').first().click();
    await expect(page.locator("h1")).toHaveText("Teacher Dashboard");

    const main = page.locator("main");

    // --- the roster, in all three of its states -------------------------------------------------
    for (const slot of ROSTER) await expect(main).toContainText(slot.display_name);
    await expect(
      main,
      "a student's progress summary was not read off their world profile"
    ).toContainText("2 cases complete");
    // The raw enum used to be rendered verbatim here; the labels are what is under test.
    for (const status of ["unclaimed", "disabled"]) {
      await expect(
        main,
        `the roster's STATUS column rendered the raw database enum "${status}"`
      ).not.toContainText(status);
    }

    // --- the assignment report, which is a client-side join across three tables ------------------
    await page.locator('[data-action="select-teacher-tab"]', { hasText: "Assignments" }).click();
    await expect(main).toContainText("Unit 1 Archive SAQ");
    // Two claimed slots, one submission: the denominator is the claimed roster, not the whole one,
    // so a disabled and an unclaimed slot must not be counted as students who owe work.
    await expect(
      main,
      "the report counted the submission against the wrong denominator — claimed slots are the " +
        "roster that owes work, and an unclaimed or disabled slot is not a student who is late"
    ).toContainText("1/2 submitted");
    await expect(main, "the manual grade on file was not counted as graded").toContainText(
      "1/1 graded"
    );
    // Past due with one of two claimed students still out, which is the only state that reaches
    // the overdue branch. Asserted on the chip's tone rather than on a date string.
    await expect(
      main.locator(".c-chip--error"),
      "an assignment past its due date with work still outstanding was not marked overdue"
    ).toHaveCount(1);

    // --- the Readiness column, which is the defect this spec found -------------------------------
    await expect(
      main,
      "the Readiness column shows the evaluator's verdict in words on the grading screen and in " +
        "database in the list that opens it"
    ).toContainText("Try a fresh attempt");
    for (const raw of RAW_READINESS_VALUES) {
      await expect(main, `a readiness verdict reached a teacher as "${raw}"`).not.toContainText(
        raw
      );
    }

    // --- the grading screen, with a real evaluation and a grade already on file ------------------
    await page.locator('[data-action="open-grading"]').first().click();
    await expect(page.locator("h1")).toHaveText("Ada Fields");
    // The three rubric rows, named and judged in words. `archiveFeedbackMarkup()` is shared with
    // the student's own two screens on purpose, so what a teacher reads here is what their student
    // read — including, until Phase 150, `not_yet`.
    await expect(main, "the rubric rows did not render").toContainText("Part A — Met");
    await expect(main).toContainText("Part B — Partial");
    await expect(main, "a row the student has not met yet says so in database").toContainText(
      "Part C — Not yet"
    );
    await expect(main, "the evaluator's gap line was dropped").toContainText(
      "The effect on population is asserted rather than explained."
    );
    await expect(
      main,
      "a met row still printed a gap, which the rubric says is empty when the row is met"
    ).not.toContainText("undefined");
    await expect(main).toContainText("Add one sentence naming the Dutch carrying trade");
    await expect(main, "the grade already on file was not shown").toContainText("2/3");
    for (const raw of [...RAW_READINESS_VALUES, "not_yet"]) {
      await expect(main, `the grading screen showed a verdict as "${raw}"`).not.toContainText(raw);
    }

    expect(
      recoveries,
      `a teacher screen threw while rendering real rows: ${recoveries.join(" | ")}`
    ).toEqual([]);

    // Reading a classroom must not write to it. `student_world_profiles` is the exception and is
    // the reason this suite cannot point at the live project: loading the dashboard upserts the
    // signed-in user's own world profile before anything else happens.
    expect(
      supabase.writes.filter((w) => !w.endsWith("student_world_profiles")),
      `viewing a classroom wrote to Supabase: ${supabase.writes.join(", ")}`
    ).toEqual([]);
  });
});
