# 0098 — Nobody is lying

**Phase 99.** Unit 8's three missions — `content/activities/unit-08-activities.js`, 902 lines,
running slate B. **Unit 8 is complete**, and Chronicle covers CED Periods 1–8 of 9 at full parity:
eight units, each with a walkable map, its interiors, and three playable missions on it.

Follows `0094` (content), `0095` (art), `0096` (map and cast), `0097` (interiors).

---

## 1. The unit's problem is that every document is true

Seven units of missions before this one, and every one of them turns on a record that is wrong, thin
or shaped by whoever wrote it. Riverbend's wharf book begins where the labour ends. Philadelphia's
public position has a private interest under it. Richmond's testimony is given to the government
writing it down. Ellis Island's manifest has a column for the colour of your eyes and no column for
who supplied the answers.

**Fairmeadow has none of that.** The deed says exactly what it says. The valuation's eight features
are the real eight, its arithmetic is sound, and two of the five lines audited in this pass are
supported by everything the player gathers. The file jacket is a conscientious officer's file, and
its memorandum is a decent man recording that he told the applicant the truth to his face. Nobody on
this map is lying and nothing is concealed.

So the interview's question — `THE-MAP-PROGRAM.md` §2's binding column fixed it as **what a
neighbour will say on the record** — is not a question about honesty. It is a question about _form
design_: the gap here between what everybody knows and what anybody writes down is not concealment,
it is where the fields are. That is a harder thing to teach than a doctored document and it is the
reason this unit exists.

The three missions are one sentence written three times, each further from what it means:

| mission                                     | record          | what it is                                                                        |
| ------------------------------------------- | --------------- | --------------------------------------------------------------------------------- |
| **The Sixth Item** (interview)              | the deed        | the only place the thing is said in words, sixth on a list about fences           |
| **Step Five** (trace)                       | the file jacket | a refusal with no person in the sentence                                          |
| **First Grade, Fourth Grade** (discrepancy) | the valuation   | the same map the deleted word would have drawn, in language nothing can object to |

## 2. Slate B, and the interview is not Ellis Island's

Unit 7 is slate A and Unit 8 is B, so the three engines differ — adjacency holds. But the engine list
is the cheap half of rule 2 and the question axis is the binding half, and both units run an
INTERVIEW.

Ellis Island's asks **what the official question fails to ask**, of people the form describes
completely in a vocabulary they did not choose. Fairmeadow's asks **what a neighbour will say on the
record**, of people who all know the answer and have nowhere to put it. The two are close enough
that the difference has to be stated rather than assumed: the first is about a form that gets
somebody wrong, the second about a form that has no field for the thing everybody agrees on.

The cast split is the mission again, as it has been since Riverbend. Four people who could be asked
to say it and would not — and four who were never asked at all. Neither half is concealing anything.
The first half has nowhere to put it; the second has no standing to.

## 3. The three-link chain

`suburb-neighborhood-appraisal` requires `suburb-covenant-deed`. `suburb-underwriting-checklist`
requires the appraisal. Every gate before this one was a pair.

It is load-bearing three times over. The appraisal's own prompt asks the player to read the deed's
sixth restriction again. The checklist's prompt asks them to read the appraisal's remarks on Feature
2 again. And a DISCREPANCY's evidence column is minted from an INTERVIEW's _logged_ answers as
`asked:<npc>:<question>` tokens, so without the first gate the audit could open reading "You did not
gather this" eight times.

The third link is a **reader** record behind an interior door, so the chain crosses a surface and an
engine boundary as well as two locks. The gate on it was added in Phase 98 for a reason worth
repeating here: a wiring comment claimed it as fact, the content had none, and softening the comment
would have been quicker and would have lost the chain.

The chain also decides `arcClose`. The deed can never be last, so the arc is authored on the loan
file and the appraisal against one shared const.

## 4. Step five is not a decision

The file jacket was already a route — seven numbered steps, filed in order, with dates — which is
what made it the TRACE rather than the reader record it had been since Phase 95. The mission is
walking it and saying what changes at each step, and the finding is that **the step where the case is
settled is the least deliberate line in the file**.

Steps one to four test the applicant and clear him: entitlement real and unused, credit clean, nine
years' employment verified, payment ratio at twenty-one per cent. Step five reads _appraisal ordered
upon the property described_. From that line no sheet in the file is about him. A clerk ordering a
standard report changes what the document is about, and nobody decided anything.

Two legs are `not-shown`, one at each end, and both are the Riverbend shape — the reading is right
and this record cannot carry it. The first: Title III guaranteed a portion of a loan a private lender
chose to make and lent nothing itself, which is the most important fact about the programme and is
not on the page. The last: whether the applicant had any route of appeal is an argument from
absence, and the mission says so while accepting it.

The standing distractor, `applicant-at-fault`, is the answer to no leg and is the reading the whole
mission refuses. It is on the board rather than left off it, because a wrong answer nobody can
choose teaches nothing.

## 5. An audit where two of five lines are supported

`gapRequiredFor` is a **list** — contradicted _and_ complicated both demand a reason. Canal
Crossroads shipped that form first and has no interview, so its evidence column is `requires: null`
throughout. This is the first audit that both demands a reason for two verdicts and mints its column
from logged answers.

The list is necessary here because three of the five lines are the hard kind:

- **"recorded restrictions of long term, uniformly observed"** — every word true, and it does not say
  which of the six. Until 1947 the agency's manual named a recorded racial covenant among Feature 2's
  protections; the sentence went and the feature kept its weight. The line is also safe from the
  post-February-1950 covenant rule _precisely because it does not recite them_.
- **"no through street connects the two"** — contradicted by ground the player has walked across, and
  the appraiser will say so himself: he rates the property as it will be. A fact about 1959 written
  in the present tense in May 1957 and acted on by a committee fourteen months early.
- **"occupancy throughout is homogeneous"** — accurate as description, upside down as explanation.
  The rating credits the tract for being the thing the rating is manufacturing.

And one is simply supported, marked so, and says why in its own `why`: an audit that finds everything
wrong teaches distrust rather than reading.

## 6. Counts

- 902 lines of content; three missions; eight speakers, four questions, eight useful answers
- five claims and eight observations, every observation keyed to a guaranteed token
- six legs, three support levels, two of them `not-shown`, one distractor answering no leg
- `tests/e2e/unit-08-activities.spec.js`, five tests, covering the three-link chain and the list-gated
  audit
- 2,002 unit tests · `validate:content` 0 errors · `npm run check` and `npm run build` green · every
  visual baseline unchanged

## 7. What is left

Nothing, for Unit 8. Period 9 is the last of the CED and `THE-MAP-PROGRAM.md` §2 already fixes its
slate (**C**) and its interview's question (_who is allowed to hold the record_), and §3 fixes its
setting: a campus archive, 1998. Building it means the documented order again — content, art
reconnaissance, map and cast, interiors, activities — which Unit 8 has now run end to end across five
phases without a variation worth recording.
