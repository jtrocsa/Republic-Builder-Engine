# 0053 — Riverbend on the engines, and the first TRACE

**Status:** Accepted · Phase 70 · 2026-08-02
**Supersedes nothing. Amends `0051` §5 (TRACE's first mission) and `0049` §6 (one of the five).**

## Context

Phase 68 built four activity engines; Phase 69 made Unit 1's three missions legible. Both closed
leaving the same line in `ARCHITECTURE-QUICKREF.md` §6: all 21 sources in Units 2–5 carry
`activityRoute: null` and fall through to the plain source reader. The engines existed; the content
did not.

Unit 2's only walkable map is **case-004, Riverbend Settlement** — fifteen NPCs already written with
sharply distinct standpoints on land, labor and the record, and three cited sources. Cases 005 and
006 are non-map quest missions with no sources at all, and an activity is reachable only by walking
to a record on a field map, so this pass is scoped to Riverbend by the owner's call.

---

## 1. The slate is deliberately not Unit 1's

Unit 1's map runs INTERVIEW, ASSEMBLY and DISCREPANCY. Riverbend runs **INTERVIEW, DISCREPANCY and
TRACE**.

Repeating all three would have produced the same mission with different nouns, which is the thing
`MISSION-ACTIVITY-CATALOG` exists to prevent (§5 rule 2, "no two adjacent units may share a primary
activity"). Rule 3 requires a Group A entry in every unit and INTERVIEW is the only built one, so the
engine that had to go was ASSEMBLY — which also wanted a public-domain document scan the repo does
not have.

The two engines that do repeat are pointed at different questions than Unit 1 asks with them, which
is the actual protection against sameness:

|             | Unit 1                                                                        | Unit 2                                                                                 |
| ----------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| INTERVIEW   | Four topical questions; what a record holds is what its makers thought to ask | The same civic question set put to everyone; the answers stratify by legal status      |
| DISCREPANCY | Error or design — was the writer mistaken, or writing for someone?            | Was he wrong, or right about his own corner of a settlement that is not one condition? |

## 2. TRACE debuts at Riverbend, not Canal Crossroads

`0051` §5 and QUICKREF §6 both record TRACE's first mission as Unit 4's Canal Crossroads
(`M4·C One Ton to New York`). **The owner moved it**, and this section is the record of that.

A wharf account of a staple crop leaving for London is the purest chain in the game — the cask
transforms at every leg and the actors change hands each time — and it sits on a map a player can
already walk, on the case whose central question is the transatlantic economy. Canal Crossroads is
not spent by this: it keeps its own TRACE whenever Unit 4 is authored.

**"One Hogshead" turns on one leg and one distractor.** The first leg keys to `not-established`,
because a wharf account opens at the landing with fourteen hogsheads already casked and never names
a pair of hands. `labor-cost` — _"the cost of it falls on bound labor"_ — is offered on all four legs
and is the answer to none of them. It is true of the world, and this record cannot establish it. It
lands only because the player interviewed those exact people two records earlier, which makes it the
sharpest distractor in the game and the reason to run this mission at all: being right about the
world and wrong about the evidence is the most comfortable mistake in the discipline, and a
Chronicler is answerable for the record. That is catalog §2 as a mechanic instead of a rule in a
document.

## 3. The interview's bar is one number, and it is eight

Per `0052` §3, and sized so the audit that consumes it always has a full column: eight speakers, one
useful answer each, `requires: { useful: 8, label: "Accounts secured" }`. Eight of Frethorne's twelve
observations key to those eight, so a player who met the bar always arrives at the audit with more
observations than there are claims. Three more key to flat answers nobody is required to ask for,
which is what keeps the engine's cause and effect real.

**The Angolan man's answer stays unresolved.** The August 1619 arrivals off the _White Lion_ were
traded at Point Comfort for provisions and the muster rolls list them without a term — neither the
chattel slavery Virginia would codify decades later nor the termed indenture the Englishman in the
next field holds. `main.js`'s NPC table already made that call in his ambient line and said why. The
interview does not resolve it either, and Frethorne's letter is silent on him, so the audit cannot
either. That silence is the finding.

## 4. `sourceAvailability()` gates on content now, not a case id

Frethorne's DISCREPANCY reads its evidence column out of `interviewTokens()`, so reaching it first
opens an audit with nothing to audit against. That is the same gate Case 1.01 has — and Case 1.01's
shipped as a literal:

```js
if (caseId === "case-001" && sourceId !== "taino-context") { … }
```

one of the engine/content-boundary violations `CLAUDE.md` names. Adding a second hard-coded case id
would have deepened it, so the second consumer paid to make it data: a source may declare
**`requiresSourceId`**, naming a record of its own case that must be secured first. Case 1.01's two
later records now carry it and behave identically; Riverbend gates only `riverbend-letter`, leaving
the ledger's TRACE open because it works cold.

The function refuses a record that names itself, which is the one failure mode this shape has that
the literal did not.

## 5. Two things folded in because the files were already open

- **`case-004-sequencing-headright-to-trade` no longer ships pre-solved.** Its three items were
  authored `position: 0,1,2` in array order, so it opened in the answer and graded a student correct
  for touching nothing. Catalog §6 row 2, `0049` §6 — **four of the five remain**, in Units 3 and 4.
- **`riverbend-ledger` gets reader MCQs** (`readerQuestType`/`readerQuestIds`) instead of
  `sourceReader()`'s textarea. Four legs, a naming and a filing is already three acts of reading, and
  a paragraph box after them is a fourth ending — the same call as `waldseemuller-map` in `0052` §9.
  Its Investigation Challenge is dropped for the same reason `taino-context`'s was: the gate asks a
  player to predict the sourcing of a worksheet that no longer opens. The quest itself is left in
  place, unreferenced and commented as such.

## 6. `tests/unit/activity-content.test.js` makes the authoring rules enforceable

Everything a schema cannot see, because each invariant spans two files: that
`requires.useful` equals the speaker count and every speaker has exactly one useful answer; that no
question is dead; that every speaker id is a real NPC on that unit's map; that every
`asked:<npc>:<question>` token in a DISCREPANCY names a speaker and a question that exist; that the
audit always opens with at least as many guaranteed observations as it has claims; and that
`howItWorks` and `terms` are present on every authored activity — catalog §6 row 7 turned from a
standing condition into a failing test. It covers both authored units, so Unit 1 gained the coverage
too.

## Consequences

- **TRACE has content.** QUICKREF §6's queue drops from Units 2–5 to Units 3–5; 18 sources still
  route to the plain reader.
- **A locked record shows no badge and an anonymous tracker row.** Riverbend's arrival state is two
  lit records of three, which is a deliberate change to what the map looks like on entry.
- **A new baseline lesson, minor:** a screen change does not reset the document's scroll, so a reader
  reached from the foot of a long activity page lands mid-page. Pre-existing and shared with the
  Waldseemüller route; the visual spec scrolls to top rather than re-recording a baseline around it.

## Not done here

- **Cases 005 and 006 keep their quest missions.** Hosting an activity from `missionScreen()` needs a
  path that does not exist, and the owner scoped this to Riverbend.
- **No fifth engine, no NPC substrate fields** (`topics`/`want`/`stance`/`knows`) — an INTERVIEW
  holds its answers in activity content, per `0051`'s "Not done here."
- **No interior for Riverbend**, no new art, no new dependency, and the Archive Room stays paused.
