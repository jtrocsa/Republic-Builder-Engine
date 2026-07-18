# land-coastlines.json provenance

Generated once, offline, from public-domain (Natural Earth) data — not fetched at
build or run time.

Source: `https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json` (TopoJSON,
merged global landmass, no country borders, ~110m simplified resolution).

Regenerate with (temporary `topojson-client` install, not a project dependency):

```
npm install topojson-client --no-save
node -e "
const { feature } = require('topojson-client');
(async () => {
  const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json');
  const topology = await res.json();
  const geo = feature(topology, topology.objects.land);
  const rings = [];
  for (const f of geo.features ? geo.features : [geo]) {
    const geom = f.geometry || f;
    if (geom.type === 'Polygon') for (const r of geom.coordinates) rings.push(r);
    if (geom.type === 'MultiPolygon') for (const p of geom.coordinates) for (const r of p) rings.push(r);
  }
  require('fs').writeFileSync('land-coastlines.json', JSON.stringify({ rings }));
})();
"
```

Shape: `{ "rings": [[[lon, lat], ...], ...] }` — a flat array of polygon rings
(each an array of `[lon, lat]` points), consumed by
`apps/web/src/engine/geo-projection.js`.
