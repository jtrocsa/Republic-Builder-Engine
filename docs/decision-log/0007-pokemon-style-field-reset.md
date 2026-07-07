# Decision 0007 — Pokémon-Style Field Reset

Milestone 2.2 made the environmental geography more readable but regressed the core RPG feel: its field viewport was oversized for common laptop screens, the CSS-drawn figures were weaker than the prior PNG character art, and the tile grid became too conspicuous.

Milestone 2.2.1 resets the field presentation around three principles:

1. Preserve tile logic but hide the board-game appearance.
2. Use the existing PNG sprite system for the Chronicler and mentor.
3. Fit a readable, top-down field frame and companion panel inside a typical laptop viewport.

The visible island has an irregular shoreline and open water, but movement/collision still use a stable underlying grid.
