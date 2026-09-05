# 0108 — The column said it twice

**Phase 109 · 2026-09-05 · Accepted**

The activity screen's copy column re-printed every word of the Mission Instructions screen the player
had cleared thirty seconds earlier, and left it open for the rest of the mission. It is three
disclosures now, collapsed, with the mission's question and one live objective line above them.
**Measured in a browser rather than estimated: 244 words to 59.** No authored word changed.

First phase of the Beta Readiness program — see
[`BETA-READINESS-LEDGER.md`](../playtest/BETA-READINESS-LEDGER.md).

---

## 1. What a student actually saw

Open "The Question Nobody Asked", read a 247-word hand-off screen, press **Begin the mission →**, and
land on the board with 244 of those words still on it — intro, question, the giver's line, three
numbered steps, a note, and a two-term glossary — in a column that is about 348px wide at the
1366×768 Chromebook this game is built for and has **no breakpoint to reflow into**. The thing the
screen exists for sat to the right of that.

Nothing on it was collapsible. The comment above the block argued that the duplication is what makes
clearing the instructions screen safe, and that is right — it is an argument for keeping the words
**reachable**, which nobody had distinguished from keeping them **open**.

The owner's report was not that the instructions were unclear. It was that "the instructions for each
quest are clear but too overwhelming when I go to my journal." That is a volume complaint about text
which has already done its job once.

## 2. The precedent was in the repository with its reasoning attached

`.codex-record__record` had already made this exact call, and said so:

> Collapsed by default: reference, not reading. Twenty-one records each carrying three bands would
> bury the archive they are filed in.

So the mechanism is native `<details>`, the disclosure the Codex and every teacher screen already
use, and the chevron treatment is lifted from `summary.manage-content-unit-toggle` rather than drawn
again.

**Phase 71 had already attacked this from one end and could not reach it.** It capped
`HowItWorksSchema.steps` at four — both units had shipped at five and six bullets and the owner
stopped reading them — and the cap held. The steps were never the problem. The **aggregate** was, and
no single authored field owns an aggregate.

## 3. The one thing that made this harder than an attribute

`render()` assigns `app.innerHTML` wholesale, so a native `<details>` on this screen is **closed
again every time anything on the board is pressed**: open the glossary, place a fragment, glossary
shuts. That is why the Mission Tracker was hand-rolled with `progress.settings.trackerCollapsed`
rather than using `<details>`, and the reason had never been written down as a general one.

The open flag therefore lives in `progress.settings.activityCopyOpen`, keyed by section.
`handleActivityCopyToggle()` writes it back and **deliberately does not re-render** — the browser has
already opened the panel, and rebuilding the screen underneath it is the double-toggle race the
Manage Content accordion carries its own warning about. `toggle` does not bubble, so it is a
capture-phase document listener, beside the two `<dialog>` ones that are there for the same reason.

## 4. The heading did not get to move with the markup

`INVARIANTS.md` records that the board said "How this works" from Phase 69 while the screen that gave
the steps said "Mission Instructions" from Phase 71 — **nineteen phases in which a student looking
for what they had just read found something with another name.** Folding a block is not licence to
rename it, so the `<summary>` says "Mission Instructions".

The spec guarding this asserted `.activity-howto h2` with `toHaveText`. The element moved and the
rule did not, so the label got its own `<b>` inside the `<summary>` and the assertion stayed exact —
`0106`'s lesson, that a containment check passes on precisely what it is meant to reject, applied to
a test rather than to a heading.

## 5. Folding the instructions away meant owing the player a sentence, and three engines had none

What replaces the folded text is one objective line: what the mission is waiting for, in the engine's
own words, from `activitySummary()`. Then the first render of an ASSEMBLY showed it blank.

**Only INTERVIEW declared `summary()`.** The registry's own comment argued the omission — an engine
whose progress is not one ratio, "a TRACE is a chain, not a count", simply does not declare it — and
`activity-engines-index.test.js` pinned it as `toEqual(["interview"])`. But the comment names TRACE
and the reality was **three engines of four**: ASSEMBLY counts slots and DISCREPANCY counts claims,
both plainly ratios, and neither had ever been asked. So the Mission Tracker's progress line was
blank on **seventeen of the twenty-four shipped missions**, had been since Phase 68, and the one test
in the area asserted that this was correct.

All four declare it now. Each new one is three lines over the per-item status function its own
renderer already calls — `boardStatus().correct`, `claimStatus().settled`, `legStatus().correct` — so
there is no second opinion on any board about what counts as done. TRACE's is a deliberate reversal
of a written rule: "a chain, not a count" is true of what a trace means and beside the point of a
player wanting to know how many legs are still open, particularly now that every other route to that
number is folded away.

The test asserts **every** engine rather than a list of four, so a fifth has to answer the question
instead of inheriting the omission — which is exactly how this one reached three.

## 6. The count was then on the screen twice, and a diff image is what said so

INTERVIEW's board opened with its own `.activity-progress` row reading "Accounts secured — 8 of 8",
and the new objective line prints the same sentence from the same `interviewSummary()`. Two copies of
one count on one screen is precisely what giving the other three engines a summary was meant to
avoid.

All seven shipped interviews declare exactly one goal (`requires.useful`), so that row was never more
than the single line the copy column now carries. It is gone, with its CSS, and **the copy column is
the one place the activity screen states progress, for all four engines.** Six e2e assertions pointed
at `.activity-progress`; they guard the count being _right_ — P7-1 was a board claiming "of 7" while
listing four islanders and three Spaniards — so they were repointed rather than dropped.

Worth recording how this was caught: not by a failing assertion, but by opening the
`activity-interview-riverbend` diff image before accepting it. A blind snapshot update would have
banked the duplicate as the new truth.

## 7. A dead rule found underneath the one being changed

`.activity-copy p` is specificity (0,1,1) and beats any bare single-class rule (0,1,0) on a paragraph
inside that column. `.activity-howto__note` is such a rule, so its `font-size: 0.86rem` and its
colour have been losing to the column's 1rem **since Phase 71**, in silence, on every activity in the
game. Found only because the new `.activity-copy__objective` and `.activity-howto__intro` were about
to lose the same way.

All three carry their element now (`p.activity-howto__note`). CLAUDE.md already says **check the
cascade before the arithmetic** about this file; this is the third instance and the first caught
before it shipped rather than after.

## 8. What was deliberately not done

- **No authored word changed.** The volume drift between units is real and measured — 4,497
  player-facing words in Unit 1's three missions against 11,380 in Unit 7's, and 67,024 across all
  twenty-four — and trimming it is a content decision, not this phase's.
- **All three blocks are collapsed by default, the briefing included.** Every one of them was read on
  the hand-off screen. What replaces them is the question and the objective line, which are the two
  things a player mid-mission actually needs.
- **The Mission Instructions screen is untouched.** It is the moment; this phase is about the
  reference copy that outlives it.
- **The Mission Tracker is untouched**, and now shows a progress line on seventeen missions that had
  none — a consequence of §5 rather than a redesign. Turning it into a ticking checklist is Phase
  111's.
