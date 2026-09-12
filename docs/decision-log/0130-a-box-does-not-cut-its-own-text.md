# 0130 — A box does not cut its own text

**Phase 131 · 2026-09-11 · Accepted**

Phase 129 made the game's faces arrive for the first time in 312 commits, which moved **every text
metric in it at once**. `0128` §3 recorded that every geometry guard passed unchanged, and that is
true — but every one of those guards asks where a **box** sits. None of them asks whether the text
inside a box still fits it.

So this went looking for the difference, found nothing, and banked the one question worth keeping
asking. Five null results, recorded here so nobody re-derives them.

---

## 1. Text cut off inside its own box — none

Twenty-six student screens at 1280×720 and 1366×768, looking for any element that clips its own
overflow (`overflow: hidden` or `clip`) and whose `scrollWidth`/`scrollHeight` exceeds what it shows.
This is `0123`'s failure one level in, and it is silent in the same three ways: no scrollbar, no
ellipsis, and a result that looks exactly like a panel somebody designed that way.

**Zero**, at both sizes. The only hits were `.visually-hidden` spans — the screen-reader pattern,
a 1×1 box whose entire job is to hold text nobody sees and which overflows itself by definition.

`intro-sequence.spec.js` guards exactly one fixed-height text box in the game — the Director's
dialogue, sized against its longest authored line — and `0128` §3 noted it "would have truncated in
silence if the metrics had gone the other way". Nothing else is in that position.

## 2. Text truncated with an ellipsis — none

`text-overflow: ellipsis` is a deliberate truncation that announces itself, so it is not the same
defect. It is still worth knowing whether any of them are actually firing. **Zero**, at both sizes.

---

## 3. A control whose label wraps — two, both already known

Phase 129 found "Initiate Chronotravel" wrapping **by eye** and flagged it; nothing had ever asked
the question systematically.

**The first detector was wrong in both directions at once, and the known defect is what exposed it.**
Counting lines as `(clientHeight − padding) / line-height` divided a single `↑` glyph in a 28px
button out to **2 lines**, and divided the one button known to wrap out to **1**. It reported 20
arrow buttons and missed the real one. A detector that misses the positive you already have is not
evidence about the ones you do not — so it was replaced with a `Range` over the control's contents,
counting the distinct line boxes the browser actually laid out. That finds "Initiate Chronotravel"
at 3 lines.

What survives triage is two controls, both in the same family and both accepted: **"Initiate
Chronotravel"**, which the owner was asked about in Phase 130 and chose to leave wrapped, and
**"Open The Caribbean—Island Society →"** on the mission debrief. The `brand` lockup and the assembly
board's fragments are inline elements at different vertical offsets, not wrapped lines.

---

## 4. The cast: names against each other, and against the frame

CLAUDE.md names this as uncovered in as many words — "pill against pill, pill against frame ... there
is still no test and there should not be a clever one: **look at the room**" — and notes the visual
baselines cannot help, because every one of them hides the cast first. Twenty walkable surfaces,
every stationed and wandering name pill measured.

**Pill against pill: zero overlaps.** Not one, on any surface.

**Pill against frame: three stationed pills hang over an edge** — the Riverbend minister by 7px, the
canal print shop's journeyman printer by 29px, the boarding house keeper by 32px, the last of which
visibly cutting the end off the word "Boardinghouse". Several wanderers do it transiently too.

**This is not a defect, and the argument that says so was already written down.** The `.field-npc`
label rule's own comment, from Phase 113:

> It bounds the overhang rather than removing it, and cannot do otherwise: a pill centred on a body
> standing at the frame edge overhangs by half its own width whatever that width is. **The camera
> brings it back as the player approaches; this is about what the room looks like on the way in.**

That claim rests on a camera that can move, so it was **tested rather than taken**: walk toward each
body and sample the overhang the whole way. Both rooms go to **0px off-frame** and stay there. The
boarding house is 22 tiles of world against a 787px frame, so the camera has somewhere to go. The
overhang is exactly the first-impression artefact the comment describes.

**And the reason the cast was untouched by the largest text-metric change in the project's history
is worth writing down**: a pill is `width: max-content` under a four-tile cap with `text-wrap:
balance`, so at the cap its box is **font-independent**. Measured both ways — with the fonts loaded
and with `fonts.googleapis.com` blocked, which reproduces the pre-129 state exactly — every one of
the three overhangs is **identical to the pixel**: 63px/7px, 128px/29px, 128px/32px in both worlds.

---

## 5. What was banked

One question, and it is folded into `horizontal-clipping.spec.js` rather than given a file of its
own: that spec already asks whether a box is too wide for the ancestor that clips it, already visits
these screens at both sizes, and this is the same cut one level in — so the check costs **no extra
page loads at all**.

Watched fail, which is what makes it worth having: with `.quest-prompt` forced to `height: 12px`, it
reports `quest-prompt cuts its own text by 16px tall / 43px / 71px` on the practice check at both
sizes, and passes again on revert. 18 tests, clean.

**The sweeps themselves are not committed.** The cast measurement's whole conclusion is that the
thing it measures is working as designed, so a guard would assert an artefact rather than a rule; and
the control-wrap detector's output is two labels somebody has already decided to keep. `0128` §6 made
this same call and it is the same call.

---

## 6. What was not done

- **Nothing was changed.** No `apps/web/src` file is touched by this phase; the only diff outside
  documentation is one measurement function and one assertion in an existing spec.
- **The three overhanging pills were left where they are.** Moving a stationed body is a world change
  with its own rules — clear of doors, objects and other bodies — and it would be made to fix
  something the camera already fixes.
- **No font-loaded guard**, still. `0128` §6 recorded it as the obvious next one and `0129` §7 left
  it recorded; that has not changed, and this phase deliberately did not smuggle it in under a
  different heading.
