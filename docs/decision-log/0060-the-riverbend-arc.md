# 0060 — Three records that turn out to be one story

**Phase 77 · 2026-08-02 · Accepted**

Phase F of the connected-missions redesign (`0055`). Built from Riverbend's three existing records
with no fourth cited source, which was the owner's decision at planning time and the right one — the
arc was already there in the content, and what was missing was anything that said so.

---

## The problem

Riverbend's three missions are gated (the letter requires the charter) but nothing connects them.
A player finishes By Whose Head, reads a debrief about the headright, and is returned to a map with
two more markers on it. Nothing in the game has ever said that the letter and the wharf book are
about the same thing as the charter, because until Phase 75 nothing in the game survived leaving a
mission at all.

Three fields, each doing one job.

## 1. `lead` — an answer that sends you somewhere

One optional string on an interview answer. Not a top-level `leads` array: a separate list is a
second graph to keep in sync with the first, and what it grows into is a dialogue engine. There is
nothing to resolve — a lead is a sentence and the player does the resolving.

**A lead appears only once its answer is in the Field Notebook.** Hearing and keeping are two moves
everywhere else in this engine (`0056`), and a lead handed over on the strength of a question the
player walked away from would be the one place that did not hold. It travels with the answer into
the notebook table, which is where a player goes to work out what to do next.

Three ship, on the charter interview:

| Speaker            | Lead                                                       | Points at            |
| ------------------ | ---------------------------------------------------------- | -------------------- |
| Indentured servant | "He has a letter half-written to his parents in his coat." | Nothing to be Gotten |
| Wharf clerk        | "The same book records the cargo as well as the people."   | One Hogshead         |
| Angolan man        | "There is no record at Riverbend that says what he is."    | nothing              |

The third is the one that matters. Two of Riverbend's leads hand off to the next record; that one
hands off to an absence, because that is what the surviving documents do. A lead system where every
thread resolves teaches that the archive always has an answer somewhere, which is the opposite of
what this game is for.

A content test requires a lead to hang off a `useful` answer. A lead on a throwaway answer is
permanently unreachable — the same family of dead content as Phase 71's unreachable `fallback` and
Phase 72's never-printed `note`.

## 2. `arcClose` — what the three records make together

Rides the debrief of whichever mission the player finishes last, gated by the host on **every
activity in the case being in the Codex**. That gate reads `progress.codex`, so it means "filed with
a conclusion the evidence could carry" and not "the screen was visited" — the same bar the Codex
itself uses (`0058`).

Not a new screen. The player is already reading a debrief at exactly the right moment, and a fourth
screen for a thing seen once per case would be a screen most players never learn exists.

**It is authored twice.** Riverbend gates only one of its three records, so the last mission is
always the letter or the ledger and never the charter — and both of those carry an `arcClose` with
the same argument in the voice of whoever is standing there. Authoring it on one of them is the bug
`tests/unit/activity-content.test.js` now catches, and it would have been silent: a player finishing
in the other order simply gets nothing.

What it says: Riverbend's three records are **one arrangement described by three people who each
thought they were recording something else.** The patent records who paid the passage. The letter
records what the arrangement feels like from inside it, by a man who cannot see its cause from where
he stands. The wharf book records where the value goes once the work is finished. In none of the
three is the person doing the work the subject — and that is not concealment. It is what a labor
system looks like in the documents an economy keeps about itself.

## 3. `anomaly` — something on the page that should not be there

Two flat strings: `noticed` is what a careful reader would spot, `note` is what a Chronicler makes
of it. No id, no state, no branching. **An anomaly is observed, not solved** — the moment it becomes
a puzzle with an answer it stops being unsettling, and the frame's plot has not started yet.

Riverbend's one anomaly is in the wharf book: the entry reads fourteen hogsheads, the page was
scraped before the ink went on, and underneath the figure was fifteen — in a hand that is not the
clerk's. Deliberately archival rather than fantastical. Skimming, spoilage, a broken cask and plain
arithmetic all account for a missing hogshead and none would be worth writing down; what does not
fit is the correction, in a book the clerk has ruled himself for eleven years and says so twice
without being asked.

**One per unit, enforced.** Two per map and it is a collectible; one per map and it is a thing that
happened. It renders last on the debrief, because it is the one thing the mission does not resolve
and it should be the note the player leaves on.

This is the first thread of Phase G's plot, and it resolves nowhere yet.

---

## What went wrong, and what it cost to find

**`lead` shipped unreadable on its first attempt.** `interviewAnswer()` normalizes an answer into a
fixed shape — `{ text, useful, authored }` — and every renderer reads that, not the raw content
object. A field not named there is invisible to the entire engine. Two unit tests assert that shape
exactly and both failed, which is how it was caught in about a minute; `lead: ""` is now normalized
alongside the rest, and the fallback branch returns `lead: ""` explicitly because a stage direction
cannot hand over a lead.

**A one-pixel baseline change that was real.** `field-notebook` came back 1240px against a 1241px
baseline. Measuring the panel in the browser with and without this phase's CSS gave the identical
fractional height (1239.453125) both times — so the panel did not change. The leads make the
_notebook table above it_ taller, the panel therefore sits lower on the page, and its sub-pixel
rounding flips. A genuine consequence of the change, arrived at by measurement rather than by
accepting a diff that "looked like antialiasing."

---

## Deliberately not built

**E3 — INTERVIEW's `questionBudget`.** The plan's own condition on it is "do it last, only when new
content needs it," and no content needs it: Units 3–5 have no interviews authored, and adding a
budget to the two that exist would change their difficulty for no content reason.

It is also the sub-phase with a design problem nobody has solved yet. A hard budget can make a
mission unwinnable — spend it without meeting `requires.useful` and there is no path forward and no
per-record reset. A soft budget nobody enforces is a counter. The way out is probably that a budget
changes the _coverage bar_ rather than gating asks, so running short means filing on less rather
than failing — but that is a design decision to take against real content, not in the abstract.
Recorded here rather than left as a silently skipped bullet.
