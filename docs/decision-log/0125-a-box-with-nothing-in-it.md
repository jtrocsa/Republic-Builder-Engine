# 0125 — A box with nothing in it

**Phase 126.** One rule, one line of CSS, three screens — including the one where a new player names
their Chronicler. Found while walking the case-close chain looking for something else, which is the
usual way.

---

## 1. What a person watching sees

Open **Record Reconstruction**. Under the gold **Test reconstruction →** button there is a second
full-width rounded bar, faintly green, with nothing written in it. It is there before you have
placed a single record. It reads as a disabled button, or as an input that failed to load.

The same bar sits under **Submit Archive Review →**, and under the two buttons on the screen where a
new player picks their appearance and types their name — the second screen of the game.

---

## 2. Why, exactly

`.feedback` is painted unconditionally:

```css
.feedback {
  padding: 12px;
  border-radius: 10px;
  color: #e2f3e1;
  background: rgba(91, 150, 101, 0.2);
}
```

`showFeedback(id, message, type)` fills these by id, so the element has to exist in the markup
before there is anything to say. Empty, it is 24px of padding and a fill — and **the fill is the
success colour.** `.feedback.success` further down declares the identical `rgba(91, 150, 101, 0.2)`,
so the neutral state and the "that went right" state are the same green. Three ship empty:

| element                   | screen                 | box    |
| ------------------------- | ---------------------- | ------ |
| `#reconstructionFeedback` | Record Reconstruction  | 837×24 |
| `#reviewFeedback`         | the Archive Review     | 837×24 |
| `#identityFeedback`       | naming your Chronicler | 726×24 |

A sweep of **twenty-six** student-facing screens found exactly these three and nothing else, which
is what made a one-line fix the right size of fix.

---

## 3. The fix

```css
.feedback:empty {
  display: none;
}
```

**Same idiom and same argument as `.director-reveal-rail:empty`**, which this stylesheet already
uses a thousand lines further down. This is not an emptiness the markup can avoid: `showFeedback()` finds its target by id, so the
element must be in the document before it has anything in it. The rule belongs in the stylesheet
rather than in a conditional render.

The alternative — moving the green off the base rule and onto `.feedback.success` alone — was
rejected. Two `class="feedback"` paragraphs on the join and login screens carry `authUiState.info`
as content directly and have no type class, so they would have lost their panel. `:empty` says the
thing that is actually wrong: an element with nothing in it should not be drawn.

---

## 4. What it also fixed, and what it did not

The bar sat between the help text and the buttons on the identity screen, so removing it moved
**Confirm identity →** — the button that starts the game — up 38px:

| viewport | before              | after               |
| -------- | ------------------- | ------------------- |
| 1366×768 | 30px below the fold | **fully on screen** |
| 1280×720 | 69px below the fold | 31px below the fold |

At the size every baseline is taken, the empty bar was the entire reason that button was off the
screen. **At 1280×720 it is still 31px under**, with 14px of it showing, and that is a separate
defect of Phase 121's family — _where a control sits does not depend on how long an author wrote_ —
on a screen `fold-and-controls.spec.js` does not cover, since its table is the field cases and their
missions. Recorded here, measured, and deliberately not chased in a CSS pass about empty boxes.

---

## 5. The guard

`tests/e2e/empty-panels.spec.js` — twenty-six screens, plus the counter-assertion.

**A panel is a filled box, or a box with four edges. One edge is a line.** That distinction is the
only judgement in the sweep and it earns its place: the Navigation Table draws `.route-thread`
between its route markers as a 2px gold `border-top` and nothing else, and a connector between two
things is supposed to have nothing in it — it _is_ the line. Excluding it by class name would have
been an excuse; excluding it by what makes something a container is a rule.

**The counter-assertion is half the guard.** `display: none` on `.feedback` outright passes every
screen in the sweep and silences every message in the game, so the sweep alone cannot say the fix is
right. The second test files a wrong reconstruction and asserts the line appears, says what is
wrong, and is still drawn as a panel.

Watched fail both ways:

- With the rule removed, three tests name the element, its size and its colour — `identityFeedback`
  726×24, `reviewFeedback` and `reconstructionFeedback` 837×24, all `rgba(91, 150, 101, 0.2)`.
- With the rule widened to hide every `.feedback`, twenty-six pass and the counter-assertion fails
  on `toBeVisible()`.

**The anti-vacuity check is the one that had to be rewritten.** "Nothing is drawn empty" is trivially
satisfied by a screen that drew nothing, and a seed that misses lands on this app's own
`.empty-state` recovery markup — so the guard asserts there is no `.empty-state` in `main` before it
asserts anything else. The element count beside it is deliberately low (>4): **Skill Mastery is a
back link, a kicker, a heading and a paragraph**, and demanding more of it would be inventing a rule
to protect the test rather than the game.

---

## 6. What was not done

- **The Investigation Challenge is not in the sweep**, and the file says why: `investigationScreen()`
  resolves from the module-local `openSourceId`, so a seed cannot reach it — it recovers to an empty
  state, correctly. `visual-regression.spec.js` walks to the chart table to photograph it, and a
  40-second walk inside a sweep of static screens would buy one screen at ten times the cost of any
  other row.
- **Teacher surfaces are out of scope**, as in every layout pass before this one. The two
  `class="feedback"` paragraphs on join and login carry content when they render at all.
- **The base `.feedback` colour is still the success colour.** Nothing renders a `.feedback` with
  content and no type class on a student screen today, so there is no visible defect in it — but the
  neutral and the affirmative sharing one fill is the thing that made an empty bar read as an
  achievement, and it is worth remembering the next time this rule is touched.
