# 0071 — Three missions at the railhead

**Phase 87 · 2026-08-19 · Accepted**

Unit 6's three activities: an INTERVIEW on the receiver's receipt, an ASSEMBLY on the construction
pay sheet, a TRACE on the deputy surveyor's field book. The last thing standing between Unit 6 and
parity with Units 1–5, and the state Units 3–5 sat in between Phase 68 and Phase 81F.

Nothing here is a new engine surface. Slate C was fixed in
[`THE-MAP-PROGRAM.md`](../design/THE-MAP-PROGRAM.md) §2 before the map existed, and
`unit-06-campaign.js`'s own header — written in Phase 84, when every `activityRoute` was still
`null` — had already said the slate "lands on the receipt, the payroll and the survey in that
order." It did. One new content file, four registration edits, one test widened.

---

## 1. The interview's question is the half that binds, and Unit 6's is entitlement

Slate C is Philadelphia's, three units later. That is legal by the same reasoning that let Richmond
repeat the Caribbean's slate four units on: the engine list is not the axis, and with four engines
and three slots any two slates share at least one. `MISSION-ACTIVITY-CATALOG.md` §5 rule 2 as
amended in Phase 81A puts the weight on the **question**, and the four now in the game are four
different things:

| Unit | Its interview asks                                                 |
| ---- | ------------------------------------------------------------------ |
| 2    | how one arrangement looks from eight positions inside it           |
| 3    | what a public position is made of                                  |
| 5    | what testimony costs when the government is writing it down        |
| 6    | **what entitles a person to be standing here, and on whose paper** |

Eight speakers, four questions, one useful answer each, two per question so nothing is dead, and
every speaker with one question left unauthored so their `fallback` fires. Two groups: people whose
business is the paper, and people standing on the ground it describes.

The finding the closer grades is that **calling the sale a theft is the wrong answer**, and it is
the wrong answer in an instructive direction. A theft is something a person does, and can therefore
be pinned on somebody and stopped by catching them. The player spends the mission failing to find
that person: the register writes what the statute tells him and has never seen the account the money
goes into; the buyer's agent bid in public, for cash, at or above the appraisal, on eleven separate
slips, because the act capped the tract and never the man; the homesteader paid her own money and
volunteered whose furrows she is planting. What the receipt records is a procedure that produces the
outcome of a theft without ever requiring anybody to commit one.

## 2. A slot takes exactly one fragment, and the first ASSEMBLY draft did not know it

The payroll's boards were first drafted as three columns — what the month earned, what was charged
back, what he was paid in — with six charges going into the middle one. `validate:content` returned
six errors in one shape: _Slot "charged" is claimed by both "board" and "outfit" — a board has
exactly one valid configuration._

The schema is right and the draft was wrong. An ASSEMBLY is a **reconstruction**, not a sort: every
slot takes one fragment and every slot must be claimed, which is what makes there be one correct
board rather than a defensible one. Richmond's assembly obeys it and reads as three columns only
because its three classes of men happen to be three fragments.

The rebuild is better than what it replaced. Board one is **five kinds of charge**, because the six
deduction lines really are five different relationships and the doctor and the hospital fund are one
levy between them:

- **a service** genuinely provided at a price nobody can shop — board at the boarding car, $12.00
- **a sale** made without being offered — blankets and a slicker, $4.50
- **a deposit** that comes back — shovel and pick, charged on issue and credited on return, $2.25
- **credit** at the only counter within reach — store account, order book No. 3, $9.80
- **a levy** owed whether it is used or not — the doctor at ½ of 1% and the hospital fund, $0.48

Discovering that a wall of deductions has five mechanisms in it is the board. Board two is the
record's own second prompt — which could he refuse? — as four slots: the one he could decline
outright and be no worse off (the tools), the one he could decline in principle with nowhere else to
go (the boarding car), the one with no line on the form to decline (being paid in money rather than
a time check), and the one that is not a charge at all and is what makes the rest stick (forfeiture
of the earned balance if he leaves before the section closes).

Each board's two distractors are the two things a reader reaches for that are not on that axis:
board one's are the advertised rate (what the charges come out of, not one of them) and the store's
discount (not on the sheet in any form); board two's are the two refusals nobody offered him —
bargaining over a posted rate, and combining with the rest of Section 4, which is real, historical,
and **priced** by the forfeiture clause rather than forbidden by it.

The arithmetic closes: $45.50 gross, $29.03 deducted, $16.47 paid — about thirty-six cents on the
dollar of the advertised rate, in paper, at the quarter.

## 3. The TRACE's third leg is what `requiresSourceId` was for

`railhead-survey-field-book` has required `railhead-land-office-receipt` since Phase 84 and the
reason is leg three. The chain is a boundary: a treaty describes it, an 1859 deputy runs it and
returns a line, the line is platted and filed, **the office sells from the plat**, and an 1873 deputy
running the treaty line finds the marked one thirty-three chains and sixty links away — 2,217 feet,
about two fifths of a mile — and does the only thing his instructions allow, which is report both and
return the ground between as unsurveyed.

The support axis is where the mission is won. Leg three is the largest thing in the chain and this
field book contains none of it: a field book records measurements, not sales. The player knows it
anyway, because they are carrying a receiver's receipt for a hundred and sixty acres described
exactly that way — a different document from a different desk. Saying "true, and not from this page"
is the whole distinction the second question exists for, and the gate is what guarantees the player
has the other page in hand when it is asked.

`fraud` is the standing distractor and is the answer to no leg. It is what everybody reaches for on
a boundary that turns out to be in the wrong place, and the finding is much worse if nobody cheated:
a fraud can be prosecuted, and this cannot. The deputy's own note refuses it — he ran the treaty
line, marked it, reported both, in a signed book returned to an office that will read it.

## 4. Two indoor speakers, and a test that was narrower than the game

Elias Fenn and Ezra Holt stand in the land office, and the interview names them. That is new: every
speaker in the three shipped interviews is on the outdoor roster.

It costs a player nothing they were not already paying. The receipt the interview opens from is
anchored to Fenn, so the door has to be opened before the interview exists at all — and Phase 86 put
both men indoors precisely because their outdoor posts were shutting their own doorsteps.

`fieldNpcById()` has always resolved across `fieldSurfaces()` — the outdoor map plus every interior —
which is why a briefing, a debrief and an inline question chip all work indoors. **The test did
not.** `activity-content.test.js` built its cast from `FIELD_MAPS[unitId].npcs` alone, which is the
outdoor roster, in two places. It was widened to a `castOf()` helper matching the runtime.

That is worth recording as a category rather than a fix: the test was **rejecting content the game
plays correctly**, and it went unnoticed for two phases only because no interior had anybody in it
worth briefing a mission until Phase 86. A test narrower than the runtime is not a safe default — it
silently narrows the design.

## 5. The anomaly is a confirmation, and that is the escalation

One anomaly per unit, and the five now form a sequence in one direction. Riverbend: a figure altered
under a scrape. Philadelphia: a broadside collated toward an edition that does not exist yet. Canal
Crossroads: a toll assessed exactly right against an unpublished schedule. Richmond: a name washed
out of a paste-up with the count left wrong underneath it.

Cottonwood Junction's is in the field book, and it changes nothing. The deputy enters the magnetic
variation at 11° 30' east and reduces every bearing in the book from it correctly. In the margin, in
the hand this thread has now used four times, a second variation is written — smaller by three
degrees and some minutes — with a year against it. The year is 1934.

The mundane explanation is unusually strong, which is the requirement: a later surveyor's note in a
bound GLO field book is the most ordinary thing that can happen to one, retracement surveys need the
old declination to recover the corners, and there are thousands of them. The one thing it cannot
account for is that the book is in the Chronicler's hands in June of 1873. It corrects nothing. It
agrees with the deputy, in advance, about a number he had no way to know.

It sits on the trace deliberately and not on the assembly. The payroll's whole historical finding is
that everything on it is lawful, and planting a frame-anomaly beside that argument would blur the
two. The survey's finding is that nobody lied, which the anomaly does not touch — it is about the
variation at the head of the book, not about the two lines.

## 6. `sourceById` had five units in it, and there are six

Wiring the missions up turned up a defect older than this phase, and a worse one than anything in it.
Every one of the new e2e tests failed on `<h1>Nothing open</h1>` — `activityScreen()`'s recovery path
for a save whose record no longer resolves.

`sourceById()` was a hand-written chain:

```js
const official =
  CASE_001_SOURCES.find(...) || CASE_004_SOURCES.find(...) || CASE_007_SOURCES.find(...) ||
  CASE_010_SOURCES.find(...) || CASE_013_SOURCES.find(...);
```

Unit 6 was never added to it. **From Phase 85 until this phase, not one of the seven records on the
railhead could be resolved by id** — which meant not one of them could be opened, by an activity or
by the source reader.

Nothing failed loudly, and the reason is worth recording. The field draws its record markers and its
"Examine →" buttons from `activeFieldMap().sourcePoints`, which is a different table with its own
entries, and the Mission Tracker draws its checklist from `sourcesForCase()`, which reads
`UNIT_SOURCES` and was correct. So the map looked complete from every angle: seven records listed,
markers where they should be, a gold button on the register's dialogue bubble saying _Examine
Receiver's receipt →_. Phase 86's `railhead-interiors.spec.js` asserts that button exists and passes.
Pressing it was the thing nobody had done.

The fix is to read `UNIT_SOURCES` — the table that already has every array in it — the same way
`caseById()` two lines above reads `UNITS` rather than naming each unit's cases. That deletes the
registration site rather than adding a sixth entry to it, which is the standing rule in CLAUDE.md
about a literal that a second case needs. `main-teacher-mode-resolution.test.js` gains an
`it.each` over all six cases asserting every source a case lists is a source that resolves, so a
seventh unit is covered the moment its array is registered.

**The second symptom only appeared once the first was fixed**, and it moved three visual baselines.
`sourceAvailability()` reads `sourceById(sourceId)?.requiresSourceId`, so with the record
unresolvable the gate had been reading `undefined` and never firing: the survey field book was
_available from the moment the player arrived_, in a case whose whole authored order depends on it
not being. With the lookup fixed, the Mission Tracker's row for it correctly reads a greyed **Not yet
available** instead of naming Whitfield Doss, and because the tracker is a unit checklist rendered on
every surface, the identical one-row change appears in the outdoor shot and in both interiors. Three
baselines re-banked, each diff opened and confirmed to be that one row.

Three things this says about the suite. **1,606 unit tests and 174 e2e tests did not catch a unit
whose records could none of them be opened**, because every one of them tested a surface that reads a
different table. **The visual baselines had been photographing the wrong state for two phases** and
could not know it — a baseline records what the app does, not what it should. And the thing that
caught both was writing the e2e spec for the new content, which is the argument for the "bank it"
rule in the verification ladder, stated by a case where the banking found the bug rather than merely
recording the fix.

## 7. What this does not do

- **The reveal.** Voss's line on this map still reports Meridian's operation as a fact she is puzzled
  by, nothing is named, and no activity mentions it. Building the reveal is a canon decision with its
  own ADR and does not ride along with a content file.
- **The other four records.** The tariff, the removal roll, the Clarion and the telegram file keep
  `activityRoute: null` and are read rather than played. A map has three missions; seven records with
  seven mechanics is not a richer map, it is a longer one.
- **Any engine change.** No new registry slot, no new optional field, no change to any of the six
  files in `engine/activities/`. Everything above is content against contracts that already existed,
  which is the claim those contracts were built to be able to make.

## 8. Verification

`npm run validate:content` — 133 groups, 0 errors (the new `UNIT_06_ACTIVITIES` block plus
`checkActivityRoutes`, which already walked `unit06`). `npm run test` — 66 files, 1612 tests, up 21:
`activity-content.test.js` went 85 → 100 as Unit 6 joined the fifteen `it.each(AUTHORED_UNITS)`
blocks, and `main-teacher-mode-resolution.test.js` 3 → 9 for §6. `npm run lint` clean, `npm run
build` clean, cspell clean after adding `retracement`. `npm run test:e2e` — 178 tests across 36 spec
files, all passing at `--workers=1`; the parallel run reports eight flakes and none of them survives
a serial re-run, which is the standing behaviour of this suite. **Three visual baselines moved and all three
were reviewed** — the railhead and its two rooms, each showing the same single Mission Tracker row
changing to a greyed “Not yet available”, which is §6’s gate working for the first time. No other
baseline moved, which is the right result for a phase that changed no CSS.
