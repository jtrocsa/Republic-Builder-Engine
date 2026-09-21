# 0150 — An assignment named nothing

**Phase 151 · 2026-09-20 · Accepted**

Phase 150 walked a student's written work all the way to their teacher's grading screen. The one
thing it did **not** walk was the panel above that screen: the assignment a teacher sets so the
class's work can be counted.

Walking it found that **a teacher who followed the form's own example created an assignment no
submission could ever match**, and the report said `0/N submitted` forever with nothing on the
screen to say why.

---

## 1. The defect

An assignment is `(task_type, task_id)`, and `computeAssignmentReport()` matches a submission on
both. `task_type` was a `<select>`. `task_id` was a **text box**:

```text
placeholder: "e.g. unit-03-archive-common-cause-saq"
help: "The quest/source id this assignment tracks — matches the id a
       student's submission is recorded under."
```

That is an Archive Challenge's **quest id**. It is not the id a submission is recorded under, and no
student action produces it. There are four sites that record one and they all agree with each other
and not with the example:

| what a student does                 | the id it is recorded under                  |
| ----------------------------------- | -------------------------------------------- |
| writes a reading of a field record  | `source.id` — e.g. `columbus-letter`         |
| submits a unit's Archive Review SAQ | `saq-${unit.id}` — e.g. `saq-unit-01`        |
| submits an SAQ Archive Challenge    | `saq-quest-unit-03-archive-common-cause-saq` |
| submits a DBQ Archive Challenge     | `dbq-quest-unit-03-archive-common-cause-dbq` |

So the placeholder was the right string with the `saq-quest-` prefix missing, and the help text
beneath it asserted the opposite of what the field did.

**It fails in the worst available direction.** There is no error, because nothing validates the id
against anything; the row saves; the assignment appears in the table; and the report renders a
confident `0/2 submitted`. That is indistinguishable from a class that did not do the work, on a
screen a teacher uses to decide who is behind.

**And the hazard was already written down three lines above, about the field beside it.**
`ASSIGNABLE_TASK_TYPES` is deliberately narrower than the database's own check constraint:

> no real `leq` quest type exists in QUEST_TYPES yet, so offering it here would let a teacher create
> an assignment no submission could ever match

Same form, same sentence, one field guarded and its twin a free-text box.

## 2. Why a corrected example is not the fix

A typo in a free-text id fails exactly as silently as a wrong one, and the id is not something a
teacher can be expected to know — nothing in the interface displays it before the fact.

Every legal id is **derivable from the content**, so `assignableTasks()` derives them: 59 tasks
today — 2 Archive Reviews, 8 SAQ and 6 DBQ Archive Challenges, and 43 written source readings. A
record whose reader answers multiple-choice questions (`readerQuestType`) is deliberately excluded,
because it never reaches the evaluator and therefore can never be submitted.

**The task type went with it.** The type is a property of the task, not a second decision, and two
controls that must agree are a third way to get this wrong. The form is now one `<select>`, and
`create-assignment` reads the type off the chosen task. `ASSIGNABLE_TASK_TYPES` did not go away —
it is the filter `assignableTasks()` passes every candidate through, which is what its comment
always said it was for.

One thing worth recording because it could have gone the other way: a Teacher Mode swap does **not**
change any of this. `resolveSourceSlot()` and `resolveQuestSlot()` return
`{ ...alt, id: officialSource.id }`, so a slot keeps its id whatever a classroom published, and a
task id is the official id for every classroom.

## 3. The rows that already exist

Assignments created before this phase are still in the table, and some of them name nothing. That is
the reading the report must not be allowed to have, so a row whose `(task_type, task_id)` matches no
assessment now says so, in the row, with the consequence spelled out:

> **Matches no assessment** — Nothing a student submits is recorded under this id, so this row can
> only ever read 0 submitted. Delete it and create the assignment again.

Nothing is rewritten or deleted on the teacher's behalf.

## 4. What the fixtures were doing

Two specs created or held assignments with ids nothing records — `unit-01-archive-saq` in
`teacher-classroom-with-students.spec.js` and `unit-02-archive-saq` in `teacher-writes.spec.js` —
and both passed, because in one the submission beside it was written to agree and in the other
nothing checked the match at all. They are real task ids now, and the first spec keeps a **second**
assignment carrying the literal placeholder, so the new chip has something to be about.

## 5. Guards

- `tests/unit/assignable-tasks.test.js` holds the picker against the **four request builders in
  `evaluator-requests.js`**, which is where a submission's `taskId` is actually decided — not
  against a copy of the rule. If a builder's convention changes and the picker's does not, the
  assignment a teacher creates silently stops matching, which is this defect again. It also keeps
  the literal placeholder as a regression: `unit-03-archive-common-cause-saq` is not a task, and
  `saq-quest-unit-03-archive-common-cause-saq` is.
- `tests/e2e/student-work-reaches-the-teacher.spec.js` closes the loop it opened in Phase 150: the
  student's submission is written, its `task_id` is read out of the table, **that exact id has to be
  one the form offers**, and the assignment created from it reports `1/1 submitted` and
  `1/1 graded`.

---

## Verification

`npm run check` clean — **2,433 unit tests across 85 files** (2,427/84 before), ESLint 0 errors and
the same 5 pre-existing warnings, cspell 0 issues across 638 files, `validate:content` 169 groups.
`npm run build` clean.

**Watched fail** with `apps/web/src` stashed: the e2e assertion at _"the work this student just
handed in is recorded as `saq-unit-01` and no assignment can be created for it, so the report can
only ever say nobody submitted"_, and all six unit cases.

Thirty-eight teacher, evaluator and visual-regression tests passed together in 2.1 minutes with all
61 baselines unchanged, plus 26 student-side quest tests in 45 seconds. No baseline photographs a
teacher screen, which is why replacing two fields with one moved nothing.
