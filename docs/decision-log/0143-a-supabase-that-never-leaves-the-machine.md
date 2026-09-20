# 0143 — A Supabase that never leaves the machine

**Phase 144 · 2026-09-20 · Accepted**

Every teacher surface in Chronicle — the dashboard, the Sources tab, Manage Content — had **no e2e
coverage of any kind**, and for a structural reason rather than an oversight: reaching them means
signing into a real Supabase project.

Phase 139's own ADR recorded the consequence in as many words: _"there is no e2e coverage of Manage
Content's authoring UI at all — the dispatch plumbing is verified by reading."_ That was written
about eighteen handler branches that had just been rewritten.

This phase builds the door: `tests/e2e/helpers/supabase-stub.js`. Nothing reaches the network, and
the first spec through it exercises the plumbing `0137` could only read.

---

## 1. Why the hole was structural

The only way into a teacher screen is the `dev-fake-teacher` shortcut, and it calls
`signInWithPassword` against the live project, falling back to `signUpTeacher` if the account is
missing. Worse, **loading the dashboard writes**: among the ten requests it issues is

```text
POST /rest/v1/student_world_profiles?on_conflict=student_user_id,classroom_id,pack_id
```

A suite must not write to the database a real classroom is using, and a suite that needs the network
and a live project is not one this repo can lean on. So the screens went untested, and stayed
untested through a phase that rewrote 251 lines of one of them.

## 2. The stub, and where its edges are

`stubSupabase(page)` intercepts `**/*.supabase.co/**` and answers from fixtures. Auth returns a
session; PostgREST returns rows by table name, defaulting to `[]`.

**Auth and PostgREST are faked; nothing else is.** Everything past the doorway is the real
application — the real `main.js`, the real screens, the real handlers, the real content. A test
built on this exercises Chronicle rather than a mock of it.

**The fixtures are the emptiest thing that gets through the door**: one teacher, one classroom, and
`[]` for every other table, because a table returning nothing is a teacher's first day and a state
the screens have to handle anyway. A test needing rows names them, so what a screen depends on is
visible in the test that depends on it.

Three PostgREST details had to be right or the client throws in a way that looks nothing like its
cause: `.single()` sends `Accept: application/vnd.pgrst.object+json` and wants an object rather than
an array; a write with `Prefer: return=representation` wants its own body back; and a count wants
`content-range`.

The route pattern is the safety property. Every Supabase call matches it, so **nothing can escape to
the network** — and the helper returns its `writes` list so a spec can assert it stayed empty.

## 3. The request sequence, discovered rather than guessed

The stub was built by intercepting everything, answering `[]`, and reading what the app asked for.
Sign-in plus two empty arrays already renders "Teacher Dashboard". Adding one `profiles` row and one
`classrooms` row brings the whole dashboard up — ten requests, four tabs, a roster table.

The route to the authoring form then turned out to be four screens deep, and one step of it is a
real design rule rather than an obstacle: **Case 1.01 never reaches an editor.** A Map Mission's
content is fixed, and `manageContentCaseScreen()` says so — _"LOCKED — this mission's map, NPCs,
sources, and questions are fixed"_. The wizard is name → preview → edit, and "Edit This Activity"
only exists on the preview step.

Case 1.02, the Exchange Ledger, is the one walked. Its activity is Evidence Organizing, and it is
the right choice deliberately: `0137` records that removing an evidence slot has to repoint every
source filed under it, because `correctSlotId` is matched by slug and an orphan matches nothing.
That is one click from a teacher and silent when it is wrong.

## 4. What the spec covers that 54 unit tests do not

`manage-content-authoring.spec.js` clicks Add and Remove on both slot and source rows and asserts
the form changes, then asserts the two edits do not disturb each other — they share one form and one
`syncAuthoringFieldsFromDom()` read, so an edit that rebuilt the wrong half would pass either count
taken alone.

**Watched fail twice, and the second one is the one that matters.**

Removing `"add-evidence-slot"` from `AUTHORING_ROW_EDITS` fails this spec — but it also fails
Phase 139's derived unit guard, which reads `main.js` and requires the table to agree with the
markup. That break proves nothing new, and saying so is the point: a guard is only worth its runtime
for the failures nothing cheaper catches.

So the second break was **deleting the `render()` at the end of the row-edit branch** — the DOM is
never rebuilt, so the teacher clicks Add slot and nothing happens.

|                                    | result                                               |
| ---------------------------------- | ---------------------------------------------------- |
| `manage-content-row-edits.test.js` | **54 passed**                                        |
| `manage-content-authoring.spec.js` | **failed** — _"clicking Add slot did not add a row"_ |

That is the gap this file exists for. The pure functions were never in doubt; everything between the
button and them was, and none of it is visible to a unit test: the action the button carries,
`handleManageContentClick` being reached on this screen at all, `syncAuthoringFieldsFromDom()`
reading the live form back, and the re-render.

The second test is the counter-assertion — a Map Mission offers no editor and says why — so a future
change that handed Case 1.01 an authoring form would fail rather than quietly widen what a teacher
can edit.

Both run in **8.7 seconds**, offline.

## 5. What this does not do

It does not cover publishing, drafts, preview sessions, the Sources tab, roster provisioning or
grading. It covers one form's row edits, which is what `0137` left unverified. The door is the
reusable part; more rooms are cheap now and should be added when something in them changes, not
speculatively.

It is also not a test of Supabase, of RLS, or of the real schema. A fixture that drifts from the
live table shape will keep passing — which is the standing limitation of any stub, and is why the
schema stays verified against the real project by hand, as
`session-reports/2026-07-18-real-teacher-mode-accounts-classrooms-grading.md` already records.

---

## Verification

`npm run check` clean — 2,397 unit tests across 81 files, ESLint 0 errors and the same 5
pre-existing warnings, cspell, `validate:content` at 169 groups. `npm run build` clean. The 2 new
e2e tests pass in 8.7s with zero network requests leaving the machine. No `apps/web/src` change in
this phase, so no baseline could move and none did.
