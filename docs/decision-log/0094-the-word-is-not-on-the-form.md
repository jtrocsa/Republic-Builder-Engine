# 0094 — The word is not on the form

**Phase 95 · 2026-08-27 · Unit 8's content, one phase before its map**

Opens **Candidate B** from `ARCHITECTURE-QUICKREF.md` §6, the last candidate the queue was carrying.
This is the first slice of it, and it is the slice Units 3 through 7 each got first: the content
exists, is validated, and is deliberately not reachable.

---

## 1. Grounds for Refusal

Period 8 is 1945–1980 — the Cold War, the civil rights movement, Vietnam, the Great Society and the
reaction to all of it. A unit gets three cases, and this one spends them on three refusals:

- **case-022, the field case.** A composite subdivision outside Philadelphia in August 1957. A
  lender refuses a loan, and the grounds are written down in a form that never says what they are.
- **case-023.** The federal loyalty program. A board refuses employment where "reasonable grounds
  exist for belief" that a person is disloyal — without producing the accuser.
- **case-024.** A registrar refuses a ballot on a test he sets, administers and grades himself.

The arc is not three defeats. It is a refusal getting harder to see, and then — once — answered in
its own medium, because the Voting Rights Act's coverage formula is a piece of arithmetic written to
do what a decade of case-by-case litigation could not. **A student who reads Period 8 as rights being
granted will miss that every one of these decisions was made on paper by somebody with a form in
front of them, and that the successful remedy was also a form.**

Vietnam, the Great Society, the movements and the conservative response are carried by the two
Archive Challenges rather than by a fourth case, which is what Unit 6 did with industrial labour and
Unit 7 with Progressivism.

## 2. Fairmeadow is invented and the mechanism is not

`THE-MAP-PROGRAM.md` §5 fixes the interview: **what a neighbour will say on the record.** That
sentence is what settled the composite question, and it settled it differently from Unit 7.

Ellis Island is real and named because the station is the subject rather than the setting. This map
cannot be, for two reasons and the second is binding. There was no single subdivision with the
appraisal, the covenant, the lending office and the model house in one walkable corridor. And an
interview asks **eight invented people what they will say on the record** — eight invented people
saying that about a real named town is an accusation against a real address.

So the town is composite in the way Riverbend, Canal Crossroads and Cottonwood Junction are, and
every mechanism under it is documented: the eight rated location features, the covenant's standard
form down to its domestic-servant exception and its automatic ten-year renewal, a federal guaranty
routed through a private committee that need state no reason, and a minimum-lot amendment whose
preamble is the Standard State Zoning Enabling Act's own words.

**August 1957 is load-bearing and it is load-bearing because of what was happening elsewhere.** On
13 August 1957 William and Daisy Myers moved into a house in Levittown, Pennsylvania, and crowds
gathered outside it nightly until the state attorney general obtained an injunction. On 9 September
the Civil Rights Act of 1957 was signed. On 24 September the 101st Airborne escorted nine students
into Central High School. The map's month is the month the same question was being asked at a school
door, in Congress, and on a street where nobody was breaking any law at all.

## 3. The finding is a rating, not a slur

The 1938 Underwriting Manual said it outright — a neighbourhood holds its value when properties
"continue to be occupied by the same social and racial classes" — and recommended a recorded
covenant to make sure of it. That language came out between 1947 and 1950. **The ratings did not
change.**

So the appraisal on this map has eight neutral-sounding features on it and arrives where the old form
arrived, and the audit a player runs against it cannot work by finding a word. It has to work by
reading a number: forty years of remaining economic life on one side of a highway and fifteen on the
other, which is a prediction about who will live somewhere entered as a measurement of buildings.

That is deliberately harder than the other six maps' central findings, and it is why §5 calls this
the strongest documentary-form map in the program. Two supporting records make it provable rather
than merely arguable. The deed carrying the covenant is dated **March 1953**; the lending office's
checklist carries the agency's own post-1950 rule that such a covenant may not be relied on in the
rating; and the appraisal credits the tract under Feature 2 for "recorded restrictions of long term,
uniformly observed" without reciting them. Three documents, one contradiction, and nobody in the
chain had to break a rule to produce it.

## 4. Slate B, read off the table

`THE-MAP-PROGRAM.md` §2 gives this map **slate B — `interview` · `discrepancy` · `trace`**, read off
that table's own row. `0081` §5 records what reading it off a prose summary cost Unit 7, so the
campaign file's header now says where the slate came from as well as what it is.

The three engines land on §5's three named records — the covenant deed, the neighbourhood appraisal
and the guaranteed-loan file. Every `activityRoute` in this phase is `null`, because a route may only
name an engine once an activity is authored for it and `validate:content` checks. One thing is
authored ahead of the activities on purpose: the appraisal carries
`requiresSourceId: "suburb-covenant-deed"`, the same shape Unit 7 gave its board minute, because a
DISCREPANCY's evidence column is minted from the INTERVIEW's logged answers and without the gate the
audit can open empty.

The two missions are `hipp` and `mcq`, which the ledger chose: across Units 1–7 the fourteen missions
run five `sequencing`, five `evidence-organizing`, two `hipp` and two `mcq`. Unit 6 was the first
unit to spend both on the thin types and this is the second — and here the content wanted them
anyway. The loyalty program's problem is that you cannot source an anonymous informant, so the
mission puts a document with the opposite property in front of the student: Margaret Chase Smith's
Declaration of Conscience, whose author, audience, situation and interest can all be established to
the sentence. And the entire difficulty of case-024 is contained in four lines of §4(b), which is one
question with one right answer and three wrong ones students actually give.

## 5. Registering a unit cost one thing Phase 90J did not predict

Phase 90J left a claim on the record (it has no ADR of its own; the quickref carries it): a new unit costs **one line in `unit-registry.js` plus three
imports and one line in `UNIT_MODULES`**. Measured against this unit, that is nearly right and the
exception is worth writing down.

| File                                       | Cost                   | Predicted by                |
| ------------------------------------------ | ---------------------- | --------------------------- |
| `content/unit-registry.js`                 | 1 line                 | its own header              |
| `repositories/local-content-repository.js` | 2 imports + 1 line     | its own header              |
| `content/chronotravel-plates.js`           | 4 lines                | its own header, and a test  |
| `content/maps/navigation-table-views.js`   | 1 line                 | its own header, and a test  |
| `tests/unit/chronotravel-plates.test.js`   | the queued-plate guard | it exists to be edited here |
| `scripts/build-field-guide.js`             | **a fix**              | nothing                     |

The activities module is the one predicted cost that did not arrive: `UNIT_MODULES` takes
`activities: {}` inline rather than a stub file, because three activities arrive with the map they
are played on and an empty file is something a future reader has to open in order to discover is
nothing.

**`build-field-guide.js` threw on the first run after registration**, and the reason is the
interesting part. Phase 90J deleted that file's hand-written `UNIT_IDS` literal and imported the
registry instead — which is the right move and is the same move it made in four other places. But the
field guide documents **maps**, and the registry's own header says in as many words that _the content
list is a superset of the playable list, never the other way round_. Importing the registry made the
guide assert that the two lists are equal. It did not fail at the time because at that moment they
happened to be.

So the guide now derives its own set from `FIELD_MAPS` in `main.js`, filtered through `UNIT_IDS` for
order. The guard that matters is kept and points the other way, unchanged in substance: a unit whose
map and constants exist in `main.js` but which was never added to the manifest still throws.

**Three hand-written counts beside that derived list had gone stale by two units.** The masthead said
"CED Periods 1–5 of 9", "5 units" and "the task waiting at the end of each of the fifteen cases"
while seven units and twenty-one cases shipped, and the contents rail numbered its last two sections
6 and 7 on the same assumption. That is the per-unit-table-with-a-fallback-and-no-test shape a fourth
time, in a generated document, which is the worst place for it — a reader has no reason to distrust a
page that says nothing on it is transcribed by hand. All five numbers are derived now.

## 6. What was deliberately not done

- **`main.js` is untouched, and `UNITS` does not name unit-08.** `activeFieldMap()` falls back to
  Unit 1's Caribbean for a unit it has no map for, so registering a field case early does not error —
  it lands the player on the wrong continent. This is the state Units 3–5 sat in until Phase 81F,
  Unit 6 until Phase 87 and Unit 7 from Phase 89 to 89C.
- **No map, no interiors, no cast, no activities.** Those are the next slices, in that order.
- **Voss gets no line and no `revealedText`.** `THE-FIELD-LIAISON.md` §4 puts Units 7–8 at "reluctant
  alliance", which is Scene E and a canon decision of its own rather than something to fold into a
  unit build; `tests/unit/field-liaison.test.js` fails if a second map grows a reveal.
- **No new Navigation Table view.** All three cases fall inside the existing `north-america` box —
  the first unit since Unit 5 to add none, which is what a reusable framing is for.

## 7. Verification

`npm run validate:content` — 0 errors, **157 groups** (145 before). `npm run test` — 1,920 passing,
75 files, including the four registry-sensitive suites (plates, Navigation Table views, sequencing
order, unit close). `npm run lint` — 0 errors, the 5 standing warnings. `cspell` clean, with five
proper nouns added to `project-words.txt`. `npm run docs:field-guide` rebuilds and now reports seven
units, twenty-one cases and Periods 1–7. `npm run build` clean.

**This phase cannot move a player-visible pixel by construction**, and the bundle says so: `main.js`
does not import Unit 8's content, `local-content-repository.js` has no runtime consumer, and
`Fairmeadow` appears nowhere in `dist/`. The one thing the build does gain is the plate, because
`CHRONOTRAVEL_PLATES` is imported by `main.js` — which is what Unit 7's registration did too, and is
the whole point of having painted it in Phase 88A. Unit 9's plate is still queued and still guarded.
