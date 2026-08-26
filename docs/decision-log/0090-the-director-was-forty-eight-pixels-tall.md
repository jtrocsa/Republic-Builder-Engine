# 0090 — The Director was forty-eight pixels tall

**Phase 91 · 2026-08-25 · The opening screens, restyled from the owner's mockups**

Supersedes the two Phase 90B decisions named in §3: the 26px Codex thumbnail and the growing
dialogue box. Everything else in Phase 90B's director-scene pass stands, including its standing
instruction against a seventh backdrop layer, which §4 keeps.

---

## 1. What the mockups actually asked for

Two files: a director-scene mockup and a Chronicle-menu mockup, both for the screens between the
title sequence and the Entrance Hall. The owner named three changes — the Director is "less
pixelated", the text box "stays 3 lines deep always so it doesn't move often", and the reveal icons
and upper-left titles have been reworked.

Almost nothing here is new structure. `.director-scene`, its four corner brackets, the reveal rail,
`.landing-option-group`, and the `institute-archive.webp` plate all already existed and already sat
where the mockups put them. This phase is a restyle plus one new asset and one genuinely new
interaction.

Two things in the mockups are bugs and were not ported: the logic hardcodes
`title: "Chronicle Institute"` while its own `STEPS` array carries per-step titles (the game already
renders per-step titles, and `intro-sequence.spec.js` pins the two briefing eyebrows); and it defines
a five-item `CARDS` array that nothing triggers and nothing renders, which would have silently
dropped the Testimony/Artifacts/Images/Laws/Journals strip. The chips were kept and restyled to
match the new badge card instead.

**Fonts were mapped, not added.** The menu mockup asks for Playfair Display 900 and Libre Franklin,
neither loaded. `titleScreen()`'s `.title-wordmark` renders the word "Chronicle" in Spectral 700 gold
one Enter-press before the landing appears, so Playfair there would change the same wordmark's
typeface mid-transition. Playfair → `--c-font-display`, Libre Franklin → `--c-font-ui`. No new font
families, one type system.

## 2. The Director is still pixel art. He is twenty-eight times bigger

The scene drew `CHARACTER_SHEETS.director.portrait` — the **48×56 walk-sheet portrait**, blown up
about twelve-fold to fill a full-height stage. "Less pixelated" turned out to mean a 1145×1374
cutout, not a change of medium: it is high-resolution pixel art with an anti-aliased outline.

Three consequences, each measured rather than assumed:

- **It goes in `assets/plates/`, not `assets/institute/`.** That folder is the walk-sheet tier: a
  50 KB per-file budget in `scripts/assets/audit.js` and a 7-column 48×56 canvas that
  `character-sheet-geometry.test.js` asserts. `plates/` has no budget entry, so it gets the 500 KB
  default. It is deliberately **not** in `CHRONOTRAVEL_PLATES` — that table is keyed by destination
  and its test asserts every key is a shipped unit. It shares the folder and the build script's WebP
  pass, nothing else.
- **The source is trimmed first.** The opaque figure occupies 484×1359 of the 1145×1374 canvas, with
  328px of dead space on the left and 337px on the right. Trimming removes 62% of the pixels and the
  9px asymmetry that would otherwise put a lean into every `translateX`.
- **q78 is the wrong quality for it.** `build-chronotravel-plates.js` says its default is tuned for
  "painterly skies behind a navy veil, **not line art**", and this asset is line art with a hard
  black outline. A per-slug override at q90 lands it at 135 KB, inside the range the ten full-frame
  plates already occupy.

And `image-rendering: pixelated` came **off** — not because the art stopped being pixel art, but
because 1359 → 590px is a 0.43× _non-integer_ downscale, where nearest-neighbour drops rows unevenly
and shreds the outline.

## 3. Two Phase 90B decisions reversed

**The dialogue box no longer grows.** It was `min-height: 1.7em; max-height: 6em; overflow-y: auto`,
so it resized on almost every character, moving the caret, the buttons, and the reveal card above it.
It is now a fixed three lines.

The size is **1.5rem, not the mockup's 27px**, and that is the one number here chosen against the
content rather than against the mockup. The longest authored body is 215 characters — the Original
Drift line. At 27px in this box's 1068px column, three lines hold about 237 characters: 9% of
headroom, behind `overflow: hidden`, on the sentence the briefing exists to deliver. At 1.5rem it is
about 264, and still a 30% jump from the 1.15rem it replaces.

**The Codex reveal takes the whole screen.** It was a 26px thumbnail in the rail beside a caption. It
is the last beat of the briefing and the one object the player carries through every unit, so it now
opens a veil, reusing `artifact-container-rise` and `artifact-light-gather` rather than authoring new
curves — which is what `revealCardMarkup()`'s own comment says those were named generically for.

It is also **retimed**. The image reveal used to be inserted before the first character of the line
that explains it. It is now held in `introPendingCodex` and opens after the line lands, from both
places a line can finish — the typewriter running out, and a player skipping mid-word, which never
passes through `finishLine()`. Replaying a seen step puts the small card back in the rail and does
**not** re-veil: "Previous message" then forward re-enters that step, and a full-screen stop on every
revisit is hostile.

## 4. What the restyle was not allowed to do

- **No seventh backdrop layer.** The mockup draws its bottom scrim as a separate 300px element. It is
  folded into `.director-scene__scrim` as a third gradient on the same element instead — that layer's
  stated job is already "legibility, and only legibility".
- **`.director-dialogue-box__text` is shared.** `hubSceneDialogueMarkup()` renders the same class
  inside `.hallway-dialogue`, so the Entrance Hall, the Main Hall tour and every Voss scene speak
  through it. The base rule is untouched and the fixed-height treatment is scoped to
  `.director-scene`. The three institute-room baselines are the check.
- **Nothing on the landing escaped `.landing-shell`.** `.completion-shell` is shared with
  `completionScreen()` and, through `.auth-shell`, every join/sign-in/teacher form. The
  `identity-screen` baseline is the canary — it is `.completion-shell` with no `.landing-shell`, and
  it came back byte-identical.

## 5. Four measurement traps, all of which read correctly and behaved wrongly

Worth writing down, because in each case the CSS said one thing and the browser did another.

1. **`max-height: 6em` on the shared rule silently clipped the new box.** At 1.05rem the cap is
   100.8px, so a six-line phone box measured 100.797px and lost two lines of the longest body — while
   `--dlg-lines`, `--dlg-size` and `--dlg-line` all read back correctly. It also explains why the
   1200px case sat at exactly 144px: that was the cap, not the height. The scoped rule now sets
   `max-height: none`.
2. **Two media queries setting one custom property that a `calc()` reads.** With
   `max-width: 1310px` and `max-width: 700px` both matching at 390px, Chromium used the wider rule's
   value inside the height calc while `getComputedStyle` reported the narrower rule's. The ranges are
   closed now — one breakpoint, one owner.
3. **An animation's fill beat the centring transform.** `.director-codex-veil__glow` was centred with
   `transform: translate(-50%, -50%)`, and `artifact-light-gather` animates `transform` with a `both`
   fill, so the translate was discarded and the glow landed a quarter-turn down and right. Centred
   with box offsets instead. This is the same trap already written up on `.title-wordmark.lit`.
4. **`.landing-ambient span` outranked the reduced-motion rule.** `display: block` at (0,1,1) beat
   `display: none` at (0,1,0), so the sweep band and the mote field survived
   `prefers-reduced-motion`, frozen across the card. Scoped through the parent.

## 6. The panel that was pinned to a number

`.director-extra-content` was absolutely positioned at `top: 126px` with
`max-height: calc(100% - 342px)`, and both numbers carried comments asking a future editor to keep
them in step with the head block and the bar by hand. This phase grew the h1 by ~40% and the bar by
~80%, and the panel promptly landed inside the title and hung past the buttons — because nothing
enforced either coupling.

It is in normal flow now. `.director-scene` is already a flex column of `[head, panel]` with the bar
absolutely positioned and its space held by the scene's own bottom padding, so `flex: 1` with
`min-height: 0` gives the panel exactly the gap between the two, whatever either does next. There is
no magic number left to keep in step.

That required `.director-scene` to take a **definite** height rather than a `min-height`: against a
minimum there is no size to divide, so the panel sized to its content and pushed the buttons below
the fold — the same failure mode Phase 90B fixed for the sprite, one element over.

## 7. Verification

`identity-screen` byte-identical; two baselines re-recorded (`director-welcome-scene`,
`director-protocol-scene`) and one added (`director-codex-reveal`). The truncation guard is new and
lives in `intro-sequence.spec.js`: on every fully-typed line, `scrollHeight <= clientHeight + 1`. It
is the only thing standing between `overflow: hidden` and a silently half-delivered sentence, and it
is what caught trap 1 above.

`dismissCodexVeil()` in `helpers/progress-seed.js` is shared by the three specs that walk the intro
by clicking the dialogue box. Without it the veil intercepts the click and Playwright retries to the
30-second timeout — a hang, not a clean failure.

## 8. The five flaky specs, and why they are not this

The clean full run finished 260 passed / 0 failed with five flaky, and `CLAUDE.md` says a cluster
like that in an untouched area is usually one cause rather than five accidents — so it was checked
rather than waved through. Four are the longest walks in the suite (`character-directions`'
eighteen-tile Powhatan crossing, `field-liaison`, `hub-movement`, `richmond-interiors`) and the fifth
is a field canvas screenshot; none touches the intro screens or the landing.

There was a real hypothesis to rule out: `loadSeededSave()` routes every seeded spec through the
landing, which now paints three blurred blobs, a conic sweep and two dot fields. Measured over three
runs each, with the ambient and with it forced off: **1927ms against 1923ms**, which is noise. And
`walkToNpc`'s budget starts _after_ `loadSeededSave()` resolves and the player is visible, so a
slower landing could not spend it in any case. Re-running the four in isolation on an idle machine
gave 27 passed / 1 flaky — the Powhatan walk, whose own comment records that its budget was tuned to
the length of that walk.
