# 0085 — A record that is filed is filed

**Phase 90G · 2026-08-23 · Spine Review Part 8 — the Field Notebook and the debrief**

Part file: [`part-08-the-field-notebook-and-the-debrief.md`](../playtest/part-08-the-field-notebook-and-the-debrief.md).
Supersedes nothing; it finishes [`0084`](./0084-a-filed-record-stops-arguing.md), which turned out to
have closed one door of five.

---

## 1. The bug, and why the last phase only half-fixed it

Phase 90F found that a finished mission's **closer** stayed live: `file` overwrote `state.filed`
unconditionally once a board was settled, so reopening a filed record from the Mission Tracker and
clicking a wrong conclusion un-finished it in one press, while `fileToCodex()` — which deliberately
never unfiles — kept the entry it had written. It fixed that, correctly.

It did not ask the more general question, which is what Part 8's static audit asked: **what else on
this screen can make `isActivityComplete()` false again?** The answer was everything.

Every engine's completion is `<its own board settled> && result.correct && result.supported`. Both
halves are still mutable after filing:

| Verb             | Engine        | What it takes back                                |
| ---------------- | ------------- | ------------------------------------------------- |
| `release`        | all four      | `supported` — drops evidence the conclusion names |
| `lift`           | `assembly`    | `<board settled>` — un-solves a board             |
| `verdict`, `gap` | `discrepancy` | `<board settled>` — un-settles a claim            |
| `log`, `support` | `trace`       | `<board settled>` — un-does a leg                 |

Measured against shipped content before anything was changed:

```
ASSEMBLY    case-001-assembly-universalis      -> filed: knowledge  | complete: true
  after lift                                   -> complete: false   | filed still: knowledge
DISCREPANCY case-001-discrepancy-what-...      -> filed: purpose    | complete: true
  after verdict flip                           -> complete: false   | filed still: purpose
TRACE       case-004-trace-one-hogshead        -> filed: dependence | complete: true
  after re-log wrong                           -> complete: false   | filed still: dependence
  after release(crossing)                      -> complete: false   | filed still: dependence
```

`release` is the one Part 8 owns and the one most likely to be pressed. Five activities declare a
`notebook` capacity — Riverbend, Philadelphia, Canal Crossroads and Cottonwood Junction's traces, and
Ellis Island's interview — and all five gate their correct conclusion on `requiresEvidence`. The
Mission Tracker's own button exists to bring a player **back to a notebook they have already
filled**; the Release control sits on the entry the conclusion rests on.

The resulting state is the same one `0084` described: the board reads unfinished, the Archive reads
filed, the field marker flips back from secured, and the tracker swaps "✓ Filed" for a progress bar.

## 2. The fix: one predicate, two layers, and one exemption

Each engine already owns `isXComplete(activity, state)` **in the same module** as its reducer and its
renderer. So both layers ask it directly — no plumbing, the same property `0084` exploited from the
other side:

- **State layer.** The `file`-only guard `0084` added moves to the top of each reducer, above the
  `actNotebook` delegation (which is where `release` is handled). Net change per engine: one line
  moved.
- **Render layer.** Each `render()` computes the same predicate and disables its own controls, and
  passes it to the shared `renderNotebook()` as `settled`. A `disabled` attribute is a hint and the
  reducer is the lock — both are asserted.

`renderNotebook()` is **told** rather than deriving it, unlike `renderCloser()`. It has no `locked`
to negate, and guessing from `correct && supported` alone would lock a legacy save whose board came
apart before the guard existed — refusing the releases that are the only way back out of it.

**INTERVIEW keeps `ask` and `log` live, and that exemption is the interesting half.** They are the
only verbs in `engine/activities/` that happen somewhere other than the activity screen: out on the
map, in the field dialogue bubble, where `renderInterviewInline()` draws four question chips on a
speaker whatever the mission's state. A blanket freeze would leave those chips dead on every
stranger the player walks up to afterwards — a worse bug than the one being closed. Neither verb can
un-complete anything: both only ever add, and coverage counts `logged`.

**The visible tell is the notebook's own line, not a dimmed panel.** The closer can stay silent
because its filed option is sitting there in green; a disabled "Release" with nothing beside it just
reads as broken. `.evidence-notebook__settled` says "This record is filed. What you kept is what it
was filed on." and replaces the capacity note, which no longer binds on anything.

## 3. The debrief now says what the conclusion rests on

A `capacity` turns the Field Notebook from a review panel into a decision — the Field Notebook /
Codex distinction as a mechanic rather than a slogan. The screen that **concludes** the mission never
mentioned the decision again: "What you filed" and why, what the evidence supports, what it cannot
settle, and nothing about the three things the player chose to stand behind.

`missionDebriefScreen()` now prints them, from `activityOutcome()`'s own `evidence` — the same list
`fileToCodex()` writes into the Codex, under the same heading the Codex uses. One concept, one name.

**Gated on `activity.notebook`, deliberately.** The other sixteen activities keep everything they
surface, so there is no decision to reflect back and a seven-item list would be padding.

## 4. Two smaller things, in the same seam

- **The mission's question is on the board.** It printed on Mission Instructions and again on the
  Debrief and nowhere in between — the way in and the way out, nothing while the work is done. Same
  defect `howItWorks` had before Phase 71 and the same fix: a moment first, then a reference that
  stays in the copy column. (Routed here from Part 7 as P7-7.)
- **The Mission Tracker names what is behind its button.** A filed mission whose debrief has not been
  cleared opens on the debrief — that is `activityScreen()`'s third state and it is correct. What was
  wrong is a panel promising the Field Notebook and delivering something else. The state is reached
  by leaving the debrief through its back-link, which is an ordinary way to get back to the map.

## 5. Recorded, not fixed

**The historical-record disclosure is shown once and is then unreachable.** All twenty-one activities
declare a `historicalRecord`, and `missionDebriefScreen()` is the only thing in the codebase that
reads it — a screen gated on `!entry.debriefed`, which is one-way. "Chronicle takes real liberties.
Here is which is which" is the game's honesty statement about its own fiction, and a student cannot
go back to it. `debrief.established`, `arcClose` and `anomaly` are in the same position;
`debrief.remains` survives into the Codex as `openQuestions`, and nothing else does.

**Routed to Part 11 (the Institute Archive) rather than fixed here.** The durable home for a filed
record is the Codex entry, which already carries the conclusion, the evidence and the open questions
and is Part 11's subject. Putting a second copy on the activity board would be the wrong fix made
cheaply, and `buildCodexEntry()` self-heals through `backfillCodex()` at boot, so doing it there
costs nothing extra for saves that already exist.

**Checked and found correct**, recorded so the next reader does not re-find it: the debrief's
back-link leaves without setting `debriefed`, so `liaisonTrust` does not move and the debrief
reappears. That is right — the player did not clear it — and both the trust ladder and the Meridian
reveal gate read the same field, so nothing can drift between them.

## 6. Verification

- `npm run test` — 72 files, 1828 tests, all passing (8 new: three on the notebook panel, three
  engine regression cases, and the release refusal and `ask`/`log` exemption on INTERVIEW).
- `npm run lint` — 0 errors, 5 warnings, all the standing pre-existing baseline.
- `npm run build`, `npx prettier --check`, `npx cspell` — clean.
- Every e2e spec that touches these surfaces, in one batch — `filed-record`, `visual-regression`,
  `field-notebook`, `mission-debrief`, `activity-board`, `activity-engines`,
  `field-objective-tracker`, `codex`, `unit-02-activities`, `unit-05-activities`, `riverbend-arc`,
  `meridian-reveal`, at `--workers=2`. **84 passed.**
- **Seven visual baselines changed and each was measured rather than rubber-stamped.** Two were read
  as rendered diffs; the other five were compared to their committed versions pixel by pixel, which
  gives a sharper answer than an eye does. Six activity boards differ **only inside columns 75–422** —
  the 370px copy column — from row ~390 down: the mission question and everything it pushes. The
  board half of every one is pixel-identical. `mission-anomaly` is a clipped element shot whose text
  is unchanged and whose background gradient moved because the debrief page grew by §3's section.

**One run of that batch failed one test and it was not this phase's doing.** The first pass reported
83/84, failing `unit-02-activities.spec.js`'s "puts the charter's questions to the people standing on
the land" — a `walkToNpc` case whose seed has three of eight answers logged against
`requires: { useful: 8 }` and `filed: null`, so `isInterviewComplete()` is false and **§2's guard
cannot fire on it at all**. It passes in isolation, and the identical batch re-run is 84/84. Same
signature as Phase 90F's diagnosis: worker contention against one Vite dev server, reported as a
correctness failure because an e2e suite has no other way to report it. Quickref §6 Candidate C, and
this is now the second phase to pay half an hour proving a red is not its own.
