/**
 * The ordered list of Chronicle units, and the one place a new unit is declared.
 *
 * Adding a unit used to mean finding every hand-written per-unit list in the repo and adding a
 * line to each. By Unit 7 three of them had silently fallen behind: `UNIT_MAP_VIEW` stopped at
 * Unit 5, so the Navigation Table framed Kansas and New York Harbor on a map centred on the
 * mid-Atlantic; `build-field-guide.js` documented five of the seven maps; and `LIAISON_MAPS`
 * omitted the map Voss had most recently been posted to. Nothing failed in any of the three. A
 * per-unit table with a sane fallback and no test is how a whole unit ships broken.
 *
 * The rule that follows from that: anything derivable from this list is derived from it, and
 * anything that genuinely cannot be — a map's tileset resolver, a plate's painting, a case's
 * field copy — is asserted against it by tests/unit/field-map-coordinates.test.js, which fails
 * loudly when a table is missing an id this list carries.
 *
 * Note the direction of that check. A unit may be registered here and deliberately absent from
 * `main.js`'s `UNITS` and `FIELD_MAPS` — that is the state Unit 7 sat in between Phase 89 and
 * Phase 89C, and Units 3-5 before Phase 81F, because `activeFieldMap()` silently falls back to
 * Unit 1's Caribbean for a unit it has no map for. Registering a field case before its map exists
 * does not error; it lands the player on the wrong continent. So the content list is a superset
 * of the playable list, never the other way round.
 *
 * This file imports nothing on purpose. It is read by `main.js`, by Node scripts and by tests,
 * and a single content import here would drag the whole campaign into all three.
 */

/** Every unit with authored, validated content, in curriculum order. */
export const UNIT_IDS = Object.freeze([
  "unit-01",
  "unit-02",
  "unit-03",
  "unit-04",
  "unit-05",
  "unit-06",
  "unit-07",
  "unit-08",
  "unit-09",
]);

/**
 * `"unit-07"` -> `"unit07"`. The key shape `loadChronicleContent()` returns, kept as-is because
 * three test files and the validator already read it.
 */
export function unitContentKey(unitId) {
  return unitId.replace("-", "");
}

/** `"unit-07"` -> `"07"`, the numeric half used to strip a unit's export prefix. */
export function unitNumber(unitId) {
  return unitId.slice("unit-".length);
}
