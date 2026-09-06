# 0088 — A unit closes through what it has

**Phase 90K · 2026-08-23 · Spine Review Part 12 — unit close and the next unit**

Part file:
[`part-12-unit-close-and-the-next-unit.md`](../playtest/part-12-unit-close-and-the-next-unit.md).
Supersedes nothing. Closes the case-close chain routed here from Part 9 and `arcClose` from Part 11.

---

## 1. The fourth per-unit table, and the first one that was load-bearing

`UNIT_REVIEWS` has two entries. Its four readers — `reviewScreen()`, `completionScreen()`,
`submit-review` and `evaluate-saq` — all ended `|| REVIEW`. So for the five units with no authored
Archive Review, the Navigation Table offered **"Begin Period 5 Archive Review →"** and the screen
behind it was **Unit 1's Atlantic World checkpoint under the heading _A House Divided_**. The
completion screen then scored those answers against Unit 1's key, and the Archive Evaluator was sent
Unit 5's unit object with Unit 1's rubric.

This is the shape CLAUDE.md names — _a per-unit table with a sane fallback and no test_ — for the
fourth time, after `FIELD_COPY`, `UNIT_MAP_VIEW` (`0087`, one phase ago) and
`build-field-guide.js`'s four tables. What is new here is **why it survived four units**:

> `submit-review` is the only caller of `unlockNextUnit()` outside Teacher Mode.

A unit tab is disabled until some case in its unit is unlocked. So for a student not in a classroom,
the only route from Unit 3 to Unit 4 was to submit Unit 1's Archive Review under Unit 3's name.
**Deleting the fallback on its own would have walled five units off**, which is presumably why
nobody deleted it. The fallback was not merely tolerated; it was carrying the progression.

That is the generalisable part. **A fallback that is doing a second job cannot be removed by
removing it** — the second job has to be given somewhere to live first. Here that is `closeUnit()`,
one function reached by two controls: `submit-review` for the two units with a review, and a new
`close-unit` for the five without, whose button reads "Archive the Period 3 record →". It is the
same shape as `openFieldRecord()`/`beginFieldRecord()` and `nearestInReach()` — when a control
exists in two forms, the state changes live in one function both call.

**The program authors no content, so this is not five Archive Reviews.** Those are a real content
gap and go to the content queue. It is that a unit without one is not offered one, and can still
close.

`unitReviewFor()` returns `null` rather than falling back, and `unit-close.test.js` asserts, per
shipped unit, that it resolves to that unit's own authored review or to nothing — the assertion
written against `UNITS` rather than a list of ids somebody has to remember to extend. Confirmed
failing first: restoring `|| REVIEW` reds five of seven units by name.

## 2. Two more of the same table, found by looking for it

Having found one, the audit went looking, and the unit close had two more:

**`UNIT_BADGES` had `unit-01` and `unit-02`**, while the Preservation Case mapped over all seven
`UNITS` — so Periods 3 through 7 each printed a heading over an empty grid, in a dialog whose own
subtitle promises "Badges are preserved here after each field area is completed." Five of seven
units preserved nothing. The only test on it pinned the empty-array fallback.

Badges are now derived from the unit's own cases, which is the move CLAUDE.md prescribes for exactly
this: make it data rather than adding a second literal. A new unit gets badges for free, which
matters with Unit 8 next. It also retired a second defect for nothing — `description` renders in
both states, and case-002's and case-003's read "…record will appear after the Atlantic case is
archived", so an earned badge said **"Preserved"** and then described itself as not yet existing.
Where and when the case happened is true in both states, and is what a badge case shows anyway.

**`arcClose` is authored on two of three missions in five of seven units.** `missionDebriefScreen()`
read `activity.arcClose` directly, so a player who happened to file the third one last saw no arc at
all — one ordering in three, on the case-level payoff, and the gate's own comment says the opposite
out loud: "a player who finishes in a different order still gets it, wherever they actually ended."

The fallback keeps one half and drops the other, because the two halves are not the same kind of
thing. `line` is a quote in the voice of somebody from _that_ mission and would be a lie coming out
of a mission the player has not just played. `established` is about the case — in Units 3 through 7
the sibling arc closes share it verbatim. So a mission with no arc close of its own borrows the
paragraph and speaks for nobody.

## 3. The one surface that kept nothing

Every written surface in the game persists as you leave it: `[data-saq-quest]`,
`[data-dbq-response]`, `[data-evidence-reflection]` all sit in `handleAppChange` and `save()`. The
**Archive Review** — a unit's summative written work — was read in exactly one place, off the DOM,
inside the `submit-review` handler. Type three SAQ paragraphs, press "← Archive map", and there was
nothing to come back to.

It is now in `handleAppChange` with the others, and deliberately not in `handleAppInput`: `change`
fires on blur for a textarea, which is what leaving the screen does, and a `save()` per keystroke
buys nothing. No `render()` either — the value is already on the screen, and rebuilding would scroll
a part-written review back to the top.

## 4. What a close now says

Finishing a **case** has always written a hub notice. Finishing a **unit** wrote nothing, and left
`selectedUnitId` on the unit just archived — so "Return to Institute" landed back at a Navigation
Table full of ✓ markers with the newly opened period one undiscovered tab away. `closeUnit()` writes
the notice, and the completion screen names the next period on a button that goes there. Named
rather than "Continue": which period comes next is the one thing that screen knows and the table
does not say.

## 5. Carried, not fixed

**`progress.unitComplete` and `progress.completedUnits` are written and read by nothing.** Both are
in `DEFAULT_PROGRESS`; `unitComplete` is additionally only ever written for `unit-01`. They were the
obvious readers for §2 and §4 and neither needed them — badges read `completedCases`, the notice is
written at close — so this pass gave them no reader rather than inventing one.

Leaving them is the deliberate choice. Deleting a persisted field is a save-compatibility change for
a field nothing reads, which buys nothing; giving them a reader means putting "archived" on the unit
tab or the route panel, which is a visual change to the one screen this program is otherwise not
touching. **Whoever next has real cause to ask "which units has this student finished" should use
`completedUnits` and delete `unitComplete`** — it answers the same question for one unit only, and
has since Unit 1 was the whole game.

**That cause arrived in Phase 116, eight phases later** — the Navigation Table's period strip has
four states and drew two, so an archived period looked exactly like one never started. See
[`0115`](./0115-the-strip-had-four-states-and-drew-two.md), which also argues that the eight phases
of waiting were the right outcome of this section rather than a cost of it.
