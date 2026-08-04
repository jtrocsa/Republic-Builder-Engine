# Part 0 — Unblock and instrument

**Closed 2026-08-03.** Triggered by an owner report rather than a play script: _"the mission tracker,
notebook, and quest one are not working."_

## Scope

- `trackedFieldActivity()` / `fieldTrackerMissionBlock()` / `pickTrackedActivity()` — `main.js`
- `progress.activeActivitySourceId` — its five write sites and three readers
- `engine/activities/interview.js` — `actInterview`, `interviewFindings`, `interviewCoverage`
- `DEV_WARPS` / `applyDevWarp()` — `main.js`, new
- Specs: `field-objective-tracker`, `activity-engines`, `field-notebook`, `mission-debrief`, `dev-warp`

Part 0 fixes only what was reported, does not audit the field, and does not open Part 6 or 7 early.
Everything else it tripped over is written down below and routed, not fixed.

## How it was reproduced

Static trace first, then a throwaway spec (since deleted) that walked the genuine first-mission path
with NPCs visible and screenshotted each beat — `visual-regression.spec.js` hides `.hub-npc` and
`[data-npc]`, so nothing in the committed suite covers what that walk actually looks like.

## Findings

| id   | sev · cat         | finding                                                                                                                                 | outcome                                                         |
| ---- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| P0-1 | S1 · broken       | The Mission Tracker's in-flight block named a case's **first** started record for the rest of the case                                  | fixed                                                           |
| P0-2 | S1 · broken       | "Open the Field Notebook →" carried that same first record's id, so it reopened a filed mission                                         | fixed (same cause)                                              |
| P0-3 | S2 · broken       | Logging a non-`useful` interview answer prints "✓ In your Field Notebook" and the answer never reaches the notebook                     | **→ Part 8**, needs an owner decision                           |
| P0-4 | S3 · rough        | The Codex aside clips its text and its "Open Codex" button at a 1280px viewport; baselines are banked at 1366×768 so nothing catches it | → Part 6                                                        |
| P0-5 | S3 · inconsistent | The chrome eyebrow still reads "REPUBLIC BUILDER ENGINE"                                                                                | → the known branding cleanup in `CLAUDE.md`; not this program's |

### P0-1 / P0-2 — one cause, two symptoms

`trackedFieldActivity()` iterated `sourcesForCase()` and returned the first entry with any activity
state, never reading `progress.activeActivitySourceId` — which exists in `DEFAULT_PROGRESS` for
exactly this purpose and was already resolved correctly by `activityScreen()` and
`handleActivityAction()` one screen over.

Case 1.01's source order is fixed by content (`taino-context` → `columbus-letter` →
`waldseemuller-map`), so from the first click on the elder onward the progress line locked to
"✓ Filed", the bar to 7/7, the in-flight row to the interview's name, and the notebook button to
`data-source="taino-context"` whatever the player was actually working on.

The fix is a resolution rule rather than a lookup, because the field is deliberately nulled on
`open-activity-source` and `mission-debriefed` — so "whatever is open" is only an answer some of the
time. Three tiers, in `pickTrackedActivity()`: the open record, else the first unfinished one, else
**the last** one (not the first — with everything filed, the useful notebook is the one they were
most recently in, and that tier is why the function reports a finished activity at all).

Extracted and exported so the ordering is testable without a map, a save or a DOM. Both new e2e cases
were confirmed to fail against the old code and pass against the new.

### P0-3 — the one thing Part 0 found and deliberately did not fix

`interviewFindings()` drops any logged answer whose `useful` flag is not set, so it never reaches the
Field Notebook panel. `actInterview`'s `log` verb accepts it anyway, and the inline panel replaces the
button with **"✓ In your Field Notebook"**. The UI states something that is not true.

It lands on the first interaction of the game's first mission: the elder's first question chip is
"Where is the gold?", whose answer is authored flat on purpose (the file header records that
`taino-elder:gold` is kept deliberately, to key one of the audit's optional observations). So a new
player asks, logs, sees a ✓, and watches the tracker stay at 0/7.

Not fixed here because every available fix is a design decision that reaches shipped content in two
units and the cross-activity evidence link:

1. Refuse the `log` verb for a non-useful answer — but `handleActivityAction` returns silently on a
   refused verb, so this trades a false claim for a dead button.
2. Withhold the log control for a non-useful answer, exactly as it is already withheld for a
   `fallback`. Makes a deflection read as the pointer it is ("Ask her") rather than something to
   collect.
3. Let the notebook show everything logged, marked for what counts. Changes what
   `interviewTokens()` feeds DISCREPANCY's evidence column.
4. Leave the behaviour and fix only the words.

Option 2 is the closest fit to rules the engine already holds, but it is the owner's call.

## Instrumentation

`?warp=<name>` — dev-only fast travel into a named save state, so a review pass starts where it
starts instead of replaying the intro, the escort, the tour and a case selection first. Six states:
`intro`, `hall`, `hub`, `table`, `field`, `mission`. The shapes are the ones
`tests/e2e/helpers/progress-seed.js` already seeds; this only puts them in reach of a human.

Gated on `import.meta.env.DEV` exactly as `dev-fake-teacher` is, and **verified absent from the
production bundle** rather than assumed — it resets the save, which is not something a student's URL
should be able to do. `dev-warp.spec.js` guards it, because a warp that silently stopped landing where
it claims would look like a defect in whatever part was being reviewed.

## Close-out

Fixed P0-1 and P0-2 in one commit with unit and e2e guards. Built the warp. Routed P0-3 to Part 8 as
an open owner decision, P0-4 to Part 6, and P0-5 out of the program.

`main.js` is **13,588 lines** (`wc -l`) at close. Note for future counts: PowerShell's
`Measure-Object -Line` under-reports this file by ~340; use `wc -l`.
