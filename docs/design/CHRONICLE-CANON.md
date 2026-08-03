# Chronicle Canon

The story rules the game may not contradict, and the line between them and ordinary history.

Written in Phase 78 alongside decision log `0061`. Its job is to keep two things apart that are
easy to blur and expensive to un-blur later: **what a traveler did to the record**, which is
Chronicle's fiction, and **what is ordinarily hard about historical evidence**, which is the
subject the game teaches. A student who learns that a biased source has been "damaged by temporal
drift" has been taught something false about history, and the fiction has eaten the curriculum.

Read `docs/design/CHRONICLE-VOCABULARY.md` first for the words the interface uses. This file is
about the world those words describe.

---

## 1. Scope: this binds story, not mechanics

This document governs **narrative**: dialogue, briefings, debriefs, cutscenes, Codex prose, and the
premise a mission is built on.

It does **not** grant any new mechanic. In particular it does not touch
[`MISSION-ACTIVITY-CATALOG.md`](./MISSION-ACTIVITY-CATALOG.md) §2, which stays absolute:

> **A Chronicler changes the record, never the event.**

Everything below is compatible with that rule, and §4 explains why the two do not collide even
though Chronicle's own field doctrine sounds as though they should.

---

## 2. The five travel rules

These are canonical and complete. Nothing else about how travel works is settled, and no new
mechanism may be introduced without amending this list.

1. **Surviving objects retain temporal imprints.**
2. **Anchor glass makes those imprints accessible.**
3. **The Navigation Table opens a passage through a strong imprint.**
4. **A lasting intervention causes temporal drift.**
5. **The Codex preserves evidence recorded before that drift changed the present.**

Three consequences worth stating because they are the ones authors get wrong:

- **Travel is object-led, not date-led.** A Chronicler does not pick a year; they pick a surviving
  thing and arrive where it was. This is why the Navigation Table is a table with records on it
  rather than a dial, and why every map in the game is anchored to a document.
- **Entering the past does not cause drift.** Rule 4 says a _lasting intervention_ does. Observation
  is free, which is what makes the job possible at all.
- **The Codex is not at risk.** Rule 5 is a guarantee: the Codex is what drift cannot reach. Never
  write the Codex as unstable, corrupted, or under attack — it is the one fixed point, and the
  entire premise collapses if the player cannot trust it.

## 3. The operational rule

Chronicle's field doctrine, as Chronicle states it to its own agents:

> **Enter carefully. Observe freely. Preserve evidence. Change only what is necessary to stop an
> outside alteration.**

## 4. Why the doctrine and the mechanic do not collide

The fourth clause sounds like a licence to change history, and the catalog rule in §1 forbids
exactly that. Both are correct, and the gap between them is deliberate.

**The doctrine is institutional policy. The mechanic is what a player does.** Chronicle authorises
intervention in principle; no shipped mission has ever required it, and none may. In practice a
Chronicler arrives after the alteration, and the work is to find it, document it, and file a record
that survives — which is the game, and which is also a fair description of what historians do.

This is not a fudge. It is the most useful thing the canon does, because it makes Chronicle's own
doctrine **an object of suspicion rather than a description of gameplay**. An institution that
grants itself permission to alter the past, insists nobody ever uses it, and will not say what it
did the first time is a much better antagonist-adjacent employer than one with clean hands. Later
units are built on that gap.

Authors: when a scene tempts you to let the player prevent something, the answer is that they
preserve the evidence of it instead. That is not a lesser outcome in this game — it is the win
condition.

---

## 5. The Original Drift

Chronicle's first physical expedition caused a lasting historical change. Chronicle contained the
immediate incident. The consequences had already begun spreading forward through connected people,
decisions, artifacts, and records, and that continuing chain is the **Original Drift**.

Chronicle keeps traveling because stopping would let the existing change go on spreading unwatched.

The explanation the player is given early, and which is true as far as it goes:

> Chronicle's first expedition caused a change that is still spreading. The Codex detects
> contradictions when that change reaches protected historical evidence. Chronicle sends agents to
> investigate and contain those contradictions.

**This is truthful and incomplete.** Chronicle leadership has concealed material facts about the
original intervention and about how it was contained. That concealment — not the accident — is
Chronicle's actual moral problem, and it is what the Meridian Institute formed in response to.

The specific incident is **deliberately unwritten**. See §9.

---

## 6. What is drift, and what is simply history

This is the most important table in the document. Ordinary uncertainty in history is **not**
temporal instability. A source may be incomplete, biased, false, misleading, unverified, or
contradicted by another source without anyone having travelled anywhere.

| Situation                                           | Correct term              |
| --------------------------------------------------- | ------------------------- |
| Part of a source is missing or destroyed            | Incomplete evidence       |
| Creator, date, or origin has not been verified      | Unverified source         |
| Evidence has been removed from its original setting | Out of context            |
| Sources disagree                                    | Conflicting evidence      |
| A source contains an inaccurate claim               | Misleading or false claim |
| A traveler changed, removed, or planted it          | Altered evidence          |
| Its existence before an intervention is unclear     | Origin uncertain          |
| Codex evidence and the present archive differ       | Temporal anomaly          |

**Never use drift or anomaly as a synonym** for bias, disagreement, a gap, an unreliable witness, or
an ordinary mistake. The four classifications in `CHRONICLE-VOCABULARY.md` §2 already cover all of
that, and they are the historian's vocabulary rather than the game's.

A useful test when authoring: _would a working historian describe this the same way?_ If yes, it is
an evidence problem and takes an evidence word. Only if the honest answer is "this could not have
got here without somebody putting it here" does an interference word apply.

### Anomaly, as shipped

`AnomalySchema` in `engine/activities/contract.js` is two flat strings — `noticed` (what a careful
reader would spot on the page) and `note` (what a Chronicler makes of it). There is no id, no
state, no branching, and the engine never learns what an anomaly means.

**That shape is canon.** An anomaly is something a Chronicler _notices and flags_, not a computed
difference the game calculates. The Codex-versus-present-archive comparison in the table above is
the narrative reason an anomaly matters; it is not a data requirement, and no author should wait
for a diffing mechanism that is not going to exist. An anomaly is observed, not solved — the moment
it becomes a puzzle with an answer, it stops being unsettling.

**An anomaly is archival, not fantastical.** The first one shipped (Phase 77, decision log `0060`)
is Riverbend's wharf book: fourteen hogsheads entered over a scraped fifteen, in a hand that is not
the clerk's. Nothing glows. It is the kind of thing a careful reader finds in a real ledger, and
that is the register every later one should match — a page that has been interfered with looks like
a page that has been interfered with.

**One per unit, and the rule is enforced.** Two anomalies on a map make them a collectible to
sweep up; one makes it a thing that happened. `tests/unit/activity-content.test.js` fails on a
second.

---

## 7. The two institutes

Both are real institutions with defensible positions. Neither is correct.

|                | Chronicle Institute                         | Meridian Institute                                          |
| -------------- | ------------------------------------------- | ----------------------------------------------------------- |
| Founding claim | The record must survive to be argued with   | Knowing better obliges you to act                           |
| Asks           | What does the evidence allow us to defend?  | If we know where history should go, why refuse to guide it? |
| Method         | Observe, preserve, file                     | Observe, judge, redirect                                    |
| Virtue         | Restraint; evidence outlives interpretation | Refusal to watch avoidable suffering                        |
| Danger         | Secrecy and institutional control           | Moral certainty and unchecked power                         |

**Meridian descended from Chronicle.** It began as a faction inside it that lost an argument about
disclosure and intervention, and its technology is visibly Chronicle's technology developed further
— same anchor glass, related mechanisms, different housing. That shared ancestry is the point and it
must stay legible in the art (see [`MERIDIAN-VISUAL-IDENTITY.md`](../art/MERIDIAN-VISUAL-IDENTITY.md)).

Meridian's arc across the game is a decline that its own members notice: humanitarian intervention
first, then confidence, then wealthy private clients buying historical outcomes, then an internal
split between the operatives who meant the first thing and the leadership selling the last one.

**Writing rule.** Meridian is never generically evil and Chronicle is never simply right. A scene in
which one of them has no answer is a scene that needs rewriting. The player's final problem is not
which institution wins — it is who should control access to historical evidence.

---

## 8. Terminology discipline

Every term below does work no other term does. **Do not add synonyms for any of them**, and do not
invent a proprietary Chronicle name for a thing that already has an ordinary one.

| Term               | Meaning                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| Temporal imprint   | The connection a surviving object retains to what it encountered         |
| Anchor glass       | The material that detects and amplifies imprints                         |
| Navigation Table   | Chronicle equipment that opens a passage through a strong imprint        |
| Field Notebook     | The player's working evidence space during one mission                   |
| Codex              | Chronicle's protected permanent record                                   |
| Temporal drift     | The continuing consequence of a lasting intervention                     |
| Original Drift     | The spreading chain begun by Chronicle's first expedition                |
| Temporal anomaly   | A difference between Codex-protected evidence and what now exists        |
| Altered evidence   | Evidence changed, removed, planted, or manufactured through intervention |
| Origin uncertain   | Whether an item predates the intervention cannot yet be established      |
| Era Record         | The accumulated record for one APUSH unit                                |
| Field Assignment   | Teacher-selected supporting work outside the map                         |
| Meridian Institute | The rival organization descended from Chronicle                          |

**Banned phrasing.** These sound technical and mean nothing, and they push the game toward science
fiction and away from history. `tests/unit/chronicle-canon.test.js` fails on any of them appearing
in shipped content or engine code:

- temporal integrity
- quantum record
- anchor instability
- causal resonance
- timeline corruption
- one true timeline

There is no "correct timeline" in this game and no meter measuring one. There is a record, and the
question is what it can support.

**Introduce a term once, then stop explaining it.** After the player has met anchor glass, later
dialogue simply uses it. A mission briefing that stacks three lore words before naming the academic
task has failed, however accurate each word is.

---

## 9. Status ledger — canonical, provisional, deferred

The brief that produced this document was explicit that some ideas are settled and others are not.
Recording which is which is the point of the ledger: a future session that treats a provisional idea
as canon will build content on it, and unbuilding that is expensive.

### Canonical — may be relied on

- The five travel rules and the operational rule (§2, §3).
- Ordinary historical uncertainty is never drift (§6).
- The Codex is protected and never unstable (§2).
- Chronicle caused the Original Drift, and its ongoing spread is why Chronicle still travels (§5).
- The Director's early explanation is truthful and incomplete (§5).
- Chronicle concealed material facts about the original intervention and its containment (§5).
- Meridian emerged from a disagreement inside Chronicle, began with humanitarian intervention, and
  later divided over private clients (§7).
- Chronicle's danger is secrecy; Meridian's is moral certainty (§7).
- The final conflict is about who controls access to evidence (§7).
- A Chronicler changes the record, never the event (§1).

### Provisional — usable in planning, not yet in shipped content

- The Field Liaison, **Emery Voss**, and their eventual Meridian connection. See
  [`THE-FIELD-LIAISON.md`](./THE-FIELD-LIAISON.md).
- That the relationship with the player is genuine and stays genuine after the reveal.
- The reveal's placement in Units 5–6.
- "Meridian Institute" as the permanent name.

### Deferred — deliberately unwritten

Do not resolve these in passing. Each is a decision with content consequences.

- **The exact Original Drift incident** — what the first expedition did, to whom, and when.
- The exact intervention Chronicle reversed or contained.
- Emery Voss's biography, gender, and final allegiance.
- The complete unit-by-unit plot.
- The final player decision and the Director's closing dialogue.
- How the Original Drift connects to each individual APUSH unit.

The last one is worth a note. It is tempting to make every unit a link in one chain, and that is a
trap: it would make nine periods of American history into set dressing for a science fiction plot,
which is the failure mode this whole document exists to prevent. Most units should be a place with a
real historical problem in it that a Chronicler is sent to record. The frame is why the player is
there — it is not what the unit is about.
