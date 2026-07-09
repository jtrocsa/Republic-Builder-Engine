# Milestone 3.4.8 — Camera Stability, NPC Patrols, Archive Pathing, and Badge Shelf

This patch continues from Milestone 3.4.7. It updates only `apps/` and `docs/`.

## Fixes

- Field clicks no longer re-render the field when the player is too far away, reducing the camera snap-left/snap-back effect.
- Field NPCs now have independent patrol paths instead of marching in place in unison.
- NPC walking frames only play while each NPC is actually moving.
- Archive room pathing is more forgiving, with fewer random collision spots.
- The Preserved Records case has been moved away from Dr. Soto and toward the bookshelf/display area.
- Added a Unit 1 badge shelf with Caribbean, Atlantic, and Hispaniola badge placeholders.
- Removed the black jigsaw overlay lines from the map puzzle.
- Kept the map tray pieces upright so students match the same orientation used on the board.

## Acceptance checks

1. In the Caribbean field, click a far-away NPC/source. The whole field should not snap left and back.
2. NPCs should wander independently instead of marching in place together.
3. In the Institute Archive, the player should not get stuck around the center-left walkway.
4. The Preserved Records display should not sit on top of Dr. Soto.
5. The badge shelf should show Caribbean, Atlantic, and Hispaniola Unit 1 badges.
6. The map puzzle should no longer show thick black squiggle lines.
