# 0105 — The receipt was the only thing that was false

**Phase 106 · 2026-09-04 · Accepted**

Logging an interview answer that carries nothing printed **"✓ In your Field Notebook"** and put it
nowhere. The log verb has three outcomes and the control claimed the same one for all of them; it
now says which. No content changed and no mechanic moved.

Closes Spine Review **P0-3**, open since 2026-08-03 — the program's only S2 and its longest-open
finding.

---

## 1. What a new player saw

The first mission, the first person on the map, and the first question anybody asks her. From
`unit-01-activities.js`:

> **Where is the gold?**
> _We beat it thin and wear it, and give it away when giving is the right thing to do. You asked
> that one first._

Press the one control under it and the bubble replaced it with a green pill reading **"✓ In your
Field Notebook"**. It was not in the Field Notebook. The panel by that name did not list it, the
coverage bar stayed where it was, and nothing on the screen explained the gap.

## 2. Why it sat, while the whole programme ran past it

Filed 2026-08-03 and taken today. **The entire thirteen-part Spine Review started and finished in
that window**, and the protocol it ran under says an S2 is fixed in its own part's commit. This one
was routed instead, with four options and the note that all four were the owner's:

1. refuse the verb — trades a false claim for a dead button;
2. withhold the control for a flat answer, as it is already withheld for a `fallback`;
3. let the Field Notebook show everything logged, marked for what counts;
4. leave the behaviour and fix only the words.

Option 2 was called the closest fit to rules the engine already holds, and the note is right that
1–3 are design decisions reaching shipped content. Option 4 was listed last with no case made for
it, which is how it reads as the weak one.

**The measurement nobody had taken is what settles it.** Across the seven shipped interviews, every
speaker has exactly one useful answer and exactly two flat ones: **156 authored answers, 104 of them
flat.** Two thirds of the game's interview content is deliberately worth nothing, and the engine's
own header says why — _"asking the wrong person the wrong question is a legitimate move that returns
legitimate nothing, and the player learns more from that than from feedback text."_

That prices the options properly. Option 2 removes the log control from two thirds of every
authored answer in the game and makes `is-flat` — a rendering path in the grid, drawn on purpose —
permanently unreachable. Option 3 puts 104 flat entries into notebooks and through `interviewTokens()` into
DISCREPANCY's evidence column. Both rewrite a mechanic that is working as designed to fix a sentence.

So it is option 4, and it is not the weak one. `0104`'s habit, again: **when a defect is routed as a
decision, check that the options it was routed with are the only options.** Here the list was
complete and the ranking was upside down.

## 3. The engine was already right in five places, and wrong in one

Everything except that one string already told the truth:

- the grid draws a logged flat answer as `is-flat` with no tick, distinct from `is-useful` and from
  `is-heard`, "Heard — not recorded";
- the coverage bar counts `useful` and does not move;
- the panel's `emptyNote`, on the two rationed interviews, reads _"Log an answer worth keeping and it
  becomes available here"_;
- all three interview `howItWorks` slates say it in the mission's own voice — Unit 8's is _"Most
  answers are ordinary and not worth carrying"_;
- and `interviewFindings()` simply does not return it.

One control out on the map contradicted all five. It is the only one the player meets first.

## 4. Three receipts

`interviewLogReceipt(activity, answer)` — a pure function, and the one place the three outcomes are
told apart:

| condition                | receipt                                | why                                                                              |
| ------------------------ | -------------------------------------- | -------------------------------------------------------------------------------- |
| not `useful`             | ✓ Written down — nothing here to carry | in the grid and nowhere else; not a finding, so it never reaches the notebook    |
| `useful`, `notebook` set | ✓ Available in your Field Notebook     | a candidate. Keeping it is a second press, and five of eight will not survive it |
| `useful`, no capacity    | ✓ In your Field Notebook               | the one case the old string was right about, and it is unchanged                 |

**The second row is not a nicety.** Units 7 and 8's interviews declare `capacity: 3` against
`requires.useful: 8`, so on those two the old string was false for _every_ answer — the flat ones
were never findings and the useful ones were only candidates. P0-3 was filed on 2026-08-03, when
neither unit existed. **The finding got worse while it sat**, which is an argument for taking an S2
rather than carrying it.

**The offer stays one string under every authored answer.** Which answers carry something is what an
interview is for, and a button that changed its words would hand that over before the press. Only
the receipt differs, and only after the player has committed.

Green is dropped for the flat receipt — it reads as _secured_, which is the claim this entry is
about — for the same neutral treatment `.field-interview__answer` already gives an unmarked answer.
The tick stays: the press did do something, and the CSS comment beside it has said since Phase 69
that a control which reports nothing reads as one that failed.

## 5. One line is a budget, and the first draft was two

The receipt and the button share a slot in a bubble already at the limit of what fits above a
speaker — the CSS comment says so, and no test had ever checked it. The rationed string was first
drafted as _"Worth keeping — choose it in your Field Notebook"_ and the new e2e case measured it at
**48.8px against the button's 31.4px**: two lines, growing the bubble on the press, in the one
receipt no spec walks to. "Available in your Field Notebook" is one line, and it is also the better
sentence — the panel's own word, and _Available in_ against _In_ is exactly the difference being
drawn.

Measured rather than reasoned about, because the guess was wrong. The assertion compares the receipt
to itself under the longest of the three strings, and to the offer against one computed line height
— a `<p>` and a `<button>` carrying identical rules land 1.6px apart and always have, so exact
equality would have been a false invariant.

## 6. What was deliberately not done

- **No content edited**, in either direction. The six `howItWorks` slates that say _"press Add to
  Field Notebook"_ are still exactly right, because the offer did not change.
- **`interviewFindings()` untouched**, so `interviewTokens()` and DISCREPANCY's evidence column are
  untouched. That was half of what the routing note said the fix would cost, and it costs none of it.
- **The gold border on a useful answer stays.** It marks a useful answer before the press, which
  makes the grey/gold pair the affordance and the receipt the confirmation. Whether that is too
  generous a hint is a design question, and it is not this one.
- **No e2e walk to a Unit 7 or 8 speaker.** The rationed receipt is pinned by unit test and its width
  by substitution above; a 90-second map walk to prove a branch already proved twice is not worth it.

## 7. Where P0-3 actually went

Part 0 routed it to **Part 8**, and Part 8 closed on 2026-08-23 with no open items and no mention of
it. The ledger has carried it on Part 0's row ever since. The rule that an S3 must name a destination
worked — a destination was named — and nothing ever checked that the destination took it. Worth
knowing when the next program is designed; not worth a mechanism for a closed one.

## 8. Verification

`npm run test` — **2,102 passing** across 76 files, 2,098 before; the four new ones are the flat
receipt, the rationed receipt, the identical offer, and the three tones. All four fail against the
old behaviour, proved by stubbing `interviewLogReceipt()` back to its single return.
`npx playwright test activity-engines` — 10 passed, including the new case, walked on the exact path
P0-3 names: the Taíno elder, "Where is the gold?", the tracker still reading 2/7 afterwards.
`unit-02-activities`, `field-notebook`, `mission-debrief` — 18 passed, and the three that assert the
unchanged "In your Field Notebook" still do. `visual-regression` 21 passed with no baseline moved —
the field bubble is in none of them. `validate:content` 0 errors, `lint` 0 errors and the 5 standing
warnings, `format:check`, `cspell` and `build` clean.

**And by eye**, which is where the green pill was ruled out: the two receipts screenshotted side by
side, grey under a grey answer and green under a gold one.
