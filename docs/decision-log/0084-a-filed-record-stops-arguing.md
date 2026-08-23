# 0084 — A filed record stops arguing

**Phase 90F · 2026-08-23 · accepted**

Closes **Spine Review Part 7**, Mission Instructions and the activity board
([`part-07-mission-instructions-and-the-board.md`](../playtest/part-07-mission-instructions-and-the-board.md)).
Part 6 took the field: the world in 6A, the mission surface on it in 6B. Part 7 is the screen a
record opens into — the hand-off, and the board. Nine findings, three fixed as S2, one in passing,
three routed, two withdrawn on inspection.

The first part of the program that inherited nothing. It is worth saying that it still produced
three S2s, because the standing worry about a bounded review program is that it converges once the
obvious surfaces are read.

---

## 1. The thing that was wrong

**A finished mission could be un-finished from its own board, and the archive would disagree with
the screen.**

Every engine's reducer has the same `file` branch:

```js
if (action.type === "file") {
  if (!<this board is settled>) return state;
  const option = activity.closer.options.find((item) => item.id === action.option);
  return option ? { ...state, filed: option.id } : state;
}
```

Which is correct on the way up and says nothing about the way back. `filed` is overwritten
unconditionally, forever. So the sequence is: finish a mission, read its debrief, get carried into
the record, and later reopen the mission from the Mission Tracker — a documented reason to reopen
one, and the whole point of tier 3 of `activeNotebookActivity()`'s ordering. The closer is sitting
there live. One click on a wrong conclusion and:

```
filed the correct option -> complete: true  | filed: knowledge
re-filed a wrong option  -> complete: false | filed: daily
```

`isActivityComplete()` now says false. The "Record stabilized" footer disappears. The board shows a
red conclusion. And `progress.codex` still holds the filed entry, because `fileToCodex()`
**deliberately never unfiles** — a decision with its own paragraph of rationale, which this bug
turned from a principle into a contradiction.

Recoverable in one more click, and nobody is stuck. But the game's own record of what a student
established should not be something a stray click can argue with.

### The fix needed nothing passed to it

The instinct was to plumb a flag: the host knows the record is `debriefed`, so tell the board. That
is `activityContext()`, four engine signatures, and a new term in a shared contract — for a fact the
contract can already see.

`renderCloser()` receives `locked` and computes `{ correct, supported }`. And every engine's
completion predicate is the same three terms:

```js
<its own board settled> && result.correct && result.supported
```

`locked` is that first term negated, at the only call site each engine has. So `!locked && correct
&& supported` **is** `isActivityComplete()`, evaluated inside the shared closer, with nothing passed
down and without `engine/activities/` learning what filing means. One line, one function, four
engines fixed.

Only that exact state closes. A wrong conclusion stays live and a correct-but-unsupported one stays
live, because both are states the player is supposed to be able to change — the unsupported one
especially, since its whole purpose is to send them back for evidence.

### And then the same rule at the state layer

The four reducers refuse `file` when the activity is already complete. Belt and braces, and worth
the four lines for a reason `interview.js` was already carrying four lines below where the guard now
sits: _the closer's disabled attribute is a hint, not a lock_. A `disabled` button stops a mouse and
a keyboard. It does not stop anything that reaches a reducer by another route, and this repository
has now twice found a second route into something it thought had one (`nearestInReach()` in Part 5,
`openFieldRecord()` in 6A). The invariant belongs where the state changes.

## 2. The board that is not where the work is

INTERVIEW is the only engine that runs part of itself out on the map. Its screen is the notebook
that fills up as a result — so a first visit is a blank grid, an empty Field Notebook and a locked
closer. Measured: **zero enabled controls, out of the four buttons on the page.**

Nothing on it said where the questions go. The copy column does not close the gap either: Units 6
and 7 say "any of the four questions to any person **on this map, indoors or out**", but the five
earlier missions say "any question to any person", which grants permission without naming a place.

The line went in the engine rather than in five content files, and that is the interesting call.
`engine/activities/` holds no APUSH facts — but "the questions are put to people out in the field"
is not a fact about the Caribbean, it is a fact about INTERVIEW. It is the same placeless register
this file already reached for once, when the default `lockedNote` lost the word "island" for saying
something true only of Unit 1. The line is gone the moment anybody has been asked anything.

## 3. One name for the instructions

The same three steps are the Mission Instructions screen on the way in and a reference copy in the
board's copy column, and they were headed differently — "Mission Instructions" then "How this
works". A student looking for what they read thirty seconds ago found something with another name.

Fixed in passing: one string. It moved six visual baselines by exactly 1119 pixels each, which is
itself the review — an identical count across five unrelated screens is a word swap in the same font
at the same place, and the sixth (the Caribbean interview) was read as an image.

## 4. Two findings withdrawn, and why they are written down

- `waldseemuller-map` is the only one of twenty-one activities with no `briefing`, so its brief opens
  on the engine's mark and "Nobody handed you this one". That is `missionGiver()`'s third tier
  working: the record is on a cartographer's table, not in anybody's hands, and the screen says so
  rather than borrowing a face. It has its own baseline.
- `interviewTokens()` walks **every** unit's interviews and emits `asked:<speaker>:<question>` with
  no unit scope, while question ids are generic — `gold`, `grows`, `decides`. A collision would hand
  a player evidence in one unit's audit that they earned in another. All seven interviews were swept:
  zero shared pairs. Nothing enforces it and nothing tests it, so the next unit's author is one
  reused speaker id away from a bug that would present as a discrepancy board being suspiciously
  generous.

Both are recorded so the next reader does not spend the same half hour re-finding them.

## 5. Recorded, not fixed

- **The board's kicker wraps mid-phrase** on the longest engine label: "CASE 1.01 · THE /
  RECONSTRUCTION" in the 370px copy column. That column's width is shared with the practice check
  and the Archive Challenges, "THE RECONSTRUCTION" is the only one of the four labels long enough to
  reach it, and the note on `activityVariantLine()` already explains that this column is why the
  variant line was moved out of the kicker in the first place. Chasing the last two words of it is
  not worth a shared-width change.
- **Two of Unit 1's seven interview speakers carry no `role`** — the child and the sailor — so their
  rows are bare names among five described ones, on the first mission in the game. Content queue.
- **`missionQuestion` prints on the way in and the way out and nowhere in between.** The schema says
  so deliberately, and it may well be right; but the panel a player has open while actually working
  is the Field Notebook, which is Part 8's subject and the right place to decide it.

## 6. Verification

- `npm run test` — 72 files, **1820** tests (7 new), green. Five of the seven are the closer's new
  behaviour: one per engine at the reducer, plus `renderCloser()`'s own three cases in
  `activity-notebook.test.js`.
- The four per-engine tests each **file the wrong option successfully first**, then file the right
  one, then prove the wrong one is refused. Without that first step the test passes for an id that
  does not exist, and two of the four first drafts named ids the fixtures do not have.
- `npm run test:e2e` — a new `tests/e2e/activity-board.spec.js`, whose four cases were confirmed
  **failing** against `f3e43eb` first, as were all five new unit tests. Every spec touching this
  phase's surfaces passes, and the full visual suite passes, at `--workers=2`.
- **The full suite is not clean at its default 6 workers, and it is not this phase's doing.** Two full
  runs failed 7 and then 8 tests, overlapping but not identical, all of them 20–48s timeouts rather
  than assertions — `page.reload()` never returning, and `.field-speech-bubble` never appearing
  because a walk parked short. Unmodified `f3e43eb` was then run in a detached worktree on the same
  machine and **failed 4 of its own**, a third distinct set. So it is the harness: six workers
  reloading against one Vite dev server, worst on the two visual tests that reload the most. Recorded
  in the quickref queue rather than fixed here, because capping workers changes the default
  verification path for every future phase and `0083` §1 valued that contention signal on purpose.
  The trap is real, though — the next reader runs the suite, sees red in an area they did not touch,
  and spends the half hour this note exists to save.
- One existing spec was **updated rather than accommodated**: `activity-engines.spec.js` asserted the
  interview counter's old label on the **Mission Tracker**. `requires.label` is one string rendered
  on two surfaces — the board's counter and the tracker's progress line — which is not a complication
  of the P7-1 fix but the argument for it. The label that named the wrong set of people named it out
  in the field as well, on the panel a player has open while walking between them.
- That spec imports a content module directly, which no other e2e spec does. The alternative was a
  hand-copied second copy of Unit 1's ten fragment/slot pairs, which goes stale silently the first
  time somebody re-cuts the plate.
- **Six visual baselines moved**, and each was diffed against its committed version rather than
  accepted: five changed 1119 pixels apiece (§3), and the Caribbean interview changed 9.4% — the
  counter's label, the new placement line, and the heading, in one image, all three intended.
  `activity-interview-riverbend` is seeded with all eight accounts taken, so it correctly does
  **not** show the new line.
- `npm run validate:content` — 0 errors. `npm run lint`, `prettier --check`, `cspell` — clean.
