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

/**
 * Intercept every Supabase call on this page and answer it from fixtures.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ tables?: Record<string, unknown[]> }} [options] extra or replacement table fixtures,
 *   merged over the defaults by table name.
 * @returns {Promise<{ requests: string[], writes: string[] }>} live arrays, appended to as the
 *   page runs — `writes` is every mutating call, which a test can assert stayed empty.
 */
export async function stubSupabase(page, options = {}) {
  const tables = { ...DEFAULT_TABLES, ...(options.tables || {}) };
  const requests = [];
  const writes = [];

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
    const rows = tables[table] ?? [];
    const wantsObject = (request.headers()["accept"] || "").includes("vnd.pgrst.object");

    if (method !== "GET" && method !== "HEAD") {
      writes.push(`${method} ${table}`);
      // A write with `Prefer: return=representation` is handed its own body back, which is what
      // the client does with an upsert it then reads fields off.
      let echoed = [];
      try {
        const body = request.postData();
        if (body) {
          const parsed = JSON.parse(body);
          echoed = Array.isArray(parsed) ? parsed : [parsed];
        }
      } catch {
        echoed = [];
      }
      return json(wantsObject ? (echoed[0] ?? null) : echoed, {
        "content-range": `0-${Math.max(echoed.length - 1, 0)}/${echoed.length}`,
      });
    }

    return json(wantsObject ? (rows[0] ?? null) : rows, {
      "content-range": `0-${Math.max(rows.length - 1, 0)}/${rows.length}`,
    });
  });

  return { requests, writes };
}
