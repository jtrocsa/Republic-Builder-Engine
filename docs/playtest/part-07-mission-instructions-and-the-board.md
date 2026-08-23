# Part 7 — Mission Instructions and the activity board

**Closed 2026-08-23.** Decision log
[`0084`](../decision-log/0084-a-filed-record-stops-arguing.md).

The two states of the activity screen a student meets on the way _in_: the Mission Instructions
hand-off, and the board itself. The debrief is Part 8's, and the Field Notebook panel that renders
inside every board is Part 8's too — 7 owns the frame around it, not the panel.

Nothing was routed here. Parts 5, 6A and 6B each inherited work; this one started clean, and the
findings below are what a first read of the surface turned up.

---

## Findings

| №    | S   | Category       | What                                                                                                                             | Outcome                                                          |
| ---- | --- | -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| P7-1 | S2  | `unclear`      | Unit 1's interview counter reads "Islanders' accounts secured — 0 of 7" on a board that lists four islanders and three Spaniards | Fixed — on the board and on the tracker, which share the string. |
| P7-2 | S2  | `unclear`      | The INTERVIEW board opens with **zero live controls** and never says where the asking happens                                    | Fixed in the engine, so all seven interviews get it.             |
| P7-3 | S2  | `broken`       | A finished mission's closer stays live; one click on a wrong option un-files a record the Codex keeps                            | Fixed. `renderCloser()` closes, and four reducers refuse.        |
| P7-4 | S3  | `inconsistent` | The same three steps are "Mission Instructions" on the brief and "How this works" on the board                                   | Fixed in passing — one heading string.                           |
| P7-5 | S3  | `rough`        | Two of Unit 1's seven speakers carry no `role`, so their rows are bare names among five described ones                           | → the content queue.                                             |
| P7-6 | S3  | `rough`        | The board's kicker wraps mid-phrase on the longest engine label: "CASE 1.01 · THE / RECONSTRUCTION"                              | → recorded in the ADR §5, deliberately not chased.               |
| P7-7 | S3  | `unclear`      | `missionQuestion` prints on the way in and the way out and nowhere in between                                                    | → Part 8, which owns the panel a player has open mid-mission.    |
| P7-8 | —   | —              | `waldseemuller-map` is the only activity of 21 with no `briefing`                                                                | Checked and correct — see below.                                 |
| P7-9 | —   | —              | `interviewTokens()` walks every unit's interviews and its ids are not unit-scoped                                                | Checked and clean — see below.                                   |

---

## The one worth reading twice

**P7-3.** Every engine's `file` action overwrites `state.filed` unconditionally once its board is
settled. Nothing said "and not again". So a player who finished a mission, read its debrief, and
later reopened it from the Mission Tracker — which is a documented reason to reopen one, tier 3 of
`activeNotebookActivity()`'s own ordering — could click a wrong conclusion and **un-finish it in one
press**. The board would then say wrong; `progress.codex`, which deliberately never unfiles, would
still say filed; and the "Record stabilized" footer would vanish from a record the field still shows
as secured.

Confirmed against the shipped Unit 1 assembly before anything was changed:

```
filed the correct option -> complete: true  | filed: knowledge
re-filed a wrong option  -> complete: false | filed: daily
```

The fix needed no plumbing at all, which is the pleasing part. `renderCloser()` already computes
`{ correct, supported }` and already receives `locked`, and **every** engine's `isComplete()` is
`<its own board settled> && correct && supported` — of which `locked` is the first term negated. So
three values already in that function say "this record is filed", and the shared closer can close
itself without the host telling it anything and without `engine/activities/` learning what filing
means.

The four reducers got the same rule a second time, at the state layer, because a `disabled`
attribute is a hint and not a lock — which is a sentence `interview.js` was already carrying about
this exact button, four lines below where the guard now sits.

---

## The board that is not where the work is

**P7-2.** INTERVIEW is the only engine that runs part of itself out on the map, in the field
dialogue bubble. Its screen is the notebook that fills up as a result. A first visit therefore shows
a blank speaker grid, an empty Field Notebook, and a locked closer — measured, **zero enabled
controls out of the four buttons present** — and until now nothing on it said where the questions
were meant to be put.

The copy column does not close the gap. Units 6 and 7 say it in step 1 — "any of the four questions
to any person **on this map, indoors or out**" — but the five earlier missions say only "any question
to any person", which is a permission, not a place.

So the line went in the engine, not in five content files. This engine knows its questions are put to
people out in the field; it does not know what field, which is exactly the placeless register
`interview.js` already argued for when its `lockedNote` default lost the word "island". It is gone
the moment anybody has been asked anything, which is when the grid starts speaking for itself — and
that is why Riverbend's baseline, seeded with all eight accounts taken, does not show it.

---

## What was checked and found correct

Two findings were withdrawn on inspection, and they are recorded because the next reader will
otherwise re-find them.

- **P7-8.** `waldseemuller-map` has no `briefing`, alone among the twenty-one, so its Mission
  Instructions screen opens on the engine's mark and "Nobody handed you this one" instead of a face.
  That is the third tier of `missionGiver()` working as designed: the record is anchored to the
  cartographer's table, not to a person, and the screen says so rather than borrowing someone. It has
  its own baseline (`mission-instructions-unheld`).
- **P7-9.** `interviewTokens()` walks **every** unit's interviews and emits
  `asked:<speaker>:<question>` with no unit scope, while question ids are generic (`gold`, `grows`,
  `decides`). A collision would hand a player evidence in one unit's audit that they earned in
  another. Swept all seven interviews: **zero** speaker/question pairs are shared. Nothing enforces
  it, which is the part worth writing down.

---

## Play script — 12 steps

Opens on `?warp=field` (Caribbean, case-001, tutorial complete).

1. Walk to the Taíno community elder and open her record. → Mission Instructions, her portrait, her
   line about the strangers asking the same question.

2. Read the right-hand column top to bottom without scrolling. → The mission's question and "What
   this asks of you" are both above the fold; the glossary is not.

3. Press **Begin the mission →**. → The interview board. Note what you would do next if nobody had
   told you.

4. Read the counter at the top of the board. → "Accounts secured — 0 of 7", and the panels beneath it
   are "The islanders" and "The Spanish party".

5. Read the line under the counter. → It says the questions are put to people out in the field.

6. **← Back to the field**, walk to the canoe worker, ask one question, log it. → The chip marks
   logged; the answer is in the bubble.

7. Reopen the record from the Mission Tracker. → The grid now has one cell in it, and the line from
   step 5 is gone.

8. Compare the copy column's step list with what you read on the brief. → Same three steps, same
   heading.

9. Walk to the cartographer's table and open the map. → Mission Instructions with no face: the
   engine's mark and "Nobody handed you this one".

10. Rebuild the sheet and both cartouches, then file the correct conclusion. → The debrief.

11. Clear the debrief, then reopen the map from the Mission Tracker. → The board, your filed
    conclusion still marked correct, "Record stabilized" below it.

12. Try to file a different conclusion. → You cannot. The options are inert and the record stays
    filed.

---

## Routed onward

- **P7-5** → the content queue (`MISSION-ACTIVITY-CATALOG.md` §6). Two `role` strings on Unit 1's
  interview: `taino-child` and `spanish-sailor`.
- **P7-6** → recorded in ADR `0084` §5 and deliberately left. The 370px copy column is shared with the
  practice check and the Archive Challenges, and "THE RECONSTRUCTION" is the only label long enough
  to wrap.
- **P7-7** → Part 8. The mission's question is on the brief and on the debrief and nowhere while the
  mission is being played; the panel a player actually has open in between is the Field Notebook,
  which is Part 8's subject.
