# Milestone 3.4.9 — Shoreline Patrol & Archive Return Hotfix

Builds on Milestone 3.4.8.

## Fixes

- Keeps field NPC patrols on land by moving the Spanish sailor and scribe patrol routes away from the waterline.
- Adds a runtime land check for NPC patrol steps so a future path cannot walk into the ocean.
- Keeps the NPC walking animation/patrol behavior from 3.4.8.
- Stabilizes the Archive/Institute return flow by routing all home/recall returns through a safe Institute spawn helper.
- Clears open hub dialogue state when returning to the Institute.
- Opens the Institute floor collision layer so the Archive room no longer catches the player on random invisible blocked tiles.

## Acceptance checks

- The Spanish scribe and sailor should not walk into the ocean.
- Clicking “Recall to Institute” or using the field recall point should load the Institute instead of freezing.
- The Archive back button should return to the Institute reliably.
- The player should be able to walk through the Archive room without random invisible sticking points.
