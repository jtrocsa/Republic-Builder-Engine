# 0051 — Four activity engines, and Unit 1 rebuilt on three of them

**Phase 68.** Supersedes nothing; implements the vocabulary named in `0050` and
`docs/design/MISSION-ACTIVITY-CATALOG.md`.

## Context

Fifteen missions across five units had converged on one shape: walk to a ✦, read the thing, write a
paragraph. `0050` named the kinds of activity that could replace it. The obstacle to building any of
them was not the catalog — it was that Chronicle's three existing bespoke activities were each
**welded to one source id**:

```js
function mapJigsawScreen() {
  const source = sourceById("waldseemuller-map");
```

Three screens (`village-activity`, `columbus-activity`, `map-jigsaw`), three sources, zero
parameters. Every other source in the game — 21 of them, all of Units 2–5 — carried
`activityRoute: null` and fell through to the same paragraph box. So the work was never "add a
fourth activity"; it was replacing three welded screens with one host and a registry of engines that
take content as an argument.

## Decisions

### 1. The engines live in `engine/activities/`, and that is the transferability claim

The owner's requirement was explicit: _"These need to be replicable and transferable if we ever
create another game in a different subject."_ `engine/` is the folder whose stated rule is **no
subject-specific facts**, so putting the engines there is the requirement, restated as a location.

Four engines, each a Zod **content contract** plus pure functions:

| Engine        | The player…                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `INTERVIEW`   | asks people who answer only what was asked, and differ from each other    |
| `ASSEMBLY`    | rebuilds a broken thing; a wrong placement is informative                 |
| `DISCREPANCY` | checks a record against what they saw, then calls the gap error or design |
| `TRACE`       | follows one thing through nodes, logging what changes at each             |

The registry (`engine/activities/index.js`) is deliberately the same small shape as
`quest-types/index.js` — an object literal and a throwing lookup, not plugin discovery.
`act(activity, state, action)` is a **pure reducer**, which is what makes all four testable without
a browser.

Renamed from the proposal's `TESTIMONY`/`ROUTE` at the owner's request, so all four name what the
player does. These keys are also main.js's screen ids and content's `activityRoute` strings, so a
future rename is a save-compatibility change, not a refactor.

### 2. One host screen, and the record it is about is persisted

`activityScreen(kind)` renders any registered engine; the screen id **is** the engine key, resolved
before `render()`'s switch so a fifth engine needs no case label.

Which record the activity is about comes from a new `progress.activeActivitySourceId`. This is the
piece the three welded screens got for free by hardcoding a source apiece — `openSourceId` is
module-local and dies with the page, so without it a reload into a generic host has nothing to open.

Activity controls dispatch on their own `data-activity-action` attribute rather than main.js's
global `data-action`. The engines use short generic verbs (`place`, `file`, `select`, `log`) which
would otherwise have to be unique across every screen in the game.

### 3. INTERVIEW runs on the map, not on a screen

The registry has one optional slot, `renderInline`, and only INTERVIEW implements it: its question
chips render inside the **field dialogue bubble**, so questions are put to people where they stand.
This is the answer to the owner's first note — that the visual weight of a mission should come from
the world as well as the interface.

Two consequences that had to be solved rather than tolerated:

- **The speaker's ambient line gives way once they have answered.** Keeping both stacked a name,
  three lines of ambient text, an answer and four chips into one bubble — 319px, taller than the
  field viewport can show above _or_ below a speaker anywhere on the map.
- **The bubble flips under the speaker when there is no room above**, and the decision is
  **measured** in `placeFieldDialogueBubble()`, not estimated. An estimate that runs a little low
  silently reintroduces the clipping. It reads layout and writes one class; it never touches
  `fieldCamera`, which stays a pure function of player position.

### 4. Cause and effect lives in the evidence, not in the events

DISCREPANCY's observation column is gated: an entry may declare `requires`, an opaque token the host
resolves against `interviewTokens()` — every question this player actually put to somebody. A
student who asked different people audits Columbus's letter holding different evidence, and an
observation they never gathered shows as a hole rather than being handed over.

This is `0050`'s record-only rule paying off rather than constraining. Nothing about 1493 changes;
what changes is what the Chronicler can bring to the reading.

### 5. TRACE ships without content

The owner's call: _"we don't need all four engines in each map so it's okay if trace isn't in map
1."_ Unit 1's Caribbean runs INTERVIEW, ASSEMBLY and DISCREPANCY on its three existing records.
TRACE ships as engine, schema and tests; its first mission is Canal Crossroads (`M4·C One Ton to New
York`). Its unit tests deliberately cover the renderer as well as the reducer, because nothing else
exercises it yet.

### 6. No new art, and the reason

The plan budgeted a PixelLab pass for activity-panel material and per-engine iconography. Only the
second was built, and as **inline SVG** — matching `DIRECTOR_REVEAL_ICONS` and the cursor in
`global.css`, the project's documented convention for small UI chrome, and the reason there is no
icon-asset pipeline to add four PNGs to.

The panel material was deliberately **not** generated. The agreed direction from the UI material
study is material and depth _at the token layer_, repo-wide; a pixel-art frame on three screens and
nowhere else would have made the activities inconsistent with the Archive, the field channel and the
mission screens. `--activity-grain` is wired and defaults to `none`, so that pass can fill it later
without touching any of this. Unit 1's three missions needed no new characters, objects or map
changes, and none were generated.

## Consequences

- `VILLAGE_OBSERVATIONS`, `MAP_PIECES` and `MAP_TRAY_ORDER` are gone from `main.js`; that content is
  authored in `content/activities/unit-01-activities.js`.
- 558 lines of CSS belonging to the three retired screens were removed.
- `validate-content.js` gained a schema group and a cross-reference check that a source's
  `activityRoute` and its activity's `kind` agree — a mismatch is invisible to both schemas and
  sends a student to a screen that bounces them straight back to the field.
- A save left on `village-activity`/`columbus-activity`/`map-jigsaw` resumes in the field; an
  activity in flight restarts. Secured evidence lives in `progress.caseEvidence` and is untouched.
- Three visual baselines were retired and three added.

## Two things this pass got wrong first, recorded because both are easy to repeat

1. **A scoping leak.** `.activity-shell` and `.activity-board` are shared with the practice check,
   the Archive Challenges shell and non-map missions. Adding `display: grid; gap: 22px` to
   `.activity-board` re-laid every quest list in the game, accumulating 22px per item down the page.
   Both are now scoped by `.activity-shell[data-activity-source]`. **Any new rule on those two class
   names must be scoped.**
2. **A comment-eating strip script.** The script that removed the retired screens' CSS treated the
   comment above a rule as part of its selector, so `.quest-choices` was dropped because its comment
   _mentions_ `.choice-stack`. Caught by the visual baselines. If a similar sweep is ever needed,
   diff the full selector set before and after — that is what found it.

## Not done here

- **The Archive Room stays paused**, including `0050` §1's required→optional gate inversion at
  `main.js`'s `unitReadyForReview`.
- **No new dependency.** Not inkjs: INTERVIEW's answers are content lookups over a flat matrix, not
  a dialogue runtime.
- **No NPC substrate fields** (`topics`/`want`/`stance`/`knows` from catalog §3). M1·A holds its
  answers in activity content, so the 70-NPC authoring bill was not incurred.
