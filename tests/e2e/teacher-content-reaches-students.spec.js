import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, walkToHubTarget } from "./helpers/progress-seed.js";
import { stubSupabase } from "./helpers/supabase-stub.js";
import { stubRosterApi } from "./helpers/roster-api-stub.js";

/**
 * **The two things Teacher Mode exists to do, walked from the teacher's click to the student's screen.**
 *
 * Phase 148 built the second door and with it the ability to be two people on one machine: a teacher
 * who publishes, and then a student in that classroom who opens the thing that was published.
 * Neither of Teacher Mode's two promises had ever been checked end to end —
 *
 * 1. **the unit gate**: "Advance to the next unit" opens a period for every student in the class; and
 * 2. **content selection**: what a teacher publishes is what the student is given.
 *
 * Both hold, and that is worth a test rather than a shrug: they are the product, and until now the
 * only evidence for either was that the writes landed in a table.
 *
 * **Walking the second one found a defect in the first thing it touched.** A slot's id is the graded
 * answer key — `source.correctSlotId` names the slot a record belongs in — and it made a round trip
 * through the editor as `slugify(label)` while every authored quest writes a short id beside a long
 * label. The rebuilt id matched nothing, the `<select>` on each source row fell back to its first
 * option, and the next read of the form took that back as the teacher's own choice. **Opening Case
 * 1.02's editor and pressing Publish without touching anything filed all four records under the
 * first slot**, three of them wrong, for the whole class. See decision log `0148`; the pure round
 * trip is guarded in `tests/unit/custom-content-authoring.test.js`, and the test below is the rest
 * of the chain — the markup, the `<select>`, the DOM read-back and the publish.
 */

const COMPLETE_TUTORIAL = { step: "complete", completed: true, skipped: false };
const JOIN_CODE = "STUB01";

/** Case 1.02's authored answer key, as `content/quests/unit-01-quests.js` writes it. */
const AUTHORED_KEY = [
  ["Maize", "agriculture-diet"],
  ["Smallpox", "demographic-catastrophe"],
  ["Horses", "mobility-warfare"],
  ["Enslaved Africans", "forced-labor"],
];

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
  await page.locator('[data-action="dev-fake-teacher"]').first().click();
  await expect(page.locator("h1")).toHaveText("Teacher Dashboard");
}

async function provision(page, count) {
  await page.fill("#provision-count", String(count));
  await page.locator('[data-action="provision-roster"]').first().click();
  await expect(page.locator("main")).toContainText("Added seats");
}

async function openActivityEditor(page, caseId) {
  await page.locator('[data-action="select-teacher-tab"]', { hasText: "Units" }).first().click();
  await page.locator('[data-action="toggle-manage-content-unit"]').first().click();
  await page
    .locator(`[data-action="open-manage-content-case"][data-case-id="${caseId}"]`)
    .first()
    .click();
  await page.locator('[data-action="wizard-go-preview"]').first().click();
  await page.locator('[data-action="wizard-go-edit"]').first().click();
  await expect(page.locator('[data-action="save-authoring-draft"]')).toBeVisible();
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

/** Walk to the Navigation Table and open it, the way a player reaches it. */
async function openNavigationTable(page) {
  expect(await walkToHubTarget(page, "table"), "could not reach the Navigation Table").toBe(true);
  await page.keyboard.press("e");
  await expect(page.locator(".archive-layout")).toBeVisible({ timeout: 20_000 });
}

test.describe("What a teacher publishes is what the student is given", () => {
  test.use({ viewport: { width: 1366, height: 768 }, timezoneId: "UTC", locale: "en-US" });
  test.setTimeout(180_000);

  test("opening an activity's editor and publishing it leaves the answer key alone", async ({
    page,
  }) => {
    const recoveries = watchForRenderRecovery(page);
    const supabase = await stubSupabase(page);

    await seedProgress(page, { currentScreen: "login" });
    await loadSeededSave(page);
    await signInAsTeacher(page);
    await openActivityEditor(page, "case-002");

    // The form must already be showing the real key, because what it shows is what it saves: each
    // record's "Correct slot" select is read straight back on the next sync.
    expect(
      await page.$$eval("[data-source-slot]", (nodes) => nodes.map((n) => n.value)),
      "the editor opened with the records filed under the wrong slots. A select cannot display a " +
        "value it has no option for — it falls back to its first — so this is what the teacher is " +
        "shown and what the next save writes down."
    ).toEqual(AUTHORED_KEY.map(([, slotId]) => slotId));

    // Nothing is touched. This is a teacher looking at a mission and deciding to keep it.
    await page.locator('[data-action="save-and-publish-authoring"]').first().click();
    await expect(page.locator("main")).toContainText("Published —");

    const published = (supabase.tables.custom_content_items || [])[0]?.content;
    expect(published, "publishing stored nothing").toBeTruthy();
    expect(
      published.slots.map((slot) => slot.id),
      "the slots were republished under different ids, so every record filed under them dangles"
    ).toEqual(["agriculture-diet", "demographic-catastrophe", "mobility-warfare", "forced-labor"]);
    expect(
      published.sources.map((source) => [source.label, source.correctSlotId]),
      "a teacher who opened this mission and published it without changing anything rewrote the " +
        "answer key their class is graded against"
    ).toEqual(AUTHORED_KEY);

    expect(recoveries, `Manage Content threw: ${recoveries.join(" | ")}`).toEqual([]);
  });

  test("a teacher's published wording is the wording the student reads", async ({ page }) => {
    const recoveries = watchForRenderRecovery(page);
    const supabase = await stubSupabase(page);
    await stubRosterApi(page, supabase);

    await seedProgress(page, {
      currentScreen: "login",
      currentHubRoom: "main",
      unlocked: ["case-001", "case-002"],
      tutorial: COMPLETE_TUTORIAL,
    });
    await loadSeededSave(page);
    await signInAsTeacher(page);
    await provision(page, 1);
    await openActivityEditor(page, "case-002");

    const TEACHERS_WORDING = "Sort these the way we did on the board on Tuesday.";
    await page.locator('[data-authoring-field="prompt"]').fill(TEACHERS_WORDING);
    await page.locator('[data-action="save-and-publish-authoring"]').first().click();
    await expect(page.locator("main")).toContainText("Published —");
    await page.locator('[data-action="back-to-teacher-dashboard"]').first().click();
    await page.locator('[data-action="teacher-sign-out"]').first().click();

    // --- and now a student in that classroom -----------------------------------------------------
    await claimSeat(page, { id: "01", name: "Ada Fields", password: "chronicle1" });
    await openNavigationTable(page);
    await page.locator('[data-action="select-case"][data-case="case-002"]').first().click();
    await page.locator('[data-action="travel"][data-case="case-002"]').first().click();

    await expect(
      page.locator(".quest-prompt"),
      "the student was given the authored wording rather than their teacher's. This is the whole " +
        "of Manage Content: a published selection has to be resolved for the student who is in " +
        "that classroom, on their own machine, from their own sign-in."
    ).toContainText(TEACHERS_WORDING);

    expect(recoveries, `a screen threw: ${recoveries.join(" | ")}`).toEqual([]);
  });

  test("advancing the classroom's unit opens that period for a student in it", async ({ page }) => {
    const recoveries = watchForRenderRecovery(page);
    const supabase = await stubSupabase(page);
    await stubRosterApi(page, supabase);

    await seedProgress(page, {
      currentScreen: "login",
      currentHubRoom: "main",
      unlocked: ["case-001"],
      tutorial: COMPLETE_TUTORIAL,
    });
    await loadSeededSave(page);
    await signInAsTeacher(page);
    await provision(page, 1);

    await page.locator('[data-action="select-teacher-tab"]', { hasText: "Units" }).first().click();
    const access = page.locator(".manage-content-unit-access");
    await expect(access).toContainText("1 of 8 units open");
    await page.locator('[data-action="advance-classroom-unit"]').first().click();
    await expect(access).toContainText("2 of 8 units open");
    await page.locator('[data-action="advance-classroom-unit"]').first().click();
    await expect(
      access,
      "advancing twice did not move the classroom's floor two units"
    ).toContainText("3 of 8 units open");

    await page.locator('[data-action="teacher-sign-out"]').first().click();
    await claimSeat(page, { id: "01", name: "Ada Fields", password: "chronicle1" });
    await openNavigationTable(page);

    // The floor is a floor, never a ceiling: it unions each opened unit's first case into
    // progress.unlocked, and the period strip disables a unit with nothing unlocked in it.
    await expect
      .poll(
        () =>
          page.$$eval('[data-action="select-unit"]', (nodes) =>
            nodes.map((n) => [n.textContent.trim(), n.disabled ? "locked" : "open"])
          ),
        {
          message:
            "the periods the teacher opened are not open for a student in that classroom — the " +
            "unit gate is the one lever a teacher has over pacing, and it is applied on the " +
            "student's machine at sign-in",
        }
      )
      .toEqual([
        ["Period 1", "open"],
        ["Period 2", "open"],
        ["Period 3", "open"],
        ["Period 4", "locked"],
        ["Period 5", "locked"],
        ["Period 6", "locked"],
        ["Period 7", "locked"],
        ["Period 8", "locked"],
      ]);

    expect(recoveries, `a screen threw: ${recoveries.join(" | ")}`).toEqual([]);
  });
});
