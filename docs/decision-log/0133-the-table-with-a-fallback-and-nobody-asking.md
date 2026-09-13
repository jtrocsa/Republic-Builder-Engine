# 0133 — The table with a fallback and nobody asking

**Phase 134 · 2026-09-12 · Accepted**

Three per-unit tables inside `main.js` have a silent fallback and had no test. All three were
complete when found, and that is the point: the cost of a table like this is never paid by the phase
that adds it.

Test-only. No file under `apps/web/src` changed.

---

## 1. The shape, and why CLAUDE.md already names it

> **A per-unit table with a sane fallback and no test is how a whole unit ships broken**, and it has
> now happened repeatedly.

`FIELD_COPY` is the worked example: keyed by unit, falls back to `FIELD_COPY["unit-01"]`, and shipped
Unit 6 telling a player standing in the Chesapeake to follow the Caribbean shoreline. It got a guard
in Phase 90. These three are its untested twins and nothing had ever asked about them —
`grep -rn RECONSTRUCTION_LANES tests/` returned nothing at all.

| table                   | keys               | fallback                                | what a missing entry does                                              |
| ----------------------- | ------------------ | --------------------------------------- | ---------------------------------------------------------------------- |
| `RECONSTRUCTION_LANES`  | 8 cases            | `\|\| RECONSTRUCTION_LANES["case-001"]` | Record Reconstruction offers this unit's records the Caribbean's lanes |
| `PRACTICE_CHECK_QUESTS` | 8 cases            | hidden button / redirect                | the Practice Check silently stops existing for that unit               |
| `SURFACE_TILESETS`      | 8 units + the hall | `?.() \|\| []`                          | the warp preloads only the plate; the player lands on an empty frame   |

None of the three fails loudly. Two of them produce a plausible-looking screen and the third
produces a feature that is simply absent.

## 2. Keying each guard to the table that answers its own question

This is the part that took the work, and one of the three keys in the audit plan was wrong.

**`RECONSTRUCTION_LANES` and `PRACTICE_CHECK_QUESTS` are keyed by case, not by unit**, and the
obvious derivation — _every case with `route === "field"`_ — is wrong. There are **nine** such cases,
not eight: `unit-09`'s `case-025` is one, it deliberately has no entry in either table, and it is
unreachable because `unit-09` has no map. A guard written that way would fail on day one against a
unit that is correct.

So the key is derived in two steps: for each `FIELD_MAPS` unit, that unit's `route === "field"` case.
That asks the question the fallback actually poses — _can a player reach this screen without an
entry?_ — and it will pick `case-025` up automatically on the day `unit-09` enters `FIELD_MAPS`,
which is the same commit that would give it lanes.

**`SURFACE_TILESETS` answers something narrower than its name suggests.** The audit plan said to key
it off "`FIELD_MAPS` + its `interiors` + the three hub rooms". Reading `warpArtUrls()` says
otherwise: the table is read for a warp destination's outdoor map, and for `"institute-hall"` on the
way back. Interiors, the Archive Room and the Hallway are not warp destinations and correctly have
no entry. Asserting one per walkable surface would have failed on **eleven surfaces working exactly
as designed** — a guard keyed to the surface class rather than to the question, which is `0119`'s
mistake made again. It keys off `FIELD_MAPS` plus one separate assertion for the hall.

## 3. Watched fail, one test each

Each of the four assertions was watched fail by renaming a real entry, and each failed **exactly
one** test of the 431 in the file:

- `case-016` out of `RECONSTRUCTION_LANES` → _"case-016 (unit-06) has no RECONSTRUCTION_LANES entry,
  so reconstructionScreen() falls back to case-001's and offers this unit's records the Caribbean's
  lanes — "Before contact", "Early encounter", "Changing geographic knowledge" — with no error
  anywhere"_
- `case-019` out of `PRACTICE_CHECK_QUESTS` → _"the feature disappears rather than failing"_
- `unit-06` out of `SURFACE_TILESETS` → _"the player lands on this map's empty frame and watches
  renderTiledMap() fetch its sheets"_
- `"institute-hall"` renamed → _"every Recall to Archive preloads the plate alone and arrives on an
  unpainted hall"_

Each message names the **consequence**, following the convention the `FIELD_COPY` guard set. A
failure that says "unit-06 is missing from SURFACE_TILESETS" tells a reader what, not why it matters.

## 4. A vacuity the helper could have had

The `section()` helper these assertions share — copied from the one already in this file — read:

```js
return MAIN_JS_SOURCE.slice(start, MAIN_JS_SOURCE.indexOf("\n};", start));
```

`indexOf` returns `-1` when it finds nothing, and `slice(start, -1)` is **the whole rest of the
file**. So if a table were ever renamed or reformatted such that its close was not found, every
assertion below would go on passing — against a haystack containing every other table in `main.js`,
including the eight `"unit-0N":` keys of `FIELD_MAPS` itself.

That is `0119`'s "guard that could not fail", one step removed: not vacuous today, but vacuous the
moment the thing it reads moves. Both bounds are checked now. The pre-existing copy of this helper
has the same gap and was left alone — it belongs to a different block, and changing it here would
put an unrelated fix in this commit.

## 5. What was found, and what was not

**All three tables were complete.** Eight of eight in each. There was no bug to fix — which is why
this phase changes no runtime code, and why the finding is the absence of the guard rather than the
absence of an entry.

That is worth stating plainly, because the audit that found these listed them as defects and they
are not. What they are is three loaded guns that have not gone off: `FIELD_COPY` was also complete
until the phase where it was not, and Unit 6 reached a browser before anyone noticed.

---

## Verification

25 new tests; `tests/unit/field-map-coordinates.test.js` goes **406 → 431**. Each of the four
assertions watched fail against a real deletion, one test each. `npm run check` clean — Prettier,
ESLint (0 errors, the same 5 pre-existing warnings), cspell across 601 files, **2,289 unit tests
across 79 files**, `validate:content` at 169 groups. `npm run build` clean. `git diff` touches no
file under `apps/web/src`, so no visual baseline could move.
