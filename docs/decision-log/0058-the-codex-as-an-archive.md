# 0058 — The Codex stops being a satchel

**Phase 75 · 2026-08-02 · Accepted**

Phase D of the connected-missions redesign (`0055`), and the last of its four structural pieces.
`0056` gave a mission a Field Notebook. `0057` gave it a Debrief. This gives the course an archive.

---

## The problem

The Codex screen held one case's secured sources and said so in its own copy: _"Records filed on
this case."_ Leave the case and it emptied. Meanwhile the onboarding copy in
`chronicle-identity.defaults.js` has always promised the Archive's memory, and the whole premise of
the game is that a Chronicler preserves evidence so history can still be investigated honestly.

The gap was not cosmetic. **Nothing in Chronicle survived leaving a case.** A student finishing Unit
2 had no way to see that the question they had just answered on a Chesapeake landing was the
question they had answered on a Caribbean shore in Unit 1 — which is most of what an APUSH course is
for. Fifteen missions across five units played as fifteen unrelated exercises because the game had
nowhere to put the thing they had in common.

## The decision

`progress.codex`, keyed by `activity.id`: one entry per mission closed with a conclusion its
evidence could carry, kept permanently, across every case and every unit.

The screen keeps its `codex` id and both entry points and becomes three sections:

1. **This case** — the old satchel, demoted from being the whole screen to being the first part of
   it. Unchanged markup apart from its heading level.
2. **Filed records** — every filed mission, grouped by unit, in the order they were filed.
3. **Cross-references** — tags carried by two or more filed records.

### 1. The Codex records what you can defend

The filing gate is `isActivityComplete`, which for all four engines means the closer is both
_correct_ and _supported_ — the conclusion the record will bear, argued from evidence the player is
actually holding (`0056` §3). That is the Notebook/Codex distinction as a condition rather than a
slogan: the Notebook records what you find, and the bar for the Codex is higher by exactly the
amount `supported` adds.

### 2. An entry is a snapshot, and it never unfiles

The entry copies the conclusion, the kept evidence and the open questions at the moment of filing.
It is not a live view of activity state.

Two consequences, both deliberate. A player who afterwards reopens a mission and releases a notebook
entry does not watch a record vanish from the Archive — completion is an event, and un-establishing
what somebody established would teach the opposite of what the screen is for. And re-completing a
mission refreshes the snapshot while keeping the original `filedAt`, so the archive stays in the
order things happened to the player rather than the order they last touched them.

### 3. Tags are the only cross-unit mechanism, so a tag with one end is an error

`codexFiling.tags` are opaque strings — `engine/` never learns that "Who does the work" is a
labor-systems thread. A tag shared by two filed records is the single mechanism in the game that
connects a mission in one unit to a mission in another.

Which makes a tag used by exactly one activity two bad things at once: decoration, and — far more
often — a typo of a tag that does connect. Both fail silently; the archive just shows one fewer
thread than the author thought they had wired. So `tests/unit/activity-content.test.js` fails on an
orphan tag. If you are introducing a thread, tag both ends of it.

Six tags ship across the six authored missions, and all six span both units:

| Thread                     | Records |
| -------------------------- | ------- |
| Whose account is this      | 5       |
| What the record leaves out | 4       |
| Who does the work          | 4       |
| Written to persuade        | 3       |
| Who pays for the voyage    | 3       |
| Counting people            | 2       |

`seeAlso` is the stronger, explicit form: activity ids a record speaks directly to. It resolves
against **filed** records only, so a pointer appears the moment the player holds both ends of it and
never names a mission they have not reached. That silence is also why a typo here would never
surface at runtime, so a second content test checks every `seeAlso` names a real activity.

### 4. `fileToCodex()` hangs off `recordActivityOutcomes()`

`recordActivityOutcomes()` was already the single consumer of `activityOutcome()` and already runs on
every path that can complete an activity. Filing from there costs one call and one extra parameter
(the source id, which the caller already has), instead of a new hook on the closer that four engines
would have to remember to call.

`backfillCodex()` runs once before the first render and files whatever a save already qualifies for.
Every save in the wild finished its missions into a key that did not exist; this makes them whole
without a versioned migration, and re-running it is a no-op. It saves **only on a real change** —
an unconditional write would bump `lastSavedAt` every boot, which is the field
`progress-repository.js` resolves remote-versus-local conflicts with.

### 5. `progress.codex` needs a merge-list entry, not just a default

`readProgress()`'s spread is shallow, so an object-valued key with a `DEFAULT_PROGRESS` entry and no
line in the named merge list is replaced wholesale by whatever the save holds. That is invisible
while the default is `{}` and silently wrong the moment it is not. Both were added; the e2e spec
reloads the page specifically to pin it.

---

## What this is not

- **Not a new screen.** Same `codex` id, same two entry points, same `return-codex` routing. A
  screen id is save currency (`0055` §4).
- **Not a rewrite of the satchel.** Section 1 is the previous screen's markup with its card headings
  moved from `h2` to `h3`, because it is now a section of a document rather than the document.
- **Not a teacher-facing surface.** Grades and submissions have their own pipeline. The Codex is the
  student's own record of their own work.

---

## A tie is the normal case, not an edge case

`codexEntries()` sorts by `filedAt`, oldest first, because the Codex is a career: the order you
established things in is the order they happened to you, and re-sorting by unit would hide a second
unit reopening a question from the first.

It shipped with a **title** tie-break, which was wrong in a way only a slow machine showed.
`backfillCodex()` files a whole save inside one loop, so every record it writes carries the same
millisecond whenever the machine is quick enough — a tie is the _normal_ case for a backfilled
archive rather than an edge one. On a loaded run the two timestamps separated and Unit 1 came first;
on a fast one they collided and the title sort put a Unit 2 wharf ledger above a Unit 1 interview,
because "One Hogshead" sorts before "The Question Nobody Asked".

The tie-break is now curriculum order — unit, then case, then activity id. When the timestamps
genuinely cannot say what order the player worked in, the order the course goes in is the only
honest answer.

Found by a visual baseline coming back with the two records swapped, which is the second time in
three phases that a shot below the fold has caught something no assertion was looking for.

## Measured, not reasoned about

`.codex-head` was 641 pixels wide — the width of the words "The Codex" — and sat 229 pixels right of
everything beneath it. A grid item with `margin: auto` does not stretch: the auto margins beat
`justify-self: stretch` and size it to max-content. Invisible while the screen was one centred grid;
a misalignment the moment it became a document. Found by reading `getBoundingClientRect()` in the
browser, not by reading the file — the same way the two dead dialogue-bubble rules in `0052` were
found.

---

## Known outstanding

- **The four engines write findings of very different lengths.** The Codex is the first screen that
  puts all four side by side, and it shows: INTERVIEW's findings are one quoted answer each,
  TRACE's are the leg's whole `why` paragraph, so a filed TRACE record runs three times the height
  of a filed INTERVIEW. `traceFindings()` shipped in Phase 72 and drives the Field Notebook too, so
  changing it is a Phase B behaviour change, not a Codex one. The real fix is for TRACE to declare a
  `notebook` capacity so the player picks the legs they will stand behind — which is a gameplay
  change to a shipped mission, and belongs with the per-engine variant work.
- **The case number is still missing from four of five units' eyebrows** (`0057`). The Codex record
  falls back to the case _name_ rather than printing nothing, so Riverbend's entry reads "The
  Riverbend Settlement · The Trace" where Case 1.01's reads "Case 1.01 · The Interview". Reasonable
  either way, and still a content decision about whether Units 2–5 number their case titles.
- **`tests/**` had no ESLint config block**, so the filesystem scan added in `0057` failed
  `no-undef` on `process`. Added here rather than left, because it broke the lint gate.
