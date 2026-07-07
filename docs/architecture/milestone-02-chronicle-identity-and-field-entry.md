# Milestone 2 — Chronicle Identity and First Field Entry

## Purpose

This is the first game-playable milestone after the Chronicle Institute orientation. It turns the learner from a viewer into a named Chronicler, issues the Chronicle Codex, and places the player in a small keyboard-controlled top-down arrival zone.

## Player flow

```text
Chronicle Institute orientation
→ Field Protocol: Observe / Source / Report
→ Chronicle Identity
   - choose one of two visual appearances
   - enter a display name (maximum 14 characters)
→ Chronicle Archive registration
→ Codex issuance
→ Caribbean field-entry map (1491)
   - move with arrow keys or WASD
   - approach Field Mentor Maren Vale
   - speak with the mentor
→ Field entry completion state
```

## Architecture boundaries

### Content (safe for Author Mode)

`apps/web/src/content/chronicle-identity.defaults.js`

This contains front-facing copy for the identity, registration, and field-entry screens. The Author Mode drawer stores temporary browser-local overrides and supports export/import JSON.

### Player state (local, replaceable later)

`apps/web/src/engine/player/player-profile-store.js`

The player profile is intentionally minimal:

```js
{
  name: 'Student-facing name',
  appearance: 'a' | 'b',
  codexIssued: true | false,
  fieldArrivalSeen: true | false
}
```

It uses `localStorage` for the vertical slice. Later, this one module can be replaced with a cloud-backed profile service without rewriting the screens.

### Game feature

`apps/web/src/features/chronicle-identity/chronicle-identity.js`

This module owns the identity, registration, and arrival-zone states. It does not alter assessment logic, quest progression, teacher permissions, or content records outside its scope.

### Presentation assets

`apps/web/src/assets/chronicle-sprites/`

The current sprites are small PNG pixel-art placeholders designed to establish a readable top-down RPG language. They are deliberately separate from player data and can be replaced later without changing movement, identity, or save logic.

## Field-entry prototype

The small field zone is not yet a historical simulation or full Unit 1 map. It is a controlled proof of the interaction loop:

- Player controls their Chronicler with arrow keys or WASD.
- Water and ruins block movement.
- A field mentor is placed at a fixed coordinate.
- The dialogue action becomes available only when the player is adjacent.
- Case 1.01 begins after this arrival zone in a future milestone.

## Deliberately excluded

- Clothing, equipment, inventory, or cosmetics
- Pronouns and profile metadata beyond a name / visual appearance
- Full open-world map
- Historical evidence collection
- Assessment engine
- Teacher roster, authentication, or cloud save
- Case 1.01 briefing content

Those stay out of this milestone so identity and movement can be tested cleanly.
