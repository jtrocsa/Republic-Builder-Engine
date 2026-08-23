# 0086 — The Codex remembers the door it came through

**Phase 90H · 2026-08-23 · Spine Review Part 9 — the record and the checks**

Part file: [`part-09-the-record-and-the-checks.md`](../playtest/part-09-the-record-and-the-checks.md).
Supersedes nothing. Closes the last of the strictly-ordered spine parts; 10–12 branch off it.

---

## 1. One variable, two questions

`sourceOrigin` answered two of them:

- **Where does the reader go back to?** Read by `return-source` and by the reader's own back-link.
- **Where does the Codex go back to?** Read by `return-codex`, which resolves `"source"` to the
  reader, `"hub"` to the Institute, and anything else to the field.

Opening a record from inside the Codex writes the first answer over the second. `openFieldRecord()`
sets `sourceOrigin = "codex"`, which is neither `"source"` nor `"hub"`, so the Codex's own "← Return"
falls through to the field — a screen the player never asked for, on whichever case happens to be
active.

Every step of the route is ordinary. Both hub side panels carry `Open Codex` as their one non-reset
action; the Codex offers to reopen any record you have filed; "← Return" is the way back out. So:

```
Archive Room → Open Codex → Open record → ← Back to Codex → ← Return → the field
```

`secure-source` reached the same wrong screen one step earlier and by a blunter route: it ended
`progress.currentScreen = "field"` unconditionally, so pressing **Filed in the Codex ✓** on a record
opened from the Institute put the player on the map. It also wrote `progress.fieldNotice` on the way
— the field's status line, left waiting on a screen the player was not going to.

**The fix is two variables for two questions.** `codexOrigin` is written only by the `codex` action
and read only by `return-codex`; `sourceOrigin` keeps the reader. `secure-source` returns where the
record was opened from, and the field notice goes only when the field does.

**And one control fewer.** A record opened from the Codex already has "← Back to Codex" on its left;
the `.codex-button` beside it went to the same screen. That is Part 6A's finding 3 in a smaller room
— two controls, one destination — and it was also the one press inside a Codex-opened record that
could still lose the Codex's origin, since it is the only `codex` action reachable from there. It is
omitted in that state rather than special-cased.

### The shape, stated once

Part 5, 6A, 6B and 7 all produced the same lesson from the other side: **when a control exists in two
forms, the state changes live in one function both call.** This is its dual, and it is worth having
both written down, because they are caught by different habits:

> **When one variable answers two questions, the second question gets the first one's answer.**

The first is found by diffing two call sites. This one cannot be — there is only one assignment and
only one read, and each is locally correct. It is found by asking what a name means, and `origin` on
its own does not say origin _of what_.

## 2. The reader's questions never said whether you were right

Every reader-quest card printed `questHint(type, result)`. For `mcq` — the only reader quest type
that exists — `mcqHint()` takes no arguments and returns a constant. So all three states printed the
same sentence, and a **correct** answer got it in a green success box:

> Choose the option that best explains why, not just the option that names the correct answer.

No confirmation, and the authored `explanation` unreachable — the paragraph saying Columbus never saw
the 1507 sheet because he died in 1506 still holding that he had reached Asia, and the one about
fourteen years of voyaging rewriting the western third of a map and leaving Ptolemy standing
everywhere else. Two of the best paragraphs in the content, rendered nowhere in the game.

`investigationScreen()` — the other screen built out of the same `.quest-practice-item` wrapper —
has always got this right: "Investigation complete — this record is ready to open." on completion,
the hint otherwise. The reader now has three states too.

**The explanation shows on a correct answer only**, which is where this deliberately parts company
with the Practice Check's identical cards. There an explanation under a wrong answer is the point: it
is practice, it is retryable, nothing is behind it. Here the set is the gate on Institute Context, so
printing the reasoning under a wrong answer hands over the answer.

## 3. The Practice Check counted two things and called them one

Routed in from Part 6B as its finding 8, which reported the visible half: a lone `N/M answered` under
the multiple-choice section only, wearing `.activity-feedback` — the class every card's own feedback
line uses — so it read as a verdict on the last question rather than a tally of the section.

Reading it turned up the larger half. `overallComplete` incremented on `answered` for MCQ and
sequencing and on `complete` for evidence-organizing and HIPP, under a label that says **complete**.
Three wrong multiple-choice answers read as "3/6 practice items complete"; a wrong HIPP read as 0.
It is `isQuestComplete()` for all four now — the same predicate each card's own `data-quest-status`
already uses — and the second count is gone.

The e2e spec that covers this screen had a four-line comment explaining the old rule to whoever read
it next. A test comment that has to explain a rule is usually reporting one.

## 4. The Evidence Channel says what it is gating

Part 6B's finding 9. The panel's last line was a per-map `progressHint`, and it had two problems at
once: it re-listed the records the briefing paragraph two panels left had already enumerated, and it
never changed as they were secured — while the Mission Tracker, between the two, carried a live count
and a bar.

It is not a third count now. The Mission Tracker lists and counts; this panel's own job is to say why
the gold **Open Reconstruction Table** button is not here yet, so it says that: how many records are
left, and what happens when the last one is in. Seven static strings came out of `FIELD_COPY`, which
is down to one field.

That table has now lost two fields for the same reason — `defaultNotice` in Phase 90E, `progressHint`
here — and both were static copy standing where live state belonged. Its header comment says so, for
whoever proposes a third.

## 5. Two smaller things

- **"Answer both questions correctly first."** A literal describing content. Two records carry reader
  questions and both happen to ask two; a third asking three would have been told to answer both of
  its three.
- **The only `alert()` in the game.** The reader refused a too-short initial reading with a system
  modal — on a screen with its own cursor, its own palette, and its own feedback line two elements
  up. The refusal now lands where every other refusal in the reader does, and the bar it enforces is
  stated in the sealed-context note before it can be tripped rather than after.

## 6. Recorded, not fixed

**A reload on the Codex still forgets.** `codexOrigin` is a module-local, so a refresh resets it to
`"field"` and "← Return" leaves the Institute for the map again. This is the reload half of §1 and it
is left deliberately: `openSourceId` and `sourceOrigin` have always had exactly this property, and
the established answer for reader-adjacent navigation is a recovery path rather than a persisted
crumb — `sourceReader()` carries one. Persisting a third would be a `DEFAULT_PROGRESS` field and a
merge line for a UI breadcrumb. **Routed to Part 11**, which owns the Codex screen.

**Checked and found correct**, recorded so the next reader does not re-find it: nothing a student
answers in the Practice Check can reach a graded surface. Its four arrays are separate pools from the
Archive Challenge, Investigation and reader quests, resolved by different lookups, so "This is
practice only — it does not affect your Preservation Case progress" is true as written.

## 7. Verification

- `npm run test` — 72 files, 1828 tests, all passing. No unit tests were added: every finding here
  lives inside a non-exported `main.js` screen function, and §1 in particular needs three screens in
  sequence to see at all.
- `tests/e2e/record-and-checks.spec.js` — seven new cases, one per finding, **all seven confirmed
  failing against `a89e8ab`** before the fix was kept, each at the assertion for the finding it
  names.
- `npm run validate:content`, `npm run lint` (0 errors, the standing 5 warnings), `npm run build`,
  `npx prettier --check`, `npx cspell` — clean.
- 44 e2e tests across twelve specs that touch these surfaces — `record-and-checks`, `practice-check`,
  `codex`, `archive-room`, `field-objective-tracker`, `field-recall`, `field-interiors`, `dev-warp`,
  `legacy-save-fallback`, `investigation-challenge`, `skill-mastery`, `archive-rotation` — passing at
  `--workers=2`, plus the full 20-test `visual-regression` file.
- **Nineteen visual baselines changed and each was measured, not accepted.** Fifteen are field
  surfaces, indoors and out, and every changed pixel on all fifteen falls inside columns 1088–1322 —
  the Evidence Channel aside. The map, the Mission Tracker and the cast are untouched.
  `practice-check-unanswered` is the H1 unwrapping from two lines to one, confined to the copy
  column. The two `source-reader` baselines are one 36px line each, the sealed-context note. And
  `practice-check-graded` is the interesting one: a full-viewport shot scrolled to the bottom of a
  page that is now one paragraph shorter, so parts of it reflow by a single pixel — best alignment is
  at shift 0, the two images read identically side by side, and the periodic 4-row bands at 64px
  intervals are the background texture moving with it.
