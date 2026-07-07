# 0006 — Keep Grid Logic; Improve Perceived Movement

**Status:** Accepted

Chronicle's first field scene retains a small grid internally. Player movement is animated between tiles instead of snapping visually. This preserves reliable collision and simple authored map data while delivering a more familiar top-down RPG feel.

Field art uses crisp PNG pixel assets instead of SVG character layers. These assets are deliberately replaceable; the gameplay contract is their file role and dimensions, not their first-pass visual design.
