# Part 12 — Unit close and the next unit

**Closed 2026-08-23.** Decision log
[`0088`](../decision-log/0088-a-unit-closes-through-what-it-has.md).

The end of a case and the end of a unit: the case-close chain `reconstruction` → `upload` →
`review` → `completion`, the badge that is supposed to come out of it, and how a player learns the
next unit is open.

Two routes landed here. **From Part 9**: the whole case-close chain, which 6B's script reached the
door of and no further, and which nothing had read. **From Part 11**: `arcClose`, the third
one-shot disclosure on the mission debrief — Part 11 filed the other two into the Codex and left
this one here, because it is about a **case** and the Codex is a list of records.

Off the strictly-ordered spine, so it starts from a seeded state rather than from Part 11's exit.
Two new warps, `unitclose` and `reconstruct`, are what put a player in it.

---

## Findings

All `A` (static audit), and four of the nine measured against the running content rather than read
off the source. No owner pass was run.

| №     | S   | Category  | What                                                                                                                                     | Outcome                                                                            |
| ----- | --- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| P12-1 | S2  | `broken`  | **Five of seven units' Archive Review is Unit 1's, under their own name — and submitting it is the only thing that opens the next unit** | Fixed. `unitReviewFor()` returns null, and `closeUnit()` is the end of both paths. |
| P12-2 | S2  | `broken`  | The Archive Review is the one written surface in the game that keeps nothing until it is submitted                                       | Fixed. In `handleAppChange` with every other written surface.                      |
| P12-3 | S2  | `broken`  | Five of seven units have no badge at all, and the Preservation Case prints an empty grid under each of them                              | Fixed. One badge per case, derived from the case.                                  |
| P12-4 | S2  | `broken`  | One mission in five of seven units drops the case's arc close entirely                                                                   | Fixed. The paragraph is about the case, so it survives; the quote does not.        |
| P12-5 | S3  | `rough`   | Two Unit 1 badges describe themselves in the future tense after they have been earned                                                    | Fixed by P12-3 — where and when is true in both states.                            |
| P12-6 | S3  | `unclear` | Finishing a unit announces nothing, and leaves the Navigation Table on the unit just finished                                            | Fixed. A notice, and the next period named on the button that opens it.            |
| P12-7 | S3  | `broken`  | `progress.unitComplete` and `progress.completedUnits` are written and read by nothing                                                    | **Taken — Phase 116, `0115`.** Carried eight phases first, per `0088` §5.          |
| P12-8 | S3  | `unclear` | The Reconstruction Table is all-or-nothing over up to seven records and never says which one is wrong                                    | Fixed. It says how many are right, and still names none.                           |
| P12-9 | S3  | `rough`   | Nothing walks the case-close chain; `upload` has neither a spec nor a baseline                                                           | Fixed. `unit-close.spec.js` walks it end to end.                                   |

---

## The one worth reading twice

**P12-1**, and it is the fourth appearance of the shape CLAUDE.md already names: _a per-unit table
with a sane fallback and no test._

`UNIT_REVIEWS` has two entries. `reviewScreen()`, `completionScreen()`, `submit-review` and
`evaluate-saq` all end `|| REVIEW`, and `unitReadyForReview()` never consults the table at all — so
the Navigation Table offers **"Begin Period 5 Archive Review →"** for a unit that has no review, and
the screen behind it is Unit 1's Atlantic World checkpoint under the heading _A House Divided_.
The completion screen then scores those answers against Unit 1's key, and the Archive Evaluator is
sent Unit 5's unit object with Unit 1's rubric.

What makes it more than a wrong screen: **`submit-review` is the only caller of `unlockNextUnit()`
outside Teacher Mode.** A unit tab is disabled until some case in its unit is unlocked, so for a
student not in a classroom, the only route from Unit 3 to Unit 4 is to submit Unit 1's Archive
Review under Unit 3's name. The broken fallback is load-bearing — which is why it has survived four
units.

It is also the one finding here that the Phase 90J registry work could not have caught. That pass
made an _unmapped_ content export a hard error; a **missing** one is still silent, because a unit
with no `_REVIEW` export simply has no `review` key and nothing asks for it.

The program authors no content, so the fix is not five Archive Reviews. It is that a unit without
one must not be offered one, and must still be able to close.

---

## The rest

**P12-2.** Every other written surface in the game persists as you leave the field:
`[data-saq-quest]`, `[data-dbq-response]`, `[data-evidence-reflection]` and the rest all sit in
`handleAppChange` and `save()`. The Archive Review's own `[data-mcq]`/`[data-saq]` are read in
exactly one place — inside the `submit-review` handler, off the DOM. Type three SAQ paragraphs,
press "← Archive map", and there is nothing to come back to. This is the unit's summative written
work.

**P12-3.** `UNIT_BADGES` has `unit-01` and `unit-02`. `unitOneBadgeCaseMarkup()` maps over all seven
`UNITS`, so Periods 3 through 7 each get a heading and an empty `.badge-case-grid` under a dialog
whose own subtitle promises "Badges are preserved here after each field area is completed."
`main-badges-quests.test.js` pins the empty-array fallback and asserts nothing about a shipped unit.

**P12-4.** `missionDebriefScreen()` shows "What the three records make together" only when _the
mission being debriefed_ carries `arcClose`. Exactly one of the three missions in Units 2, 4, 5, 6
and 7 has none, so a player who happens to file that one last gets no arc at all — one ordering in
three. The gate's own comment states the opposite intent: "a player who finishes in a different
order still gets it, wherever they actually ended." Unit 3 is the only one with all three; Unit 1
has none authored, which is a content gap rather than this bug.

| unit    | missions with `arcClose` | the one without                |
| ------- | ------------------------ | ------------------------------ |
| unit-01 | 0 of 3                   | — (none authored)              |
| unit-02 | 2 of 3                   | `riverbend-charter`            |
| unit-03 | 3 of 3                   | —                              |
| unit-04 | 2 of 3                   | `canal-toll-receipt`           |
| unit-05 | 2 of 3                   | `richmond-impressment-order`   |
| unit-06 | 2 of 3                   | `railhead-land-office-receipt` |
| unit-07 | 2 of 3                   | `port-ship-manifest-page`      |

In Units 3 through 7 the sibling arc closes share one `established` paragraph verbatim and differ
only in speaker and line — the quote is written in the voice of someone from _that_ mission, the
paragraph is about the case. Unit 2's two differ in both.

**P12-5.** `badge.description` renders in both states. Case 2 and Case 3's read "…record will appear
after the Atlantic case is archived", so an earned badge says "Preserved" and then describes itself
as not yet existing.

**P12-6.** Completing a _case_ sets `hubNotice`. Completing a _unit_ sets nothing, and
`progress.selectedUnitId` still points at the unit just finished — so "Return to Institute" lands
back at a Navigation Table full of ✓ markers with the newly opened unit one undiscovered tab away.
The smaller event is announced and the larger one is not.

**P12-7.** Both fields are in `DEFAULT_PROGRESS`, both are written by `submit-review`, and no file
in `apps/web/src`, `tests/` or `scripts/` reads either. `unitComplete` is additionally only ever
written for `unit-01`. This is why P12-3 and P12-6 have nothing to read.

**Taken in Phase 116 (decision log `0115`), on the condition `0088` §5 set rather than before it.**
The cause turned up on the Navigation Table: its period strip has four states a student cares about
and drew two, so **a period they had archived rendered byte-identical to one they had not started**
— while the legend a few pixels below was teaching `✓ Archived` for the case markers on the same
screen. `completedUnits` is what that tick reads, and `unitComplete` is deleted, having answered
the same question for one unit since Unit 1 was the whole game.

**P12-8.** `check-reconstruction` compares every record and, on any mismatch, prints one sentence
for the whole board. Units 3, 6 and 7 put seven records on it.

**P12-9.** `visual-regression.spec.js` screenshots `review`, `completion` and `reconstruction` at
`unit-01` via `setScreen()`. Nothing walks the chain, and `upload` has no baseline and no spec —
so no test in the repository would have failed on P12-1, P12-3 or P12-4.

---

## Play script

Two warps, because the part has two halves and neither is reachable from the other. Steps 1–5 are
the case close, from `?warp=reconstruct` — Case 1.01 with all three records already secured. Steps
6–12 are the unit close, and step 6 says where to go for them.

1. Read the Evidence Channel's last line. → A gold **"Open Reconstruction Table →"**, not a count of
   what is left.

2. Press it. → Three records, each with a lane picker, and the lanes explained above them.

3. Put two records in the wrong lanes on purpose and press "Test reconstruction". → It says **how
   many of the three are right**, and names none of them.

4. Fix them and press it again. → The upload screen: the beam, the three status pills, one button.

5. Press "Case archived — Return to Institute →". → The recall warp, then the Archive beside the
   Navigation Table. The status line reads "Field record received."

6. **Now `?warp=unitclose`** — Units 1–3 finished, the table open on Unit 3. Read the button under
   the route panel. → **"Archive the Period 3 record →"**. Unit 3 has no Archive Review, so it is
   not offered one.

7. Click the **Period 2** tab and read the same place. → **"Begin Period 2 Archive Review →"**. Unit
   2 has one, so it is.

8. Open Unit 2's review, type a sentence into the first SAQ box, then press "← Archive map". Go back
   in. → **The sentence is still there.**

9. Go back to the **Period 3** tab and press "Archive the Period 3 record →". → "Revolution and
   Founding archived." No MCQ or SAQ line, because there was no review to score.

10. Read the buttons. → **"Open Period 4 →"** first, "Return to Institute" second.

11. Press "Open Period 4 →". → The Navigation Table, on Period 4, with its first case selectable.

12. Walk to the Preservation Case in the Archive Room. → **Every period has badges**, three each,
    Periods 1 to 3 preserved and the rest locked. None of them describes itself as not yet existing.
