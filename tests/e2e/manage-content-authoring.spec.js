import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave } from "./helpers/progress-seed.js";
import { stubSupabase } from "./helpers/supabase-stub.js";

/**
 * **A teacher can open a mission's activity and change its shape.**
 *
 * Phase 139 (`0137`) collapsed eighteen near-duplicate handler branches in Manage Content's
 * authoring forms into `AUTHORING_ROW_EDITS`, a table of fourteen pure row-edit functions. The
 * edits themselves got 54 unit tests and a differential against the originals — 418 cases, zero
 * differences — and the table's kind-matching got a guard derived from the markup. Its own ADR then
 * recorded what was still missing, in as many words: **"there is no e2e coverage of Manage
 * Content's authoring UI at all — the dispatch plumbing is verified by reading."**
 *
 * This is that coverage. Everything between the button and the pure function was untested: that the
 * button carries the action the table is keyed by, that `handleManageContentClick` is reached at
 * all on this screen, that `syncAuthoringFieldsFromDom()` reads the live form back before the edit
 * is applied, and that the result is re-rendered. A unit test of `addEvidenceSlot` cannot fail for
 * any of those, and the teacher only ever meets them together.
 *
 * **Why this could not be written before.** These screens need a signed-in teacher, and until now
 * the only way in was `dev-fake-teacher`, which signs into the live Supabase project — where a
 * dashboard load alone issues a `POST` to `student_world_profiles`. A suite must not write to the
 * database a real classroom is using. `helpers/supabase-stub.js` answers every Supabase call from
 * fixtures instead, so nothing leaves the machine; that file explains the shape. Everything past
 * the sign-in is the real application.
 *
 * **The route to the editor is four steps and each one is a real screen**: Units tab → expand the
 * unit → open the mission → the wizard's name step → its preview step → "Edit This Activity". Note
 * that Case 1.01 never gets there, correctly — a Map Mission is locked, and
 * `manageContentCaseScreen()` says so rather than offering an editor. Case 1.02 is the Exchange
 * Ledger, whose activity is Evidence Organizing, and it is the right one to walk: the slot removal
 * below is the single most consequential of the fourteen edits, because `0137` records that
 * removing a slot has to repoint every source filed under it — `correctSlotId` is matched by slug,
 * and an orphan matches nothing. That is one click away from a teacher and silent when it is wrong.
 */

const UNIT_ONE_CASE_WITH_ACTIVITY = "case-002";

/** Units tab → the unit → the mission → the wizard's preview step → the editor. */
async function openActivityEditor(page, caseId) {
  await page.locator('[data-action="select-teacher-tab"]', { hasText: "Units" }).first().click();
  await expect(page.locator('[data-action="toggle-manage-content-unit"]').first()).toBeVisible();

  // The unit header is a toggle, so clicking it when the unit is already open closes it again.
  if ((await page.locator('[data-action="open-manage-content-case"]').count()) === 0) {
    await page.locator('[data-action="toggle-manage-content-unit"]').first().click();
  }
  await page
    .locator(`[data-action="open-manage-content-case"][data-case-id="${caseId}"]`)
    .first()
    .click();

  // The wizard is name → preview → edit, and "Edit This Activity" lives on the preview step.
  await page.locator('[data-action="wizard-go-preview"]').first().click();
  await page.locator('[data-action="wizard-go-edit"]').first().click();
}

const countOf = (page, action) => page.locator(`[data-action="${action}"]`).count();

test.describe("Manage Content — the authoring form's row edits", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("adding and removing rows changes the form, through the real dispatch", async ({ page }) => {
    test.setTimeout(180_000);
    const supabase = await stubSupabase(page);

    await seedProgress(page, { currentScreen: "login" });
    await loadSeededSave(page);
    await page.locator('[data-action="dev-fake-teacher"]').first().click();
    await expect(page.locator("h1")).toHaveText("Teacher Dashboard");

    await openActivityEditor(page, UNIT_ONE_CASE_WITH_ACTIVITY);

    // The editor is open on a real authored activity, not an empty form.
    await expect(page.locator('[data-action="save-and-publish-authoring"]')).toBeVisible();
    const slotsAtOpen = await countOf(page, "remove-evidence-slot");
    const sourcesAtOpen = await countOf(page, "remove-evidence-source");
    expect(
      slotsAtOpen,
      "the Exchange Ledger's activity should open with its authored slots in the form"
    ).toBeGreaterThan(1);
    expect(sourcesAtOpen, "…and with its authored sources").toBeGreaterThan(1);

    // --- add a slot -------------------------------------------------------------------------
    await page.locator('[data-action="add-evidence-slot"]').first().click();
    await expect
      .poll(() => countOf(page, "remove-evidence-slot"), {
        message:
          "clicking Add slot did not add a row. Everything between the button and addEvidenceSlot() " +
          "is what this covers: the action the button carries, handleManageContentClick reaching " +
          "this screen, AUTHORING_ROW_EDITS being keyed by that action, syncAuthoringFieldsFromDom " +
          "reading the live form, and the re-render.",
      })
      .toBe(slotsAtOpen + 1);

    // --- and take it back out ------------------------------------------------------------------
    await page.locator('[data-action="remove-evidence-slot"]').last().click();
    await expect
      .poll(() => countOf(page, "remove-evidence-slot"), {
        message: "clicking Remove on a slot did not remove a row",
      })
      .toBe(slotsAtOpen);

    // --- the same for the source rows, which are a different edit on the same form -------------
    await page.locator('[data-action="add-evidence-source"]').first().click();
    await expect
      .poll(() => countOf(page, "remove-evidence-source"), {
        message: "clicking Add source did not add a row",
      })
      .toBe(sourcesAtOpen + 1);

    await page.locator('[data-action="remove-evidence-source"]').last().click();
    await expect
      .poll(() => countOf(page, "remove-evidence-source"), {
        message: "clicking Remove on a source did not remove a row",
      })
      .toBe(sourcesAtOpen);

    // Adding a slot must not disturb the source rows, and vice versa. The two edits share one form
    // and one `syncAuthoringFieldsFromDom()` read, so an edit that rebuilt the wrong half would
    // pass both counts above taken on their own.
    expect(await countOf(page, "remove-evidence-source")).toBe(sourcesAtOpen);
    expect(await countOf(page, "remove-evidence-slot")).toBe(slotsAtOpen);

    // Nothing in any of that is allowed to reach a database. `cancel-authoring` leaves the draft
    // alone; only an explicit publish writes, and this test never presses one.
    expect(
      supabase.writes.filter((w) => !w.endsWith("student_world_profiles")),
      `the authoring form wrote to Supabase without being asked to: ${supabase.writes.join(", ")}`
    ).toEqual([]);
  });

  test("a Map Mission offers no editor, and says why", async ({ page }) => {
    test.setTimeout(180_000);
    await stubSupabase(page);

    await seedProgress(page, { currentScreen: "login" });
    await loadSeededSave(page);
    await page.locator('[data-action="dev-fake-teacher"]').first().click();
    await expect(page.locator("h1")).toHaveText("Teacher Dashboard");

    await page.locator('[data-action="select-teacher-tab"]', { hasText: "Units" }).first().click();
    await page.locator('[data-action="toggle-manage-content-unit"]').first().click();
    await page
      .locator('[data-action="open-manage-content-case"][data-case-id="case-001"]')
      .first()
      .click();

    // The counter-assertion to the test above, and the reason that one names its case rather than
    // looping: Case 1.01 walks a map, so its content is fixed. If this ever grew an editor, the
    // authoring form would be offered for a mission whose questions live on the map.
    await expect(page.locator("main")).toContainText("LOCKED");
    expect(await countOf(page, "wizard-go-edit")).toBe(0);
    expect(await countOf(page, "add-evidence-slot")).toBe(0);
  });
});
