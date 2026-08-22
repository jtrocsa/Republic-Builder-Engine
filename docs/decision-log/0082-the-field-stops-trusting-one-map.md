# 0082 — The field stops trusting one map

**Phase 90D. Accepted 2026-08-22.**

Spine Review Part 6A — the field world. Findings and the play script are in
[`part-06-the-field-runtime.md`](../playtest/part-06-the-field-runtime.md); this records the four
decisions inside the fixes.

---

## 1. A rule declared on seven maps was enforced on one

`sourceAvailability()` decides whether a record can be pursued yet, and since Phase 70 it reads a
`requiresSourceId` the record itself carries. Seven maps declare one. The world marker asks it. The
Mission Tracker asks it. The NPC dialogue bubble asks it.

**Nothing that opens a record asked it.** The two places that do — `handleFieldClick`'s
`start-source-activity` and the field keydown handler's `source` branch — each carried a copy of

```js
activeFieldCaseId() === "case-001" &&
  openSourceId !== "taino-context" &&
  !hasEvidence("case-001", "taino-context");
```

which is the _display_ gate Phase 70 turned into data, left behind in its enforcement form and never
generalised. Five maps have shipped since, each declaring a gate none of them applied.

**Why it survived is the transferable part, and it is Part 5's finding again.** Both are a keyboard
path diverging from a click path; both survived because the click path was correct. In the hub, a
mouse skipped the broken sort. Here, a mouse has **nothing to click**: `fieldSourceSignal()` returns
`""` for a locked record, so no marker is drawn. That is the right presentation, and it is precisely
what hid this — it made the click-path copy of the literal unreachable, which made the gate look
enforced. `E` goes through `nearestFieldInteraction()`, which offers a record whether it is drawn or
not.

Only one record outside Unit 1 is both locked and anchored to an object rather than carried by a
person — the five NPC-anchored ones are reached through a bubble that has always checked — so
exactly one record in the game was actually open: **Richmond's price board**. That is not a
mitigating detail. It is the shape of the bug: a rule that holds by coincidence on six maps and
fails on the seventh is indistinguishable from a rule that works, right up until the map that breaks
it ships.

`refuseLockedRecord()` is the single reader now, and it writes the notice as well as refusing.

**The notice changed on purpose.** Unit 1's line — "The Spanish camp and map fragments will make more
sense after the village record is stabilized" — named the two records it was blocking and never said
where to go instead. The replacement is built from the prerequisite's own `sourcePoints` entry and
names the person or object to walk to, in the Mission Tracker's vocabulary, so it works on any map:
_"Village observation comes first. The checklist points to Taíno community elder."_ It also points
the player at the panel that was already telling them, which is better teaching than a sentence that
only ever existed for one case.

## 2. Three ways into a record, three copies of what that means

A record opens from its world marker, from the person carrying it, or with `E`. Each wrote its own
state changes, and they had drifted: on an already-secured record `E` set `activeActivitySourceId`,
which re-pins that finished mission as the Mission Tracker's in-flight block, where the marker's own
`open-source` does not.

That divergence is not a separate bug from the one above; it is the same one. Duplication is what
let the gate exist on one path and not the other, and a fourth entry point would have had a
one-in-two chance of inheriting either behaviour.

Two functions now — `openFieldRecord()` for a record already held, `beginFieldRecord()` for one
being started — and all three call sites use them. Neither checks proximity, deliberately: `E` is
already gated by `nearestFieldInteraction()`, and the click paths gate themselves first because a
marker can be clicked from anywhere on the map. `investigation-continue` is the one path that stays
its own, and correctly: it resumes a record already opened and already past the gate.

## 3. A button that named one case and emptied the save

```js
function resetCaseOneDemo() {
  const profile = progress.profile;
  progress = resetProgress(); // ← the whole save, all seven units
  …
}
```

The lines after it re-seeded `caseEvidence`, `unlocked` and `completedCases` for Case 1.01, which is
what made the shape read as deliberate. `CURRENT-REPOSITORY-AUDIT.md` describes this function as
"surgically resets only `case-001`-related fields while preserving `profile`" — a file whose stated
method is verification against source. That sentence has never been true. It is the third wrong
claim propagated by citation found in the repo this week; the other two were Unit 7's mission slate,
caught in Phase 89E because a test parses the primary table instead of restating it.

Case 1.01 stays unlocked and replayable all year, so the student most likely to press a button
labelled with one case is the one furthest from it.

**Made surgical rather than relabelled.** Part 5's precedent was to relabel a mislabelled reset
("Reset Unit 1 demo" → "Reset all progress"), and the same move here would have put a
_Reset all progress_ button on the Caribbean field screen, next to the Codex, where a student spends
their first hour. Everything a case owns except its evidence list is keyed by source id, so the
case's own source list is the entire key set and `resetCaseState()` is six lines. It deliberately
leaves `completedCases`, `unlocked` and `codex` alone: replaying the fieldwork is what the control
offers, revoking an earned badge is not, and the Codex is the one store designed to outlive the case
that filled it.

**One consequence to state plainly.** The crash-recovery screen's fallback markup uses the same
action, so its reset is narrower than it was. That is the better default on a screen whose job is to
be pressed in a panic, and a genuinely unrecoverable save still has "start new game" through the
chrome menu — but it is a change to a last-resort escape and should not be discovered later as a
surprise.

## 4. Two controls that both said "recall"

Part 5 routed this here. The in-world beacon plays the return warp, sets the arrival notice and lands
the player beside the Navigation Table. The back link said **"← Recall to Institute"** and ran
`home`, which cuts straight to the hall with no warp, no notice, and a spawn at
`safeInstituteSpawn()`'s default — the foyer entrance, seven tiles from where the beacon puts you.

The back link is the exit most players use: it is where every other screen in the game puts its way
out, and it holds still while the beacon scrolls with the map. So it is now the same action under
the same name, which CLAUDE.md's terminology section had already settled — the control is
**Recall to Archive**, and it lands beside the Navigation Table.

**The teacher-preview safety net moved with it.** `handleChromeClick`'s `home` branch has carried an
`exitPreviewIfActive()` guard since Phase 22 _specifically for this button_ — two archived audits
name it as one of the two independent ways out of a preview — so repointing the button without
moving the guard would have left a previewing teacher on the real institute screen with the session
still live. `home` keeps its own guard; it has other callers.

`warp-screens.spec.js`'s beacon test now scopes to `.recall-beacon`, because the bare action
attribute matches two elements. That is the change working, not a test worked around.

## What this deliberately did not do

- **No restructuring.** The two extracted functions are deduplication that _is_ the fix, in the same
  sense `nearestInReach()` was in Part 5 — not decomposition for neatness.
- **The beacon keeps acting from across the map.** It is the one world marker with no proximity gate
  and the one `E` never offers, which is inconsistent with doors, records and people alike. Routed to
  6B rather than changed here: now that chrome carries the same control the gate is safe to add, and
  it wants to be judged with the rest of the mission surface.
- **No content, no new systems**, no change to collision, reach radii, or any map.

## Verification

Unit **1806/1806** (17 new across `case-reset-scope.test.js` and `field-record-gate.test.js`) ·
lint 0 errors, 5 pre-existing warnings · `build` clean · full `test:e2e` serially.

New `tests/e2e/field-recall.spec.js` — three cases, each named for the finding it came from — plus a
Richmond case in `field-objective-tracker.spec.js` pinning the presentation of a locked record on the
map it was wrong on.

**Both new guards were confirmed failing against `ef6527c`** before being kept:
`hasEvidence("case-001", "taino-context")` appears twice in that revision, and `refuseLockedRecord`
zero times.

**Fifteen visual baselines moved** — every field surface — and all fifteen are the back link's one
word; the Caribbean's also carries the reset button's. Diffs were read on an outdoor map and an
interior before the rest were accepted. A sixteenth, `mission-debrief-record`, was rewritten by the
update and **reverted**: the two images are identical and differ by 316 bytes of encoder noise. It
had never been compared before, because its test aborts at the outdoor map above it — which is the
`--update-snapshots` trap, caught by reading `git status` rather than the reporter.
