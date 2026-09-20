/**
 * **The other door: `/api/roster/*`, which is not Supabase at all.**
 *
 * Four of Chronicle's writes do not go through PostgREST. Provisioning seats, claiming one, looking
 * up a returning student's login and reissuing a password are the repo's own serverless functions
 * under `api/roster/`, and they hold the **service-role** key — because each of them does something
 * the browser must never be able to do directly: mint roster slot ids, create an auth identity, read
 * a classroom anonymously, set somebody else's password.
 *
 * Under `npm run dev` those paths do not exist. Vite serves `apps/web`, not `api/`, so every one of
 * these calls 404s and the screen reports "Could not add roster slots." That is why
 * `supabase-stub.js` — which intercepts `*.supabase.co` and nothing else — could not reach them, and
 * why `0146` §5 called this a second door rather than a wider one.
 *
 * **What is under test here is the client half.** The form validation, the handler, the state the
 * app moves to, and what the next screen reads back. The endpoint bodies are not: they run on
 * Vercel, against a real Postgres with real constraints, and a fixture cannot vouch for them. What
 * this file owes them is their **contract** — the status codes and payload shapes the client
 * branches on — and their **rules**, because the rules are what make the client's failure branches
 * reachable at all. A seat that is already claimed must be refused, or "Invalid join code or
 * student ID." is a string no test can ever see.
 *
 * So the branch structure below mirrors the four handlers deliberately, including the one security
 * property worth stating twice: **claim and resolve-email answer every mismatch identically.** A
 * wrong join code and a wrong student ID give the same message, so neither can be enumerated.
 *
 * It writes into the same tables `stubSupabase()` is serving, so what a student does arrives on the
 * teacher's roster the way it does in production — one shared store, two actors.
 */

import { generatedId, stubAuthUser, STUB_USER_ID } from "./supabase-stub.js";

/**
 * The synthetic login a Chronicle student gets, since students have no email address on file.
 *
 * Deliberately duplicated in three places already — `engine/auth-flows.js`, `api/roster/claim.js`
 * and `api/roster/resolve-email.js` — because a Vercel function shares no bundle with the Vite
 * client. This is the fourth copy, and it has to stay the fourth copy for the same reason.
 */
const deriveStudentLoginEmail = (classroomId, studentIdCode) =>
  `student-${classroomId}-${studentIdCode}@chronicle.invalid`;

const TEMP_PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Ten characters from the endpoint's own ambiguity-free alphabet — no 0/O/1/I. */
function generateTempPassword() {
  let out = "";
  for (let i = 0; i < 10; i += 1) {
    out += TEMP_PASSWORD_ALPHABET[Math.floor(Math.random() * TEMP_PASSWORD_ALPHABET.length)];
  }
  return out;
}

/**
 * Answer `/api/roster/*` from the same tables the Supabase stub is serving.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{tables: Record<string, any[]>, accounts: Map<string, any>}} supabase the handle
 *   `stubSupabase()` returned for this page. Both halves are shared on purpose: a claimed seat has
 *   to show up on the teacher's roster, and the identity it creates has to be one the sign-in can
 *   check a password against.
 * @param {{teacherUserId?: string}} [options] whose classrooms the two teacher-only endpoints will
 *   act on; anything else gets the endpoints' own 403. Defaults to the stub teacher.
 * @returns {Promise<{calls: string[], issuedPasswords: string[]}>} live values — `calls` is every
 *   endpoint reached, and `issuedPasswords` is every temporary password handed out, which a test
 *   needs because the screen shows each one exactly once.
 */
export async function stubRosterApi(page, supabase, options = {}) {
  const { tables, accounts } = supabase;
  // Both teacher-only endpoints verify ownership before they write, and so does this — a 403 the
  // client can never provoke is a branch that may as well not exist. `verifyAuth(req)` reads the
  // bearer token; there is only one teacher here, so it is compared by id.
  const teacherUserId = options.teacherUserId ?? STUB_USER_ID;
  const calls = [];
  const issuedPasswords = [];

  const rowsOf = (table) => (tables[table] ||= []);
  const classroomByCode = (code) =>
    rowsOf("classrooms").find((row) => row.join_code === String(code).trim());
  const ownedBy = (classroom) => classroom.teacher_id === teacherUserId;

  await page.route("**/api/roster/*", async (route) => {
    const request = route.request();
    const endpoint = new URL(request.url()).pathname.split("/").pop();
    calls.push(endpoint);

    let body = {};
    try {
      body = JSON.parse(request.postData() || "{}");
    } catch {
      body = {};
    }

    const json = (status, payload) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(payload),
      });

    // Both student-facing endpoints answer every mismatch with one string, so that neither a join
    // code nor a student ID can be enumerated by the shape of the refusal.
    const NO_MATCH = { error: "Invalid join code or student ID." };

    if (endpoint === "provision") {
      const classroom = rowsOf("classrooms").find((row) => row.id === body.classroomId);
      if (!classroom || !ownedBy(classroom)) {
        return json(403, { error: "You do not own this classroom." });
      }
      const names = Array.isArray(body.names)
        ? body.names.filter((name) => typeof name === "string")
        : null;
      const count = names ? names.length : Number(body.count);
      if (!Number.isInteger(count) || count < 1 || count > 200) {
        return json(400, { error: "count must be an integer between 1 and 200." });
      }
      // Codes continue from the highest already on the roster, so provisioning twice does not
      // reissue 01 — which is the endpoint's own rule and the reason it reads the table first.
      const used = rowsOf("roster_slots")
        .filter((row) => row.classroom_id === classroom.id)
        .map((row) => Number(row.student_id_code))
        .filter((value) => Number.isInteger(value));
      let next = used.length ? Math.max(...used) + 1 : 1;
      const slots = [];
      for (let i = 0; i < count; i += 1) {
        const slot = {
          id: generatedId(),
          classroom_id: classroom.id,
          student_id_code: String(next).padStart(2, "0"),
          display_name: names ? names[i] : null,
          status: "unclaimed",
          claimed_at: null,
          auth_user_id: null,
        };
        rowsOf("roster_slots").push(slot);
        slots.push(slot);
        next += 1;
      }
      return json(200, { slots });
    }

    if (endpoint === "claim") {
      const joinCode = typeof body.joinCode === "string" ? body.joinCode.trim() : "";
      const studentIdCode = typeof body.studentIdCode === "string" ? body.studentIdCode.trim() : "";
      if (!joinCode || !studentIdCode) return json(400, NO_MATCH);
      if (typeof body.password !== "string" || body.password.length < 8) {
        return json(400, { error: "Password must be at least 8 characters." });
      }
      const classroom = classroomByCode(joinCode);
      if (!classroom) return json(400, NO_MATCH);
      const slot = rowsOf("roster_slots").find(
        (row) => row.classroom_id === classroom.id && row.student_id_code === studentIdCode
      );
      if (!slot || slot.status !== "unclaimed") return json(400, NO_MATCH);

      const email = deriveStudentLoginEmail(classroom.id, studentIdCode);
      const displayName =
        typeof body.displayName === "string" && body.displayName.trim()
          ? body.displayName.trim()
          : `Chronicler ${studentIdCode}`;
      const userId = generatedId();
      accounts.set(email.toLowerCase(), {
        password: body.password,
        user: stubAuthUser({ id: userId, email, role: "student", displayName }),
      });
      // The `profiles` row is the on_auth_user_created trigger's work (migration 0003), not the
      // endpoint's — but it exists by the time the client reads it, so it exists here too.
      rowsOf("profiles").push({ id: userId, role: "student", display_name: displayName });
      Object.assign(slot, {
        status: "claimed",
        auth_user_id: userId,
        claimed_at: new Date().toISOString(),
      });
      return json(200, { email });
    }

    if (endpoint === "resolve-email") {
      const joinCode = typeof body.joinCode === "string" ? body.joinCode.trim() : "";
      const studentIdCode = typeof body.studentIdCode === "string" ? body.studentIdCode.trim() : "";
      if (!joinCode || !studentIdCode) return json(400, NO_MATCH);
      const classroom = classroomByCode(joinCode);
      if (!classroom) return json(400, NO_MATCH);
      const slot = rowsOf("roster_slots").find(
        (row) => row.classroom_id === classroom.id && row.student_id_code === studentIdCode
      );
      if (!slot || slot.status !== "claimed") return json(400, NO_MATCH);
      return json(200, { email: deriveStudentLoginEmail(classroom.id, studentIdCode) });
    }

    if (endpoint === "reissue") {
      const slot = rowsOf("roster_slots").find((row) => row.id === body.rosterSlotId);
      const classroom = slot
        ? rowsOf("classrooms").find((row) => row.id === slot.classroom_id)
        : null;
      if (!slot || !classroom || !ownedBy(classroom)) {
        return json(403, { error: "You do not own this roster slot." });
      }
      if (slot.status !== "claimed" || !slot.auth_user_id) {
        return json(400, { error: "This seat has not been claimed yet." });
      }
      const temporaryPassword = generateTempPassword();
      const email = deriveStudentLoginEmail(classroom.id, slot.student_id_code).toLowerCase();
      const account = accounts.get(email);
      if (account) account.password = temporaryPassword;
      issuedPasswords.push(temporaryPassword);
      return json(200, { temporaryPassword });
    }

    return json(404, { error: `No stub for /api/roster/${endpoint}` });
  });

  return { calls, issuedPasswords };
}
