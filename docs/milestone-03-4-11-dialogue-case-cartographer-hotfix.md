# Milestone 3.4.11 — Dialogue, Preservation Case, and Cartographer Hotfix

Builds on Milestone 3.4.10.

## Fixes

- Anchors field dialogue to the field viewport instead of the moving world layer so NPC text no longer tries to render off-screen.
- Removes duplicate `Press E` text from nearby NPC labels; the NPC keeps its name label and the separate interaction prompt handles the key hint.
- Blurs clicked field buttons after interaction to reduce browser focus scrolling and camera snapback.
- Rounds field camera transforms to whole pixels for sharper text and less shimmer.
- Keeps the Archive recall point as one clean beacon/label and removes the extra blue cove ring.
- Moves the map puzzle interaction from the grass to a new cartographer table near the ship.
- Replaces the small Institute status badge shelf with an interactable Preservation Case on an upper bookshelf.
- Opens a larger badge-case UI with Caribbean, Atlantic, and Hispaniola Unit 1 badges.

## Acceptance checks

- Talking to an NPC should keep the dialogue panel visible inside the field viewport.
- Nearby NPCs should not show `Press E` twice.
- Clicking an NPC or source should not cause a leftward camera snapback.
- The map puzzle marker should be at the cartographer table near the ship, not in the middle of the grass.
- The Archive recall point should appear as one recall beacon/label.
- In the Institute Archive, the Preservation Case should sit on the upper bookshelf area and open a polished badge-case UI.

## Packaging note

Future packs continue to include only `apps/` and `docs/` unless a root config file is truly required.
