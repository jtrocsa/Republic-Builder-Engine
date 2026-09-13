# 0132 — One object, one shape

**Phase 133 · 2026-09-12 · Accepted**

The second phase of the audit programme, and the one live defect it found. A teacher who signs out
and signs back in without reloading the page, then opens the Sources tab or Manage Content, gets a
`TypeError` — and is shown a screen that says the Archive recovered from a render issue.

The cause is one object written twice.

---

## 1. What broke

`teacherUiState` is declared with three `Set` fields added over two later phases:
`sourcePoolLoadingUnits`, `sourcesPreviewKeys`, `sourcesFullTextKeys`. The `teacher-sign-out`
handler rebuilds the whole object from a **second hand-written literal**, and that literal has
sixteen of the nineteen fields. All three `Set`s are missing.

Five sites then call `.has(...)` on `undefined`, and three of them are on a render path:

- `sourceRowMarkup()` — twice, `sourcesFullTextKeys.has(key)` and `sourcesPreviewKeys.has(key)`
- `sourceSelectorFieldMarkup()` — `sourcePoolLoadingUnits.has(unitNumber)`
- the two `toggle-source-*` click handlers

**Nothing repairs them.** This was the part worth checking rather than assuming, because a loader
that rebuilt the object on sign-in would have made the whole thing self-healing.
`loadTeacherDashboardData()` and `loadSelectedClassroomDetails()` between them reset eight fields —
`classrooms`, `selectedClassroomId`, `roster`, `submissions`, `progressByStudent`,
`enabledUnitIndex`, `assignments` and `gradedEvaluationIds`, that last one **also a `Set`** — and
touch none of the three. So once the sign-out literal has run, they stay `undefined` for the life of
the page.

## 2. Why nobody ever saw a stack trace

`render()` wraps its whole screen switch in a `try`/`catch` that converts any renderer exception
into a screen reset: back to the Institute, and a `hubNotice` reading _"The Archive display
recovered from a render issue. Use Reset Unit 1 demo if you want to retest the full flow."_

So the symptom a teacher gets is not a crash. It is being silently bounced out of the screen they
asked for, with a message about the Archive and a suggestion to reset a student demo — none of which
has anything to do with what they were doing.

**That catch is a real safety net and it stays.** It is also precisely why this class of bug is
invisible by construction, and therefore why the fix has to come with an assertion somewhere else.
A defect that can only manifest as a generic recovery screen will never be reported accurately.

## 3. The same bug in the object beside it, further gone

`contentUiState`'s sign-out copy dropped four real fields — `slot`, `successMessage`,
`lastActionFailed`, `draftSavedSincePublish` — and wrote **`slots: []` and `additionSlots: []`** in
their place. Those two names appear nowhere else in the repository and never have; they are the
shape of a schema that was either renamed or never shipped.

A third literal, in `open-manage-content-case`, was the only one of the three that matched the
declaration. **Three shapes for one object**, and the declaration was in the minority.

## 4. The fix, and the shape of it

Two factories, `initialTeacherUiState()` and `initialContentUiState()`, each holding the canonical
literal with every comment kept on its field — those comments are the only documentation several of
these fields have. The declaration becomes `let teacherUiState = initialTeacherUiState();`, the
sign-out handler calls both, and `open-manage-content-case` spreads its one override on top:
`{ ...initialContentUiState(), selectedCaseId: target.dataset.caseId }`.

Both factories are `export`ed, following the pattern CLAUDE.md names — add `export` to the specific
functions worth unit-testing and test them in place, rather than moving anything.

The diff is 121 insertions against 118 deletions in `main.js`, and most of that is re-indentation
from wrapping two literals in a function. **No field's value changed.**

## 5. The guard, and why it is not a key-list

The obvious test — assert the factory returns these nineteen keys — would restate the factory.
It would have caught nothing here, because the declaration was never the thing that was wrong.

What failed was a **second producer**, so that is what `tests/unit/ui-state-shapes.test.js` forbids:
every line in `main.js` that assigns `teacherUiState` or `contentUiState` must call its factory.
Watched fail with the original literals restored, naming the exact lines —
`main.js:16849 assigns teacherUiState without calling initialTeacherUiState()` and
`main.js:16867` for the other — and the message says what it cost rather than what it is.

A second way a factory can be wrong is returning a shared object, so sign-out hands the next teacher
the previous one's `Set`s instead of empty ones. That is asserted separately and **also watched
fail**, by rewriting the factory to return a module-level singleton: 1 failed, 5 passed.

The three `Set`s and the two invented fields are named individually, because they are the specific
things that were dropped and invented; `slots`/`additionSlots` are asserted **absent**, so copying
that literal forward again fails.

## 6. What was deliberately left alone

**`teacherUiState.newClassroomName`** is now genuinely dead — it survives only in the factory, is
read nowhere, and its last writer was the sign-out literal this phase deleted. So are
`gradingUiState.gradeLabel` and `.teacherFeedback`, which are declared, never written and never read
(the real values come from the DOM at click time). All three are dead-code removals, not shape
drift, and they belong with the rest of the audit's dead-code work rather than in a commit whose
test asserts a shape. Removing them here would mean changing the canonical shape for two unrelated
reasons at once.

**`render()`'s catch** stays, for the reason in §2.

## 7. What could not be verified here

The end-to-end reproduction — sign out, sign in, open the Sources tab — needs a real teacher account
against the live Supabase project, which this environment cannot exercise. So the defect is
established by reading rather than by watching: the two initialisers, the five `.has(...)` call
sites, and §1's check that neither dashboard loader restores the three fields. The fix is
established by the guard failing two-sided.

That is stated plainly rather than glossed. It is the one claim in this entry that rests on reading
code instead of running it.

---

## Verification

`npm run check` clean — Prettier, ESLint (0 errors, the same 5 pre-existing warnings), cspell across
600 files, **2,264 unit tests across 79 files** (up 6, all in the new file), and `validate:content`
at 169 groups. `npm run build` clean. No visual baseline could move: the only rendered output that
changes is the screen that used to throw.
