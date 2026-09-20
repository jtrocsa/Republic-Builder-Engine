# 0144 — The list spoke in database

**Phase 145 · 2026-09-20 · Accepted**

Phase 144 built a door into the teacher surfaces and walked one room through it. This phase walks
the rest of them, and the first walk found a defect that had been in front of every teacher who has
ever opened the dashboard.

The Teacher Dashboard's Submissions table has a **Readiness** column. It rendered the evaluator's
verdict raw:

```js
<td>${esc(sub.readiness || "—")}</td>
```

So a teacher scanning a class read `needs_fresh_attempt`. Clicking **Review →** on that same row
opened the grading screen, which renders the same value through `READINESS_LABELS` and says **"Try a
fresh attempt"**. The same verdict about the same submission, two clicks apart, one of them in
database.

---

## 1. Why it survived

The three values are not ours. `api/_lib/rubrics.js` declares them inside the JSON schema it hands
the model:

```js
const READINESS = { type: "string", enum: ["ready_to_revise", "on_track", "needs_fresh_attempt"] };
```

They are written for a schema, not for a reader, and `READINESS_LABELS` exists precisely to
translate them — but it lived 7,400 lines away from the column, next to the one function that
already used it. Whoever wrote the column had the value in hand and no reason to suspect a table
existed.

**The roster's STATUS column beside it had exactly this defect and was fixed.** `main.js` still
carries the comment: _"Human-readable labels for the raw `roster_slots.status` enum — was rendered
verbatim ("claimed"/"unclaimed"/"disabled") straight from the database."_ The Readiness column is
that fix's untouched twin, one table to the right on the same screen.

And nothing could see it. There was no e2e coverage of any teacher surface before Phase 144, and a
unit test of a template literal is not a thing this repo writes. The only reader was a teacher in
production.

## 2. The fix is a function, because the value is shown in two places

`readinessLabel()` now sits beside the table and both sites call it — the dashboard column and
`archiveFeedbackMarkup()`, which is itself shared by `sourceReader()`, `reviewScreen()` and
`gradingScreen()`. That is the repo's own shape for this: **when a thing is shown in two forms, the
decision lives in one function both call**, the same argument as `nearestInReach()` and
`openFieldRecord()`.

It falls through to the raw value rather than to an empty cell, because an unlabelled verdict is
worse than an ugly one — and §3 is what stops the fall-through ever being reached.

## 3. Two guards, asking different questions

**`tests/unit/readiness-label.test.js`** holds the two declarations together. It imports `RUBRICS`
from `api/_lib/rubrics.js` — reachable rather than parsed, since each rubric carries its own
`outputSchema` — collects every `readiness` enum value across all four, and requires a label for
each. This is the repo's "written twice, both copies now have a reader" shape, and it catches the
failure no fixture would: a **fourth** verdict added to the schema, which would reach a teacher as a
raw enum on every screen at once.

Its second assertion is the defect in one line: **a person's words do not have underscores in them.**
Watched fail by adding `"close_to_target"` to the schema — two of three tests red, naming the value.

**`tests/e2e/teacher-classroom-with-students.spec.js`** is the browser half. Watched fail by
restoring the one-line original: _"the Readiness column shows the evaluator's verdict in words on
the grading screen and in database in the list that opens it."_

## 4. The two specs, and why they needed a classroom with people in it

Phase 144's stub defaults to the emptiest fixtures that get through the door. That was right for
the door and wrong for finding this: an empty classroom has no submissions, so it has no Readiness
column to be wrong.

**`teacher-classroom-with-students.spec.js`** supplies the other end — a roster in all three
`roster_slots.status` states with two claimed students, a world profile with progress on it, an
overdue assignment, a submission carrying a real SAQ evaluation blob, and a manual grade already
entered against it. None of those rows had ever rendered in a test, and none can be produced by hand
without a live classroom of real students submitting real work.

It asserts the report's arithmetic as well as its text: **1/2 submitted** against the _claimed_
roster, because an unclaimed or disabled slot is not a student who is late, and **1/1 graded** off a
`manual_grades` row reached through `getGradedEvaluationIds()`.

Two fixture details are deliberate and were got wrong first:

- **The clock is pinned to UTC and the due date is an instant, not a date.** A due date is stored as
  `new Date(input + "T23:59:59").toISOString()` — end of day _local_. A fixture written as UTC
  midnight reads a day early in every zone behind Greenwich, and the first draft of this spec
  reported `3/4/2026` for a due date of the 5th and looked exactly like an app defect. It is not
  one; the round trip is local at both ends. The spec asserts the report's counts and its overdue
  chip's tone rather than a date string.
- **The overdue branch needs two claimed students**, because `isOverdue` requires work still
  outstanding. One claimed student who has submitted never reaches it.

**`teacher-surfaces.spec.js`** is the sweep: all four tabs, the Sources tab's unit pool opened one
level deeper, then sign out, sign back in on the same page, and all four again.

That depth is load-bearing. All three of `teacherUiState`'s `Set` fields are read from
`sourceRowMarkup()` / `sourcePoolPreviewMarkup()`, and neither runs until a unit section is expanded
**and its pool has resolved** — so a sweep that only clicks the Sources tab walks straight past the
lines the Phase 133 bug broke. Watched fail by restoring the drifted sign-out literal: green on the
first pass, red on the second, at `TypeError: Cannot read properties of undefined (reading 'has')`.

## 5. The assertion is "nothing threw", and it has to be asked for

`render()` catches every renderer exception, resets `currentScreen` to `institute` and shows "The
Archive display recovered from a render issue". A `TypeError` on a teacher screen is therefore
invisible by construction — the teacher sees a generic Institute screen and no error reaches anyone.
That catch is a real safety net and stays, which is exactly why both specs watch the console for the
`Chronicle render recovery` line it logs.

One consequence worth writing down: **a bare `toBeVisible()` in a caught world names the symptom and
hides the cause.** When the render threw, the source-pool rows simply never appeared, and the first
version of the sweep reported a missing button five seconds after the `TypeError` that removed it.
The wait has three outcomes — rows, still loading, or thrown — so it polls for all three and reports
the third as itself.

## 6. What this does not cover

Publishing, drafts, preview sessions, roster provisioning, password reissue, classroom creation, and
grade entry are all still not walked. The two specs here read; they do not write. That is deliberate
and is also asserted — both check `supabase.writes` stayed empty apart from the
`student_world_profiles` upsert the dashboard issues on load, which is the write that makes the live
project unusable as a test target in the first place.

One thing was noticed and is **not** being changed: the Sources tab lists **nine** units while the
Units tab lists **eight**, because the source library carries Unit 9's content and `UNITS` does not.
A teacher can curate a source pool for a unit no student can reach. That reads as coherent — the
researched library is not the playable slate — but it is a design call rather than a defect, and it
belongs to the owner.

---

## Verification

`npm run check` clean — **2,400 unit tests across 82 files** (2,397/81 before), ESLint 0 errors and
the same 5 pre-existing warnings, cspell, `validate:content` at 169 groups. `npm run build` clean.
All **61 visual baselines unchanged** — `archiveFeedbackMarkup()`'s output is byte-identical, the
lookup having moved into a function rather than changed — and no baseline covers a teacher screen in
any case. The four teacher e2e tests run in **12.8 seconds**, offline, with nothing leaving the
machine.
