# 0055 — One vocabulary for the evidence

**Phase 72 · 2026-08-02 · Accepted**

Phase A of the connected-missions redesign. The whole redesign is planned across seven phases; this
one settles the words, because the phases after it build panels that have to be labelled and there
is no cheaper time to change a label than before it is written down in four places.

---

## Context

The owner's brief re-frames Chronicle as a historical conspiracy adventure in which academic
historical thinking is the investigation mechanic rather than a mini-game beside it. Most of that
brief is new systems — a Field Notebook with limited evidence slots, a permanent cross-unit Codex,
a debrief that labels documented history against Chronicle fiction, and a rival institution called
Meridian.

Underneath the new systems was a smaller and more immediate finding: **the game does not currently
speak one language about evidence.** A student meets "Cannot tell" at the chart table in Unit 1 and
"Cannot tell" again at Riverbend, but meets "An error / A design" in one audit and "He was wrong /
True where he stands" in the other for the same move. The interview says "Log this response"; the
tracker says "your notebook"; the Codex calls itself an "Evidence Satchel" under a kicker reading
"Chronicle Codex". Four names, one idea.

Two further findings came out of reading the four engines against the brief:

1. **`interview.js` had a fact in it.** Its locked-closer note read _"Every person on this **island**
   is holding one thing worth writing down."_ `engine/activities/` exists under one rule — no
   subject-specific facts — and that sentence breaks it. Three of the four engines carried a
   hard-coded English sentence; only INTERVIEW's named something historical, but all four were the
   same category of thing in the wrong place.
2. **`gapKinds` was handed to content and then contradicted by the renderer.** DISCREPANCY lets
   content author the gap kinds — and then printed `<p>Is that gap an error, or a design?</p>`
   above them. Riverbend's kinds are "He was wrong" and "True where he stands"; its players were
   asked a question about neither.

A third, smaller: **`verdicts` and `gapKinds` accept an optional `note`, and the renderer has never
printed one.** Four authored sentences across two units that no player could reach — the same class
of defect as Phase 71's unreachable `fallback`, found the same way.

---

## Decision

### 1. Four classifications, everywhere, and the ids never move

Every DISCREPANCY offers **Supported by the evidence / Complicated by the evidence / Contradicted by
the evidence / Not enough evidence**, and the same five reasons a record can differ from what you
gathered: **Mistake / Deliberate framing / Incomplete information / Different perspective / Not
enough evidence to determine why**.

Units 1 and 2 were retrofitted **by label only**. `supported`, `contradicted`, `cannot-tell`,
`error`, `design`, `he-was-wrong`, `not-one-place` all keep their ids; `complicated`, `incomplete`,
`perspective` and `undetermined` are added.

An id is save currency. A saved `state.verdicts = { mines: "contradicted" }` against content that
has renamed that verdict orphans the value, `claimStatus().verdictRight` goes false, and a mission
the student already filed reopens as unfinished. Renaming an id is a data migration wearing a
rename's clothes, and a copy pass is the wrong place to do one.

The same rule kept the two units' divergent gap-kind ids rather than unifying them: "He was wrong"
was Mistake all along and "True where he stands" was Different perspective, so they were relabelled
in place. New content uses the left-hand id in `CHRONICLE-VOCABULARY.md` §2.

**`complicated` currently ships correct on no claim in either unit** — a live distractor, in the
same spirit as TRACE's `labor-cost`. That is a knowingly incomplete state, recorded in the
vocabulary doc as standing authoring debt. Case 1.01's `fertile` claim is the obvious candidate
(its `why` already reads _"He is right. What he does not write is that the fertility he is
describing is the result of somebody's work"_), but promoting it changes an authored answer and
un-settles that claim in every live save, so it is the owner's call and not a side effect of a
vocabulary pass.

### 2. The engines' remaining English becomes content

`lockedNote` joins `COMMON_ACTIVITY_FIELDS`; DISCREPANCY gains `gapPrompt`. Each engine keeps its
own literal as the fallback, so an activity that declares neither renders exactly as before — and
each of those fallbacks was rewritten to be **placeless**. INTERVIEW's island sentence now lives in
`unit-01-activities.js`, where the island does.

The four dead `note` fields on `verdicts`/`gapKinds` were resolved by folding their meaning into the
labels, which _are_ rendered — "An error" plus an invisible gloss became "Mistake". The two
classifications a student genuinely needs explained ("Complicated by the evidence", "Not enough
evidence") went into `terms`, which the host already prints in the copy column and which exists for
exactly this. Rendering per-option glosses inside the pill buttons was the alternative and was
rejected: it restyles a control group shared by three engines, which is a layout change in a phase
whose whole verification premise is that nothing moves.

### 3. `gapRequiredFor` accepts a list

Once "complicated by the evidence" exists beside "contradicted by the evidence", both are claims the
record does not simply support and both deserve the second question. `gapRequiredFor` now takes a
string or an array, normalized through `gapVerdicts()`; a bare string is a list of one, so shipped
content parses unchanged. Nothing in Units 1–2 uses the array form yet — this is the engine
capability the four-classification vocabulary needs the moment a unit authors a complicated claim.

### 4. TRACE keeps its ledger language

The brief maps "Log response → Add to Field Notebook". TRACE's `log` verb is a different act on a
different object: its state key is `ledger`, its fiction is a wharf account book, and a leg is
_entered_. Renaming it would break the metaphor the activity is built on. The Field Notebook
language governs INTERVIEW's keep-this move, which is what the brief's table is about. Recorded as a
deliberate exception rather than an oversight.

### 5. The Codex is renamed but not yet re-scoped

`codexScreen()` is ten lines and iterates one case's sources; its own copy said _"Temporary records
for the current case."_ The brief wants a permanent cross-unit archive. This phase changes
"Evidence Satchel" to "The Codex" and "Secure in Codex" to "File in the Codex" — and deliberately
keeps the body copy truthful about what the screen currently is ("Records filed on this case").
Promising "the Archive's memory" before Phase D builds it would repeat the mistake
`chronicle-identity.defaults.js` already makes.

---

## What this does not do

- No Field Notebook. `outcome()` returns `findings` on all four engines and **nothing consumes
  them** — that dead-ended producer is the seam Phase B builds the Notebook on, and it is untouched
  here.
- No new `progress.*` key, no new screen id, no fifth engine, no registry slot. `tests/unit/
activity-engines-index.test.js` did not change, and it should not have.
- No Meridian, no anomaly, no debrief. Those are Phases C, F and G.
- No change to any authored expected answer, anywhere. Every claim's `verdict`, every claim's `gap`,
  every leg's `effect` and every closer's correct option are exactly what they were.

---

## Consequences

- One vocabulary across both authored units, and a written rule (`docs/design/CHRONICLE-VOCABULARY.md`)
  for Units 3–5's eighteen unauthored records to be built against rather than retrofitted into.
- `engine/activities/` holds no subject sentences, not just no subject facts. The rule it was always
  under is now true.
- The second question in an audit asks about the options actually on screen.
- Three test string assertions changed (one unit file, two e2e) and eight visual baselines were
  re-shot. Every one of the eight was reviewed individually: six against their diff, and the two
  whose tests aborted before reaching them — Unit 1's audit and the trace — inspected directly as
  images, because Playwright stops a test at the first failed assertion and `--update-snapshots`
  would otherwise have written them unseen.

## Alternatives considered

**Rename the ids properly and migrate saves.** Correct in the abstract, and the migration is real
work (`readProgress()` would need per-claim key rewriting) bought for zero player-visible gain,
since a label change delivers the whole benefit.

**Apply the four classifications only to new content.** Zero risk, and it ships the exact defect
this phase exists to remove: a student who plays Unit 1 then Unit 3 would learn two vocabularies.

**Build the Field Notebook first**, which is the order the brief asks for. Rejected on cost: the
Notebook's panel is labelled in these words, so doing it first means writing the labels, then
changing them, and re-shooting 39 visual baselines twice instead of once.
