# 0104 — The case number was never a content decision

**Phase 105 · 2026-08-31 · Accepted**

Twenty-four of the twenty-seven missions had no case number on any screen that shows one, because
`caseNumberLabel()` read the number off a title prefix only Unit 1's three titles carry. It derives
the number from the case's position now, and all twenty-seven have one.

Closes Spine Review **P10-5**, open since 2026-08-23, and the activity-eyebrow item that had been on
the quickref's known-outstanding list beside it. They were the same defect measured on two screens.

---

## 1. What it looked like

A mission kicker is `[caseNumberLabel(kase), unit.period]`. Unit 1's read
**"Case 1.02 · Period 1 · 1491–1607"**. Every other unit's read **"Period 4 · 1800–1848"** — the
period alone, with nothing to say which mission of the three you were in.

The same empty string reached five other places, and because each of them has a sensible fallback of
its own it produced five different-looking screens rather than one recognisable bug:

- the activity eyebrow carried the engine's name with nothing in front of it — "The Interview"
  where Unit 1 gets "Case 1.01 · The Interview";
- a Codex entry was labelled with its **mission's name** in Units 2–8 and its **number** in Unit 1,
  so one player's archive listed the same kind of thing two different ways;
- a teacher's Manage Content row fell back to the map's place name;
- two Manage Content headers fell back to the same.

**A per-unit convention with a sane fallback and no test.** That sentence is in `CLAUDE.md` because
this repository keeps paying for it, and this is another instance: nothing failed, for many phases,
on twenty-four of twenty-seven missions.

## 2. Why it stayed open for eleven phases

P10-5 was routed to the content queue, and the routing note says why: the fix is to number Units 2–7's
case titles or to stop the eyebrow trying, **and both are content decisions**. That is true of both
options as stated, and it is why the item sat — a content decision needs an owner, and the owner had
not made one.

The options were wrong. Numbering twenty-four titles by hand and giving up on the number are only the
two available moves **if the number has to be authored**, and it does not. A case's number is its
unit's number and its own position within that unit, and `caseNumberLabel()` is handed the case and
already has `unitForCase()` sixty lines above it. Nothing about it was ever a content decision; it
was a lookup that had not been written.

Worth naming as a habit, because I do not think this is the last one: **when a defect is routed as a
decision, check that the options it was routed with are the only options.** A queue entry records
what somebody could see at the time.

## 3. What changed

`caseNumberLabel()` finds the case's unit, takes its index within that unit's `cases`, and returns
`Case ${unitNumber}.${index + 1}`. Empty only for a case in no registered unit — which is a case no
screen can reach.

**Unit 1 keeps its authored prefixes**, and that is deliberate rather than laziness. `splitCaseTitle()`
still has to strip `"Case 1.01 — "` so the mission's _name_ comes out clean for
`resolvedCaseName()`; rewriting three shipped titles buys nothing; and leaving them buys something
real. The number is now stated twice in the repository from two independent directions — once as
content, once computed from position — and `tests/unit/main-case-numbering.test.js` holds the two
against each other. If the derivation is ever wrong about where a case sits, Unit 1's own titles say
so.

That test also asserts every registered case matches `/^Case \d\.\d\d$/`, that each unit numbers 01,
02, 03 in order, and — as in `0102` — that the list it iterates is not empty, because a numbering
test that quietly stops checking is the defect it exists to catch.

**One spec had pinned the bug in place.** `unit-05-missions.spec.js` asserted the kicker read
`"Period 5 · 1844–1877"` and carried a comment explaining that Unit 5 drops the prefix so
`caseNumberLabel()` comes back empty. It reads `"Case 5.02 · Period 5 · 1844–1877"` now. A spec that
documents why a screen is wrong is still a spec that keeps it wrong.

## 4. Nine baselines, and the six I did not ask for

The visual suite failed three. `--update-snapshots` rewrote **nine**, because it also rewrites
differences below the failure threshold — which is exactly the rubber stamp `CLAUDE.md` warns about,
arriving as six files I had not looked at.

So all nine were checked by computing the bounding box of the changed pixels in each:

- **Six** are a single line of text, eight to eleven pixels tall, at the eyebrow's own position —
  three activity screens, two Codex listings, one mission debrief. One line each, nothing else moved.
- **Three** — `mission-triangle-ledger`, `mission-appeal-ledger`, `mission-bank-war-filed` — changed
  down the whole left column, because in that narrow column the longer eyebrow **wraps to two lines**
  and everything below it shifts down. `mission-triangle-ledger`'s box also runs the full width, and
  restricting the scan to `x > 400` puts every one of those pixels in rows 705–743: the shell's
  bottom edge, moving down with the column.

The wrap is worth a sentence because it looks like a regression and is not. Unit 1's mission screen
has wrapped `"CASE 1.02 · PERIOD 1 · 1491–1607"` onto two lines since it shipped, and its baseline
did not move today. What changed is that Units 2–8 now do the same thing. The result is consistency
with what was already there, not a new layout.

## 5. One consequence, recorded rather than migrated

`caseLabel` is **persisted** on a Codex entry — `codex-archive.js` lists it among the stored fields,
and the renderer reads `entry.caseLabel` rather than recomputing. So a player who filed a Unit 2
record before today keeps "One Hogshead" on it, and anything filed after gets "Case 2.01".

Left alone on purpose. Both labels render, both are meaningful, and it heals as the player plays. The
alternative is a save migration that rewrites stored player data for a cosmetic string, which is a
worse trade than a few old entries reading differently.

## 6. What was deliberately not done

- **No content edited.** Not one case title changed, which is the whole point of §2.
- **P10-6 not touched.** The other open Part 10 S3 — whether a non-field mission is a place you
  travel to or work you do at the Archive — is a real design decision with three surfaces disagreeing,
  and it is routed to an ADR. Unlike P10-5 it does not dissolve on inspection.
- **The Manage Content headers still pair the number with `resolvedCaseTitle()`**, so a Unit 1
  mission shows "Case 1.01" above "Case 1.01 — The Atlantic Crossroads" there. It is a teacher
  surface, the Spine Review excludes those deliberately, and the duplication predates this phase.

## 7. Verification

`npm run test` — **2,098 passing** across 76 files, 2,070 before; the 28 new ones are the numbering
test. `npx playwright test unit-05-missions archive-challenge non-field-missions` — 32 passed.
`npx playwright test visual-regression` — 21 passed after the nine baselines above, each one's changed
region measured and accounted for. `validate:content` 0 errors, `lint` 0 errors and the 5 standing
warnings, `format:check` and `build` clean.
