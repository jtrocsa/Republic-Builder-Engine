# 0091 — The answer was in the save all along

**Phase 92 · 2026-08-25 · a read-only render mode for a finished quest**

Closes P10-4, routed out of Spine Review Part 10 to an ADR because the program fixes behaviour and
never shape, and this needed shape. Decision log [`0089`](./0089-a-mission-is-not-an-archive-challenge.md)
§2 states the problem and names the fix; this is the fix.

---

## 1. What was wrong

Fourteen of the twenty-one cases are not walked. `route: "mission"` reaches `missionScreen()`, which
frames that case's own quest — one of the four teacher-swappable types — and nothing else.

Finish one, come back to it, and the screen returned 403 characters of card with **zero quest
controls**: the case title, the prompt, and a sentence saying it was complete. The player's answer —
the order they arranged, the records they filed, the option they chose — was sitting in
`progress.questResponses` the whole time, and appeared on no screen in the game. The Codex does not
hold it either; the Codex holds field records and says so, and a non-field mission has none.

It was stored and hidden, on two thirds of the game's cases.

## 2. Why the obvious fix is worse than the bug

Just render the quest again. It is one call and the state is right there.

It is also the failure Phase 90F spent a whole Spine Review part closing on the activity engines.
`archiveChallengeQuestCard()` grades on **every render** — there is no submit step anywhere in this
codebase, which is a deliberate and good decision everywhere else. So a student who came back to a
finished mission and nudged one record would watch "Mission complete" flip to a hint, while
`completedCases` still had the case archived and the Navigation Table still had the next one open.
Two sides of the app disagreeing about whether the same case is done.

Locking `completedCases` instead — grade it, but ignore the result if the case is already complete —
is worse again: then the screen shows an answer that is wrong and a message that says it is right.

So the answer has to be shown **and** frozen, which is a change to the contract all six quest types
implement rather than a patch to the one screen.

## 3. The shape

`renderQuest(questType, quest, state, options)`. `options.readOnly` is the only key, every type
takes it, and each type decides for itself which of its own controls the mode touches — the same way
`partialSuccess` is a uniform slot that means something real on two types and `false` on four.

Two rules the six had to agree on, and they live in `quest-types/shared/html.js` rather than in six
places:

- **Textareas go `readonly`, not `disabled`.** A disabled textarea greys its own text out, and
  showing that text back is the entire reason this mode exists — a DBQ dossier runs several
  paragraphs and has to stay selectable and scrollable. Radios, selects and buttons go `disabled`,
  because there is nothing in them worth reading.
- **The quest root carries `data-quest-readonly="true"`.** Markup alone is not a lock. A drop target
  has no disabled state at all; a disabled input is one devtools attribute away from being live
  again; and a synthetic `change` event dispatches on a disabled control quite happily. So
  `isSealedQuestTarget()` in `main.js` guards `handleAppChange`, `handleAppDragstart`,
  `handleAppDrop` and the `sequence-move` action off that attribute — **derived from the render
  rather than kept in step with it by hand.**

That is the same shape as the activity engines' standing rule (`INVARIANTS.md`): every renderer
disables its own controls _and_ every reducer refuses every verb that could un-complete a filed
record. It is the second half that does the work, and here it earns its keep twice over — the drop
guard is not a mirror of the dragstart guard, because the drop target is a different element from
the drag source, so a card lifted out of a teacher-added question on the same screen could otherwise
have been dropped into the sealed quest's slot and written to _its_ quest id.

## 4. Where it is applied, and where it deliberately is not

**Applied:** `archiveChallengeQuestCard()`'s `alreadyComplete` branch, when there is an answer behind
it. That branch already had two states as of Phase 90L — a finished mission and a save migrated at
the Phase 58 split whose quest was never answered — and only the first one has anything to show. The
migrated case keeps the prompt-and-a-sentence card, because there is nothing else to give it.

**Not applied**, and both are decisions rather than omissions:

- **A completed Archive Challenge stays editable.** SAQ and DBQ complete on _submission_, not on
  correctness, and the card underneath them offers "Get feedback on my revision →". Revising after
  the first evaluator pass is the affordance, not an accident.
- **The Practice Check stays editable.** Its own copy says reviewing there never affects
  Preservation Case progress. Re-answering is the point of it.

`0089` §2 said building this mode gives those two the affordance "for free", and it does — the
capability is there, it is one argument, and either can take it the day someone wants it. Taking it
today would be changing something that is not broken.

## 5. Three things the record has to say that the form does not

All three found by looking at the rendered screen rather than at the markup, and none is cosmetic.

**A disabled `<select>` still looks clickable.** Chromium greys the text a little and keeps the
dropdown arrow, and on an evidence-organizing quest that control carries the whole answer — four
cards, four filed slots. It now drops the arrow (`appearance: none`), takes the dashed border the
read-only textarea beside it has, and its label changes from **"Place in"** to **"Filed under"**,
because the live form's label is an instruction and the record's is a fact.

**A sequencing record had no ordinals.** `.quest-sequence-list` is `list-style: none` — the live
form does not need numbers because the ↑/↓ buttons are the interface. Hide those buttons, as
read-only does, and what is left is an unlabelled column of sentences that happens to be in the
right order. A CSS counter puts the numbers back, so the record reads as the causal chain the
student actually built.

The `.evidence-card--placed` fade is the third of these: 55% opacity means "this one is done" in a
board where some are not, and in a finished record every card is placed, so the fade would have put
the whole answer behind a veil.

## 6. Verification

`tests/unit/quest-read-only-mode.test.js` walks all six types with a completed answer and asserts
three things. Two are obvious — nothing takes input, the answer is still there. The third is the one
worth having: **the default render is byte-identical to what it was.** A renderer that emitted
`disabled` unconditionally would lock the live form on every screen in the game, and every other
test in the suite would still pass, because they all render the default and none of them asserts the
absence of an attribute nobody had thought of yet. Confirmed against the real defect by pinning one
renderer's `disabledIf(readOnly)` to `disabledIf(true)` and watching that case go red on its own.

`non-field-missions.spec.js` covers one mission per quest type — which is the whole surface, since
every mission is one of the four — answering each through the real UI rather than seeding it, so the
response shape is the app's own. Each then checks the sealed render _and_ dispatches a synthetic
`change` and `click` into it and asserts the save does not move. Confirmed the same way: removing
`isSealedQuestTarget()` from `handleAppChange` turns three of the four red.

Two new baselines, `mission-exchange-ledger-filed` and `mission-bank-war-filed`. Neither has a
predecessor to diff against — this screen showed no quest at all before — so they are the only
record of what the mode looks like, and they are the reason §5 exists.
