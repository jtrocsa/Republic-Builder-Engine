# 0109 — Every action lands

**Phase 110 · 2026-09-05 · Accepted**

Three of the four engines could not tell a player that a press had done something. INTERVIEW marked
every log outcome "secured" including the ones that carry nothing; DISCREPANCY and TRACE turned the
pressed button red and said **nothing at all**; and one sound played whether the move landed, missed
or was refused outright. All three now answer.

Second phase of the Beta Readiness program — see
[`BETA-READINESS-LEDGER.md`](../playtest/BETA-READINESS-LEDGER.md). It is bound by that program's
two owner rules, and this phase is where the second one bites: **loud action, honest judgment.**

---

## 1. The rule this phase had to hold while getting louder

The owner's report was that there is no clear sense of having done something right or wrong. The
obvious fix — mark every choice right or wrong the moment it is made — is the one thing this game
must not do. [`CHRONICLE-VOCABULARY.md`](../design/CHRONICLE-VOCABULARY.md) §2 defines "Not enough
evidence" as **a finding, not a failure**, and an INTERVIEW is built so that asking a fisherman about
the assembly returns honest nothing rather than a mistake. A buzzer there teaches that history is a
quiz.

So the split is between the **action** and the **judgment**. Did that press count — yes or no,
instantly, unmistakably. Was your reading of the source right — that stays where it already lives, in
the closer's three states, at the end. Everything below is on the action side of that line, and
**nothing here introduces a ✗**: the game has never had one, and it is not getting one now.

## 2. The words were fixed and the glyph was not

Phase 106 (`0105`) gave `interviewLogReceipt()` three outcomes because `log` has three. The render
underneath it printed **`✓` on all three**:

```
✓ In your Field Notebook          — a useful answer, true
✓ Available in your Field Notebook — a useful answer on a rationed notebook, true-ish
✓ Written down — nothing here to carry
```

`✓` is not decoration in this game. The Mission Tracker prints a legend on every field map — **`✦` go
here · `✓` secured · `·` locked** — and the world markers and the NPC head badges use that same set.
So the third line said _secured_ in the one vocabulary the game teaches explicitly, on **104 of the
156 authored interview answers**, which is the common case and the first press of the first mission.
That is the half of Spine Review P0-3 that survived its own fix.

The three outcomes map onto the three marks exactly, which is why this is a one-character change per
receipt rather than a new iconography: `✓` secured, `✦` available and waiting on a second press, `·`
nothing here. The mark now lives in `interviewLogReceipt()` beside the string, so the one place that
tells the outcomes apart owns both halves of how they are told apart.

**And two of the three had no CSS.** `.is-candidate` and `.is-kept` both fell through to the green
base rule, so on the two rationed interviews — Units 7 and 8, the two that make keeping a second,
separate press — Phase 106's three receipts rendered as two. `.is-candidate` is amber now, from the
same `--c-warning` the closer's unsupported state uses and for the same reason: you have not failed
and you have not finished.

## 3. Eleven missions that went red and said nothing

DISCREPANCY and TRACE take a choice, tint the button red, and print nothing. Then, the moment the
player lands the right answer, they print a hundred to two hundred words of `claim.why` or `leg.why`.
All the prose is on the far side of the answer, and the near side is a colour.

ASSEMBLY has not worked this way since Phase 68: `fragmentNote()` walks a ladder — `hints[0]`,
`hints[1]`, then the full `misread`. Red-and-silent beside that reads as a control that failed rather
than an answer that missed, and it is **eleven of the twenty-four shipped missions**.

Each engine now says one line under a choice that missed, and the line is **placeless** — it names
where to look on this kind of board, which is a fact about the mechanic and not about the period, so
it lives in the engine rather than in eleven content files. Same register the default `lockedNote`
reached for when it lost the word "island".

TRACE needed two, because it asks two different questions and a nudge pointed at the wrong one is
worse than silence: the ledger axis asks what a step does to the record, and the support axis asks
how far the account carries it — a leg can be true and still `not-shown`.

**Deliberately not content-overridable yet.** An optional per-claim field would be one `||` away and
nothing would author it, which is exactly the state `hints` and `supportLevels` have been in since
Phase 76 — one mission each, still. It earns the field when a second mission wants a different
sentence.

## 4. One sound for landing, missing, and being refused

`handleActivityAction()` fired the same `playQuestSfx` on every accepted verb — ask, log, place,
lift, verdict, gap, effect, support, keep, release, file. Logging the answer that carries the mission
and logging one that carries nothing were **the same noise**. And a verb the reducer refused returned
early in silence, which is what makes a legitimately-gated control read as a broken one.

The interesting part is what made the fix small. "Did that press count?" is an engine-specific
question, and it was four questions — until Phase 109 gave all four engines a `summary()` for an
entirely different reason. Every engine now reports `{ done, total }`, and every engine's notebook is
the same `{ kept: [] }` from the shared contract, so the test is one comparison:

```
landed = done went up  ||  kept went up  ||  the record just closed
```

The third term is why it is not simply the ratio: no board count moves when the closer lands, and
filing the right conclusion is the most important press in the mission. `release` reduces `kept` and
so reads as flat, which is correct — the player gave something up.

The new cue is `flat`, and it is deliberately the same gesture as `secure` pointed downward: two soft
notes falling where secure's triad rises. Quiet and short, because a student meets it far more often
than its opposite by design. A refused press gets it too — for the player, "refused" and "that
gathered nothing" are the same message.

**`ask` is the one verb outside the split, and it has to be, twice over.** The generic rule caught it
on review rather than in a test: asking never moves a count — only `log` does — so every question a
player put to anyone, including the good ones, would have played the flat cue. That is the opposite
of the message. And the deeper reason is the one `interviewLogReceipt()`'s own doc comment already
makes about the button above it: **the offer under an answer is one string for every answer**,
because which answers carry something is what an interview is for, and a cue that changed with the
answer would give it away before the press exactly as a changing label would. Asking keeps the
conversational `dialogue` cue, identical whatever comes back.

## 5. Two things found beside the ones being fixed

- **`.activity-feedback.partial` was emitted and styled by nothing.** `practiceCheckScreen()` has
  written that class since Phase 28, so a partially-right answer wore the plain grey box while right
  and wrong both had a colour. It is amber now, the same third thing.
- **ASSEMBLY's correct state was gold while every other engine's was green.** `.activity-slot.is-right`
  alone said gold, so a rebuilt plate looked _highlighted_ where a settled claim, a logged leg and a
  filed conclusion all looked _right_. In a phase whose whole subject is a consistent signal, one
  engine using the wrong half of the palette is the thing to fix rather than to document.

## 6. What was deliberately not done

- **No ✗, anywhere.** See §1.
- **No verdict is announced earlier than it already was.** The closer still decides, at the end, in
  three states. Nothing here tells a student their reading of a source is wrong.
- **No authored word changed**, and no content file was touched.
- **The `where`/`lockedNote` copy is untouched.** This phase adds a line only under a control the
  player pressed and missed; a board a player has not answered opens exactly as silent as before,
  which is what keeps the program's net-fewer-words rule intact.
