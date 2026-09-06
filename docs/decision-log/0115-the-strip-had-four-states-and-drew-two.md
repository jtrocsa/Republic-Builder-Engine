# 0115 — The strip had four states and drew two

**Phase 116 · 2026-09-06 · Accepted**

**P12-7 closed**, and with it the last routed finding in the repository. `progress.unitComplete` and
`progress.completedUnits` were written by `closeUnit()` and read by nothing;
[`0088`](./0088-a-unit-closes-through-what-it-has.md) §5 declined to invent a reader for them and
set the condition instead:

> Whoever next has real cause to ask _which units has this student finished_ should use
> `completedUnits` and delete `unitComplete`.

The cause turned up on the Navigation Table.

---

## 1. What the strip could not say

`unitTabs()` draws the period strip above the table — eight pills, and the only way to move between
units. A tab has **four** states a student cares about: the one they are looking at, one that is
open, one the teacher has not unlocked, and one they have finished.

It drew two. Selected got a gold pill; teacher-locked got `opacity: 0.45` and a `disabled`
attribute. **A period the student had archived rendered byte-identical to one they had not
started** — same classes, same title, same text. Measured on the real screen with Units 1–3
archived, all three tabs came back as `text-button unit-tab` with `title="Period 1 · 1491–1607"`,
indistinguishable from Period 4's.

And the vocabulary was already on screen. The legend a few pixels below the strip reads
**`✦ Available · ✓ Archived · ○ Teacher locked`**, teaching exactly the mark the tabs needed, for
the case markers on the same screen.

## 2. Why a tick and not a colour

Two constraints, both measured rather than assumed.

**The strip had no room to grow, and less than anybody thought.** The left column is 248px at
1366×768 and 230px at 1280×720, and eight tabs at 73px with an 8px gap wrap to three rows and four
respectively — on the screen `global.css` line 948 already calls _"the one screen whose left column
has a job below the fold"_. **It has been paid for once on exactly that account**: Phase 90C dropped
the tabs' " · Locked" suffix because the extra width pushed a line each and put Periods 5 through 8
off the bottom of a 768px viewport, on a screen with no scroll.

The first attempt here was an inline `<i>`, and it measured **+14px a tab**. At 1366 that repacked
three tabs to a row into two and bought a whole fourth row, taking the strip's bottom edge from 740
to 763 in a 768px viewport — 5px of margin. So the tick is **absolutely positioned inside the pill's
existing 14px right padding** instead, and costs nothing at all: every tab measures 73px archived or
not, at both viewports, and the strip keeps the rows and the bottom edge it had. Measured both ways,
with none archived and with all eight.

**And the fold is worse than the quickref entry that closed it knows.** With Unit 8 selected and
every case unlocked, four tabs sit **below the fold at 1280×720** — with or without this change —
because the strip renders under the selected unit's guiding question, and Unit 8's runs seven lines.
`archive-navigation.spec.js` asserts exactly this and misses it, because it seeds the default Unit 1
with two cases unlocked. Recorded rather than fixed here: it moves a screen with a committed
baseline, it wants its guard strengthened in the same commit, and it is not what this phase is
about. It is the next one.

**Colour alone was not available.** `is-selected` is gold and `.legend-complete` is green, and
gold-against-green is the pair a red-green colour-blind student is least able to separate. Those
are precisely the two rules that would have carried the whole distinction. So the tick carries it
and the green border tints alongside — the same green the legend prints, deliberately, so the two
never drift apart.

The glyph is `aria-hidden`, and the state goes in the button's own accessible name — the split the
Mission Tracker's rows already make, because a screen reader announcing "✓" tells nobody anything.
One string feeds both `title` and `aria-label`, so the locked reason reaches assistive tech too,
which it did not when it lived in `title` alone.

## 3. What was deleted

`progress.unitComplete` is gone from `DEFAULT_PROGRESS` and from `closeUnit()`. It was written for
`unit-01` and for nobody: it answered _has this student finished the game_ back when Unit 1 was the
game, and `completedUnits` beside it answers the same question for all eight. Two references in the
whole repository, and no reader in `apps/web/src`, `tests/` or `scripts/`.

Removing a persisted field is a save-compatibility change, which is what `0088` §5 weighed it
against. It is safe here because nothing reads it: `readProgress()` spreads the stored blob over the
defaults, so an old save carrying `unitComplete: true` keeps the orphaned key and no code ever looks
at it. `completedUnits` has had its own `Array.isArray` merge line since it was added, so a save
with no array gets `[]` rather than `undefined` — which is the only thing the new reader could have
tripped over.

**A save that closed a unit before `completedUnits` existed will show no tick for it.** That is a
degradation to the old behaviour rather than a break, and it is the one case the new mark cannot be
right about, because the event it records was never written down.

## 4. Why the reader took this long, and why that was correct

`0088` §5 had two obvious readers to hand — §2's badge case and §4's unit-close notice — and used
neither, because badges read `completedCases` and the notice is written at close. It then refused to
add "archived" to the unit tab, on the grounds that Part 12 was not touching that screen.

That refusal is the reason this entry is short. The field sat unread for eight phases and cost
nothing; a reader invented in Phase 113 would have been a feature nobody had asked for, defended by
the fact that some state existed. **The question arrived first this time**: the Beta Readiness
program's whole subject is a student knowing where they stand, and the strip is where they choose
what to do next.

## 5. Scope held

- **The locked state was left alone.** It has a visual state already — dimmed and disabled — and
  four marks where three were missing one is not the fix. It gains only the accessible name.
- **No new colour, no new glyph.** `✓` is the game's own mark for _secured_ / _archived_, taught by
  the legend directly below and by the Mission Tracker's key on every field screen.
- **No content edited.**
- **No baseline moves.** `archive-navigation-table` seeds `{ currentScreen: "archive" }` and has no
  completed unit in it, so no tab in any committed screenshot carries a tick.

## 6. The guard

`unit-close.spec.js` already walked the real close — Unit 3 finished, `close-unit` pressed, `Period
4` opened — and asserted `completedUnits` was **written**. It now also asserts it is **read**: after
stepping through to the new unit's table, Period 3's tab carries `is-archived`, a `✓`, and an
accessible name ending in `· Archived`, while Period 4 carries none of the three and Period 5 is
still disabled. The same case asserts `unitComplete` is absent from the saved blob.

The guard rides the real path rather than seeding the end state, which is what makes it a check on
`closeUnit()` and the strip together. Reverting the one line that adds the class fails it by name.

## 7. Nothing routed remains open

Both ledgers are clear. The Spine Review's thirteen parts are closed with no carried findings, and
the Beta Readiness program closed with `0113`. The next piece of work will come from someone playing
the game, which — as of Phase 109 — is the only acceptance criterion this program ever really had.
