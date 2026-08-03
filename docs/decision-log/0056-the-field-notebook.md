# 0056 — The Field Notebook

**Phase 73 · 2026-08-02 · Accepted**

Phase B of the connected-missions redesign. Follows [0055](0055-one-vocabulary-for-the-evidence.md),
which settled the words this panel is labelled in.

---

## Context

The owner's brief draws one distinction and hangs the whole redesign off it:

> The Field Notebook records what you find. The Codex records what you can defend.

Chronicle had neither. "Notebook" meant two unrelated things — the Mission Tracker button that
routes to the activity screen, and INTERVIEW's own answer grid, whose header comment calls itself
"the notebook you come back to." The other three engines had nothing of the kind. There was no
moment in any mission where a player reviewed what they were carrying before deciding what it
supported.

What made this cheap to fix was a seam already in the code and going nowhere. **All four engines'
`outcome()` has always returned `{ findings, skillOutcomes }`**, where a finding is
`{ id, text, from }` — and a grep of `apps/web/src/` shows the only consumer is
`recordActivityOutcomes()` in `main.js`, which reads `skillOutcomes` and drops `findings` on the
floor. Four engines were already computing exactly the list a notebook needs, and throwing it away.

So the Field Notebook is not a new system. It is a **consumer plus a selection step** on a producer
that shipped in Phase 68.

---

## Decision

### 1. `capacity` caps what you keep, not what you gather

The brief asks for limited evidence slots so that discovering more than you can preserve forces a
choice. The obvious reading — cap the gathering — was rejected.

Both shipped interviews set `requires.useful === speakers.length`: to file at all you must take
every useful account on the map, and `tests/unit/activity-content.test.js` enforces it. That is the
right shape and worth keeping. Walking past a witness should not be a strategy, and a student who
skips people learns less than one who talks to everyone.

The judgement worth teaching happens after the gathering: of everything you now hold, which few
pieces will you actually stand behind? That is the Notebook/Codex distinction as a mechanic instead
of a slogan — and it costs zero edits to shipped content and zero changes to that test.

### 2. Declaring `notebook` is what turns a review into a decision

`notebook: { capacity, prompt?, emptyNote? }` joins `COMMON_ACTIVITY_FIELDS`, so all four engines
pick it up through the existing spread.

An activity that declares **nothing** keeps every finding and renders the panel with no controls and
no ratio — a review of what the mission surfaced. That is all six shipped activities, and it is why
this phase changed no content and moved no existing visual baseline. The moment an activity authors
a capacity, the same panel becomes a set of decisions.

A full notebook **refuses** a `keep` rather than evicting silently. Choosing what to drop is the
entire point of the cap, so it has to be a move the player makes.

### 3. A conclusion is graded on its evidence, not only on being the right conclusion

`closer.options[]` gains `requiresEvidence: string[]` and `unsupportedNote`. `closerResult()` gains
a third field beside `filed` and `correct`: **`supported`**. `isComplete` on all four engines is now
`<phase one> && correct && supported`.

This is the difference between grading a click and grading an argument. A player can land the
defensible conclusion by elimination while carrying nothing that establishes it; without this the
activity calls that a win, which teaches that the conclusion is the answer and the evidence was
scenery.

Filing an unsupported conclusion is deliberately **allowed**. The closer answers with what the
evidence does not carry — that feedback is the thing worth having — and `isComplete` is what
withholds the win. The option renders amber (`--c-warning`), which is neither the green nor the red
on purpose: the player has not made a mistake, they have not finished.

The check is **fail-closed**: an option naming evidence the caller did not supply is unsupported.
An option naming no evidence is supported by definition, which is every option authored so far.

### 4. The panel is engine-rendered; there is no registry slot

`renderNotebook()` lives in `contract.js` and each engine calls it immediately above its
`renderCloser()`. Four one-line call sites.

Host-rendering it was the alternative and is wrong: the closer lives _inside_ each engine's
`render()` return value, so a host-injected panel lands underneath it, and reviewing your evidence
after filing your conclusion reads backwards.

**No optional registry slot was added.** `tests/unit/activity-engines-index.test.js` — which pins
`renderInline` and `summary` to `["interview"]` and the engine keys to exactly four — did not change,
and that was treated as a design constraint rather than an outcome.

### 5. `.evidence-notebook` is its own root class

Not an `.activity-board` variant. That class is shared with the practice check, Archive Challenges
and the ten non-map missions, and an unscoped rule on it re-lays every quest list in the game —
which is what happened in Phase 68 with a bare `display: grid` (decision log `0051`).

Named `evidence-` rather than `field-` deliberately: in this codebase `.field-*` means _on the map_
(`.field-tracker`, `.field-interview`, `.field-speech-bubble`), and this panel is on the activity
screen.

---

## Consequences

- Every mission now has beat 4 of the rhythm. `findings` stopped being dead code in all four engines.
- `outcome()` returns `{ findings, evidence, skillOutcomes }` — `findings` byte-identical, `evidence`
  the kept subset. That third key is what Phase D's Codex consumes, and it is the reason this phase
  had to come first.
- Each engine exports `<x>Findings(activity, state)`, refactored out of its own `outcome()`, so the
  shared reducer can be handed the list without `contract.js` learning what a speaker or a leg is.
- `progress.sourceActivities[id].state.notebook` is a new nested key on live saves that
  `ensureSourceActivity()` will never rewrite. Every read of it goes through one defensive accessor
  in `contract.js`; that is the migration, and it is tested.
- One new unit file (25 tests) and one new e2e file (5 tests). One new visual baseline, taken on the
  element rather than the viewport — the panel renders below the fold at 1366×768, which is why it
  shipped without moving any of the other 39 and why it needed one of its own.

## Two mistakes worth recording

**A `const` schema read from an object literal above it.** `NotebookSchema` was first declared beside
its own functions, below `COMMON_ACTIVITY_FIELDS`, which reads it — a temporal-dead-zone
`ReferenceError` that took all four engines down at import. Identical in shape to the field-interior
trap CLAUDE.md already documents for the `FIELD_MAPS` literal. Schemas go above the literal that
spreads them.

**The visual suite would not have caught an empty panel.** All 39 baselines passed with the notebook
shipped, because viewport screenshots at 1366×768 stop above it. Had `renderNotebook()` returned an
empty string, nothing in the suite would have said so. The new e2e file exists mostly for that
reason, and its first assertion is simply that the panel is on screen.

## Alternatives considered

**Cap the gathering.** Truer to the brief's literal wording, and it would have required rewriting
both shipped interviews and changing an enforced test in the phase that can least afford churn.
Deferred to E3, where a question budget belongs.

**A `notebook` registry slot per engine.** Would let an engine present its findings its own way. It
also adds a third optional slot to a registry whose whole value is being small, to solve a problem
no engine has: a finding is already `{ id, text, from }` for all four.

**Require the replace-justification the brief describes** ("more relevant / more specific / direct
rather than secondhand / corroborated"). Real pedagogy, and it needs a content vocabulary no
activity has yet authored. The release-then-keep flow is in place; the reason list is the natural
extension once Phase F authors the first capped notebook.
