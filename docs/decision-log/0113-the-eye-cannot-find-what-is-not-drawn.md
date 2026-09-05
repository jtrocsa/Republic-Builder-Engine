# 0113 — The eye cannot find what is not drawn

**Phase 114 · 2026-09-05 · Accepted**

The outdoor half of Phase 113's sweep, which that phase deliberately left as its one open S3. Eight
field maps rendered whole, at 1:1, with the cast visible — and then the same maps handed to the
overlay canvas, which found a man the by-eye sweep had missed, for the reason eyes cannot:
**he was not drawn.**

Three defects fixed, one candidate withdrawn on a closer look, and a guard that measures the one
thing about the cast a machine can actually answer. See
[`BETA-READINESS-LEDGER.md`](../playtest/BETA-READINESS-LEDGER.md).

---

## 1. Seeing a whole map at once

`visual-regression.spec.js` shoots at 1366×768, which is a band across the top of a 2688×1728 world
and frames whatever the spawn happens to put in it. To sweep a map you have to see the map.

The camera is a pure function of player position that clamps to the frame, so a frame as large as
the world has nothing left to clamp: pin `.field-viewport` to the origin at exactly 2688×1728, set
the world transform to the origin by hand, and the whole surface is one image with every body and
every name on it. Two false starts are worth recording because both looked like real defects:

- A 2900px browser viewport cut the image at column 30 and the missing part was **white**, which
  reads exactly like an unpainted map. It was the element screenshot running out of viewport. The
  canvas was fully painted the whole time — proved by sampling its alpha across all 56 columns
  before believing the picture.
- Widening the browser did not help, because the wider it got the further right the layout pushed
  the frame. And an injected `.field-viewport` rule lost to
  `.case-field--living .field-viewport { position: relative !important }`, which is more specific
  and equally important. Inline `setProperty(…, "important")` is the only thing that wins.

**A whole-map view at 1:1 is a survey, not a verdict.** Richmond's refugee looked, at that scale,
like a woman standing inside a flowering bush with her head swallowed. Cropped and doubled, she is
standing cleanly in front of it, fully legible. Every candidate here was re-cropped before it
counted, and that one was withdrawn.

## 2. The eye cannot find what is not drawn

Riverbend posts a watchman at (38.0, 7.5) — "a tile south of the row-6 road, watching the landward
approach", one of three posts a comment argues carefully, because a watch is posted and the whole
job is being at a particular place.

A maple's trunk cell is (36–38, 9), two rows south of him. Its art is drawn from tiles taller than
the 48px grid, and `tilesForFrame()` anchors an oversized tile by its **bottom** edge — so the
canopy reaches several rows _up_ from the cell that carries it. It covered **76% of his body and
98% of his name pill.**

The by-eye sweep read that map's cast off the image and listed two watchmen. The table has three.
There was nothing to find and so nothing was found: the other two are labelled and legible, and an
absence has no shape — you cannot notice a body missing from a map you are seeing for the first
time. **The by-eye method fails on exactly the defects that are total**, which is the opposite of
the failure mode you would guess.

`.field-world-overlay` is a canvas holding precisely the art that draws _above_ the cast. Sampling
its alpha under a pill's own box asks the question in the units the question is about — no tile
arithmetic, no guess at how far a tileset's art extends, no reading of the `.tmj` at all, which
would have been wrong here for the tall-tile reason above.

## 3. What the canvas found, and where the line goes

All eighteen field surfaces, every NPC, two boxes each — the pill's text box (the pill inset by its
own 4px/6px padding) and the 48×56 sprite box.

| Surface           | Who                     | Name %   | Sprite % | Verdict                                                |
| ----------------- | ----------------------- | -------- | -------- | ------------------------------------------------------ |
| Riverbend         | `settlement-watch-road` | **97.6** | **76.1** | fixed — inside a maple                                 |
| Fairmeadow        | `suburb-borough-woman`  | **24.2** | 1.2      | fixed — both label lines cut by a pine                 |
| Caribbean         | `taino-fisher`          | 0        | 0        | a palm behind the pill's rounded corner; text clear    |
| Canal Crossroads  | `revival-preacher`      | 0        | 31.5     | standing beside a maple; head, body and name all clear |
| Richmond          | `liaison`               | 2.2      | 0        | a lamppost finial under the pill's bottom edge         |
| Immigrant Port    | `port-waiting-relative` | 0.1      | 0        | two pixels                                             |
| all ten interiors | —                       | 0        | 0        | clean                                                  |

**The thresholds come out of that table rather than out of taste.** Name ink is capped at 8% — three
times the worst accepted reading and three times below the mildest defect. Sprite ink is capped at
55%, between the preacher's 31.5 and the watchman's 76.1; it is an "is this person drawn at all"
bar, not a tidiness one.

The whole-pill number would not have separated these: the canoe worker's palm covers 20.9% of his
pill and none of his text, against the resident's 21.7% straight through both lines. **Inset the box
to the glyphs the CSS padding already defines and the two stop being the same measurement.**

## 4. Every person was given clearance from that disc, and the player was not

Common Cause opened with the player's own head across somebody's name. `free-tradesman` wanders a
1.5-tile disc around (29.0, 20.0); the spawn is (28.0, 22.0), which is **0.74 tiles** from the disc's
edge. A name pill is 1.6 tiles wide and hangs about three quarters of a tile below the body, so
whenever he drifted to that edge his label was drawn across the Chronicler — on the one square the
game stands the player on before they have touched a key.

The map's own author had already reasoned about that disc. Emery Voss's comment on the same map says
she is posted "3 tiles clear of the free tradesman's disc". **Every _person_ on Common Cause was
given clearance from it. The player was given none — because the player is not in the NPC table**,
and a rule that lives in a table only protects what the table contains.

His home moved a tile and a half north, to (29.0, 18.5): out of the pill band, still in the market
square between the stalls, and still 4.3 tiles clear of Voss, so her comment stays true.

## 5. The guard, and what it deliberately does not assert

[`cast-legibility.spec.js`](../../tests/e2e/cast-legibility.spec.js) — all eighteen surfaces, the
two ink caps above, plus "no name pill may land on the player's arrival square". Each of the three
fixes was reverted in turn and the spec named it, with its numbers, on both the run and the retry.

**It asserts on stationed bodies only.** A route or wander NPC crosses overlay rows by definition —
that is what walking under a tree is — so sampling one at an arbitrary frame reports where it
happened to be, not where it was posted. Movers are measured and reported, never asserted. The one
thing a mover _is_ held to is the ground its job covers rather than the frame it was caught on: a
wanderer's whole disc against the spawn, which is what catches §4 and what no single sample could.

Knowing which is which needs the behaviour table, so `window.__chronicleCast()` joins
`window.__chronicleNav()` as a dev-only read surface, gated on `import.meta.env.DEV` the same way
and absent from the production bundle. It returns each job's id, label, kind, authored anchor and
radius. **It reads the game's state and does not restate its rules** — `0093`'s line for the nav
probe — and nothing in it decides what a station is.

## 6. What this does not change

`INVARIANTS.md` says there should not be a clever test for name-pill placement, and that stands for
everything except this one axis. Pill-against-pill (Phase 113's lending office), pill-against-frame,
a body on furniture, a body a _player_ is standing on: none of those are answerable from a canvas,
and all of them are still **look at the room**. What is now measured is narrower than the rule and
does not replace it — a machine can say whether art is painted over a label, and that is all it can
say.

Three things were observed and accepted rather than fixed, all in the table in §3, and one
candidate was withdrawn in §1. The pattern in the accepted column is worth keeping: **a person
standing beside a tree is what standing beside a tree looks like.** Only total occlusion is a defect.
