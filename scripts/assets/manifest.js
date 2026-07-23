// Shared report-writing helpers for scripts/assets/audit.js. Only ever writes under
// reports/assets/ — never touches anything inside apps/web/src/assets/.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { stringify } from "csv-stringify/sync";

export function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

export function writeJsonReport(filePath, data) {
  ensureDir(path.dirname(filePath));
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function writeTextReport(filePath, text) {
  ensureDir(path.dirname(filePath));
  writeFileSync(filePath, text.endsWith("\n") ? text : `${text}\n`, "utf8");
}

// RFC 4180 CSV serialization via csv-stringify (MIT — see
// docs/architecture/OPEN-SOURCE-REUSE-DECISIONS.md §5/§7), replacing this file's former
// hand-rolled `csvCell`/`toCsv` escaping. `headerRow` and each entry in `rows` are plain arrays
// already assembled by the caller (column order is the caller's responsibility, unchanged).
//
// `cast.boolean` is set explicitly: csv-stringify's own default renders `true` as `"1"` and
// `false` as `""` (empty), which would silently change every boolean report column (e.g.
// `referencedDirect`, `confirmedInDist`) from this repo's existing "true"/"false" text. That
// default is arbitrary reformatting, not a correctness fix, so it's overridden to match the
// prior hand-rolled `csvCell()`'s `String(value)` behavior exactly.
export function toCsv(headerRow, rows) {
  return stringify([headerRow, ...rows], {
    cast: { boolean: (value) => String(value) },
  });
}
