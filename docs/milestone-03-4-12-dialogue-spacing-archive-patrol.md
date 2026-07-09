# Milestone 3.4.12 — Dialogue Spacing & Archive Patrol Hotfix

Builds on Milestone 3.4.11.

## Fixes

- Replaces the fixed top-left field dialogue panel with an anchored speech bubble that appears above the speaking NPC.
- Clears stale field dialogue after reload so old speech does not remain on the screen.
- Removes the duplicate field-level “Press E” prompt that crowded NPC labels.
- Adds click-off and close-button behavior for field dialogue.
- Clears field dialogue when the player walks away, enters a source, opens the Codex, or recalls to the Archive.
- Spreads the Caribbean field NPCs and source markers so the village, Spanish camp, cartographer table, and recall beacon are less crowded.
- Moves the cartographer station and puzzle marker away from the Columbus source marker.
- Moves the recall beacon farther from the cartographer station.
- Moves the Preservation Case label to the upper bookshelf area.
- Adds gentle independent patrol movement to Institute Archive NPCs.

## Interaction standards

- Field NPC dialogue is temporary UI, not saved progress.
- Dialogue should feel like a speech bubble coming from the character, not an overlay attached to the edge of the screen.
- A single nearby interaction prompt is enough. Avoid stacking “Press E” labels.
- Field source markers should be placed where the object belongs in the world.
- Archive badge/trophy displays should live on shelves or cases, not on top of staff members.

## Acceptance checks

- Loading the field should not show old NPC dialogue.
- Talking to a nearby NPC should open a speech bubble above that NPC.
- The camera should not snap left when dialogue opens.
- Clicking the bubble close button or clicking off the bubble should clear the dialogue.
- Moving the player should clear the active dialogue.
- The cartographer puzzle marker and Columbus source marker should not overlap.
- The Preservation Case should be visually tied to the upper bookshelf.
- Institute Archive NPCs should take small independent patrol steps.
