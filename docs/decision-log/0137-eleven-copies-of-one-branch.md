# 0137 — Eleven copies of one branch

**Phase 138 · 2026-09-12 · Accepted**

Eighteen handler branches in Manage Content's authoring forms, each repeating the same skeleton
around a few lines that differ, and each hard-coding a quest-kind literal that had to match the form
it edited. Nothing checked that it did, and nothing tested any of the rules inside them.

Two things the audit plan said about this phase turned out to be wrong, and both changed the work.

---

## 1. The plan said one half had a test net. It does not

The plan's schedule was: do the four source-picker branches first, because
`tests/unit/main-source-picker.test.js` covers them, then write characterization tests for the
eleven authoring branches.

`main-source-picker.test.js` tests **`resolvePoolSourceFields()`** — the lookup helper the branches
_call_ — with four cases about mapping a catalog id to `{label, attribution, excerpt, fullText}`. It
says nothing about any branch. **Neither half had a net.** So the order did not matter, and the
characterization work was the whole job rather than half of it.

## 2. The audit said "11 near-verbatim copies". That is true of the skeleton and false of the bodies

The four lines around each branch really are identical — sync the form out of the DOM, mutate,
reassign `manageContentAuthoring`, render. The bodies are not. Every one carries a floor or a ceiling
on how many rows there may be, and **three carry a repair** that keeps the rest of the form
consistent after a removal:

- removing the correct MCQ choice **promotes the first remaining one**, so a question is never left
  with no right answer;
- removing a sequencing item **renumbers every `position` 0..n-1**, because the positions are the
  answer key and a gap in them is a broken quest;
- removing an evidence slot **repoints every source filed under it** at the first remaining slot,
  because `correctSlotId` is matched by slug and an orphan matches nothing.

All three are one click away from a teacher, all three are invisible when they go wrong, and **none
of them was tested**.

That changes what the right fix is. A descriptor table over eleven untested bodies would have
flattened genuinely different rules into a table of callbacks — the plan's "rewrite with a hopeful
name". So the rules came out first as pure functions, got tested, and only then was the dispatch
tabled.

## 3. Verified by differential, not by hope

An extraction's tests assert the extraction. They would pass just as happily against a subtly
different rule, which is the failure mode that matters here.

So the original inline bodies were transcribed verbatim — mutating in place exactly as they did — and
run against the extracted functions over a generated input space: MCQ forms of 2–5 choices with the
correct answer at every index, sequencing items in six different position orders including reversed
and shuffled, evidence forms with slots sharing and not sharing labels, HIPP prompts at every option
count from 3 to 6, and every valid index into each.

**418 cases compared. Zero differences.**

And proved non-vacuous the same way as everything else in this programme: changing one floor from
`<= 2` to `<= 1` produces **4 differences**. The harness is not committed — it compares against code
that no longer exists, so it could only ever pass from here.

## 4. The hazard the phase exists for, now a test

Each branch hard-coded the kind whose form it edits. Get it wrong and
`syncAuthoringFieldsFromDom("sequencing", …)` reads a _sequencing_ form's rows out of an _MCQ_
form's DOM: `fields.choices` comes back undefined, the edit runs against nothing, and the teacher's
click either does nothing or throws into `render()`'s catch and shows them the Archive recovery
screen. Eighteen literals kept in step with eighteen forms by memory.

The kind now sits in the same table row as the edit. That makes a mismatch visible; the guard makes
it fail. And it is **derived rather than restated**: each `<kind>FieldsMarkup()` function renders the
buttons for exactly one quest type, so the test reads `main.js`, works out which markup function each
`data-action` and each `data-copy-*-source` appears in, and requires the table to agree with it.
Watched fail four ways — an MCQ button pointed at the sequencing form, the HIPP select pointed at the
MCQ form, a button the table forgets, and HIPP preferring the excerpt over the transcription.

The last of those is the one real rule in the source-picker half: **HIPP takes
`picked.fullText || picked.excerpt`** and the other three take the citation. It is the only form that
copies the document itself rather than a citation of it, so it is the only one that prefers a real
transcription over the summary. Backwards, and a HIPP question silently asks a student to analyse a
two-sentence description of a source instead of the source.

## 5. This did not make `main.js` smaller, and was not meant to

|                            | before    | after      |
| -------------------------- | --------- | ---------- |
| `handleManageContentClick` | 651 lines | **505**    |
| the eighteen branches      | 251 lines | **41**     |
| `main.js` overall          | 17,628    | **17,715** |

The file grew by 87 lines. The rules, their tables and the comments arguing them are longer than the
inline bodies were — and that is the trade: 251 lines of untested branch logic became 41 lines of
dispatch plus a set of named, exported, tested functions. **The win is that the rules can now be
asserted and the kind-matching cannot drift, not that anything is shorter.**

## 6. What is still not covered

The dispatch skeleton itself — reading `target.dataset`, `currentAuthoringFormEl()`,
`confirmSourceChangeIfNeeded()`'s dialog, `render()` — is verified by reading, not by running.
**There is no e2e coverage of Manage Content's authoring UI at all**; the two hits for "Manage
Content" in `tests/e2e/` are both comments in `archive-challenge.spec.js`. That was true before this
phase and is true after it. What changed is that the part of it that encodes rules is now tested,
which is the part a wrong answer hides in.

---

## Verification

`npm run check` clean — **2,387 unit tests across 80 files** (up 54), ESLint 0 errors and the same 5
pre-existing warnings, cspell across 606 files, `validate:content` at 169 groups. `npm run build`
clean. 21 visual baselines and `archive-challenge.spec.js` run (39 tests), **no baseline moved** —
expected, since nothing student-facing changed.
