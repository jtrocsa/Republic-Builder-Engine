import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave } from "./helpers/progress-seed.js";
import { stubSupabase, STUB_CLASSROOM_ID, STUB_USER_ID } from "./helpers/supabase-stub.js";

/**
 * **What a teacher writes, and what they see when they read it back.**
 *
 * Phases 144 and 145 walked the teacher surfaces in one direction. Both of their specs end by
 * asserting `supabase.writes` stayed empty — deliberately, and it is the honest ceiling of a stub
 * that answered every read from a frozen fixture. So everything a teacher *does* was untested:
 * entering a grade, saving a draft, publishing a mission, reverting one, curating a source,
 * creating a classroom, setting an assignment. Every one of those is a write whose result the
 * teacher then reads back off the screen, and a stub that forgets the write cannot show them that.
 *
 * The stub's tables are live now (see `helpers/supabase-stub.js`), so each test here presses the
 * button and then asks the screen — and the table — what happened.
 *
 * **The same silent-failure mode applies and is watched the same way.** `render()` catches every
 * renderer exception and swaps in "The Archive display recovered from a render issue", so a
 * `TypeError` on a teacher screen reaches nobody. Every test watches the console for the
 * `Chronicle render recovery` line the catch logs.
 *
 * It found one on its first pass, which is the defect this phase fixes: every press of **Save
 * Draft** created a *new* `custom_content_items` row. `persistAuthoringSelection()` has a branch
 * that updates the row it is already editing, and within a session that branch could not be
 * reached — `editingCustomId` is seeded once, when the editor opens, from a draft that already
 * existed, and the id of a row the save had just created was thrown away. Three presses, three
 * rows, two of them orphaned: nothing points at them and no screen offers to delete them.
 */

const STUDENT_A = "00000000-0000-4000-8000-000000000100";
const EVALUATION_ID = "00000000-0000-4000-8000-000000000200";

/** One claimed student with one submission carrying one evaluation, and no grade on it yet. */
const UNGRADED = {
  // Restated because `options.tables` replaces a table rather than appending to it, and because the
  // submissions read embeds `profiles!inner(display_name)` — a student with no row here is a
  // student whose work the teacher is never shown. See `EMBEDS` in `helpers/supabase-stub.js`.
  profiles: [
    { id: STUB_USER_ID, role: "teacher", display_name: "Stub Teacher" },
    { id: STUDENT_A, role: "student", display_name: "Ada Fields" },
  ],
  evaluations: [
    {
      id: EVALUATION_ID,
      submission_id: "00000000-0000-4000-8000-000000000300",
      feedback: {
        elements: [
          {
            element: "point_of_view",
            mirror: "The bill of lading is quoted directly.",
            gap: "Whose interest it served is not yet named.",
          },
        ],
        forward: "Name the Dutch carrying trade the Acts were written against.",
        readiness: "on_track",
      },
      model: "claude-haiku-4-5",
      created_at: "2026-03-01T00:01:00.000Z",
    },
  ],
  roster_slots: [
    {
      id: "00000000-0000-4000-8000-000000000101",
      classroom_id: STUB_CLASSROOM_ID,
      student_id_code: "S-001",
      display_name: "Ada Fields",
      status: "claimed",
      claimed_at: "2026-02-01T00:00:00.000Z",
      auth_user_id: STUDENT_A,
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
    },
  ],
  // One grade already on file, against a **different** evaluation. Nothing in the app should ever
  // show it here, and it is in the fixture for that reason: `getSubmissionWithGrades()` filters
  // `manual_grades` by `evaluation_id`, so a row that would appear anyway is a filter that is not
  // being applied — either by the app or by the stub standing in for PostgREST.
  manual_grades: [
    {
      id: "00000000-0000-4000-8000-000000000400",
      evaluation_id: "00000000-0000-4000-8000-000000000299",
      grade_label: "SOMEONE-ELSES-GRADE",
      teacher_feedback: "Entered against another student's evaluation.",
      created_at: "2026-02-01T00:00:00.000Z",
    },
  ],
};

/** The Exchange Ledger — the one mission with an editable activity that Phase 144 already walks. */
const CASE_WITH_ACTIVITY = "case-002";

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

async function signInAsTeacher(page, tables) {
  const supabase = await stubSupabase(page, tables ? { tables } : {});
  await seedProgress(page, { currentScreen: "login" });
  await loadSeededSave(page);
  await page.locator('[data-action="dev-fake-teacher"]').first().click();
  await expect(page.locator("h1")).toHaveText("Teacher Dashboard");
  return supabase;
}

const openTab = (page, label) =>
  page.locator('[data-action="select-teacher-tab"]', { hasText: label }).first().click();

/** Units tab → the unit → the mission → the wizard's preview step. */
async function openMissionPreview(page, caseId) {
  await openTab(page, "Units");
  await expect(page.locator('[data-action="toggle-manage-content-unit"]').first()).toBeVisible();
  if ((await page.locator('[data-action="open-manage-content-case"]').count()) === 0) {
    await page.locator('[data-action="toggle-manage-content-unit"]').first().click();
  }
  await page
    .locator(`[data-action="open-manage-content-case"][data-case-id="${caseId}"]`)
    .first()
    .click();
  await page.locator('[data-action="wizard-go-preview"]').first().click();
}

/** Rows of `classroom_content_selections` as `[status, altContentId]`, which is all any test wants. */
const selectionsIn = (supabase) =>
  (supabase.tables.classroom_content_selections || []).map((row) => [
    row.status,
    row.alt_content_id,
  ]);

test.describe("Teacher Dashboard — the writes", () => {
  test.use({ viewport: { width: 1366, height: 768 }, timezoneId: "UTC", locale: "en-US" });
  test.setTimeout(120_000);

  test("a grade is refused empty, saved once, and read back in words", async ({ page }) => {
    const recoveries = watchForRenderRecovery(page);
    const supabase = await signInAsTeacher(page, UNGRADED);

    await openTab(page, "Assignments");
    await page.locator('[data-action="open-grading"]').first().click();
    await expect(page.locator("h1")).toHaveText("Ada Fields");
    const main = page.locator("main");
    await expect(main, "an ungraded submission should say so").toContainText(
      "No grade entered yet."
    );
    await expect(
      main,
      "a grade entered against a different evaluation is showing on this submission"
    ).not.toContainText("SOMEONE-ELSES-GRADE");

    // --- pressing Save with the field empty --------------------------------------------------
    await page.locator('[data-action="save-manual-grade"]').click();
    await expect(
      main,
      "saving an empty grade said nothing about why nothing happened"
    ).toContainText("Enter a grade before saving.");
    expect(
      supabase.writes,
      "an empty grade reached the database — a teacher who taps Save on the wrong row would " +
        `enter a blank grade against that student's work: ${supabase.writes.join(", ")}`
    ).toEqual([]);
    await expect(page.locator("h1"), "the refusal navigated away from the submission").toHaveText(
      "Ada Fields"
    );

    // --- and with a real one -------------------------------------------------------------------
    await page.fill("#grade-label", "3/3");
    await page.fill("#grade-teacher-feedback", "Clear, and the lading bill is quoted.");
    await page.locator('[data-action="save-manual-grade"]').click();

    // The handler saves, re-reads the submission, and re-renders — so the grade appearing is the
    // whole round trip and not an optimistic redraw.
    await expect(
      main,
      "the grade a teacher just entered did not come back on the screen that entered it"
    ).toContainText("3/3");
    await expect(main).toContainText("Clear, and the lading bill is quoted.");
    await expect(main).not.toContainText("No grade entered yet.");
    // `created_at` is a column default the app renders straight back with `toLocaleString()`.
    await expect(main, "the grade's timestamp rendered as an invalid date").not.toContainText(
      "Invalid Date"
    );
    expect(
      supabase.writes.filter((write) => write.endsWith("manual_grades")),
      "one press of Save grade should write exactly one grade"
    ).toEqual(["POST manual_grades"]);
    expect(
      (supabase.tables.manual_grades || []).map((row) => row.grade_label),
      "the grade did not land in the table"
    ).toEqual(["SOMEONE-ELSES-GRADE", "3/3"]);
    await expect(
      main,
      "the other evaluation's grade appeared once this submission had one of its own"
    ).not.toContainText("SOMEONE-ELSES-GRADE");
    expect(
      await page.locator(".manual-grade-entry").count(),
      "the grading screen is showing more grades than belong to this submission"
    ).toBe(1);

    expect(
      supabase.unsupportedFilters,
      `a query asked something the stub cannot answer, so a read above may have been given too ` +
        `many rows: ${supabase.unsupportedFilters.join(", ")}`
    ).toEqual([]);
    expect(recoveries, `the grading screen threw: ${recoveries.join(" | ")}`).toEqual([]);
  });

  test("a draft saved repeatedly is one row, publishing reuses it, and Keep & Publish takes it back off", async ({
    page,
  }) => {
    const recoveries = watchForRenderRecovery(page);
    const supabase = await signInAsTeacher(page);

    await openMissionPreview(page, CASE_WITH_ACTIVITY);
    await page.locator('[data-action="wizard-go-edit"]').first().click();
    await expect(page.locator('[data-action="save-authoring-draft"]')).toBeVisible();

    // --- Save Draft, three times ----------------------------------------------------------------
    // Counted on the write log rather than on the success line, because the line reads the same
    // after the first press as after the third and cannot say which one it belongs to.
    const draftSaves = () =>
      supabase.writes.filter((write) => write.endsWith("classroom_content_selections")).length;
    for (const press of [1, 2, 3]) {
      await page.locator('[data-action="save-authoring-draft"]').first().click();
      await expect
        .poll(draftSaves, { message: `save #${press} never reached the database` })
        .toBe(press);
    }
    await expect(page.locator("main")).toContainText("Draft saved");

    expect(
      (supabase.tables.custom_content_items || []).length,
      "each press of Save Draft wrote a new custom_content_items row instead of updating the one " +
        "it had just written. Every row carries a whole authored question, nothing points at the " +
        "older ones, and no screen offers to delete them — a teacher wording a question over a " +
        "dozen saves leaves a dozen. persistAuthoringSelection() has an update branch for exactly " +
        "this; it needs the id of the row it just created."
    ).toBe(1);

    const draftRowId = supabase.tables.custom_content_items[0].id;
    expect(selectionsIn(supabase), "the draft should point at that one row").toEqual([
      ["draft", draftRowId],
    ]);
    await expect(
      page.locator("main"),
      "a saved draft is not published, and the status bar must not say it is"
    ).toContainText("Published Mission: Standard");

    // --- Publish -------------------------------------------------------------------------------
    await page.locator('[data-action="save-and-publish-authoring"]').first().click();
    await expect(page.locator("main")).toContainText("Published —");

    expect(
      (supabase.tables.custom_content_items || []).length,
      "publishing a saved draft wrote a second copy of the same authored question"
    ).toBe(1);
    expect(
      selectionsIn(supabase).filter(([status]) => status === "published"),
      "the published selection does not point at the row the teacher edited, so a student would " +
        "be served something other than what the teacher published"
    ).toEqual([["published", draftRowId]]);

    // --- and back to the standard mission --------------------------------------------------------
    // Keep & Publish is the revert: it clears the draft and publishes what is official, which
    // means removing the override rather than writing one. The wizard's own "Return to Cases" is
    // the way back — the publish step is a Manage Content screen and has no dashboard tab bar on it.
    await page.locator('[data-action="back-to-teacher-dashboard"]').first().click();
    await openMissionPreview(page, CASE_WITH_ACTIVITY);
    await page.locator('[data-action="keep-and-publish"]').first().click();
    await expect(page.locator("main")).toContainText("Published —");
    await expect
      .poll(() => selectionsIn(supabase).length, {
        message:
          "choosing Keep & Publish after publishing a custom activity left a selection row " +
          "behind, so students would keep being served the teacher's replacement after the " +
          "teacher put the standard mission back",
      })
      .toBe(0);

    expect(supabase.unsupportedFilters).toEqual([]);
    expect(recoveries, `Manage Content threw: ${recoveries.join(" | ")}`).toEqual([]);
  });

  test("a source curated into a unit's pool is still there when the pool is read again", async ({
    page,
  }) => {
    const recoveries = watchForRenderRecovery(page);
    const supabase = await signInAsTeacher(page);

    await openTab(page, "Sources");
    const unit = page.locator('[data-action="toggle-sources-unit"]').first();
    await unit.click();
    const firstSource = page.locator('[data-action="toggle-source-pool"]').first();
    await expect(firstSource).toBeVisible({ timeout: 30_000 });
    await expect(firstSource, "a source not in the pool offers to add it").toContainText("Add");

    await firstSource.click();
    await expect(
      page.locator('[data-action="toggle-source-pool"]').first(),
      "curating a source did not change the control that curates it"
    ).toContainText("Remove");
    expect(supabase.writes.filter((write) => write.endsWith("classroom_unit_source_pool"))).toEqual(
      ["POST classroom_unit_source_pool"]
    );

    // Collapsing and reopening the unit re-fetches the pool, so this is the round trip rather than
    // the optimistic update the click already made — `toggle-source-pool` writes the row and then
    // mutates its own in-memory Map, which would look identical if nothing had been stored.
    await unit.click();
    await expect(page.locator('[data-action="toggle-source-pool"]')).toHaveCount(0);
    await page.locator('[data-action="toggle-sources-unit"]').first().click();
    await expect(page.locator('[data-action="toggle-source-pool"]').first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.locator(".source-pool-row.is-selected"),
      "a curated source came back unselected, so a teacher's pool would empty itself every time " +
        "they closed the unit"
    ).toHaveCount(1);

    expect(supabase.unsupportedFilters).toEqual([]);
    expect(recoveries, `the Sources tab threw: ${recoveries.join(" | ")}`).toEqual([]);
  });

  test("a new classroom and a new assignment come back in the lists that read them", async ({
    page,
  }) => {
    const recoveries = watchForRenderRecovery(page);
    const supabase = await signInAsTeacher(page);
    const main = page.locator("main");

    await page.fill("#new-classroom-name", "APUSH Period 4");
    await page.locator('[data-action="create-classroom"]').first().click();
    await expect(
      main,
      "a classroom a teacher just created is not in the list of their classrooms"
    ).toContainText("APUSH Period 4");
    expect(
      (supabase.tables.classrooms || []).map((row) => row.name),
      "creating a classroom did not store one"
    ).toEqual(["Period 1", "APUSH Period 4"]);

    await openTab(page, "Assignments");
    await page.fill("#new-assignment-title", "Unit 2 Archive SAQ");
    await page.selectOption("#new-assignment-task-type", "saq");
    await page.fill("#new-assignment-task-id", "unit-02-archive-saq");
    await page.fill("#new-assignment-due-at", "2026-12-01");
    await page.locator('[data-action="create-assignment"]').first().click();
    await expect(
      page.locator("main"),
      "an assignment a teacher just set does not appear in the assignment list"
    ).toContainText("Unit 2 Archive SAQ");
    // A due date is an instant, not a date — `<input type="date">` is read as end-of-day local and
    // stored as an ISO string, which is the detail `0144` records. Asserted here as the thing that
    // actually matters: the day the teacher typed is the day that was stored, in this timezone.
    expect(
      (supabase.tables.assignments || []).map((row) => row.due_at),
      "the due date stored is not the end of the day the teacher chose"
    ).toEqual(["2026-12-01T23:59:59.000Z"]);

    expect(supabase.unsupportedFilters).toEqual([]);
    expect(recoveries, `a creation form threw: ${recoveries.join(" | ")}`).toEqual([]);
  });
});
