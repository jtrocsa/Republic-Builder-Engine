// Pure equirectangular lon/lat -> SVG-space projection. No DOM, no case/content IDs —
// shared by both the coastline path and the case-marker/label positions on the
// Chronicle Navigation Table, so they always agree with each other regardless of
// which per-unit `bounds` is active.

export function projectPoint([lon, lat], bounds, viewport) {
  const x = ((lon - bounds.west) / (bounds.east - bounds.west)) * viewport.width;
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * viewport.height;
  return { x, y };
}

export function projectRing(ring, bounds, viewport) {
  return ring.map((point) => projectPoint(point, bounds, viewport));
}

export function ringToPathD(projectedRing) {
  if (projectedRing.length === 0) return "";
  const [first, ...rest] = projectedRing;
  const line = rest.map((p) => `L${p.x},${p.y}`).join(" ");
  return `M${first.x},${first.y} ${line} Z`.trim();
}

export function landPathD(rings, bounds, viewport) {
  return rings.map((ring) => ringToPathD(projectRing(ring, bounds, viewport))).join(" ");
}
