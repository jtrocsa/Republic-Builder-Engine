# Part 9 — The record and the checks

**Closed 2026-08-23.** Decision log
[`0086`](../decision-log/0086-the-codex-remembers-the-door-it-came-through.md).

The two screens a record leads to when it is **not** a mission, and the panel that is the door to
both: `sourceReader()`, `practiceCheckScreen()`, and the field's Evidence Channel. Ten of the
thirty-eight records in the game open the reader rather than an activity, and every field case has a
Practice Check behind the same panel.

Two S3s were routed here from Part 6B — **P6B-8**, the Practice Check's two progress counts, and
**P6B-9**, the Evidence Channel's static progress line. They are P9-3 and P9-4 below.

The last of the strictly-ordered spine parts. The case-close chain — the Reconstruction Table,
upload, review, completion — is deliberately **not** here; it is a case ending rather than a record,
and it goes to Part 12 with the unit close.

---

## Findings

All `A` (static audit). No owner pass was run.

| №    | S   | Category       | What                                                                                                              | Outcome                                                                  |
| ---- | --- | -------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| P9-1 | S2  | `broken`       | Opening a record from the Codex destroys the Codex's own way back — "← Return" leaves the Institute for the field | Fixed. Two variables for two questions, and one duplicate control fewer. |
| P9-2 | S2  | `hollow`       | The reader's own questions never say whether the answer was right, and the authored explanations render nowhere   | Fixed. Three states, like the Investigation Challenge next door.         |
| P9-3 | S2  | `inconsistent` | (from P6B-8) The Practice Check counts _answered_ for two sections and _correct_ for two, under one label         | Fixed. `isQuestComplete()` for all four, and one count.                  |
| P9-4 | S3  | `rough`        | (from P6B-9) The Evidence Channel's last line re-lists what the briefing already named and never changes          | Fixed. It states the gate it is actually standing in front of.           |
| P9-5 | S3  | `rough`        | "Answer both questions correctly first" — a literal describing content, on a variable-length set                  | Fixed in passing.                                                        |
| P9-6 | S3  | `rough`        | The reader refuses a too-short reading with the only `alert()` in the game, for a bar nothing states              | Fixed in passing. An inline refusal, and the bar stated up front.        |
| P9-7 | S3  | `broken`       | A reload on the Codex forgets its origin the same way P9-1 did, because `codexOrigin` dies with the page          | → Part 11. That part owns the Codex screen.                              |
| P9-8 | —   | —              | Nothing answered in the Practice Check can reach a graded surface, as its own copy claims                         | Checked and correct — see below.                                         |

---

## The one worth reading twice

**P9-1.** Part 5, 6A, 6B and 7 each ended with the same lesson: when a control exists in two forms,
the state changes belong in one function both call. This is that lesson's dual, and it is worth
having both written down because they are caught by different habits.

`sourceOrigin` answered two questions — where the _reader_ goes back to, and where the _Codex_ goes
back to. Opening a record from inside the Codex writes the reader's answer over the Codex's, so the
Codex's "← Return" stops resolving to the Institute and falls through to its default: the field.

Every step is an ordinary thing to do. Both hub side panels carry **Open Codex** as their one
non-reset action, the Codex offers to reopen any record you have filed, and "← Return" is the way
back out. Five presses from the Archive Room and you are standing on a map.

The duplication lesson is found by diffing two call sites. This one cannot be — there is one
assignment and one read, and each is correct where it stands. It is found by asking what a name
means, and `origin` on its own does not say origin _of what_.

`secure-source` reached the same wrong screen one step earlier: it ended on the field
unconditionally, so **Filed in the Codex ✓** on a record opened from the Institute put the player on
the map, and wrote the field's status line on the way out to a screen they were not going to.

---

## The paragraphs nobody could read

**P9-2.** Two records answer their Chronicler prompt with multiple choice instead of a paragraph, and
every card on both printed the same sentence in all three states — because `mcqHint()` takes no
arguments and returns a constant. A **correct** answer therefore got, in a green success box:

> Choose the option that best explains why, not just the option that names the correct answer.

Behind that sat the authored `explanation` for each question — that Columbus never saw the 1507
sheet, having died in 1506 still holding that he had reached Asia; that fourteen years of Atlantic
voyaging rewrote the western third of a map and left Ptolemy standing everywhere else because nothing
had happened to challenge him. Neither had ever rendered anywhere in the game.

The reader has three states now, and the explanation shows **only** on a correct answer — where this
parts company with the Practice Check's identical-looking cards on purpose. There, an explanation
under a wrong answer is the point: it is practice, it is retryable, nothing is behind it. Here the
set is the gate on Institute Context.

---

## What was checked and found correct

- **P9-8.** The Practice Check's copy promises that it "does not affect your Preservation Case
  progress." Its four quest arrays are separate pools from the Archive Challenge, Investigation and
  reader quests, resolved through different lookups, so no answer given here can pre-answer a graded
  screen. `recordSkillOutcomes()` does write `progress.skillMastery`, which is the Skill Mastery
  Record — a mirror, not a grade, and not the Preservation Case.

---

## Play script — 12 steps

Opens on `?warp=field` — the Caribbean, at the shoreline spawn. Steps 7–10 need a filed record, which
is what steps 1–6 produce.

1. Read the Evidence Channel on the right, bottom line. → "3 records still to secure. The
   Reconstruction Table opens when the last one is in."

2. Walk to the village elder, take the observation, and file it. → You land back on the map, and the
   Channel now says two.

3. Open the Practice Check from the same panel. → The heading says **Practice Check**, the same three
   words as the button you pressed.

4. Read the summary line, then answer one multiple-choice question wrong. → It stays at 0/6. The
   card's own left edge turns red.

5. Answer it right. → 1/6. Scroll the four sections: there is one count on this screen, at the top.

6. Back to the field, finish the reconstruction on the west shore, and open the record from the
   activity's footer. → The reader, with two multiple-choice questions instead of a writing box.

7. Answer the first one wrong. → "Not quite," and a nudge. Nothing about why.

8. Answer it right. → "Correct," and the paragraph about Waldseemüller, Vespucci, and Columbus dying
   the year before the sheet was printed.

9. Answer the second, then file the record. → Institute Context opens; the record files; you land
   back where you opened it.

10. Recall to the Archive and open the Codex from the side panel. → Your filed records, and the case
    satchel above them.

11. Open one of those records, then press "← Back to Codex". → The reader, then the Codex. Note that
    the reader offers one way back rather than two.

12. Press "← Return". → **The Archive Room**, where you opened the Codex. Not the field.

---

## Routed onward

- **P9-7** → Part 11, the Institute Archive. `codexOrigin` is a module-local, so a reload on the
  Codex resets it and "← Return" leaves the Institute for the map — P9-1's bug reachable by refresh.
  Left here deliberately: `openSourceId` and `sourceOrigin` have always had the same property and the
  established answer for reader-adjacent navigation is a recovery path, not a persisted crumb. Part
  11 owns that screen and already carries P5-9, P5-10 and P8-5.
- **→ Part 12**: the case-close chain — `reconstruction`, `upload`, `review`, `completion` — is
  unaudited. 6B's play script reached the Reconstruction Table's door and no further, and nothing
  below it has been read.
