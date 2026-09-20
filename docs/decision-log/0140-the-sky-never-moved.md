# 0140 — The sky never moved

**Phase 141 · 2026-09-20 · Accepted**

Storm Navigation's clouds carried `animation: stormCloudsDrift 14s linear infinite`. The drift
never happened, in any run of the mini-game, ever — the node the animation was attached to is
destroyed and recreated about sixty times a second, so the timeline restarted before it could
advance.

The module's own file header already says this is the wrong tool here. Four of the scene's five
continuous effects had been brought under that rule. The clouds were the one that never was.

---

## 1. How it happened

`runMiniGameLoop` in `main.js` redraws this mini-game by replacing its container's whole
`innerHTML`:

```text
function updateMiniGameUi() {
  const container = document.getElementById("miniGameContainer");
  if (container) container.innerHTML = renderMiniGameStage();
}
```

That runs on every animation frame while a run is in progress. Measured in the browser with a
`MutationObserver` on the container: **121 childList mutations in 2 seconds.**

`storm-navigation.js`'s file header states the consequence, and states it correctly:

> The mini-game is redrawn via a full container.innerHTML replace every animation frame […] so
> every DOM node in the returned markup is destroyed and recreated ~60x/second. That makes CSS
> `@keyframes ... infinite` the wrong tool for any continuous motion here — a fresh node never
> gets more than ~16ms into its own animation timeline before being torn down, so it reads as
> frozen near its starting frame.

Every other continuous value in the scene obeys that: the water's flow, the rain's scroll, the
lightning envelope, the ship's idle bob and each hazard's bob and sway are all computed from
`state.elapsedMs` in JS and emitted as literal inline values. The stylesheet says so at four
separate rules. The clouds simply were never converted, and a `@keyframes` block sat in
`global.css` doing nothing for the life of the project.

**Measured, not inferred.** Reading `getAnimations()` on `.storm-clouds` during a live run:

| sample | `currentTime` | computed `transform`  |
| ------ | ------------- | --------------------- |
| t=0.0s | 0 ms          | `matrix(1,0,0,1,0,0)` |
| t=1.5s | 0 ms          | `matrix(1,0,0,1,0,0)` |
| t=3.0s | 0 ms          | `matrix(1,0,0,1,0,0)` |

The animation reported `playState: "running"` at every sample. It was running. It had just been
running for less than one frame, every time.

## 2. What a player got

A sky that does not move, in a scene where everything else does. The water flows, the rain falls,
lightning flashes, the ship bobs and leans into its turns, and each hazard rides its own swell —
and above all of it a painted backdrop, perfectly still.

**This is why it survived.** A frozen animation is indistinguishable from a decoration that was
never meant to move. There is no error, no warning, and no visual artefact to notice: the element
is exactly where its first keyframe puts it, which is exactly where a static image would be. The
only way to see it is to know that a drift was authored and to check whether it happens.

It is not a severe defect — Storm Navigation is a pacing break, not a graded surface. It is
recorded at this length because of _how_ it hid, which is the same way `0128`'s fonts and `0139`'s
beacon hid: the authored intent was defeated silently by a mechanism nobody re-checked.

## 3. The fix is the rule the file already states

`cloudDriftPercent(elapsedMs)` — a pure function, module-private, alongside `shipBobPx` and
`hazardBobSway` — and `--drift-pct` emitted inline beside the parallax the clouds already carried.
The stylesheet's rule becomes `transform: translateX(calc(var(--drift-pct, 0%) + var(--parallax-px, 0px)))`,
which is the shape `.storm-coastline` next to it has always had.

**The authored motion is unchanged**, deliberately: the period and span are the retired keyframe's
own, 0% to −8% of the image's width over 14s, wrapping. This phase makes the drift happen; it does
not redesign it. Percent rather than px for the same reason the keyframe used percent — it resolves
against the element's own box, so it stays right at any width.

One thing got simpler on the way out. The keyframe had the steering parallax **folded into it**,
with a comment explaining why: a running animation owns the `transform` property outright and would
ignore a sibling inline value. With no animation left, that workaround has nothing to work around,
and the two values just add.

Verified in the browser, same instrument that found it: **−0.076px → −8.816px → −17.556px** across
4 seconds, with `getAnimations()` returning 0.

## 4. Two more found by asking the general question, and only one of them was real

The specific bug suggested a general one: **what else inside a per-frame-rebuilt container relies
on a CSS clock?** Swept every class the two mini-game renderers emit against every `animation` and
`transition` declaration in `global.css`, matching on the selector's **subject** rather than any
ancestor. Three hits:

| rule                                              | verdict                              |
| ------------------------------------------------- | ------------------------------------ |
| `.storm-clouds { animation: … 14s infinite }`     | **the defect above**                 |
| `.storm-ship-art { transition: transform 0.12s }` | dead — removed                       |
| `.cargo-hold { transition: filter 0.15s ease }`   | **fine, and left alone** — see below |

`.storm-ship-art`'s transition had never fired. A transition needs the element to survive a value
change, and this node is new every frame, so there was never a previous value to ease from
(`getAnimations()` on it returns 0 mid-run). It was also redundant: `--bank` is computed from
`playerVelocityX`, which `steerShip` already accelerates and decays smoothly, so the ship leans in
and levels out on its own. Removed, and the comment above it — which credited the easing with the
levelling — corrected to say what actually does it.

**`.cargo-hold` is the one that would have been a mistake to "fix".** Cargo Sorting is rendered by
the same loop into the same container, so a sweep keyed to "mini-games" would have swept it up.
But it deliberately redraws only when its displayed second changes — its own comment explains that
a per-frame redraw would abort any drag gesture lasting longer than a frame. Measured the same way:
**1 container rebuild in 2 seconds, against Storm's 121.** Its nodes live about a thousand times
longer and its 0.15s transition completes comfortably.

So the guard is keyed to **Storm Navigation's markup**, not to mini-games. Asking one question of
both would have answered Cargo's question with Storm's answer — which is the failure `0103` and
`0127` are both about, arriving for the third time.

## 5. The guards, and both arms watched failing

**`tests/unit/storm-navigation-css-clock.test.js`** — the static half. Reads the classes the storm
renderer emits, parses `global.css` (comments stripped, at-rules descended, subject-matched), and
asserts none of them declares an `animation` or a `transition`. Watched fail with both retired
declarations restored, naming each with its line number and its consequence:

```text
global.css:1175  .storm-clouds { animation: stormCloudsDrift 14s linear infinite }
global.css:1271  .storm-ship-art { transition: transform 0.12s ease-out }
```

It carries an anti-vacuity case — if the renderer is ever restructured so no class literal is
found, every assertion would pass by checking nothing — and a case that **asserts Cargo Sorting
still has a clock**, so that a later reader widening the sweep sees why it was not already.

**`tests/e2e/storm-clouds.spec.js`** — the player's half. The static guard would pass on clouds
that sit perfectly still: a `--drift-pct` emitted but never read, or read into a property that does
nothing, looks identical to the defect. So this one watches the sky for three seconds and asks
whether it went anywhere, then whether it went the authored way, then whether it went steadily.

**Watched fail on both arms, separately**, because a guard that only ever fails one way is only
half proved:

- with the original keyframe restored — _"a CSS animation or transition is driving .storm-clouds
  again"_;
- with the keyframe gone and `cloudDriftPercent` stubbed to return a constant, so no CSS clock is
  involved at all — _"the clouds have not moved in 1500ms (translateX 0px then 0px)"_.

**`tests/unit/mini-game-storm-navigation.test.js`** gains six cases for the drift itself, exercised
through the renderer the way this module's other private helpers are: zero at the start, monotone,
linear, the full span across one period, wrapping rather than running away over a ten-minute run,
and emitted _alongside_ the parallax rather than instead of it.

## 6. A note for anyone writing a spec against this screen: you cannot hold a handle

The first draft of the e2e guard used `locator.evaluate()` and **failed against a working game**.
The reason is the defect's own cause: a Playwright locator resolves to an element handle and then
evaluates on it, and at sixty rebuilds a second the node it resolved is frequently gone by the time
the evaluation runs. Measured — the first read came back with `transform: ""` and a client width of
`0`, having landed on a detached node.

Read that way a moving sky reports as a still one. Worse, the obvious tidy-up — treating that empty
string as `0` — makes a stale read and the actual defect indistinguishable, which is a guard that
cannot tell the thing it exists to detect from its own instrument failing.

Every sample is taken inside one `page.evaluate` that re-queries the document at the moment of use,
and a sample without a usable transform is a **failure**, not a zero. This is CLAUDE.md's existing
rule for a window narrower than a round trip — ask the page from inside the page — arriving from a
new direction.

---

## Verification

`npm run check` clean — **2,397 unit tests across 81 files** (from 2,387 across 80), ESLint 0 errors
and the same 5 pre-existing warnings, cspell, `validate:content` at 169 groups. `npm run build`
clean. All 61 visual baselines unchanged, which is expected and is also the point: the only
committed screenshot of this area is `mini-games-select`, the static card list, and the in-progress
stage has never been baselined because it animates. A change that makes something move could not
have been caught by a screenshot, and was not meant to be.
