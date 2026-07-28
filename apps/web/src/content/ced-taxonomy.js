// The College Board AP US History Course and Exam Description's 7 themes —
// a fixed, real vocabulary (not invented for this game), used to tag each
// case's `ced.themes` (see unit.schema.js's CedAlignmentSchema) so a teacher
// can see a mission's curricular alignment, not just its in-game mechanic.
// Codes and labels match the CED verbatim.
export const CED_THEMES = [
  { code: "NAT", label: "American and National Identity" },
  { code: "WXT", label: "Work, Exchange, and Technology" },
  { code: "GEO", label: "Geography and the Environment" },
  { code: "MIG", label: "Migration and Settlement" },
  { code: "PCE", label: "Politics and Power" },
  { code: "WOR", label: "America in the World" },
  { code: "ARC", label: "American and Regional Culture" },
];

export const CED_THEME_CODES = CED_THEMES.map((theme) => theme.code);

export const CED_THEME_LABEL = Object.fromEntries(
  CED_THEMES.map((theme) => [theme.code, theme.label])
);
