# Decision Log 0026 — Archive Pathing, Cursor, and Music

## Decision

Milestone 3.4.14 prioritizes game-feel over strict visual collision. Furniture collision is smaller than the drawn art so that the Archive room plays comfortably on a keyboard, especially around the Navigation Table and center aisle.

## Rationale

A top-down RPG room can look good but still feel bad if collision boxes are too literal. The Navigation Table should require walking over to the table, but the player should not have to thread a narrow one-tile path or get trapped by NPCs.

## Implementation notes

- Keep NPCs collision-aware with furniture, but do not let NPCs hard-block player movement in the Archive.
- Use reachable interaction points at the edge of large tables rather than the visual center of the table.
- Use side-facing sprites for left/right NPC movement. Up-facing can remain a darker front-facing approximation for now.
- Use procedural Web Audio loops rather than committed audio files until the final sound direction is settled.
