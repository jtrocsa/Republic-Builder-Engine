# 0027 — Side Sprite and Audio SFX Polish

Date: Milestone 3.4.15

## Decision

Keep the current procedural Web Audio system rather than adding external audio files yet. This preserves the lightweight static/local build path and avoids asset licensing questions while letting the vertical slice test music and sound-effect timing.

## Rationale

The game needs stronger feedback for Chronotravel, source/quest entry, evidence securing, and Archive transmission. Procedural tones are sufficient for testing the interaction loop and can later be replaced with composed audio assets.

## Notes

- Audio remains off by default and starts only after the player presses the music toggle.
- Unit 1 field music should feel distinct from the Institute Archive loop.
- NPC side sprites were softened so the profile nose reads as a small profile detail rather than a beak.
