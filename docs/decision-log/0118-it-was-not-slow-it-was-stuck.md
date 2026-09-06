# 0118 — It was not slow, it was stuck

**Phase 119 · 2026-09-06 · Accepted**

Two specs in this suite failed intermittently and were recorded twice without ever being routed: the walk out of
Ellis Island's inspection hall (`port-interiors.spec.js:73`) and the wall-slide speed case
(`field-movement-dialogue.spec.js:277`). Both were assumed to be load-marginal timing. Both were,
and that was the smaller half.

**The wall clock was standing in for something else in each of them, and in the walker it was
hiding a body that had stopped moving entirely.**

---

## 1. The rule this suite already had

Phase 93 wrote it for `frame-budget.spec.js`, in as many words: the spec counts re-renders and
**does not care how fast the machine is**. The reason was that the previous signal — walks parking
short — "fires just as readily for a busy laptop". A test's verdict must not depend on the machine
it runs on.

The walker and the slide case never adopted it. Both bound a claim about the game to a number of
milliseconds.

## 2. What the walker's budget was actually spending

`walkTo()` carried `timeoutMs = 20_000`. Measured on an idle machine at one worker, with the hold
durations totalled separately from the elapsed time:

| Walk                           | Bursts | Held     | Elapsed  | Of the 20s budget |
| ------------------------------ | ------ | -------- | -------- | ----------------- |
| out of the inspection hall     | 22     | 11,437ms | 11,932ms | **60%**           |
| to the inspection hall's desks | 16     | 9,399ms  | 9,859ms  | 49%               |
| to the board clerk             | 6      | 3,206ms  | 3,420ms  | 17%               |

11.4 seconds of that first walk is **key-hold**: 41.7 tiles of ground at 3.65 tiles/s. The room is
22×18 with two rails and a switchback, and the spec's own comment says the switchback is the point
of the room. The walk is long by design; the deadline was a generic 20 seconds that had never been
checked against the longest walk in the suite. Under two workers, the frame clamp and the round
trips have four fifths of a second each to play with before it tips.

Two specs had already raised that ceiling to 60 seconds by hand. They were the two that hit it
first. And of the **84 walk calls across the suite, not one asserts that a walk fails** — the
deadline was never a wanted verdict, only a hang guard.

## 3. What the deadline was hiding

Instrumenting the walker to log why it gave up, at six workers:

```
REPLANS:false bursts=44 replans=9 stalls=27
moves=0.65,1.66,1.23,1.78,1.38,0.64,1.72,0.30,0.12,0.00,0.00,0.00,0.00,0.00,0.00, …
```

The body walks normally for eight bursts, and then **moves 0.00 tiles for every burst after that**,
through nine replans. It is not slow. It has stopped, and it never starts again.

Logging the position and the cast at the stall, twice, at the same coordinates:

> `STUCK key=ArrowRight at=12.66,7.25 wp=13.00,7.00 npcs[port-board-clerk@13.00,4.40
port-detained-woman@7.00,4.80]`

No NPC within four tiles. The player is at y **7.25**, walking to a waypoint at y **7.00**, and
right is refused. `window.__chronicleNav` samples collision on a **half-tile lattice**, so the route
was planned through cells at y 7.0 and y 7.5. A quarter tile below the row the plan cleared, the
foot box is in something solid — and re-planning from that spot returns the same route, so the walk
wedges permanently.

The 20-second deadline reported this as "too slow". It was the wrong diagnosis of a real defect, and
it is why the flake looked like load rather than geometry.

## 4. What replaced it

**Progress, not duration.** A walk that is still closing on its waypoint is not failing however long
it has taken, so nothing counts milliseconds any more. A walk gives up when it stops getting
anywhere:

- Progress is measured **toward the waypoint on the axis actually pressed**, against the best
  distance reached so far. The old test was total displacement since the previous burst, which a
  body held against a wall satisfies indefinitely.
- It is kept **per axis**, because one leg can spend bursts on both, and a distance in x compared
  against a distance in y is not a measurement.
- A stalled burst **squares up on the other axis**, which puts the body back on the row the plan
  cleared. This is not the greedy steering Phase 94 removed: the route is still the plan and is
  still walked corner to corner. It is only how one leg is walked when the body is off the lattice
  the corners were drawn on.
- `maxBursts = 300` is a last-resort net against an unbounded loop rather than a deadline —
  thirteen times the 22 bursts the longest walk in the suite uses.

A walk that genuinely cannot arrive still fails **fast**, which is what makes the calling specs'
messages worth having. `planRoute()` returns the reachable cell closest to the target, so if an edit
closes a gate the walker reaches the near side of it, finds no `.is-near`, and re-plans onto the
same spot — where every waypoint is already inside `ARRIVE_TILES`, so the remaining replans cost
nothing and it returns false under the spec's own "which means both gates are open".

**Two repairs to this were wrong before one was right**, and both were wrong in the same direction —
they measured the right thing against the wrong reference:

1. The first kept one `closest` across an axis switch inside a leg, comparing an x-distance to a
   y-distance, so the honest walk that follows a corner read as consecutive stalls.
2. The second gated the square-up on `ARRIVE_TILES`. The offset that wedged the walk was **0.25 of a
   tile**, and `ARRIVE_TILES` is 0.3 — so the walker called the very thing that was killing it
   "arrived" and never squared up. The threshold is `PROGRESS_TILES` now: a quarter tile is nothing
   to a route and is the whole difference to a foot box.

## 5. The slide was a window, not a threshold

The same defect, sharper. The spec holds down-and-across against Canal Crossroads' lock keeper and
reads `--sprite-cycle`, which must show 0.426s (the 0.707 slide) rather than 0.301s (full speed).

The player stands **0.62 tiles** clear of the keeper. A diagonal closes that at 2.58 tiles/s, so for
the first **~240ms both components are free** and the legs correctly read 0.301. Then down is
blocked and the body slides. Then the body clears the keeper's own width and descends freely again,
back to 0.301.

So the reading has to land inside a window that **opens 240ms after the keydown**. The fixed
`waitForTimeout(260)` landed **20ms inside its opening edge** — which is not a margin, and when it
missed it read the free diagonal, 0.301, and compared it against itself.

Two repairs were wrong here too, and instructively:

1. Waiting for the descent to stall and _then_ reading over the wire. Correct in principle; the
   round trips cost more than the window is wide, so it read past the closing edge instead of before
   the opening one.
2. Stepping those samples in animation frames rather than milliseconds. Better, and still too slow
   for the same reason.

What works is to stop crossing the wire during the measurement at all. The sampling now happens
**inside the page, on the frame the condition first holds**, and only the answer comes back. The
condition is stated as physics rather than as a duration: this frame moved the body sideways and not
downward. A body that has simply stopped fails the first half of it, and a busy machine can make
this take longer but cannot make it read the wrong frame.

The free-walk reading gets the same treatment, and needs it for a different reason: the cycle is
written per frame from that frame's measured ground speed, so the first frame after a keydown can
carry an unusual `dt`. It waits for a frame that moved _and_ carried the same cycle as the frame
before it.

## 6. What did not change

- **No game code.** Nothing in this phase touches `main.js`, `global.css` or a content file. The
  wedge is the walker walking off-lattice into a solid row; a player pressing the same key at the
  same spot is refused for the same correct reason and would press another.
- **Every assertion in both specs.** The slide still asserts `slid > free` and `slid ≈ 0.426`; the
  hall still asserts both gates are open, the rail is a wall, and the camera scrolls on both axes.
- **`.is-near` is still what ends a walk**, so the walker still survives the map moving underneath
  it, and it still returns whether it arrived rather than asserting.
- **The two hand-raised 60-second ceilings are deleted** along with the option they raised.

## 7. The numbers

At **six workers** — three times the configured count, and a load neither walker was built for:

|        | port-interiors, 6 runs |
| ------ | ---------------------- |
| Before | **3 failed**           |
| After  | **6 passed**           |

Across every walker-heavy spec at six workers, twice through: **47 of 48**. The one failure is a
`#fieldNotice` assertion in `suburb-interiors.spec.js:126`, in an area this phase does not touch —
recorded below rather than chased.

## 8. What this leaves

Nothing routed is open in either ledger.

Two things are recorded and not acted on. The `#fieldNotice` failure above appears only at six
workers and is a status-line assertion rather than a walk; it wants its own look, at the configured
worker count, before anyone decides it is real.

And the survey that found these two found **22 fixed `waitForTimeout` waits across eleven spec
files**. Most are honest durations — let an animation play, let an idle cycle come round — rather
than a state being waited for by guess. The two repaired here are the two that had actually failed,
and the rest should be left alone until one of them does. A wait is only a defect when it is
standing in for a question the page can be asked.
