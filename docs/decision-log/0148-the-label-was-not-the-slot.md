# 0148 — The label was not the slot

**Phase 149 · 2026-09-20 · Accepted**

Phase 148 made it possible to be two people on one machine: a teacher who publishes, and then a
student in that classroom who opens what was published. So this phase asked the two questions
Teacher Mode exists to answer and had never been asked end to end — **does "Advance to the next
unit" open a period for the class**, and **is what a teacher publishes what the student is given**.

Both hold. Walking the second one found that **opening a mission's activity editor and pressing
Publish without changing anything rewrites the answer key the class is graded against.**

---

## 1. What the walk confirmed

Neither of these had any coverage, and the only evidence for either was that a row landed in a
table. They are guarded now because they are the product:

- A teacher advances the classroom twice; a student who then signs in finds Periods 1–3 open on the
  Navigation Table and 4–8 teacher-locked. The floor is a floor and never a ceiling — it unions each
  opened unit's first case into `progress.unlocked` — and the strip disables a unit with nothing
  unlocked in it.
- A teacher rewrites Case 1.02's prompt, publishes, signs out; a student claims a seat on the same
  machine, walks to the Navigation Table, opens the mission, and reads the teacher's sentence on the
  board.

## 2. The defect: a slot's identity was the text on its face

Evidence-organizing is the only quest type in `custom-content-authoring.js` whose content
cross-references itself. A source names the slot it belongs in:

```js
{ label: "Smallpox", correctSlotId: "demographic-catastrophe" }
```

That string is the graded answer. And it did not survive the editor:

```js
// evidenceOrganizingToFields — the id is dropped
slots: (quest.slots || []).map((slot) => ({ label: slot.label })),

// buildEvidenceOrganizingContent — and re-derived from the label
const slots = slotRows.map((row) => ({ id: slugify(row.label), label: row.label.trim() }));
```

**Every authored quest writes a short id beside a long label** — `agriculture-diet` for "Transformed
Agriculture and Diet" — so the rebuilt id matched nothing any source pointed at.

In the browser that is worse than a dangling reference. Each source row's "Correct slot" is a
`<select>` whose options are built from the same slugs, so it **cannot display a value it has no
option for and falls back to its first option**. The teacher is shown every record filed under the
first slot; `syncAuthoringFieldsFromDom()` then reads that back as the teacher's own choice; and
`buildEvidenceOrganizingContent()`'s own fallback — `slotIds.has(row.correctSlotId) ? … : slots[0].id`
— means nothing ever objects.

Measured on Case 1.02, opening the editor and publishing with **no edit of any kind**:

| record            | authored slot                         | published slot                       |
| ----------------- | ------------------------------------- | ------------------------------------ |
| Maize             | Transformed Agriculture and Diet      | Transformed Agriculture and Diet     |
| Smallpox          | Caused Demographic Catastrophe        | **Transformed Agriculture and Diet** |
| Horses            | Reshaped Mobility, Warfare, Transport | **Transformed Agriculture and Diet** |
| Enslaved Africans | Built Systems of Forced Labor         | **Transformed Agriculture and Diet** |

Three of four records graded wrong, for a class, from the most innocuous action a teacher can take:
looking at a mission and deciding to keep it. A student who sorts the Columbian Exchange correctly
is marked incorrect.

**The file's own docblock asserted the opposite**, and had since it shipped: _"Evidence-organizing
sources reference slots by id (`correctSlotId`), resolved live against the current slot rows rather
than by matching free-text labels."_ Deriving the id from the label is matching free-text labels
with extra steps.

## 3. The second way in, which the first one hides

Renaming a slot is a thing a teacher will do, and it had two outcomes depending on what they touched
next.

Press Publish straight after, and the slug set changes under the sources, so validation fires —
four copies of `sources[N].correctSlotId: must reference one of the current slots`, a message
written for whoever wrote the code.

Press anything else first — "+ Add evidence record", say — and the form re-renders from the synced
fields, the options rebuild around the new slug, no option matches, and **every record silently
moves to the first slot**. Same corruption, no message at all.

## 4. The fix

A slot has an id, and its label is just its label.

- `evidenceOrganizingToFields()` carries `slot.id` through.
- `slotIdOf(row)` is `row.id || slugify(row.label)` — authored or minted, and the slug only as a
  fallback for a fields object that never had one, which is what keeps the existing row-edit tests
  meaningful rather than rewritten.
- `buildEvidenceOrganizingContent()`, `removeEvidenceSlot()`, `addEvidenceSource()` and the form's
  `slotOptions()` all ask `slotIdOf()`.
- The slot row carries `data-slot-id`, and `syncAuthoringFieldsFromDom()` reads it back rather than
  re-deriving it. The DOM is where the round trip was broken, so it is where the id has to travel.
- `addEvidenceSlot()` mints an id at birth. Without one a new slot's identity is `slugify("")` —
  which every other unnamed slot also has, and which moves the moment a name is typed.

After: the editor opens showing the real key, publishing untouched changes nothing, and renaming a
slot renames only the slot.

## 5. What this is not

**Not a bug in the four shipped activity engines.** Nothing here touches how a student plays; the
corruption is written by the authoring form and only for a classroom whose teacher has published a
custom version of an evidence-organizing mission.

**Not the other quest types.** `shortId()` mints a fresh unique id everywhere else — sequencing
items, MCQ choices, HIPP prompts, evidence _sources_ — and none of those ids is a cross-reference:
sequencing's answer key is `position`, and nothing points at a source. `slugify()`-as-id had exactly
one load-bearing use and this was it.

**Not a widening of what a teacher may edit.** The Mission/Field-Assignment firewall is unchanged.

---

## Verification

`npm run check` clean — **2,418 unit tests across 83 files** (2,414/83 before), ESLint 0 errors and
the same 5 pre-existing warnings, cspell 0 issues across 631 files, `validate:content` 169 groups.

**Watched fail** with the source fixes stashed:

- three of the four new round-trip unit cases, at _"the round trip refused the authored quest:
  sources[0].correctSlotId: must reference one of the current slots"_ and _"renaming a slot was
  refused"_;
- the e2e guard, at _"the editor opened with the records filed under the wrong slots. A select
  cannot display a value it has no option for — it falls back to its first — so this is what the
  teacher is shown and what the next save writes down."_

The two confirmation guards — the published wording and the unit gate — **pass with or without the
fix**, which is correct: they are the null results this phase set out to establish, not tests of the
defect it found.

The six teacher and content specs plus the whole visual-regression suite ran together: **34 passed
in 2.1 minutes**, with all **61 baselines unchanged**. The only markup this touches is a
`data-slot-id` attribute on a row inside Manage Content, and no baseline photographs a teacher
screen. `npm run build` clean.
