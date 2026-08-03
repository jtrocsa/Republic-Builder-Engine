# Map Narrative Structure

What a unit's map is for, what is locked inside it, what a teacher may change, and how a unit's
record gets from "arrived" to "secured".

Written in Phase 78 alongside decision log `0061`. Pairs with
[`MISSION-ACTIVITY-CATALOG.md`](./MISSION-ACTIVITY-CATALOG.md), which covers what an individual
mission may mechanically be; this file covers how a map's missions add up to a story and where
teacher-editable work attaches without touching it.

---

## 1. Two kinds of work, and the sentence that separates them

> **Missions recover the essential record. Field Assignments strengthen the Era Record.**

That is the whole distinction, and it is about narrative function, not about permissions. It needs
**no new mission engine, no new permission system and no new progression tracker** — all three
already exist and already behave this way.

### Mission — locked

A playable investigation inside a unit's walkable historical map, reached by Chronotravel from the
Navigation Table and rendered by one of the four activity engines. This is the game's story.

Fixed, and not teacher-editable: map geography, map NPCs and their behaviour, map dialogue,
historical objects, local events, mission order, required story evidence, anomalies, Meridian
clues, cutscenes, and the map's narrative resolution.

**"Mission" is the shipped word and it stays.** `CHRONICLE-VOCABULARY.md` §2 already defines it and
CLAUDE.md's fixed vocabulary outranks any renaming. Where architecture prose needs the contrast
explicit it may say _map mission_ in lower case, as a description rather than a term. **"Core
Operation" is not used anywhere** — it was considered as a story-facing label and rejected, because
a third name for something already called a Mission in code, docs and UI is precisely the synonym
proliferation `CHRONICLE-CANON.md` §8 forbids.

### Field Assignment — teacher-editable

Supporting academic work that sits **outside** the walkable map, built from the slots a teacher can
already curate. Student-facing name: **Field Assignment**. The slots had no student-facing name
before this document; that gap is what the term fills.

A Field Assignment may not: change the map, create plot facts, introduce required Meridian
information, change a mission's outcome, decide which cutscene fires, or be referred to later as
though every class saw the same source or question. The last one is the easy mistake — a debrief
line that says "as the pamphlet you read showed" is broken for any classroom whose teacher swapped
that slot.

The **`T` marker** is teacher-interface shorthand for "editable". It is not Chronicle terminology
and students never see it. Note that no literal `T` badge exists in `main.js` today; the editable
set is defined by data, below.

## 2. The firewall already exists in code

This is an audit finding, not a proposal. Two mechanisms enforce the split:

**One.** Teacher-editable slots are exactly six `slot_kind` values, fixed by a database check
constraint (`supabase/migrations/0010_ledger_record_slots.sql`):

```
source · mcq · sequencing · evidence-organizing · hipp · ledger-record
```

The four activity engines — `interview`, `assembly`, `discrepancy`, `trace` — **are not in that
set**. A map mission is therefore not a slot, and there is no code path by which a teacher can
select, replace, reorder or remove one.

**Two.** `engine/custom-content-authoring.js` carries a source's engine-wiring fields forward
unchanged rather than exposing them as form fields:

> A source carries several engine-wiring fields (visual, `activityRoute`, feedback, citation,
> externalUrl, reconstruction, investigationMode/investigationQuestId) that a teacher shouldn't
> hand-edit through a text form […] `buildSourceContent` carries those fields forward unchanged.

`activityRoute` is the string that decides which engine a record opens. It is never a form field, so
editing a source cannot change which mission runs.

### The one real leak

A teacher **can** edit `title`, `creator`, `date`, `record`, `excerpt` and `prompt` on a source that
carries a non-null `activityRoute`. Mission logic is unaffected — since Phase 69 an activity owns
its own `record.context` and `record.text`, so nothing the engine reasons about lives on the source.
But `source.title` is printed by the mission UI, so **a teacher renaming such a source renames a
locked mission's record on a student's screen.**

Low severity, real, and worth closing deliberately rather than by accident. The fix is to exclude
sources with a non-null `activityRoute` from the source slot's candidate pool. Not done here —
Phase 78 ships no code — but `tests/unit/chronicle-canon.test.js` now pins the seam that matters
most, that `activityRoute` never becomes a teacher-facing form field.

---

## 3. The Era Record

**Era Record** is the accumulated historical record for one APUSH unit: the locked map missions plus
whatever supporting work a teacher assigned.

**It is a derived view, not a tracker.** Every state below computes from progress that already
exists, and Phase 78 adds no persisted field. Building a second progression system for this would
break the standing guardrail, and it is unnecessary:

| Status                           | Condition                                             |
| -------------------------------- | ----------------------------------------------------- |
| **Map Investigation Incomplete** | Some mission on the unit's map is not yet filed       |
| **Essential Record Recovered**   | Every map mission is filed in `progress.codex`        |
| **Supporting Evidence Needed**   | Map complete; the unit's assigned work is outstanding |
| **Era Record Secured**           | `unitReadyForReview(unit)` is true                    |

The existing sources of truth, verified in `main.js`:

- `isComplete(caseId)` and `progress.completedCases` — per-case completion.
- `progress.codex`, keyed by `activity.id` — a mission filed with a conclusion its evidence could
  carry (`engine/codex-archive.js`, decision log `0058`).
- `unitArchiveChallengesComplete(unit)` — the unit's Archive Room work.
- `unitReadyForReview(unit)` = every case complete **and** every Archive Challenge satisfied.

Two cautions. First, **do not describe the Codex as unstable** in any status copy — the Codex is the
protected thing (`CHRONICLE-CANON.md` §2). "Era Record Secured" refers to the unit's record being
complete, not to the Codex being repaired. Second, these labels are **not yet implemented**;
adopting them is a copy decision for whichever phase surfaces unit status, and it should reuse the
existing status surface rather than adding one.

---

## 4. The shape of a map

A unit's map is not a backdrop for unrelated questions. It should carry:

- a historically grounded place, at one coherent moment;
- a local human problem, established through environment and behaviour rather than exposition;
- a connected arc across its missions, so the records turn out to be one story;
- environmental evidence a player can read without talking to anyone;
- NPCs with genuinely different positions, not one position restated;
- visible change as missions progress;
- a small number of Chronicle-frame clues — see §5;
- a resolution that recovers the essential record.

### The eight beats

1. **Arrival.** The player lands and the place is legible before anyone speaks to them.
2. **The local problem** established through environment and NPC behaviour.
3. **Investigation unlocks** further locations, people, or records.
4. **The world changes** in some visible way as missions are filed.
5. **A culminating mission** recovers the essential record.
6. **A return** at the Institute.
7. **Field Assignments** strengthen the Era Record, outside the map.
8. **Era Record Secured.**

Beats 5 and 6 are where the frame's plot lives. Beats 1–4 are where the history lives, and they are
the larger part of the map by design.

**Vary the geography.** Not every map is a town. Across nine units the settings should differ in
scale, density, climate and social organisation — a shoreline, a settlement, a canal town, a city
under siege, a railhead, a waterfront, a suburban corridor. A run of four street grids in a row is a
pacing failure even when each is historically sound.

## 5. Frame clues, and how few there should be

A map carries **at most two** Chronicle-frame details — an anomaly, or a trace of interference — and
they belong at the edges of the historical work, never in place of it.

The reason is the one in `CHRONICLE-CANON.md` §9: a unit that becomes a link in a science fiction
chain stops being a unit about American history. The frame explains why the player is standing
there. It is not what the map is about, and a student who finishes a map should have learned a
period, not a plot.

---

## 6. Unit 6 — the proposed vertical slice

Direction for Phase 10, not a finished brief. Period 6 (1865–1898).

**A railhead town on the Kansas–Colorado plains, 1873.** A composite place built from real
documentary forms, following the convention Units 4 and 5 established (decision log `0049`): nobody
standing on a loading platform is carrying a federal statute, so the records a player finds are the
paperwork that actually existed there, with citations that say so.

Why a railhead rather than a city: Units 1–5 have already used a shore, a settlement, a city, a
canal town and a city under siege. A railhead is a different _kind_ of place — a town that exists
because a company decided it should, whose population is transient, stratified by contract, and
sitting on land whose ownership is actively contested.

Connected spaces: the depot and freight platform; a telegraph office; a land office; separate Irish
and Chinese work camps; a homestead edge; cattle pens; and the route the survey line crosses.

Three proposed records:

1. **A land-office patent** — who is entitled to what, and on whose authority.
2. **A railroad payroll** — the same work priced differently by who is doing it.
3. **A boundary survey that disagrees with the treaty text it cites.**

The third is the map's spine: two documents that cannot both be right, where the honest finding is
not "somebody lied" but that the disagreement is itself the historical event.

**The map must not treat the West as empty land awaiting settlement.** Indigenous presence is
current and organised, not residual — the same register rule Unit 5 applies to enslaved and
impressed people (decision log `0049`): named, speaking first, saying what is done to them and what
they intend.

Proposed engine slate: INTERVIEW + ASSEMBLY + TRACE. Provisional — catalog §5 rule 2 forbids
repeating a neighbouring unit's three, and Units 3–5 have no activity content yet, so this is
settled when theirs is. Any TRACE authored from here uses the two-question support axis by default
(decision log `0059`).

Meridian's involvement, if the reveal lands here, begins as an apparently humanitarian intervention
around a route, a deed, a warning or a labor record — and complicates who ends up with access to
land, safety, movement, or a vote.
