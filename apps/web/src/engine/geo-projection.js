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

/**
 * One ring as SVG path data, split wherever it crosses the projection's seam.
 *
 * `seamX` is how far a single segment may travel horizontally before it is a wrap rather than a
 * coastline — half the viewport width, in practice. Four of land-coastlines.json's 126 rings cross
 * ±180 (Eurasia, Antarctica, Fiji, Wrangel Island), and each of them carries one segment that
 * travels the full width of the map. `.atlas-land` is stroked, so each drew a 1px line straight
 * across the table.
 *
 * Invisible on every box that stops short of the antimeridian, which was every view the game had
 * until Unit 7 needed a world map — Ellis Island, Manila and San Francisco do not fit in anything
 * narrower. Spine Review Part 11, decision log 0087.
 *
 * A ring that had to be split is left unclosed: the segment that would close it *is* the seam. The
 * fill is unaffected either way, since SVG closes a filled subpath implicitly — it is the stroke
 * that was drawing the artifact.
 *
 * Default `Infinity` keeps the single-argument behaviour exactly as it was.
 */
export function ringToPathD(projectedRing, seamX = Infinity) {
  if (projectedRing.length === 0) return "";
  const runs = [[]];
  projectedRing.forEach((point, index) => {
    const previous = projectedRing[index - 1];
    if (previous && Math.abs(point.x - previous.x) > seamX) runs.push([]);
    runs[runs.length - 1].push(point);
  });
  const last = projectedRing[projectedRing.length - 1];
  const wrapsOnClose = Math.abs(projectedRing[0].x - last.x) > seamX;
  const closed = runs.length === 1 && !wrapsOnClose;
  return runs
    .filter((run) => run.length > 1)
    .map((run) => {
      const [first, ...rest] = run;
      const line = rest.map((p) => `L${p.x},${p.y}`).join(" ");
      return `M${first.x},${first.y} ${line}${closed ? " Z" : ""}`.trim();
    })
    .join(" ");
}

export function landPathD(rings, bounds, viewport) {
  const seamX = viewport.width / 2;
  return rings.map((ring) => ringToPathD(projectRing(ring, bounds, viewport), seamX)).join(" ");
}
