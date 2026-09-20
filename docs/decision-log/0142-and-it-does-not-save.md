# 0142 — And it does not save

**Phase 143 · 2026-09-20 · Accepted**

The structural audit of Phase 132 deferred two performance items about the movement loop, both with
numbers attached. Both numbers were measured this phase. **One item's premise does not hold at all,
and the other's headline figure is roughly double the truth.**

The premise that does not hold got a guard instead of a fix, because what the audit wanted changed
is already correct and the useful thing is to keep it that way.

---

## 1. The `saveProgress` debounce: the premise is false

The audit reported that `localStorage.setItem(KEY, JSON.stringify(next))` runs unthrottled on all
100 `save()` call sites "including once inside a rAF frame", and asked for a debounce.

Measured in the browser, instrumenting `Storage.prototype.setItem` filtered to the progress key:

|                                                               | save writes |
| ------------------------------------------------------------- | ----------- |
| **six seconds of continuous walking** (eight held-key bursts) | **0**       |
| one press of the Recall back link (the control)               | 1           |

The control matters — a probe reporting zero is worth nothing until it has reported something. It
recorded one write of a **1,217-byte** blob.

Reading the loop confirms it. `runFieldMovementLoop()` contains no `save()`. The one reachable from
it is inside `closeFieldDialogueOnMove()`, called under `if (moved && progress.activeFieldNpc)` —
and that function's first act is `progress.activeFieldNpc = null`, so the condition is false on
every subsequent frame. It is a once-per-event save, not a per-frame one.

So there is nothing to debounce on the path that would have mattered, the blob is 1.2 KB rather
than something large, and a debounce would have bought nothing while making the save schedule
harder to reason about. **Item retired.**

## 2. What it got instead

`localStorage.setItem` is **synchronous**. A save on the per-frame path serialises the whole
progress object and blocks the main thread on every frame of every walk — and it presents exactly
like a busy machine, which is the signal Phase 93 wrote `frame-budget.spec.js` specifically to stop
relying on.

So the invariant that file already asserts gains a sibling: **a per-frame path patches the DOM, it
does not render — and it does not save.**

**It needs its own counter, and that is the whole point.** A save touches no DOM, so the existing
`childList` MutationObserver on `#app` cannot see one. Demonstrated rather than asserted: with
`save()` inserted into `runFieldMovementLoop()`, both render cases **pass** and only the new case
fails.

```text
ok  walking a hub room costs no renders either
ok  walking the field costs no renders, and a deliberate exit costs one
x   walking the field costs no save writes, and a deliberate exit costs one
```

Watched fail at **22 and 24 writes** across a 600 ms walk, with the same live-counter control the
render case carries, because "assert something did not happen" is the one test shape that passes
when its own instrument breaks. And like the render count, **the save count does not depend on how
fast the machine is** — zero is zero at any frame rate.

## 3. The movement loop's real numbers

The owner declined the movement-loop caching work in the audit, and this phase does not revisit that
— it only measures, which changes nothing about how the game feels. The numbers are recorded so the
decision can be revisited on true figures rather than the audit's.

Instrumented over four seconds of continuous walking, then three seconds standing perfectly still:

| per second                   | walking   | standing still |
| ---------------------------- | --------- | -------------- |
| `querySelector`              | 1,021     | 366            |
| `querySelectorAll`           | 60        | 60             |
| `getElementById`             | 256       | 92             |
| **total DOM queries**        | **1,337** | **518**        |
| `getBoundingClientRect`      | 85        | 31             |
| player inline-style rewrites | 170       | **61**         |

- **The audit said "roughly 2,600 DOM queries/second". It is 1,337** — about half, which is the same
  proportion by which it overstated the tilemap cell count in `0131` (24,192 against a true 12,096).
- **Its forced-layout figure was right**: `getBoundingClientRect` at 85/second against a claimed
  ~90, from the read immediately after a style write.
- **Its claim about the two uncleared 30 Hz `setInterval`s is right**, and is the more interesting
  column. `updateFieldNpcs()` ends by calling `updateFieldPlayer()` and runs every 33 ms
  independently of the rAF loop, so the player node is patched at about 90 Hz while walking —
  170 attribute mutations a second across `style` and `data-facing`.
- **The idle column is the finding the audit did not report at all.** Standing still, doing nothing,
  the game still performs **518 DOM queries and 61 player style rewrites every second**. The
  interval cannot simply stop — NPCs patrol and wander, and that is what it is for — but the player
  half of its work is unconditional.

**Not changed, deliberately.** Skipping `updateFieldPlayer()` when the player has not moved is the
obvious economy and it is exactly the kind of change CLAUDE.md's "ground speed drives the walk
cycle" invariant is about: the idle body still breathes, and a body covering no ground is standing
rather than frozen. It touches movement feel, which the owner cannot personally playtest, so it is
theirs to call rather than mine to slip in beside a test.

---

## Verification

`npm run check` clean — 2,397 unit tests across 81 files, ESLint 0 errors and the same 5
pre-existing warnings, cspell, `validate:content` at 169 groups. `npm run build` clean. The three
`frame-budget.spec.js` cases pass; the new one watched failing at 22 and 24 writes with a `save()`
in the loop, and watched passing again on restore. No `apps/web/src` change in this phase, so no
baseline could move and none did.
