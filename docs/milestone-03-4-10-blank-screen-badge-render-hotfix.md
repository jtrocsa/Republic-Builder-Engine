# Milestone 3.4.10 — Blank Screen & Badge Render Hotfix

This hotfix follows Milestone 3.4.9 and corrects a runtime render failure that could leave the app on the dark grid background after returning to the Institute/Archive.

## Fixes

- Restores the missing Unit 1 badge shelf renderer used by the Institute Archive screen.
- Keeps the Caribbean, Atlantic, and Hispaniola badge/trophy display in the Archive room.
- Adds a defensive render recovery screen so future display errors do not leave students on a blank page.
- Preserves the 3.4.9 shoreline patrol, Archive return, and collision fixes.

## Test checklist

1. Run `npm run dev`.
2. Load the app at localhost.
3. Return from the Caribbean field to the Institute.
4. Confirm the Institute Archive appears instead of the blank grid background.
5. Confirm the Unit 1 badge shelf appears in the Archive room.
6. Confirm the Navigation Table still opens.
7. Confirm NPCs in the field still patrol without walking into the ocean.

## Packaging note

This pack only includes `apps/` and `docs/`. It does not include `vite.config.js`.
