# 0059 — Two questions per leg, and a ladder instead of a wall

**Phase 76 · 2026-08-02 · Accepted**

Phase E of the connected-missions redesign (`0055`), covering the two per-engine variants whose
current shape had a diagnosed problem. The third — INTERVIEW's question budget and leads — is
deliberately left to its own phase; see the end.

---

## 1. TRACE: "the record does not show this" was the wrong kind of answer

### The problem

TRACE asked one question per leg — _what changes here_ — from a list of `effects` that content was
expected to include a "the evidence does not establish this" option in. `trace.js`'s own header said
so: "choosing that one correctly is the scored move."

It does not survive contact with a second mission. With "not shown" as one answer among five, a
chain needs **exactly one leg keyed to it** or the idea goes untaught — and a player who notices
that is no longer weighing evidence, they are spotting the odd one out. One Hogshead shipped with
precisely that shape: leg 1 was the trick leg, and legs 2–4 were a matching exercise.

Worse, it made `labor-cost` — _the cost of this falls on bound labor_ — an answer that is true of
the world and unavailable to the player. The mission's whole subject is a record that opens where
the labor ends, and the only way it could say so was by making the true statement wrong.

### The decision

Split the axis. A leg now asks twice:

1. **What happens here** — a question about the world, answered from everything the player knows.
2. **How far does this record carry it** — a question about the page in front of them.

`supportLevels` is a new optional array on the activity; `legs[].support` names one, and is required
on every leg once the array exists (a half-graded chain is worse than an ungraded one). A trace that
declares no `supportLevels` never asks the second question and behaves exactly as it did before —
which is what let the engine's own test fixture stay untouched.

The second control **opens only once the first answer is right**. Asking how far a record carries an
answer the player has not settled on is asking about nothing, and nine buttons on one card is a form
rather than a judgement. The reducer refuses the verb on the same condition, not just the renderer.

### What this does to One Hogshead

| Leg                                   | What happens                         | How far the page carries it                 |
| ------------------------------------- | ------------------------------------ | ------------------------------------------- |
| Cut leaf becomes a marked cask        | The cost of it falls on bound labor  | **Not shown by this account**               |
| The cask is weighed and entered twice | The Crown takes its share in duty    | The account states it                       |
| The cask becomes a consignment        | Value comes back as credit, not coin | The account states it                       |
| The credit comes back as cargo        | London chooses what comes back       | **Reasonable from the account, not stated** |

Leg 1 is now two moves, and both are true: bound labor produced this cargo, _and_ this page cannot
show it. That is the sentence the mission was always trying to teach, and until now the player could
only say the second half of it.

Leg 4 is the other half of the point. "Reasonable from the account, not stated" is what most of what
a record supports actually looks like, and an axis with only _stated_ and _not shown_ would teach
that evidence is binary. All three levels are live, none of them exactly once.

`planter-choice` — _the planter decides where it is sold_ — is the new standing distractor, the
answer to nothing. With four legs and four live effects the board solves by elimination; and it is
the intuitive reading of a consignment, which is exactly what the arrangement takes away from him.

### The guard rail this replaced

`activity-content.test.js` carried an assertion with a warning attached: _"`labor-cost` is offered on
all four legs and is the answer to none of them… This distractor is the mission, and a well-meaning
edit that 'fixes' leg 1 would delete the point of it."_

That test was protecting a real thing and this change makes exactly the edit it warned about, so the
replacement asserts the same point on the new field: leg 1's effect **must** be `labor-cost` and its
support **must** be the level meaning the page does not show it. Being right about the world and
wrong about the evidence is now something a player states in two moves rather than a trap they avoid
in one. Three further rules came with it — every leg is asked, more than two support levels are used,
and at least one effect is nobody's answer.

### The notebook, and what a finding is

TRACE now declares `notebook: { capacity: 3 }` — four legs entered, three kept. The closer's correct
option requires the **crossing** and the **returning** legs, leaving one slot free: two required and
one chosen is a judgement, whereas three required out of three would be a puzzle with one legal
answer.

And `traceFindings()` now reports **the entry the player made**, not the paragraph explaining why it
was right:

> The cask is weighed and entered twice — The Crown takes its share in duty (The account states it)

`leg.why` is on the board from the moment the leg lands and it stays there. A finding is carried into
the Field Notebook and then into the Codex, where four `why` paragraphs made a filed TRACE record
three times the height of any other engine's — the known-outstanding item from `0058`, closed here.

### Cost

This is **the first save-affecting change in the redesign**, and it is deliberate. `not-established`
leaves the `effects` list, so a save holding it against leg 1 no longer validates; and every
in-flight TRACE reopens anyway, because a leg now has a second question nobody has answered. The
three surviving effect ids were kept exactly as they were so only the one leg churns. One shipped
mission uses this engine, added six phases ago.

---

## 2. ASSEMBLY: a ladder, because the problem was ordering, not withholding

`misread` is the best writing on an assembly board — a paragraph per fragment on why a wrong piece
looked right — and it fires the instant a piece lands wrong, all of them at once. Place three pieces
wrong on a label board and three paragraphs arrive together, at the moment a player is least able to
read them.

`fragments[].hints` is a two-rung ladder in front of it: `hints[0]` on the first wrong placement,
`hints[1]` on the second, `misread` from the third. Capped at two, because a third rung is a hint
system rather than teaching. A fragment that declares none goes straight to `misread`, which is every
fragment shipped before this phase.

**Only the cartouches carry hints, and the ten map tiles do not.** A tile placed wrong on an image
board is wrong _visibly_ — the coastline does not meet — so its `misread` is a footnote to something
the player can already see. A cartouche is a knowledge question with three identical-looking blanks,
and there the full explanation on the first try does the thinking for them.

`state.attempts` counts wrong placements per fragment per board. A correct placement is not counted
and does not reset the count: lifting a piece out and putting it back should not walk the player back
down to the first rung. Re-placing the same piece in the same wrong slot _does_ count, because a
player doing that has tried again, which is what the ladder measures.

---

## What was left

**E3 — INTERVIEW's question budget and leads — is not in this phase.** It is the one sub-phase that
changes the difficulty of two shipped missions rather than one, and the plan flagged it as invalidating
an existing assertion (`requires.useful === speakers.length`). Both TRACE and ASSEMBLY had a diagnosed
defect to fix; INTERVIEW has a feature to add, and adding it alongside two gameplay rewrites would put
three engines' worth of new difficulty into one unverifiable commit. It keeps its own phase.

---

## Known outstanding

- **Neither new field is used outside its first mission.** `hints` exists on four cartouches and
  `supportLevels` on one trace. Both are optional and both default to the old behaviour, so Units 3–5
  inherit a choice rather than an obligation — but the support axis in particular should be the
  default shape for any trace authored from here, not an enhancement.
- The case-number eyebrow gap (`0057`) and the `complicated` verdict debt (`0055`) are both unchanged.
