# 0129 — A question is read, not labelled

**Phase 130 · 2026-09-11 · Accepted**

`0128` made the game's three faces arrive for the first time in 312 commits, and closed by flagging
two consequences for the owner rather than changing them. This is the answer to one of them, and it
turned out not to be a matter of taste.

---

## 1. The flag

Every question stem in the game rendered in **Cinzel small capitals** — a display face whose
lowercase is drawn as small caps — at 1.05rem in gold on navy:

```
THE LIBRARY OF CONGRESS EXHIBITION TEXT ON TAÍNO SOCIETY IS BEST
CLASSIFIED AS WHICH KIND OF RECORD?
```

Legible, and exactly what the stylesheet had always asked for. `0128` §4 recorded it as "a choice
nobody has ever actually seen the result of" and left it alone.

---

## 2. It was not a choice, it was a role violation

`.quest-prompt` **hard-coded** its face, bypassing the design tokens entirely:

```css
.quest-prompt {
  font-family: "Cinzel", serif;
  font-size: 1.05rem;
}
```

The design system named three roles at the time, and Cinzel is not the display one:

| token              | face       | what it is for           |
| ------------------ | ---------- | ------------------------ |
| `--c-font-display` | Spectral   | headings                 |
| `--c-font-label`   | **Cinzel** | eyebrows, pills, buttons |
| `--c-font-ui`      | DM Sans    | body and controls        |

And the file's own usage says the same thing louder than the token name does. Cinzel appears **87
times**; of its 48 uses that carry a size, **44 are under 0.9rem**, clustered at 0.54–0.72rem —
eyebrow, pill and button sizes. Only four are 1rem or more.

So the **label** face was set on the one element in the game a student has to read closely. And it
is not a corner of the game: `.quest-prompt` is written by **all five quest renderers** — `mcq`,
`sequencing`, `dbq`, `evidence-organizing` and `source-analysis` — plus the sealed archive-challenge
record in `main.js`. Every practice item, every mission question and every Archive Challenge stem is
this one element.

A label face is drawn for a word or three, seen and not read. That is the opposite specialism from
the job it had been given.

---

## 3. The face

The owner's call, asked as an owner's call: **Garamond**. **EB Garamond** is the Google Fonts
revival — an old-style serif drawn for continuous reading, and the right period for a history game
by a century or so. It arrives as a **variable font at `wght@400..600`**, one file across seven
subsets, so the whole range costs what a single static weight would.

`--c-font-prompt`, named to match `.quest-prompt` rather than `--c-font-question`, because **`quest`
is load-bearing vocabulary in this repository** and a token one letter from it is a trap.

---

## 4. The size, measured rather than guessed

Garamond's x-height is small — the well-known consequence being that it reads a size down from a
modern face at the same nominal size. So the size was measured, in the browser, with all four
families loaded, on a real stem in a 745px column:

| set in                          | width of the stem | lines |
| ------------------------------- | ----------------- | ----- |
| Cinzel 1.05rem (what was there) | **703px**         | 1     |
| EB Garamond 1.05rem             | **666px**         | 1     |
| EB Garamond **1.15rem**         | **730px**         | 1     |
| EB Garamond 1.2rem              | 762px             | 2     |

A straight swap at 1.05rem is **5% narrower** than the face it replaces, which is the small x-height
showing. **1.15rem** restores the apparent size, still sets on one line, and 1.2 does not. That is
`--c-text-prompt`, and the comment on it says to change the two together.

Weight is **stated, not inherited**: the element is a `<p>`, which would take 400, and gold on navy
is where an old-style serif's thin strokes need the extra half-step. 500, inside the variable range.

---

## 5. There are four families on that line now, and the blast radius grew with it

This is the part of the phase that is a rule rather than a change. `0128`'s whole finding was that
**one malformed family takes down every family in the request** — and this phase added a fourth to
the same request.

So, before committing: verified `200 text/css` with all four families in the response, against the
URL **as it sits on disk** rather than as intended. A 200 is the only proof available, because the
failure mode is invisible in the browser and a passing visual suite will photograph whatever it gets.

One thing measured and found **not** to be true, recorded so nobody else wonders: **family order
does not matter.** Alphabetical and append-last both answer 200. The API is strict about tuples, not
ordering. Alphabetical is kept as a convention only.

---

## 6. What moved

**Nine baselines, across four tests, every one a quest-stem screen** — the two practice-check states,
four mission ledgers, the investigation challenge and `source-reader-questions`. The other **17
visual tests passed untouched**, which is the useful half of that number: a change to the element
every question in the game shares did not reach anything else.

Reviewed by opening the actual renders, not by accepting the diff. The stems now set in sentence
case, and both of the practice check's first two questions came **down from two lines to one**, so
the screen is shorter as well as plainer.

Every geometry guard passed.

---

## 7. What was not done

- **No other Cinzel use was touched.** The other 86 are labels doing label work, which is what the
  face is for. This phase moved one element, the one whose job was reading.
- **The other `0128` flag is deliberately left as it is.** "Initiate Chronotravel" still wraps to two
  lines in its gold button — the owner's call, asked and answered. It is legible, not clipped and not
  below the fold.
- **No type scale was re-tuned**, for the reason `0128` §5 gives: every `font-size` in the file was
  chosen against faces that never loaded, so all of them are strictly unverified, and re-tuning them
  is a design pass rather than a bug fix.
- **Nothing was self-hosted and no `preconnect` was added** — unchanged from `0128` §5, and now four
  families' worth of the same open question.
- **Still no font-loaded guard.** `0128` §6 recorded it as the obvious next one and it stays
  recorded. The honest version measures a string's width in the family against the same string in its
  fallback; `document.fonts.check()` returns `true` for a family that does not exist.
