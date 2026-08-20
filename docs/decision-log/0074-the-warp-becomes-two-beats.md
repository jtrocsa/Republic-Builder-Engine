# 0074 — The warp becomes two beats

**Phase 88B**, immediately after Phase 88A's warp screens (decision log `0073`) and again ahead of
Unit 7, at the user's request. `0073` gave both transitions a painted plate of where the player was
going. What it did not give them was the going: the plate simply appeared, and three expanding
anchor rings stood in for a journey that never happened.

This record settles what the screen is now — two beats and a hand-off the player makes — and which
of `0073`'s rules survive it unchanged, which is most of them.

---

## 1. Two beats, three phases, one render

The screen is still one function, `warpScreen()`, and still one screen id per direction. What it
gained is `data-warp-phase`, flipped on the `<main>` by `beginWarp()`:

| phase    | ~            | what it is                                                                                                                                                                                                                         |
| -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tunnel` | 0–2000 ms    | A canvas streak field accelerating, cruising and decelerating, with its own bar along the bottom edge and a "locking on" line above. The destination card is blurred to nothing and resolves out of it over the beat's last third. |
| `plate`  | 2000–4500 ms | The painting settles in, the anchor rings expire, and a ring in the foot fills 0% → 100%.                                                                                                                                          |
| `ready`  | both gates   | The ring reads "Synced" and the arrival prompt appears.                                                                                                                                                                            |

**Everything for all three phases is emitted once and CSS decides what is visible.** No phase change
rebuilds markup, because a rebuild would restart the plate's own settle animation against a clock
two seconds out of date.

**The second beat's animations are delayed by `--warp-tunnel`, not started by the phase flip.** A
CSS delay is exact; a JS-scheduled class swap is a frame or two late, and on a 2.5 s ring that
shows. Both durations are set inline by `main.js` from `WARP_DWELL_MS` and `WARP_TUNNEL_MS`, the same
way `--warp-dwell` already was, so a duration in the stylesheet cannot disagree with the gate that
actually opens.

## 2. The player presses it now

The screen no longer leaves on its own. The two gates are exactly the ones `0073` built — the dwell
as a floor, the destination's art as the real gate, `WARP_ASSET_CEILING_MS` as the release valve —
and what changed is only what opening them _does_: it reveals the prompt.

The cost is stated plainly because it is real: **nothing times out behind a player who walks away.**
That is the trade for making arrival an arrival rather than a screen that happens at you. Two ways
off exist and both are buttons — **Skip transition**, live the whole time, and the prompt, live once
the art is warm — and they route through one function, `leaveWarp()`, because where a warp goes was
already answered in one place and the two differ only in when they are reachable and what they say.

`aria-busy` now means something: it is `true` until `ready`, rather than hard-coded `true` on a
screen that was never not busy. The ring is a `progressbar` whose `aria-valuetext` is set to
"Synced" at the same moment — the visible swap from the number to the word is CSS, and a screen
reader reads the attribute, so leaving it alone would have it saying "Syncing record" over a ring
that says otherwise. The prompt takes focus there too, which is the whole keyboard story for a
screen that deliberately never grew a key handler: Enter works by it being a focused button.

## 3. The ring still shows the dwell, not the bytes

`0073` §2 recorded a JS-driven bar reading actual load state being written and thrown away, because
it made this screen's visual baseline a coin toss. **That rule is unchanged and the ring obeys it.**
The sweep is a CSS animation on `stroke-dashoffset` over `--warp-dwell`, and the number beside it is
an animated `<integer>` registered property read back through a counter — so the two cannot drift
apart and no script touches either. If the art is slower than the dwell the ring sits at "Synced"
for a moment while the real gate finishes, which is the honest description.

One trap paid for in a browser rather than in review: `@property --warp-pct` must declare
`inherits: true`. The number is drawn by `::after`, and a pseudo-element does not see a
non-inherited custom property its originating element is animating — it reads the initial value.
Shipped as `inherits: false` first, and the ring sat on `0%` for the whole dwell while the sweep ran
behind it. Same class of bug as the two in `0073` §7: correct-looking CSS that a browser disagrees
with, found by looking rather than by reading.

## 4. Reduced motion deletes the tunnel

The tunnel is the one looping thing on either warp screen, which the rest of that screen is
deliberately not. That is affordable for exactly one reason: **`warpScreen()` does not emit the
canvas at all under `prefers-reduced-motion: reduce`, and the phase starts at `plate`.**

It is the right product behaviour first — a full-screen rushing streak field is what that setting
exists to suppress — and it is what keeps the baselines deterministic second, since they are
captured under precisely that media state. `--warp-tunnel` is `0ms` there, which collapses every
delay built on it, so the umbrella's "durations and not delays" trap has nothing to catch.

`tests/e2e/warp-screens.spec.js` holds that branch directly rather than trusting it, because the
failure is silent: a tunnel that leaked into the reduced-motion path would turn
`travel-transition.png` into a coin toss and nobody would learn it from a diff.

## 5. `engine/warp-tunnel.js`

New, and engine code in the strict sense: it is handed a canvas and a duration and knows nothing
else — which screen mounted it, what the destination is called and when the phase flips are all the
host's business. `direction: "in"` runs the streaks and their tails the other way, the same
inversion `.warp-screen--recall .warp-anchor i` already makes for the anchor rings.

The speed curve is expressed as **fractions of the run**, not the mockup's absolute milliseconds, so
retuning `WARP_TUNNEL_MS` stretches it rather than truncating the decel.
`tests/unit/warp-tunnel.test.js` covers the curve and the seeder — not the drawing, whose only real
assertion is what a person sees.

`stop()` is idempotent, and `render()` calls `stopWarpTunnel()` unconditionally beside its existing
`stopHubScene()`: the canvas is replaced by every render including the warp's own, so there is no
screen it is correct to leave a loop running on.

## 6. What this does not do

- **It does not change the dwell, the ceiling, the plates table, or the music.** `WARP_DWELL_MS` is
  still 2500 ms and both stings are still `chrono` and `return-warp` on entry, which now land over
  the tunnel rather than over a still picture — which is what they always sounded like they were
  for.
- **It does not give the warp a keyboard skip**, still. The prompt takes focus at `ready`, so Enter
  works there by being a button and not by a global handler.
- **It does not make either duration configurable or player-settable.** Two buttons already cover
  the person who wants it shorter, and now one of them is the ordinary way through.
- **It does not touch `uploadScreen()`**, the interiors, or `.chronotravel-screen`'s absence — all
  three settled in `0073` §6 and none of them was in the way.
- **It does not exempt anything from the reduced-motion umbrella.** The tunnel's absence there is a
  markup decision in `main.js`, not a CSS escape hatch.

## 7. Verification

- `tests/unit/warp-tunnel.test.js` — 9 tests, new: the ease clamps and is symmetric, the curve
  starts at rest and holds the cruise band, the decel is monotonic and settles at the rest speed,
  and a streak seeds inside the field however extreme the random draw.
- `tests/e2e/warp-screens.spec.js` — 13 tests, up from 10. The three hand-over tests now click the
  prompt, which is also what proves both gates opened; the three new ones walk the phases in order,
  hold the reduced-motion branch, and check the recall's own strings.
- `tests/e2e/archive-challenge.spec.js` — the Chronotravel-into-a-non-map-mission test clicks
  through too, and its "travelScreen() self-advances after 2500ms" comment is gone rather than left
  to mislead.
- `tests/e2e/visual-regression.spec.js` — both warp baselines pin `data-warp-phase="ready"` before
  screenshotting, which is the settled end state and, since the screen now waits there, the only
  state it has. Both were regenerated and both diffs reviewed as images: the ring, the prompt, the
  status line shifting up, and the bar leaving with the tunnel — nothing else, and no canvas.
- `npm run test` (1638), the full `visual-regression` suite (19), `npm run lint`, `npm run build`.
- Looked at in a browser at 1366×768 and at 820 px, in both directions, which is where the `0%` ring
  in §3 was caught and where the ring's caption was found sitting on its own stroke.
