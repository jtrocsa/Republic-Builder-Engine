# 0078 — The intro stops repeating itself

**Phase 90A. Accepted 2026-08-22.**

Supersedes nothing. Retires the Main Hall tutorial tour's state machine, which shipped in Phase 63
alongside decision log [`0046`](./0046-institute-entrance-hall-and-escort-walk.md).

---

## What prompted it

An owner playtest of the first five minutes, reported as six things. Every one turned out to have a
cause in code rather than being a matter of taste, and three of them had causes nobody had named:

> the director is talking too long and much of what he says before the institute, in the institute,
> and then what emery says is overlapping … the hallway scene glitches a little, the screen jumps,
> and the player 'jumps' to the director … get rid of the double black screen … emery voss is
> talking to us from across the room.

This is Spine Review Parts 1–4 territory, all `not started`, and the report is that programme's step
3 arriving before its step 1. The findings are recorded in
[`part-01-04-the-intro.md`](../playtest/part-01-04-the-intro.md); this file is the decisions.

## The measurements

Worth writing down, because four of the six reports were about _feel_ and all four turned out to be
arithmetic:

- **Sixteen Director beats before the player controls anything** — eight briefing lines, four
  Entrance Hall beats, four tour captions — and canon §2's object-led travel rule taught **three
  times**, in near-identical words, by the briefing, the tour and Voss.
- **The escort teleported the player.** `createEscortWalk()` seeded its breadcrumb trail from the
  _leader's_ position, so the follower's own start was never on it. The first frame the follower
  engaged, it was assigned a point on the leader's path outright.
- **One doorway, two blackouts, ~885ms of black.** `doorway-flicker` ran black-clear-black-clear-black
  over 900ms and held; the Main Hall then rendered a _second_ overlay and faded it out over 480ms.
- **Two loops fought over the cast at 30Hz.** The NPC interval ran straight through every scene,
  forcing `walking = false` while the scene's own paint set it true, and calling
  `updateInstitutePlayer()` with the default `HUB_SPEED` while the scene passed `SCENE_WALK_SPEED` —
  so the player's `--sprite-cycle` flipped between 0.301s and 0.5s about thirty times a second.

## Decisions

### 1. The tutorial tour is a scene, not a caption panel

`DIRECTOR_TOUR` in `content/cutscenes.js`. The tour was four `.hub-dialogue--tour` panels rendered
over a room the player was locked out of walking, pulsing a gold highlight on an object twelve tiles
away that nobody approached. It is now a walk, on the same runner as every other scene.

**It needed no new command**, which is the test `CUTSCENE-AND-DIALOGUE-CONVENTIONS.md` §3 sets:
`moveActor`, `turnActor`, `highlightObject`, `say`, `setFlag` and `returnControl` — six of the
justified eight. `cutscene.test.js` still asserts there are exactly eight.

Retired with it: `TUTORIAL_TOUR_STEPS`, `isTutorialTourActive()`, `currentTourStepId()`,
`isTourHighlighted()`, `tourCalloutMarkup()`, the `tutorial-tour-next` handler, `.hub-dialogue--tour`,
and `CHRONICLE_OPENING_DEFAULTS.tour`. **`isHubInputLocked()` is down to one term.** Keep the
function: three call sites read it, and a second lock concept appearing beside it is the failure it
exists to prevent.

`progress.tutorial.step` survives and still records that the tour happened — saves and all nine dev
warps key on it — with `"tour"` as the in-flight value.

### 2. Each idea gets one owner, and the owner is whoever the player is standing in front of

Canon §8 already said _introduce a term once, then stop explaining it_. The corollary this phase
adds is that **the one telling should be the one where the object is.**

| Who                              | Owns                                              | Lost                                            |
| -------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| Briefing, now 2 screens          | Chronicle, the Original Drift, the job, the Codex | the Navigation Table and anchor glass           |
| Hale, Entrance Hall, now 2 beats | the greeting, "through those doors"               | the hall's history, a standalone "walk with me" |
| Hale, Main Hall, now 2 beats     | the Preservation Case, the Archive Room           | the Navigation Table                            |
| Voss, Scene A, now 8 beats       | the table, anchor glass, provenance, the notebook | nothing                                         |

**Director 16 beats → 8. Total 23 → 16.** Voss gains one and is now the longest speaker in the
intro, which is the intended contrast and the reason the cut is not symmetrical.

Deleting briefing screen 03 nearly orphaned **anchor glass**: Voss's own Richmond line in Unit 5 uses
the term without re-explaining it, deliberately, per canon §8 — so something upstream has to
introduce it. It moved into her table lines rather than being cut. A term with exactly one
introduction is fragile in a way this phase should record: **before deleting an intro screen, grep
for what it is the only introduction of.**

### 3. Both of them walk, and Voss comes to the player

Scene A opened with Voss standing on her post saying three lines while the player was at the far end
of the room. She crosses to `LIAISON_GREET` first now, and says nothing until she arrives.

`moveActor` walks to a fixed point and there is deliberately no "walk to the player" command — but
the tour always leaves the player at the Archive Room door, so a fixed point a stride east of it is
"to us" in every reachable case, including a skipped tour.

**The dialogue bar hides until somebody speaks** (`.hallway-dialogue.is-silent`). Both onboarding
scenes now open on a walk, and without this the player watches an empty box with a Skip button in it
for two seconds. `visibility`, not `display`: the Entrance Hall's copy of that bar is in normal flow
and collapsing it would reflow the room.

### 4. A follower finishes behind the leader, not inside them

`stepEscort()` closed the follower's last `gap` once the leader arrived, so both bodies ended on one
point. That was written for the Entrance Hall, where the walk ends in a doorway with the screen
already going black — and it was invisible there for two phases. The tour stops twice in a lit room,
and it read as the player standing inside the Director.

`done` moved with it, to `distance - gap`. An escort that stops short of a `done` it can never reach
holds `moveActor` open forever, which is a player locked in a room.

`snapActor` was fixed at the same time and for the same reason: it moved only the actor a command
named, so **a skipped escort stranded the follower**. It also has to read `command.follower` rather
than `hubScene.followsPlayer`, which skip never updates because skip never runs `moveActor`. Both
were latent until a second scene used a follower.

### 5. One blackout, and the scene owns its duration

`doorway-flicker` is a single cut, held, at 420ms. The arrival fade stays — it is the second half of
one transition, not a second transition — shortened to 320ms.

The 900 used to be written in three places (the keyframe, the scene's command, `DEFAULT_FADE_MS`) and
**the host read none of them**. `fade()` now writes `--scene-fade-ms` from `command.ms`, so the scene
is the one place the number lives.

### 6. The camera was never the problem

`updateHubCamera()` is untouched and stays a pure function of player position. What moved the screen
was `.hub-world { transition: transform 92ms linear }`: the camera is rewritten every frame, so the
tween only ever restarted, and it turned `render()`'s one-frame camera reset into a visible 281px
slide — which is why the room lurched at the exact moment a scene started, since `startHubScene()`
renders. `.hub-player` had the same tween removed for the same reason; the world was missed.

Deleting it is the whole fix. rAF callbacks run before paint, so the corrected transform was already
landing in time — only the tween made the intermediate state visible.

## What this deliberately did not do

- **No new cutscene command**, and no `focusCamera`. A scripted beat still moves characters.
- **No camera code.** Two things were _removed_ that were effectively moving it.
- **No art.** That is Phase 90B: the Director scene's backdrop and the lit doorways.
- **No change to Units 1–5 Voss lines**, the reveal ladder, or anything curricular.

## Verification

Unit 1761/1761 · lint 0 errors · `validate:content` clean · `build` clean. Serially:
`intro-sequence` (new, 5), `liaison-intro` (6), `meridian-reveal` (7), `hallway-onboarding` (7),
`boot-onboarding` (2), `hub-movement`, `dev-warp`.

**Visual regression moved no baselines**, which is the evidence that a pass this wide did not
re-lay anything.

Three assertions moved, all of them pinning behaviour this phase deliberately changed:
`escort-walk.test.js`'s follower endpoint and its `leaderDone`-before-`done` ordering,
`hallway-onboarding.spec.js`'s beat count (now pinned at 2 rather than a `>= 4` floor, so a
re-expansion fails too), and `meridian-reveal.spec.js`'s skip test — which asserted the prompt read
"Emery Voss" and now reads "Chronicle Navigation Table", because skip and watch finally agree about
where the player is left.

`tests/e2e/intro-sequence.spec.js` banks the manual pass and is the first coverage of `?warp=intro`,
which was the one dev warp no spec named.
