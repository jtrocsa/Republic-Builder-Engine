# 0005 — Chronicle Identity and First Field Entry

**Status:** Accepted  
**Date:** 2026-07-08

## Decision

Milestone 2 creates a minimal player identity and immediately rewards it with a small playable top-down field-entry scene.

The initial identity record includes only a student-entered display name and one of two visual appearance choices. Pronouns, wardrobes, professions, cosmetics, and inventory are intentionally deferred.

The first movement scene is a small Caribbean arrival zone with keyboard movement and one Field Mentor interaction. It exists to verify the top-down RPG direction before creating the full Case 1.01 world.

## Rationale

- A player should see their chosen identity in the world immediately.
- A narrow movement prototype is more useful than building a large map before interaction, content, and accessibility patterns are proven.
- PNG pixel sprites are used as replaceable presentation assets instead of a complex SVG paper-doll system.
- Author Mode remains content-only: teachers may revise language, but cannot break layout, movement rules, or saved data by changing system settings.

## Consequences

Future changes to player identity or cloud persistence should preserve the public contract of `player-profile-store.js` or provide a documented migration.
