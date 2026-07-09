# Milestone 3.4.6 — Proximity Interaction & Puzzle Polish

Installed after Milestone 3.4.5. This pack only includes `apps/` and `docs/`.

## Changes

### Field interactions
- NPCs and field source markers can no longer be opened from across the map.
- Clicking works only when the player is close enough.
- `E` / `Enter` interacts with the nearest valid NPC or source point.
- A small proximity prompt appears only when the player is close.

### Quest/source markers
- Field quest markers are now small icon-sized buttons, smaller than the player sprite.
- The marker is mostly the star/check icon with a small blue background.
- The “Press E” hint appears only when close.

### NPC animation
- NPCs now render with idle and step frames.
- New step-frame PNGs were added for the Taíno elder, gardener, canoe worker, Spanish sailor, Columbus, and scribe.
- Foot-shadow/under-sprite movement was removed so characters no longer look like they are floating on top of fake feet.

### Dialogue standard
- Field dialogue no longer breaks the fourth wall.
- NPCs speak in historically grounded, in-character language.
- Meta-disclaimer language should stay in opening/instructional copy, not in every NPC interaction.

### Archive map puzzle
- The map activity now reads as a jigsaw puzzle rather than rectangular cards.
- Empty slots use faint ghosted sockets instead of “EMPTY PLACE” labels.
- Piece labels are visually hidden unless hovered/focused.
- Interior edges use interlocking/jagged puzzle silhouettes while the board still preserves outside-boundary logic.

## Acceptance checks
- From far away, clicking an NPC or source marker gives a “move closer” notice and does not open interaction content.
- Near an NPC/source marker, pressing `E` opens the interaction.
- Quest markers are visibly smaller than the player sprite.
- NPC bodies visibly alternate between idle and step frames.
- Taíno elder dialogue no longer says “This dramatized field dialogue…”
- The map puzzle board no longer displays large “EMPTY PLACE” labels.
