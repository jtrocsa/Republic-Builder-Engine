# Session report — real teacher mode: accounts, classrooms, submissions, AI-backed grading

**Date:** 2026-07-18
**Phase:** 22 (see `ARCHITECTURE-QUICKREF.md`)

## Why this phase happened

Chronicle's architecture docs (`ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md`, `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §10) deliberately deferred any real accounts/classroom/database work until "a real teacher or second user needs an account" or "a real classroom pilot gets scheduled." The owner is planning to actually run this in a real classroom, which is exactly that named trigger — not a speculative architecture detour. Scope was deliberately kept to the Identity/Classroom/Submission/Evaluation/TeacherOverride slice; the game engine itself (movement, collision, camera, dialogue, map rendering) was not touched, and no `WorldComposition`/`QuestEngine`/`WorldRuntime`/`packs/<subject>/` work was started.

## What was built

### Backend (Supabase)

- `supabase/migrations/0001_init.sql` — full schema (`profiles`, `classrooms`, `roster_slots`, `student_world_profiles`, `submissions`, `evaluations`, `manual_grades`, `content_overrides`) plus RLS policies for every table, including a `is_classroom_teacher()` helper function. `submissions`/`evaluations`/`manual_grades` have no `update`/`delete` policy at all — immutability enforced at the database layer, not just convention.
- `.env.example` (repo root) — documents `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` (server-only) and `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (browser-safe, RLS-protected).

### Server (`api/`)

- `api/_lib/supabase-admin.js` — service-role client factory, used only by roster endpoints.
- `api/_lib/verify-auth.js` — validates a caller's bearer JWT via the anon client.
- `api/roster/provision.js` — teacher generates N roster slots with unique ID codes.
- `api/roster/claim.js` — student claims a slot + sets a password, gets a real Supabase Auth identity via a deterministic synthetic email (`student-<classroomId>-<code>@chronicle.invalid`).
- `api/roster/resolve-email.js` — lets a _returning_ student resolve their synthetic email from `(joinCode, studentIdCode)` alone, so they can sign back in on a different device without knowing the synthetic email. (This endpoint wasn't in the original plan text — it was a gap found during implementation: a returning student only ever knows their join code + ID, not the derived email, so sign-in was otherwise impossible on a new device.)
- `api/roster/reissue.js` — teacher resets a student's password, returns a one-time temporary password. The teacher never sees the student's real current password.

### Frontend repositories (`apps/web/src/repositories/` and `lib/`)

- `lib/supabase-client.js` — browser client, anon key. Falls back to inert placeholder credentials when env vars are unset, so `createClient()`'s synchronous throw-on-missing-URL doesn't break every test that imports `main.js`.
- `remote-auth-repository.js`, `remote-classroom-repository.js`, `remote-submission-repository.js`, `remote-progress-repository.js`, `remote-teacher-override-store.js` — thin, RLS-scoped wrappers around Supabase tables/auth.
- `progress-repository.js` — facade in front of the untouched `local-progress-repository.js`: `saveProgress` still writes to `localStorage` synchronously first, then debounce-pushes to Supabase in the background; a new `hydrateRemoteProgress()` merges a signed-in student's remote copy in via `resolveProgressConflict()` (last-write-wins by timestamp, local wins ties and when no `lastSavedAt` comparison is possible).
- `teacher-override-repository.js` — facade in front of the untouched `local-teacher-override-store.js`: delegates to the classroom-scoped remote store once a classroom is active, otherwise falls back to the local store unchanged (Author Mode keeps working exactly as before for signed-out/local dev).

### Pure logic (unit-tested)

- `engine/auth-flows.js` — synthetic-email derivation, join-code/student-ID/password validators.
- `engine/evaluator-requests.js` — builds the `api/evaluate.js` request body for a HIPP source ("initial reading") or the 3-part SAQ block (one call for all three parts, matching `SAQ_OUTPUT_SCHEMA`'s `rows` shape).
- `engine/evaluator-client.js` — thin `fetch("/api/evaluate", ...)` wrapper with typed errors.

### `main.js` (additive only)

- New screens: `join`, `login`, `teacher-dashboard`, `grading` — added to `VALID_SCREENS`, `render()`'s switch, and a new `handleAuthScreenClick`/`handleGradingScreenClick`/`handleEvaluatorClick` group each added to `CLICK_HANDLER_GROUPS`. No existing screen, handler, or the movement/collision/camera/NPC code was restructured.
- Two new `MAIN_MENU_ITEMS`: "Join a Classroom", "Teacher Sign In".
- A `?entry=join|teacher-login` query param read once at boot (after `showMainMenu`'s declaration, to avoid a temporal-dead-zone bug caught during implementation) routes straight to the right screen — the hook Odysso's real links use.
- `sourceReader()` and `reviewScreen()` each gained an "Get Archive Evaluator feedback" button + a shared `archiveFeedbackMarkup()` renderer (reused by `gradingScreen()` so a teacher sees exactly what the student saw). Existing `submit-source`/`submit-review` handlers and their unlock gates were not touched.
- `CASE_001_SOURCES`' 3 real sources gained a `hippElementsAsked` field (content-authoring judgment call, documented inline, worth a second look against exact prompt wording later).
- `chronicle-progress-store.js` gained one additive field: `lastSavedAt`, stamped on every `saveProgress()`.

### Odysso (separate repo, `OneDrive/Odysso`)

- `src/pages/SignIn.jsx` rewritten: the previous 100%-fake local-state form (explicit "no account is created" copy) is now two real external links (`Button`'s existing `href` mode) to Chronicle's `join`/`login` screens via `?entry=`, using a new `VITE_CHRONICLE_APP_URL` env var (`.env.example` added). No shared Supabase project — Odysso stays a static marketing site with no backend of its own, as its own README already stated.

## Judgment calls made (not separately confirmed beforehand)

1. **Teacher account creation is self-serve email+password**, not manually provisioned by hand via the Supabase dashboard. This is the one open item worth a sanity check before a real pilot — it's a small, reversible scope choice either way.
2. **`hippElementsAsked` tag values** for the 3 real Unit 1 sources (`taino-context` → historical_situation; `columbus-letter` → intended_audience/purpose/point_of_view; `waldseemuller-map` → historical_situation) were inferred from each source's existing `prompt` wording, not separately authored/reviewed content.
3. **Added `api/roster/resolve-email.js`**, not in the original plan text — needed for the "returning student signs in on a new device" flow to actually work, since a student only ever knows their join code + ID, never the derived synthetic email.
4. **Odysso's other `Button to="/sign-in"` call sites** (Nav, Home, Students, Teachers pages) were left pointing at Odysso's own internal `/sign-in` page (which now hosts the two real CTAs), rather than rewiring every call site to link out directly — keeps the change isolated to one file.

## Verification performed

- `npm run test`: 276/276 passing (250 pre-existing + 26 new, across 4 new test files: `auth-flows.test.js`, `evaluator-requests.test.js`, `progress-repository-conflict.test.js`, `teacher-override-repository.test.js` — the last uses `vi.mock` to fully control the remote/local store switch without touching a real backend).
- `npm run lint`: 0 errors (added an `api/**/*.js` Node-globals block to `eslint.config.js`, since `api/evaluate.js` already had this problem latent — fixed as a side effect). Only the same 3 pre-existing, unrelated warnings remain.
- `npm run validate:content`: 47/47 groups pass (the `hippElementsAsked` additions didn't require a schema change — Zod schemas here aren't `.strict()`).
- `npm run build`: succeeds for both Chronicle and Odysso.
- Live browser verification via `npm run dev` + a scripted Playwright pass: the new main-menu entries render; `?entry=join`/`?entry=teacher-login` correctly land on the `join`/`login` screens; the join screen's "First time"/"Returning" tab toggle works and swaps form fields correctly; submitting the teacher sign-in form against the placeholder Supabase URL fails as a plain, caught `TypeError: Failed to fetch` shown inline in the form (not an uncaught exception or blank screen); the untouched core game (onboarding → institute) still boots and renders with zero console errors.

## Still pending — needs a real Supabase project

No Supabase project has been created yet. Before this is genuinely usable:

1. Create a Supabase project, run `supabase/migrations/0001_init.sql`, and set all six env vars in Vercel (Production + Preview) for the Chronicle deployment, plus `VITE_CHRONICLE_APP_URL` for the Odysso deployment.
2. End-to-end verify the real round trips: teacher signup → create classroom → provision roster slots → student claim → student sign-in on a second device → progress hydration/merge → `sourceReader()`/SAQ evaluate button against the real `/api/evaluate` endpoint (success path and a forced 429/502/500) → teacher dashboard submissions list → `gradingScreen()` → manual grade save.
3. Verify RLS cross-tenant isolation with a second real teacher/classroom account — this is the highest-risk area and was only reviewed as SQL, not exercised against a live database.
4. Confirm Chronicle's real production URL and set it as Odysso's `VITE_CHRONICLE_APP_URL`.

Until those four steps happen, this phase is code-complete and unit-tested but not proven against a real backend.
