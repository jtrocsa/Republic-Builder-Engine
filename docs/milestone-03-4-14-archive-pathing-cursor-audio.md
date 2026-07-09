# Milestone 3.4.14 — Archive Pathing, NPC Direction, Cursor & Music

## Purpose

This hotfix focuses on play-feel inside the Chronicle Institute Archive and improves the presentation layer across the field and Archive.

## Changes

### Archive movement and pathing

- Relaxed the Archive collision layer so the player can move through wider aisles.
- Reduced oversized furniture collision boxes around the center pillar, research desk, and Navigation Table.
- Moved the Navigation Table interaction point to the reachable lower edge of the table.
- Player movement no longer gets blocked by wandering Archive NPCs, which keeps the room from feeling stuck or maze-like.
- Archive NPC patrol paths were adjusted to stay in open walking lanes.

### NPC direction and side-facing sprites

- Added left/right side-facing sprite assets for field NPCs.
- Added left/right side-facing sprite assets for Archive NPCs.
- NPCs now swap to side-facing artwork while walking horizontally instead of always sliding with a front-facing sprite.
- Left-facing NPCs reuse the side-facing artwork with a horizontal flip.

### Dialogue camera stability

- Removed the field camera transition during dialogue re-rendering.
- Dialogue bubbles should now appear above speakers without the visible camera snap/tween.

### Cursor polish

- Added a custom bronze-and-blue ornate cursor that matches the Chronicle Institute color palette.
- Applied the cursor globally and to buttons/interactable objects.

### Music system

- Added a lightweight Web Audio music toggle in the top chrome.
- Music is off by default and starts only after the user clicks the music button.
- Scene-aware loops now support:
  - Archive / Navigation Table ambient loop
  - Caribbean island exploration loop
  - NPC dialogue variation
  - Archive upload/transmission variation
- The system uses procedural browser audio instead of large audio files, keeping the pack lightweight.

## Acceptance checks

- The player can reach and interact with the Navigation Table from the Archive room.
- The Archive feels less cramped and does not trap the player in random spots.
- NPCs do not patrol through blocked furniture.
- NPCs show side-facing artwork while walking left/right.
- Field dialogue no longer causes a visible camera snap.
- The custom cursor appears in the browser.
- Clicking the music toggle starts/stops soft scene-aware music.
