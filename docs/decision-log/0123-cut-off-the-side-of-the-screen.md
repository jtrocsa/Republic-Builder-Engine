# 0123 — Cut off the side of the screen

**Phase 124.** One defect, found by screenshotting the field at the size most students' laptops
actually are. The owner's original complaint about this game was _"objects that aren't in the right
place or cut off"_; this is the second half of that sentence, taken literally.

---

## 1. What a person watching sees

Open any mission at 1280×720 and the Evidence Channel — the panel on the right holding **Open Codex**
and **Practice Check →** — runs off the edge of the screen. The last few characters of every line of
it are gone, and so is the right-hand end of both buttons, including the evidence count beside the
first one.

There is no scrollbar and no ellipsis. Nothing on the screen says there is more. It looks like a
panel somebody designed to sit flush against the edge.

---

## 2. Why, exactly

`.case-field--living` is a three-column grid — prose, map, Evidence Channel — and the declaration that
wins sets its own floors:

```css
grid-template-columns: minmax(240px, 0.38fr) minmax(760px, 1.42fr) minmax(220px, 0.34fr);
gap: 24px;
```

240 + 760 + 220 + 48 = **1268px that cannot compress**. `main.case-field` gets the viewport less a
15px scrollbar and 28px of padding each side, which at 1280 is **1209px**. The grid is 59px wider
than the box it is in.

The grid also carries `overflow: hidden`, added in Phase 121 so that a map wider than its column
could not push the whole page sideways. That is the right rule, and it is what turned this from a
horizontal scrollbar into a silent cut.

Measured, at 1280 wide, before:

| thing             | measurement                                    |
| ----------------- | ---------------------------------------------- |
| `main.case-field` | 1209px of room, `scrollWidth` **1268**         |
| `.field-channel`  | left 1076, right **1296** — 59px past the edge |
| the Codex button  | right 1272 against a shell ending at 1237      |
| the map frame     | 760px                                          |

**The threshold is 1339px of viewport** — below it the grid's own floors exceed the shell. That takes
in 1280×720 and 1280×800, and it misses 1366×768, which is why every existing check was green.

---

## 3. The fix, and why it is scoped under 1339

One media query, lowering the floors that do not fit:

```css
@media (max-width: 1338px) {
  .case-field--living {
    grid-template-columns: minmax(200px, 0.38fr) minmax(700px, 1.42fr) minmax(220px, 0.34fr);
    gap: 20px;
  }
}
```

**The scope is measured, not rounded.** At 1366 those floors are all binding — the fr weights alone
would give the prose column 221px and the channel 198px, and both are clamped up — so lowering them
there would redistribute the grid and move eight visual baselines for a defect that is not present.
Under 1339 nothing is binding that was not already broken.

Where the 59px comes from is Phase 121's order, applied one column further along: **prose scrolls,
the map does not, and the Evidence Channel is neither** — it is the panel holding the two buttons
that leave this screen. 40px comes off the prose column and 11 off the map. The map's floor stays
above the ~706px its own `min-height: 480px` and 1.47:1 aspect ratio already imply, so this is not
fighting that rule either.

After, at 1280: shell `scrollWidth` 1209 = its 1209 of room; the channel sits 1017–1237, inside it;
the Codex button ends at 1213; the map frame is 749px. **At 1366, 1440 and 1920 every number is
byte-for-byte what it was.**

---

## 4. The guard

`tests/e2e/horizontal-clipping.spec.js` — nine student-facing screens at both sizes, eighteen tests.

It has its own file rather than joining `fold-and-controls.spec.js`, because the failure mode is
different in the way that matters: **a page that is too tall gets a scrollbar and tells you there is
more; a box that is too wide inside an `overflow: hidden` ancestor tells you nothing at all.** The
vertical guard asks whether a control is below the fold, which is a question about position. This one
asks whether anything is being cut, which is a question about a box against its clipper.

For every element in `main`, it finds the nearest ancestor that clips and measures the overhang. Two
exclusions, both named rather than filtered by shape:

- **A camera window is meant to clip.** `.field-viewport`, `.institute-map` and the Archive Room's map
  are how a world bigger than the frame is shown at all, and the canvas inside one is always wider.
- **An SVG's inside is not layout.** A `<path>`'s client rect is its geometry within a viewBox, so an
  icon's strokes read as overflowing a box they are drawn correctly inside.

It also asserts the page does not answer a too-wide layout with a sideways scrollbar, which is the
other way this can go and is no better on a screen a student plays on. And it counts the elements in
`main` first: a seed that landed on the wrong screen would satisfy "nothing is cut" by having nothing.

**Watched go red with only the fix disabled**, naming the panel and its parts:

```
field-channel loses 59px to .shell
kicker loses 35px to .shell
h2 loses 35px to .shell
role loses 35px to .shell
p loses 35px to .shell
btn loses 35px to .shell
channel-progress loses 35px to .shell
```

on all three sampled maps at 1280, and green at 1366 in the same run.

---

## 5. What this says about the phase before it

Phase 121 measured the fold at 1280×720 and 1366×768 and fixed what it found there. It did not find
this, and the reason is worth writing down: **it was looking down the page.** `fold-and-controls.spec.js`
asks where a control's top edge is relative to the viewport's bottom; nothing in it, or in any other
spec, asked what a box's right edge is doing relative to the box clipping it.

The visual baselines could not help either. They are taken at **1366×768** — the one common size at
which this defect does not exist.

That is the same shape as `0119`'s finding one document further down: **a guard is keyed to the axis
it was written for, not to the question it asks.** Phase 120 fixed the surface-class version of this
and Phase 121 wrote the vertical version of the layout rule; this is the horizontal one.

---

## 6. What was not done

- **The other seven maps are not in the guard's table.** Three are — the Caribbean, Ellis Island and
  Fairmeadow — because the clipping is a property of the shell's grid and not of the map, and every
  map put the same 59px off the screen when it was measured. Adding five more rows would add three
  minutes to the suite to re-ask a question already answered per screen rather than per map.
- **No breakpoint was added between 1220 and 1400 for anything else.** `ARCHITECTURE-QUICKREF.md` §6
  records that gap as a standing candidate; this fills exactly the part of it that a measurement
  condemned and no more.
- **`.field-tracker` is still argued at 232px and overridden to 200px below 1400px**, both from the
  same Phase 57 commit — recorded in `0120` §8 and still not chased. It is a comment that defends a
  width no student's screen has ever applied, which is the same _kind_ of thing as this phase's
  defect but is not itself a defect: nothing is cut.
