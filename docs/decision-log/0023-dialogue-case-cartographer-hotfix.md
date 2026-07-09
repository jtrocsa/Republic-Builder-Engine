# 0023 — Dialogue Case Cartographer Hotfix

## Decision

Milestone 3.4.11 prioritizes field readability and stronger spatial logic.

## Changes

- Field dialogue is rendered as a viewport overlay instead of inside the translated world layer.
- Field click targets are blurred after interaction to prevent browser focus from nudging the camera.
- The camera translation is rounded to whole pixels to reduce text shimmer.
- NPC labels stay as names; the single nearby prompt handles `Press E` instructions.
- The recall cove is simplified to one Archive recall beacon.
- The map puzzle is moved to a cartographer table near the ship.
- The Institute badge display becomes an interactable Preservation Case with a larger badge-case modal.

## Rationale

The field should feel like a stable RPG screen. Dialogue and prompts must remain legible and should not fight the camera. Archive rewards should feel like a trophy/badge case rather than a small status widget.
