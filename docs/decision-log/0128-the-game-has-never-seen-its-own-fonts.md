# 0128 — The game has never seen its own fonts

**Phase 129 · 2026-09-07 · Accepted**

The first line of `global.css` asks Google Fonts for Cinzel, DM Sans and Spectral. It has asked
wrongly since **2026-07-07, the second commit of this repository**, and Google has answered **400 Bad
Request** every single time. Every screen this game has ever drawn — every heading, every question,
every name pill, all sixty-one committed visual baselines — has been drawn in `serif`, `system-ui`
and `sans-serif`.

Nobody saw it because the failure is silent in three separate ways.

---

## 1. Found by asking the browser what it was complaining about

Not by looking. A sweep opened twenty-six student screens and recorded everything the page reported
— uncaught exceptions, console errors and warnings, failed requests, any response at 400 or worse.
Twenty-six screens, one complaint each, the same one:

```
net::ERR_BLOCKED_BY_ORB   https://fonts.googleapis.com/css2?family=Cinzel:...&family=DM+Sans:...
```

**Zero exceptions, zero console errors, zero other failed requests** across the whole student
experience. This was the only thing the browser had to say, and it said it on every screen.

---

## 2. Why, exactly

The URL:

```
family=DM+Sans:opsz,wght@9..40,400;500;600;700
```

The `css2` API's rule is that **every tuple after the `@` carries a value for every axis named
before it.** This names two axes, `opsz` and `wght`, and then supplies one pair — `9..40,400` — and
three loose numbers. Google rejects it. Verified family by family:

| requested                                    | answer  |
| -------------------------------------------- | ------- |
| `Cinzel:wght@600;700;800`                    | **200** |
| `Spectral:ital,wght@0,400;0,600;0,700;1,600` | **200** |
| `DM+Sans:opsz,wght@9..40,400;500;600;700`    | **400** |
| `DM+Sans:opsz,wght@9..40,400;9..40,500;…`    | **200** |

**One malformed family kills all three**, because they are asked for in a single request — so the
two correct families died for the third's mistake.

And then three layers of silence:

- **The 400 is `text/html`, not CSS.** Chromium will not hand a cross-origin opaque response of the
  wrong type to a stylesheet request, so the browser reports `ERR_BLOCKED_BY_ORB` rather than "400",
  and the real status never appears anywhere.
- **`@font-face` failure is a designed no-op.** A font that does not arrive is not an error; it is a
  fallback. `document.fonts.size` was **0** and every element rendered, correctly, in the next font
  in its stack.
- **The baselines were photographs of it.** All sixty-one were recorded in the fallback faces and
  matched perfectly, run after run, for 312 commits. A visual-regression suite cannot see a defect
  that was already there when it opened its eyes — the same lesson `0124` §7 records for
  `source-reader-questions`, which had been defending a scroll bug since 2026-08-02.

**`document.fonts.check()` is not the test**, and it is worth writing that down: it returns `true`
for a family that does not exist, because "can this be rendered without loading anything" is true of
a fallback. The measurement that works is rendering the same string twice and comparing widths —
Cinzel 887px against serif 598px on "Chronicle Institute" at 80px.

---

## 3. The fix, and the two lines it took

The `@import` now pairs every tuple. That is the bug fixed, and on its own it changes every text
metric in the game.

The design survived that better than it had any right to. **Every geometry guard in the repository
passes unchanged** — `fold-and-controls` at both sizes on every screen and all eight units,
`horizontal-clipping` at both sizes across nine screens, `empty-panels`, `arrival-scroll`,
`cast-nameplates`, `cast-legibility`, and `intro-sequence`'s fixed-height Director box, which is
sized against the longest authored line with `overflow: hidden` and would have truncated in silence
if the metrics had gone the other way. Ninety-three assertions, one run, no failures.

One screen did not survive, and it is the one with the least room in the game: **the Navigation
Table grew a 41px scrollbar at 1280×720**, which its own guard forbids in as many words. Two things
in its left column are decided by that column's width, and both fell over between 230px and 275px:

| in a 230px column                    | wants     | cost                |
| ------------------------------------ | --------- | ------------------- |
| "Select a marker to read its route." | **241px** | +27px, two lines    |
| three period pills and their gaps    | **271px** | +12px, a fourth row |

The column's floor is **275** now, paid for out of the map, which gives up 25px and keeps 679
against its 590 floor. **Not paid for out of the pill**: tightening `.unit-tab`'s side padding from
14px to 10px buys the same three rows, and `.unit-tab.is-archived`'s own comment explains why that
is the wrong lever — the archived tick is absolutely positioned _inside_ that padding so that it
costs no width, and at 10px it lands 5px from the label. Phase 116 fought this exact repack with a
glyph; this is the same fight with a font.

Note that this is the **third** declaration of `.archive-layout` in the file and the one that wins.
Restyled in place, per the `.hub-marker` rule.

---

## 4. What a person will actually see

Everything, is the short answer. All sixty-one baselines moved — reviewed by opening the diffs, and
every difference is either a glyph or a reflow that follows from one.

Named, because they are the ones worth looking at:

- **Headings are Cinzel now**, which is a display face whose lowercase is drawn as small capitals.
  "Chronicle Navigation Table" and "Practice Check" read as they were designed to for the first time.
- **The period strip packs three to a row** at both sizes, where the fallback packed two at 1280.
- **Body copy is DM Sans and prose is Spectral**, so the field's briefing, the guiding questions and
  the case summaries are set in the two faces chosen for them.
- **"Initiate Chronotravel" wraps to two lines** in its gold button at 1280 and 1366. It is the
  screen's primary control, it is not clipped and it is not below the fold, and rebalancing button
  typography is a design pass rather than a bug fix. Recorded, not chased.
- **A practice question's prompt is set in Cinzel**, so a long AP stem — "Columbus's 1493 letter to
  Rafael Sánchez most directly reflects the influence of which factor?" — now renders in small caps
  across two lines. It is legible and it is what the stylesheet asks for, but a display face on a
  question a student has to read closely is a choice nobody has ever actually seen the result of.
  **This one is the owner's call and is flagged rather than changed.**

---

## 5. What was not done

- **No type scale was re-tuned.** Every `font-size`, `clamp()` and `line-height` in the file was
  chosen against a face that never loaded, so all of them are, strictly, unverified. Re-tuning them
  is a design pass and this is a bug fix; the guards say the current numbers hold.
- **Nothing was self-hosted.** Serving the three families from `assets/` would remove the network
  dependency entirely and is a real option, but it is a build-pipeline change, and the defect was a
  typo in a query string rather than a case against the CDN.
- **No `<link rel="preconnect">` was added.** The fonts now arrive; how fast they arrive is a
  separate question with its own measurement, and `display=swap` already means nothing waits on them.
- **The other twenty-five screens' complaint list is empty and stays empty.** The sweep found no
  exception, no console error and no other failed request anywhere in the student experience, which
  is worth recording as the null result it is.

---

## 6. Measured and not chased

- **The sweep itself is not committed.** It opens twenty-six screens and prints what the browser
  says; as a guard it would need an allowlist, and the only entry in that allowlist today would be
  the thing this phase just fixed. What is worth keeping is the technique, which is written down
  here: **ask the browser, on every screen, and read what it says.**
- **`document.fonts.size` was 0 on every screen for 312 commits** and nothing looked. A one-line
  assertion that the three declared families actually loaded would have caught this on day one. It
  is not added here because the honest version of it — measure a string in the family and again in
  its fallback — belongs with the other typographic checks this repo does not yet have, and adding
  one guard for one font is how a suite grows lopsided. Recorded as the obvious next guard.
