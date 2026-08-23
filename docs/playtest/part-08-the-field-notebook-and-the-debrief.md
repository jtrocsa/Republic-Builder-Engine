# Part 8 — The Field Notebook and the debrief

**Closed 2026-08-23.** Decision log
[`0085`](../decision-log/0085-a-record-that-is-filed-is-filed.md).

The two halves of a mission's back end: the panel a player has open **while** they work, and the
screen that closes the record. Part 7 owned the frame around the notebook and said so; this part owns
the panel itself, the closer's aftermath, and everything on `missionDebriefScreen()`.

One S3 was routed here — **P7-7**, the mission's question printing on the way in and the way out and
nowhere between. It is P8-3 below, and it was one line.

---

## Findings

| №    | S   | Category       | What                                                                                                                | Outcome                                                      |
| ---- | --- | -------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| P8-1 | S2  | `broken`       | A filed record can still be un-filed — Part 7 closed the closer and left four other verbs that reach the same state | Fixed. One predicate, two layers, four engines.              |
| P8-2 | S2  | `hollow`       | The debrief never says what the conclusion rests on, on the five missions where the player actually chose           | Fixed — "What you kept", where a choice existed.             |
| P8-3 | S3  | `unclear`      | (from P7-7) `missionQuestion` prints on the brief and the debrief and nowhere in between                            | Fixed in passing — one line in the copy column.              |
| P8-4 | S3  | `inconsistent` | The Mission Tracker promises the Field Notebook and delivers the debrief, in the one state where one is waiting     | Fixed — the panel names what is behind the button.           |
| P8-5 | S3  | `hollow`       | The historical-record disclosure renders in one place, on a screen shown once per record and never again — 21 of 21 | → Part 11. The Codex is the durable home for a filed record. |
| P8-6 | S3  | `rough`        | Four of the five `notebook.prompt` strings are one sentence with the last clause swapped                            | → the content queue.                                         |
| P8-7 | —   | —              | The debrief's back-link leaves without clearing it, so `liaisonTrust` does not move                                 | Checked and correct — see below.                             |

---

## The one worth reading twice

**P8-1.** Phase 90F fixed a real bug and asked too small a question. It found that `file` overwrote
`state.filed` unconditionally and stopped that. What it did not ask is what **else** can make
`isActivityComplete()` false again once it is true — and the answer is every other verb on the board.

Completion is `<board settled> && correct && supported`, and both halves stay mutable after filing.
`release` drops evidence the conclusion names and takes away `supported`. `lift` un-solves an
assembly. A flipped `verdict` un-settles an audit. Re-logging a leg un-does a trace. Confirmed
against shipped content before anything was changed — the table is in ADR `0085` §1.

`release` is the door this part owns and the one most likely to be opened: five activities declare a
capacity, all five gate their correct conclusion on named evidence, and the Mission Tracker's button
exists specifically to bring a player **back to a notebook they have already filled**.

The fix is the same trick Phase 90F used from the other side. Each engine owns `isXComplete()` in the
same module as its reducer and its renderer, so both ask it directly: the `file`-only guard moves to
the top of the reducer, above the notebook delegation, and each `render()` disables its own controls
with the same predicate.

**INTERVIEW is the exception and the exemption is the interesting half.** `ask` and `log` are the
only verbs in `engine/activities/` that happen somewhere other than the activity screen — out on the
map, in the field dialogue bubble, where the four question chips are drawn live whatever the mission's
state. A blanket freeze would leave them dead on every stranger the player walks up to afterwards.
Neither can un-complete anything: both only ever add, and coverage counts `logged`.

---

## The choice nobody heard back about

**P8-2.** A `notebook.capacity` is the one mechanic in the game whose whole job is to make a player
give something up: four legs entered and three slots, eight accounts and three slots. Ellis Island's
interview goes further and gates its correct conclusion on two of the three, so the right answer filed
on the wrong evidence reads as _unsupported_ — neither a pass nor a buzzer.

And then the screen that concludes the mission never mentioned it. "What you filed" and its `why`,
what the evidence supports, what it cannot settle — and nothing about the three things the player
chose to stand behind. The Codex says it later, under "What you kept". The debrief now says it too,
from the same list, under the same heading.

Gated on `activity.notebook`. Where nothing was chosen there is nothing to reflect back, and a
seven-item list on the other sixteen would be padding.

---

## What was checked and found correct

- **P8-7.** The debrief has two exits and only one of them clears it: the gold button sets
  `debriefed` and moves `liaisonTrust`; the back-link does neither, and the debrief comes back. That
  is right — the player did not clear it, and re-reading cannot farm trust either way. Both the trust
  ladder and the Meridian reveal gate read the same `debriefed` field, so the two cannot drift apart.
  It is only visible at all because of P8-4, which is what made the tracker's promise wrong.

---

## Play script — 12 steps

Opens on `?warp=field` and requires Unit 2, so pick Riverbend from the Navigation Table first —
the wharf ledger is the only shipped mission that is a TRACE, has a capacity, and gates its
conclusion on named evidence, which is three of this part's four fixes on one screen.

1. Open the wharf ledger from the clerk and clear its Mission Instructions. → The trace board, four
   legs, and an empty Field Notebook saying to enter a leg correctly first.

2. Read the copy column top to bottom. → The mission's question is under the intro, in a gold-edged
   panel above the clerk's line. Note whether you would know what you were doing without it.

3. Answer the first leg on both axes. → It becomes a Field Notebook entry with an **Add to Field
   Notebook** button, and the counter says 0 of 3.

4. Answer all four legs, then keep three of them. → The counter reads 3 of 3 and the fourth entry's
   button goes disabled with "Your Field Notebook is full."

5. File a conclusion your three entries cannot carry. → The closer says so in its own tone, and the
   mission does not finish. Release one, keep another, and file again.

6. File the conclusion the ledger supports. → The debrief.

7. Read the debrief top to bottom. → "What you filed", then **What you kept** with your three
   entries, then what the evidence supports and what it cannot settle.

8. Leave the debrief by **← Back to the field** rather than the gold button. → The map.

9. Read the Mission Tracker's mission block. → It says the debrief is waiting, and its button says
   so too.

10. Press that button. → The debrief again, which is what was promised.

11. Clear it with the gold button, then reopen the record from the tracker. → The board, your filed
    conclusion still green, "Record stabilized" below it.

12. Try to release an entry, and try to re-answer a leg. → You cannot. The notebook says the record
    is filed, and every control on the board is inert.

---

## Routed onward

- **P8-5** → Part 11, the Institute Archive. Every mission's `historicalRecord` — the "Chronicle
  takes real liberties, here is which is which" disclosure — renders only in
  `missionDebriefScreen()`, behind a one-way `debriefed` flag. `debrief.established`, `arcClose` and
  `anomaly` are in the same position. The Codex entry is where a filed record durably lives and
  `backfillCodex()` re-files at boot, so the fix belongs there and costs nothing for existing saves.
- **P8-6** → the content queue (`MISSION-ACTIVITY-CATALOG.md` §6). Units 2, 3, 4 and 6 all open their
  notebook with "Four legs entered, three slots. The one you leave out is not a mistake — it is the
  part of this _\<thing\>_ the _\<page\>_ cannot speak to." A house style for one engine is defensible;
  four near-identical sentences a student meets across four units is worth one pass.
