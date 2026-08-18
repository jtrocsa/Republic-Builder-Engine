# 0065 — Nine missions across three maps

**Phase 81F · 2026-08-15 · Accepted**

The last build phase of the Phase 81 program (`0064`), and the one that could not have gone first:
it needed 81D's slates to know what to build and 81E's Voss to have somebody to hand a mission over
with. Authors the activities for Philadelphia, Canal Crossroads and Richmond —
`content/activities/unit-03-activities.js` and its Unit 4 and Unit 5 siblings, 878, 842 and 868
lines. No engine changed.

---

## The problem

Four activity engines had existed since Phase 68 and two units had content for them. Units 3–5 had
three walkable maps between them, thirty-two named people, twenty-one cited records — and every one
of those records opened the plain reader. A student who walked Richmond met Charlotte Vaughan, who
tells them she is hired out and keeping her night wages in a place she will not name, and then had
nothing to do about it.

`MISSION-ACTIVITY-CATALOG.md` §6 item 8 had carried this as "the standing queue" since Phase 70.

## 1. The question axis is what was authored against, not the engine list

`THE-MAP-PROGRAM.md` §2 fixes the slates, and two of them repeat: Philadelphia and Canal Crossroads
share `assembly` and `trace`, and Richmond runs the Caribbean's slate exactly. That is forced
arithmetic — four engines, three slots, any two slates share at least one — and it is why the
amended rule 2 binds the **question** rather than the engines.

So the three interviews were authored as three different questions and checked against each other
rather than against the rule:

| Map          | Its interview asks                                          |
| ------------ | ----------------------------------------------------------- |
| Riverbend    | how one arrangement looks from eight positions inside it    |
| Philadelphia | what a public position is made of, and who is permitted one |
| Richmond     | what testimony costs when the government is writing it down |

The same discipline governs the traces. Riverbend's follows a cask and asks what a wharf book can
establish about the people who made it; Philadelphia's follows an order and asks what a page can
_cause_; Canal Crossroads' follows a cargo and asks where a ninety-percent saving actually went.
Three chains, three different jobs for one mechanic.

## 2. Canal Crossroads' no-interview debt is real, and it cost the evidence column

Slate D was chosen deliberately and rule 3 exists because Groups B, C and D can all be built without
a single NPC becoming a person. The concrete cost turned up in authoring rather than in design.

A DISCREPANCY's evidence column is gated by opaque `asked:` tokens, minted by `interviewTokens()`
from an interview's _logged_ answers — the only mechanism in the game that makes two players audit
the same record holding different evidence. With no interview on the map there is nothing to mint
one, so every observation in "The Bell and the Book" is `requires: null`.

Rather than accept a flat panel, each entry is held to a stricter standard instead: it is on the
record's own page, or it is something a person on the outdoor map says to anybody who walks up to
them, or it is what the previous mission established. Nothing in that column is evidence a player
might not have. Whether that reads as a design or as a worksheet is the question for the first
playtest of that map — and if it plays as a hallway, the rotation moves.

## 3. Gating went from one case to three, and it decides where the arc closes

`requiresSourceId` shipped in Phase 70 with one consumer. Two more now: `canal-time-book` requires
the toll receipt, and `richmond-price-board` requires the requisition.

The reason is not sequencing for its own sake. The Canal audit's strongest observation is that a
workshop stands on that street _because_ a ton of wheat now reaches New York in eight days, and a
player who has not followed the wheat has no business being handed that sentence. Richmond's audit
reads its whole column off the interview.

The side effect is the interesting part. Gating decides which mission can be **last**, and
`arcClose` rides the debrief of whichever mission is finished last. So which missions need one is a
fact about `requiresSourceId` rather than an authoring choice — a record named by another record's
`requiresSourceId` always precedes it and can never be the ending. The test that used to pin this
for Riverbend by name now derives it and holds every unit to the rule.

**And the arc's claim is a shared const per unit rather than three copies.** It has to mean the same
thing whichever door the player leaves by, and the only way to guarantee that is to stop writing it
three times. Each mission keeps its own `line`, in the voice of whoever is standing there.

## 4. Two engine firsts, both from content

Neither needed a line of engine code, which is the registry's claim being cashed.

**ASSEMBLY's first all-label board chain.** Unit 1's assembly cuts a real scanned sheet into ten
tiles because the Waldseemüller map's _physical form_ is the evidence. Philadelphia's evidence is a
chain of custody, which has no picture — and inventing one would be the exact error the mission is
about, since the mission is that no contemporary text of Patrick Henry's speech exists. Two label
boards, gated `opensAfter`.

**The first content anywhere to pass `gapRequiredFor` a list.** The field has accepted one since it
was widened and nothing had used it. Canal Crossroads asks _why_ on "complicated" as well as on
"contradicted", because once both verdicts exist, both are claims the record does not simply
support — and a line that is accurate and still not telling you what it appears to is precisely the
case this engine was built for. Three of that audit's five claims settle that way.

## 5. What the distractors are for

Every board's sharpest piece is one that belongs nowhere, and each was chosen because a reader
brings it with them rather than because it is merely wrong:

- **A shorthand transcript taken in the church** (Philadelphia). Everyone reaches for it. It has
  never existed — the Convention recorded motions and votes, not debate. Fame is not provenance.
- **A mob of the town's poor** (Canal Crossroads). The notice asks for _gentlemen of property and
  standing_, which is what turned up at Utica in 1835: bankers, lawyers and a judge. Reading the
  opposition as ignorance rather than as interest gets the period backwards, because ignorance can
  be educated and interest has to be defeated.
- **That the arrangement is something the war produced** (Richmond). Anderson had been hiring
  enslaved ironworkers since the 1840s and used them against his own white mechanics when they
  struck in 1847. The war added the third class, not the second.

The same logic runs the standing trace distractors, offered on every leg and correct on none:
`emancipation-policy` (Dunmore's two conditions refuse it in his own words) and `farmer-captures`
(the grower's price fell with the carriage).

## 6. Six visual baselines moved, and reviewing them properly took three passes

Gating a record puts a "Not yet available" row in the Mission Tracker, and the tracker is a **unit**
checklist rendered on every surface — so both gated maps' interiors carry it too. Six baselines, one
changed line each.

`--update-snapshots` wrote all six after showing diffs for two, because a test aborts at its first
failing screenshot and the later ones in that test never ran. The two rooms hidden behind that were
checked by reverting their baselines and re-running rather than accepted on trust. That is the
standing hazard with this suite and it is worth restating: **the number of baselines a run rewrites
is not the number of diffs it showed you.**

## 7. Folded in: the pre-solved sequencing quests, now a test

`renderSequencingQuest()` renders items in authored array order and never shuffles, so a quest whose
items are written in position order opens in the answer and grades a student correct for touching
nothing. Three shipped that way — not the four `ARCHITECTURE-QUICKREF.md` had claimed for eleven
phases, which is its own comment on defects counted by hand.

They are scrambled, each into a derangement so no row is right by accident, and
`tests/unit/sequencing-quest-order.test.js` reads every unit's arrays through
`loadChronicleContent()` rather than a list of imports — so a sixth unit is covered the moment its
arrays are registered. It fails on a solved quest, on a positions run with a hole or a duplicate,
and on finding nothing to check at all. Verified against the real defect by reverting one quest and
watching it go red.

## What this does not do

- **No engine changed.** Nine activities, five registration sites per unit, zero lines in
  `engine/activities/`.
- **Nine of eighteen records, not eighteen.** Three per map is the slate; the rest stay reader
  records deliberately.
- **Unit 3's art is untouched.** Philadelphia is still frozen on six `legacy-*` placeholder sheets,
  and 81F has just put authored interview questions in those mouths. It is the next approved phase
  and ranks first in `THE-MAP-PROGRAM.md` §6.
- **Nothing on `CHRONICLE-CANON.md` §9's deferred list is resolved.** Each map's anomaly is observed
  and not explained, which is what an anomaly is.
