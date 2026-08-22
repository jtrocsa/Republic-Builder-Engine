# 0081 — Three missions at the immigrant station

**Phase 89E.** Unit 7's three activities: slate A — INTERVIEW, ASSEMBLY, DISCREPANCY — on the
manifest page, the medical inspection card and the board of special inquiry minute. Unit 7 is
complete, and with it every unit the game ships is at parity: a walkable map, its interiors, and
three playable missions on it.

**The third mission was built twice**, and §5 is about why. It shipped first as a TRACE, against a
sentence in `unit-07-campaign.js` that had said so since Phase 89 and was wrong — and the rebuild
is the more useful half of this phase, because the error was in prose, prose is not executable, and
nothing in the repository was in a position to notice.

## 1. The interview's question, which is what the slate actually turns on

`THE-MAP-PROGRAM.md` §2 gave this map slate A before any of it existed — `interview` ·
`assembly` · `discrepancy`, which is Unit 1's and Unit 5's slate and deliberately not Unit 6's.
The same table's note says why the engine list is only half the rule: with four engines and three
slots any two slates share at least one, and three of the four share `interview`, so a repeated
engine has to be pointed at a different question. This unit shares `interview` and `assembly` with
Cottonwood Junction next door, and its interview asks **what the official question fails to ask**.

The four shipped interviews ask how one arrangement looks from eight positions inside it
(Riverbend), what a public position is made of (Philadelphia), what testimony costs when the
government is writing it down (Richmond), and what entitles a person to be standing here and on
whose paper (Cottonwood Junction). The distinctness is not rhetorical. **All four of those are asked
of people the record is thin about**, and the move each teaches is the same move: find who is
missing.

This form is not thin. It has twenty-nine columns and a field for the colour of your eyes, and the
campaign file's header stated the problem before any of this was authored: a record that leaves
somebody out can be caught by asking who is missing, and a record that describes somebody
completely, in a vocabulary they did not choose and cannot correct, cannot. So the eight people are
not there to supply what the form omits. They are there to supply what it gets wrong while filling
every column — which is a harder thing to see, and the reason this is the fifth interview rather
than a fourth variation on the other four.

The mission is called **Column Thirty**, and there are twenty-nine.

## 2. The first interview with a Field Notebook cap

`NotebookSchema`'s own doc comment has described this shape since Phase 72 and nothing had shipped
it: `capacity` caps what you **keep**, not what you **gather**, and the judgement worth teaching
happens after the gathering rather than during it. Every shipped interview asks for every useful
answer on the map (`requires.useful === speakers.length`) and then keeps all of them, so the
notebook has been a review panel on five maps rather than a decision.

Column Thirty gathers eight and keeps three, and its closer's correct option names two of the eight
through `requiresEvidence`. That produces a state no interview has been able to reach: **the right
conclusion, filed unsupported**. A player who kept the interpreter, the elder and the detained woman
has three true and moving accounts and cannot establish what the sheet is; the argument lives in the
purser's provenance and the inspector's column nine, and those are the two the option names.

This is the same pairing Cottonwood Junction's trace uses, moved onto the engine where the
temptation to keep everything is strongest — an interview surfaces its findings one at a time, over
a long walk, and each one feels earned when it arrives.

Two bars, and the schema and the tests hold them apart:
`tests/unit/activity-content.test.js` still asserts `requires.useful === speakers.length`, and
`tests/e2e/unit-07-activities.spec.js` files the correct option twice — once on three findings that
do not carry it and once on three that do.

## 3. A speaker behind the second door

Unit 6 was the first interview to name people standing indoors, and decision log `0071` §4 records
the test that had to be widened to allow it: `castOf()` read `FIELD_MAPS[unitId].npcs`, the outdoor
roster, while `fieldNpcById()` has always resolved across `fieldSurfaces()`. Both of Cottonwood
Junction's indoor speakers are in one room.

Ellis Island has two rooms, and Anna Krajewska is in the second. Five speakers are on the wharf, two
are at the registry desks and one is in the board of special inquiry room, which is the furthest
that resolution has been asked to reach and the highest interior share of any interview in the
program. Nothing needed changing to allow it — the Phase 87 widening was the whole fix — but nothing
in the suite would have noticed a future edit pulling the cast back to seven people on two surfaces,
so the e2e spec asserts her by name.

**She is not the woman on the minute**, and the difference is the point. The board minute is a case
that ended: a married woman with eleven dollars, excluded two to one, reversed within the hour when
her husband walked in with a bank book. Anna Krajewska is nineteen, travelling alone, with the same
eleven dollars and nobody coming on Thursday. She debriefs the audit, and what she says is that
everything else on her page is the same as the other woman's.

## 4. The assembly is a sort by _kind of judgement_, and two of its pieces are not findings

The record is the posted line-inspection key: eighteen chalk letters, a staircase, and the Class A /
Class B rule. The source's own prompt asks the student to count how many letters name something a
doctor could treat and how many name something a person simply is, and the assembly is that question
made playable.

Board one takes five letters and five slots — a named disease (CT), a sign standing in for something
unnamed (X), a permanent feature of a body (L), a condition that will end on its own (Pg), and a
stage of life (S). **An ASSEMBLY slot takes exactly one fragment and every slot must be claimed**;
the schema enforces both, and Unit 6's payroll is the cautionary case — first drafted as a sort into
buckets, it returned six schema errors in one shape.

The two distractors are the interesting half. `SI` is an instruction to another office wearing the
same chalk as a diagnosis, and a person carrying it across a hall of several thousand people is
carrying a message about themselves that they cannot read and everyone else can. `stairs` is the
climb itself, which is printed on the same posted sheet and is **the instrument rather than a
finding** — it is what produces every other mark on the board.

Board two opens on the first and asks whose decision each part of the key is: the statute's, the
doctor's, or three men who are not doctors'. Its two distractors are decisions everybody expects to
find here and nobody in the building makes — whether the person is treated (nothing on the key
contemplates treatment) and whether an exclusion may be appealed (the Secretary of Commerce and
Labor, three offices away).

The finding is that one piece of chalk does two jobs. Class A is a diagnosis and the statute
excludes. Class B is a prediction about the American labour market, written into the act of 20
February 1907 in those words, certified by a doctor and decided by lay inspectors.

## 5. The third mission was built on the wrong engine first, and that is the finding

The slate line in `unit-07-campaign.js` has read "**slate A — `interview` · `assembly` ·
`trace`**" since `076b387` ("Unit 7 exists on paper", Phase 89). Slate A is `interview` ·
`assembly` · `discrepancy`. That sentence is **slate C's** row copied onto the wrong unit, and
slate C is Cottonwood Junction's — the unit immediately before it. `THE-MAP-PROGRAM.md` §5's own
Unit 7 block repeated it in Phase 89C, `ARCHITECTURE-QUICKREF.md` §6 repeated it in Phase 89D, and
Phase 89E authored a complete TRACE — four legs, five effects, a support axis, an e2e spec — before
anybody opened §2's table.

**The tell was in the table the whole time, one line under it: "adjacency holds throughout — no unit
repeats its neighbour's three."** A slate-C Unit 7 next to a slate-C Unit 6 is precisely the thing
that sentence forbids, and this ADR's own first draft had a paragraph arguing that repeating all
three of a neighbour's engines was legal on the question axis alone. It is not. The question axis is
what makes a _shared engine_ legal; it was never a licence for an identical slate, and writing that
justification should have been the moment to stop and check.

Three things went wrong and only the first is about Unit 7:

1. **A prose restatement of a governance table outlived the table.** Four documents said the same
   wrong thing, each citing the one before it, and none of the four was the table.
2. **Nothing in the repository could catch it.** `validate:content` cross-checks a source's
   `activityRoute` against its activity's `kind` and is perfectly happy with a correctly-wired
   mission from the wrong slate. The unit suite had no opinion either. The error was invisible to
   every gate the project has, which is why it survived three phases.
3. **The wrong engine was not obviously wrong.** The TRACE was a decent mission — following a
   finding through five places is a real reading of that minute, and nothing about it felt forced.
   That is the uncomfortable part: "it played fine" turned out to be evidence of nothing.

The fix is `tests/unit/mission-slates.test.js`, and it **reads the markdown tables rather than
restating them**, because a restatement is another copy of the thing that failed. It asserts that
every unit with authored activities runs exactly its slate's three engines, that adjacency holds
across all nine assignments (so Units 8 and 9 are covered before a line of their content exists),
that every slate names three distinct real engines, and — the assertion that keeps the rest honest —
that the parse found four slates and nine units at all, so a reformat of those tables fails loudly
instead of quietly making every other assertion vacuous. Reverting the single word `discrepancy`
back to `trace` in the content file reproduces the original failure with the right message, which
is how the test was verified rather than assumed.

### And the DISCREPANCY is the better mission, which is worth saying plainly

Not a consolation prize. The audit is the clerk's own account of his job, tested: he says he types
what is said _in answer to a question_, and that a woman who explains something nobody asked about
has nowhere to go on the form. Six lines, and exactly one is contradicted by anything eight people
told you: two are supported outright — the closed session and the absent medical certificate — and
three are true as far as they go and complicated by where they came from.
An audit that finds every line false teaches distrust rather than reading, which is Richmond's price
board's lesson and this one's too.

The contradicted line is the board's opening move: _you are the person entered upon line 11 of
manifest sheet 14?_ She is, and the answers on that line are not hers — the purser signs only that
he copied faithfully from a booking agent's stubs, and Rozalia Bern was in the room at Lemberg while
her husband's brother answered for her. The hearing establishes identity and then proceeds as though
identity settled authorship. Its gap kind is `no-question`, which is the clerk's own diagnosis.

And it makes `requiresSourceId` do a second job it was not doing before. A DISCREPANCY's evidence
column is minted from the INTERVIEW's _logged_ answers as `asked:<npc>:<question>` tokens, so an
audit reached without the interview opens with a right-hand column reading "You did not gather this"
all the way down — the condition Canal Crossroads has to design around, having no interview at all.
Here the only cross-surface lock in the game guarantees the column is full, and every one of the
eight observations hangs off a _useful_ answer that `requires.useful: 8` makes unavoidable. The
gate that fixes the mission order is the same gate that makes the last mission playable.

## 6. The anomaly is on the interview, and it is the first one that is

Every unit from 2 to 6 carries exactly one, and all five are the same family: a document quietly
annotated by a hand that knew something it could not know, with every ordinary explanation covering
the fact of the annotation and exactly one thing about it impossible. All five sit on a trace or a
discrepancy.

Unit 7's is on the manifest. Somebody has ruled column seven — able to read; able to write — down all
thirty lines, and only that column, and totalled a percentage at the foot. A clerk tallying literacy
for the Commissioner-General's annual return accounts for all of it. What it does not account for is
that the figure is a year's number for a fiscal year with ten weeks left to run.

It was chosen over three alternatives that all failed the canon test in `CHRONICLE-CANON.md`:
**ordinary historical uncertainty is never temporal drift**, and neither is ordinary
foreknowledge. A pencilled note of the head tax rising to four dollars on 1 July is early and not
impossible — the act was signed in February and any officer in the building could tell you. A
category from the 1911 _Dictionary of Races or Peoples_ would have required inventing a historical
claim about what that book added. A margin note protecting the husband's employer would have
repeated Unit 6's operation. Column seven costs nobody anything in 1907, is the whole of the
examination after 1917, and a year-end aggregate cannot be computed in April — which is one
impossibility, in a document, about a column that will matter later.

## 7. What was wired, and what was not

Five integration points, all of them the same lines Unit 6 added in Phase 87:
`content/activities/unit-07-activities.js` is new; `unit-07-campaign.js` moved three
`activityRoute: null` to their engines and left the other four alone; `main.js` gained an import and
a spread in `ACTIVITY_CONTENT`; `local-content-repository.js` gained an import and an `activities`
key; `scripts/validate-content.js` gained a schema block and lost the comment explaining why Unit 7
had none.

**The four remaining records keep `activityRoute: null` deliberately.** The circular, the boarding
division's return, the line's instructions to its agents and the commissioner's daily statement
degrade to the reader through `sourceActivityRoute()`, exactly as the non-mission records on the
other six maps do. Three missions is the slate; seven activities would be a different design.

**Nothing was done about Emery Voss**, per `ARCHITECTURE-QUICKREF.md` §6's standing decision. She is
posted on the wharf with a line and no `revealedText`, `THE-FIELD-LIAISON.md` §4 puts Units 7–8 at
"reluctant alliance" which is Scene E and a canon decision of its own, and
`tests/unit/field-liaison.test.js` fails if a second map grows a `revealedText`. Unit 7 owes her a
post and a line and that is all it owes her.

## 8. Verification

`npm run test` 1789 passing across 70 files, including 115 in `activity-content.test.js` with Unit 7
added to `AUTHORED_UNITS` — which is where the sparse-grid rule, the one-useful-answer-per-speaker
rule, the 40-word deflection ceiling, the orphan-tag check and the arc-close derivation all bind.
`npm run validate:content` clean at 145 groups, up from 144: the new
`unit-07-activities.js: UNIT_07_ACTIVITIES` block, plus `checkActivityRoutes()` now cross-checking
three live routes against three activity kinds. Lint 0 errors, 5 warnings (unchanged). Build clean.
`npx cspell` clean on the new file.

`tests/unit/mission-slates.test.js` is new: four tests making §2's two tables executable, verified by
reverting the content's one word back to the wrong engine and watching them fail with the right
message rather than by assuming they would.

`tests/e2e/unit-07-activities.spec.js` is new: seven tests. The notebook cap on both sides of the
support gate; the speaker behind the second door; the staircase distractor and the hints ladder that
fires before its misread; the audit holding the closed session up and contradicting the one line the
hearing rests on, with all eight observations present and no "You did not gather this" among them; the
anomaly firing on the interview, with the arc close correctly absent from it. Plus two field walks,
which are the only tests here that touch the map: one up to Dr. Grasso in the inspection hall,
proving the record now opens Mission Instructions rather than the reader — the single thing this
phase changed about the map — and one up to the purser out on the wharf, putting a question chip to
him, because this is the first interview whose speakers span three surfaces and `renderInline()` is
the only place an engine reaches onto the map. That last one also pins the gate that is easy to
lose: `liveFieldInterview()` requires an activity **state**, not merely a `briefed` flag, so the
cast has nothing to be asked until the record has actually been opened.
