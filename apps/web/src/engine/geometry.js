// Pure 2D geometry primitives shared by field/hub collision math. No DOM, no `progress`,
// no case/content IDs — safe to reuse for any future unit's collision code. Deliberately does
// NOT include `isFieldBlocked`/`isCaribbeanLand`/hub-collision or anything that reads
// `activeFieldMap()`/`progress` — those are DOM- and content-coupled runtime, out of scope for
// this file per CLAUDE.md's "no physical extraction of movement/collision-with-DOM" policy.

export function ellipse(x, y, cx, cy, rx, ry) {
  return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}

export function rectsOverlap(a, b) {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
}

export function footBoxFor(x, y) {
  const footY = y + 0.58;
  return { x1: x - 0.34, x2: x + 0.34, y1: footY - 0.18, y2: footY + 0.2 };
}
