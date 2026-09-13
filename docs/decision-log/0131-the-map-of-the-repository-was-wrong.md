# 0131 — The map of the repository was wrong

**Phase 132 · 2026-09-12 · Accepted**

A structural and efficiency audit of the whole repository, and the cheapest thing it found. Not a
defect in the game: a defect in the documents every session is told to read before touching it.

`CLAUDE.md` opens by telling its reader to trust it. The verification ladder, the invariants, the
minimum-required-reading table and the "don't claim otherwise" corrections are all written on the
assumption that what the file says is true. **Eight claims across five files were not**, and the two
worst were not stale by a little — they described a directory that does not exist and a dependency
policy that had been reversed.

This phase changes no runtime code. It is first in its programme for exactly that reason: the seven
phases queued behind it will each be executed by a session that reads these files first, and a
session acting on a false line pays for it before it writes anything.

---

## 1. A paragraph about a directory that was deleted

`CLAUDE.md` carried this since the original architecture pass:

> There is also a **dormant, unread** JSON content pipeline under
> `content/campaigns/chronicle/units/unit-01/` (`campaign.json`, `unit.json`, `case.json`,
> `activities/*.json`, `assessments/*.json`) plus record templates in `content/library/`. … It
> represents a _fourth_ incompatible schema for the same Case 1.01 source content … don't reconcile
> the schemas speculatively.

`ls content` finds no such directory. `git ls-files` finds nothing under `content/`. The whole
repo-root `content/` tree — ten files — was deleted in **`e715156` ("quest update 1.2")**, and the
paragraph survived it.

**This is the expensive kind of stale.** It does not merely describe something that changed; it
issues an instruction ("don't reconcile the schemas speculatively") about a thing that cannot be
reconciled because it is not there. A reader following it goes looking for ten files, finds none,
and has to work out whether the file or the repository is wrong. The line is kept in corrected form
rather than deleted, because a reader who greps for `content/campaigns` needs to land on the answer.

Note what did not catch this. `e715156` was a content commit; nothing in the repo asserts that a
path named in `CLAUDE.md` exists. **There is no guard here and this phase does not add one** — a
test that greps prose for path literals would fire on every historical reference the file
deliberately keeps, including the sentence that replaces this one.

## 2. A dependency policy stated backwards

> There is no `npm run typecheck` script and TypeScript is not a dependency; measure it on demand
> with `npx -y -p typescript tsc -p jsconfig.json --noEmit`.

`package.json` defines `"typecheck": "tsc -p jsconfig.json --noEmit"` and lists
`"typescript": "^5.9.3"` under `devDependencies`. Both halves of the sentence are false, and the
`npx -y -p typescript` invocation it recommends downloads a second copy of a compiler the repo
already has.

The _substantive_ claim underneath — that type checking is advisory and not a gate — **is still
correct**, and is the part worth keeping: `npm run check` does not invoke it and neither does CI,
which `.github/workflows/ci.yml`'s own header explains and argues for. So the correction keeps the
policy and fixes the facts, rather than treating the whole sentence as wrong.

Both the script and the dependency arrived in **`49b4130`**, the phase that installed `cspell` and
CI — whose own message records that `jsconfig.json` "set `checkJs: true` with TypeScript absent, so
both were documented in CLAUDE.md as working CLI checks and neither could execute." That phase fixed
the executable half and left the sentence describing the old state.

## 3. A baseline that had drifted by two

> The current baseline is **16 errors, all verified false positives** … don't "fix" the standing 16
> by changing engine code.

`npx tsc -p jsconfig.json --noEmit` reports **18**. The two extra are the same class as the sixteen
— untyped `supabase-js` embeds inferring `{}` — in `remote-custom-content-repository.js` and
`remote-submission-repository.js`.

This is the least harmful of the eight and the most instructive about why the others matter: the
instruction attached to the number is _"treat a new error as worth reading"_, and a reader who runs
the command, sees 18 against a documented 16, and cannot tell which two are new gets no value from
the baseline at all. A number in a document is only useful while it is the number.

## 4. A comment for a rule that was never written

`.gitignore` carried twelve lines explaining that eight unused purchased tileset packs, "sitting in
`apps/web/src/assets/tilesets/` at 108 MB", "were parked here by the Phase 90 workflow audit rather
than deleted", with instructions for restoring one.

**No ignore pattern follows the comment.** `git show 49b4130 -- .gitignore` shows that commit added
the comment and nothing else. Nothing was ever parked: all **197** files under
`apps/web/src/assets/tilesets/` are tracked, at **132 MB**, and there are no untracked files there
at all.

So the comment describes a completed cleanup that did not happen, in the one file whose entire
purpose is to say what is excluded. Corrected to say so. **Whether to untrack them is left open** —
that is a real decision about 132 MB of purchased art with two non-obvious consumers (a `from:`
source for a derived sheet, and `planned-maps.js`'s forward slate, which
`tests/unit/tile-palettes.test.js` asserts exists on disk), and `npm run assets:audit` is the
authoritative check. It is not a documentation fix and is not made here.

## 5. Two doc comments that each say the opposite of what their module does

Both sit at the top of a file, which is where a reader looks to decide whether a change matters.

**`content/unit-registry.js:23`** — _"It is read by `main.js`, by Node scripts and by tests."_
`main.js` does not import it; the string appears nowhere in that file. Its actual readers are
`validate-content.js`, `build-field-guide.js`, `docs-stats.js` and two test files. `main.js` keeps
its own parallel list, the `UNITS` array.

That matters more than a wrong cross-reference, because this is the file whose header argues the
"derive from one list" rule that `CLAUDE.md` cites — and the sentence made the rule sound enforced
in the running game. It is not. The two lists are held together in **one direction only**:
`field-map-coordinates.test.js` asserts every `FIELD_MAPS` key is in `UNIT_IDS`, deliberately not
the reverse, because a unit legitimately has content for several phases before it has a map. The
doc comment now says which surface the rule governs.

**`content/primary-source-library/index.js:5`** — _"this module is not imported by main.js; it
exists so a future case/quest author … has one place to pull researched sources from."_ `main.js`
imports **five** names from it and builds the Teacher Dashboard's entire Sources tab on them. This is
the exact inverse of the case above, and the more dangerous direction: a doc comment saying a module is
dormant is an invitation to change it freely, and 4,466 lines of content sit behind this one.

## 6. Two counts

`ARCHITECTURE-QUICKREF.md` said `main.js` was **17,436** lines "as of Phase 118"; it is **17,632**.
`ci.yml`'s header said **55** visual baselines, twice; there are **61**. Both are the drift
`49b4130` itself diagnosed — "four of its counts had drifted at once … so the numbers are gone and
`npm run docs:stats` measures them instead" — reappearing in the two places that pass saw fit to
keep a hand-written number.

Neither is worth a guard. `docs:stats` already reports both, and the fix for a count nobody
re-measures is to stop writing it down, which these two files have their own reasons not to do.

## 7. `data/` outlived its stated reason

`data/schemas/case.schema.example.json` (11 lines) and `data/sample-saves/` (14 lines) have **no
reader** — nothing in `apps/web/src`, `scripts/` or `tests/` loads either. `CLAUDE.md` already
conceded the first was "not a real JSON Schema"; what it did not say is that
`THIRD-PARTY-TOOLING-AUDIT.md` justifies keeping the directory as _"a portable contract for the
dormant `content/campaigns`/`content/library` JSON tree"_ — **the tree from §1**.

So its documented purpose was deleted in `e715156` along with the tree, and the directory has been a
fifth schema location with zero readers ever since. Recorded, not deleted: removing it is a small
decision but a separate one, and this phase is corrections only.

## 8. What this phase deliberately did not do

No runtime code changed. The diff touches `CLAUDE.md`, `ARCHITECTURE-QUICKREF.md`, `.gitignore`,
`ci.yml` and two doc comments; the only two files under `apps/web/src` are comment-only.

No guard was added for any of the eight. Every one is a prose claim about the repository, and the
generalisation — _test that the documents are true_ — is the shape `0119` warns about: a check keyed
to the surface rather than to the question, which would fire on every deliberate historical reference
in a file that is largely deliberate historical reference. **The eight fixed here were found by
auditing, and auditing is the mechanism that has to find the next eight too.**

The seven phases queued behind this one come from the same audit: the sign-out state crash
(`teacherUiState`'s three dropped `Set` fields, hidden by `render()`'s catch), the three per-unit
tables with a silent fallback and no test (`RECONSTRUCTION_LANES`, `PRACTICE_CHECK_QUESTS`,
`SURFACE_TILESETS`), the whole tilemap being re-composited on every `render()` (12,096 cell iterations per `E`
press), the 1.47 MB of base64 sprite art in the entry chunk, Unit 9's 2.05 MB of art for a unit
nobody can enter, the 19-line per-map dispatch chain, the eleven copied authoring branches, and the
dead-CSS / vitest-environment sweep.

---

## Verification

`npm run check` clean — Prettier, ESLint (0 errors, the same 5 pre-existing warnings), cspell,
**2,258 unit tests across 78 files**, and `validate:content` at 169 groups. `npm run build` clean.
No visual baseline could move and none was run against: nothing rendered changed.
