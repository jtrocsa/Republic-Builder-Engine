# Milestone 3.4.15 — Side Sprite & Audio SFX Polish

Build on Milestone 3.4.14. This is a targeted cosmetic and audio pass for the Chronicle Institute / Unit 1 vertical slice.

## Changes

- Shortened the side-facing NPC noses on both field and Archive NPC sprite sets so characters no longer read like bird profiles when walking left or right.
- Preserved the left/right facing behavior and walking-frame swap introduced in 3.4.14.
- Added optional Web Audio sound effects for:
  - Chronotravel launch from the Navigation Table.
  - Quest/source entry moments, with distinct motifs for village observation, Columbus/source reading, and the map puzzle.
  - Evidence securing.
  - Field record upload/transmission at the end of a case.
  - Archive receive / preservation moments.
  - Dialogue opening.
- Adjusted the Unit 1 island music to feel more distinct from the Archive loop, using a softer field motif and low pulse so it feels adventurous without becoming too intense.

## Audio behavior

Music and sound effects remain opt-in because browsers require a user gesture before audio can reliably play. Use the top-bar **Music off / Music on** button to activate the audio engine. Once audio is on, the scene loops and sound effects respond to player actions.

## Acceptance checks

- Side-facing NPCs should no longer have long pointed noses.
- Chronotravel should play a short warp-style effect when starting a route.
- Source/quest entries should produce subtle quest cues when audio is enabled.
- Evidence securing and upload/return moments should have archive/transmission effects.
- Archive music and Unit 1 island music should feel distinct.
