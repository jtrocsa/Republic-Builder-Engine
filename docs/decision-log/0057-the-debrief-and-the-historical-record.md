# 0057 — The debrief, and saying which parts were real

**Phase 74 · 2026-08-02 · Accepted**

Phase C of the connected-missions redesign. Follows [0055](0055-one-vocabulary-for-the-evidence.md)
(the words) and [0056](0056-the-field-notebook.md) (the Field Notebook). Completes the mission
rhythm: this is beat 7.

---

## Context

Two problems, and one answer to both.

**A mission ended on a footer.** Filing the right conclusion produced `Record stabilized.` and a
button. Everything the mission had established, everything it had failed to establish, and every
liberty it had taken went unsaid. A student finished an investigation and was told it had worked.

**Chronicle takes real liberties and had never said so anywhere.** All fifteen people at Riverbend
are composites. Every conversation in the game is invented. The Riverbend wharf ledger is not a
transcription of any surviving page — its own citation says so, in a citation nobody reads. Set
against genuinely documented history and inside a time-travel frame, that is three categories of
truth presented identically, which is the thing an APUSH game can least afford.

The owner's brief asks for both fixes in the same place: a debrief that says what the evidence
supports, what remains unresolved, and which elements were historical versus fictional.

---

## Decision

### 1. The Debrief is the activity screen's third state

`activityScreen()` now resolves in order: **Mission Instructions** (`!briefed`) → **the board** →
**Debrief** (`complete && activity.debrief && !debriefed`).

Not a new screen id, for exactly the reason Mission Instructions is not one (see `0054` §1): the four
engine keys already double as `VALID_SCREENS` entries and as content's `activityRoute`, so a fifth id
would be a save-compatibility change bought for nothing. `debriefed` sits beside `briefed` on the
per-record entry, is absent on older saves, reads falsy, and shows the screen once.

Host-rendered, like the briefing and the glossary: it needs the giver's portrait, the case number and
the route onward into the record, none of which an engine has a view of.

**It reprints the filed conclusion's own `why`.** The debrief opens the instant the closer lands, so
without this the option's explanation — the most useful sentence on the board — would be written and
never read. Discovered by reading the flow, not by testing it, which is the sort of thing that ships
silently.

**It takes the footer's exit as well as its place.** `mission-debriefed` marks the record debriefed
_and_ completed, then does what `open-activity-source` did: into the source reader, activity closed
behind them.

### 2. `debrief` requires both halves

`{ speaker?, line, established, remains }`, and `established` and `remains` are both required by the
schema.

A debrief that only reports what was proved teaches that investigation ends in certainty. `remains`
is where a mission says what its own record cannot reach — that the ceremony at San Salvador recorded
silence and silence is not agreement; that a wharf book which opens at the landing cannot establish
who made the cask. `openQuestions[]` is the same idea at unit scale and prints in the same list.

`speaker` defaults to whoever handed the record over. The person who gave you the job is the person
who hears how it went — though content may name someone else, and two of the six do.

### 3. Four bands, fixed by the engine, filled by content

`historicalRecord: { documented, reconstructed?, fiction, debated? }`. The labels — **Documented**,
**Plausible reconstruction**, **Chronicle fiction**, **Still debated** — live in `main.js`, not in
content, because the entire value of the policy is that it reads identically in every mission.

`documented` and `fiction` are **required and non-empty**. Every Chronicle mission has both by
construction: real history, and a Chronicler standing in it. A mission that cannot name its own
fiction has not thought about it.

`debated` is the band that makes this more than a disclaimer. It lets a mission say _historians
disagree about this_ instead of quietly picking a side — the status of the 1619 Angolans, whether
Waldseemüller regretted the name, how far one desperate servant's letter should stand for a labor
system.

### 4. `variant` is a label, and a test says so

`variant` names a mission's shape inside its family — "Ask the Right Question", "Commodity Chain",
"Whose Account Do You File?" — and renders in the eyebrow after the engine's own name.

**Nothing in `engine/activities/` may branch on it.** The registry's whole value is that adding an
engine is one more entry in `index.js`, and a second dispatch axis ends that. Stated in
`CHRONICLE-VOCABULARY.md` §3 and now enforced: `activity-content.test.js` reads the engine sources
and fails on `variant ===`.

`missionQuestion` and `thinkingMove` join it. `missionQuestion` prints on the way in and on the way
out — "make the task obvious" is one sentence's work. `thinkingMove` is deliberately _not_
`closer.skillCategory`: same subject, two audiences, one a grade-book tag that is never shown and one
a sentence for the student.

---

## Consequences

- All six shipped activities now carry a variant, a mission question, a thinking move, a debrief and
  a historical record — roughly 200 lines of authored prose, and the first content in the game that
  states plainly which of its people never existed.
- Four new content rules are enforced rather than hoped for: every mission states a question (and it
  ends in a question mark), every mission says what it could not settle, every mission names
  something documented and something invented, and no engine branches on `variant`.
- Two new element-level visual baselines. The debrief and its bands sit below the fold at 1366×768 —
  the same trap Phase 73 recorded, applied on purpose this time.

## Known-outstanding, found here and not fixed

**The case number is missing from the activity eyebrow on four of five units.**
`caseNumberLabel()` derives it from a `"Case N.NN — Name"` title prefix, and only Unit 1's case
titles carry one; Unit 2's are `"The Riverbend Settlement"`. So Riverbend's debrief reads
`THE INTERVIEW · WHOSE ACCOUNT DO YOU FILE?` where Case 1.01's reads `CASE 1.01 · THE INTERVIEW`.
Pre-existing, visible in the Phase 72 baselines, and a content decision (do Units 2–5 get numbered
titles, or does the eyebrow stop trying?) rather than a bug to patch under a different phase.

## Alternatives considered

**A panel on the board instead of a state of the screen.** This is precisely what Phase 69 tried with
`howItWorks` and Phase 71 undid: a player looking at a board does not read a panel beside it. The
debrief would have been worse, since by then the player has a finished board and a button.

**Put the four bands in content as labels.** Rejected for the reason they are fixed: a mission that
called its own inventions "dramatic licence" and another that called them "reconstruction" would
teach that the distinction is a matter of tone.

**A single `historicalNote` string.** Cheaper to author and it collapses the one distinction the
field exists to draw. Four arrays make an author sort their own material, which is the point.
