# 0145 — A body that moves does not wait

**Phase 146 · 2026-09-20 · Accepted**

Phase 145's full-suite run before the push came back **404 passed, 1 flaky**. The flaky one was
`character-directions.spec.js`'s _"settlement-carpenter is reachable on foot and talks"_: the walk
reported success, `E` was pressed, and `.field-speech-bubble` never appeared.

It is the defect `0127` §5 already found and fixed, at four call sites its fix did not reach —
because that fix was scoped in prose to the wrong half of the cast.

---

## 1. What `0127` §5 said, and the half of it that was wrong

`walkTo` promises exactly one thing: the target was in reach **at one instant**, the frame the game's
own `.is-near` appeared. Every caller then does something that re-asks — `E` through
`nearestFieldInteraction()`, a click through `isNearFieldNpc()` — which is correct of the game, since
a control the player cannot reach must refuse.

`0127` measured this on the Taíno child, who wanders a 1.2-tile disc, and fixed it with
`openFieldNpc()`: walk and press as one operation, retried, with the bubble as the answer because
only the game can say whether a press landed.

Then it wrote down the scope:

> Use it for a `wander` body; a stationed one does not need it and converting those would be churn.
> …Three call sites need it, all three the same child.

That sentence divides the cast in two — the child, and stationed people — and **there is a third
kind**. `kind: "route"` walks a leg between authored stops, and it covers more ground than a
wanderer does:

| body                 | kind     | how far it travels                                     |
| -------------------- | -------- | ------------------------------------------------------ |
| Taíno child          | `wander` | 1.2-tile radius — **the body the fix was written for** |
| Powhatan woman       | `route`  | 2.69-tile leg                                          |
| Powhatan man         | `route`  | 3.35                                                   |
| settlement burgess   | `route`  | 4.61                                                   |
| settlement carpenter | `route`  | **7.52**, barn yard to bench                           |

Every one of them moves further between the walk and the press than the child does, and all four
were being walked to and then pressed. The carpenter — the longest leg in the table — is the one
that flaked.

## 2. The margin, measured

The reach is `1.45` tiles (`isNearFieldNpc`). The walker stops the instant `.is-near` appears, which
for a body walking **toward** the player can be right at the boundary. Over eight runs the carpenter
was reached at between **0.59 and 1.448 tiles**.

At 1.42 that is **0.03 of a tile of margin**, and `FIELD_NPC_SPEED` is 1.35 tiles/second — so he
walks out of it in about **twenty milliseconds**. The interval between `walkTo` returning and the
press landing is a CDP round trip, which on a loaded worker is comfortably longer than that.

Demonstrated causally rather than inferred, by inserting the delay that load would add:

| added delay | drift observed               | press refused |
| ----------- | ---------------------------- | ------------- |
| 0 ms        | 1.448 → 1.448                | 1 of 3        |
| 100 ms      | 1.366 → 1.503, 1.378 → 1.572 | 2 of 3        |
| 250 ms      | 1.400 → 1.165                | 1 of 3        |
| 500 ms      | 1.312 → 1.908                | 1 of 3        |

He does not always drift away — sometimes the leg is carrying him toward the player, which is why
250 ms fails less often than 100 ms does. That is the signature of a body on a route rather than of
a slow machine.

## 3. The fix, and the A/B

`openFieldNpc()` at all four sites. A/B with **both arms in one file and one window**, so the load
either arm saw is the load the other saw, and with the delay inside the operation the fix makes
atomic so the fix is not handed an easier window:

> **BEFORE: 4 refusals in 12. AFTER: 0 in 12.**

`character-directions.spec.js` pressed `E` and now clicks, via the helper. That loses nothing: this
spec's subject is that a body is reachable on foot and answers, and the `E` path keeps its coverage
in `field-source-anchors.spec.js` and `field-dialogue-lifecycle.spec.js` — both on **stationed**
bodies, which is the only place that assertion is sound anyway.

## 4. The guard is static, because the failure is not reproducible on demand

`0127` already established the rule here: **do not verify a walker fix with the suite.** A window of
hundredths of a tile reproduces a few times in a few dozen runs and then not at all, so a spec that
tries to catch this catches the machine instead.

So `tests/unit/walked-bodies-do-not-walk-away.test.js` asks the question statically: **every
`walkToNpc()` id in the e2e suite names a body that is `kind: "station"` on every surface it is
posted on.** It reads `main.js` as source text, the same way `field-map-coordinates.test.js` does and
for the same reason — the behaviour tables are object literals in a browser entry point, not exports.

Its failure message names the consequence rather than the fact, per the convention:

> walks to "settlement-carpenter", which is posted route and so can walk out of reach between the
> walk and the press that follows it — the walk would report success and the press would be
> refused, intermittently and only under load. Use openFieldNpc(page, "settlement-carpenter")
> instead, which makes the two one operation.

Watched fail on all four bodies. It also rejects a `walkToNpc` call built from a variable, since an
id it cannot resolve is one it cannot vouch for — which is how it caught the throwaway probe written
to measure §2.

**One detail it got wrong first, and it is the reusable one.** The first version searched the whole
file for a `"<id>": {` key at two spaces of indent, and reported Emery Voss as not stationed. She is
stationed on all nine of her postings; the match was `HUB_TARGETS.liaison`, her hub marker, which
carries no `kind` and is not a field posting at all. The lookup is scoped to the eighteen
`*_BEHAVIOURS` tables now. `walkToNpc` is a field helper and those are its tables — **a guard that
searches more widely than its subject finds things that are not its subject.**

## 5. What this is not

**No player-facing defect.** A player who walks up to the carpenter and presses `E` as he steps away
gets nothing, and that is the designed behaviour: the reach prompt disappears with `.is-near`, so
the screen has already said he is out of range. `E` with nothing in reach is silent on purpose —
otherwise walking a map while tapping `E` would write a notice on every step.

**No world change.** The carpenter's 7.52-tile leg is the point of him; a village whose people stand
still is the thing Phase 61 fixed.

**No change to `walkTo`.** Making it overshoot past `.is-near` would touch every walk in the suite to
fix four call sites, and `0127` already chose the shape: the walk and the press are one operation.

---

## Verification

`npm run check` clean — **2,409 unit tests across 83 files** (2,400/82 before). The two converted
specs, `character-directions.spec.js` and `unit-02-activities.spec.js`, **16 passed** together. The
new guard watched fail on all four route bodies and on the variable-id call. No `apps/web/src` file
is touched by this phase, so no visual baseline can move.
