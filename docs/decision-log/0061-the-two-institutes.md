# 0061 — The two institutes

**Phase 78 · 2026-08-02 · Accepted**

Phase G of the connected-missions redesign (`0055`), and the last of its seven letters. `0056` gave
a mission a Field Notebook, `0057` a Debrief, `0058` the course an archive, `0059` a trace two
questions per leg, `0060` Riverbend an arc and its first anomaly. This gives the game a story to
hang all of it on — and, more usefully, writes down which parts of that story are settled and which
are not.

**No engine code, no content, and no art changed in this phase.** That is the shape of the work, not
a shortfall: the deliverable is documentation plus one test.

---

## The problem

Chronicle has had a frame story since the beginning — the player is recruited because the historical
record has become unstable — and it existed nowhere except in scattered onboarding copy. Nothing
said what temporal drift was, whether an ordinary biased source counted as one, what the Codex was
protected from, or who the rival institution named once in `0055` actually was.

Two costs were already being paid.

**The fiction was creeping into the curriculum.** The game's whole subject is that evidence is
incomplete, partial and contested _for ordinary reasons_ — and it now has a mechanic named "anomaly"
sitting next to that. With no written line between them, the drift is one direction only: a student
learns that a biased source was damaged by time travel, and the frame has eaten the thing it was
supposed to frame.

**And the second window problem.** Phase G was being planned while Phases E3/F were being built in
another session. Without a written canon, two sessions authoring against the same world would
produce two worlds.

## The decision

Five documents, one test, and a four-line pointer in `CLAUDE.md`.

| Document                                                                                        | Holds                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`design/CHRONICLE-CANON.md`](../design/CHRONICLE-CANON.md)                                     | The five travel rules, the operational rule, the Original Drift, the two institutes, the terminology discipline, and the canonical/provisional/deferred ledger |
| [`design/MAP-NARRATIVE-STRUCTURE.md`](../design/MAP-NARRATIVE-STRUCTURE.md)                     | Mission vs Field Assignment, the Era Record, the eight map beats, the Unit 6 outline                                                                           |
| [`design/THE-FIELD-LIAISON.md`](../design/THE-FIELD-LIAISON.md)                                 | Emery Voss: role, reveal ladder, relationship model, integration points                                                                                        |
| [`design/CUTSCENE-AND-DIALOGUE-CONVENTIONS.md`](../design/CUTSCENE-AND-DIALOGUE-CONVENTIONS.md) | What exists today, the command set, teardown requirements, the voice guide                                                                                     |
| [`art/MERIDIAN-VISUAL-IDENTITY.md`](../art/MERIDIAN-VISUAL-IDENTITY.md)                         | Palette, motifs, insignia brief, the Liaison PixelLab spec                                                                                                     |

### 1. Ordinary uncertainty is never drift

The line the whole canon exists to draw. A source may be incomplete, biased, false, misleading,
unverified or contradicted **without anyone having travelled anywhere** — those are evidence
problems and they take the historian's vocabulary that `0055` already settled. Only a difference
between Codex-protected evidence and what now exists outside it is a temporal anomaly.

Six phrases are banned outright — _temporal integrity_, _quantum record_, _anchor instability_,
_causal resonance_, _timeline corruption_, _one true timeline_ — and
`tests/unit/chronicle-canon.test.js` fails on any of them reaching shipped code. They sound precise
and say nothing, and each describes history as a machine that breaks rather than a record that can
be argued with.

### 2. An anomaly is noticed, not computed

The canon was written to match the code rather than the other way round. `AnomalySchema` landed in
`contract.js` during Phase E/F as two flat strings — `noticed` and `note` — with no id, no state and
no branching.

The brief that produced this phase defined a temporal anomaly more strictly, as a _difference_
between the Codex and the present archive, which reads as a diff the game computes. **The shipped
shape is canon.** An anomaly is something a Chronicler notices and flags; the Codex comparison is
why it matters, not a data requirement. Writing the strict version down would have created authoring
debt against a mechanism nobody has scheduled, and the moment an anomaly becomes a puzzle with an
answer it stops being unsettling anyway.

### 3. The doctrine may permit what the mechanic forbids

`MISSION-ACTIVITY-CATALOG.md` §2 is absolute and unchanged: **a Chronicler changes the record, never
the event.** Chronicle's field doctrine, meanwhile, ends _"change only what is necessary to stop an
outside alteration"_ — which sounds like a licence to do exactly that.

Both stand. The doctrine is institutional policy; the rule is what a player does. No shipped mission
has ever required intervention and none may.

This is the most useful thing in the canon rather than a fudge. An institution that grants itself
permission to alter the past, insists nobody uses it, and will not say what it did the first time is
a far better employer to be suspicious of than one with clean hands. The later units are built on
that gap.

### 4. No renames

**Mission** stays the shipped word for locked map work. **Field Assignment** is new, and names
something that genuinely had no student-facing name: the six teacher-editable slots.

"Core Operation" was considered as a story-facing label for the first and **rejected** — a third
name for something already called a Mission in code, docs and UI is the synonym proliferation the
canon's own §8 forbids. It appears nowhere.

Likewise **Era Record is a derived view, not a tracker**. Its four states compute from
`completedCases`, `progress.codex`, `archiveChallenges` and `unitReadyForReview()`. A second
progression system for a status line would have been the exact mistake the deferred-systems list
exists to prevent.

### 5. Anchor glass is shared, so it cannot be a faction colour

Meridian's technology descended from Chronicle's, and the art has to say so before any dialogue
does. The mechanism is the material: both institutes use anchor glass, and it lights the same for
both. Chronicle already ships that colour as `--c-info: #7ee6ec`, so Phase 7 aliases it as
`--c-glass` rather than inventing a second.

The factions differ in the **housing** — Chronicle circular, brass, layered, visibly repaired;
Meridian angular, dark teal, oxidized copper, folding, exact. One caution came out of the palette
audit: Chronicle already owns a _bright_ teal accent (`--c-teal-rgb`), so Meridian's must stay
distinctly darker and desaturated or the two read as one institution at sprite scale.

---

## What the audit found

Phase G's first deliverable was the audit, and three findings changed the plan.

**The teacher/story firewall already exists.** Teacher-editable `slot_kind` is exactly six values
and the four activity engines are not among them, so a map mission is structurally not a slot.
Better, `custom-content-authoring.js` already carries a source's `activityRoute` forward unchanged
rather than exposing it as a form field. Phase G documented a seam rather than building one, and the
new test pins it.

_One real leak, left open deliberately:_ a teacher can still edit `title`/`excerpt`/`record`/`prompt`
on a source carrying a non-null `activityRoute`. Mission logic is unaffected — an activity has owned
its own `record.text` and `record.context` since Phase 69 — but `source.title` is printed by the
mission UI, so renaming such a source renames a locked mission's record on a student's screen. The
fix is a candidate-pool exclusion, and it is code, which this phase does not ship.

**There is no cutscene system.** `hallwayScene` is a four-phase machine welded to one room;
`escort-walk.js` is a pure two-body walk primitive, not a timeline. What does exist and is reusable:
the typewriter with skip, `isHubInputLocked()`, portraits on every character, `prefersReducedMotion()`
and the doorway fade. Also worth stating because the brief assumed otherwise — **there is no gamepad
support anywhere**, and touch is one app-level `pointerdown` handler. Phase 9 must not be written
against input modes the game does not have.

**The Liaison needs no new engine system to debut.** `activity.briefing.speaker` has resolved a
mission-giver by id since Phase 71, and every character already has a built portrait. Emery Voss
becomes a mission-giver by authoring a string. The sprite, a `HUB_NPC_BEHAVIOURS` station and one
new `progress.story` object are the whole of Phase 8's engine surface — and the two costume states
are two sheet keys, not a runtime tint.

## What this deliberately does not do

- **No fifth engine, no new screen id, no new `progress.*` key.** `progress.story` is specified here
  and added in Phase 8, where something actually reads it.
- **No art.** The brief forbids generating assets before the sprite contract is validated, and
  validating it was this phase's job. The contract is now written down where Phase 7 and 8 can find
  it: canvas 48×56 pinned, `size: 40` and not 88, `walking-8-frames` and not `v3`, and Director Hale
  the style anchor that must not be regenerated.
- **No Units 7–9 briefs.** Phase 12, after Unit 6 has been built and the sequence reviewed for
  repetition.
- **No plot.** The Original Drift incident, Voss's biography and allegiance, the ending, and the
  connection between the Drift and each APUSH unit are all listed as deferred. The last one matters
  most: making every unit a link in one chain would turn nine periods of American history into set
  dressing for a science fiction plot, which is the failure this document exists to prevent.

## Two sessions, one decision log

This phase was written while a second session built Phases E3/F in the same repository. Two
consequences are worth recording, because the next multi-session phase will hit both.

**The ADR number collided.** Both sessions reserved `0060`. Phase F committed first and kept it
(`0060-the-riverbend-arc.md`); this phase renumbered to `0061` and moved from Phase 77 to **78**.
The decision log numbers by commit order, not by planning order, and there is no lock — so a phase
planned in parallel should treat its number as provisional until it commits.

**The shared files were routed around, then edited normally.** `ARCHITECTURE-QUICKREF.md` and
`CHRONICLE-VOCABULARY.md` were rewritten by every Phase E/F commit, so this phase wrote new
documents only while that work was in flight and applied its own QUICKREF and vocabulary edits after
Phase F landed. That ordering cost nothing and avoided a merge conflict in two files that are
themselves the record of what happened.

### Phase F's anomaly is this phase's first thread

Phase F shipped Riverbend's altered wharf entry — fourteen written over a scraped fifteen, in a hand
that is not the clerk's — and named it "the first thread of Phase G's plot". The canon written here
is built to receive exactly that: an anomaly is **archival rather than fantastical**, noticed on a
page rather than computed by a machine, and one per unit because two is a collectible.

That constraint arrived from content rather than from design, which is the right direction of
travel, and §2 above is the canon catching up to it.
