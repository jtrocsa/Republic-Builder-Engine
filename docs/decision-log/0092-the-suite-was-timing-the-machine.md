# 0092 — The suite was timing the machine

**Phase 93 · 2026-08-26 · the e2e harness's flakiness trade, measured; the cap deferred with a reason**

Closes **Candidate C**, which had stood in `ARCHITECTURE-QUICKREF.md` §6 since Phase 90F with an
instruction attached: whoever takes it should decide the trade on purpose rather than reach for the
obvious one-line worker cap, because that cap trades away something
[`0083`](./0083-the-field-stops-talking-to-itself.md) §1 valued deliberately — an e2e suite catching
a real performance regression as a correctness failure, "which is the only way a suite ever can."

The answer is in three parts. **The trade the candidate feared is not real**: the performance signal
can be measured directly, and it now is. **The cap is not a cost either**: two workers are _faster_
than six. And **the cap still cannot ship**, because making the suite fast breaks two specs that had
been calibrated to a slow one — deterministically, through four retries. That last part is the
finding, and it is what the cap is now blocked on.

---

## 1. What was measured, before anything was changed

Six workers on a 12-core machine, against one Vite dev server, which is what `workers` being unset
meant. One page, timed at one worker and at six:

|                                        | workers=1 | workers=6     | ratio      |
| -------------------------------------- | --------- | ------------- | ---------- |
| cold `page.goto("/")`                  | 2.2 s     | **11.6 s**    | 5.3×       |
| the two clicks into a seeded save      | 0.6 s     | 1.8 s         | 3.0×       |
| `requestAnimationFrame` rate           | 40–45 fps | **4–13 fps**  | ~5× down   |
| ground covered by a 1000 ms held arrow | 175 px    | **68–142 px** | 0.39–0.81× |

**The navigation number is the whole diagnosis.** 5.3× latency for 6× the demand is what a
_serialized_ resource looks like — one single-threaded Node process transforming and serving hundreds
of module requests per page load. It is not CPU contention; twelve cores were not the constraint, and
adding workers past the point the server saturates only lengthens its queue.

The last row is the cost, and it compounds the first. `runFieldMovementLoop()` clamps its frame delta
with `Math.min(48, …)` — deliberately, so a stalled frame cannot teleport the player through a wall.
A page rendering at 5 fps therefore advances 48 ms of in-game movement per 200 ms of wall clock.
**Every walk helper's deadline is denominated in wall clock and every walk's progress is denominated
in frames**, and at six workers those two units differed by up to a factor of two and a half. 175
px/s is not an approximation either: `FIELD_SPEED` is 3.65 tiles/s × 48 px = 175.2, so the serial
figure is exactly nominal and everything below it is the clamp.

That is what "a walk parked short" always was. Not stamina, not the map, not a wall in the wrong
place. The suite was timing the machine.

## 2. The signal `0083` wanted, measured directly — shipped

`0083`'s claim is worth keeping and was worth more than the way it was being kept. Its regression was
specific: `render()` entered the per-frame path, and `render()` rebuilds the screen and repaints the
map canvases. What the suite noticed was four unrelated specs going red because walks parked short.

**That signal is real but not specific, and a signal that fires constantly for the wrong reason is
not a signal.** Machine load and a per-frame regression present identically, and the suite was
reporting 2–8 red tests a run for the first reason while claiming to watch for the second. The
quickref's own note that this "trains its reader to discount it" is the cost, paid every run.

So the claim gets a test that measures the claim. `render()` assigns `app.innerHTML` wholesale, which
removes every existing _direct child_ of `#app`; the per-frame path patches attributes and single
nested nodes and never does that. A `childList` MutationObserver on `#app`, without `subtree`, counts
renders and nothing else.

**The count does not depend on how fast the machine is.** Verified at six workers and 4–9 fps — the
worst contention this repo can produce — a walk cost `0` renders and a deliberate screen change cost
`1`. `tests/e2e/frame-budget.spec.js` is that, in two cases: a field walk and the hub walk that had no
coverage at all. Re-adding `render()` to either loop turns it red 100 % of the time at any worker
count.

**It deliberately does not cover `0083`'s own scenario of walking away from an open conversation.**
Reaching an NPC needs `walkToNpc()` across half a map, and a long walk is the single most
load-sensitive thing this suite does — §5 is about exactly that. Including it would make this spec's
verdict depend on the machine, which is the one property it exists not to have. Both remaining cases
are a held arrow from the spawn, so the spec adds almost no load of its own.

The third assertion in the first case is what keeps the other two honest: **a deliberate exit must
still count 1.** Without it a broken observer reads as a passing test, which is the failure mode of
every "assert something did not happen" check ever written.

**This ships regardless of the worker question**, and it is the part that actually closes the
candidate's central worry.

## 3. Workers: two is faster than six — and still not shipped

With the performance claim carried by something that does not care about load, the worker count is
free to be chosen on its merits. Measured on a fixed 26-test subset, twice at each setting:

| workers    | 1    | **2**           | 3           | 4    | 6    |
| ---------- | ---- | --------------- | ----------- | ---- | ---- |
| wall clock | 95 s | **67 s / 70 s** | 68 s / 87 s | 82 s | 90 s |
| failures   | 0    | **0 / 0**       | 1           | 1    | 0    |

**The curve is U-shaped with its minimum at two.** Six workers are slower than two by 26 %; one
worker is slower than two because there genuinely is some parallelism to have, just far less than six
workers' worth. So the standing framing was wrong in a useful way: the quickref treated the cap as
buying stability at the cost of wall clock, and it costs no wall clock at all. The repo had
half-noticed already — decision logs `0084`, `0085`, `0086` and `0087` each record their verification
run as `--workers=2`, by hand, four phases running. What was missing was not the number but the
reason, so it never reached the config.

**It is still not in the config, and §5 is why.** At two workers the page runs at 40+ fps instead of
4–13, and two long-walk specs then fail _every_ attempt under full-suite load. Two green tests
turning permanently red is worse than the flakiness the cap fixes, and a cap that has to be reverted
the first time somebody runs the suite is not a decision. `workers` therefore stays unset, with the
measurement written into the config beside it so the next reader does not re-derive it.

## 4. The pixel threshold: an absolute budget, between the two measurements — shipped

Candidate C named this as a second decision, and it had a number attached: Phase 90L removed a
visible chip from the mission screen — measured at **211 pixels** — and all twenty baselines stayed
green, because `maxDiffPixelRatio: 0.002` allows **2,098** at 1366×768.

Re-measured with the tolerance turned off entirely: **every baseline that rendered was
pixel-identical.** Zero differing pixels, on all nineteen. Whatever churn Phase 90J was answering, it
is not a noise floor this suite has to sit above today.

The budget is now `maxDiffPixels: 120` — an absolute count between the two measurements, comfortably
above nothing and well under the 211 that got through. Absolute rather than a ratio because
antialiasing noise lives on edges and does not scale with the area of the shot. And written down
beside it: **if churn returns, the lever is `threshold`** (per-pixel colour distance), not a bigger
pixel budget, because raising the count is exactly what let a real change through. Verified 20/20.

## 5. What a fast suite exposed

**A suite too slow to reach a bug cannot report it.** The same seven spec files that pass 21/21 on
`main` at six workers failed four or five of them, three runs in three, at two. Two causes, neither
of them a defect in the game.

### A camera read that raced its own first write — fixed, and shipped

Five specs read the world transform with a one-shot `el.style.transform.match(…)` immediately after
the room mounts. The field mounts with `translate(0px, 0px)` and the first `updateFieldPlayer()`
writes the real camera a frame later, so a read landing between the two returns **0** — which fails
as "camera x 0 vs -964", i.e. reads exactly like the camera-purity regression the test exists to
catch. Six workers held the page slow enough that the read never won that race.

All five are `expect.poll` now, which is the correct form for a value written asynchronously after
mount. Waiting for "non-zero" was not available: one room's legitimate centred value is 10. **This is
right at any worker count**, so it ships on its own merits.

### Long walks calibrated to a slow page — the thing the cap is blocked on

`walkTo` steers along whichever axis has the larger gap and, when a burst is blocked, commits to the
perpendicular axis for `slideBursts` bursts to get round whatever is in the way. `maxStalls` — ten by
default — is how many consecutive blocked bursts it accepts before giving up.

`powhatan-man is reachable on foot` walks from (26, 18) to (11, 7): fifteen tiles west and eleven
north, the longest diagonal in the suite. At six workers the player covered that at a third speed and
mostly ran out of clock; at two it reaches each obstacle at full speed and runs out of stalls
instead. **Four fixes were tried, and which ones failed is the useful part:**

- **Teaching the shared helper to reverse out of a blocked slide.** When the perpendicular burst is
  itself blocked — an inside corner — the rule flips straight back to the axis already against a
  wall, and the two alternate without ever trying the third direction. Making a slide remember its
  direction and reverse fixed this walk, 3 runs in 3 — **and broke five other specs.** A walker that
  can step one way and then the other moves a pixel each time, which resets `stalls` every burst, so
  instead of stalling out it burns the whole clock: `field-liaison` and `meridian-reveal` went from
  17/17 green to five "Voss is unreachable from the spawn" failures at 23 s against a 20 s budget.
  Bounding the reversal to one per slide did not recover them. Reverted.
- **Longer slides, or shorter bursts.** `slideBursts: 6` with `maxStalls: 24` failed **4 runs in 4**;
  shortening the burst from 400 ms to 250 or 180 was worse than leaving it alone.
- **Only the stall budget.** `maxStalls: 40` with the clock raised went **8 runs in 8 in isolation** —
  and still failed under full-suite load.
- **Retries, scoped to that file.** `retries: 3` on its own `describe.configure`: it failed **all four
  attempts**. Which is the answer that matters — **under load at two workers this is not stochastic,
  it is deterministic**, and retries cannot fix a test that fails every time.

So the cap is blocked on hardening the long walks, and that is a real piece of work rather than a line
in a harness phase. The limitation underneath is plain: **`walkTo` slides, it does not path.** The
repo already works around this twice — `port-interiors` and `railhead-interiors` carry their own
`nudgeTo`, whose comment says a slide "is enough to get round a building and is not enough to find a
gate on the far side of a barrier." A walker that paths, or hand-steered waypoint routes for the four or five
longest walks, is what unblocks `workers: 2`.

Both of §5's findings were latent for as long as the suite has existed, and neither would ever have
been found by a slower suite. That is worth as much as the cap would have been.

## 6. What was deliberately not changed

- **`walkTo`'s steering.** One walk is not worth a shared helper twenty specs depend on, and the
  attempt is measured above.
- **`retries: process.env.CI ? 2 : 1` stays**, unchanged. It is not masking the worker contention,
  because the contention is still there — the cap did not ship.
- **`timeout: 60_000` stays.** Still earning its place at six workers, where a navigation genuinely
  takes 11 s.
- **`richmond-interiors.spec.js`'s second camera assertion stays as it is.** It checks `camX <= 0`,
  which a raced read of `0` satisfies, so it is weaker than it looks — and it is not failing.

## 7. Verification

`tests/e2e/frame-budget.spec.js` run 8 consecutive times and once at `--repeat-each=4`: clean in all
of them, at both two and six workers. Both of its own defects were found by running it rather than by
reading it — a "landed at the Institute" assertion that never fires because recall leaves through the
chrome-less return-warp, and a fixed walk-away direction that is a coin flip on which side
`walkToNpc()` happens to park.

The full suite at the shipped configuration is recorded in `ARCHITECTURE-QUICKREF.md`'s Phase 93
entry, along with the numbers above.
