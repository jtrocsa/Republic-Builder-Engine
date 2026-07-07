# Decision 0001 — Engine and Campaign Boundaries

**Status:** Accepted

## Decision

Republic Builder is the reusable historical RPG engine.

Chronicle is the first AP U.S. History campaign built with that engine.

## Consequences

- Engine code cannot contain hard-coded APUSH facts, names, dates, or case logic.
- Chronicle content owns APUSH units, historical cases, primary sources, dialogue, NPC details, activities, and assessments.
- Future campaigns can use the same systems while supplying different content.
