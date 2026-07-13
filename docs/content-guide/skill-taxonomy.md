# Historical-Thinking Skill Taxonomy

## The enum

`apps/web/src/quest-types/history/evidence-organizing-quest.js` exports `SKILL_CATEGORIES`:

```text
Comparison
Causation
Continuity and Change
Contextualization
Sourcing
```

Every `source.skillCategory` and every entry in `rubric.skillCategories` on an
evidence-organizing quest must be one of these five values — the schema
enforces it with `z.enum(SKILL_CATEGORIES)`.

## Why five, not four

The first four are College Board's "four Cs" — the historical-reasoning
processes AP US History expects students to use when constructing an
argument. **Sourcing** is a fifth, separate historical-thinking skill
(source attribution and situation — who made this, when, why, for whom) that
evidence-organizing content has needed in practice since the quest type
shipped. It is not one of the four Cs and shouldn't be force-mapped into one
— College Board's own framework treats sourcing/situation as its own skill
alongside the four reasoning processes, not a member of that set.

## Why this is separate from `HIPP_DIMENSIONS`

`apps/web/src/quest-types/history/source-analysis-quest.js` has its own,
unrelated enum: `["Historical situation", "Intended audience", "Point of
view", "Purpose"]`. Don't conflate the two, despite "Sourcing" and
"Historical situation" both smelling like source-analysis:

- `HIPP_DIMENSIONS` tags **one argument-component within a single document**
  — a source-analysis quest picks 1-2 of these per document and asks the
  student to explain how that one element shapes that one source's argument.
- `SKILL_CATEGORIES` tags **a whole source's dominant historical-thinking
  skill across a multi-source set** — an evidence-organizing quest asks the
  student to sort several different records by which broader skill each one
  best demonstrates.

Different granularity, different quest type, deliberately two separate
enums.

## Current content gap

As of this writing, `apps/web/src/content/quests/unit-01-quests.js`'s one
real evidence-organizing quest (`case-001-evidence-record-sourcing`) only
uses three of the five categories: **Contextualization**, **Sourcing**, and
**Continuity and Change**. It does not yet contain a **Comparison** or
**Causation** example. Don't invent one to fill the gap speculatively — this
is real content grounded in Case 1.01's actual sources, and Case 1.01
doesn't currently have a clean comparison- or causation-shaped record to tag.
Treat this as a to-do for whoever authors the Atlantic/Hispaniola badge
areas or Unit 2 content next (see `docs/architecture/NEXT-UNITS-ROADMAP.md`):
prefer building at least one Comparison-tagged and one Causation-tagged
source into the next evidence-organizing quest you write, rather than
leaving those two categories permanently theoretical.

## Worked example

```js
{
  id: "example-comparison-source",
  label: "Two Colonial Land Systems",
  attribution: "Comparative excerpt, colonial land grants",
  excerpt: "…",
  skillCategory: "Comparison",
  correctSlotId: "comparison",
}
```

Pair it with a matching slot: `{ id: "comparison", label: "Comparison" }`,
and add `"Comparison"` to the quest's `rubric.skillCategories` array.

## Where this applies going forward

All future unit content (Unit 2's real Riverbend Settlement content, Unit 3+,
new Atlantic/Hispaniola badge-area content) should tag `skillCategory` from
this enum from the start, rather than reintroducing free-text category names
the way `"Sourcing and Situation"` existed before this taxonomy was
formalized.
