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

Every `source.skillCategory` and every entry in `rubric.skillCategories` on an evidence-organizing quest must be one of these five values — the schema enforces it with `z.enum(SKILL_CATEGORIES)`.

## Why five, not four

The first four are College Board's "four Cs" — the historical-reasoning processes AP US History expects students to use when constructing an argument. **Sourcing** is a fifth, separate historical-thinking skill (source attribution and situation — who made this, when, why, for whom) that evidence-organizing content has needed in practice since the quest type shipped. It is not one of the four Cs and shouldn't be force-mapped into one — College Board's own framework treats sourcing/situation as its own skill alongside the four reasoning processes, not a member of that set.

## Why this is separate from `HIPP_DIMENSIONS`

`apps/web/src/quest-types/history/source-analysis-quest.js` has its own, unrelated enum: `["Historical situation", "Intended audience", "Point of view", "Purpose"]`. Don't conflate the two, despite "Sourcing" and "Historical situation" both smelling like source-analysis:

- `HIPP_DIMENSIONS` tags **one argument-component within a single document** — a source-analysis quest picks 1-2 of these per document and asks the student to explain how that one element shapes that one source's argument.
- `SKILL_CATEGORIES` tags **a whole source's dominant historical-thinking skill across a multi-source set** — an evidence-organizing quest asks the student to sort several different records by which broader skill each one best demonstrates.

Different granularity, different quest type, deliberately two separate enums.

## Current content status

**Causation:** Now has real content. `apps/web/src/content/quests/unit-02-quests.js`'s Unit 2 evidence-organizing quest (`case-004-evidence-record-sourcing`) tags the 1618 Virginia Company headright charter as a **Causation** example — the charter's land-per-person policy (cause) directly incentivized planters to import indentured servants, establishing a causal chain to bound labor and the export economy described in the other two sources.

**Comparison:** Still has zero real quest-type examples. No evidence-organizing quest currently contains a **Comparison** example. A deliberate scope decision was made not to force one in Unit 2's content pass: the only reachable UI surface for skill-category-tagged evidence-organizing quests in Unit 2 is case-004's Practice Check (Practice Check only exists on field-route cases), and case-006 — which has the natural regional-comparison content — is not a field-route case. Forcing a Comparison example into case-004's practice set would have surfaced mismatched, out-of-sequence content. To close this gap requires either a new UI surface for non-field cases' Practice Check, or a Comparison example authored against case-004 or case-001's own existing sources instead. Future work tracked in `docs/architecture/NEXT-UNITS-ROADMAP.md`.

**Contextualization, Continuity and Change, Sourcing:** Have real examples in `apps/web/src/content/quests/unit-01-quests.js` (case-001).

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

All future unit content (new Atlantic/Hispaniola badge-area content for Unit 1, Unit 3+) should tag `skillCategory` from this enum from the start, rather than reintroducing free-text category names the way `"Sourcing and Situation"` existed before this taxonomy was formalized.
