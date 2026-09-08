# 0126 — The loop measured one unit eight times

**Phase 127.** Two findings, one file. The small one is the screen where a new player names their
Chronicler, whose Confirm button did not fit. The large one is the guard that was supposed to be
watching it — and the three guards beside it, which had been measuring Case 1.01 eight times over
since Phase 121 and passing every run.

---

## 1. What a person watching sees

Open the game at 1280×720. Second screen: **Create your Chronicle identity.** Pick an appearance,
type a name — and **Confirm identity →**, the button that starts the game, is cut off at the bottom
of the window with 14 of its 45 pixels showing. So is **Return to protocol** beside it.

It was worse before Phase 126: 69px under, entirely below the fold, because an empty green feedback
bar sat between the help text and the buttons. Removing that bar bought 38px and left 31, which
`0125` §4 recorded and deliberately did not chase.

---

## 2. Why, exactly

The screen says the same thing twice about the same control:

| where               | text                                                            |
| ------------------- | --------------------------------------------------------------- |
| above the portraits | "Choose your appearance"                                        |
| below the portraits | "Choose the field sprite that feels most like your Chronicler." |

One instruction, bracketing the thing it instructs. The second one costs a paragraph — 27px of line
plus the margin it does not share — and the screen is 31px too tall.

**The fix is the copy, not the layout**, and that is the owner's own rule: _every clarity gain is
paid for by removing text elsewhere; net visible words on a playing screen go down._ The two lines
became one, above the control, saying both things:

> Choose the Chronicler you will walk the field as.

Fifty-one words on the screen where there were fifty-five. Measured after, from the top of the
document:

| viewport | before         | after                 |
| -------- | -------------- | --------------------- |
| 1280×720 | 31px below     | **14px of clearance** |
| 1366×768 | on screen      | 54px of clearance     |
| 1280×800 | 69px of scroll | 94px of clearance     |

The layout alternative was rejected: the padding on this screen belongs to `completion-shell`, which
the four intro screens also use, so taking space there would move four screens to fix one. The
duplicated sentence belongs to this screen alone.

**14px is thin and is recorded as thin.** Nothing on this screen grows on its own — its copy is
fixed, not authored per unit — but a line added to it lands under the fold immediately, which is
what the guard in §4 is for.

---

## 3. The larger finding: a second seed on the same page does nothing

Writing the guard turned one up. `tests/e2e/helpers/progress-seed.js`:

```js
export async function seedProgress(page, overrides = {}) {
  await page.addInitScript(
    ({ key, data }) => {
      if (window.localStorage.getItem(key) === null) {
        window.localStorage.setItem(key, JSON.stringify(data));
      }
    },
    { key: PROGRESS_KEY, data: overrides }
  );
}
```

The `=== null` guard is deliberate and load-bearing — it is what lets `reloadIntoSave()` exist
without a mid-test reload clobbering the game's own writes back to the original seed, and
`save-persistence.spec.js` depends on it.

Its consequence had never been written down. **Booting the game once saves**, so the key is no
longer null; init scripts accumulate and all of them run on every navigation; so the _second_
`seedProgress` on the same page declines to write, and the third, and the eighth. `loadSeededSave()`
then re-opens the first save. Proved directly:

```
SEEDED case-001 -> h1="The Atlantic Crossroads" savedActiveCaseId=case-001
SEEDED case-019 -> h1="The Atlantic Crossroads" savedActiveCaseId=case-001
SEEDED case-013 -> h1="The Atlantic Crossroads" savedActiveCaseId=case-001
```

A survey of all fifty-nine e2e specs found the pattern — a `seedProgress` inside a loop inside a
single test body — in exactly one file, and it is `fold-and-controls.spec.js`: **all three of Phase
121's guards.** Every one of them loops over eight units on one page.

The worst of the three is the one whose entire claim is a comparison:

```js
expect(new Set(tops.values()).size, "the frame's top edge moves between units").toBe(1);
```

_The map frame's top edge takes the same value on all eight maps._ Measuring one map eight times
satisfies that trivially. It is the exact failure mode `0114` §6 names — **a guard that picks its
own example picks the flattering one** — except that here nobody picked it; the harness picked it,
silently, and the loop that looked like eight boots was eight boots of the same save.

**And the cure already existed, one file over.** `non-field-missions.spec.js` writes the key
directly with `page.evaluate` and then reloads, because that spec opens fourteen missions on a
handful of pages and somebody had to make it work. It was never generalised, so nothing else could
find it.

`openSeededSave()` is that, written once: `page.evaluate` on a page that has an origin,
`seedProgress()` on one that does not, then `loadSeededSave()` either way.

---

## 4. The guards

**`tests/e2e/fold-and-controls.spec.js` gains a third table** — every screen a student can open
whose controls must be reachable without scrolling: the identity screen, the four intro screens, the
Codex, the mini-games shelf, the Skill Mastery record and the Archive Challenges list, at both
1280×720 and 1366×768; plus unit completion and the transmission across all eight units at 720,
because their copy is authored per unit and that is the thing Phase 117 named.

**The rule is Phase 121's, unchanged: prose scrolls, controls do not.** It is not "the page fits."
The Codex is 838px tall at 1280×720 and passes, because a record is prose and its one control is at
the top.

Excluded, each measured rather than assumed:

- **the Practice Check** (4,159px), **the Archive Review** (2,824–3,275px) and **every activity
  board** — a long quiz, a long essay and a long board scroll on purpose;
- **the Mission Debrief** and **the record reader**, which are things to read;
- **`travel` and `return-warp`**, for the opposite reason: the warp screen is full-bleed and its
  controls are positioned against the bottom of the viewport, so a row for them would be a test that
  cannot fail;
- **the Archive Rotation** — see §5.

**Anti-vacuity, and this file has just earned the paranoia.** Every row asserts there is no
`main .empty-state` (this app's own recovery markup, and exactly what a seed that misses lands on)
and that the screen rendered at least one control, because "no control is below the fold" is
satisfied perfectly by a screen with no controls.

### Watched fail, both ways

**The identity screen.** Put the duplicated sentence back:

```
the identity screen: "Return to protocol" is 31px below the fold;
                     "Confirm identity →" is 31px below the fold
```

Red at 1280×720, green at 1366×768 — the size-specific failure, which is the honest picture of the
defect rather than a tidier one.

**The seeding.** This is the one that matters, and it is a two-sided proof. Phase 121's own defect
was reintroduced — `align-items: center` on `.case-field--living`, the winning declaration — and the
map-frame guard run twice against it, changing nothing but how the loop seeds:

| loop seeds with             | result                                                          |
| --------------------------- | --------------------------------------------------------------- |
| `seedProgress` (as it was)  | **2 passed** in 19.2s                                           |
| `openSeededSave` (as it is) | **2 failed** — Unit 3 at 781 > 720, Unit 4 at 797 > 768, in 84s |

The same defect, the same file, the same assertions. The runtime is its own tell: eight real maps
take four times as long to boot as one map eight times.

**Phase 121's three guards all pass with the seeding fixed.** That is worth stating plainly — the
fix they defend is real, and was measured by hand at the time. What was not real was the defence.

---

## 5. Measured and not chased

**The Archive Rotation's forward button is below the fold at 1280×720, and no arrangement of that
screen fixes it.** Its card is one practice item of whatever height that item has. Case 1.01:

| item                   | "Next →"    |
| ---------------------- | ----------- |
| each of the three MCQs | 17px under  |
| the sequencing item    | 115px under |
| the HIPP               | 610px under |

And it moves **further** down when you answer, because the feedback line appears above it. The MCQ
case is the common one and 17px is within reach of this screen's own copy — but a fix that clears
three items and misses the other two is not the rule, so the rotation is excluded from the table in
§4 with these numbers written beside it.

**The Richmond counting room fails one run in four, and it is not this phase.** The full suite ran
380 passed / 1 failed with `--retries=0`, the failure being
`richmond-interiors.spec.js` — `walkTo(page, '[data-npc="richmond-bookkeeper"]')` returning `false`.
It reproduces on the **unmodified** tree at `68ef616` (1 of 3 repeats) and measures **2 of 8** on the
current one, so it is pre-existing and unrelated to anything here. The shape is the one `0118` §4
describes and `0120` mitigated twice: the probe samples on a half-tile lattice and the player does
not, so under load a body can come to rest a quarter tile off the row the plan cleared, inside
something solid, and re-planning from there returns the same route. The stall recovery and the 150ms
burst floor both exist for it and this target still beats them a quarter of the time. **Routed, not
absorbed** — it wants its own phase, with the failure reproduced under load rather than by luck.

**"MILESTONE 2 · CHRONICLE IDENTITY"** is still the kicker on the second screen of the game. Nobody
playing it knows what milestone 2 is. Copy, not layout, and not this phase's.

**The identity screen still scrolls 89px to show nothing** — the page is 809px at 1280×720 and
everything below the buttons is `main.shell`'s and the section's own bottom padding. A scrollbar
that reveals padding is untidy rather than wrong, and the padding is shared with four other screens.

---

## 6. Four null results, recorded so nobody re-derives them

Each of these was a hunt that found nothing, which is worth as much as a finding when the alternative
is somebody spending a session on it again.

- **Nothing on any screen is silently truncated.** A sweep of 29 screen states at both sizes for any
  element whose content overflows its own box while its `overflow` is `hidden` or `clip` — the
  vertical twin of Phase 123's horizontal clipping, and the failure mode `INVARIANTS.md` records for
  `.director-dialogue-box__text`. The only hits are the camera windows (`.field-viewport`,
  `#caribbeanWorld`), where a world bigger than its frame is the entire point, and 4px on
  `.director-scene__backdrop`.
- **The Chronotravel warp is clean, filmed frame by frame.** Tunnel from 0 to 2.07s, plate settling
  2.07 to 4.65, ready thereafter; the sync ring counts 1 → 5 → 14 → 28 → 45 → 62 → 79 → 91 → 97 → 100
  with its `stroke-dashoffset` tracking it 440 → 0, then swaps to "Synced"; the screen never leaves
  on its own. The registered `@property --warp-pct` reads back as `0` on the `main` element and
  animates on `.warp-ring__pct` — which is correct, and is worth knowing before somebody reads it on
  the wrong node and reports a bug.
- **Every mark the game tells the player to look for is drawn.** The field legend says _"Look for a
  ✦"_, and the overlay canvas (z90) draws above the record signals (z9), the door markers (z9) and
  the recall beacon (z10) — so the Phase 114 defect, a watchman inside a maple, is available to them
  too. Thirty-three marks across eighteen field surfaces, sampled the way `cast-legibility.spec.js`
  samples a pill: **every one reads 0.0% overlay ink.**
- **The case-close chain walks.** Reconstruction → upload → return warp → the Archive, end to end,
  with the transmission screen's own animation running and its button on screen. It had never been
  walked in one go.

---

## 7. What was not done

- **No other spec was changed.** `openSeededSave()` exists for every loop that needs it, and exactly
  one file needed it today. Converting call sites that do not loop would be churn.
- **The `=== null` guard in `seedProgress()` stays.** It is right; what was missing was a second
  function for the case it cannot serve, and a comment saying so where a reader will hit it.
- **Teacher surfaces**, as in every layout pass before this one.
