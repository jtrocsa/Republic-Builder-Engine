# 0093 — The walker was blind

**Phase 94 · 2026-08-27 · the e2e walker paths instead of sliding; `workers: 2` ships**

Finishes what [`0092`](./0092-the-suite-was-timing-the-machine.md) started and could not land. Phase 93
measured the harness end to end, shipped three of its four answers, and left one blocked with its
reason written down: **two workers are faster than six, and the cap could not ship, because a fast
page broke two specs that had been calibrated to a slow one.** This is that block, removed.

---

## 1. The thing that was actually wrong

`tests/e2e/helpers/progress-seed.js`'s `walkTo` steered greedily. It moved the player along whichever
axis had the larger gap and, when a burst produced no movement, committed to the perpendicular axis
for three bursts to get round whatever was in the way. `maxStalls` — ten consecutive blocked bursts —
was how it gave up.

That is a slide, not a route, and its own comment said so. Three spec files worked around it in
prose, two more worked around it in code: `port-interiors.spec.js` and `railhead-interiors.spec.js`
each carried a private `nudgeTo` that steered the player through hand-measured gate coordinates one
axis at a time, because — in that helper's own words — a slide "is enough to get round a building and
is not enough to find a gate on the far side of a barrier."

**The slowness was hiding it.** `runFieldMovementLoop()` clamps its frame delta with
`Math.min(48, …)`, deliberately, so a stalled frame cannot teleport the player through a wall. Under
six parallel workers against one single-threaded dev server the page ran at 4–13 fps, so a burst
covered between a third and two thirds of its ground — and a player crawling into an obstacle drifts
round it, where a player arriving at full speed stops dead against it. The moment Phase 93 made the
suite fast enough to be worth capping, the suite's longest diagonal — `powhatan-man is reachable on
foot`, fifteen tiles west and eleven north — failed **every** attempt under load, through four
retries. Deterministic, not flaky.

`0092` §5 records the four repairs tried on the slide and why each failed. The most useful is the
first: teaching the helper to reverse out of a blocked slide fixed that walk 3 runs in 3 and **broke
five other specs**, because a walker that can step one way and then the other moves a pixel every
burst, which resets `stalls`, so instead of giving up it burns the whole clock. There is no tuning of
a blind walker that is not that trade. The shape was wrong.

## 2. Give the walker the walls

`main.js` already owns the only correct answer to "can a body stand here" — `isFieldBlocked(x, y)` and
`isHubBlocked(x, y)`, the same predicates the movement loops ask every frame, foot boxes and other
bodies included. `installDevNavProbe()` exposes one function that samples whichever of them applies to
the surface the player is standing on, across the active grid, on a half-tile lattice:

```js
window.__chronicleNav("field"); // -> { step, cols, rows, tile, cells, at }
```

Gated on `import.meta.env.DEV`, exactly as `applyDevWarp()` is, and verified absent from the
production bundle. Half a tile because the foot box is 0.68 wide, so a one-tile gate is passable and a
full-tile lattice would not reliably see it; 112×72 for a field map, which is 8,064 samples and a few
milliseconds.

`walkTo` floods that breadth-first from the player, picks the **reachable cell closest to the
target** — the target's own cell is almost always solid, because a body is solid — reconstructs the
path, keeps only the corners, and walks the legs. All of it runs inside the page, so what crosses the
wire is a handful of waypoints rather than eight thousand cells.

**The engine keeps its one collision rule.** Nothing in the helper re-implements a wall; a wall that
moves moves here too. That is the whole reason this is a probe over the game's own predicate rather
than a parser for the `.blocks.js` modules.

Three things the route is not:

- **It is not a promise.** The sample includes the other bodies, because both predicates do, so a
  patrolling NPC invalidates it by walking. A leg that stops making progress re-plans rather than
  shoving, and so does a route walked to its end without arriving.
- **It is not a tracker.** The old walker re-read the target every burst and so followed a patrol for
  free; a route is planned once. `settlement-carpenter` walks the length of the settlement, and the
  first version of this landed exactly where he had been standing — the walker was right and the
  snapshot was old. The route now carries the goal it was drawn against and re-plans when the target
  leaves it by more than 1.2 tiles.
- **It is not optional.** If the probe is missing, every walking spec fails at once with one message
  naming the cause, which is worth more than twenty specs each timing out somewhere different.

Legs are sized to the distance left rather than fixed, and capped at 700ms rather than 320ms, because
a leg runs through cells the probe said were free — a long hold is safe here in a way it never was for
a slide. It cannot overshoot: `FIELD_SPEED` is a ceiling and the frame clamp only ever makes a burst
cover less.

## 3. `workers: 2` ships

`playwright.config.js` now caps at two, with `0092`'s measurement kept beside it. The curve was
U-shaped with its minimum there — 67–70s against 90s at six and 95s at one on a fixed subset — because
the contended resource was never the twelve cores but one single-threaded Vite dev server, and six
workers only lengthened its queue. The repo had half-noticed for four phases: `0084` through `0087`
each record their verification run as `--workers=2`, by hand, without ever writing down why.

Measured on the eight walk-heaviest spec files at two workers with **retries off**: 44 passed, 0
failed — the same set Phase 93 could not get green there.

## 4. Two workarounds deleted

`port-interiors.spec.js` and `railhead-interiors.spec.js` no longer carry `nudgeTo`. Six hand-measured
coordinates went with it — `nudgeTo(page, 19.8, "ArrowRight")`, `nudgeTo(page, 5.6, "ArrowUp")` and
the rest — and the claims those walks were making are **stronger** for it, not weaker. The inspection
hall's comment said the point out loud: "if a later edit closes either pair of columns this walk stops
dead and the hall becomes three rooms." A hand-steered switchback asserts that only for the gate
coordinates somebody typed; one `walkTo` to the desks asserts it for whatever route exists, and
returns false when none does.

Five more spec files carried the same limitation in prose. Those comments are updated rather than
deleted, because the shape they explain is kept: each interiors spec still starts inside its room and
walks out. The walker could now make the walk in — across the canal at the lock, down the bluff at one
of its two descents — but that is half a minute of walking per test to prove nothing the door
assertions do not already prove. **What was a limitation is now a choice**, and the comments say which.

## 5. What was deliberately not changed

- **`retries: process.env.CI ? 2 : 1` stays.** One variable at a time; `0092` made the same call for
  the same reason. The number to watch is `flaky`, and if it stays at zero over the next few phases
  the local retry can go.
- **`timeout: 60_000` stays.** At two workers a navigation is 2–3s rather than 11, so most of what it
  covered for is gone, but a generous ceiling costs nothing on a run where nothing is slow.
- **The interiors specs still seed the player inside the room** — see §4.
- **`walkTo`'s signature.** `burstMs` and `timeoutMs` still mean what they meant; `maxStalls` and
  `slideBursts` are gone because there is no slide, and `maxReplans` replaces them. No call site
  passed either.
- **Nothing in `main.js` outside the probe.** The engine gained one dev-only function and one line
  calling it at boot.

## 6. Verification

`npm run check` clean. `npm run build` clean, and `__chronicleNav` is absent from `dist/`. The full
e2e suite at the shipped configuration is recorded in `ARCHITECTURE-QUICKREF.md`'s Phase 94 entry.

The walker's own defect was found by running it, not by reading it: the first version walked
`settlement-carpenter` perfectly and arrived where he used to be. A test helper that follows a route
needs to notice the route is a snapshot — §2 — and that is exactly the kind of thing a spec that was
already passing would never have told anybody.
