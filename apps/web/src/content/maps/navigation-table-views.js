// Per-unit "map view" configs for the Chronicle Navigation Table (archiveScreen()
// in main.js). Each view is a lat/lon bounding box (fed to engine/geo-projection.js
// alongside the shared land-coastlines.json geometry) plus a curated set of
// ocean/sea/continent labels to render for that framing. Adding a new unit only
// requires picking (or reusing) a view here and adding an entry to UNIT_MAP_VIEW —
// it does not require new map art.
//
// **A unit with no UNIT_MAP_VIEW entry does not fail; it falls back to DEFAULT_MAP_VIEW, and a case
// whose coordinates fall outside that box is clipped out of existence.** `.atlas-table` is
// `overflow: hidden`, and a marker click is the only way to select a case — `unlockNext()` unlocks
// the next case without selecting it — so a marker outside the box is a case that cannot be
// started. Units 6 and 7 shipped in that state: four of their six markers projected outside
// `atlantic-wide`, and San Francisco, Manila and the Kansas railhead were unreachable from the only
// screen that launches a case. Spine Review Part 11, decision log 0087.
// `tests/unit/navigation-table-views.test.js` is what notices now.

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
  // Coast to coast. Unit 6's three cases are a Kansas railhead (96.5W), Chicago (87.6W) and San
  // Francisco (122.4W) — a unit about a continent being written onto paper, which is not a framing
  // the eastern `north-america` box can hold.
  "north-america-wide": {
    bounds: { west: -134, east: -58, north: 55, south: 13 },
    labels: [
      { text: "PACIFIC OCEAN", lon: -126, lat: 28 },
      { text: "GULF OF MEXICO", lon: -92, lat: 24 },
      { text: "ATLANTIC OCEAN", lon: -68, lat: 33 },
    ],
  },
  // The whole board. Unit 7's cases are Ellis Island, Manila and San Francisco, and no box that
  // does not cross the antimeridian holds all three — `projectPoint()` is a plain linear map with
  // no wrap, deliberately. That the unit needs a world map is the unit's own argument rather than a
  // technical concession: the terms of belonging were being set on three shores at once.
  world: {
    bounds: { west: -180, east: 180, north: 78, south: -56 },
    labels: [
      { text: "PACIFIC OCEAN", lon: -140, lat: 5 },
      { text: "NORTH AMERICA", lon: -103, lat: 60 },
      { text: "ATLANTIC OCEAN", lon: -35, lat: 8 },
      { text: "EUROPE", lon: 20, lat: 52 },
      { text: "ASIA", lon: 100, lat: 45 },
    ],
  },
};

export const UNIT_MAP_VIEW = {
  "unit-01": "atlantic-wide",
  "unit-02": "atlantic-wide",
  "unit-03": "north-america",
  // Unit 4's three cases are an upstate New York canal town (43.1N, 75.9W), Washington (38.9N,
  // 77.0W) and New Echota in the Cherokee Nation (34.6N, 84.9W). All three fall inside the existing
  // north-america box, so this unit adds no view of its own — which is the point of the box being a
  // reusable framing rather than one per unit.
  "unit-04": "north-america",
  // Unit 5's three cases are Richmond (37.5N, 77.4W), Washington (38.9N, 77.0W) and the former
  // Confederacy at large, pinned at Charleston (32.8N, 79.9W). All three sit inside the same box,
  // so this unit adds no view of its own either.
  "unit-05": "north-america",
  "unit-06": "north-america-wide",
  "unit-07": "world",
  // Unit 8's three cases are a Delaware Valley subdivision (40.2N, 74.9W), the Senate chamber
  // (38.9N, 77.0W) and Selma (32.4N, 87.0W). All three fall well inside the existing
  // north-america box, so this unit adds no view of its own — the first unit since Unit 5 not to.
  "unit-08": "north-america",
  // Unit 9's three cases are a valley city in north-eastern Ohio (41.1N, 81.0W), the Cow Palace
  // at Daly City (37.7N, 122.5W) and Moscow (55.8N, 37.6E). No box that does not cross the
  // antimeridian is needed, but none of the North American framings reaches 37 degrees east, so
  // the closing unit reuses Unit 7's world view — which is also the right framing for a unit
  // whose last case is the end of a confrontation that had been organising the whole board.
  "unit-09": "world",
};

export const DEFAULT_MAP_VIEW = "atlantic-wide";
