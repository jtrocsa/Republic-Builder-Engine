# Decision Log 0025 — NPC Physics, Dialogue Camera, and Status Rail

## Decision

Milestone 3.4.13 separates overlay information from playable space and tightens NPC movement rules.

## Rationale

The field and Institute started to feel alive once NPCs began patrolling, but the illusion broke when NPCs walked into water, buildings, shelves, or tables. The field dialogue also rendered correctly as a bubble, but re-rendering the whole field reset the map transform for a moment and created a visible camera snap. The Institute status panel covered the room and made it look like the player could walk on UI.

## Implementation notes

- NPC patrols now use collision checks before each movement step.
- Field camera state is preserved between renders and applied immediately to the world container.
- The Institute status panel is part of the left intro rail, not an overlay on the map.
- Table access is primarily spatial: players approach the Navigation Table to open the route map.
