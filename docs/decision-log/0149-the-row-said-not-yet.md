# 0149 — The row said not_yet

**Phase 150 · 2026-09-20 · Accepted**

Phase 149 walked Teacher Mode from the teacher's click to the student's screen. This phase walked
the **return leg** — a student's written work becoming a row their teacher can open and grade — and
it needed two doors opened before it could take a single step.

The walk confirmed the loop holds. It also showed that **every rubric row the Archive Evaluator
returns reached the student as the schema writes it for the model**: a student read
`PART C — NOT_YET` about their own writing.

---

## 1. Why the return leg had never been walked

Two independent blockers, both infrastructure, neither of them the finding:

**`POST /api/evaluate` had no stub.** It is the third thing the game talks to, after Supabase and
`/api/roster/*`, and it is the only one a **student** talks to. Under `npm run dev` the path does
not exist — Vite serves `apps/web`, not `api/` — and in production every press is a real model call.
Nothing a student writes is recorded until the evaluator answers, because `runEvaluation()` writes
the `submissions` row only on success, so with that door shut there was no way to produce a
submission at all. `tests/e2e/helpers/evaluate-api-stub.js` is the door.

**The Supabase stub resolved no embeds.** `listForClassroom()` reads
`profiles!inner(display_name), evaluations(id, feedback, model, created_at)`, and the stub answered
every `select` with the whole row. A spec could only fake that by writing the join into its own
fixture — which is fine for a row a fixture supplies and **impossible for a row the application
inserts**. A real student's submission arrived on the teacher's dashboard as "Unknown student" with
an empty Readiness: a defect in the stub wearing a defect in the game.

Both stubs derive what they can rather than declaring it. The evaluator's reply is built out of
`RUBRICS` — the same JSON schema `api/evaluate.js` hands the model — so its rows, its `met` values
and its readiness verdicts cannot drift from the contract. `EMBEDS` in `supabase-stub.js` names the
two joins the app actually makes and **honours `!inner`**, because that is the one that changes what
a teacher sees: a submission whose author has no `profiles` row is not shown as anonymous, it is not
shown.

## 2. The defect: half a heading spoke English

`archiveFeedbackMarkup()` renders one evaluator reply, and it is shared by `sourceReader()`,
`reviewScreen()` and `gradingScreen()` on purpose, so a teacher reads exactly what their student
read. The reply comes in two shapes:

`elements` — a HIPP source reading, translated since it shipped:

```text
<h3>${esc(el.element.replaceAll("_", " "))}</h3>
```

`rows` — everything else in the game, not translated:

```text
<h3>${esc(row.row.replaceAll("-", " "))} — ${esc(row.met)}</h3>
```

`met` is the enum `api/_lib/rubrics.js` declares for the model: `yes | partial | not_yet`. Under
`.archive-feedback-item h3`'s `text-transform: uppercase` a student read, about their own writing:

| what the evaluator meant | what the student read |
| ------------------------ | --------------------- |
| Part A — met             | `PART A — YES`        |
| Part B — partially met   | `PART B — PARTIAL`    |
| Part C — not yet         | `PART C — NOT_YET`    |

**The `rows` shape is not an edge case — it is everything except the source reader.** The Archive
Review SAQ of every unit that has one, every SAQ Archive Challenge and every DBQ Archive Challenge
answer in it. That is all of the extended writing in the game, which is the work the AP exam is
actually made of.

The row names had the same problem more quietly. `replaceAll("-", " ")` is a column name with the
punctuation taken out: `evidence-use` → "evidence use", `reasoning-ccot` → "reasoning ccot".

**This is `0144` one line down in the same function.** That phase found the Teacher Dashboard's
Readiness column printing `needs_fresh_attempt` raw while the grading screen one click away said
"Try a fresh attempt", and gave `readinessLabel()` the job — and `0144` itself was written about the
roster's STATUS column being the same defect's twin. The `met` beside the readiness was left alone
each time, because **no fixture in the repository had ever held a rubric row**.

## 3. Why nothing had ever held one

`teacher-classroom-with-students.spec.js`'s SAQ feedback fixture was written in the **HIPP** shape —
`elements`, with `element` values (`historical_claim`, `evidence`) that appear in neither schema's
enum — under a comment stating it was "the evaluator's own output shape, as `api/_lib/rubrics.js`'s
SAQ schema declares it".

Nothing could tell. It rendered, because `archiveFeedbackMarkup()` branches on whichever key is
present, and the branch it exercised was the one that was already right. The fixture is the real
`rows` shape now, and the stub builds its replies from `RUBRICS` for exactly this reason.

## 4. The fix

`RUBRIC_ROW_LABELS` and `RUBRIC_MET_LABELS` beside `READINESS_LABELS`, read through
`rubricRowLabel()` / `rubricMetLabel()` — the same shape, the same argument, the same file position.
Both fall through to the raw value rather than to an empty heading, for `readinessLabel()`'s stated
reason: an unlabelled row is worse than an ugly one.

`tests/unit/rubric-row-labels.test.js` reads the enums back out of `RUBRICS` and asserts every row
the schemas can return has a name, every verdict has a word, and no label exists for a row no rubric
can return. The change most likely to happen here is a **new DBQ row**, since the DBQ rubric is the
one that grows, and that is what the guard is aimed at.

## 5. What the walk confirmed

`tests/e2e/student-work-reaches-the-teacher.spec.js` is one test and it is the whole loop: a teacher
opens a seat, signs out; a student claims it, walks to the Navigation Table, opens the Archive
Review and asks the evaluator; the row lands against the right classroom and the right student with
the student's whole answer in it; the teacher signs back in, finds it under the student's name with
the verdict in words, opens it, reads what the student wrote, and enters a grade that is on the
screen and in the table afterwards.

That holds, and it is a null result worth having — until now the only evidence for any of it was
that a row landed in a table.

## 6. Two things this walk found and did not fix

Both are in the same panel and both are the owner's call, recorded here rather than acted on:

- **A teacher types an assignment's `task_id` by hand, and the example is wrong.**
  `assignmentCreateFormMarkup()` offers a free-text field whose placeholder reads
  _e.g. unit-03-archive-common-cause-saq_, which is an Archive Challenge's **quest id**. The id a
  submission is actually recorded under is `saq-quest-unit-03-archive-common-cause-saq`, or
  `saq-unit-01` for a unit's Archive Review, or the source's own id for a HIPP reading. A teacher
  who follows the placeholder creates an assignment that **no submission can ever match**, and
  `computeAssignmentReport()` reports `0/N submitted` forever with nothing to say why. The hazard is
  named in the file three lines above, about the field beside it: `ASSIGNABLE_TASK_TYPES` excludes
  `leq` because offering it "would let a teacher create an assignment no submission could ever
  match". The same sentence, the same form, one field guarded and the other a text box. It is a
  candidate for its own phase, and the fix is a picker rather than a corrected example, because a
  typo in a free-text id fails exactly as silently.
- **"Feedback to student" reaches no student.** The grading screen's second field is labelled
  _Feedback to student_ with the help text _Additional notes for the student_, and `manual_grades`
  is read in exactly one place — `getSubmissionWithGrades()`, called only by the teacher's own
  grading screen. Nothing a student can open shows a grade or a teacher's note. Whether that is a
  missing surface or a promise that should stop being made is a design decision.

---

## Verification

`npm run check` clean — **2,427 unit tests across 84 files** (2,418/83 before), ESLint 0 errors and
the same 5 pre-existing warnings, cspell 0 issues across 636 files, `validate:content` 169 groups.
`npm run build` clean.

**Watched fail.** The e2e guard, before the fix, at
_"a student is reading their own rubric in the evaluator's machine words"_ with the received value
`["part c — not_yet"]` — one heading of the three, because the stub cycles the `met` enum and only
the third row draws the ugly one. The unit guard, with two labels deleted, at 5 failed / 4 passed.

**Both teacher specs failed first on the embed change and that is the point**: their submissions
vanished from the dashboard because their students had no `profiles` row, which is `!inner` doing
what PostgREST does. Their fixtures supply the rows now instead of the join.

Ten specs ran together — the three new evaluator tests, the loop, all five teacher specs and the
whole visual-regression suite: **56 passed in 2.5 minutes, all 61 baselines unchanged.** No baseline
photographs an evaluator reply; the two screens that could show one are only ever captured before a
submission exists.
