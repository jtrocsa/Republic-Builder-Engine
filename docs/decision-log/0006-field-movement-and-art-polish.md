# 0006 — Keep Grid Logic; Improve Perceived Movement

**Status:** Accepted

> **Numbering note (repaired by the Prompt 5 documentation-housekeeping pass):** this decision (Milestone 2.1) and `0006-field-definition-pass.md` (Milestone 2.2) previously shared the number `0006`. This file — the chronologically earlier of the two — keeps `0006`; the Milestone 2.2 decision was renumbered to [`0006a-field-definition-pass.md`](0006a-field-definition-pass.md). No substance was changed in either file.

Chronicle's first field scene retains a small grid internally. Player movement is animated between tiles instead of snapping visually. This preserves reliable collision and simple authored map data while delivering a more familiar top-down RPG feel.

Field art uses crisp PNG pixel assets instead of SVG character layers. These assets are deliberately replaceable; the gameplay contract is their file role and dimensions, not their first-pass visual design.
