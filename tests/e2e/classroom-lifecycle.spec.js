import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave } from "./helpers/progress-seed.js";
import { stubSupabase } from "./helpers/supabase-stub.js";
import { stubRosterApi } from "./helpers/roster-api-stub.js";

/**
 * **A classroom, from empty roster to a student signing back in — and whose save is on the machine.**
 *
 * `0146` §5 left two things not walked and said why: roster provisioning and password reissue go
 * through `/api/roster/*`, the repo's own serverless functions, not through Supabase at all. That
 * door is `helpers/roster-api-stub.js`, and it opens more than those two — **the student join flow
 * had never been walked either**, and it is the first screen a real student ever meets. If it is
 * broken, nobody gets in.
 *
 * So this is one story rather than four tests, because it is one story: the teacher provisions
 * seats, leaves, a student claims one, a second student sits down at the same Chromebook, and the
 * first one comes back the next day and signs in.
 *
 * **It found the worst defect in the program so far, and the sequence above is what it takes.**
 * A save had no owner. `resolveProgressConflict()` compared two timestamps, and on a machine that
 * rotates between students every period the newest save is reliably the one the *last* student
 * left — so it won. Measured, before the fix:
 *
 * - the save on the machine was pushed into **two different students' cloud rows**; and
 * - a returning student signed in with their own correct password and their **three completed
 *   cases were replaced by their classmate's one**, in their own row.
 *
 * Nothing in the game said so. There is no sign-out for a student and no indication of whose
 * account they are in — see `0147` §5, which puts both to the owner rather than inventing them.
 *
 * The fix is `progress.ownerUserId`, stamped on every sign-in, asked before the timestamps and
 * never as a tiebreaker; plus the push guard that stops a save being written to the row of a
 * student it does not belong to. This spec is the reproduction, kept.
 */

const KEY = "republic-builder.chronicle.unit-01.v2";
const JOIN_CODE = "STUB01";

/** What the previous student left on this Chromebook — one case done. */
const MACHINE_SAVE = ["case-001"];
/** What Bede did at home yesterday, on his own machine, which lives only in his cloud row. */
const BEDE_AT_HOME = ["case-001", "case-002", "case-003"];

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

const localSave = (page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), KEY);

const profilesIn = (supabase) =>
  (supabase.tables.student_world_profiles || []).map((row) => [
    row.student_user_id,
    row.progress?.completedCases ?? null,
  ]);

/** Menu → Student → Join a Classroom, on whichever tab. */
async function openJoinScreen(page, tab) {
  await page.locator('[data-action="open-main-menu"]').first().click();
  await page.locator('[data-action="landing-student"]').first().click();
  await page.locator('[data-action="open-join-screen"]').first().click();
  await page.locator(`[data-action="student-tab-${tab}"]`).first().click();
  await expect(page.locator("h1")).toHaveText("Join a Classroom");
}

test.describe("A classroom, end to end", () => {
  test.use({ viewport: { width: 1366, height: 768 }, timezoneId: "UTC", locale: "en-US" });
  test.setTimeout(180_000);

  test("seats are provisioned, claimed, and a returning student gets their own save back", async ({
    page,
  }) => {
    const recoveries = watchForRenderRecovery(page);
    const supabase = await stubSupabase(page);
    const roster = await stubRosterApi(page, supabase);

    // The machine already has a save on it, which is the ordinary state of a cart Chromebook.
    await seedProgress(page, { currentScreen: "login", completedCases: MACHINE_SAVE });
    await loadSeededSave(page);
    await page.locator('[data-action="dev-fake-teacher"]').first().click();
    await expect(page.locator("h1")).toHaveText("Teacher Dashboard");
    const main = page.locator("main");

    // --- the teacher provisions two seats --------------------------------------------------------
    await page.fill("#provision-count", "2");
    await page.locator('[data-action="provision-roster"]').first().click();
    await expect(
      main,
      "provisioning reported nothing back, so a teacher cannot tell which seats to hand out"
    ).toContainText("Added seats");
    expect(
      roster.calls,
      "provisioning did not reach /api/roster/provision — this is the serverless half, and it is " +
        "the half a Supabase stub cannot see"
    ).toEqual(["provision"]);
    expect(
      (supabase.tables.roster_slots || []).map((slot) => [slot.student_id_code, slot.status]),
      "the seats were not created, or were not numbered from the top of the existing roster"
    ).toEqual([
      ["01", "unclaimed"],
      ["02", "unclaimed"],
    ]);
    for (const code of ["01", "02"]) {
      await expect(
        main,
        `seat ${code} is not on the roster the teacher is looking at`
      ).toContainText(code);
    }

    await page.locator('[data-action="teacher-sign-out"]').first().click();

    // --- Bede claims seat 02 ---------------------------------------------------------------------
    await openJoinScreen(page, "claim");
    await page.fill("#join-classroom-code", JOIN_CODE);
    await page.fill("#join-student-id", "02");
    await page.fill("#join-display-name", "Bede Marsh");
    await page.fill("#join-password", "chronicle2");
    await page.locator('[data-action="submit-join-claim"]').first().click();
    await expect(
      page.locator("h1"),
      "claiming a seat did not put the student in the game — this is the first screen a real " +
        "student ever reaches and nothing else in the suite walks it"
    ).toHaveText("Institute Archive");

    const bede = (supabase.tables.roster_slots || []).find((slot) => slot.student_id_code === "02");
    expect(bede.status, "the claimed seat is still unclaimed on the teacher's roster").toBe(
      "claimed"
    );
    expect(bede.auth_user_id, "the claimed seat has no account attached to it").toBeTruthy();
    // The save that was on the machine is unowned, so absorbing it is correct and deliberate —
    // it is the only way progress made before signing in ever reaches an account.
    await expect
      .poll(() => profilesIn(supabase), { message: "the claimed student's progress never synced" })
      .toEqual([[bede.auth_user_id, MACHINE_SAVE]]);

    // Bede did more work at home, on another machine. That lives in his row and nowhere else.
    supabase.tables.student_world_profiles[0].progress = {
      ...supabase.tables.student_world_profiles[0].progress,
      completedCases: BEDE_AT_HOME,
      lastSavedAt: Date.parse("2026-09-19T18:00:00.000Z"),
    };
    supabase.tables.student_world_profiles[0].updated_at = "2026-09-19T18:00:00.000Z";

    // --- Ada sits down at the same Chromebook and claims seat 01 ---------------------------------
    await openJoinScreen(page, "claim");
    await page.fill("#join-classroom-code", JOIN_CODE);
    await page.fill("#join-student-id", "01");
    await page.fill("#join-display-name", "Ada Fields");
    await page.fill("#join-password", "chronicle1");
    await page.locator('[data-action="submit-join-claim"]').first().click();
    await expect(page.locator("h1")).toHaveText("Institute Archive");

    await expect
      .poll(async () => (await localSave(page))?.completedCases, {
        message:
          "a student signing in on the Chromebook a classmate used last period was handed that " +
          "classmate's game. A save is compared to the cloud copy by timestamp, and the save " +
          "sitting on a shared machine is reliably the newer one — so ownership has to be asked " +
          "first, and it is not a tiebreaker.",
      })
      .toEqual([]);

    const ada = (supabase.tables.roster_slots || []).find((slot) => slot.student_id_code === "01");
    // Ada has not played yet, so she has nothing to sync — and above all Bede's row must not have
    // moved. Before the push guard, her sign-in wrote the machine's save into her row *and* the
    // one that followed wrote into his.
    await expect
      .poll(() => profilesIn(supabase), {
        message:
          "signing in wrote a save into a row it does not belong to. The handler that sets the " +
          "screen and saves runs before hydration has decided whose machine this is, so the " +
          "write it makes carries the previous student's game.",
      })
      .toEqual([[bede.auth_user_id, BEDE_AT_HOME]]);
    expect(ada.auth_user_id, "the second seat was not claimed").toBeTruthy();
    expect(ada.auth_user_id, "both students were given the same account").not.toBe(
      bede.auth_user_id
    );

    // --- Bede comes back the next day, to the same machine ----------------------------------------
    await openJoinScreen(page, "signin");
    await page.fill("#join-classroom-code", JOIN_CODE);
    await page.fill("#join-student-id", "02");
    await page.fill("#join-password", "WRONG-PASSWORD");
    await page.locator('[data-action="submit-join-signin"]').first().click();
    await expect(
      page.locator("main"),
      "a wrong password was accepted, or was refused without saying so"
    ).toContainText("Invalid login credentials");
    // The form is uncontrolled and read at submit time, so the `render()` that drew that refusal
    // used to empty it — a student who mistyped their password had to re-enter the classroom code
    // and the student ID they had just been handed on a slip of paper.
    await expect(
      page.locator("#join-classroom-code"),
      "a refused sign-in cleared the classroom code along with the password"
    ).toHaveValue(JOIN_CODE);
    await expect(
      page.locator("#join-student-id"),
      "a refused sign-in cleared the student ID along with the password"
    ).toHaveValue("02");

    await page.fill("#join-password", "chronicle2");
    await page.locator('[data-action="submit-join-signin"]').first().click();
    await expect(page.locator("h1")).toHaveText("Institute Archive");

    await expect
      .poll(async () => (await localSave(page))?.completedCases, {
        message:
          "a returning student signed in with their own password and did not get their own game " +
          "back — they were given whatever the last person to use this machine left",
      })
      .toEqual(BEDE_AT_HOME);
    await expect
      .poll(() => profilesIn(supabase), {
        message:
          "the returning student's cloud row was overwritten by the save sitting on this machine. " +
          "This is the destructive direction: their work is gone from the one copy that follows " +
          "them to another device.",
      })
      .toEqual([[bede.auth_user_id, BEDE_AT_HOME]]);

    expect(supabase.unsupportedFilters).toEqual([]);
    expect(recoveries, `a screen threw during the lifecycle: ${recoveries.join(" | ")}`).toEqual(
      []
    );
  });

  test("a teacher can reissue a student's password, and the student signs in with it", async ({
    page,
  }) => {
    const recoveries = watchForRenderRecovery(page);
    const supabase = await stubSupabase(page);
    const roster = await stubRosterApi(page, supabase);

    await seedProgress(page, { currentScreen: "login" });
    await loadSeededSave(page);
    await page.locator('[data-action="dev-fake-teacher"]').first().click();
    await expect(page.locator("h1")).toHaveText("Teacher Dashboard");

    await page.fill("#provision-count", "1");
    await page.locator('[data-action="provision-roster"]').first().click();
    await expect(page.locator("main")).toContainText("Added seats");
    await page.locator('[data-action="teacher-sign-out"]').first().click();

    await openJoinScreen(page, "claim");
    await page.fill("#join-classroom-code", JOIN_CODE);
    await page.fill("#join-student-id", "01");
    await page.fill("#join-display-name", "Ada Fields");
    await page.fill("#join-password", "chronicle1");
    await page.locator('[data-action="submit-join-claim"]').first().click();
    await expect(page.locator("h1")).toHaveText("Institute Archive");

    // --- the teacher resets it -------------------------------------------------------------------
    await page.locator('[data-action="open-main-menu"]').first().click();
    await page.locator('[data-action="open-teacher-login"]').first().click();
    await page.locator('[data-action="dev-fake-teacher"]').first().click();
    await expect(page.locator("h1")).toHaveText("Teacher Dashboard");
    await expect(
      page.locator("main"),
      "the roster does not show the name the student chose when they claimed their seat"
    ).toContainText("Ada Fields");

    await page.locator('[data-action="reset-student-password"]').first().click();
    await expect(
      page.locator("main"),
      "resetting a password showed the teacher nothing — the password is generated once and never " +
        "stored, so a teacher who does not see it here cannot hand it to the student at all"
    ).toContainText("Temporary password");
    expect(roster.calls).toContain("reissue");
    expect(roster.issuedPasswords, "no password was issued").toHaveLength(1);
    const temporary = roster.issuedPasswords[0];
    await expect(page.locator("main")).toContainText(temporary);

    // --- and the student signs in with it ---------------------------------------------------------
    await page.locator('[data-action="teacher-sign-out"]').first().click();
    await openJoinScreen(page, "signin");
    await page.fill("#join-classroom-code", JOIN_CODE);
    await page.fill("#join-student-id", "01");
    await page.fill("#join-password", "chronicle1");
    await page.locator('[data-action="submit-join-signin"]').first().click();
    await expect(
      page.locator("main"),
      "the old password still works after a reset, so a reissue does not actually lock anyone out"
    ).toContainText("Invalid login credentials");

    await page.fill("#join-classroom-code", JOIN_CODE);
    await page.fill("#join-student-id", "01");
    await page.fill("#join-password", temporary);
    await page.locator('[data-action="submit-join-signin"]').first().click();
    await expect(
      page.locator("h1"),
      "the temporary password the teacher was told to hand over does not sign the student in"
    ).toHaveText("Institute Archive");

    expect(recoveries, `a screen threw: ${recoveries.join(" | ")}`).toEqual([]);
  });
});
