/**
 * **A Supabase that never leaves the machine.**
 *
 * Chronicle's teacher surfaces — the dashboard, the Sources tab, and Manage Content — are gated on
 * a signed-in teacher, and signing in means a real Supabase project. That is why there had been no
 * e2e coverage of any of them: the only way in was `dev-fake-teacher`, which signs into the live
 * project with a fixed account and, on a dashboard load alone, issues a `POST` to
 * `student_world_profiles`. A test suite must not write to the classroom database a real teacher is
 * using, and one that needs the network is not a test this repo can rely on.
 *
 * So every call to `*.supabase.co` is intercepted and answered from fixtures. Nothing reaches the
 * network, nothing is written anywhere, and the same run happens offline and on a plane.
 *
 * **What is faked, and what deliberately is not.** Auth and PostgREST are faked — they are the
 * doorway, not the thing under test. Everything past the doorway is the real application: the real
 * `main.js`, the real screens, the real handlers, the real content. A test built on this is
 * exercising Chronicle, not a mock of it.
 *
 * **The fixtures are the emptiest thing that gets through the door.** One teacher, one classroom,
 * and `[]` for every other table, because a table that returns nothing is the state a teacher is in
 * on their first day and the state the screens must handle. A test that needs rows adds them by
 * name through `tables`, so what a screen depends on is visible in the test that depends on it.
 *
 * PostgREST details that matter for the illusion: a `.single()` sends
 * `Accept: application/vnd.pgrst.object+json` and wants an object rather than an array, a write
 * with `Prefer: return=representation` wants its own body back, and a `HEAD` count wants
 * `content-range`. All three are handled, because the client throws on the shapes it does not
 * expect and the resulting failure looks nothing like its cause.
 *
 * ---
 *
 * **Phase 147 — a write is remembered, because a teacher's write is read back.**
 *
 * Phase 144 and 145 walked the teacher surfaces in one direction only: everything they touch is a
 * *read*. That was not a choice about coverage, it was the ceiling of a stub that answered every
 * `GET` from a frozen fixture and every write with an echo — and every consequential thing a
 * teacher does is a write whose result they then read back:
 *
 * - `recordManualGrade()` inserts, and the handler immediately re-reads the submission to show the
 *   grade it just saved. Against an echo, the teacher's own grade never appears.
 * - `createCustomContent()` inserts **without an `id`** — the column's default supplies it — and
 *   the caller uses `row.id` as the draft's target. Against an echo, that id is `undefined`.
 * - `publishCaseSelections()` reads the **draft** row back out of the table to publish it. Against
 *   an empty table that read returns nothing, so publishing takes the revert-to-official branch
 *   and silently does nothing at all.
 *
 * So the tables are live here: an insert keeps its row, a `PATCH` merges into the rows it matches,
 * a `DELETE` removes them, and a `GET` reads what is actually there. The filters are parsed rather
 * than ignored, because a `manual_grades` read filtered by `evaluation_id` that answers with every
 * grade in the classroom is a fixture pretending to be a database.
 *
 * **Three defaults are the column defaults and not conveniences.** An inserted row gets an `id`, a
 * `created_at` and an `updated_at` if it arrived without them, because the real table does and the
 * app reads all three straight back — `new Date(undefined)` renders as "Invalid Date" on the
 * grading screen, which is a defect in the stub that looks exactly like a defect in the game.
 *
 * **What it still is not.** It is not Postgres. It understands `eq` and `in` and nothing else, it
 * does not enforce RLS, uniqueness, foreign keys or types, and a fixture whose shape has drifted
 * from the live table will keep passing. `unsupportedFilters` is returned so a spec can see when a
 * query asked something this cannot answer, rather than being quietly given too many rows.
 */

export const STUB_USER_ID = "00000000-0000-4000-8000-000000000001";
export const STUB_CLASSROOM_ID = "00000000-0000-4000-8000-000000000010";

const STUB_USER = {
  id: STUB_USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "stub-teacher@example.test",
  email_confirmed_at: "2026-01-01T00:00:00.000Z",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: { display_name: "Stub Teacher" },
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const session = () => ({
  access_token: "stub-access-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: "stub-refresh-token",
  user: STUB_USER,
});

const DEFAULT_TABLES = {
  profiles: [{ id: STUB_USER_ID, role: "teacher", display_name: "Stub Teacher" }],
  classrooms: [
    {
      id: STUB_CLASSROOM_ID,
      teacher_id: STUB_USER_ID,
      name: "Period 1",
      join_code: "STUB01",
      school_name: "Stub High School",
      created_at: "2026-01-01T00:00:00.000Z",
    },
  ],
};

/** Query parameters PostgREST reads as instructions rather than as column filters. */
const NON_FILTER_PARAMS = new Set(["select", "order", "limit", "offset", "on_conflict", "columns"]);

/** `in.(a,b,"c d")` → the set {a, b, c d}. */
function parseInList(raw) {
  return new Set(
    raw
      .replace(/^\(/, "")
      .replace(/\)$/, "")
      .split(",")
      .map((value) => value.trim().replace(/^"(.*)"$/, "$1"))
      .filter((value) => value.length > 0)
  );
}

/**
 * The row filter this URL asks for, plus anything it asked that this cannot answer.
 *
 * An operator that is not understood is **reported rather than skipped**. Skipping it silently
 * widens the query — a read filtered to one student's grades would answer with the whole class's —
 * and a stub that answers a question it did not understand is worse than one that says so.
 */
function filterFor(url) {
  const tests = [];
  const unsupported = [];
  for (const [column, raw] of url.searchParams) {
    if (NON_FILTER_PARAMS.has(column)) continue;
    if (raw.startsWith("eq.")) {
      const wanted = raw.slice(3);
      tests.push((row) => String(row[column] ?? "") === wanted);
    } else if (raw.startsWith("in.")) {
      const wanted = parseInList(raw.slice(3));
      tests.push((row) => wanted.has(String(row[column] ?? "")));
    } else if (raw === "is.null") {
      tests.push((row) => row[column] === null || row[column] === undefined);
    } else {
      unsupported.push(`${column}=${raw}`);
    }
  }
  return { match: (row) => tests.every((test) => test(row)), unsupported };
}

/** `order=created_at.desc` — applied in place, because the app shows a grade history newest first. */
function applyOrder(rows, url) {
  const order = url.searchParams.get("order");
  if (!order) return rows;
  const [column, direction = "asc"] = order.split(".");
  const sign = direction.startsWith("desc") ? -1 : 1;
  return [...rows].sort((a, b) => {
    const left = a[column];
    const right = b[column];
    if (left === right) return 0;
    return (left > right ? 1 : -1) * sign;
  });
}

let generatedRows = 0;
/** Deterministic across a run, so a failure names the same row twice. */
const generatedId = () => `00000000-0000-4000-8000-9${String(++generatedRows).padStart(11, "0")}`;

/**
 * Intercept every Supabase call on this page and answer it from live in-memory tables.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ tables?: Record<string, unknown[]> }} [options] extra or replacement table fixtures,
 *   merged over the defaults by table name. Deep-copied, so a spec's module-level fixture is not
 *   mutated by the run and two tests in one file start from the same state.
 * @returns {Promise<{
 *   requests: string[],
 *   writes: string[],
 *   tables: Record<string, any[]>,
 *   unsupportedFilters: string[],
 * }>} live values, appended to as the page runs — `writes` is every mutating call, which a test can
 *   assert stayed empty, and `tables` is what the page left behind.
 */
export async function stubSupabase(page, options = {}) {
  const merged = { ...DEFAULT_TABLES, ...(options.tables || {}) };
  /** @type {Record<string, any[]>} */
  const tables = JSON.parse(JSON.stringify(merged));
  const requests = [];
  const writes = [];
  const unsupportedFilters = [];

  const rowsOf = (table) => (tables[table] ||= []);

  await page.route("**/*.supabase.co/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;
    requests.push(`${method} ${path}`);

    const json = (body, extraHeaders = {}) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: extraHeaders,
        body: JSON.stringify(body),
      });

    // --- auth ---------------------------------------------------------------------------------
    if (path.startsWith("/auth/v1/token")) return json(session());
    if (path.startsWith("/auth/v1/user")) return json(STUB_USER);
    if (path.startsWith("/auth/v1/signup")) return json({ ...session(), id: STUB_USER_ID });
    if (path.startsWith("/auth/v1/logout")) return route.fulfill({ status: 204, body: "" });

    // --- PostgREST ----------------------------------------------------------------------------
    const table = path.replace("/rest/v1/", "").split("?")[0];
    const rows = rowsOf(table);
    const { match, unsupported } = filterFor(url);
    for (const clause of unsupported) unsupportedFilters.push(`${method} ${table}?${clause}`);
    const wantsObject = (request.headers()["accept"] || "").includes("vnd.pgrst.object");

    const answer = (returned) =>
      json(wantsObject ? (returned[0] ?? null) : returned, {
        "content-range": `0-${Math.max(returned.length - 1, 0)}/${returned.length}`,
      });

    if (method === "GET" || method === "HEAD") {
      return answer(applyOrder(rows.filter(match), url));
    }

    writes.push(`${method} ${table}`);

    let sent = [];
    try {
      const body = request.postData();
      if (body) {
        const parsed = JSON.parse(body);
        sent = Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch {
      sent = [];
    }

    if (method === "DELETE") {
      const removed = rows.filter(match);
      tables[table] = rows.filter((row) => !match(row));
      return answer(removed);
    }

    if (method === "PATCH") {
      const patch = sent[0] || {};
      const changed = [];
      for (const row of rows) {
        if (!match(row)) continue;
        Object.assign(row, patch);
        changed.push(row);
      }
      return answer(changed);
    }

    // POST — an insert, or an upsert when the client named a conflict target. The real table
    // supplies `id`/`created_at`/`updated_at` from its column defaults and the app reads all three
    // straight back, so a row that arrives without them gets them here for the same reason.
    const conflictColumns = (url.searchParams.get("on_conflict") || "")
      .split(",")
      .map((column) => column.trim())
      .filter(Boolean);
    const now = new Date().toISOString();
    const stored = [];
    for (const incoming of sent) {
      const row = {
        id: generatedId(),
        created_at: now,
        updated_at: now,
        ...incoming,
      };
      const existing = conflictColumns.length
        ? rows.find((candidate) =>
            conflictColumns.every(
              (column) => String(candidate[column] ?? "") === String(row[column] ?? "")
            )
          )
        : null;
      if (existing) {
        Object.assign(existing, incoming, { updated_at: row.updated_at });
        stored.push(existing);
      } else {
        rows.push(row);
        stored.push(row);
      }
    }
    return answer(stored);
  });

  return { requests, writes, tables, unsupportedFilters };
}
