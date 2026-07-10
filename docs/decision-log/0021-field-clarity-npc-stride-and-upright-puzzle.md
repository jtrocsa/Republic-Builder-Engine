# 0021 — Field Clarity, NPC Stride, and Upright Puzzle

Milestone 3.4.7 corrects the first 3.4.6 (see [`0020`](0020-proximity-interaction-puzzle-polish.md)) playtest issues without changing Vite or repository setup files.

## Field readability

- NPC dialogue now appears in one sharp field dialogue panel instead of a speech bubble attached to the NPC label.
- NPC labels, source labels, proximity prompts, and quest text now use a sharper system font with larger sizing.
- Hover/focus transforms on NPC labels were reduced so text should not blur or snap in and out of focus.
- Field button clicks now call `preventDefault()` to reduce focus-related viewport snapback.

## NPC walking

- NPCs now alternate between idle and step frames at a faster rhythm.
- Step-frame PNGs were redrawn with a visible stride so the legs actually change position instead of appearing static.
- The whole NPC receives a tiny walk cadence while the frame swap runs, but the sprite art is now the main visible movement.

## Puzzle correction

- The map board no longer cuts open holes in the middle of the completed map.
- The outside remains straight.
- The interior now uses seam lines to communicate jigsaw connections.
- Tray pieces remain upright in the same orientation and proportion as their board slots, so students match the same image shape they are dragging.
- Empty slot text remains visually hidden so the board reads more like a puzzle surface than a form grid.

## Acceptance checks

- Talking to an NPC creates one readable dialogue panel, not overlapping bubbles.
- Labels and prompts are readable at normal browser zoom.
- NPC step frames show a visibly different leg position.
- The map has a straight outer edge and no dark holes in the middle.
- Tray pieces are upright and not stretched sideways.
