# Milestone 2.1 — Field Movement & Art Polish

## Purpose
Improve the first playable field entry without expanding historical content. The scene remains a small, contained Caribbean arrival station that proves the eventual top-down RPG direction.

## Included
- Smooth 185 ms tile-to-tile movement with a small walk-cycle frame.
- Four facing states: up, down, left, and right (left mirrors the side-facing PNG).
- Input buffering: a key pressed while the character is moving becomes the next requested move.
- Higher-detail pixel PNG assets for the field character, mentor, and props.
- A more varied arrival station: water, shoreline, sand, grass, paths, tent, palms, beacon, supplies, lantern, boat, and rocks.
- Collision remains intentionally simple and grid-based under the presentation layer.

## Not included
- The Unit 1 case briefing, evidence collection, or assessment.
- Free movement outside the field scene.
- Combat, inventory, or equipment systems.
- Editable placement tools; responsive scene composition remains protected code.

## Technical notes
The field still uses a tile grid. Smooth motion is a display layer over the grid so collision and later classroom content placement remain predictable. `FIELD_MAP` and `FIELD_PROPS` are defined in `apps/web/src/features/chronicle-identity/chronicle-identity.js` and should be treated as developer-owned structural content.
