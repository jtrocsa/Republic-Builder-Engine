# 0052 — Making Case 1.01's three missions legible

**Phase 69 · 2026-08-02 · Accepted**

Supersedes nothing. Extends [0051](0051-activity-engines.md), which built the four activity engines
and authored Unit 1's three missions onto them.

## Context

0051 shipped. The owner then played all three missions end to end, and the mechanics worked — the
interview reaches seven people out on the map, the jigsaw reassembles a real scan, the audit gates
its second question correctly. What almost nothing did was **tell the player what they were doing**.

The playtest produced one cross-cutting complaint and eleven specific ones. The cross-cutting one:

> "there needs to be a link back to the quest if I need to check information that I have collected
> from others along the way. for example in the community elder quest, I had to go back to the elder
> multiple times to remember and see which dialogue options I had collected."

And, on the interview specifically:

> "it's not clear if the people you've talked to are the right people, or the wrong people… Okay,
> after asking more people more of the options I see now what is happening. You can ask anyone any
> of the four options and get a response including go ask this other person… So, it's not about
> that. Explain this."

That last one is the diagnosis for the whole pass. A player worked out the central design of the
INTERVIEW by trial and reported it back as a discovery. The mechanic was fine; nothing said what it
was. Everything below follows from that.

## Decisions

### 1. An engine may explain itself, and its words, from content

`contract.js` gains two optional fields spread into all four engine schemas
(`COMMON_ACTIVITY_FIELDS`): `howItWorks` (an ordered list of steps plus a note) and `terms` (a flat
glossary). The host renders both in the activity screen's copy column, beside the existing
`briefing`.

Both are content, and neither is a text-scanning system — an engine that went looking for its own
vocabulary inside authored prose would have to know something about language, and this folder's rule
is that it knows nothing about the subject at all. `cacique` and `conuco` are glossed because the
playtest named them:

> "'a cacique' is not a vocab word that was emphasized or labeled well. Same with conuco."

### 2. Hearing an answer and keeping it are two moves

> "When I ask someone a dialogue option and they tell me an answer there should be a button that says,
> log response. Otherwise it's hard to tell if it's been recorded"

INTERVIEW's state gains `logged` alongside `asked`, and a `log` verb. `asked` is what a speaker has
been put and is currently saying; `logged` is the notebook. **Everything downstream counts `logged`**
— coverage, the notebook, the outcome, and `interviewTokens()`, which is what fills DISCREPANCY's
evidence column. An answer you heard and walked away from is not something you are carrying, and
that is now true mechanically rather than only rhetorically.

### 3. A mission asks for one number, not two

> "At the top of the quest it says you need to put forward 4 questions and you need 5 people, this
> doesn't add up."

It didn't. `requires` becomes `{ questions?, speakers?, useful? }` with at least one set, plus an
optional `label` naming the `useful` bar. Case 1.01 sets `{ useful: 7, label: "Islanders' accounts
secured" }` — **one useful answer from each of the seven people on the island**, which the owner
chose from four options. That is a goal a player can see the end of, it makes "find the question
that reaches this person" the actual objective, and it guarantees the Columbus audit has a full
evidence column however the player got there.

A content bug fell out of writing this down: the file's header claimed seven useful answers and six
shipped. The Spanish sailor's account of the exchange — bells and glass given, water and cassava
bread taken — was never flagged, though the audit already keyed an observation off it.

### 4. The notebook is grouped, because the closer asks for a comparison

> "when you complete that process, it says, two records will now exist, the Spanish one and one you
> just put together. What's the difference. But, I can't compare them so how would I know??"

Fair. The closer asked a question the screen did not answer. `groups` is now an optional field on an
INTERVIEW, and when set the notebook renders one panel per group. The two accounts of the same island
sit above the question about the difference between them, and logged useful answers carry a ✓.

### 5. The Mission Tracker

"Records to Recover" is renamed **Mission Tracker** and gains a second block: the mission you have in
flight, how far along it is, and a button through to its notebook. The progress line comes from a new
optional registry slot, `summary(activity, state) → { label, done, total }`, which only INTERVIEW
implements — a TRACE is a chain, not a count, and simply doesn't declare one.

The owner chose the link over listing the answers inline; the panel sits on a 768px-high viewport and
the organizer is where the answers belong.

### 6. A filed interview is over

> "after the elder quest is over, the columbus dialogue option shouldn't be there."

`liveFieldInterview()` now also requires the activity to be unfinished. The owner accepted the
consequence ("If the elder quest makes it so they can't anymore, that's okay"), and §3 removes its
sting: by the time you can file, you are holding all seven accounts.

### 7. The jigsaw loses its labels; the cartouches wait for the sheet

> "I don't know what the words on the map tiles are supposed to be. they aren't helpful. The blank
> cartouches doesn't make sense to me. What am i organizing and how does this relate to the map?"

Two answers. `board.showFragmentLabels` defaults to off on an `image` board — the owner chose a pure
visual jigsaw — so a tile is the map crop and nothing else. The label survives as the tile's
accessible name, and the misread list names the **slot** a piece landed in, because on an unlabelled
board that is the only name on screen. And `board.opensAfter` keeps the cartouches shut until the
sheet is rebuilt: naming three landmasses on a map you have not assembled was being asked as a guess.

### 8. The audit leads with the letter

> "the columbus mission was really confusing. I think this was in part that there was not enough
> context… I don't know who or what columbus is doing here… it would be helpful to have the full
> text first"

`record` gains `context` and `text`, and the activity gains `verdictPrompt`. The screen now opens
with who is writing, to whom, and why; then the passage the five claims are lifted from; then the
standing instruction the three bare verdict buttons could never carry themselves. The observation
column counts what you are holding, which is the nudge to go back for more.

### 9. Reader questions, on one record

> "the file the record bit is redundant if the student then has to answer the next question in
> writing. So, i think after the puzzle and cartouche thing, the student can open the cosmographia
> and have a couple of multiple choice questions. No writing."

A source may carry `readerQuestType`/`readerQuestIds`, and `sourceReader()` renders those quests
instead of the prompt + textarea + Archive Evaluator. Answering them all correctly is what
`revealedContexts` means for such a record, so Institute Context and "Secure in Codex" unlock exactly
as before.

**Opt-in per source, and only `waldseemuller-map` opts in.** The owner chose "map only": rebuilding
the sheet, naming the cartouches and filing a judgement is already three acts of reading, and a
paragraph box after them was a fourth ending. The elder and Columbus records keep the written reading
and the AI evaluator, which is where the HIPP practice lives.

### 10. taino-context loses its Investigation Challenge

> "get rid of the introduction question in the elder quest because it feels like it doesn't apply
> anymore. Instead, have an instruction screen explaining the quest."

The gate asked a player to predict the sourcing of the worksheet they were about to open, and since
0051 there is no worksheet — there is an interview put to seven people on a map. The `howItWorks`
panel is its replacement. Both questions stay in `UNIT_01_INVESTIGATION_MCQ_QUESTS` on the terms that
file's own header already established for unwired spares.

## Two things found by measuring, not by reading

**The bubble flip had never worked.** 0051 added `.field-speech-bubble--below` and a measured
placement pass. The class went on, the `top` was recomputed, and the bubble did not move — a later
hotfix layer in `global.css` restated `transform: translate(-50%, -108%) !important`, which a plain
`translate(-50%, 0)` cannot beat. What actually kept the bubble on screen last phase was dropping the
NPC's ambient line once they had answered. Adding the log button put it back over the edge, and only
then did the dead flip surface. The override layer is now folded into the base rule and deleted
rather than a fifth layer being stacked on it; `placeFieldDialogueBubble()` picks the side with more
room and caps the bubble to it, and `.field-speech-bubble__scroll` scrolls the remainder inside the
bubble so the tail is not clipped.

**`:has(.field-interview) { width: 404px }` was also dead**, for a quieter reason: the base rule's
`max-width: 300px` clamped it. A `width` override alone loses to a `max-width`.

Both are the same lesson, and it is the one CLAUDE.md already tells: check the cascade before the
arithmetic.

## Consequences

- A dialogue bubble is a flex column with a scrolling child. Anything added to it must go inside
  `.field-speech-bubble__scroll`, or it will not scroll with the rest.
- `interviewTokens()` reads `logged`. An in-flight save from before this phase has `asked` and no
  `logged`, so its interview restarts — secured evidence in `progress.caseEvidence` is untouched.
- `summary` and `renderInline` are now two optional registry slots. Neither is required of a new
  engine.
- The `investigation-challenge` e2e spec and the matching visual baseline moved to
  `waldseemuller-map`, the only Investigation Challenge left in Case 1.01. It is a world marker on
  the far west shore rather than a person a few tiles north, so both walks are longer.
- Still deferred, unchanged: TRACE has no content, Units 2–5's 21 sources still route to the plain
  reader, and the Archive Room stays paused.
