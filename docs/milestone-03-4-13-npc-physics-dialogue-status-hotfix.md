# Milestone 3.4.13 — NPC Physics, Dialogue Camera, and Institute Status Hotfix

Builds on Milestone 3.4.12.

## What changed

- Field NPC patrol routes now stay off huts, ship hulls, camp furniture, and the ocean.
- Archive NPC patrols now check the same style of furniture collision layer used by the player.
- NPCs now visually face left or right while walking, instead of always sliding front-facing.
- Field dialogue uses the previous camera transform during re-render so the map should no longer snap left before refocusing.
- Caribbean NPCs and source markers were nudged apart so the town area is less crowded.
- Columbus source, cartographer table, and recall beacon were separated to avoid stacked UI.
- The Institute status panel was moved to the left rail under the Institute Archive intro so it no longer overlays the playable room.
- The status rail no longer includes a direct Navigation Table button; players should walk to the table or interact with the table when close.

## Acceptance checks

- Talk to several field NPCs. The dialogue bubble should open above the speaker without the world snapping left.
- Let field NPCs patrol for a few seconds. They should not wander onto the ocean, huts, crates, or tents.
- Enter the Institute Archive. The status UI should be on the left, not covering the room.
- Let Director Hale, Dr. Soto, and Prof. Park patrol. They should avoid shelves, desks, and the Navigation Table.
- Confirm NPCs flip left/right when moving horizontally.
