# Cutscene and Dialogue Conventions

What a scripted scene may do, what it must clean up, and how the two institutes are allowed to
speak.

Written in Phase 78 alongside decision log `0061`. The cutscene system described in §3 **does not
exist yet** — it is Phase 81C work. §1 is an audit of what is actually there today, and it is short
on purpose: knowing exactly how little exists is what stops Phase 81C building a second one beside it.

---

## 1. What exists today

**There is no cutscene system.** There is one hard-coded scene and a set of reusable parts.

| Part                              | Where                                                                       | Reusable?                       |
| --------------------------------- | --------------------------------------------------------------------------- | ------------------------------- |
| `hallwayScene`                    | `main.js` — a four-phase machine: `idle` / `talking` / `escort` / `flicker` | No. Welded to the Entrance Hall |
| `createEscortWalk` / `stepEscort` | `engine/escort-walk.js` — pure, DOM-free two-body walk                      | **Yes**                         |
| Intro typewriter                  | `main.js` — per-line reveal, tap-to-skip, continue indicator                | **Yes**                         |
| `isHubInputLocked()`              | `main.js` — three call sites                                                | **Yes.** The one input lock     |
| Portraits                         | `CHARACTER_SHEETS[key].portrait` — every character has one                  | **Yes**                         |
| `prefersReducedMotion()`          | `main.js` — live, uncached                                                  | **Yes**                         |
| Doorway fade                      | `@keyframes doorway-flicker`, `steps(1, end)`, driven by `animationend`     | **Yes**                         |
| Four-direction facing             | `engine/sprite-animation.js`                                                | **Yes**                         |
| Pathfinding                       | `findRoute()` over the map's walkable cells                                 | **Yes**                         |

**Input reality, stated plainly.** Keyboard and pointer are supported. There is **no gamepad
support anywhere** in the codebase, and touch is a single app-level `pointerdown` handler — taps
work, but there is no on-screen movement control. A cutscene must therefore be skipped and advanced
by **keyboard and pointer**. Do not write a requirement for controller support into
Phase 81C; that would be inventing a mode the game does not have.

### The one architectural lesson from the scene that exists

The Entrance Hall escort works by **writing to the objects the ordinary loops already read** — the
Director's own behaviour state, and `instituteMovement` itself. The follower _is_ the player body,
so the camera pan is free.

That is the rule for every future scene:

> **A scripted beat moves characters. It never moves the screen.**

The camera stays a pure function of player position. A cutscene that reaches for the camera directly
breaks an invariant three phases depend on, and there is no scene worth that.

## 2. In-engine only

No pre-rendered video, ever. Scenes reuse maps, sprites, facing, walk paths, portraits, fades,
sound cues and the existing dialogue surfaces. This keeps the download small and — more importantly
— keeps cutscenes looking like the game rather than like an interruption of it.

## 3. The command set

Phase 81C should generalise `hallwayScene` into a small timeline the content declares, rather than add
a second bespoke machine beside it. **Only commands a scene in §5 actually needs may exist.** A
command set built from imagination will be half dead code within a phase — the same finding as the
unreachable `fallback` lines and the never-printed `note` fields in Phases 71 and 72.

Justified by the scenes below:

| Command                    | Needed by        |
| -------------------------- | ---------------- |
| `fade`                     | A, C, D, F, G    |
| `moveActor` (walk a route) | A, D, E          |
| `turnActor`                | A, B, C, D, E, F |
| `say` (portrait + line)    | all              |
| `highlightObject`          | B, E             |
| `playSound`                | B, D, G          |
| `setFlag`                  | all              |
| `returnControl`            | all              |

`focusCamera` is deliberately **absent**. Every scene here stages itself by moving bodies, per §1.
If a scene genuinely cannot be told that way, that is the moment to discuss adding it — not before.

The engine holds no subject facts, the same rule the activity engines follow: a command names an
actor id and a line of content, never a historical fact.

## 4. Requirements

Every cutscene must:

- **Be skippable**, at any point, by keyboard and pointer.
- **Be replayable** — from a fourth Codex section (§6).
- **Leave the save valid.** A scene interrupted by a reload must not resume into a locked player.
  The shipped precedent is right: a save left mid-scene in the Entrance Hall **replays the scene
  from the top** rather than resuming into a locked body and a dead typewriter.
- **Restore control through one path.** Skip and natural completion must run the _same_ teardown.
  Two teardown paths is how a skipped scene leaves the player frozen.
- **Respect `prefersReducedMotion()`** for fades and camera-adjacent motion.
- **Say one idea per box.** Short lines. No paragraph in a bubble.

### Teardown checklist

Anything a scene locked, it unlocks. Derived from invariants that have each broken at least once:

1. `isHubInputLocked()` returns false again — **the one lock**. Do not add a second lock concept
   checked at an overlapping subset of the three call sites.
2. The "Press E" prompt is cleared. Anything that locks movement must also suppress the prompt, or
   it hangs there offering an interaction that is already happening.
3. NPC behaviour state is returned to its ordinary loop; no actor is left mid-route.
4. Any `requestAnimationFrame` handle and any timer is cancelled — `hallwayScene` cancels both, and
   a scene that forgets leaves a loop running against a screen that is gone.
5. The player's facing and position are coherent, and their walk cycle matches their real ground
   speed. Passing a default speed to a body moving at a scripted speed runs its legs at the wrong
   rate — the `updateInstitutePlayer(speed)` lesson.
6. The narrative flag is written **before** control returns, so a reload cannot replay a scene the
   player has finished.

## 5. The seven scenes

Placement adapts to final unit pacing. Purpose does not.

**A · Field Liaison introduction.** Establishes Emery Voss as the practical helper, distinct from
the Director's institutional authority. Reinforces the Navigation Table and Field Notebook _without_
repeating the tutorial. Competence shown through action, never a biography speech.

**B · First unexplained recognition.** Voss identifies a temporal mark or device before Chronicle's
analysis is finished, and covers it naturally. Must read as innocent on a first viewing and obvious
on a replay — which is the whole reason replay exists.

**C · Evidence withheld.** Chronicle orders an anomaly sealed. Voss asks why evidence must be hidden
rather than preserved. The Director gives a defensible institutional answer. Neither sounds evil,
neither sounds correct.

**D · Meridian reveal.** Voss has been working with Meridian; some early interventions were
deliberate. Plain language, no monologue. Betrayal and disagreement carry equal weight. The core:

> Chronicle taught us how to enter the past. Then it decided that only Chronicle could be trusted
> with what we found there.

And, from Voss, without being asked:

> I helped people. I also changed lives I never meant to touch.

**E · Client operation.** The point where Meridian's humanitarian argument has been bought. A
beneficiary tries to purchase a historical outcome. Gives Voss a credible reason to break with
Meridian's leadership — without implying every Meridian member agrees with the client network.

**F · Chronicle disclosure.** Chronicle concealed evidence about the Original Drift and its
containment. The Director's reasoning stays understandable even as the secrecy is condemned. Voss is
not allowed a clean moral victory here.

**G · Final record decision.** The ending turns on the evidence: controlled, destroyed, selectively
released, or preserved openly. The conclusion is about historical thinking, not institutional
loyalty.

> History must remain open — to evidence, questioning, disagreement, and revision.

## 6. Replay lives in the Codex

A fourth section beside **This case**, **Filed records** and **Cross-references**.

This reuses the screen, both entry points and the established section pattern, and it fits the
Codex's stated job: the Codex preserves what the player can defend, and a scene the player witnessed
is a record of what they saw. It is also the surface a player already returns to for cross-unit
memory, which is exactly the audience for a replay.

A scene becomes replayable only once seen. Never list an unseen scene — the same rule `seeAlso`
already follows, resolving against filed records only so a pointer never names something the player
has not reached.

---

## 7. Dialogue

Plain, concise, and specific. New terminology must earn its place; see `CHRONICLE-CANON.md` §8 for
the banned list, which `tests/unit/chronicle-canon.test.js` enforces.

**The Director** — precise, controlled, protective, sincere. Reluctant to explain uncertainty.
Admits difficult truths only when continued secrecy becomes impossible. Never smug, never cruel, and
never a villain reading his own indictment.

**Emery Voss** — direct, observant, less formal. Comfortable saying she does not know. Responds to
historical suffering as suffering. Persuasive without always being right. Increasingly divided
between the player and Meridian.

**Historical characters** stay in their own voice. No fourth-wall commentary, no repeated "this is
dramatized" disclaimers inside a conversation, and no modern educational narration from a period
figure's mouth. The debrief's `historicalRecord` bands are where the game says which parts were
invented — that work is done, and it does not need doing again inside the scene.

### Don't

- _The temporal integrity of this unstable anchor is collapsing._
- _We must restore the one true timeline._
- _The quantum record has become corrupted._

Long speeches that explain every rule at once, and any sentence stacking three lore terms before
naming the academic task.

### Do

- _The Codex preserved one version of this page. The archive now contains another. Someone changed
  it._
- _We know what Chronicle recorded before the change. We still have to work out what happened here,
  and what the evidence will support._

And once the concept has been taught, stop teaching it:

> The Codex and the archive no longer match.
