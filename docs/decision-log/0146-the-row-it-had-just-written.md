# 0146 — The row it had just written

**Phase 147 · 2026-09-20 · Accepted**

Phases 144 and 145 built a door into the teacher surfaces and walked them. Both of their specs end
the same way:

```js
expect(supabase.writes.filter((w) => !w.endsWith("student_world_profiles"))).toEqual([]);
```

That is an honest assertion and it is also the whole shape of what those phases could do. **Every
teacher screen was walked in one direction.** Entering a grade, saving a draft, publishing a
mission, reverting one, curating a source, creating a classroom, setting an assignment — the seven
things a teacher actually does — were all still untested, and `0143` §5 listed them as such.

This phase walks them, and the walk found one defect.

---

## 1. Why the writes could not be walked, and what changed

The stub answered every `GET` from a frozen fixture and every write with an echo of its own body.
That is enough to render a screen and not enough to press a button on one, because **every
consequential thing a teacher does is a write whose result they immediately read back**:

| the write                 | what the app does next                          | against an echo                                      |
| ------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| `recordManualGrade()`     | re-reads the submission and re-renders          | the teacher's own grade never appears                |
| `createCustomContent()`   | uses `row.id` as the draft's target             | the insert carries no `id`, so it is `undefined`     |
| `publishCaseSelections()` | reads the **draft** row back out, to publish it | finds nothing, takes the revert branch, does nothing |
| `setSourceInPool()`       | re-fetches the pool when the unit is reopened   | the pool is empty again                              |

So `helpers/supabase-stub.js` keeps its tables now: an insert stores its row, a `PATCH` merges into
the rows it matches, a `DELETE` removes them, an upsert with an `on_conflict` target replaces rather
than duplicates, and a `GET` reads what is there.

**Three defaults are column defaults, not conveniences.** An inserted row gets `id`, `created_at`
and `updated_at` when it arrives without them, because the real table does and the app reads all
three straight back — `new Date(undefined)` renders as "Invalid Date" on the grading screen, which
is a defect in the stub that looks exactly like a defect in the game.

**The filters are parsed rather than ignored.** A `manual_grades` read filtered by `evaluation_id`
that answers with every grade in the classroom is a fixture pretending to be a database, and it
would have made the grading screen's own filtering unfalsifiable. Two consequences follow, and both
are deliberate:

- An operator the stub does not understand (`gt`, `like`, `or`) is **collected, not skipped** — it
  goes into `unsupportedFilters`, which every test here asserts is empty. Skipping it silently
  widens the query, and a stub that answers a question it did not understand is worse than one that
  says so.
- The filtering is **proved rather than assumed**. `teacher-writes.spec.js`'s fixture carries a
  grade belonging to a _different_ evaluation, and the spec asserts it never appears. With
  `filterFor()` short-circuited to match everything, that test fails on its first assertion — the
  submission is no longer ungraded — which is the guard watching itself work.

It is still not Postgres. It knows `eq`, `in` and `is.null`; it enforces no RLS, no uniqueness, no
foreign keys and no types; and a fixture whose shape has drifted from the live table will keep
passing. That last is the standing limitation `0143` §5 already records.

## 2. The defect: a branch that could not be reached

`persistAuthoringSelection()` decides between updating the custom row it is already editing and
creating a new one:

```js
const canReuseExistingCustomRow =
  auth.editingCustomId && auth.slotKind === auth.currentSlotKindAtStart;
```

`editingCustomId` is seeded in exactly two places — `wizard-go-edit` and `wizard-go-replace`, both
from `slot.draftAltId` — and **nothing ever writes it again**. The id of a row the save has just
created is dropped on the floor.

So within one editing session the update branch is unreachable, and **every press of Save Draft
writes another `custom_content_items` row**. Measured in the browser, three presses in one session:

| presses | `custom_content_items` rows | what the draft points at |
| ------- | --------------------------- | ------------------------ |
| 1       | 1                           | the row                  |
| 2       | **2**                       | the newest               |
| 3       | **3**                       | the newest               |

Each row carries a whole authored question. Nothing points at the older ones, and no screen offers
to delete them — `deleteCustomContent()` is exposed for `mode: "addition"` rows only, by design.
A teacher wording a question over a dozen saves leaves a dozen.

**Nothing a student or a teacher sees is wrong**, and that is why it had survived: the draft and the
published selection always point at the newest row, so the right content is served throughout. What
it costs is storage that only grows and a `listCustomContentForCase()` read that gets heavier every
time the mission is edited.

It is also not what the code believed it was doing. The comment above the branch explains when reuse
is safe and when it is not, and the answer it gives — reuse unless the teacher changed the activity
_type_ — is the right answer to the right question. The branch simply never got the chance.

## 3. The fix, and why it needed a second field

The created row's id is recorded on the authoring state, alongside **the kind it was created as**:

```js
if (manageContentAuthoring === auth) {
  auth.editingCustomId = row.id;
  auth.editingCustomKind = auth.slotKind;
}
```

`editingCustomKind` is a new field rather than a reuse of `currentSlotKindAtStart`, because the two
answer different questions and the older one is load-bearing elsewhere. `pick-question-type` reads
`currentSlotKindAtStart` to decide whether re-picking a type may prefill the form from the official
content:

```js
const fields =
  slotKind === auth.currentSlotKindAtStart && auth.originalPreviewContent
    ? authoringFieldsFromContent(slotKind, auth.originalPreviewContent)
    : defaultAuthoringFields(slotKind);
```

Moving `currentSlotKindAtStart` forward on each save would therefore have prefilled an MCQ form from
an evidence-organizing document the next time a teacher went back to the type picker. **A variable
that already answers one question does not get asked a second** — the same rule `0127` §2 names
about `PROGRESS_TILES`, and the same one `INVARIANTS.md` records as `codexOrigin` beside
`sourceOrigin`.

The identity guard `manageContentAuthoring === auth` is there because a publish nulls the authoring
state and a teacher can leave the editor while the write is in flight. When it does not hold, the
behaviour is exactly today's — a new row — so the fallback is the old code rather than a new failure.

Measured after: **three presses, one row**, with the draft still pointing at it, and publishing then
updates that row instead of writing a fourth copy of the same question.

## 4. What else the walk found, which was nothing — twice, for different reasons

Two things read as defects in the first pass and neither was.

**"Preview Published Mission" appeared to draw an empty box.** The probe asked whether the preview
contained the string `Student view` and got `false`, which looked like `0125`'s box-with-nothing-in-it
on a screen no guard covers. The card was there the whole time: `.manage-content-live-preview` held
5,867 characters of markup and measured 956×945 on screen. **`innerText` returns text as rendered,
and the heading is `text-transform: uppercase`** — so the page said `STUDENT VIEW — EVIDENCE
ORGANIZING` and the probe was asking for `Student view`. Playwright's `toContainText` would have
answered the same way: it is case-sensitive unless told otherwise. The lesson is not to reach for
`ignoreCase` but to **assert on something the stylesheet does not restyle** — which is why nothing in
the spec that ships here is keyed to a styled heading.

**Keep & Publish writes a `DELETE` and no insert.** On a mission with no draft that is correct and is
the point of the button: publishing the standard mission means removing any override, not writing
one. It is now asserted as the round trip that actually matters — publish a custom activity, then
press Keep & Publish, and **no selection row is left pointing at the custom content**. A teacher who
puts the standard mission back gets the standard mission back.

## 5. What is walked now, and what still is not

`tests/e2e/teacher-writes.spec.js`, four tests, **15.7 seconds**, offline:

- a grade is refused when empty (**and writes nothing** — a teacher tapping Save on the wrong row
  must not enter a blank grade against that student's work), saved exactly once when filled, and
  read back in words with a valid timestamp;
- a draft saved three times is one row, publishing reuses it, and Keep & Publish takes the override
  back off;
- a source curated into a unit's pool is still there when the unit is closed and reopened, which is
  the round trip rather than the optimistic `Map` update the click already made;
- a new classroom and a new assignment come back in the lists that read them, with the due date
  stored as the end of the day the teacher chose.

**Still not walked: roster provisioning and password reissue**, and they are a different problem
rather than an omission. Both go through `/api/roster/*` — the repo's own serverless functions,
which hold the service-role key — and not through Supabase at all, so the stub's route pattern never
sees them. Under `npm run dev` those paths do not exist, so the calls 404 and the screen reports
"Could not add roster slots." That is a second door, not a wider one, and it would also open the
student join flow, which has never been walked either. Left for its own phase.

---

## Verification

`npm run check` clean — **2,409 unit tests across 83 files**, unchanged, because this phase adds no
unit test: the defect is about a flow between four functions and two screens, and a pure-function
test cannot fail for it. ESLint 0 errors and the same 5 pre-existing warnings, cspell 0 issues
across 626 files, `validate:content` 169 groups. `npm run build` clean.

The row-reuse guard was **watched fail** against the unmodified `main.js`: _"Expected: 1, Received:
3"_, under the message naming the consequence. The stub's filtering was watched fail by
short-circuiting `filterFor()`.

All **eight** teacher e2e tests — this spec plus `teacher-surfaces`, `teacher-classroom-with-students`
and `manage-content-authoring` — pass together in **21.4 seconds**, with nothing leaving the machine.
No visual baseline can move: the only `apps/web/src` change is inside a Manage Content click handler
and emits no markup, and no baseline covers a teacher screen in any case.
