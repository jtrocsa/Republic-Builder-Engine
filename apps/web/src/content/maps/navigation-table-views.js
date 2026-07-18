// Per-unit "map view" configs for the Chronicle Navigation Table (archiveScreen()
// in main.js). Each view is a lat/lon bounding box (fed to engine/geo-projection.js
// alongside the shared land-coastlines.json geometry) plus a curated set of
// ocean/sea/continent labels to render for that framing. Adding a new unit only
// requires picking (or reusing) a view here and adding an entry to UNIT_MAP_VIEW —
// it does not require new map art.

export const MAP_VIEWS = {
  "atlantic-wide": {
    bounds: { west: -95, east: 15, north: 58, south: -3 },
    labels: [
      { text: "NORTH AMERICA", lon: -85, lat: 45 },
      { text: "ATLANTIC OCEAN", lon: -40, lat: 32 },
      { text: "CARIBBEAN SEA", lon: -75, lat: 15 },
      { text: "EUROPE", lon: -2, lat: 50 },
      { text: "AFRICA", lon: -6, lat: 10 },
    ],
  },
  "north-america": {
    bounds: { west: -90, east: -60, north: 48, south: 25 },
    labels: [{ text: "ATLANTIC OCEAN", lon: -68, lat: 32 }],
  },
};

export const UNIT_MAP_VIEW = {
  "unit-01": "atlantic-wide",
  "unit-02": "atlantic-wide",
  "unit-03": "north-america",
};

export const DEFAULT_MAP_VIEW = "atlantic-wide";
